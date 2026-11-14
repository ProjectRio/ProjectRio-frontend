// Seeded Collections and Competitions for the preview. The NNL seasons come
// from the league workbook (./nnl.ts); the rest are built from the draft
// leagues in lib/draft/fixtures.ts plus a LAN event and a Triple Play night so
// every construct in the scoping doc has a page to look at.

import { assetById } from '@/lib/draft/assets';
import { seeded } from '@/lib/draft/values';
import { LEAGUES, priceHistoryFor, type LeagueFixture } from '@/lib/draft/fixtures';
import { NNL_PAST_SEASONS, NNL_PRICES, NNL_SEASON_9 } from './nnl';
import type { Bracket, BracketMatch, Collection, Competition, CompetitionGame, CompetitionState, CompetitionTeam, Entrant, FileStatus, Fixture, PriceSample } from './types';

const DAY = 24 * 60 * 60 * 1000;
const NOW = Date.now();

// ── Collections ────────────────────────────────────────────────────────────

export const COLLECTIONS: Collection[] = [
	{
		slug: 'stars-off',
		name: 'Stars Off',
		kind: 'game_mode',
		tagline: 'Everything played without star moves, ranked or bracket.',
		description: 'The community’s main competitive format. Star swings and star pitches are disabled, so games come down to contact, fielding and matchups. This collection is derived: any competition permitting a ruleset labelled “Stars Off” joins it automatically, and its lifetime ladder rolls up everything played under the Ranked and Tournament sections below.',
		membership: 'derived',
		derived_label: 'Stars Off',
		approved: true,
		organizers: ['MattGree'],
		ladder: { name: 'Stars Off lifetime', tag_set: 'Stars Off, Season 7' },
		founded: 2021,
		page_config: { sections: ['children', 'ladder', 'competitions', 'champions'] }
	},
	{
		slug: 'stars-off-ranked',
		name: 'Stars Off — Ranked',
		kind: 'game_mode',
		tagline: 'Open-play ranked seasons.',
		description: 'Seasonal ranked ladders. Anyone can queue; each season is one competition with no fixtures, and rating posts to both the season ladder and the lifetime Stars Off ladder.',
		parent: 'stars-off',
		membership: 'derived',
		derived_label: 'Stars Off',
		approved: true,
		organizers: ['MattGree'],
		ladder: { name: 'Stars Off ranked lifetime', tag_set: 'Stars Off, Season 7' },
		page_config: { sections: ['ladder', 'competitions'] }
	},
	{
		slug: 'stars-off-tournament',
		name: 'Stars Off — Tournament',
		kind: 'game_mode',
		tagline: 'Bracket events under Stars Off rules.',
		description: 'Every bracket played under Stars Off rules, whichever series or event ran it. NPSS events and LAN brackets sit here and in their own series at the same time.',
		parent: 'stars-off',
		membership: 'derived',
		derived_label: 'Stars Off',
		approved: true,
		organizers: ['MattGree'],
		ladder: { name: 'Stars Off tournament lifetime', tag_set: 'Stars Off, Season 7' },
		page_config: { sections: ['competitions', 'champions', 'ladder'] }
	},
	{
		slug: 'npss',
		name: 'NPSS',
		kind: 'series',
		tagline: 'The flagship Stars Off manager-mode league.',
		description: 'A curated series: eight teams, a live $120 auction with a shared nomination queue, then a season of home-and-home matchups. Historic prices across every NPSS draft live here, and each season is its own competition.',
		membership: 'curated',
		approved: true,
		organizers: ['MattGree', 'Peppermint'],
		sponsor: { name: 'Project Rio Patreon', url: 'https://www.patreon.com/projectrio/posts' },
		founded: 2020,
		page_config: { sections: ['standings', 'competitions', 'champions', 'prices', 'all_time'] }
	},
	{
		slug: 'nnl',
		name: 'NNL',
		kind: 'series',
		tagline: 'Twelve managers, seven-inning Stars Off, five seasons of history.',
		description: 'A manager-mode league tracked in a shared workbook since Season 5. Each season the managers auction full rosters with a salary floor and cap, play a scheduled home-and-home season at their drafted parks, and finish with a play-in and a best-of-five World Series. Everything the workbook tracked — standings, park factors, per-character lines, prices by season — is what this page shows.',
		membership: 'curated',
		approved: true,
		organizers: ['Nick H'],
		founded: 2022,
		page_config: { sections: ['standings', 'competitions', 'champions', 'all_time', 'prices'] }
	},
	{
		slug: 'muddyball',
		name: 'Muddyball',
		kind: 'series',
		tagline: 'Fixed-price rosters, built on your own time.',
		description: 'Every character has a set price and every manager builds a $40 roster before the deadline. Identical rosters are allowed, so the season is decided by lineups and matchups rather than the draft.',
		membership: 'curated',
		approved: true,
		organizers: ['Pico'],
		template: 'Six to eight teams · $40 fixed-price build · 10-game season · no trades',
		founded: 2024,
		page_config: { sections: ['standings', 'competitions', 'champions'] }
	},
	{
		slug: 'big-balla',
		name: 'Big Balla',
		kind: 'game_mode',
		tagline: 'The mod where every ball flies.',
		description: 'Derived from the “Big Balla” ruleset label. A young mode: one league in setup and a LAN bracket taking signups.',
		membership: 'derived',
		derived_label: 'Big Balla',
		approved: true,
		organizers: ['Tallyho'],
		page_config: { sections: ['competitions'] }
	},
	{
		slug: 'winter-lan-2026',
		name: 'Winter LAN 2026',
		kind: 'event',
		tagline: 'One weekend, two brackets, four stations.',
		description: 'An in-person event. Two competitions share the venue’s four stations: a Stars Off single-elimination bracket and a Big Balla bracket. Station assignment attaches to the event so both brackets draw from the same roster of setups.',
		membership: 'curated',
		approved: true,
		organizers: ['MattGree', 'Sable'],
		page_config: { sections: ['competitions', 'champions'] }
	},
	{
		slug: 'triple-play',
		name: 'Triple Play',
		kind: 'series',
		tagline: 'Six players, two sides, all 54 characters, one night.',
		description: 'A weeknight format. Six players form two sides of three and draft the whole character pool between them, nine each. The sides then play a full cross-side round robin — nine games — and the side with more wins takes the night. Games move the players’ individual ladders; the sides never accumulate a rating.',
		membership: 'curated',
		approved: true,
		organizers: ['Vokal'],
		template: '6 entrants · 2 sides of 3 · exhaustive 54-character draft · 9 cross-side fixtures · Stars On or Off per night',
		founded: 2025,
		page_config: { sections: ['standings', 'competitions', 'champions'] }
	}
];

