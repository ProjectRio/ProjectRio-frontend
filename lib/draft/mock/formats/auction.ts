// Auction — open ascending (§7b). A lot opens without a bid; the nominator
// names the opening bid, which starts the clock, and only then can anyone
// else bid.

import { assetById } from '../../assets';
import { DraftError, type DraftAction } from '../../types';
import { type Actor, type FormatModule } from '../format';
import { clearNomination, queueNomination } from '../queue';
import { announceSale, assertEligible, assertLive, maxBid, openSlots, recordPick, rotation } from '../rules';
import { displayName, log, nextId, team, type BidRow, type DraftRow, type NominationRow } from '../state';
import { afterLot, closeNomination, freezeLots, openNomination, thawLots, tryOpenNext } from './lot';

export function lotBids(draft: DraftRow, nomination: NominationRow): BidRow[] {
	return draft.bids.filter((bid) => bid.nomination_id === nomination.id && !bid.runoff && bid.rescind !== 'approved');
}

export function highBid(draft: DraftRow, nomination: NominationRow): BidRow | null {
	return nomination.high_bid_id !== null ? (draft.bids.find((bid) => bid.id === nomination.high_bid_id) ?? null) : null;
}

export function rescindPending(draft: DraftRow, nomination: NominationRow): BidRow | null {
	return draft.bids.find((bid) => bid.nomination_id === nomination.id && bid.rescind === 'requested') ?? null;
}

export function eligibleTeams(draft: DraftRow, nomination: NominationRow): number[] {
	const asset = assetById(nomination.asset_id);
	return draft.teams
		.filter((row) => openSlots(draft, row.id)[asset.kind] > 0)
		.filter((row) => {
			// Restricted teams can't bid; the high bidder always counts as in.
			if (highBid(draft, nomination)?.team_id === row.id) return true;
			return maxBid(draft, row.id) >= draft.config.min_bid;
		})
		.map((row) => row.id);
}

/** The lowest bid that would take the high bid right now. */
export function bidFloor(draft: DraftRow, nomination: NominationRow): number {
	const high = highBid(draft, nomination);
	return high ? high.amount + draft.config.bid_increment : draft.config.min_bid;
}

export function stillIn(draft: DraftRow, nomination: NominationRow): number[] {
	const high = highBid(draft, nomination);
	const next = bidFloor(draft, nomination);
	return eligibleTeams(draft, nomination).filter((teamId) => {
		if (high?.team_id === teamId) return true;
		if (nomination.passed_team_ids.includes(teamId)) return false;
		return maxBid(draft, teamId) >= next;
	});
}

function requireTeam(actor: Actor): number {
	if (actor.team_id === null) throw new DraftError('NOT_A_MANAGER');
	return actor.team_id;
}

function requireOpen(draft: DraftRow): NominationRow {
	const open = openNomination(draft);
	if (!open) throw new DraftError('LOT_CLOSED', 'Nothing is up for bidding.');
	return open;
}

function bid(draft: DraftRow, actor: Actor, amount: number) {
	assertLive(draft);
	const teamId = requireTeam(actor);
	const open = requireOpen(draft);
	const now = Date.now();
	if (rescindPending(draft, open)) throw new DraftError('RESCIND_PENDING');
	if (open.closes_at !== null && now >= open.closes_at) throw new DraftError('LOT_CLOSED');
	const asset = assetById(open.asset_id);
	const high = highBid(draft, open);
	const opening = !high;
	if (opening && open.nominated_by_team_id !== teamId) throw new DraftError('NOT_YOUR_TURN', 'The nominator sets the opening bid.');
	if (high?.team_id === teamId) throw new DraftError('ALREADY_HIGH');
	assertEligible(draft, teamId, asset);
	const floor = bidFloor(draft, open);
	if (!Number.isInteger(amount) || amount < floor) throw new DraftError('BELOW_INCREMENT', `Minimum bid is $${floor}.`);
	if (amount > maxBid(draft, teamId)) throw new DraftError('EXCEEDS_MAX_BID', `Your max bid is $${maxBid(draft, teamId)}.`);

	const row: BidRow = {
		id: nextId(draft),
		nomination_id: open.id,
		round: open.round,
		team_id: teamId,
		placed_by: actor.username,
		amount,
		placed_at: now,
		rescind: null,
		sealed: false,
		runoff: false
	};
	draft.bids.push(row);
	open.high_bid_id = row.id;
	open.passed_team_ids = open.passed_team_ids.filter((id) => id !== teamId);
	if (opening) {
		// The opening bid starts the lot clock.
		open.opening_bid = amount;
		open.closes_at = draft.config.lot_seconds ? now + draft.config.lot_seconds * 1000 : null;
		log(draft, 'bid', `${displayName(team(draft, teamId))} opened ${asset.name} at $${amount}`, { team_id: teamId, asset, amount });
		return;
	}
	if (open.closes_at !== null) open.closes_at = Math.max(open.closes_at, now + draft.config.extend_seconds * 1000);
	log(draft, 'bid', `${displayName(team(draft, teamId))} bid $${amount} on ${asset.name}`, { team_id: teamId, asset, amount });
}

function pass(draft: DraftRow, actor: Actor) {
	assertLive(draft);
	const teamId = requireTeam(actor);
	const open = requireOpen(draft);
	const high = highBid(draft, open);
	if (!high) throw new DraftError('INVALID_STATE', 'Wait for the opening bid.');
	if (high.team_id === teamId) throw new DraftError('ALREADY_HIGH', 'The high bidder cannot pass.');
	if (!open.passed_team_ids.includes(teamId)) {
		open.passed_team_ids.push(teamId);
		log(draft, 'pass', `${displayName(team(draft, teamId))} is out`, { team_id: teamId });
	}
}

