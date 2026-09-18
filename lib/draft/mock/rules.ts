// Shared rules every format uses (§6e–6g, §6m): budgets, slots, max bid,
// eligibility, restrictions, and the one function that records a pick.

import { assetById } from '../assets';
import { DraftError, type Asset, type AssetKind, type RestrictionIcon, type RestrictionStatus } from '../types';
import { displayName, log, nextId, team, teamPicks, type DraftRow, type PickRow, type TeamRow } from './state';

export function spent(draft: DraftRow, teamId: number): number {
	return teamPicks(draft, teamId).reduce((sum, pick) => sum + pick.price, 0);
}

export function remaining(draft: DraftRow, teamId: number): number {
	return team(draft, teamId).budget - spent(draft, teamId);
}

export function openSlots(draft: DraftRow, teamId: number): Record<AssetKind, number> {
	const picks = teamPicks(draft, teamId);
	const used: Record<AssetKind, number> = { character: 0, stadium: 0 };
	for (const pick of picks) used[assetById(pick.asset_id!).kind]++;
	return {
		character: Math.max(0, draft.config.slots.character - used.character),
		stadium: Math.max(0, draft.config.slots.stadium - used.stadium)
	};
}

export function openSlotsTotal(draft: DraftRow, teamId: number): number {
	const slots = openSlots(draft, teamId);
	return slots.character + slots.stadium;
}

export function maxBid(draft: DraftRow, teamId: number): number {
	if (draft.format === 'snake') return 0;
	const open = openSlotsTotal(draft, teamId);
	if (open === 0) return 0;
	return Math.max(0, remaining(draft, teamId) - draft.config.min_bid * (open - 1));
}

export function rosterFull(draft: DraftRow, teamId: number): boolean {
	return openSlotsTotal(draft, teamId) === 0;
}

/** Teams in draft order, skipping full rosters (they drop out of the rotation). */
export function rotation(draft: DraftRow): TeamRow[] {
	return [...draft.teams].sort((a, b) => a.draft_order - b.draft_order).filter((row) => !rosterFull(draft, row.id));
}

export function copiesTaken(draft: DraftRow, assetId: number): number {
	return draft.picks.filter((pick) => pick.asset_id === assetId).length;
}

export function totalCopies(draft: DraftRow, assetId: number): number | null {
	return draft.config.pool.copies_by_asset?.[assetId] ?? draft.config.pool.copies;
}

export function remainingCopies(draft: DraftRow, assetId: number): number | null {
	const copies = totalCopies(draft, assetId);
	if (copies === null) return null;
	return Math.max(0, copies - copiesTaken(draft, assetId));
}

export function inPool(draft: DraftRow, assetId: number): boolean {
	return draft.config.pool.asset_ids.includes(assetId);
}

export function assetAvailable(draft: DraftRow, assetId: number): boolean {
	if (!inPool(draft, assetId)) return false;
	const copies = remainingCopies(draft, assetId);
	return copies === null || copies > 0;
}

// ── Restrictions ───────────────────────────────────────────────────────────

function restrictionKey(restriction: DraftRow['config']['restrictions'][number]): string {
	switch (restriction.type) {
		case 'captain_required':
			return 'captain_required';
		case 'group_max':
			return `group:${restriction.name}`;
		case 'must_be_captain':
			return 'must_be_captain';
		case 'handedness':
			return `handedness:${restriction.char_id}`;
	}
}

export function restrictionIcons(draft: DraftRow, asset: Asset): RestrictionIcon[] {
	const icons: RestrictionIcon[] = [];
	if (asset.kind !== 'character') return icons;
	for (const restriction of draft.config.restrictions) {
		if (restriction.type === 'group_max' && restriction.char_ids.includes(asset.char_id!)) {
			icons.push({ code: 'G', label: `${restriction.name} — max ${restriction.max}` });
		} else if (restriction.type === 'must_be_captain' && restriction.char_id === asset.char_id) {
			icons.push({ code: 'C', label: 'Must be captain if rostered' });
		} else if (restriction.type === 'handedness' && restriction.char_id === asset.char_id) {
			const parts = [restriction.bat && `bats ${restriction.bat}`, restriction.pitch && `pitches ${restriction.pitch}`]
				.filter(Boolean)
				.join(', ');
			icons.push({ code: 'L', label: `Handedness: ${parts}` });
		}
	}
	return icons;
}

function hasCaptain(draft: DraftRow, teamId: number): boolean {
	return teamPicks(draft, teamId).some((pick) => assetById(pick.asset_id!).captain);
}

function groupCount(draft: DraftRow, teamId: number, charIds: number[]): number {
	return teamPicks(draft, teamId).filter((pick) => {
		const asset = assetById(pick.asset_id!);
		return asset.kind === 'character' && charIds.includes(asset.char_id!);
	}).length;
}

function mustBeCaptainIds(draft: DraftRow): number[] {
	return draft.config.restrictions
		.filter((restriction) => restriction.type === 'must_be_captain')
		.map((restriction) => (restriction as { char_id: number }).char_id);
}

export function restrictionStatus(draft: DraftRow, teamId: number): RestrictionStatus[] {
	const row = team(draft, teamId);
	const status: RestrictionStatus[] = [];
	for (const restriction of draft.config.restrictions) {
		const key = restrictionKey(restriction);
		const waived = row.waived_restrictions.includes(key);
		if (restriction.type === 'captain_required') {
			status.push({ label: hasCaptain(draft, teamId) ? 'Captain rostered' : 'Needs a captain', ok: hasCaptain(draft, teamId), waived });
		} else if (restriction.type === 'group_max') {
			const count = groupCount(draft, teamId, restriction.char_ids);
			status.push({ label: `${restriction.name} ${count}/${restriction.max}`, ok: count <= restriction.max, waived });
		}
	}
	const mustIds = mustBeCaptainIds(draft);
	if (mustIds.length > 1) {
		const count = groupCount(draft, teamId, mustIds);
		status.push({ label: `Must-be-captain ${count}/1`, ok: count <= 1, waived: row.waived_restrictions.includes('must_be_captain') });
	}
	return status;
}

