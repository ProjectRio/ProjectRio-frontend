// Shared "lot" mechanics for auction and Vickrey: opening the front of the
// queue, advancing the turn, and completing when every roster is full.

import { assetById } from '../../assets';
import { thawClock, freezeClock } from '../format';
import { entryProblem, nextInRotation, queuedEntry } from '../queue';
import { allRostersFull, rotation } from '../rules';
import { displayName, log, team, type DraftRow, type NominationRow } from '../state';

export function openNomination(draft: DraftRow): NominationRow | undefined {
	return draft.nominations.find((row) => row.state === 'open');
}

export function completeIfDone(draft: DraftRow): boolean {
	if (draft.state === 'live' && allRostersFull(draft)) {
		draft.state = 'completed';
		draft.completed_at = Date.now();
		draft.turn_team_id = null;
		log(draft, 'system', 'Every roster is full — the draft is complete.');
		return true;
	}
	return false;
}

/**
 * Try to put the front queue entry up. Returns true when a lot opened. The
 * rotation is strict: if the turn team has nothing valid queued, nothing
 * opens and the draft waits on them (§7b step 3).
 *
 * Auction lots open without a clock — the nominator's opening bid starts it.
 * Vickrey lots start their clock immediately.
 */
export function tryOpenNext(draft: DraftRow, needsOpeningBid: boolean): boolean {
	if (draft.state !== 'live' || draft.paused) return false;
	if (openNomination(draft) || draft.runoff) return false;
	if (completeIfDone(draft)) return false;
	if (draft.turn_team_id === null || !rotation(draft).some((row) => row.id === draft.turn_team_id)) {
		draft.turn_team_id = rotation(draft)[0]?.id ?? null;
	}
	if (draft.turn_team_id === null) return false;
	const entry = queuedEntry(draft, draft.turn_team_id);
	if (entryProblem(draft, entry) || !entry) return false;

	const now = Date.now();
	entry.state = 'open';
	entry.round = draft.round;
	entry.opened_at = now;
	entry.closes_at = !needsOpeningBid && draft.config.lot_seconds ? now + draft.config.lot_seconds * 1000 : null;
	entry.passed_team_ids = [];
	const asset = assetById(entry.asset_id);
	const nominator = team(draft, entry.nominated_by_team_id);
	log(draft, 'nomination', `${displayName(nominator)} nominated ${asset.name}${needsOpeningBid ? ' — waiting for the opening bid' : ' — sealed bids open'}`, {
		team_id: nominator.id,
		asset
	});
	draft.round += 1;
	draft.turn_team_id = nextInRotation(draft, entry.nominated_by_team_id);
	return true;
}

export function closeNomination(draft: DraftRow, row: NominationRow) {
	row.state = 'closed';
	row.closed_at = Date.now();
	row.closes_at = null;
	row.paused_remaining_s = null;
}

export function afterLot(draft: DraftRow, needsOpeningBid: boolean) {
	if (completeIfDone(draft)) return;
	if (draft.config.advance === 'auto') tryOpenNext(draft, needsOpeningBid);
}

export function freezeLots(draft: DraftRow, now: number) {
	const open = openNomination(draft);
	if (open) freezeClock(open, now);
	if (draft.runoff) freezeClock(draft.runoff, now);
}

export function thawLots(draft: DraftRow, now: number, minSeconds: number) {
	const open = openNomination(draft);
	if (open && !draft.bids.some((bid) => bid.nomination_id === open.id && bid.rescind === 'requested')) {
		thawClock(open, now, minSeconds);
	}
	if (draft.runoff) thawClock(draft.runoff, now, minSeconds);
}