// ── Helpers over the draft leagues ─────────────────────────────────────────

const COLLECTION_OF_LEAGUE: Record<string, string> = { NPSS: 'npss', 'Stars Off': 'stars-off-tournament', Muddyball: 'muddyball', 'Big Balla': 'big-balla' };

export function slugify(text: string): string {
	return text
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-|-$/g, '');
}

function displayTeamName(team: LeagueFixture['teams'][number]): string {
	return team.name ?? team.managers.map((manager) => manager.username).join(' & ');
}

function teamsOf(league: LeagueFixture): CompetitionTeam[] {
	return league.teams.map((team) => ({ id: team.id, name: displayTeamName(team), members: team.managers.map((manager) => manager.username), logo: team.logo ?? undefined }));
}

function entrantsOf(league: LeagueFixture, source: Entrant['source'] = 'draft'): Entrant[] {
	return league.teams.flatMap((team) => team.managers.map((manager) => ({ username: manager.username, team_id: team.id, status: 'confirmed' as const, source, logo: team.logo ?? undefined })));
}

function stadiumOf(league: LeagueFixture, teamId: number): number {
	const pick = league.picks?.find((candidate) => candidate.team_id === teamId && assetById(candidate.asset_id).kind === 'stadium');
	return pick ? (assetById(pick.asset_id).stadium_id ?? 0) : 0;
}