/** Why `teamId` may not acquire `asset` right now, or null when it may. */
export function ineligibleReason(draft: DraftRow, teamId: number, asset: Asset): string | null {
	const row = team(draft, teamId);
	if (!assetAvailable(draft, asset.id)) return 'No copies left';
	const slots = openSlots(draft, teamId);
	if (slots[asset.kind] === 0) return asset.kind === 'character' ? 'No open character slot' : 'No open stadium slot';
	if (asset.kind !== 'character') return null;

	for (const restriction of draft.config.restrictions) {
		const key = restrictionKey(restriction);
		if (row.waived_restrictions.includes(key)) continue;
		if (restriction.type === 'captain_required') {
			if (slots.character === 1 && !hasCaptain(draft, teamId) && !asset.captain) return 'Last slot must be a captain';
		} else if (restriction.type === 'group_max') {
			if (restriction.char_ids.includes(asset.char_id!) && groupCount(draft, teamId, restriction.char_ids) >= restriction.max) {
				return `${restriction.name} limit reached (${restriction.max})`;
			}
		}
	}
	const mustIds = mustBeCaptainIds(draft);
	if (mustIds.includes(asset.char_id!) && !row.waived_restrictions.includes('must_be_captain')) {
		if (groupCount(draft, teamId, mustIds) >= 1) return 'Already rostering a must-be-captain';
	}
	return null;
}

export function assertEligible(draft: DraftRow, teamId: number, asset: Asset) {
	const reason = ineligibleReason(draft, teamId, asset);
	if (!reason) return;
	if (reason === 'No copies left') throw new DraftError('ASSET_UNAVAILABLE');
	if (reason.startsWith('No open')) throw new DraftError('NO_OPEN_SLOT', reason);
	throw new DraftError('RESTRICTED', reason);
}

/** Does the team have any legal option among available assets of a kind? */
export function hasLegalOption(draft: DraftRow, teamId: number, kind: AssetKind, candidates?: number[]): boolean {
	const ids = candidates ?? draft.config.pool.asset_ids;
	return ids.some((id) => {
		const asset = assetById(id);
		return asset.kind === kind && ineligibleReason(draft, teamId, asset) === null;
	});
}

// ── Picks ──────────────────────────────────────────────────────────────────

/** Record a sale/pick; applies the last-slot rule (§6g) and returns the row. */
export function recordPick(
	draft: DraftRow,
	options: { teamId: number; assetId: number; price: number; round: number; madeBy: string | null; existing?: PickRow; isKeeper?: boolean; nominationId?: number | null }
): PickRow {
	const { teamId, assetId, round, madeBy } = options;
	let price = options.price;
	let tookRemaining = false;
	const lastSlot = openSlotsTotal(draft, teamId) === 1;
	if (draft.config.last_slot_takes_remaining && lastSlot && draft.format !== 'snake' && draft.format !== 'fixed_price') {
		price = remaining(draft, teamId);
		tookRemaining = true;
	}
	const now = Date.now();
	if (options.existing) {
		Object.assign(options.existing, {
			team_id: teamId,
			asset_id: assetId,
			price,
			took_remaining_budget: tookRemaining,
			made_by: madeBy,
			made_at: now,
			nomination_id: options.nominationId ?? null
		});
		return options.existing;
	}
	const row: PickRow = {
		id: nextId(draft),
		round,
		pick_number: draft.picks.filter((pick) => pick.asset_id !== null).length + 1,
		team_id: teamId,
		asset_id: assetId,
		price,
		took_remaining_budget: tookRemaining,
		is_keeper: options.isKeeper ?? false,
		nickname: null,
		made_by: madeBy,
		made_at: now,
		nomination_id: options.nominationId ?? null
	};
	draft.picks.push(row);
	return row;
}

export function announceSale(draft: DraftRow, teamId: number, assetId: number, price: number, tookRemaining: boolean) {
	const asset = assetById(assetId);
	const row = team(draft, teamId);
	const suffix = tookRemaining ? ' (last slot — remaining budget)' : '';
	log(draft, 'sale', `${displayName(row)} won ${asset.name} for $${price}${suffix}`, { team_id: teamId, asset, amount: price });
	draft.last_sale = { asset_id: assetId, team_id: teamId, price };
}

export function allRostersFull(draft: DraftRow): boolean {
	return draft.teams.every((row) => rosterFull(draft, row.id));
}

// ── Guards ─────────────────────────────────────────────────────────────────

export function assertLive(draft: DraftRow) {
	if (draft.state !== 'live') throw new DraftError('INVALID_STATE', 'The draft is not live.');
	if (draft.paused) throw new DraftError('DRAFT_PAUSED');
}

export function assertKind(draft: DraftRow, asset: Asset, kind: AssetKind) {
	if (asset.kind !== kind) throw new DraftError('INVALID_ACTION', `Expected a ${kind}.`);
}

export function isCommissioner(draft: DraftRow, userId: number | null): boolean {
	return userId !== null && draft.commissioner_ids.includes(userId);
}

export function teamOfUser(draft: DraftRow, userId: number | null): TeamRow | null {
	if (userId === null) return null;
	return draft.teams.find((row) => row.managers.some((manager) => manager.rio_user_id === userId)) ?? null;
}
