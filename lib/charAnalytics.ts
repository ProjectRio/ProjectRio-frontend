'use client';

// Character win-rate analytics: fetch full game lists per game mode (cached for
// the session), flatten each game into two team-perspective rows, then filter
// and aggregate entirely client-side. The headline metric is Wins Above
// Expected (WAE): actual wins minus the ELO-implied win probability summed over
// the same games, i.e. "does this character win more than the players picking
// it should?" Unranked games (no ELO recorded) count as 50/50.

import { useEffect, useRef, useState } from 'react';
import { apiGet, STAT_ENDPOINTS, type GameSummary } from './api';
import { characters, characterClasses, type CharacterClass } from './data/characters';

// ---------- Fetching & caching ----------

const modeGamesCache = new Map<string, Promise<GameSummary[]>>();

export function fetchModeGames(modeName: string): Promise<GameSummary[]> {
	const key = modeName.toLowerCase();
	let promise = modeGamesCache.get(key);
	if (!promise) {
		promise = apiGet(
			STAT_ENDPOINTS.GAMES,
			`?limit_games=False&tag=${encodeURIComponent(modeName)}`
		).then((res) => res.games ?? []);
		modeGamesCache.set(key, promise);
		promise.catch(() => modeGamesCache.delete(key));
	}
	return promise;
}

// Loads every selected mode (each cached individually so adding a mode never
// refetches the others) and reports per-mode progress while large modes stream in.
export function useModesGames(modeNames: string[]): {
	games: GameSummary[] | null;
	loading: boolean;
	loadedCount: number;
	error: string | null;
} {
	const [state, setState] = useState<{
		games: GameSummary[] | null;
		loading: boolean;
		loadedCount: number;
		error: string | null;
	}>({ games: null, loading: false, loadedCount: 0, error: null });
	const requestId = useRef(0);

	const namesKey = modeNames.join('\u0000');
	useEffect(() => {
		const id = ++requestId.current;
		const names = namesKey === '' ? [] : namesKey.split('\u0000');
		if (names.length === 0) {
			setState({ games: [], loading: false, loadedCount: 0, error: null });
			return;
		}
		setState({ games: null, loading: true, loadedCount: 0, error: null });
		let loaded = 0;
		const results: GameSummary[][] = [];
		Promise.all(
			names.map((name) =>
				fetchModeGames(name).then((games) => {
					loaded += 1;
					results.push(games);
					if (requestId.current === id) {
						setState((prev) => ({ ...prev, loadedCount: loaded }));
					}
				})
			)
		)
			.then(() => {
				if (requestId.current !== id) return;
				// Dedupe by game_id in case selected modes overlap.
				const byId = new Map<number, GameSummary>();
				for (const list of results) {
					for (const game of list) byId.set(game.game_id, game);
				}
				setState({ games: [...byId.values()], loading: false, loadedCount: loaded, error: null });
			})
			.catch(() => {
				if (requestId.current !== id) return;
				setState({
					games: null,
					loading: false,
					loadedCount: loaded,
					error: 'Could not load games for the selected modes.'
				});
			});
	}, [namesKey]);

	return state;
}

// ---------- Team-perspective rows ----------

export interface TeamRow {
	gameId: number;
	date: number;
	modeId: number | null;
	stadium: number | null;
	user: string;
	userLower: string;
	oppUser: string;
	oppUserLower: string;
	captainId: number | null;
	oppCaptainId: number | null;
	roster: number[];
	rosterSet: Set<number>;
	oppRosterSet: Set<number>;
	won: boolean;
	scoreFor: number;
	scoreAgainst: number;
	elo: number | null;
	oppElo: number | null;
	// ELO-implied probability this team wins; 0.5 when either rating is missing.
	expWin: number;
	ranked: boolean;
}

const nameToId = new Map<string, number>(
	Object.entries(characters).map(([id, name]) => [normalizeName(name), Number(id)])
);

function normalizeName(name: string): string {
	return name.toLowerCase().replace(/[^a-z0-9]/g, '');
}

export function captainCharId(name: string | undefined | null): number | null {
	if (!name) return null;
	return nameToId.get(normalizeName(name)) ?? null;
}

function cleanRoster(roster: unknown): number[] {
	if (!roster) return [];
	return (Object.values(roster) as unknown[]).filter(
		(charId): charId is number => typeof charId === 'number' && charId in characters
	) as number[];
}

