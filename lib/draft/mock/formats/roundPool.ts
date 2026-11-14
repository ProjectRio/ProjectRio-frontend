// Round pool (§7f): each round every participating team nominates one asset
// and seals one bid; bids buy pick order; tied groups choose simultaneously.

import { assetById } from '../../assets';
import { DraftError, type AssetKind, type DraftAction } from '../../types';
import { freezeClock, thawClock, type Actor, type FormatModule } from '../format';
import { queueNomination, queuedEntry, clearNomination } from '../queue';
import { announceSale, assertEligible, assertLive, ineligibleReason, maxBid, openSlots, recordPick } from '../rules';
import { displayName, log, nextId, team, type BidRow, type DraftRow, type NominationRow, type RoundPoolRound } from '../state';
import { runoffBid, runoffPass, runoffTimeout, settleTie, type TieOutcome } from '../ties';

export function roundNominations(draft: DraftRow, round: RoundPoolRound): NominationRow[] {
	return draft.nominations.filter((row) => row.state === 'open' && row.round === round.round);
}

export function roundBids(draft: DraftRow, round: RoundPoolRound): BidRow[] {
	return draft.bids.filter((bid) => bid.sealed && bid.round === round.round && !bid.runoff);
}

/** Assets nominated this round that nobody has taken yet. */
export function availableThisRound(draft: DraftRow, round: RoundPoolRound): number[] {
	const takenIds = draft.picks.filter((pick) => pick.round === round.round && pick.asset_id !== null).map((pick) => pick.asset_id);
	const taken = new Map<number, number>();
	for (const id of takenIds) taken.set(id!, (taken.get(id!) ?? 0) + 1);
	return roundNominations(draft, round)
		.map((row) => row.asset_id)
		.filter((id) => {
			const count = taken.get(id) ?? 0;
			if (count === 0) return true;
			taken.set(id, count - 1);
			return false;
		});
}

function participants(draft: DraftRow, kind: AssetKind): number[] {
	return [...draft.teams]
		.sort((a, b) => a.draft_order - b.draft_order)
		.filter((row) => openSlots(draft, row.id)[kind] > 0)
		.map((row) => row.id);
}

/** The kind the next round will draft, given the current round fills one slot each. */
export function nextRoundKind(draft: DraftRow): AssetKind | null {
	const current = draft.pool_round;
	const charsAfter = draft.teams.some((row) => {
		const open = openSlots(draft, row.id).character;
		const filling = current && current.kind === 'character' && current.phase !== 'done' && current.participating_team_ids.includes(row.id) ? 1 : 0;
		return open - filling > 0;
	});
	if (charsAfter) return 'character';
	const stadiumsAfter = draft.teams.some((row) => {
		const open = openSlots(draft, row.id).stadium;
		const filling = current && current.kind === 'stadium' && current.phase !== 'done' && current.participating_team_ids.includes(row.id) ? 1 : 0;
		return open - filling > 0;
	});
	return stadiumsAfter ? 'stadium' : null;
}

function beginRound(draft: DraftRow) {
	const kind: AssetKind | null = draft.teams.some((row) => openSlots(draft, row.id).character > 0)
		? 'character'
		: draft.teams.some((row) => openSlots(draft, row.id).stadium > 0)
			? 'stadium'
			: null;
	if (!kind) {
		draft.pool_round = null;
		draft.state = 'completed';
		draft.completed_at = Date.now();
		log(draft, 'system', 'Every roster is full — the draft is complete.');
		return;
	}
	draft.round += 1;
	draft.pool_round = {
		round: draft.round,
		kind,
		phase: 'nominating',
		participating_team_ids: participants(draft, kind),
		groups: [],
		group_index: 0,
		picked_team_ids: [],
		closes_at: null,
		paused_remaining_s: null
	};
	// Entries queued during the previous round belong to this one now.
	for (const row of draft.nominations) if (row.state === 'queued') row.round = draft.round;
	log(draft, 'system', `Round ${draft.round} (${kind}s): waiting for nominations`);
	maybeOpenRound(draft);
}

function maybeOpenRound(draft: DraftRow) {
	const round = draft.pool_round;
	if (!round || round.phase !== 'nominating') return;
	const entries = round.participating_team_ids.map((teamId) => queuedEntry(draft, teamId));
	if (entries.some((entry) => !entry || entry.kind !== round.kind)) return;
	const now = Date.now();
	for (const entry of entries) {
		entry!.state = 'open';
		entry!.round = round.round;
		entry!.opened_at = now;
	}
	round.phase = 'bidding';
	round.closes_at = draft.config.lot_seconds ? now + draft.config.lot_seconds * 1000 : null;
	const names = entries.map((entry) => assetById(entry!.asset_id).name).join(', ');
	log(draft, 'system', `Round ${round.round} pool: ${names}. Sealed bids open.`);
}

function requireTeam(actor: Actor): number {
	if (actor.team_id === null) throw new DraftError('NOT_A_MANAGER');
	return actor.team_id;
}

function requireRound(draft: DraftRow): RoundPoolRound {
	if (!draft.pool_round) throw new DraftError('INVALID_STATE', 'No round is running.');
	return draft.pool_round;
}

