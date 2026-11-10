'use client';

// Per-contact landing data from /landing_data/: where every ball a character
// put in play actually went, with the swing frame and launch angle that sent
// it there. Fetched once per (mode, character-id set) and cached for the
// session — limit_games=False resolves every game in the tag.
//
// IMPORTANT: populate_db historically wrote the VERTICAL angle into the DB's
// ball_horiz_angle column and vice versa. /games/events/ un-swaps at the API
// boundary but /landing_data/ returns raw columns, so we un-swap here.

import { useEffect, useState } from 'react';
import { apiGet, STAT_ENDPOINTS } from './api';
import { resultCategory, type ResultCategory } from './gameEvents';

export interface LandingRow {
	gameId: number;
	eventNum: number;
	result: number; // result_of_ab (0 = the at-bat continued, i.e. a foul)
	category: ResultCategory;
	batterCharId: number;
	typeOfSwing: number; // 0 none, 1 slap, 2 charge, 3 star, 4 bunt
	typeOfContact: number; // 255 = miss
	frame: number; // frame_of_swing_upon_contact
	stick: StickInput; // control-stick hold at contact
	vertAngle: number; // TRUE vertical launch angle, game units (4096 = 360°)
	horizAngle: number;
	landingX: number;
	landingY: number;
	landingZ: number;
	contactX: number; // ball position at contact
	contactZ: number;
	contactAbsolute: number; // where on the bat, 0–200
	contactQuality: number;
	power: number;
	hangTime: number; // flight frames
	maxHeight: number;
	battingHand: boolean; // true = lefty
	chemLinks: number;
	mode: string; // which game mode this contact came from
}

// stick_input is a bitmask. Left+right and up+down are mutually exclusive in
// the hardware, so the nine reachable combinations decompose cleanly into an
// x and a y hold.
export const STICK_LEFT = 1;
export const STICK_RIGHT = 2;
export const STICK_DOWN = 4;
export const STICK_UP = 8;

export interface StickInput {
	mask: number;
	x: 'none' | 'left' | 'right';
	y: 'none' | 'up' | 'down';
}

export function decodeStick(mask: number): StickInput {
	return {
		mask,
		x: mask & STICK_LEFT ? 'left' : mask & STICK_RIGHT ? 'right' : 'none',
		y: mask & STICK_UP ? 'up' : mask & STICK_DOWN ? 'down' : 'none'
	};
}

// Hand-relative naming, mirroring calculateHorizontalAngle's stick -> pull/push
// table: holding LEFT is a pull for a righty and a push for a lefty, and right
// is the reverse. Confirmed against recorded landings — for a righty the
// left-stick mean sits to the 3B side of the neutral-stick mean and the
// right-stick mean well onto the 1B side, and lefty contacts mirror it.
// (batting_hand true really is a lefty: on a neutral stick an early contact
// frame sprays a righty toward 1B and a late one toward 3B, which is what
// BATTING_ANGLE_RANGES says, and true-flagged contacts do the opposite.)
export function stickLabel(stick: StickInput, lefty: boolean): string {
	const x =
		stick.x === 'none' ? null : (stick.x === 'left') !== lefty ? 'Pull' : 'Push';
	const y = stick.y === 'none' ? null : stick.y === 'up' ? 'Up' : 'Down';
	if (!x && !y) return 'Neutral';
	return [x, y].filter(Boolean).join(' + ');
}

// Raw shorts can wrap; anything past half a rotation is a negative angle.
function signedAngle(value: number): number {
	return value > 2048 ? value - 4096 : value;
}

const cache = new Map<string, Promise<LandingRow[]>>();