export function buildTeamRows(games: GameSummary[]): TeamRow[] {
	const rows: TeamRow[] = [];
	for (const game of games) {
		const homeWon = game.home_score > game.away_score;
		const winnerElo = game.winner_incoming_elo ?? null;
		const loserElo = game.loser_incoming_elo ?? null;
		const awayRoster = cleanRoster(game.away_roster);
		const homeRoster = cleanRoster(game.home_roster);
		const awaySet = new Set(awayRoster);
		const homeSet = new Set(homeRoster);
		const date = game.date_time_end ?? game.date_time_start ?? 0;

		for (const side of ['away', 'home'] as const) {
			const won = side === 'home' ? homeWon : !homeWon;
			const elo = won ? winnerElo : loserElo;
			const oppElo = won ? loserElo : winnerElo;
			const ranked = elo != null && oppElo != null;
			rows.push({
				gameId: game.game_id,
				date,
				modeId: game.game_mode ?? null,
				stadium: (game as any).stadium ?? null,
				user: side === 'home' ? game.home_user : game.away_user,
				userLower: (side === 'home' ? game.home_user : game.away_user)?.toLowerCase() ?? '',
				oppUser: side === 'home' ? game.away_user : game.home_user,
				oppUserLower: (side === 'home' ? game.away_user : game.home_user)?.toLowerCase() ?? '',
				captainId: captainCharId(side === 'home' ? game.home_captain : game.away_captain),
				oppCaptainId: captainCharId(side === 'home' ? game.away_captain : game.home_captain),
				roster: side === 'home' ? homeRoster : awayRoster,
				rosterSet: side === 'home' ? homeSet : awaySet,
				oppRosterSet: side === 'home' ? awaySet : homeSet,
				won,
				scoreFor: side === 'home' ? game.home_score : game.away_score,
				scoreAgainst: side === 'home' ? game.away_score : game.home_score,
				elo,
				oppElo,
				expWin: ranked ? 1 / (1 + Math.pow(10, (oppElo! - elo!) / 400)) : 0.5,
				ranked
			});
		}
	}
	return rows;
}

// ---------- Filters ----------

export interface AnalyticsFilters {
	// Character constraints on the analyzed team's 9-character roster.
	teamAll: number[]; // roster must contain every one of these
	teamAny: number[]; // roster must contain at least one of these
	teamNone: number[]; // roster must contain none of these
	// Same constraints applied to the opposing roster.
	oppAll: number[];
	oppNone: number[];
	captains: number[]; // analyzed team's captain must be one of these
	oppCaptains: number[];
	players: string[]; // analyzed team's player must be one of these
	excludePlayers: string[]; // drop rows for these players entirely
	vsPlayers: string[]; // opponent must be one of these
	eloMin: number | null; // bounds on the analyzed team's pre-game rating
	eloMax: number | null;
	rankedOnly: boolean;
	dateFrom: number | null; // unix seconds
	dateTo: number | null;
	stadiums: number[];
}

export const EMPTY_FILTERS: AnalyticsFilters = {
	teamAll: [],
	teamAny: [],
	teamNone: [],
	oppAll: [],
	oppNone: [],
	captains: [],
	oppCaptains: [],
	players: [],
	excludePlayers: [],
	vsPlayers: [],
	eloMin: null,
	eloMax: null,
	rankedOnly: false,
	dateFrom: null,
	dateTo: null,
	stadiums: []
};

export function countActiveFilters(filters: AnalyticsFilters): number {
	let count = 0;
	if (filters.teamAll.length) count++;
	if (filters.teamAny.length) count++;
	if (filters.teamNone.length) count++;
	if (filters.oppAll.length) count++;
	if (filters.oppNone.length) count++;
	if (filters.captains.length) count++;
	if (filters.oppCaptains.length) count++;
	if (filters.players.length) count++;
	if (filters.excludePlayers.length) count++;
	if (filters.vsPlayers.length) count++;
	if (filters.eloMin != null || filters.eloMax != null) count++;
	if (filters.rankedOnly) count++;
	if (filters.dateFrom != null || filters.dateTo != null) count++;
	if (filters.stadiums.length) count++;
	return count;
}

