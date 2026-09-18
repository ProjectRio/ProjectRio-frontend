// The one shared nomination queue (§7b step 2): at most one queued nomination
// per team, shown in draft-order rotation starting from `draft.turn_team_id`.
// A queued entry is just the asset — in an auction the nominator names the
// opening bid when the lot actually comes up.

import { assetById } from '../assets';
import { DraftError, type Asset } from '../types';
import { assetAvailable, ineligibleReason, rotation, remainingCopies } from './rules';
import { displayName, log, nextId, team, type DraftRow, type NominationRow } from './state';

export function queuedEntry(draft: DraftRow, teamId: number): NominationRow | undefined {
	return draft.nominations.find((row) => row.state === 'queued' && row.nominated_by_team_id === teamId);
}

/** Teams in queue order: rotation starting at the turn team. */
export function queueOrder(draft: DraftRow): number[] {
	const order = rotation(draft).map((row) => row.id);
	if (order.length === 0) return [];
	const start = draft.turn_team_id !== null ? order.indexOf(draft.turn_team_id) : 0;
	if (start <= 0) return order;
	return [...order.slice(start), ...order.slice(0, start)];
}

export function nextInRotation(draft: DraftRow, afterTeamId: number): number | null {
	const all = [...draft.teams].sort((a, b) => a.draft_order - b.draft_order).map((row) => row.id);
	const live = new Set(rotation(draft).map((row) => row.id));
	if (live.size === 0) return null;
	const index = all.indexOf(afterTeamId);
	for (let step = 1; step <= all.length; step++) {
		const candidate = all[(index + step) % all.length];
		if (live.has(candidate)) return candidate;
	}
	return null;
}

/** Copies already spoken for by queued or open nominations. */
function queuedCopies(draft: DraftRow, assetId: number): number {
	return draft.nominations.filter((row) => (row.state === 'queued' || row.state === 'open') && row.asset_id === assetId).length;
}

/** Add or replace the team's queued nomination. */
export function queueNomination(draft: DraftRow, teamId: number, assetId: number, options: { kind?: Asset['kind'] } = {}) {
	if (draft.state !== 'lobby' && draft.state !== 'live') throw new DraftError('INVALID_STATE');
	const asset = assetById(assetId);
	if (options.kind && asset.kind !== options.kind) {
		throw new DraftError('INVALID_ACTION', `This round is for ${options.kind}s.`);
	}
	if (!assetAvailable(draft, assetId)) throw new DraftError('ASSET_UNAVAILABLE');
	const existing = queuedEntry(draft, teamId);
	const copies = remainingCopies(draft, assetId);
	const alreadyQueued = queuedCopies(draft, assetId) - (existing?.asset_id === assetId ? 1 : 0);
	if (copies !== null && alreadyQueued >= copies) {
		throw new DraftError('ASSET_UNAVAILABLE', 'Every remaining copy is already queued.');
	}
	const reason = ineligibleReason(draft, teamId, asset);
	if (reason) throw new DraftError('RESTRICTED', reason);

	if (existing) {
		existing.asset_id = assetId;
		existing.kind = asset.kind;
	} else {
		draft.nominations.push({
			id: nextId(draft),
			round: draft.round,
			asset_id: assetId,
			nominated_by_team_id: teamId,
			opening_bid: null,
			state: 'queued',
			opened_at: null,
			closes_at: null,
			paused_remaining_s: null,
			high_bid_id: null,
			passed_team_ids: [],
			closed_at: null,
			note: null,
			kind: asset.kind
		});
	}
	log(draft, 'nomination', `${displayName(team(draft, teamId))} queued ${asset.name}`, { team_id: teamId, asset });
}

export function clearNomination(draft: DraftRow, teamId: number) {
	const existing = queuedEntry(draft, teamId);
	if (existing) draft.nominations.splice(draft.nominations.indexOf(existing), 1);
}

/** Validity of a queued entry as the front of the queue (§7b step 3). */
export function entryProblem(draft: DraftRow, entry: NominationRow | undefined): string | null {
	if (!entry) return 'No nomination queued';
	const asset = assetById(entry.asset_id);
	if (!assetAvailable(draft, entry.asset_id)) return `${asset.name} is gone`;
	const reason = ineligibleReason(draft, entry.nominated_by_team_id, asset);
	if (reason) return reason;
	return null;
}