function requestRescind(draft: DraftRow, actor: Actor) {
	assertLive(draft);
	const teamId = requireTeam(actor);
	const open = requireOpen(draft);
	const high = highBid(draft, open);
	if (!high || high.team_id !== teamId) throw new DraftError('INVALID_STATE', 'Only the high bidder can rescind.');
	if (high.rescind === 'requested') throw new DraftError('RESCIND_PENDING');
	high.rescind = 'requested';
	if (open.closes_at !== null) {
		open.paused_remaining_s = Math.max(0, (open.closes_at - Date.now()) / 1000);
		open.closes_at = null;
	}
	log(draft, 'bid', `${displayName(team(draft, teamId))} asked to rescind $${high.amount}`, { team_id: teamId, amount: high.amount });
}

export function resolveRescind(draft: DraftRow, bidId: number, approve: boolean) {
	const row = draft.bids.find((candidate) => candidate.id === bidId);
	if (!row || row.rescind !== 'requested') throw new DraftError('INVALID_STATE', 'No such pending rescind.');
	const nomination = draft.nominations.find((candidate) => candidate.id === row.nomination_id)!;
	const now = Date.now();
	const resume = (extraSeconds: number) => {
		if (nomination.paused_remaining_s !== null && !draft.paused) {
			nomination.closes_at = now + Math.max(nomination.paused_remaining_s, extraSeconds) * 1000;
			nomination.paused_remaining_s = null;
		}
	};
	if (!approve) {
		row.rescind = 'rejected';
		resume(0);
		log(draft, 'commissioner', `Rescind rejected — $${row.amount} stands`, { team_id: row.team_id, amount: row.amount });
		return;
	}
	row.rescind = 'approved';
	const others = lotBids(draft, nomination).filter((bid) => bid.id !== row.id);
	const previous = others.sort((a, b) => b.amount - a.amount)[0] ?? null;
	log(draft, 'commissioner', `Rescind approved — $${row.amount} withdrawn`, { team_id: row.team_id, amount: row.amount });
	if (!previous) {
		// The nominator's opening bid with no other bids: void, turn returns to the team.
		nomination.state = 'voided';
		nomination.note = 'Opening bid rescinded';
		nomination.closes_at = null;
		nomination.paused_remaining_s = null;
		draft.turn_team_id = nomination.nominated_by_team_id;
		log(draft, 'system', `${assetById(nomination.asset_id).name} returns to the pool; the turn goes back to ${displayName(team(draft, nomination.nominated_by_team_id))}`);
		afterLot(draft, true);
		return;
	}
	nomination.high_bid_id = previous.id;
	resume(draft.config.extend_seconds);
}

export function closeLot(draft: DraftRow) {
	const open = openNomination(draft);
	if (!open) throw new DraftError('INVALID_STATE', 'Nothing is open.');
	if (rescindPending(draft, open)) throw new DraftError('RESCIND_PENDING');
	const high = highBid(draft, open);
	if (!high) throw new DraftError('INVALID_STATE', 'No opening bid yet — void the nomination instead.');
	closeNomination(draft, open);
	const pick = recordPick(draft, { teamId: high.team_id, assetId: open.asset_id, price: high.amount, round: open.round, madeBy: high.placed_by, nominationId: open.id });
	announceSale(draft, high.team_id, open.asset_id, pick.price, pick.took_remaining_budget);
	afterLot(draft, true);
}

export function voidNomination(draft: DraftRow, nominationId: number, note: string) {
	const row = draft.nominations.find((candidate) => candidate.id === nominationId);
	if (!row) throw new DraftError('INVALID_STATE', 'No such nomination.');
	const wasOpen = row.state === 'open';
	row.state = 'voided';
	row.note = note;
	row.closes_at = null;
	log(draft, 'commissioner', `Nomination of ${assetById(row.asset_id).name} voided — ${note}`, { asset: assetById(row.asset_id) });
	if (wasOpen) afterLot(draft, draft.format === 'auction');
}

export const auction: FormatModule = {
	start(draft) {
		draft.turn_team_id = rotation(draft)[0]?.id ?? null;
		draft.round = 1;
		if (draft.config.advance === 'auto') tryOpenNext(draft, true);
	},
	handle(draft, actor, action: DraftAction) {
		switch (action.type) {
			case 'queue_nomination':
				queueNomination(draft, requireTeam(actor), action.payload.asset_id);
				if (draft.config.advance === 'auto') tryOpenNext(draft, true);
				return;
			case 'clear_nomination':
				clearNomination(draft, requireTeam(actor));
				return;
			case 'bid':
				bid(draft, actor, action.payload.amount);
				return;
			case 'pass':
				pass(draft, actor);
				return;
			case 'request_rescind':
				requestRescind(draft, actor);
				return;
			default:
				throw new DraftError('INVALID_ACTION');
		}
	},
	tick(draft, now) {
		if (draft.state !== 'live' || draft.paused) return false;
		const open = openNomination(draft);
		if (open && open.closes_at !== null && now >= open.closes_at && !rescindPending(draft, open)) {
			closeLot(draft);
			return true;
		}
		if (!open && draft.config.advance === 'auto') return tryOpenNext(draft, true);
		return false;
	},
	openNext(draft) {
		if (!tryOpenNext(draft, true)) throw new DraftError('INVALID_STATE', 'The front of the queue is not ready.');
	},
	closeCurrent(draft) {
		closeLot(draft);
	},
	freeze: freezeLots,
	thaw: thawLots
};