export function applyFilters(rows: TeamRow[], filters: AnalyticsFilters): TeamRow[] {
	const players = new Set(filters.players.map((name) => name.toLowerCase()));
	const excludePlayers = new Set(filters.excludePlayers.map((name) => name.toLowerCase()));
	const vsPlayers = new Set(filters.vsPlayers.map((name) => name.toLowerCase()));
	const captains = new Set(filters.captains);
	const oppCaptains = new Set(filters.oppCaptains);
	const stadiums = new Set(filters.stadiums);

	return rows.filter((row) => {
		if (filters.teamAll.some((charId) => !row.rosterSet.has(charId))) return false;
		if (filters.teamAny.length > 0 && !filters.teamAny.some((charId) => row.rosterSet.has(charId)))
			return false;
		if (filters.teamNone.some((charId) => row.rosterSet.has(charId))) return false;
		if (filters.oppAll.some((charId) => !row.oppRosterSet.has(charId))) return false;
		if (filters.oppNone.some((charId) => row.oppRosterSet.has(charId))) return false;
		if (captains.size > 0 && (row.captainId === null || !captains.has(row.captainId))) return false;
		if (oppCaptains.size > 0 && (row.oppCaptainId === null || !oppCaptains.has(row.oppCaptainId)))
			return false;
		if (players.size > 0 && !players.has(row.userLower)) return false;
		if (excludePlayers.has(row.userLower) || excludePlayers.has(row.oppUserLower)) return false;
		if (vsPlayers.size > 0 && !vsPlayers.has(row.oppUserLower)) return false;
		if (filters.rankedOnly && !row.ranked) return false;
		if (filters.eloMin != null && (row.elo === null || row.elo < filters.eloMin)) return false;
		if (filters.eloMax != null && (row.elo === null || row.elo > filters.eloMax)) return false;
		if (filters.dateFrom != null && row.date < filters.dateFrom) return false;
		if (filters.dateTo != null && row.date > filters.dateTo) return false;
		if (stadiums.size > 0 && (row.stadium === null || !stadiums.has(row.stadium))) return false;
		return true;
	});
}

// ---------- Character aggregation ----------

// A "group" is what a table row represents: a single character, or all color
// variants of one character when variant grouping is on.
export interface CharGroup {
	key: string;
	name: string;
	charIds: number[];
	portraitName: string; // canonical character image for the group
	charClass: CharacterClass | null;
}

export function characterGroups(groupVariants: boolean): CharGroup[] {
	if (!groupVariants) {
		return Object.entries(characters).map(([id, name]) => ({
			key: id,
			name,
			charIds: [Number(id)],
			portraitName: name,
			charClass: characterClasses[name]?.Class ?? null
		}));
	}
	const groups = new Map<string, CharGroup>();
	for (const [id, name] of Object.entries(characters)) {
		const simplified = characterClasses[name]?.SimplifiedName ?? name;
		let group = groups.get(simplified);
		if (!group) {
			group = {
				key: `g:${simplified}`,
				name: simplified,
				charIds: [],
				portraitName: name,
				charClass: characterClasses[name]?.Class ?? null
			};
			groups.set(simplified, group);
		}
		group.charIds.push(Number(id));
	}
	return [...groups.values()];
}

export interface CharAgg {
	group: CharGroup;
	games: number; // team-games where the group appears on the analyzed side
	wins: number;
	losses: number;
	winPct: number; // wins / games
	expWins: number; // sum of ELO-implied win probability over the same games
	expWinPct: number;
	wae: number; // wins - expWins
	waeRate: number; // percentage points above expectation: winPct - expWinPct
	pickPct: number; // games / total team rows
	captainGames: number;
	captainWins: number;
	captainPct: number; // captainGames / games
	mirrorGames: number; // games where the group appeared on both rosters
	rankedGames: number;
	avgElo: number | null; // mean rating of players picking it (ranked games only)
}