export function fetchLandingData(modeName: string, charIds: number[]): Promise<LandingRow[]> {
	const key = `${modeName.toLowerCase()}|${[...charIds].sort((a, b) => a - b).join(',')}`;
	let promise = cache.get(key);
	if (!promise) {
		const params =
			`?limit_games=False&tag=${encodeURIComponent(modeName)}` +
			charIds.map((id) => `&batter_char=${id}`).join('');
		promise = apiGet(STAT_ENDPOINTS.LANDING_DATA, params).then((res) => {
			const rows: LandingRow[] = [];
			for (const r of res?.Data ?? []) {
				// Keep only real contact with a recorded landing spot.
				if (r.type_of_contact == null || r.type_of_contact === 255) continue;
				if (r.ball_x_landing_pos == null) continue;
				rows.push({
					gameId: r.game_id,
					eventNum: r.event_num,
					result: r.final_result ?? 0,
					category: resultCategory(r.final_result ?? 0),
					batterCharId: r.batter_char_id,
					typeOfSwing: r.type_of_swing ?? 0,
					typeOfContact: r.type_of_contact,
					frame: r.frame_of_swing ?? 0,
					stick: decodeStick(r.stick_input ?? 0),
					vertAngle: signedAngle(r.ball_horiz_angle ?? 0), // un-swap (see header)
					horizAngle: signedAngle(r.ball_vert_angle ?? 0),
					landingX: r.ball_x_landing_pos,
					landingY: r.ball_y_landing_pos ?? 0,
					landingZ: r.ball_z_landing_pos,
					contactX: r.ball_x_contact_pos ?? 0,
					contactZ: r.ball_z_contact_pos ?? 0,
					contactAbsolute: r.contact_absolute ?? 0,
					contactQuality: r.contact_quality ?? 0,
					power: r.ball_power ?? 0,
					hangTime: r.ball_hang_time ?? 0,
					maxHeight: r.ball_max_height ?? 0,
					battingHand: !!r.batting_hand,
					chemLinks: r.chem_links_ob ?? 0,
					mode: modeName
				});
			}
			return rows;
		});
		cache.set(key, promise);
		promise.catch(() => cache.delete(key));
	}
	return promise;
}

export function useLandingData(modeName: string, charIds: number[]): {
	rows: LandingRow[] | null;
	loading: boolean;
	error: string | null;
} {
	const [state, setState] = useState<{
		rows: LandingRow[] | null;
		loading: boolean;
		error: string | null;
	}>({ rows: null, loading: true, error: null });

	const idsKey = charIds.join(',');
	useEffect(() => {
		let cancelled = false;
		setState({ rows: null, loading: true, error: null });
		fetchLandingData(modeName, idsKey === '' ? [] : idsKey.split(',').map(Number))
			.then((rows) => {
				if (!cancelled) setState({ rows, loading: false, error: null });
			})
			.catch(() => {
				if (!cancelled)
					setState({ rows: null, loading: false, error: 'Could not load landing data.' });
			});
		return () => {
			cancelled = true;
		};
	}, [modeName, idsKey]);

	return state;
}

// ---------- Multiple modes ----------

// Each mode is fetched (and cached) on its own so an arbitrary group is just a
// union of already-paid-for fetches: adding a season to a group only costs the
// season that wasn't loaded yet. Concurrency is capped because a full season
// for one character is several MB and the API doesn't compress responses.
const MAX_PARALLEL_MODES = 3;

export interface MultiModeState {
	rows: LandingRow[] | null;
	loading: boolean;
	loaded: number; // modes resolved so far
	total: number;
	error: string | null;
}

