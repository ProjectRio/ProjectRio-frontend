export const BACKEND = 'https://api.projectrio.app';

export const STAT_ENDPOINTS = {
	CHARACTERS: '/characters/',
	GAMES: '/games/',
	EVENTS: '/events/',
	LANDING_DATA: '/landing_data/',
	STAR_CHANCES: '/star_chances/',
	STATS: '/stats/',
	LIVE_GAMES: '/populate_db/ongoing_game/',
	STATS_FIX: '/stats/fix/',
	LADDER_GAMES: '/ladder/games/'
} as const;

export const USER_ENDPOINTS = {
	SIGNUP: '/signup/',
	REGISTER: '/register/',
	VERIFY_EMAIL: '/verify_email/',
	REQUEST_PASSWORD_CHANGE: '/request_password_change/',
	CHANGE_PASSWORD: '/change_password/',
	LOGIN: '/login/',
	LOGOUT: '/logout/',
	VALIDATE_JWT: '/validate_jwt/',
	REQUEST_NEW_RIO_KEY: '/request_new_rio_key/',
	SET_PRIVACY: '/set_privacy/',
	USER_TAGS: '/user/tags/',
	USER_COMMUNITY: '/user/community/',
	USER_PRUNE: '/user/prune/',
	USER_ALL: '/user/all',
	USER_COMMUNITY_SPONSOR: '/user/community/sponsor/'
} as const;

export const COMMUNITY_ENDPOINTS = {
	COMMUNITY_CREATE: '/community/create',
	COMMUNITY_JOIN: '/community/join',
	COMMUNITY_INVITE: '/community/invite',
	COMMUNITY_MEMBERS: '/community/members/',
	COMMUNITY_TAGS: '/community/tags/',
	COMMUNITY_MANAGE: '/community/manage/',
	COMMUNITY_SPONSOR: '/community/sponsor',
	COMMUNITY_KEY: '/community/key/',
	COMMUNITY_UPDATE: '/community/update/'
} as const;

export const TAG_ENDPOINTS = {
	GET_TAG_SET_LADDER: '/tag_set/ladder/',
	TAGSET_LIST: '/tag_set/list',
	TAG_LIST: '/tag/list',
	CREATE_TAG_SET: '/tag_set/create'
} as const;

export async function apiGet<T = any>(endpoint: string, params = ''): Promise<T> {
	const response = await fetch(BACKEND + endpoint + params);
	if (!response.ok) throw new Error(`API ${endpoint} responded ${response.status}`);
	return response.json();
}

export async function apiPost<T = any>(endpoint: string, body?: unknown): Promise<T> {
	const response = await fetch(BACKEND + endpoint, {
		method: 'POST',
		// The backend rejects a JSON content type without a body, so only set headers when sending one.
		...(body === undefined
			? {}
			: {
					headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
					body: JSON.stringify(body)
				})
	});
	if (!response.ok) throw new Error(`API ${endpoint} responded ${response.status}`);
	return response.json();
}

// ---------- Games ----------

export interface GameSummary {
	game_id: number;
	game_mode?: string;
	away_user: string;
	home_user: string;
	away_score: number;
	home_score: number;
	away_captain?: string;
	home_captain?: string;
	away_roster?: number[];
	home_roster?: number[];
	date_time_start?: number;
	date_time_end?: number;
	innings_played?: number;
	innings_selected?: number;
	tags?: string[];
	// Present when fetched with include_linescore=1: [awayRuns, homeRuns], one
	// entry per inning. The bottom of the final inning may be 'X' (home didn't bat).
	linescore?: [(number | 'X')[], (number | 'X')[]];
	scoring_plays?: ScoringPlay[];
	[key: string]: any;
}

export interface ScoringRunner {
	char_id: number;
	initial_base: number;
	result_base: number;
	out_type: number;
	out_location: number;
	steal: number;
}

export interface ScoringPlay {
	inning: number;
	half_inning: number; // 0 = top (away batting), 1 = bottom (home batting)
	event_num: number;
	result_rbi: number;
	result_of_ab: number;
	batter: number; // char_id
	pitcher: number; // char_id
	away_score: number; // running score BEFORE this play
	home_score: number;
	outs: number;
	runners: (ScoringRunner | null)[];
}

export async function getRecentGames(opts: {
	limit: number;
	mode?: string;
	rosters?: boolean;
	username?: string;
}): Promise<GameSummary[]> {
	const params =
		`?limit_games=${opts.limit}` +
		(opts.rosters ? '&include_teams=1' : '') +
		(opts.mode ? `&tag=${encodeURIComponent(opts.mode)}` : '') +
		(opts.username ? `&username=${encodeURIComponent(opts.username)}` : '');
	const res = await apiGet(STAT_ENDPOINTS.GAMES, params);
	return res.games ?? [];
}

export async function getLiveGames(timeFilterSeconds: number): Promise<any[]> {
	const cutoff = Math.floor(Date.now() / 1000) - timeFilterSeconds;
	let games: any[] = [];
	try {
		const res = await apiGet(STAT_ENDPOINTS.LIVE_GAMES);
		games = (res.ongoing_games ?? []).filter((game: any) => game.start_time > cutoff);
	} catch (err) {
		// In dev we fall through to fixtures below; in prod the error is real.
		if (process.env.NODE_ENV !== 'development') throw err;
	}

	// Dev convenience: when nothing is actually ongoing (or the API is
	// unreachable), serve the committed example games so the live UI is testable.
	// This whole block is dead code in a production build, so neither the
	// fixtures nor the example JSON ship to deployed users.
	if (games.length === 0 && process.env.NODE_ENV === 'development') {
		const { exampleLiveGames } = await import('./devFixtures');
		if (exampleLiveGames.length > 0) {
			console.info('[dev] No ongoing games from API — showing example fixtures (example_ongoing_game.json)');
			return exampleLiveGames;
		}
	}

	return games;
}

