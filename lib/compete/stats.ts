// Stat vocabulary and derivations for competition pages. The counting stats
// are the columns the league sheet tracks per character; every rate below is
// derived, with the sheet's own formulas (7-inning ERA, OPS+ against the
// league line, park-adjusted ERA-, a games-played qualification bar).

import type { CharacterLine, CompetitionGame, StatLine } from './types';

export type StatGroup = 'batting' | 'pitching' | 'fielding' | 'team';

export interface StatColumn {
	key: keyof DerivedLine;
	abbr: string;
	label: string;
	group: StatGroup;
	/** How to print the value. */
	format: 'int' | 'rate3' | 'dec2' | 'dec1' | 'plus' | 'ip' | 'pct';
	/** Sort descending by default. */
	desc?: boolean;
	/** Plain-language definition for the glossary. */
	description: string;
	/** Only meaningful when summed for a whole team. */
	teamOnly?: boolean;
}

export interface DerivedLine extends StatLine {
	tb: number;
	avg: number;
	obp: number;
	slg: number;
	ops: number;
	ops_plus: number;
	iso: number;
	ip: number;
	era: number;
	era_minus: number;
	whip: number;
	k_bb: number;
	p_k: number;
	p_ip: number;
	k_ip: number;
	rough_lob: number;
	hr_ratio: number;
	hits_per_run: number;
	runs_per_hit: number;
	qualified_batter: boolean;
	qualified_pitcher: boolean;
}

export const EMPTY_LINE: StatLine = {
	gp: 0,
	app: 0,
	pa: 0,
	ab: 0,
	h: 0,
	b1: 0,
	b2: 0,
	b3: 0,
	hr: 0,
	rbi: 0,
	bb: 0,
	sf: 0,
	sb: 0,
	r: 0,
	bp: 0,
	outs: 0,
	er: 0,
	k: 0,
	bba: 0,
	ha: 0,
	w: 0,
	pitches: 0,
	star_p: 0
};

const COUNT_KEYS = Object.keys(EMPTY_LINE) as (keyof StatLine)[];

export function sumLines(lines: StatLine[]): StatLine {
	const out: StatLine = { ...EMPTY_LINE };
	for (const line of lines) for (const key of COUNT_KEYS) out[key] += line[key] ?? 0;
	return out;
}

/** League-wide baselines every OPS+ and ERA- is measured against. */
export interface LeagueContext {
	obp: number;
	slg: number;
	era: number;
	innings: number;
	/** Games played by one entrant over the regular season. */
	games_per_entrant: number;
	/** Park factor for an entrant's home park, keyed by owner. */
	park_factor: Record<string, number>;
}

export function leagueContext(lines: StatLine[], innings: number, games_per_entrant: number, park_factor: Record<string, number> = {}): LeagueContext {
	const total = sumLines(lines);
	return {
		obp: safeDiv(total.h + total.bb, total.ab + total.bb + total.sf),
		slg: safeDiv(totalBases(total), total.ab),
		era: safeDiv(innings * total.er, total.outs / 3),
		innings,
		games_per_entrant,
		park_factor
	};
}

export function totalBases(line: StatLine): number {
	return line.b1 + 2 * line.b2 + 3 * line.b3 + 4 * line.hr;
}

function safeDiv(a: number, b: number): number {
	return b === 0 ? NaN : a / b;
}

/** Sheet rule: a line qualifies once it has appeared in a third of the season. */
export function qualifyingGames(games_per_entrant: number): number {
	return Math.max(1, Math.ceil(games_per_entrant / 3));
}