/** A home-and-home round robin as fixtures; games for the weeks already played. */
function roundRobin(league: LeagueFixture, opts: { start: number; playedWeeks: number; seed: number; weekLength?: number }): { fixtures: Fixture[]; games: CompetitionGame[] } {
	const teams = teamsOf(league);
	const n = teams.length;
	const order = [...teams];
	const rounds: [number, number][][] = [];
	// Circle method: n-1 rounds, then mirror for the return leg.
	for (let round = 0; round < n - 1; round++) {
		const pairs: [number, number][] = [];
		for (let i = 0; i < n / 2; i++) pairs.push([order[i].id, order[n - 1 - i].id]);
		rounds.push(pairs);
		order.splice(1, 0, order.pop()!);
	}
	const all = [...rounds, ...rounds.map((pairs) => pairs.map(([a, b]) => [b, a] as [number, number]))];
	const fixtures: Fixture[] = [];
	const games: CompetitionGame[] = [];
	const nameOf = (id: number) => teams.find((team) => team.id === id)!.name;
	const weekLength = opts.weekLength ?? 7;
	all.forEach((pairs, week) => {
		const weekStart = opts.start + week * weekLength * DAY;
		pairs.forEach(([home, away], index) => {
			const id = week * 100 + index + 1;
			const played = week < opts.playedWeeks;
			const stadium = stadiumOf(league, home);
			const played_at = weekStart + (index % weekLength) * DAY + 19 * 60 * 60 * 1000;
			fixtures.push({
				id,
				week: `Week ${week + 1}`,
				window: `${new Date(weekStart).toLocaleDateString(undefined, { month: 'numeric', day: 'numeric' })} – ${new Date(weekStart + (weekLength - 1) * DAY).toLocaleDateString(undefined, { month: 'numeric', day: 'numeric' })}`,
				home: nameOf(home),
				away: nameOf(away),
				stadium,
				scheduled_at: played_at,
				game_id: played ? id : undefined,
				status: played ? 'played' : week === opts.playedWeeks ? 'ready' : 'pending'
			});
			if (played) {
				const r1 = seeded(opts.seed + id * 3);
				const r2 = seeded(opts.seed + id * 5 + 1);
				const homeScore = Math.floor(r1 * 11);
				let awayScore = Math.floor(r2 * 11);
				if (awayScore === homeScore) awayScore += 1;
				const roll = seeded(opts.seed + id * 11);
				const files: FileStatus = roll < 0.82 ? 'processed' : roll < 0.9 ? 'submitted' : roll < 0.97 ? 'not_submitted' : 'problem';
				games.push({ id, fixture_id: id, rio_game_id: files === 'processed' ? 180000 + id : undefined, week: `Week ${week + 1}`, home: nameOf(home), away: nameOf(away), home_score: homeScore, away_score: awayScore, stadium, played_at, files });
			}
		});
	});
	return { fixtures, games };
}

function leagueCompetition(league: LeagueFixture, overrides: Partial<Competition> & { state: CompetitionState }): Competition {
	return {
		slug: slugify(league.name),
		name: league.name,
		kind: 'league',
		collections: [COLLECTION_OF_LEAGUE[league.collection] ?? slugify(league.collection)],
		season_label: league.season,
		description: league.description,
		organizers: ['MattGree'],
		rulesets: [{ name: `${league.collection} league rules`, labels: [league.collection === 'Big Balla' ? 'Big Balla' : 'Stars Off', 'Manager Mode'] }],
		signup_policy: 'invite',
		innings: 9,
		games_per_entrant: (league.teams.length - 1) * 2,
		entrants: entrantsOf(league),
		teams: teamsOf(league),
		fixtures: [],
		games: [],
		lines: [],
		draft_league_id: league.id,
		...overrides
	};
}