function sealedBid(draft: DraftRow, actor: Actor, amount: number) {
	assertLive(draft);
	const teamId = requireTeam(actor);
	const round = requireRound(draft);
	if (round.phase !== 'bidding') throw new DraftError('INVALID_STATE', 'Bidding is not open.');
	if (!round.participating_team_ids.includes(teamId)) throw new DraftError('NOT_YOUR_TURN', 'You are not in this round.');
	const now = Date.now();
	if (round.closes_at !== null && now >= round.closes_at) throw new DraftError('LOT_CLOSED');
	if (!Number.isInteger(amount) || amount < draft.config.min_bid) throw new DraftError('BELOW_INCREMENT', `Minimum bid is $${draft.config.min_bid}.`);
	if (amount > maxBid(draft, teamId)) throw new DraftError('EXCEEDS_MAX_BID', `Your max bid is $${maxBid(draft, teamId)}.`);
	const previous = roundBids(draft, round).find((bid) => bid.team_id === teamId);
	if (previous) {
		previous.amount = amount;
		previous.placed_at = now;
	} else {
		draft.bids.push({
			id: nextId(draft),
			nomination_id: roundNominations(draft, round)[0]?.id ?? 0,
			round: round.round,
			team_id: teamId,
			placed_by: actor.username,
			amount,
			placed_at: now,
			rescind: null,
			sealed: true,
			runoff: false
		});
		log(draft, 'bid', `${displayName(team(draft, teamId))} sealed a bid`, { team_id: teamId });
	}
	if (round.participating_team_ids.every((id) => roundBids(draft, round).some((bid) => bid.team_id === id))) closeBidding(draft);
}

function closeBidding(draft: DraftRow) {
	const round = requireRound(draft);
	if (round.phase !== 'bidding') throw new DraftError('INVALID_STATE', 'Bidding is not open.');
	const bids = roundBids(draft, round);
	// Teams that never bid are treated as bidding the minimum.
	const amounts = round.participating_team_ids.map((teamId) => ({
		teamId,
		bid: bids.find((bid) => bid.team_id === teamId)?.amount ?? draft.config.min_bid
	}));
	amounts.sort((a, b) => b.bid - a.bid);
	const groups: RoundPoolRound['groups'] = [];
	for (const entry of amounts) {
		const last = groups[groups.length - 1];
		if (last && last.bid === entry.bid) last.team_ids.push(entry.teamId);
		else groups.push({ team_ids: [entry.teamId], bid: entry.bid });
	}
	round.groups = groups;
	round.group_index = 0;
	round.picked_team_ids = [];
	round.phase = 'picking';
	round.closes_at = null;
	for (const row of draft.teams) row.tie_choice_asset_id = null;
	log(draft, 'system', `Bids revealed — pick order: ${groups.map((group) => `${group.team_ids.map((id) => displayName(team(draft, id))).join(' / ')} ($${group.bid})`).join(', ')}`);
	autoPick(draft);
}

function currentGroup(round: RoundPoolRound) {
	return round.groups[round.group_index] ?? null;
}

export function pickersNow(draft: DraftRow, round: RoundPoolRound): number[] {
	const group = currentGroup(round);
	if (!group || round.phase !== 'picking' || draft.runoff) return [];
	return group.team_ids.filter((id) => !round.picked_team_ids.includes(id));
}

function takeAsset(draft: DraftRow, round: RoundPoolRound, teamId: number, assetId: number, price: number, madeBy: string | null) {
	const nomination = roundNominations(draft, round).find((row) => row.asset_id === assetId);
	const pick = recordPick(draft, { teamId, assetId, price, round: round.round, madeBy, nominationId: nomination?.id ?? null });
	announceSale(draft, teamId, assetId, pick.price, pick.took_remaining_budget);
	round.picked_team_ids.push(teamId);
	team(draft, teamId).tie_choice_asset_id = null;
}

function advanceGroups(draft: DraftRow) {
	const round = requireRound(draft);
	while (round.phase === 'picking' && !draft.runoff) {
		const group = currentGroup(round);
		if (!group) {
			round.phase = 'done';
			beginRound(draft);
			return;
		}
		if (group.team_ids.every((id) => round.picked_team_ids.includes(id))) {
			round.group_index += 1;
			round.picked_team_ids = [];
			continue;
		}
		break;
	}
	autoPick(draft);
}

/** The last team receives whatever remains. */
function autoPick(draft: DraftRow) {
	const round = requireRound(draft);
	if (round.phase !== 'picking' || draft.runoff) return;
	const pickers = pickersNow(draft, round);
	const available = availableThisRound(draft, round);
	if (pickers.length === 1 && available.length === 1) {
		const teamId = pickers[0];
		const asset = assetById(available[0]);
		if (ineligibleReason(draft, teamId, asset) === null) {
			takeAsset(draft, round, teamId, asset.id, currentGroup(round)!.bid, null);
			advanceGroups(draft);
		}
	}
}