export function derive(line: StatLine, ctx: LeagueContext, owner?: string): DerivedLine {
	const tb = totalBases(line);
	const ip = line.outs / 3;
	const avg = safeDiv(line.h, line.ab);
	const obp = safeDiv(line.h + line.bb, line.ab + line.bb + line.sf);
	const slg = safeDiv(tb, line.ab);
	const era = safeDiv(ctx.innings * line.er, ip);
	const pf = owner ? (ctx.park_factor[owner] ?? 1) : 1;
	const bar = qualifyingGames(ctx.games_per_entrant);
	return {
		...line,
		tb,
		avg,
		obp,
		slg,
		ops: obp + slg,
		ops_plus: 100 * (obp / ctx.obp + slg / ctx.slg - 1),
		iso: safeDiv(line.b2 + 2 * line.b3 + 3 * line.hr, line.ab),
		ip,
		era,
		// The sheet's park adjustment: runs at home are scaled by the park factor.
		era_minus: (100 * (era + (era - era * pf))) / ctx.era,
		whip: safeDiv(line.bba + line.ha, ip),
		k_bb: safeDiv(line.k, line.bba),
		p_k: safeDiv(line.pitches, line.k),
		p_ip: safeDiv(line.pitches, ip),
		k_ip: safeDiv(line.k, ip),
		rough_lob: safeDiv(line.h + line.bb - line.r, line.gp),
		hr_ratio: safeDiv(line.hr, line.ab),
		hits_per_run: safeDiv(line.h, line.r),
		runs_per_hit: safeDiv(line.r, line.h),
		qualified_batter: line.gp >= bar,
		qualified_pitcher: ip >= bar
	};
}