// ── NPSS ───────────────────────────────────────────────────────────────────

const npss13League = LEAGUES.find((league) => league.id === 2)!;
const npss13Season = roundRobin(npss13League, { start: NOW - 118 * DAY, playedWeeks: 14, seed: 13 });
const NPSS_13: Competition = leagueCompetition(npss13League, {
	state: 'completed',
	starts_at: NOW - 118 * DAY,
	ends_at: NOW - 12 * DAY,
	fixtures: npss13Season.fixtures,
	games: npss13Season.games,
	playoffs: { direct: 4, play_in: 0, description: 'The top four seeds play best-of-three semifinals and a best-of-five final.' },
	champion: 'Molten Keep',
	description: 'Last season. Rosters and prices are preserved on the league page; the schedule and results below fed the standings. Stat files for this season were processed by hand, so no character lines are linked yet.'
});

const npss14League = LEAGUES.find((league) => league.id === 1)!;
const npss14Season = roundRobin(npss14League, { start: NOW + 5 * DAY, playedWeeks: 0, seed: 14 });
const NPSS_14: Competition = leagueCompetition(npss14League, {
	state: 'drafting',
	starts_at: NOW + 5 * DAY,
	fixtures: npss14Season.fixtures.slice(0, 4 * 4),
	playoffs: { direct: 4, play_in: 0, description: 'The top four seeds play best-of-three semifinals and a best-of-five final.' },
	description: 'This season’s draft is scheduled for tonight. The first four weeks of fixtures are published; the rest follow once the draft completes.'
});

const roundPoolLeague = LEAGUES.find((league) => league.id === 6)!;
const ROUND_POOL: Competition = leagueCompetition(roundPoolLeague, { state: 'upcoming', starts_at: NOW + 5 * DAY, collections: ['npss'] });

// ── Stars Off tournament & season ──────────────────────────────────────────

const vickreyLeague = LEAGUES.find((league) => league.id === 3)!;
const VICKREY_CUP: Competition = leagueCompetition(vickreyLeague, { state: 'upcoming', starts_at: NOW + 26 * 60 * 60 * 1000, collections: ['stars-off-tournament'] });
const snakeLeague = LEAGUES.find((league) => league.id === 4)!;
const SNAKE_LEAGUE: Competition = leagueCompetition(snakeLeague, { state: 'signups', starts_at: NOW + 3 * DAY, collections: ['stars-off-tournament'], signup_policy: 'open' });

const STARS_OFF_S7: Competition = {
	slug: 'stars-off-season-7',
	name: 'Stars Off, Season 7',
	kind: 'season',
	collections: ['stars-off-ranked'],
	season_label: 'Season 7',
	state: 'live',
	description: 'The current open-play ranked season. No fixtures: queue up in the Rio client under this game mode and the result posts to this ladder and the lifetime Stars Off ladder. Standings below are the live ladder from Rio Web.',
	organizers: ['MattGree'],
	rulesets: [{ name: 'Stars Off, Season 7', labels: ['Stars Off', 'Ranked'], codes: ['Stars Off', 'Ranked'] }],
	signup_policy: 'open',
	starts_at: NOW - 60 * DAY,
	innings: 9,
	entrants: [],
	fixtures: [],
	games: [],
	lines: [],
	ladder_tag_set: 'Stars Off, Season 7'
};

// ── Muddyball & Big Balla leagues ──────────────────────────────────────────

const muddyballLeague = LEAGUES.find((league) => league.id === 5)!;
const MUDDYBALL_6: Competition = leagueCompetition(muddyballLeague, { state: 'drafting', starts_at: NOW + 4 * DAY, signup_policy: 'open' });
const bigBallaLeague = LEAGUES.find((league) => league.id === 7)!;
const BIG_BALLA_1: Competition = leagueCompetition(bigBallaLeague, { state: 'upcoming', collections: ['big-balla'] });