export function charStats(
	rows: TeamRow[],
	groups: CharGroup[],
	excludeMirrors: boolean
): CharAgg[] {
	const totalRows = rows.length;
	const byId = new Map<number, CharAgg>();
	const aggs: CharAgg[] = groups.map((group) => {
		const agg: CharAgg = {
			group,
			games: 0,
			wins: 0,
			losses: 0,
			winPct: 0,
			expWins: 0,
			expWinPct: 0,
			wae: 0,
			waeRate: 0,
			pickPct: 0,
			captainGames: 0,
			captainWins: 0,
			captainPct: 0,
			mirrorGames: 0,
			rankedGames: 0,
			avgElo: null
		};
		for (const charId of group.charIds) byId.set(charId, agg);
		return agg;
	});

	const eloSums = new Map<CharAgg, number>();
	for (const row of rows) {
		// Aggregate per group at most once per row (two Toad variants on one
		// roster is still one appearance of the "Toad" group).
		const seen = new Set<CharAgg>();
		for (const charId of row.rosterSet) {
			const agg = byId.get(charId);
			if (!agg || seen.has(agg)) continue;
			seen.add(agg);
			const mirror = agg.group.charIds.some((id) => row.oppRosterSet.has(id));
			if (mirror) agg.mirrorGames += 1;
			if (mirror && excludeMirrors) continue;
			agg.games += 1;
			if (row.won) agg.wins += 1;
			else agg.losses += 1;
			agg.expWins += row.expWin;
			if (row.ranked) {
				agg.rankedGames += 1;
				eloSums.set(agg, (eloSums.get(agg) ?? 0) + row.elo!);
			}
			if (row.captainId !== null && agg.group.charIds.includes(row.captainId)) {
				agg.captainGames += 1;
				if (row.won) agg.captainWins += 1;
			}
		}
	}

	for (const agg of aggs) {
		if (agg.games > 0) {
			agg.winPct = agg.wins / agg.games;
			agg.expWinPct = agg.expWins / agg.games;
			agg.wae = agg.wins - agg.expWins;
			agg.waeRate = agg.winPct - agg.expWinPct;
			agg.captainPct = agg.captainGames / agg.games;
			agg.pickPct = totalRows > 0 ? agg.games / totalRows : 0;
		}
		const eloSum = eloSums.get(agg);
		agg.avgElo = agg.rankedGames > 0 && eloSum !== undefined ? eloSum / agg.rankedGames : null;
	}
	return aggs.filter((agg) => agg.games > 0);
}

// ---------- Pair (synergy) aggregation ----------

export interface PairAgg {
	a: CharGroup;
	b: CharGroup;
	games: number;
	wins: number;
	winPct: number;
	expWinPct: number;
	waeRate: number;
}

export function pairStats(
	rows: TeamRow[],
	groups: CharGroup[],
	excludeMirrors: boolean
): PairAgg[] {
	const byId = new Map<number, number>(); // charId -> group index
	groups.forEach((group, index) => {
		for (const charId of group.charIds) byId.set(charId, index);
	});
	const pairMap = new Map<number, { games: number; wins: number; expWins: number }>();

	for (const row of rows) {
		const groupIndexes = new Set<number>();
		for (const charId of row.rosterSet) {
			const index = byId.get(charId);
			if (index !== undefined) groupIndexes.add(index);
		}
		let indexes = [...groupIndexes];
		if (excludeMirrors) {
			indexes = indexes.filter(
				(index) => !groups[index].charIds.some((id) => row.oppRosterSet.has(id))
			);
		}
		indexes.sort((x, y) => x - y);
		for (let i = 0; i < indexes.length; i++) {
			for (let j = i + 1; j < indexes.length; j++) {
				const key = indexes[i] * 1024 + indexes[j];
				let entry = pairMap.get(key);
				if (!entry) {
					entry = { games: 0, wins: 0, expWins: 0 };
					pairMap.set(key, entry);
				}
				entry.games += 1;
				if (row.won) entry.wins += 1;
				entry.expWins += row.expWin;
			}
		}
	}

	const pairs: PairAgg[] = [];
	for (const [key, entry] of pairMap) {
		const a = groups[Math.floor(key / 1024)];
		const b = groups[key % 1024];
		pairs.push({
			a,
			b,
			games: entry.games,
			wins: entry.wins,
			winPct: entry.wins / entry.games,
			expWinPct: entry.expWins / entry.games,
			waeRate: entry.wins / entry.games - entry.expWins / entry.games
		});
	}
	return pairs;
}

// ---------- Selected-character detail ----------

export interface VsAgg {
	group: CharGroup;
	games: number;
	wins: number;
	winPct: number;
	expWinPct: number;
	waeRate: number;
}