export const STAT_COLUMNS: StatColumn[] = [
	{ key: 'gp', abbr: 'GP', label: 'Games played', group: 'batting', format: 'int', desc: true, description: 'Games this line appeared in.' },
	{ key: 'pa', abbr: 'PA', label: 'Plate appearances', group: 'batting', format: 'int', desc: true, description: 'At-bats plus walks and sacrifice flies.' },
	{ key: 'ab', abbr: 'AB', label: 'At-bats', group: 'batting', format: 'int', desc: true, description: 'Plate appearances that were not walks or sacrifices.' },
	{ key: 'h', abbr: 'H', label: 'Hits', group: 'batting', format: 'int', desc: true, description: 'Singles, doubles, triples and home runs.' },
	{ key: 'b2', abbr: '2B', label: 'Doubles', group: 'batting', format: 'int', desc: true, description: 'Two-base hits.' },
	{ key: 'b3', abbr: '3B', label: 'Triples', group: 'batting', format: 'int', desc: true, description: 'Three-base hits.' },
	{ key: 'hr', abbr: 'HR', label: 'Home runs', group: 'batting', format: 'int', desc: true, description: 'Balls over the fence, or inside-the-park.' },
	{ key: 'tb', abbr: 'TB', label: 'Total bases', group: 'batting', format: 'int', desc: true, description: '1B + 2·2B + 3·3B + 4·HR.' },
	{ key: 'r', abbr: 'R', label: 'Runs', group: 'batting', format: 'int', desc: true, description: 'Times the batter came around to score.' },
	{ key: 'rbi', abbr: 'RBI', label: 'Runs batted in', group: 'batting', format: 'int', desc: true, description: 'Runs scored on the batter’s plate appearance.' },
	{ key: 'bb', abbr: 'BB', label: 'Walks', group: 'batting', format: 'int', desc: true, description: 'Walks taken, including hit by pitch.' },
	{ key: 'sf', abbr: 'SF', label: 'Sac flies', group: 'batting', format: 'int', desc: true, description: 'Fly outs that scored a runner.' },
	{ key: 'sb', abbr: 'SB', label: 'Steals', group: 'batting', format: 'int', desc: true, description: 'Bases stolen.' },
	{ key: 'avg', abbr: 'AVG', label: 'Batting average', group: 'batting', format: 'rate3', desc: true, description: 'Hits per at-bat.' },
	{ key: 'obp', abbr: 'OBP', label: 'On-base percentage', group: 'batting', format: 'rate3', desc: true, description: '(H + BB) / (AB + BB + SF).' },
	{ key: 'slg', abbr: 'SLG', label: 'Slugging', group: 'batting', format: 'rate3', desc: true, description: 'Total bases per at-bat.' },
	{ key: 'ops', abbr: 'OPS', label: 'On-base plus slugging', group: 'batting', format: 'rate3', desc: true, description: 'OBP + SLG.' },
	{ key: 'ops_plus', abbr: 'OPS+', label: 'OPS plus', group: 'batting', format: 'plus', desc: true, description: '100 × (OBP / league OBP + SLG / league SLG − 1). 100 is league average.' },
	{ key: 'iso', abbr: 'ISO', label: 'Isolated power', group: 'batting', format: 'rate3', desc: true, description: 'Extra bases per at-bat: (2B + 2·3B + 3·HR) / AB.' },
	{ key: 'bp', abbr: 'BP', label: 'Big plays', group: 'fielding', format: 'int', desc: true, description: 'Diving, jumping and wall catches credited to the fielder.' },
	{ key: 'app', abbr: 'APP', label: 'Appearances', group: 'pitching', format: 'int', desc: true, description: 'Games with at least one pitch thrown.' },
	{ key: 'ip', abbr: 'IP', label: 'Innings pitched', group: 'pitching', format: 'ip', desc: true, description: 'Outs recorded ÷ 3.' },
	{ key: 'w', abbr: 'W', label: 'Wins', group: 'pitching', format: 'int', desc: true, description: 'Pitcher wins.' },
	{ key: 'er', abbr: 'ER', label: 'Earned runs', group: 'pitching', format: 'int', description: 'Runs charged to the pitcher.' },
	{ key: 'ha', abbr: 'H', label: 'Hits allowed', group: 'pitching', format: 'int', description: 'Hits given up.' },
	{ key: 'bba', abbr: 'BB', label: 'Walks allowed', group: 'pitching', format: 'int', description: 'Batters walked or hit.' },
	{ key: 'k', abbr: 'K', label: 'Strikeouts', group: 'pitching', format: 'int', desc: true, description: 'Batters struck out.' },
	{ key: 'pitches', abbr: 'P', label: 'Pitches', group: 'pitching', format: 'int', desc: true, description: 'Pitches thrown.' },
	{ key: 'star_p', abbr: 'Star P', label: 'Star pitches', group: 'pitching', format: 'int', desc: true, description: 'Star pitches thrown.' },
	{ key: 'era', abbr: 'ERA', label: 'Earned run average', group: 'pitching', format: 'dec2', description: 'Earned runs per full game (7 innings in this league).' },
	{ key: 'era_minus', abbr: 'ERA−', label: 'ERA minus', group: 'pitching', format: 'plus', description: 'Park-adjusted ERA against the league, 100 is average and lower is better.' },
	{ key: 'whip', abbr: 'WHIP', label: 'Walks + hits per inning', group: 'pitching', format: 'dec2', description: '(BB + H allowed) / IP.' },
	{ key: 'k_bb', abbr: 'K/BB', label: 'Strikeouts per walk', group: 'pitching', format: 'dec1', desc: true, description: 'K ÷ BB allowed.' },
	{ key: 'p_k', abbr: 'P/K', label: 'Pitches per strikeout', group: 'pitching', format: 'dec1', description: 'Pitches thrown per strikeout.' },
	{ key: 'p_ip', abbr: 'P/IP', label: 'Pitches per inning', group: 'pitching', format: 'dec1', description: 'Pitches thrown per inning.' },
	{ key: 'k_ip', abbr: 'K/IP', label: 'Strikeouts per inning', group: 'pitching', format: 'dec2', desc: true, description: 'K ÷ IP.' },
	{ key: 'rough_lob', abbr: 'LOB', label: 'Rough left on base', group: 'team', format: 'dec1', teamOnly: true, description: '(H + BB − R) per game. Runners reached who never scored.' },
	{ key: 'hr_ratio', abbr: 'HR%', label: 'Home run rate', group: 'team', format: 'pct', desc: true, teamOnly: true, description: 'HR per at-bat.' },
	{ key: 'hits_per_run', abbr: 'H/R', label: 'Hits per run', group: 'team', format: 'dec2', teamOnly: true, description: 'Hits needed for each run scored.' },
	{ key: 'runs_per_hit', abbr: 'R/H', label: 'Runs per hit', group: 'team', format: 'dec2', desc: true, teamOnly: true, description: 'Runs scored per hit.' }
];