// ── Winter LAN 2026 ────────────────────────────────────────────────────────

const LAN_PLAYERS = ['MattGree', 'Vokal', 'RhinoRK', 'Skoop', 'Torchic', 'KevBobby', 'Jorb', 'NinetyNine'];
const LAN_STATIONS = ['Station 1', 'Station 2', 'Station 3', 'Station 4'];

function lanMatch(id: string, a: number, b: number, games: [number, number][], status: BracketMatch['status'], next?: string, station?: string): BracketMatch {
	let aWins = 0;
	let bWins = 0;
	for (const [x, y] of games) x > y ? aWins++ : bWins++;
	const done = status === 'done';
	return {
		id,
		a: { seed: a, name: LAN_PLAYERS[a - 1] },
		b: { seed: b, name: LAN_PLAYERS[b - 1] },
		games,
		winner: done ? (aWins > bWins ? LAN_PLAYERS[a - 1] : LAN_PLAYERS[b - 1]) : undefined,
		next,
		status,
		station
	};
}

const LAN_BRACKET: Bracket = {
	format: 'single_elimination',
	rounds: [
		{
			name: 'Quarterfinals',
			best_of: 3,
			matches: [
				lanMatch('qf1', 1, 8, [[7, 2], [5, 4]], 'done', 'sf1'),
				lanMatch('qf2', 4, 5, [[3, 6], [8, 1], [4, 2]], 'done', 'sf1'),
				lanMatch('qf3', 3, 6, [[2, 5], [6, 3]], 'live', 'sf2', 'Station 2'),
				lanMatch('qf4', 2, 7, [], 'ready', 'sf2', 'Station 3')
			]
		},
		{
			name: 'Semifinals',
			best_of: 3,
			matches: [
				{ id: 'sf1', a: { seed: 1, name: LAN_PLAYERS[0] }, b: { seed: 4, name: LAN_PLAYERS[3] }, games: [], next: 'final', status: 'ready', station: 'Station 1' },
				{ id: 'sf2', a: null, b: null, games: [], next: 'final', status: 'pending' }
			]
		},
		{ name: 'Grand Final', best_of: 5, matches: [{ id: 'final', a: null, b: null, games: [], status: 'pending' }] }
	]
};

const lanGames: CompetitionGame[] = [];
const lanFixtures: Fixture[] = [];
{
	let id = 1;
	for (const round of LAN_BRACKET.rounds) {
		for (const m of round.matches) {
			if (!m.a || !m.b) continue;
			m.games.forEach(([aScore, bScore], index) => {
				lanGames.push({ id, fixture_id: id, rio_game_id: 195000 + id, week: round.name, home: m.a!.name, away: m.b!.name, home_score: aScore, away_score: bScore, stadium: index % 7, played_at: NOW - (3 - index) * 45 * 60 * 1000, files: 'processed', series: `${round.name} · ${m.a!.name} vs ${m.b!.name}` });
				lanFixtures.push({ id, week: round.name, window: 'Saturday', home: m.a!.name, away: m.b!.name, station: m.station, game_id: id, status: 'played' });
				id++;
			});
			if (m.status === 'ready' || m.status === 'live') {
				lanFixtures.push({ id, week: round.name, window: 'Saturday', home: m.a.name, away: m.b.name, station: m.station, expected_ruleset: 'Stars Off LAN', scheduled_at: NOW + (m.status === 'live' ? 0 : 20 * 60 * 1000), status: 'ready' });
				id++;
			}
		}
	}
}