export async function getGameStats(gameID: number): Promise<any> {
	const res = await apiGet(STAT_ENDPOINTS.STATS, `?games=${gameID}&exclude_nonfair=1&by_char=1&by_user=1`);
	return res.Stats ?? {};
}

// The /games/ endpoint has no game_id filter, so a single game can only be
// found by listing a matchup and picking it out. `linescore` adds per-inning
// run totals (and scoring plays) for the box-score page.
export async function getMatchups(
	captain1: string,
	captain2: string,
	opts: { linescore?: boolean } = {}
): Promise<GameSummary[]> {
	const params =
		`?username=${encodeURIComponent(captain1)}&vs_username=${encodeURIComponent(captain2)}` +
		(opts.linescore ? '&include_linescore=1&include_scoring_plays=1' : '');
	const res = await apiGet(STAT_ENDPOINTS.GAMES, params);
	return res.games ?? [];
}

// ---------- Stats ----------

export const DEFAULT_MODE = 'Stars Off, Season 7';

export async function getUserBattingStats(user: string, mode = DEFAULT_MODE) {
	const params = `?exclude_pitching=1&exclude_fielding=1&exclude_misc=1&tag=${encodeURIComponent(mode)}&username=${encodeURIComponent(user)}&exclude_nonfair=1`;
	const [overall, byChar] = await Promise.all([
		apiGet(STAT_ENDPOINTS.STATS, params),
		apiGet(STAT_ENDPOINTS.STATS, params + '&by_char=1')
	]);
	return { overall: overall.Stats ?? {}, byChar: byChar.Stats ?? {} };
}

export async function getUserPitchingStats(user: string, mode = DEFAULT_MODE) {
	const params = `?exclude_batting=1&exclude_fielding=1&exclude_misc=1&tag=${encodeURIComponent(mode)}&username=${encodeURIComponent(user)}`;
	const [overall, byChar] = await Promise.all([
		apiGet(STAT_ENDPOINTS.STATS, params),
		apiGet(STAT_ENDPOINTS.STATS, params + '&by_char=1')
	]);
	return { overall: overall.Stats ?? {}, byChar: byChar.Stats ?? {} };
}

export async function getCharBattingStats(charId: string | null, mode = DEFAULT_MODE) {
	let params = `?exclude_pitching=1&exclude_fielding=1&exclude_misc=1&tag=${encodeURIComponent(mode)}&exclude_nonfair=1`;
	if (charId !== null) params += `&char_id=${charId}`;
	const [overall, byUser] = await Promise.all([
		apiGet(STAT_ENDPOINTS.STATS, params),
		apiGet(STAT_ENDPOINTS.STATS, params + '&by_user=1')
	]);
	return { overall: overall.Stats ?? {}, byUser: byUser.Stats ?? {} };
}

export async function getCharPitchingStats(charId: string | null, mode = DEFAULT_MODE) {
	let params = `?exclude_batting=1&exclude_fielding=1&exclude_misc=1&tag=${encodeURIComponent(mode)}`;
	if (charId !== null) params += `&char_id=${charId}`;
	const [overall, byUser] = await Promise.all([
		apiGet(STAT_ENDPOINTS.STATS, params),
		apiGet(STAT_ENDPOINTS.STATS, params + '&by_user=1')
	]);
	return { overall: overall.Stats ?? {}, byUser: byUser.Stats ?? {} };
}

// ---------- Ladder ----------

export interface LadderPlayer {
	username: string;
	rating: number;
	num_wins: number;
	num_losses: number;
	adjusted_rating: number;
	player_games: number;
	[key: string]: any;
}

export async function getTagSetLadder(gameMode: string): Promise<LadderPlayer[]> {
	const result = await apiPost(TAG_ENDPOINTS.GET_TAG_SET_LADDER, { TagSet: gameMode });
	const players = Object.entries(result).map(([username, p]: [string, any]) => ({
		username: p.username ?? username,
		...p
	}));
	const ALPHA = 0.1;
	const BETA = 0.85;
	for (const p of players) {
		p.player_games = p.num_wins + p.num_losses + 1;
		p.adjusted_rating = Math.round(
			(BETA + (1 - BETA) * (1 - Math.exp(1 - ALPHA * p.num_wins))) *
				(p.rating - 500 * Math.sqrt(Math.log10(p.player_games + 1) / p.player_games))
		);
	}
	return players.sort((a, b) => b.adjusted_rating - a.adjusted_rating);
}

// ---------- Users / communities / tags ----------

export async function getAllUsers(): Promise<string[]> {
	const res = await apiGet(USER_ENDPOINTS.USER_ALL);
	return res.users ?? [];
}

export async function getUserCommunities(username: string): Promise<any[]> {
	const res = await apiGet(USER_ENDPOINTS.USER_COMMUNITY, `?username=${encodeURIComponent(username)}`);
	return res.communities ?? [];
}

export interface TagSet {
	id: number;
	name: string;
	name_lowercase?: string;
	comm_id?: number;
	community_name?: string;
	type?: string;
	start_date?: number;
	end_date?: number;
	tags?: any[];
	[key: string]: any;
}

export async function getAllTagSets(): Promise<TagSet[]> {
	const res = await apiPost(TAG_ENDPOINTS.TAGSET_LIST);
	return res['Tag Sets'] ?? [];
}

export async function getAllTags(): Promise<any[]> {
	const res = await apiGet(TAG_ENDPOINTS.TAG_LIST);
	return res['Tags'] ?? [];
}