export const COLUMN_BY_KEY = Object.fromEntries(STAT_COLUMNS.map((column) => [column.key, column])) as Record<keyof DerivedLine, StatColumn>;

export const BATTING_TABLE: (keyof DerivedLine)[] = ['gp', 'pa', 'ab', 'h', 'b2', 'b3', 'hr', 'r', 'rbi', 'bb', 'sb', 'avg', 'obp', 'slg', 'ops', 'ops_plus', 'iso'];
export const PITCHING_TABLE: (keyof DerivedLine)[] = ['app', 'ip', 'w', 'er', 'ha', 'bba', 'k', 'pitches', 'star_p', 'era', 'era_minus', 'whip', 'k_bb', 'k_ip', 'p_ip'];
export const TEAM_TABLE: (keyof DerivedLine)[] = ['gp', 'r', 'h', 'hr', 'bb', 'sb', 'bp', 'avg', 'obp', 'slg', 'ops_plus', 'iso', 'era', 'era_minus', 'whip', 'k_ip', 'rough_lob', 'hits_per_run'];

export function formatStat(value: number | boolean | undefined, format: StatColumn['format']): string {
	if (typeof value === 'boolean') return value ? '✓' : '';
	if (value === undefined || Number.isNaN(value) || !Number.isFinite(value)) return '—';
	switch (format) {
		case 'int':
			return String(Math.round(value));
		case 'rate3': {
			const fixed = value.toFixed(3);
			return value < 1 ? fixed.replace(/^0/, '') : fixed;
		}
		case 'dec2':
			return value.toFixed(2);
		case 'dec1':
			return value.toFixed(1);
		case 'plus':
			return String(Math.round(value));
		case 'pct':
			return `${(value * 100).toFixed(1)}%`;
		case 'ip': {
			const outs = Math.round(value * 3);
			return `${Math.floor(outs / 3)}.${outs % 3}`;
		}
	}
}

// ── Standings from games ───────────────────────────────────────────────────

export interface Split {
	gp: number;
	w: number;
	l: number;
	rf: number;
	ra: number;
}

export interface StandingRow {
	name: string;
	rank: number;
	total: Split;
	home: Split;
	away: Split;
	pct: number;
	diff: number;
	rfpg: number;
	rapg: number;
	/** Offensive and defensive rank among entrants. */
	o_rank: number;
	d_rank: number;
	home_park?: number;
	/** (Runs at home) ÷ (runs away), per game — above 1 means the home park plays hot. */
	park_factor: number;
	streak: string;
	last5: ('W' | 'L')[];
	/** Ties are broken by head-to-head record. */
	h2h?: string;
}

function emptySplit(): Split {
	return { gp: 0, w: 0, l: 0, rf: 0, ra: 0 };
}

function pctOf(split: Split): number {
	return split.gp === 0 ? 0 : split.w / split.gp;
}