export function useLandingDataModes(modeNames: string[], charIds: number[]): MultiModeState {
	const [state, setState] = useState<MultiModeState>({
		rows: null,
		loading: modeNames.length > 0,
		loaded: 0,
		total: modeNames.length,
		error: null
	});

	// Modes are joined with the NUL escape, not a space: mode names contain
	// spaces and commas ("Stars Off, Season 7"), so any printable delimiter
	// would make two different selections collide.
	const modesKey = modeNames.join('\u0000');
	const idsKey = charIds.join(',');

	useEffect(() => {
		const modes = modesKey === '' ? [] : modesKey.split('\u0000');
		const ids = idsKey === '' ? [] : idsKey.split(',').map(Number);

		if (modes.length === 0) {
			setState({ rows: [], loading: false, loaded: 0, total: 0, error: null });
			return;
		}

		let cancelled = false;
		setState({ rows: null, loading: true, loaded: 0, total: modes.length, error: null });

		const collected: LandingRow[][] = [];
		const reasons: string[] = [];
		let failures = 0;
		let done = 0;
		let next = 0;

		function pump(): Promise<void> {
			const index = next++;
			if (index >= modes.length) return Promise.resolve();
			return fetchLandingData(modes[index], ids)
				.then((rows) => {
					collected.push(rows);
				})
				.catch((err) => {
					failures += 1;
					// Keep the server's own explanation — "Unknown tag(s)" means the
					// mode list came from a different backend, which is worth saying
					// out loud rather than reporting as a generic failure.
					const reason = err?.reason ?? err?.message;
					if (reason && !reasons.includes(reason)) reasons.push(reason);
				})
				.then(() => {
					done += 1;
					if (!cancelled) setState((prev) => ({ ...prev, loaded: done }));
					return pump();
				});
		}

		Promise.all(
			Array.from({ length: Math.min(MAX_PARALLEL_MODES, modes.length) }, () => pump())
		).then(() => {
			if (cancelled) return;
			if (failures === modes.length) {
				setState({
					rows: null,
					loading: false,
					loaded: done,
					total: modes.length,
					error: `Could not load landing data. ${reasons.join(' · ')}`.trim()
				});
				return;
			}
			// A game can belong to more than one tag set, so the same contact can
			// arrive twice when a group spans overlapping modes.
			const seen = new Set<string>();
			const merged: LandingRow[] = [];
			for (const batch of collected) {
				for (const row of batch) {
					const key = `${row.gameId}:${row.eventNum}`;
					if (seen.has(key)) continue;
					seen.add(key);
					merged.push(row);
				}
			}
			setState({
				rows: merged,
				loading: false,
				loaded: done,
				total: modes.length,
				error:
					failures > 0
						? `${failures} of ${modes.length} modes failed to load — showing the rest.${
								reasons.length > 0 ? ` ${reasons.join(' · ')}` : ''
							}`
						: null
			});
		});

		return () => {
			cancelled = true;
		};
	}, [modesKey, idsKey]);

	return state;
}

// ---------- Aggregation ----------

// Batting average on balls put in play: hits over at-bat-ending contacts
// (reached-on-error counts as an at-bat without a hit, like real BA).
export interface BaBucket {
	key: string | number;
	label: string;
	ab: number;
	hits: number;
	ba: number | null;
}

export function battingAverage(rows: LandingRow[]): { ab: number; hits: number; ba: number | null } {
	let ab = 0;
	let hits = 0;
	for (const row of rows) {
		if (row.category === 'hit' || row.category === 'hr') {
			ab += 1;
			hits += 1;
		} else if (row.category === 'out' || row.category === 'error') {
			ab += 1;
		}
	}
	return { ab, hits, ba: ab > 0 ? hits / ab : null };
}

export function baByFrame(rows: LandingRow[]): BaBucket[] {
	const frames = new Map<number, LandingRow[]>();
	for (const row of rows) {
		if (!frames.has(row.frame)) frames.set(row.frame, []);
		frames.get(row.frame)!.push(row);
	}
	return [...frames.entries()]
		.sort((a, b) => a[0] - b[0])
		.map(([frame, group]) => {
			const { ab, hits, ba } = battingAverage(group);
			return { key: frame, label: String(frame), ab, hits, ba };
		});
}

// Launch-angle buckets in game units (4096 = 360°; 100 units ≈ 8.8°).
export const VERT_BUCKETS = [
	{ key: 'ground', label: 'Grounder', deg: '< 4°', min: -Infinity, max: 50 },
	{ key: 'low', label: 'Low liner', deg: '4–13°', min: 50, max: 150 },
	{ key: 'liner', label: 'Liner', deg: '13–26°', min: 150, max: 300 },
	{ key: 'fly', label: 'Fly ball', deg: '26–44°', min: 300, max: 500 },
	{ key: 'pop', label: 'Pop-up', deg: '≥ 44°', min: 500, max: Infinity }
] as const;

export type VertBucketKey = (typeof VERT_BUCKETS)[number]['key'];

export function vertBucketOf(vertAngle: number): VertBucketKey {
	for (const bucket of VERT_BUCKETS) {
		if (vertAngle >= bucket.min && vertAngle < bucket.max) return bucket.key;
	}
	return 'pop';
}

export function baByVertBucket(rows: LandingRow[]): BaBucket[] {
	return VERT_BUCKETS.map((bucket) => {
		const group = rows.filter((row) => vertBucketOf(row.vertAngle) === bucket.key);
		const { ab, hits, ba } = battingAverage(group);
		return { key: bucket.key, label: bucket.label, ab, hits, ba };
	});
}

