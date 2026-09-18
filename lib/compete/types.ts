// The competition model from ProjectRio-web/EXTENSIBILITY_SCOPING.md §3, drawn
// against the "what page is this?" test (§3c):
//
//   Competition  → standings or bracket, its games, its entrants
//   Collection   → landing page: description, lifetime ladder, all-time history, its competitions
//   Fixture      → "you're up next, on station 3"
//
// A "league" in the leagues section is a Competition of kind `league` whose
// draft lives at /leagues/[id]. Nothing here is served by the backend yet; the
// fixtures in ./fixtures.ts stand in for Phase 1–3 of the scoping doc.

// ── Collections (§3g) ──────────────────────────────────────────────────────

export type CollectionKind = 'series' | 'game_mode' | 'event' | 'organization';

export interface Collection {
	slug: string;
	name: string;
	kind: CollectionKind;
	/** One line for cards. */
	tagline: string;
	description: string;
	/** Nesting: membership rolls up to the parent (§3g). */
	parent?: string;
	/** Curated by a TO, or derived from a Ruleset label. */
	membership: 'curated' | 'derived';
	derived_label?: string;
	approved: boolean;
	organizers: string[];
	sponsor?: { name: string; url?: string };
	/** A lifetime ladder scoped to this collection (§4d, §7). `tag_set` reads the live API meanwhile. */
	ladder?: { name: string; tag_set?: string };
	/** The recipe a TO reuses for "new X night" (§3g). */
	template?: string;
	founded?: number;
	/** Section order for the landing page; the backend never models the page itself. */
	page_config?: { sections: CollectionSection[] };
}

export type CollectionSection = 'competitions' | 'ladder' | 'champions' | 'all_time' | 'prices' | 'children';

// ── Competitions (§3f) ─────────────────────────────────────────────────────

export type CompetitionKind = 'league' | 'tournament' | 'season' | 'night';
export type CompetitionState = 'upcoming' | 'signups' | 'drafting' | 'live' | 'playoffs' | 'completed';

export interface Ruleset {
	name: string;
	labels: string[];
	codes?: string[];
}

export type EntrantSource = 'signup' | 'draft' | 'bracket' | 'collection' | 'invite';

export interface Entrant {
	username: string;
	seed?: number;
	team_id?: number;
	status: 'confirmed' | 'pending' | 'withdrawn';
	source: EntrantSource;
	/** In-game team name used for the logo. */
	logo?: string;
	home_park?: number;
	/** Final record for seasons whose games were never migrated. */
	record?: { w: number; l: number };
}

/** Competition-scoped team, no rating (§3j). */
export interface CompetitionTeam {
	id: number;
	name: string;
	members: string[];
	logo?: string;
}

/** Where the stat file for a game stands — the league sheet's "Stat File Tracking" column. */
export type FileStatus = 'processed' | 'submitted' | 'not_submitted' | 'problem';

export interface CompetitionGame {
	id: number;
	fixture_id?: number;
	/** Rio Web game id once the stat file is processed. */
	rio_game_id?: number;
	week: string;
	away: string;
	home: string;
	away_score: number;
	home_score: number;
	stadium: number;
	played_at: number;
	files: FileStatus;
	/** Playoff series label when the game belongs to a bracket. */
	series?: string;
}

export type FixtureStatus = 'pending' | 'ready' | 'played' | 'unbound';

/** The expected game (§3h). */
export interface Fixture {
	id: number;
	week: string;
	window: string;
	away: string;
	home: string;
	stadium?: number;
	expected_ruleset?: string;
	station?: string;
	scheduled_at?: number;
	game_id?: number;
	status: FixtureStatus;
}

// ── Brackets (§8a projection) ──────────────────────────────────────────────

export interface BracketSide {
	seed?: number;
	name: string;
}

export interface BracketMatch {
	id: string;
	a: BracketSide | null;
	b: BracketSide | null;
	/** Game scores as [a, b], in order played. */
	games: [number, number][];
	winner?: string;
	/** Match id the winner advances to. */
	next?: string;
	status: 'pending' | 'ready' | 'live' | 'done';
	station?: string;
}

export interface BracketRound {
	name: string;
	best_of: number;
	matches: BracketMatch[];
}

export interface Bracket {
	format: 'single_elimination' | 'double_elimination' | 'round_robin' | 'swiss' | 'league' | 'gauntlet';
	rounds: BracketRound[];
	champion?: string;
}

// ── Stats ──────────────────────────────────────────────────────────────────

/** The counting stats the league sheet tracks per character, per team. Rates derive from these. */
export interface StatLine {
	gp: number;
	app: number;
	// batting
	pa: number;
	ab: number;
	h: number;
	b1: number;
	b2: number;
	b3: number;
	hr: number;
	rbi: number;
	bb: number;
	sf: number;
	sb: number;
	r: number;
	/** Big plays (defence). */
	bp: number;
	// pitching
	outs: number;
	er: number;
	k: number;
	/** Walks allowed. */
	bba: number;
	/** Hits allowed. */
	ha: number;
	w: number;
	pitches: number;
	star_p: number;
}

export interface CharacterLine extends StatLine {
	character: string;
	/** Copy number when a roster carries the same character twice (§9b). */
	slot: number;
	owner: string;
}

export interface RosterSlot {
	character: string;
	slot: number;
	price?: number;
}

export interface PlayoffFormat {
	/** Seeds that qualify outright. */
	direct: number;
	/** Seeds that play in for the last spot. */
	play_in: number;
	description: string;
}

export interface Competition {
	slug: string;
	name: string;
	kind: CompetitionKind;
	collections: string[];
	season_label: string;
	state: CompetitionState;
	description: string;
	organizers: string[];
	rulesets: Ruleset[];
	signup_policy: 'open' | 'invite';
	starts_at?: number;
	ends_at?: number;
	innings: number;
	/** Regular-season games each entrant plays. */
	games_per_entrant?: number;
	entrants: Entrant[];
	teams?: CompetitionTeam[];
	fixtures: Fixture[];
	games: CompetitionGame[];
	lines: CharacterLine[];
	rosters?: Record<string, RosterSlot[]>;
	bracket?: Bracket;
	playoffs?: PlayoffFormat;
	/** The draft league in /leagues that seeded this competition's rosters. */
	draft_league_id?: number;
	/** Open-play season: standings are the live ladder for this game mode. */
	ladder_tag_set?: string;
	stations?: string[];
	champion?: string;
}

/** A per-season summary kept on the collection for all-time views. */
export interface SeasonTeamLine extends StatLine {
	season: number;
	owner: string;
}

export interface SeasonCharacterLine extends CharacterLine {
	season: number;
}

export interface PriceSample {
	asset: string;
	slot: number | null;
	prices: Record<string, number>;
}