/** Regular-season standings from played games, following the league sheet's tiebreaks. */
export function standings(names: string[], games: CompetitionGame[], homeParks: Record<string, number | undefined> = {}): StandingRow[] {
	const rows = new Map<string, StandingRow>();
	for (const name of names) {
		rows.set(name, {
			name,
			rank: 0,
			total: emptySplit(),
			home: emptySplit(),
			away: emptySplit(),
			pct: 0,
			diff: 0,
			rfpg: 0,
			rapg: 0,
			o_rank: 0,
			d_rank: 0,
			home_park: homeParks[name],
			park_factor: NaN,
			streak: '',
			last5: []
		});
	}
	const results = new Map<string, ('W' | 'L')[]>();
	const h2h = new Map<string, number>(); // "a|b" → wins for a over b
	for (const game of [...games].sort((a, b) => a.played_at - b.played_at)) {
		if (game.series) continue; // playoff games don't count toward the table
		const homeRow = rows.get(game.home);
		const awayRow = rows.get(game.away);
		if (!homeRow || !awayRow) continue;
		const homeWon = game.home_score > game.away_score;
		for (const [row, split, rf, ra, won, opponent] of [
			[homeRow, homeRow.home, game.home_score, game.away_score, homeWon, game.away],
			[awayRow, awayRow.away, game.away_score, game.home_score, !homeWon, game.home]
		] as const) {
			for (const target of [row.total, split]) {
				target.gp += 1;
				target.rf += rf;
				target.ra += ra;
				if (won) target.w += 1;
				else target.l += 1;
			}
			const list = results.get(row.name) ?? [];
			list.push(won ? 'W' : 'L');
			results.set(row.name, list);
			if (won) h2h.set(`${row.name}|${opponent}`, (h2h.get(`${row.name}|${opponent}`) ?? 0) + 1);
		}
	}
	const list = [...rows.values()];
	for (const row of list) {
		row.pct = pctOf(row.total);
		row.diff = row.total.rf - row.total.ra;
		row.rfpg = row.total.gp ? row.total.rf / row.total.gp : 0;
		row.rapg = row.total.gp ? row.total.ra / row.total.gp : 0;
		const homeRuns = row.home.rf + row.home.ra;
		const awayRuns = row.away.rf + row.away.ra;
		row.park_factor = row.home.gp && row.away.gp ? homeRuns / row.home.gp / (awayRuns / row.away.gp) : NaN;
		const seq = results.get(row.name) ?? [];
		row.last5 = seq.slice(-5);
		if (seq.length) {
			const last = seq[seq.length - 1];
			let n = 0;
			for (let i = seq.length - 1; i >= 0 && seq[i] === last; i--) n++;
			row.streak = `${last}${n}`;
		}
	}
	const byOffense = [...list].sort((a, b) => b.rfpg - a.rfpg);
	const byDefense = [...list].sort((a, b) => a.rapg - b.rapg);
	for (const row of list) {
		row.o_rank = byOffense.findIndex((candidate) => candidate.rfpg === row.rfpg) + 1;
		row.d_rank = byDefense.findIndex((candidate) => candidate.rapg === row.rapg) + 1;
	}
	list.sort((a, b) => {
		if (b.pct !== a.pct) return b.pct - a.pct;
		// Head-to-head, then run differential.
		const ab = h2h.get(`${a.name}|${b.name}`) ?? 0;
		const ba = h2h.get(`${b.name}|${a.name}`) ?? 0;
		if (ab !== ba) return ba - ab;
		return b.diff - a.diff;
	});
	list.forEach((row, index) => {
		row.rank = index + 1;
		const above = list[index - 1];
		if (above && above.pct === row.pct) {
			const wins = h2h.get(`${row.name}|${above.name}`) ?? 0;
			const losses = h2h.get(`${above.name}|${row.name}`) ?? 0;
			if (wins + losses) row.h2h = `${wins}–${losses} vs ${above.name}`;
		}
	});
	return list;
}

/** Sum every character line an owner fielded into one team line. */
export function teamLines(lines: CharacterLine[]): Map<string, StatLine> {
	const byOwner = new Map<string, CharacterLine[]>();
	for (const line of lines) {
		const list = byOwner.get(line.owner) ?? [];
		list.push(line);
		byOwner.set(line.owner, list);
	}
	const out = new Map<string, StatLine>();
	for (const [owner, list] of byOwner) {
		const total = sumLines(list);
		// A team's games are its lines' games ÷ 9 fielders.
		total.gp = Math.round(total.gp / 9);
		out.set(owner, total);
	}
	return out;
}

/** Roll up lines that share a character across owners (or seasons). */
export function characterTotals<T extends CharacterLine>(lines: T[]): (CharacterLine & { owners: string[] })[] {
	const byChar = new Map<string, { lines: T[]; owners: Set<string> }>();
	for (const line of lines) {
		const entry = byChar.get(line.character) ?? { lines: [], owners: new Set<string>() };
		entry.lines.push(line);
		entry.owners.add(line.owner);
		byChar.set(line.character, entry);
	}
	return [...byChar.entries()].map(([character, entry]) => ({
		...sumLines(entry.lines),
		character,
		slot: 1,
		owner: [...entry.owners].join(', '),
		owners: [...entry.owners]
	}));
}