export function formatBa(ba: number | null): string {
	if (ba === null) return '—';
	return ba.toFixed(3).replace(/^0/, '');
}

// ---------- Swing buckets ----------

// Total bases for slugging. result_of_ab distinguishes the hit types that
// resultCategory() collapses into one 'hit' bucket.
const TOTAL_BASES: Record<number, number> = {
	0x7: 1, // single
	0xd: 1, // bunt single
	0x8: 2, // double
	0x9: 3, // triple
	0xa: 4 // HR
};

export interface SwingStats {
	contacts: number; // every recorded contact, fouls included
	fouls: number; // contact that didn't end the at-bat
	ab: number;
	hits: number;
	totalBases: number;
	homers: number;
	ba: number | null;
	slg: number | null;
	foulRate: number | null;
	avgPower: number | null;
	avgDistance: number | null;
}

export function swingStats(rows: LandingRow[]): SwingStats {
	let ab = 0;
	let hits = 0;
	let totalBases = 0;
	let homers = 0;
	let fouls = 0;
	let powerSum = 0;
	let distanceSum = 0;

	for (const row of rows) {
		powerSum += row.power;
		distanceSum += Math.hypot(row.landingX, row.landingZ);

		// result 0 means the at-bat carried on: the contact was a foul.
		if (row.result === 0) {
			fouls += 1;
			continue;
		}
		if (row.category === 'hit' || row.category === 'hr') {
			ab += 1;
			hits += 1;
			totalBases += TOTAL_BASES[row.result] ?? 1;
			if (row.category === 'hr') homers += 1;
		} else if (row.category === 'out' || row.category === 'error') {
			ab += 1;
		}
	}

	const contacts = rows.length;
	return {
		contacts,
		fouls,
		ab,
		hits,
		totalBases,
		homers,
		ba: ab > 0 ? hits / ab : null,
		slg: ab > 0 ? totalBases / ab : null,
		foulRate: contacts > 0 ? fouls / contacts : null,
		avgPower: contacts > 0 ? powerSum / contacts : null,
		avgDistance: contacts > 0 ? distanceSum / contacts : null
	};
}

export interface SwingBucket<K> extends SwingStats {
	key: K;
	label: string;
	rows: LandingRow[];
}

// Group by any facet of a contact and rank the result. Buckets thinner than
// minAb are kept (the caller still wants to see them greyed out) but callers
// sort with sortBuckets(), which parks them at the bottom.
export function bucketBy<K>(
	rows: LandingRow[],
	keyOf: (row: LandingRow) => K,
	labelOf: (key: K, rows: LandingRow[]) => string
): SwingBucket<K>[] {
	const groups = new Map<string, { key: K; rows: LandingRow[] }>();
	for (const row of rows) {
		const key = keyOf(row);
		const id = String(key);
		let group = groups.get(id);
		if (!group) {
			group = { key, rows: [] };
			groups.set(id, group);
		}
		group.rows.push(row);
	}
	return [...groups.values()].map(({ key, rows: group }) => ({
		key,
		label: labelOf(key, group),
		rows: group,
		...swingStats(group)
	}));
}

export type RankMetric = 'ba' | 'slg';

// Rank by the chosen rate, but never let a 2-for-2 outrank a real sample:
// anything under minAb sinks below every qualified bucket.
export function sortBuckets<K>(
	buckets: SwingBucket<K>[],
	metric: RankMetric,
	minAb: number
): SwingBucket<K>[] {
	return [...buckets].sort((a, b) => {
		const aQualified = a.ab >= minAb;
		const bQualified = b.ab >= minAb;
		if (aQualified !== bQualified) return aQualified ? -1 : 1;
		return (b[metric] ?? -1) - (a[metric] ?? -1);
	});
}

export const SWING_TYPES: Record<number, string> = {
	0: 'None',
	1: 'Slap',
	2: 'Charge',
	3: 'Star',
	4: 'Bunt'
};

// type_of_contact as the game records it, sour through perfect.
export const CONTACT_TYPES: Record<number, string> = {
	0: 'Sour left',
	1: 'Nice left',
	2: 'Perfect',
	3: 'Nice right',
	4: 'Sour right'
};