// Rows where the subject group is on the analyzed side; broken down by which
// groups appear on the OPPOSING roster (kind='vs') or alongside it (kind='with').
export function companionStats(
	rows: TeamRow[],
	groups: CharGroup[],
	subject: CharGroup,
	kind: 'vs' | 'with',
	excludeMirrors: boolean
): VsAgg[] {
	const subjectIds = new Set(subject.charIds);
	const byId = new Map<number, number>();
	groups.forEach((group, index) => {
		for (const charId of group.charIds) byId.set(charId, index);
	});
	const counts = new Map<number, { games: number; wins: number; expWins: number }>();

	for (const row of rows) {
		const onTeam = row.roster.some((charId) => subjectIds.has(charId));
		if (!onTeam) continue;
		if (excludeMirrors && subject.charIds.some((id) => row.oppRosterSet.has(id))) continue;
		const source = kind === 'vs' ? row.oppRosterSet : row.rosterSet;
		const seen = new Set<number>();
		for (const charId of source) {
			if (kind === 'with' && subjectIds.has(charId)) continue;
			const index = byId.get(charId);
			if (index === undefined || seen.has(index)) continue;
			seen.add(index);
			let entry = counts.get(index);
			if (!entry) {
				entry = { games: 0, wins: 0, expWins: 0 };
				counts.set(index, entry);
			}
			entry.games += 1;
			if (row.won) entry.wins += 1;
			entry.expWins += row.expWin;
		}
	}

	const result: VsAgg[] = [];
	for (const [index, entry] of counts) {
		result.push({
			group: groups[index],
			games: entry.games,
			wins: entry.wins,
			winPct: entry.wins / entry.games,
			expWinPct: entry.expWins / entry.games,
			waeRate: entry.wins / entry.games - entry.expWins / entry.games
		});
	}
	return result;
}

// ---------- ELO bands ----------

export interface EloBand {
	label: string;
	min: number;
	max: number;
	games: number;
	wins: number;
	winPct: number;
	expWinPct: number;
}

// Win rate for a group by the picking player's pre-game rating, in quantile
// bands computed from the filtered pool so the bands match the population on
// screen rather than hardcoded rating cutoffs.
export function eloBandStats(rows: TeamRow[], subject: CharGroup | null, bandCount = 5): EloBand[] {
	const ranked = rows.filter((row) => row.ranked);
	if (ranked.length < bandCount * 4) return [];
	const sorted = ranked.map((row) => row.elo!).sort((a, b) => a - b);
	const cutoffs: number[] = [];
	for (let i = 1; i < bandCount; i++) {
		cutoffs.push(sorted[Math.floor((i * sorted.length) / bandCount)]);
	}

	const subjectIds = subject ? new Set(subject.charIds) : null;
	const bands: EloBand[] = [];
	for (let i = 0; i < bandCount; i++) {
		const min = i === 0 ? sorted[0] : cutoffs[i - 1];
		const max = i === bandCount - 1 ? sorted[sorted.length - 1] : cutoffs[i];
		bands.push({
			label: `${Math.round(min)}–${Math.round(max)}`,
			min,
			max,
			games: 0,
			wins: 0,
			winPct: 0,
			expWinPct: 0
		});
	}

	const expSums = new Array(bandCount).fill(0);
	for (const row of ranked) {
		if (subjectIds && !row.roster.some((charId) => subjectIds.has(charId))) continue;
		let index = cutoffs.findIndex((cutoff) => row.elo! < cutoff);
		if (index === -1) index = bandCount - 1;
		bands[index].games += 1;
		if (row.won) bands[index].wins += 1;
		expSums[index] += row.expWin;
	}
	bands.forEach((band, index) => {
		if (band.games > 0) {
			band.winPct = band.wins / band.games;
			band.expWinPct = expSums[index] / band.games;
		}
	});
	return bands;
}

// ---------- Monthly trend for a group ----------

export interface MonthPoint {
	label: string;
	games: number;
	winPct: number;
}

export function monthlyTrend(rows: TeamRow[], subject: CharGroup, months = 12): MonthPoint[] {
	const subjectIds = new Set(subject.charIds);
	const buckets = new Map<string, { label: string; games: number; wins: number; order: number }>();
	for (const row of rows) {
		if (!row.date || !row.roster.some((charId) => subjectIds.has(charId))) continue;
		const date = new Date(row.date * 1000);
		const key = `${date.getFullYear()}-${date.getMonth()}`;
		let bucket = buckets.get(key);
		if (!bucket) {
			bucket = {
				label: date.toLocaleDateString(undefined, { month: 'short', year: '2-digit' }),
				games: 0,
				wins: 0,
				order: date.getFullYear() * 12 + date.getMonth()
			};
			buckets.set(key, bucket);
		}
		bucket.games += 1;
		if (row.won) bucket.wins += 1;
	}
	return [...buckets.values()]
		.sort((a, b) => a.order - b.order)
		.slice(-months)
		.map((bucket) => ({
			label: bucket.label,
			games: bucket.games,
			winPct: bucket.games > 0 ? bucket.wins / bucket.games : 0
		}));
}