const LAN_STARS_OFF: Competition = {
	slug: 'winter-lan-2026-stars-off',
	name: 'Winter LAN 2026 — Stars Off',
	kind: 'tournament',
	collections: ['winter-lan-2026', 'stars-off-tournament'],
	season_label: 'Saturday bracket',
	state: 'live',
	description: 'Eight seeded players, single elimination, best of three until a best-of-five final. Matches are assigned to the venue’s stations as they become ready; players are pinged in the app and on the venue display.',
	organizers: ['MattGree', 'Sable'],
	rulesets: [{ name: 'Stars Off LAN', labels: ['Stars Off', 'Tournament'] }],
	signup_policy: 'invite',
	starts_at: NOW - 3 * 60 * 60 * 1000,
	innings: 9,
	entrants: LAN_PLAYERS.map((username, index) => ({ username, seed: index + 1, status: 'confirmed' as const, source: 'bracket' as const })),
	fixtures: lanFixtures,
	games: lanGames,
	lines: [],
	bracket: LAN_BRACKET,
	stations: LAN_STATIONS
};

const LAN_BIG_BALLA: Competition = {
	slug: 'winter-lan-2026-big-balla',
	name: 'Winter LAN 2026 — Big Balla',
	kind: 'tournament',
	collections: ['winter-lan-2026', 'big-balla'],
	season_label: 'Sunday bracket',
	state: 'signups',
	description: 'Open signups for the Sunday bracket. Anyone at the venue can enter; the bracket generates once signups close on Saturday night.',
	organizers: ['Sable'],
	rulesets: [{ name: 'Big Balla LAN', labels: ['Big Balla', 'Tournament'] }],
	signup_policy: 'open',
	starts_at: NOW + 20 * 60 * 60 * 1000,
	innings: 9,
	entrants: [
		...['Sable', 'Tallyho', 'Pico', 'Orbit', 'Brickhouse'].map((username) => ({ username, status: 'confirmed' as const, source: 'signup' as const })),
		...['Mizu', 'DryBonesFan'].map((username) => ({ username, status: 'pending' as const, source: 'signup' as const }))
	],
	fixtures: [],
	games: [],
	lines: [],
	stations: LAN_STATIONS
};

// ── Triple Play night ──────────────────────────────────────────────────────

const TP_TEAMS: CompetitionTeam[] = [
	{ id: 1, name: 'Side A', members: ['Vokal', 'Peppermint', 'Jorb'] },
	{ id: 2, name: 'Side B', members: ['RhinoRK', 'Torchic', 'Mizu'] }
];
const tpFixtures: Fixture[] = [];
const tpGames: CompetitionGame[] = [];
{
	let id = 1;
	TP_TEAMS[0].members.forEach((a, i) => {
		TP_TEAMS[1].members.forEach((b, j) => {
			const home = (i + j) % 2 === 0 ? a : b;
			const away = home === a ? b : a;
			const played = id <= 7;
			const played_at = NOW - 3 * DAY + (id - 1) * 25 * 60 * 1000;
			tpFixtures.push({ id, week: `Game ${id}`, window: 'Thursday night', home, away, stadium: id % 7, expected_ruleset: 'Stars On', station: `Station ${(id % 3) + 1}`, scheduled_at: played_at, game_id: played ? id : undefined, status: played ? 'played' : id === 8 ? 'ready' : 'pending' });
			if (played) {
				const h = Math.floor(seeded(41 * id) * 9);
				let aw = Math.floor(seeded(41 * id + 7) * 9);
				if (aw === h) aw += 1;
				tpGames.push({ id, fixture_id: id, rio_game_id: 196000 + id, week: `Game ${id}`, home, away, home_score: h, away_score: aw, stadium: id % 7, played_at, files: 'processed' });
			}
			id++;
		});
	});
}

