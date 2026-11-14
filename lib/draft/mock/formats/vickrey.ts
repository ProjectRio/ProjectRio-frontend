// Vickrey — sealed bids, second price (§7c).

import { assetById } from '../../assets';
import { DraftError, type DraftAction } from '../../types';
import type { Actor, FormatModule } from '../format';
import { clearNomination, queueNomination } from '../queue';
import { announceSale, assertEligible, assertLive, maxBid, openSlots, recordPick, rotation, ineligibleReason } from '../rules';
import { displayName, log, nextId, team, type BidRow, type DraftRow, type NominationRow } from '../state';
import { runoffBid, runoffPass, runoffTimeout, settleTie, type TieOutcome } from '../ties';
import { afterLot, closeNomination, freezeLots, openNomination, thawLots, tryOpenNext } from './lot';

export function sealedBids(draft: DraftRow, nomination: NominationRow): BidRow[] {
	return draft.bids.filter((bid) => bid.nomination_id === nomination.id && bid.sealed);
}

export function vickreyEligible(draft: DraftRow, nomination: NominationRow): number[] {
	const asset = assetById(nomination.asset_id);
	return draft.teams
		.filter((row) => openSlots(draft, row.id)[asset.kind] > 0)
		.filter((row) => maxBid(draft, row.id) >= draft.config.min_bid)
		.filter((row) => ineligibleReason(draft, row.id, asset) === null || row.id === nomination.nominated_by_team_id)
		.map((row) => row.id);
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

function sealedBid(draft: DraftRow, actor: Actor, amount: number) {
	assertLive(draft);
	if (draft.runoff) throw new DraftError('INVALID_STATE', 'A runoff is in progress.');
	const teamId = requireTeam(actor);
	const open = requireOpen(draft);
	const now = Date.now();
	if (open.closes_at !== null && now >= open.closes_at) throw new DraftError('LOT_CLOSED');
	const asset = assetById(open.asset_id);
	assertEligible(draft, teamId, asset);
	if (!Number.isInteger(amount) || amount < draft.config.min_bid) throw new DraftError('BELOW_INCREMENT', `Minimum bid is $${draft.config.min_bid}.`);
	if (amount > maxBid(draft, teamId)) throw new DraftError('EXCEEDS_MAX_BID', `Your max bid is $${maxBid(draft, teamId)}.`);
	// Bids can change until close: replace the team's earlier sealed bid.
	const previous = sealedBids(draft, open).find((bid) => bid.team_id === teamId);
	if (previous) {
		previous.amount = amount;
		previous.placed_at = now;
		previous.placed_by = actor.username;
	} else {
		draft.bids.push({
			id: nextId(draft),
			nomination_id: open.id,
			round: open.round,
			team_id: teamId,
			placed_by: actor.username,
			amount,
			placed_at: now,
			rescind: null,
			sealed: true,
			runoff: false
		});
		log(draft, 'bid', `${displayName(team(draft, teamId))} sealed a bid on ${asset.name}`, { team_id: teamId, asset });
	}
	open.passed_team_ids = open.passed_team_ids.filter((id) => id !== teamId);
	maybeAutoClose(draft, open);
}

function pass(draft: DraftRow, actor: Actor) {
	assertLive(draft);
	const teamId = requireTeam(actor);
	const open = requireOpen(draft);
	if (open.nominated_by_team_id === teamId) throw new DraftError('INVALID_ACTION', 'The nominator must bid.');
	if (!open.passed_team_ids.includes(teamId)) {
		open.passed_team_ids.push(teamId);
		log(draft, 'pass', `${displayName(team(draft, teamId))} passed`, { team_id: teamId });
	}
	maybeAutoClose(draft, open);
}

function maybeAutoClose(draft: DraftRow, open: NominationRow) {
	const eligible = vickreyEligible(draft, open);
	const done = eligible.every(
		(teamId) => open.passed_team_ids.includes(teamId) || sealedBids(draft, open).some((bid) => bid.team_id === teamId)
	);
	if (done) resolve(draft, open);
}

function resolve(draft: DraftRow, open: NominationRow) {
	const bids = sealedBids(draft, open).sort((a, b) => b.amount - a.amount);
	closeNomination(draft, open);
	if (bids.length === 0) {
		// Can't happen when the nominator bids; the commissioner may have closed early.
		open.state = 'voided';
		open.note = 'No bids';
		log(draft, 'system', `${assetById(open.asset_id).name} drew no bids and returns to the pool`);
		afterLot(draft, false);
		return;
	}
	const top = bids[0].amount;
	const tied = bids.filter((bid) => bid.amount === top).map((bid) => bid.team_id);
	const second = bids.find((bid) => bid.amount < top)?.amount ?? draft.config.min_bid;
	if (tied.length === 1) {
		finish(draft, open, { winner_team_id: tied[0], price: second }, `Paid the second price ($${second})`);
		return;
	}
	const outcome = settleTie(draft, {
		tiedIds: tied,
		tiedAmount: top,
		nominatorId: open.nominated_by_team_id,
		assetId: open.asset_id,
		nominationId: open.id
	});
	if (outcome) finish(draft, open, outcome, `Tie at $${top}`);
}

function finish(draft: DraftRow, nomination: NominationRow, outcome: TieOutcome, note: string) {
	const pick = recordPick(draft, {
		teamId: outcome.winner_team_id,
		assetId: nomination.asset_id,
		price: outcome.price,
		round: nomination.round,
		madeBy: null,
		nominationId: nomination.id
	});
	const bids = sealedBids(draft, nomination);
	draft.last_result = { asset_id: nomination.asset_id, team_id: outcome.winner_team_id, price: pick.price, bid_ids: bids.map((bid) => bid.id), note };
	announceSale(draft, outcome.winner_team_id, nomination.asset_id, pick.price, pick.took_remaining_budget);
	afterLot(draft, false);
}

function finishRunoff(draft: DraftRow, outcome: TieOutcome, nominationId: number) {
	const nomination = draft.nominations.find((row) => row.id === nominationId);
	if (!nomination) return;
	finish(draft, nomination, outcome, `Won the runoff at $${outcome.price}`);
}

export const vickrey: FormatModule = {
	start(draft) {
		draft.turn_team_id = rotation(draft)[0]?.id ?? null;
		draft.round = 1;
		if (draft.config.advance === 'auto') tryOpenNext(draft, false);
	},
	handle(draft, actor, action: DraftAction) {
		switch (action.type) {
			case 'queue_nomination':
				queueNomination(draft, requireTeam(actor), action.payload.asset_id);
				if (draft.config.advance === 'auto') tryOpenNext(draft, false);
				return;
			case 'clear_nomination':
				clearNomination(draft, requireTeam(actor));
				return;
			case 'sealed_bid':
				sealedBid(draft, actor, action.payload.amount);
				return;
			case 'pass':
				pass(draft, actor);
				return;
			case 'runoff_bid': {
				assertLive(draft);
				runoffBid(draft, actor, action.payload.amount);
				return;
			}
			case 'runoff_pass': {
				assertLive(draft);
				const nominationId = draft.runoff?.nomination_id ?? 0;
				const outcome = runoffPass(draft, actor);
				if (outcome) finishRunoff(draft, outcome, nominationId);
				return;
			}
			default:
				throw new DraftError('INVALID_ACTION');
		}
	},
	tick(draft, now) {
		if (draft.state !== 'live' || draft.paused) return false;
		const nominationId = draft.runoff?.nomination_id ?? 0;
		const outcome = runoffTimeout(draft, now);
		if (outcome) {
			finishRunoff(draft, outcome, nominationId);
			return true;
		}
		const open = openNomination(draft);
		if (open && open.closes_at !== null && now >= open.closes_at) {
			resolve(draft, open);
			return true;
		}
		if (!open && !draft.runoff && draft.config.advance === 'auto') return tryOpenNext(draft, false);
		return false;
	},
	openNext(draft) {
		if (!tryOpenNext(draft, false)) throw new DraftError('INVALID_STATE', 'The front of the queue is not ready.');
	},
	closeCurrent(draft) {
		const open = openNomination(draft);
		if (!open) throw new DraftError('INVALID_STATE', 'Nothing is open.');
		resolve(draft, open);
	},
	freeze: freezeLots,
	thaw: thawLots
};
