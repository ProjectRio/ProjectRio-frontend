// Sealed-bid ties (§7i): a tied nominator always takes it; otherwise the
// league's method — a $1 runoff between the tied teams, or a rolling priority
// order. Shared by Vickrey and round pool.

import { DraftError } from '../types';
import type { Actor } from './format';
import { maxBid } from './rules';
import { displayName, log, nextId, team, type BidRow, type DraftRow } from './state';
import { assetById } from '../assets';

export interface TieOutcome {
	winner_team_id: number;
	price: number;
}

/** Lowest tie_priority wins and drops to the back of the order. */
export function priorityWinner(draft: DraftRow, tiedIds: number[]): number {
	const winner = [...tiedIds].sort((a, b) => team(draft, a).tie_priority - team(draft, b).tie_priority)[0];
	const max = Math.max(...draft.teams.map((row) => row.tie_priority));
	team(draft, winner).tie_priority = max + 1;
	[...draft.teams].sort((a, b) => a.tie_priority - b.tie_priority).forEach((row, index) => (row.tie_priority = index + 1));
	log(draft, 'system', `${displayName(team(draft, winner))} wins the tie on priority and drops to the back of the order`, {
		team_id: winner
	});
	return winner;
}

/**
 * Decide a tie now, or start a runoff and return null. `nominatorId` is the
 * team that nominated the contested asset, if any of the tied teams did.
 */
export function settleTie(
	draft: DraftRow,
	options: { tiedIds: number[]; tiedAmount: number; nominatorId: number | null; assetId: number; nominationId: number }
): TieOutcome | null {
	const { tiedIds, tiedAmount, nominatorId, assetId, nominationId } = options;
	if (tiedIds.length === 1) return { winner_team_id: tiedIds[0], price: tiedAmount };
	if (nominatorId !== null && tiedIds.includes(nominatorId)) {
		log(draft, 'system', `Tie at $${tiedAmount} — the nominator takes ${assetById(assetId).name}`, { team_id: nominatorId });
		return { winner_team_id: nominatorId, price: tiedAmount };
	}
	if (draft.config.ties.method === 'priority_order') {
		return { winner_team_id: priorityWinner(draft, tiedIds), price: tiedAmount };
	}
	const now = Date.now();
	draft.runoff = {
		nomination_id: nominationId,
		team_ids: tiedIds,
		passed_team_ids: [],
		high_bid_id: null,
		closes_at: draft.config.lot_seconds ? now + draft.config.lot_seconds * 1000 : null,
		paused_remaining_s: null,
		asset_id: assetId,
		tied_amount: tiedAmount
	};
	log(
		draft,
		'system',
		`Tie at $${tiedAmount} for ${assetById(assetId).name} — runoff between ${tiedIds.map((id) => displayName(team(draft, id))).join(', ')}`
	);
	return null;
}

export function runoffHigh(draft: DraftRow): BidRow | null {
	if (!draft.runoff || draft.runoff.high_bid_id === null) return null;
	return draft.bids.find((bid) => bid.id === draft.runoff!.high_bid_id) ?? null;
}

export function runoffBids(draft: DraftRow): BidRow[] {
	if (!draft.runoff) return [];
	return draft.bids.filter((bid) => bid.runoff && bid.nomination_id === draft.runoff!.nomination_id);
}

function requireRunoffTeam(draft: DraftRow, actor: Actor): number {
	if (!draft.runoff) throw new DraftError('INVALID_STATE', 'No runoff is running.');
	if (actor.team_id === null || !draft.runoff.team_ids.includes(actor.team_id)) {
		throw new DraftError('NOT_YOUR_TURN', 'You are not in this runoff.');
	}
	return actor.team_id;
}

export function runoffBid(draft: DraftRow, actor: Actor, amount: number): TieOutcome | null {
	const teamId = requireRunoffTeam(draft, actor);
	const runoff = draft.runoff!;
	const now = Date.now();
	if (runoff.closes_at !== null && now >= runoff.closes_at) throw new DraftError('LOT_CLOSED');
	const high = runoffHigh(draft);
	if (high?.team_id === teamId) throw new DraftError('ALREADY_HIGH');
	const floor = (high?.amount ?? runoff.tied_amount) + draft.config.bid_increment;
	if (amount < floor) throw new DraftError('BELOW_INCREMENT', `Minimum runoff bid is $${floor}.`);
	if (amount > maxBid(draft, teamId)) throw new DraftError('EXCEEDS_MAX_BID');
	const row: BidRow = {
		id: nextId(draft),
		nomination_id: runoff.nomination_id,
		round: draft.round,
		team_id: teamId,
		placed_by: actor.username,
		amount,
		placed_at: now,
		rescind: null,
		sealed: false,
		runoff: true
	};
	draft.bids.push(row);
	runoff.high_bid_id = row.id;
	runoff.passed_team_ids = runoff.passed_team_ids.filter((id) => id !== teamId);
	if (runoff.closes_at !== null) runoff.closes_at = Math.max(runoff.closes_at, now + draft.config.extend_seconds * 1000);
	log(draft, 'bid', `${displayName(team(draft, teamId))} runoff bid $${amount}`, { team_id: teamId, amount });
	return null;
}

export function runoffPass(draft: DraftRow, actor: Actor): TieOutcome | null {
	const teamId = requireRunoffTeam(draft, actor);
	const runoff = draft.runoff!;
	if (runoffHigh(draft)?.team_id === teamId) throw new DraftError('ALREADY_HIGH', 'The high bidder cannot pass.');
	if (!runoff.passed_team_ids.includes(teamId)) {
		runoff.passed_team_ids.push(teamId);
		log(draft, 'pass', `${displayName(team(draft, teamId))} is out of the runoff`, { team_id: teamId });
	}
	const remaining = runoff.team_ids.filter((id) => !runoff.passed_team_ids.includes(id));
	if (remaining.length === 1) return finishRunoff(draft, remaining[0]);
	return null;
}

export function runoffTimeout(draft: DraftRow, now: number): TieOutcome | null {
	const runoff = draft.runoff;
	if (!runoff || runoff.closes_at === null || now < runoff.closes_at) return null;
	const high = runoffHigh(draft);
	if (high) return finishRunoff(draft, high.team_id);
	// Nobody bid before the clock ran out: fall back to priority order.
	const remaining = runoff.team_ids.filter((id) => !runoff.passed_team_ids.includes(id));
	return finishRunoff(draft, priorityWinner(draft, remaining.length ? remaining : runoff.team_ids));
}

function finishRunoff(draft: DraftRow, winnerId: number): TieOutcome {
	const runoff = draft.runoff!;
	const high = runoffHigh(draft);
	const price = high && high.team_id === winnerId ? high.amount : runoff.tied_amount;
	draft.runoff = null;
	return { winner_team_id: winnerId, price };
}