const TRIPLE_PLAY_41: Competition = {
	slug: 'triple-play-night-41',
	name: 'Triple Play #41',
	kind: 'night',
	collections: ['triple-play'],
	season_label: 'Night 41',
	state: 'live',
	description: 'Stars On night. Six players drafted all 54 characters between them and the two sides are playing their nine cross-side games. The side with more wins takes the night; each game moves the two players’ own ladders.',
	organizers: ['Vokal'],
	rulesets: [{ name: 'Triple Play — Stars On', labels: ['Stars On', 'Triple Play'] }],
	signup_policy: 'invite',
	starts_at: NOW - 3 * DAY,
	innings: 9,
	entrants: TP_TEAMS.flatMap((team) => team.members.map((username) => ({ username, team_id: team.id, status: 'confirmed' as const, source: 'draft' as const }))),
	teams: TP_TEAMS,
	fixtures: tpFixtures,
	games: tpGames,
	lines: [],
	stations: ['Station 1', 'Station 2', 'Station 3']
};

// ── Registry ───────────────────────────────────────────────────────────────

export const COMPETITIONS: Competition[] = [NNL_SEASON_9, ...NNL_PAST_SEASONS, NPSS_14, NPSS_13, ROUND_POOL, VICKREY_CUP, SNAKE_LEAGUE, STARS_OFF_S7, MUDDYBALL_6, BIG_BALLA_1, LAN_STARS_OFF, LAN_BIG_BALLA, TRIPLE_PLAY_41];

export function collectionBySlug(slug: string): Collection | undefined {
	return COLLECTIONS.find((collection) => collection.slug === slug);
}

export function competitionBySlug(slug: string): Competition | undefined {
	return COMPETITIONS.find((competition) => competition.slug === slug);
}

export function competitionForLeague(leagueId: number): Competition | undefined {
	return COMPETITIONS.find((competition) => competition.draft_league_id === leagueId);
}

export function childCollections(slug: string): Collection[] {
	return COLLECTIONS.filter((collection) => collection.parent === slug);
}

/** Every slug beneath (and including) a collection — membership rolls up. */
export function collectionTree(slug: string): string[] {
	const out = [slug];
	for (const child of childCollections(slug)) out.push(...collectionTree(child.slug));
	return out;
}

export function competitionsIn(slug: string): Competition[] {
	const tree = new Set(collectionTree(slug));
	return COMPETITIONS.filter((competition) => competition.collections.some((member) => tree.has(member)));
}

export function breadcrumbs(slug: string): Collection[] {
	const chain: Collection[] = [];
	let current = collectionBySlug(slug);
	while (current) {
		chain.unshift(current);
		current = current.parent ? collectionBySlug(current.parent) : undefined;
	}
	return chain;
}

export const STATE_ORDER: CompetitionState[] = ['live', 'playoffs', 'drafting', 'signups', 'upcoming', 'completed'];

export function sortCompetitions(list: Competition[]): Competition[] {
	return [...list].sort((a, b) => {
		const byState = STATE_ORDER.indexOf(a.state) - STATE_ORDER.indexOf(b.state);
		if (byState !== 0) return byState;
		return (b.starts_at ?? 0) - (a.starts_at ?? 0);
	});
}

/** Historic draft prices grouped by collection (§10f): the NNL workbook's price sheet, or the draft leagues' price history. */
export function pricesFor(slug: string): { seasons: string[]; rows: PriceSample[] } {
	if (slug === 'nnl') return { seasons: ['Season 7', 'Season 8', 'Season 9'], rows: NNL_PRICES };
	const league = LEAGUES.find((candidate) => COLLECTION_OF_LEAGUE[candidate.collection] === slug || slugify(candidate.collection) === slug);
	if (!league) return { seasons: [], rows: [] };
	const history = priceHistoryFor(league.collection);
	const rows: PriceSample[] = Object.values(history).map((entry) => ({
		asset: assetById(entry.asset_id).name,
		slot: null,
		prices: Object.fromEntries(entry.samples.map((sample) => [sample.season, sample.price]))
	}));
	const seasons = Object.values(history)[0]?.samples.map((sample) => sample.season) ?? [];
	return { seasons, rows };
}
