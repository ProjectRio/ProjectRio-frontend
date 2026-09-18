// NNL — five seasons of a manager-mode league, exported from the league's
// tracking workbook (scratch script export_nnl.py). Season 9 carries the full
// schedule, playoff bracket and every character line; seasons 5–8 carry team
// records and character lines only, since their schedules were never migrated.

import season9 from './data/nnl-season-9.json';
import allTime from './data/nnl-all-time.json';
import { characterClasses } from '@/lib/data/characters';
import { teamName } from '@/lib/data/teamNames';
import { standings } from './stats';
import type { Bracket, BracketMatch, CharacterLine, Competition, CompetitionGame, Entrant, FileStatus, Fixture, PriceSample, RosterSlot, SeasonCharacterLine, SeasonTeamLine } from './types';

const CAPTAINS = new Set(['Mario', 'Luigi', 'Peach', 'Daisy', 'Yoshi', 'Birdo', 'Wario', 'Waluigi', 'DK', 'Diddy', 'Bowser', 'Bowser Jr']);
const STADIUM_NAMES = ['Mario Stadium', 'Bowser Castle', 'Wario Palace', 'Yoshi Park', 'Peach Garden', 'DK Jungle', 'Toy Field'];
const YEAR = 2026;

const FILE_STATUS: Record<string, FileStatus> = {
	Processed: 'processed',
	Submitted: 'submitted',
	'Not Submitted': 'not_submitted',
	Problem: 'problem'
};

function dateOf(monthDay: string, year = YEAR): number {
	const [month, day] = monthDay.trim().split('/').map(Number);
	return Date.UTC(year, month - 1, day, 20, 0, 0);
}

/** "3/5 - 3/15" → [start, end]; "Before 4/12" → the week before. */
function windowRange(window: string): [number, number] {
	const day = 24 * 60 * 60 * 1000;
	if (window.startsWith('Before')) {
		const end = dateOf(window.replace('Before', ''));
		return [end - 6 * day, end - day];
	}
	const [start, end] = window.split('-').map((part) => dateOf(part));
	return [start, end];
}

const WEEK_ORDER = ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Floating 1', 'Floating 2', 'Play-In', 'Quarterfinals', 'Semifinals', 'World Series'];

export function weekIndex(week: string): number {
	const index = WEEK_ORDER.indexOf(week);
	return index === -1 ? 99 : index;
}

// ── Season 9 regular season ────────────────────────────────────────────────

const regularGames: CompetitionGame[] = [];
const fixtures: Fixture[] = [];
{
	const byWindow = new Map<string, number>();
	for (const raw of season9.games) {
		const [start, end] = windowRange(raw.window);
		const n = byWindow.get(raw.window) ?? 0;
		byWindow.set(raw.window, n + 1);
		// Spread the window's games across its days, two a day.
		const span = Math.max(1, Math.round((end - start) / (24 * 60 * 60 * 1000)));
		const played_at = start + (Math.floor(n / 2) % span) * 24 * 60 * 60 * 1000 + (n % 2) * 2 * 60 * 60 * 1000;
		regularGames.push({
			id: raw.id,
			fixture_id: raw.id,
			rio_game_id: raw.files === 'Processed' ? 190000 + raw.id * 7 : undefined,
			week: raw.week,
			away: raw.away,
			home: raw.home,
			away_score: raw.away_score,
			home_score: raw.home_score,
			stadium: raw.stadium,
			played_at,
			files: FILE_STATUS[raw.files] ?? 'not_submitted'
		});
		fixtures.push({ id: raw.id, week: raw.week, window: raw.window, away: raw.away, home: raw.home, stadium: raw.stadium, game_id: raw.id, status: 'played' });
	}
}

const PARKS = season9.parks as Record<string, number>;
const OWNERS = Object.keys(PARKS);
const table = standings(OWNERS, regularGames, PARKS);
const seedOf = Object.fromEntries(table.map((row) => [row.name, row.rank])) as Record<string, number>;

// ── Season 9 playoffs (from the bracket sheet) ─────────────────────────────

function match(id: string, a: string, b: string, games: [number, number][], next?: string): BracketMatch {
	let aWins = 0;
	let bWins = 0;
	for (const [x, y] of games) x > y ? aWins++ : bWins++;
	return {
		id,
		a: { seed: seedOf[a], name: a },
		b: { seed: seedOf[b], name: b },
		games,
		winner: aWins > bWins ? a : b,
		next,
		status: 'done'
	};
}

