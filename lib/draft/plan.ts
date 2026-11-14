'use client';

// A manager's private plan for one league: the characters they are targeting
// and the lineup they intend to run. It never touches the server — it lives
// in this browser, keyed by league — so a plan is a scratchpad, not a claim.
//
// The lineup uses the same model as the Muddyball page: nine roster slots,
// one per fielding position, plus a batting order that permutes them.

import { useSyncExternalStore } from 'react';

// Where each fielder stands, in stadium data units (home plate at the origin,
// first base +X, outfield +Z). `place` in stadiumRender.ts pins them on the render.
export const FIELD_POSITIONS = [
	{ label: 'P', name: 'Pitcher', x: 0, z: 19 },
	{ label: 'C', name: 'Catcher', x: 0, z: -7 },
	{ label: '1B', name: 'First Base', x: 26, z: 25 },
	{ label: '2B', name: 'Second Base', x: 12, z: 41 },
	{ label: '3B', name: 'Third Base', x: -26, z: 25 },
	{ label: 'SS', name: 'Shortstop', x: -12, z: 41 },
	{ label: 'LF', name: 'Left Field', x: -37, z: 76 },
	{ label: 'CF', name: 'Center Field', x: 0, z: 86 },
	{ label: 'RF', name: 'Right Field', x: 37, z: 76 }
] as const;

export const ROSTER_SIZE = FIELD_POSITIONS.length;

export interface Plan {
	/** Asset ids, in the order they were starred. */
	targets: number[];
	/** Roster slot per fielding position (index into FIELD_POSITIONS). */
	roster: (number | null)[];
	/** Batting order: a permutation of roster slot indexes. */
	order: number[];
	stadium_id: number | null;
}

const EVENT = 'rio:draft-plan';
const cache = new Map<number, Plan>();

function key(leagueId: number) {
	return `rio:draft-plan:${leagueId}`;
}

export function emptyPlan(): Plan {
	return { targets: [], roster: Array<number | null>(ROSTER_SIZE).fill(null), order: FIELD_POSITIONS.map((_, index) => index), stadium_id: null };
}

function validOrder(order: unknown): order is number[] {
	return Array.isArray(order) && order.length === ROSTER_SIZE && [...order].sort((a, b) => a - b).every((value, index) => value === index);
}

function read(leagueId: number): Plan {
	const cached = cache.get(leagueId);
	if (cached) return cached;
	let plan = emptyPlan();
	if (typeof window !== 'undefined') {
		try {
			const raw = localStorage.getItem(key(leagueId));
			if (raw) {
				const parsed = JSON.parse(raw) as Partial<Plan>;
				plan = {
					targets: Array.isArray(parsed.targets) ? parsed.targets : [],
					roster: Array.isArray(parsed.roster) && parsed.roster.length === ROSTER_SIZE ? parsed.roster : plan.roster,
					order: validOrder(parsed.order) ? parsed.order : plan.order,
					stadium_id: parsed.stadium_id ?? null
				};
			}
		} catch {
			/* private mode */
		}
	}
	cache.set(leagueId, plan);
	return plan;
}

export function getPlan(leagueId: number): Plan {
	return read(leagueId);
}

export function setPlan(leagueId: number, patch: Partial<Plan>) {
	const next = { ...read(leagueId), ...patch };
	cache.set(leagueId, next);
	try {
		localStorage.setItem(key(leagueId), JSON.stringify(next));
	} catch {
		/* private mode */
	}
	window.dispatchEvent(new Event(EVENT));
}

export function toggleTarget(leagueId: number, assetId: number) {
	const plan = read(leagueId);
	const targets = plan.targets.includes(assetId) ? plan.targets.filter((id) => id !== assetId) : [...plan.targets, assetId];
	setPlan(leagueId, { targets });
}

/** Put a character in a specific slot (or the first empty one). Returns false when full. */
export function placeInRoster(leagueId: number, assetId: number, slot?: number): boolean {
	const plan = read(leagueId);
	const roster = [...plan.roster];
	const current = roster.indexOf(assetId);
	if (current >= 0) roster[current] = null;
	const target = slot ?? roster.indexOf(null);
	if (target < 0) return false;
	// Whatever sat in the target slot moves to where the character came from.
	if (current >= 0 && roster[target] !== null) roster[current] = roster[target];
	roster[target] = assetId;
	setPlan(leagueId, { roster });
	return true;
}

export function swapRosterSlots(leagueId: number, a: number, b: number) {
	const plan = read(leagueId);
	const roster = [...plan.roster];
	[roster[a], roster[b]] = [roster[b], roster[a]];
	setPlan(leagueId, { roster });
}

export function clearRosterSlot(leagueId: number, slot: number) {
	const plan = read(leagueId);
	setPlan(leagueId, { roster: plan.roster.map((id, index) => (index === slot ? null : id)) });
}

export function swapBattingOrder(leagueId: number, a: number, b: number) {
	const plan = read(leagueId);
	const order = [...plan.order];
	[order[a], order[b]] = [order[b], order[a]];
	setPlan(leagueId, { order });
}

/** Drop a character from the roster (it was lost, or un-starred). */
export function releaseFromLineup(leagueId: number, assetId: number) {
	const plan = read(leagueId);
	if (!plan.roster.includes(assetId) && plan.stadium_id !== assetId) return;
	setPlan(leagueId, {
		roster: plan.roster.map((id) => (id === assetId ? null : id)),
		stadium_id: plan.stadium_id === assetId ? null : plan.stadium_id
	});
}

function subscribe(callback: () => void) {
	window.addEventListener(EVENT, callback);
	window.addEventListener('storage', callback);
	return () => {
		window.removeEventListener(EVENT, callback);
		window.removeEventListener('storage', callback);
	};
}

const EMPTY = emptyPlan();

export function usePlan(leagueId: number): Plan {
	return useSyncExternalStore(
		subscribe,
		() => read(leagueId),
		() => EMPTY
	);
}
