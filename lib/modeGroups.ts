'use client';

// Grouping game modes for cross-mode analysis. Rio's tag sets are named by
// whoever created them, so the ruleset a mode actually uses is only recoverable
// from its name — "S14 Superstars Off", "Stars Off, Season 7", "Bobble:
// Stars-Off (Bracket)" and "Legacy Mode: Stars Off" are all the same ruleset.
//
// Facets are deliberately multi-label: "Stars Off Hazardous Randoms, Season 8"
// is stars-off AND hazards AND randoms. Names that don't state a ruleset
// ("Netplay Superstars 27", "Rookie Rumble XV") stay unclassified rather than
// being guessed at — they're still selectable one at a time.

import { useCallback, useEffect, useState } from 'react';
import type { TagSet } from './api';

export type Ruleset = 'stars-off' | 'stars-on' | 'big-balla';
export type Modifier = 'randoms' | 'hazards';

export interface ModeFacets {
	ruleset: Ruleset | null;
	modifiers: Modifier[];
}

// "Hazardless" contains "hazard" but means the opposite.
const HAZARDS = /hazard(?!less)/i;
const RANDOMS = /randoms/i;
const BIG_BALLA = /big[\s-]*balla/i;
const STARS_OFF = /(?:super)?stars[\s-]*off/i;
const STARS_ON = /(?:super)?stars[\s-]*on/i;

export function facetsOf(name: string): ModeFacets {
	const modifiers: Modifier[] = [];
	if (RANDOMS.test(name)) modifiers.push('randoms');
	if (HAZARDS.test(name)) modifiers.push('hazards');

	// Big Balla is its own ruleset and its names never also say stars on/off.
	let ruleset: Ruleset | null = null;
	if (BIG_BALLA.test(name)) ruleset = 'big-balla';
	else if (STARS_OFF.test(name)) ruleset = 'stars-off';
	else if (STARS_ON.test(name)) ruleset = 'stars-on';

	return { ruleset, modifiers };
}

// Modes that exist for warm-up, testing or fun rather than for record. Excluded
// from every predefined group so a group's numbers mean something.
const NON_COMPETITIVE = /practice|training|test|friendly|interim|quickplay|remixed/i;

export function isCompetitive(tagset: TagSet): boolean {
	return tagset.type !== 'Test' && !NON_COMPETITIVE.test(tagset.name);
}

export interface ModeGroup {
	id: string;
	label: string;
	hint: string;
	modes: string[];
}

// A predefined group is the competitive modes matching one ruleset, with the
// randoms/hazards variants split out — they change which characters are on the
// field and how the ball behaves, so folding them in would blur the read.
const RULESET_LABELS: Record<Ruleset, string> = {
	'stars-off': 'Superstars Off',
	'stars-on': 'Superstars On',
	'big-balla': 'Big Balla'
};

export function predefinedGroups(tagsets: TagSet[]): ModeGroup[] {
	const pool = tagsets.filter(isCompetitive);
	const groups: ModeGroup[] = [];

	for (const ruleset of Object.keys(RULESET_LABELS) as Ruleset[]) {
		const core = pool.filter((t) => {
			const f = facetsOf(t.name);
			return f.ruleset === ruleset && f.modifiers.length === 0;
		});
		if (core.length > 0) {
			groups.push({
				id: ruleset,
				label: RULESET_LABELS[ruleset],
				hint: `${core.length} competitive modes`,
				modes: core.map((t) => t.name)
			});
		}
	}

	for (const [modifier, label] of [
		['hazards', 'Hazards'],
		['randoms', 'Randoms']
	] as const) {
		const matching = pool.filter((t) => facetsOf(t.name).modifiers.includes(modifier));
		if (matching.length > 0) {
			groups.push({
				id: modifier,
				label,
				hint: `${matching.length} modes, any ruleset`,
				modes: matching.map((t) => t.name)
			});
		}
	}

	groups.push({
		id: 'competitive',
		label: 'All competitive',
		hint: `${pool.length} modes — practice, training and test excluded`,
		modes: pool.map((t) => t.name)
	});

	return groups;
}

// ---------- Custom groups ----------

const STORAGE_KEY = 'rio_mode_groups_v1';

export interface CustomGroup {
	id: string;
	label: string;
	modes: string[];
}

function readCustom(): CustomGroup[] {
	if (typeof window === 'undefined') return [];
	try {
		const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null');
		return Array.isArray(parsed) ? parsed : [];
	} catch {
		return [];
	}
}

// Every hook instance re-reads on change so two pickers on one page agree.
const listeners = new Set<() => void>();

function writeCustom(groups: CustomGroup[]) {
	try {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(groups));
	} catch {
		/* storage unavailable — the in-memory list still updates */
	}
	for (const listener of listeners) listener();
}

export function useCustomGroups(): {
	groups: CustomGroup[];
	save: (label: string, modes: string[]) => void;
	remove: (id: string) => void;
} {
	const [groups, setGroups] = useState<CustomGroup[]>([]);

	useEffect(() => {
		const sync = () => setGroups(readCustom());
		sync();
		listeners.add(sync);
		return () => {
			listeners.delete(sync);
		};
	}, []);

	const save = useCallback((label: string, modes: string[]) => {
		const trimmed = label.trim();
		if (!trimmed || modes.length === 0) return;
		const existing = readCustom();
		// Saving under an existing name overwrites it rather than duplicating.
		const next = existing.filter((g) => g.label.toLowerCase() !== trimmed.toLowerCase());
		next.push({ id: `custom-${Date.now()}`, label: trimmed, modes });
		writeCustom(next);
	}, []);

	const remove = useCallback((id: string) => {
		writeCustom(readCustom().filter((g) => g.id !== id));
	}, []);

	return { groups, save, remove };
}