export const NNL_S9_BRACKET: Bracket = {
	format: 'single_elimination',
	champion: 'Cezarito',
	rounds: [
		{ name: 'Play-In', best_of: 1, matches: [match('pi1', 'BennyOkay', 'Balamb', [[1, 7]], 'qf1')] },
		{
			name: 'Quarterfinals',
			best_of: 3,
			matches: [
				match('qf1', 'Cezarito', 'Balamb', [[11, 1], [10, 2]], 'sf1'),
				match('qf2', 'brian', 'Flatbread', [[3, 12], [7, 10]], 'sf1'),
				match('qf3', 'Bmills', 'MattGree', [[7, 5], [7, 3]], 'sf2'),
				match('qf4', 'Hellzhero', 'Vickless', [[6, 5], [1, 7], [0, 8]], 'sf2')
			]
		},
		{
			name: 'Semifinals',
			best_of: 3,
			matches: [match('sf1', 'Cezarito', 'Flatbread', [[3, 7], [16, 2], [11, 7]], 'ws'), match('sf2', 'Bmills', 'Vickless', [[1, 5], [3, 11]], 'ws')]
		},
		{ name: 'World Series', best_of: 5, matches: [match('ws', 'Cezarito', 'Vickless', [[9, 3], [13, 3], [4, 3]])] }
	]
};

const playoffGames: CompetitionGame[] = [];
{
	let id = 1000;
	let day = dateOf('4/14');
	for (const round of NNL_S9_BRACKET.rounds) {
		for (const m of round.matches) {
			m.games.forEach(([aScore, bScore], index) => {
				// The higher seed hosts games 1, 2 and 5.
				const homeIsA = index === 2 || index === 3 ? false : true;
				const home = homeIsA ? m.a!.name : m.b!.name;
				const away = homeIsA ? m.b!.name : m.a!.name;
				playoffGames.push({
					id: id++,
					rio_game_id: 191000 + id,
					week: round.name,
					away,
					home,
					away_score: homeIsA ? bScore : aScore,
					home_score: homeIsA ? aScore : bScore,
					stadium: PARKS[home] ?? 0,
					played_at: day + index * 24 * 60 * 60 * 1000,
					files: 'processed',
					series: `${round.name} · ${m.a!.name} vs ${m.b!.name}`
				});
			});
		}
		day += 5 * 24 * 60 * 60 * 1000;
	}
}

// ── Rosters, prices, entrants ──────────────────────────────────────────────

export const NNL_PRICES: PriceSample[] = season9.prices.map((row) => ({
	asset: row.asset,
	slot: row.slot,
	prices: { 'Season 7': row.s7, 'Season 8': row.s8, 'Season 9': row.s9 }
}));

function priceFor(asset: string, slot: number, season: string): number | undefined {
	const exact = NNL_PRICES.find((row) => row.asset === asset && row.slot === slot);
	const any = exact ?? NNL_PRICES.find((row) => row.asset === asset && row.slot === null) ?? NNL_PRICES.find((row) => row.asset === asset);
	return any?.prices[season];
}

const s9Lines = season9.lines as CharacterLine[];

function rostersFrom(lines: CharacterLine[], season: string, parks: Record<string, number | undefined>): Record<string, RosterSlot[]> {
	const rosters: Record<string, RosterSlot[]> = {};
	for (const line of lines) {
		const list = rosters[line.owner] ?? [];
		if (!list.some((slot) => slot.character === line.character && slot.slot === line.slot)) {
			list.push({ character: line.character, slot: line.slot, price: priceFor(line.character, line.slot, season) });
		}
		rosters[line.owner] = list;
	}
	for (const owner of Object.keys(rosters)) {
		const usage = new Map(lines.filter((line) => line.owner === owner).map((line) => [`${line.character}#${line.slot}`, line.pa + line.outs]));
		rosters[owner].sort((a, b) => (usage.get(`${b.character}#${b.slot}`) ?? 0) - (usage.get(`${a.character}#${a.slot}`) ?? 0));
		const park = parks[owner];
		if (park !== undefined) rosters[owner].push({ character: STADIUM_NAMES[park], slot: 0, price: priceFor(STADIUM_NAMES[park], 0, season) });
	}
	return rosters;
}