function pick(draft: DraftRow, actor: Actor, assetId: number) {
	assertLive(draft);
	const teamId = requireTeam(actor);
	const round = requireRound(draft);
	const pickers = pickersNow(draft, round);
	if (!pickers.includes(teamId)) throw new DraftError('NOT_YOUR_TURN');
	if (!availableThisRound(draft, round).includes(assetId)) throw new DraftError('ASSET_UNAVAILABLE', 'That asset is not in this round.');
	const asset = assetById(assetId);
	assertEligible(draft, teamId, asset);
	const group = currentGroup(round)!;
	if (pickers.length === 1) {
		takeAsset(draft, round, teamId, assetId, group.bid, actor.username);
		advanceGroups(draft);
		return;
	}
	// A tied group chooses simultaneously and privately.
	team(draft, teamId).tie_choice_asset_id = assetId;
	if (pickers.every((id) => team(draft, id).tie_choice_asset_id !== null)) resolveGroupChoices(draft);
}

function resolveGroupChoices(draft: DraftRow) {
	const round = requireRound(draft);
	const group = currentGroup(round)!;
	const pickers = pickersNow(draft, round);
	const byAsset = new Map<number, number[]>();
	for (const teamId of pickers) {
		const choice = team(draft, teamId).tie_choice_asset_id!;
		byAsset.set(choice, [...(byAsset.get(choice) ?? []), teamId]);
	}
	for (const [assetId, teamIds] of byAsset) {
		if (teamIds.length === 1) {
			takeAsset(draft, round, teamIds[0], assetId, group.bid, null);
		}
	}
	for (const [assetId, teamIds] of byAsset) {
		if (teamIds.length === 1) continue;
		const nominator = roundNominations(draft, round).find((row) => row.asset_id === assetId)?.nominated_by_team_id ?? null;
		const nominationId = roundNominations(draft, round).find((row) => row.asset_id === assetId)?.id ?? 0;
		log(draft, 'system', `${teamIds.map((id) => displayName(team(draft, id))).join(' and ')} both chose ${assetById(assetId).name}`);
		const outcome = settleTie(draft, { tiedIds: teamIds, tiedAmount: group.bid, nominatorId: nominator, assetId, nominationId });
		if (outcome) {
			takeAsset(draft, round, outcome.winner_team_id, assetId, outcome.price, null);
			for (const id of teamIds) team(draft, id).tie_choice_asset_id = null;
		} else {
			// A runoff decides it; the rest of the group waits.
			for (const id of teamIds) team(draft, id).tie_choice_asset_id = null;
			return;
		}
	}
	advanceGroups(draft);
}

function finishRunoff(draft: DraftRow, outcome: TieOutcome, assetId: number) {
	const round = requireRound(draft);
	takeAsset(draft, round, outcome.winner_team_id, assetId, outcome.price, null);
	advanceGroups(draft);
}

export const roundPool: FormatModule = {
	start(draft) {
		draft.round = 0;
		draft.turn_team_id = null;
		beginRound(draft);
	},
	handle(draft, actor, action: DraftAction) {
		switch (action.type) {
			case 'queue_nomination': {
				const teamId = requireTeam(actor);
				const round = draft.pool_round;
				const kind = round && round.phase === 'nominating' ? round.kind : nextRoundKind(draft);
				if (!kind) throw new DraftError('INVALID_STATE', 'No round left to nominate for.');
				queueNomination(draft, teamId, action.payload.asset_id, { kind });
				maybeOpenRound(draft);
				return;
			}
			case 'clear_nomination':
				clearNomination(draft, requireTeam(actor));
				return;
			case 'sealed_bid':
				sealedBid(draft, actor, action.payload.amount);
				return;
			case 'pick':
			case 'tie_choice':
				pick(draft, actor, action.payload.asset_id);
				return;
			case 'runoff_bid':
				assertLive(draft);
				runoffBid(draft, actor, action.payload.amount);
				return;
			case 'runoff_pass': {
				assertLive(draft);
				const assetId = draft.runoff?.asset_id ?? null;
				const outcome = runoffPass(draft, actor);
				if (outcome && assetId !== null) finishRunoff(draft, outcome, assetId);
				return;
			}
			default:
				throw new DraftError('INVALID_ACTION');
		}
	},
	tick(draft, now) {
		if (draft.state !== 'live' || draft.paused) return false;
		const assetId = draft.runoff?.asset_id ?? null;
		const outcome = runoffTimeout(draft, now);
		if (outcome && assetId !== null) {
			finishRunoff(draft, outcome, assetId);
			return true;
		}
		const round = draft.pool_round;
		if (round && round.phase === 'bidding' && round.closes_at !== null && now >= round.closes_at) {
			closeBidding(draft);
			return true;
		}
		return false;
	},
	closeCurrent(draft) {
		closeBidding(draft);
	},
	freeze(draft, now) {
		if (draft.pool_round) freezeClock(draft.pool_round, now);
		if (draft.runoff) freezeClock(draft.runoff, now);
	},
	thaw(draft, now, minSeconds) {
		if (draft.pool_round) thawClock(draft.pool_round, now, minSeconds);
		if (draft.runoff) thawClock(draft.runoff, now, minSeconds);
	}
};