function logoFor(roster: RosterSlot[]): string | undefined {
	const names = roster.filter((slot) => slot.slot > 0).map((slot) => slot.character);
	const captain = names.find((name) => CAPTAINS.has(name) && characterClasses[name]);
	return captain ? teamName(names, captain) : undefined;
}

const s9Rosters = rostersFrom(s9Lines, 'Season 9', PARKS);

const s9Entrants: Entrant[] = OWNERS.map((owner) => ({
	username: owner,
	seed: seedOf[owner],
	status: 'confirmed',
	source: 'draft',
	logo: logoFor(s9Rosters[owner] ?? []),
	home_park: PARKS[owner]
}));

export const NNL_SEASON_9: Competition = {
	slug: 'nnl-season-9',
	name: 'NNL Season 9',
	kind: 'league',
	collections: ['nnl'],
	season_label: 'Season 9',
	state: 'completed',
	description: 'Twelve managers, a $124 auction, fourteen home-and-home games across seven scheduling windows, then a play-in and three rounds of playoffs. Every game is a seven-inning Stars Off match at the home manager’s drafted park.',
	organizers: ['Nick H'],
	rulesets: [{ name: 'NNL Stars Off (7 inn.)', labels: ['Stars Off', 'Manager Mode'], codes: ['Stars Off', '7 Innings', 'Disable Star Hits', 'Duplicate Characters'] }],
	signup_policy: 'invite',
	starts_at: dateOf('3/5'),
	ends_at: dateOf('5/2'),
	innings: 7,
	games_per_entrant: 14,
	entrants: s9Entrants,
	fixtures,
	games: [...regularGames, ...playoffGames],
	lines: s9Lines,
	rosters: s9Rosters,
	bracket: NNL_S9_BRACKET,
	playoffs: { direct: 7, play_in: 2, description: 'Seeds 1–7 qualify. Seeds 8 and 9 play one game for the last spot. Quarterfinals and semifinals are best of three, the World Series best of five. The higher seed hosts games 1, 2 and 5.' },
	champion: 'Cezarito'
};

// ── Seasons 5–8: records and lines only ────────────────────────────────────

export const NNL_TEAM_SEASONS = allTime.team_seasons as SeasonTeamLine[];
export const NNL_CHARACTER_SEASONS = allTime.character_seasons as SeasonCharacterLine[];

const SEASON_META: Record<number, { start: string; end: string; year: number; champion?: string }> = {
	5: { start: '2/1', end: '4/30', year: 2022 },
	6: { start: '2/1', end: '4/30', year: 2023 },
	7: { start: '2/1', end: '4/30', year: 2024 },
	8: { start: '3/1', end: '5/15', year: 2025 }
};

function pastSeason(season: number): Competition {
	const meta = SEASON_META[season];
	const teams = NNL_TEAM_SEASONS.filter((row) => row.season === season);
	const lines = NNL_CHARACTER_SEASONS.filter((row) => row.season === season);
	const priceSeason = `Season ${season}`;
	const rosters = rostersFrom(lines, priceSeason, {});
	const entrants: Entrant[] = teams
		.map((row) => ({ username: row.owner, status: 'confirmed' as const, source: 'draft' as const, record: { w: row.w, l: Math.max(0, row.gp - row.w) }, logo: logoFor(rosters[row.owner] ?? []) }))
		.sort((a, b) => b.record!.w - a.record!.w || a.record!.l - b.record!.l);
	entrants.forEach((entrant, index) => (entrant.seed = index + 1));
	return {
		slug: `nnl-season-${season}`,
		name: `NNL Season ${season}`,
		kind: 'league',
		collections: ['nnl'],
		season_label: `Season ${season}`,
		state: 'completed',
		description: `${teams.length} managers. Records and character lines were carried over from the league workbook; the game-by-game schedule for this season was never migrated.`,
		organizers: ['Nick H'],
		rulesets: [{ name: 'NNL Stars Off (7 inn.)', labels: ['Stars Off', 'Manager Mode'] }],
		signup_policy: 'invite',
		starts_at: dateOf(meta.start, meta.year),
		ends_at: dateOf(meta.end, meta.year),
		innings: 7,
		games_per_entrant: Math.max(...teams.map((row) => row.gp)),
		entrants,
		fixtures: [],
		games: [],
		lines,
		rosters: Object.keys(rosters).length ? rosters : undefined,
		champion: meta.champion
	};
}

export const NNL_PAST_SEASONS: Competition[] = [8, 7, 6, 5].map(pastSeason);
