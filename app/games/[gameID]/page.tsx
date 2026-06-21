'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { getGameStats, getMatchups, type GameSummary, type ScoringPlay } from '@/lib/api';
import { useTagsets } from '@/lib/useTagsets';
import { stadiums, characterName } from '@/lib/data/characters';
import { teamName, teamImage } from '@/lib/data/teamNames';
import { tagSetName, ordinal } from '@/lib/gameDisplay';
import { atBatResultName } from '@/lib/mssb/constants';
import { getAvg, getOps, getOppAvg, getERA, getIpString } from '@/lib/statCalcs';
import { msToTime } from '@/lib/time';
import { Spinner, ErrorState, Badge, PlayerLink, Panel, PanelHeader } from '@/components/ui';
import LineScore, { MetaItem } from '@/components/LineScore';

interface RosterEntry {
	name: string;
	batting: any;
	pitching: any;
	fielding: any;
	misc: any;
}

// Order roster entries by the in-game batting order (char IDs from the games
// endpoint). Any character with stats but missing from the order array is
// appended so nobody is dropped from the box score.
function buildRoster(teamStats: any, order: number[] = []): RosterEntry[] {
	const stats = teamStats ?? {};
	const toEntry = (name: string): RosterEntry => ({
		name,
		batting: stats[name].Batting,
		pitching: stats[name].Pitching,
		fielding: stats[name].Fielding,
		misc: stats[name].Misc
	});

	const ordered: RosterEntry[] = [];
	const seen = new Set<string>();
	for (const id of order) {
		const name = characterName(id);
		if (stats[name] && !seen.has(name)) {
			ordered.push(toEntry(name));
			seen.add(name);
		}
	}
	for (const name of Object.keys(stats)) {
		if (!seen.has(name)) ordered.push(toEntry(name));
	}
	return ordered;
}

function sum(roster: RosterEntry[], group: 'batting' | 'pitching' | 'fielding', stat: string): number {
	return roster.reduce((total, entry) => total + (entry[group]?.[stat] ?? 0), 0);
}

function BattingTable({ roster, captain }: { roster: RosterEntry[]; captain: string }) {
	const ab = sum(roster, 'batting', 'summary_at_bats');
	const hits = sum(roster, 'batting', 'summary_hits');
	const bb = sum(roster, 'batting', 'summary_walks_bb') + sum(roster, 'batting', 'summary_walks_hbp');
	const pa = hits + bb + sum(roster, 'batting', 'summary_sac_flys');
	const slg =
		ab === 0
			? 0
			: (sum(roster, 'batting', 'singles') +
					2 * sum(roster, 'batting', 'doubles') +
					3 * sum(roster, 'batting', 'triples') +
					4 * sum(roster, 'batting', 'summary_homeruns')) /
				ab;
	const obp = pa === 0 ? 0 : (hits + bb) / pa;

	return (
		<table className="stat-table">
			<thead>
				<tr>
					<th>Batters</th>
					<th title="At Bats">AB</th>
					<th title="Hits">H</th>
					<th title="Runs Batted In">RBI</th>
					<th title="Home Runs">HR</th>
					<th title="Walks (BB + HBP)">BB</th>
					<th title="Batting Average">AVG</th>
					<th title="On-base Plus Slugging">OPS</th>
				</tr>
			</thead>
			<tbody>
				{roster.map(({ name, batting }) => (
					<tr key={name}>
						<td>
							{name}
							{captain === name && <span className="ml-1 text-star-400">✪</span>}
						</td>
						<td>{batting.summary_at_bats}</td>
						<td>{batting.summary_hits}</td>
						<td>{batting.summary_rbi}</td>
						<td>{batting.summary_homeruns}</td>
						<td>{batting.summary_walks_bb + batting.summary_walks_hbp}</td>
						<td>{getAvg(batting).toFixed(3)}</td>
						<td>{getOps(batting).toFixed(3)}</td>
					</tr>
				))}
				<tr className="font-bold text-fog-100">
					<td>Total</td>
					<td>{ab}</td>
					<td>{hits}</td>
					<td>{sum(roster, 'batting', 'summary_rbi')}</td>
					<td>{sum(roster, 'batting', 'summary_homeruns')}</td>
					<td>{bb}</td>
					<td>{(ab === 0 ? 0 : hits / ab).toFixed(3)}</td>
					<td>{(obp + slg).toFixed(3)}</td>
				</tr>
			</tbody>
		</table>
	);
}

function PitchingTable({ roster, captain }: { roster: RosterEntry[]; captain: string }) {
	const pitchers = roster.filter((entry) => entry.pitching?.batters_faced !== 0);
	const outs = sum(pitchers, 'pitching', 'outs_pitched');
	const hits = sum(pitchers, 'pitching', 'hits_allowed');
	const runs = sum(pitchers, 'pitching', 'runs_allowed');
	const bb = sum(pitchers, 'pitching', 'walks_bb') + sum(pitchers, 'pitching', 'walks_hbp');
	const oppAb = sum(pitchers, 'pitching', 'batters_faced') - bb;

	return (
		<table className="stat-table">
			<thead>
				<tr>
					<th>Pitchers</th>
					<th title="Innings Pitched">IP</th>
					<th title="Hits Allowed">H</th>
					<th title="Runs Allowed">R</th>
					<th title="Strikeouts">K</th>
					<th title="Walks (BB + HBP)">BB</th>
					<th title="Total Pitches">P</th>
					<th title="Star Pitches Thrown">★P</th>
					<th title="Opponent Batting Average">OppAVG</th>
					<th title="Earned Run Average">ERA</th>
				</tr>
			</thead>
			<tbody>
				{pitchers.map(({ name, pitching }) => (
					<tr key={name}>
						<td>
							{name}
							{captain === name && <span className="ml-1 text-star-400">✪</span>}
						</td>
						<td>{getIpString(pitching)}</td>
						<td>{pitching.hits_allowed}</td>
						<td>{pitching.runs_allowed}</td>
						<td>{pitching.strikeouts_pitched}</td>
						<td>{pitching.walks_bb + pitching.walks_hbp}</td>
						<td>{pitching.total_pitches}</td>
						<td>{pitching.star_pitches_thrown}</td>
						<td>{getOppAvg(pitching)}</td>
						<td>{getERA(pitching)}</td>
					</tr>
				))}
				<tr className="font-bold text-fog-100">
					<td>Total</td>
					<td>{Math.floor(outs / 3) + '.' + (outs % 3)}</td>
					<td>{hits}</td>
					<td>{runs}</td>
					<td>{sum(pitchers, 'pitching', 'strikeouts_pitched')}</td>
					<td>{bb}</td>
					<td>{sum(pitchers, 'pitching', 'total_pitches')}</td>
					<td>{sum(pitchers, 'pitching', 'star_pitches_thrown')}</td>
					<td>{(oppAb === 0 ? 0 : hits / oppAb).toFixed(3)}</td>
					<td>{(outs === 0 ? (runs === 0 ? 0 : 99.99) : runs / (outs / 27)).toFixed(2)}</td>
				</tr>
			</tbody>
		</table>
	);
}

// Position keys as they appear in the fielding stats (outs_per_* / pitches_per_*).
const POSITIONS: { key: string; label: string }[] = [
	{ key: 'p', label: 'P' },
	{ key: 'c', label: 'C' },
	{ key: '1b', label: '1B' },
	{ key: '2b', label: '2B' },
	{ key: '3b', label: '3B' },
	{ key: 'ss', label: 'SS' },
	{ key: 'lf', label: 'LF' },
	{ key: 'cf', label: 'CF' },
	{ key: 'rf', label: 'RF' }
];

// Derive the positions a player fielded, ordered by how much they played there
// (pitches + outs), so a player's primary position shows first.
function playerPositions(fielding: any): string {
	if (!fielding) return '—';
	const played = POSITIONS.map((p) => ({
		label: p.label,
		weight: (fielding[`pitches_per_${p.key}`] ?? 0) + (fielding[`outs_per_${p.key}`] ?? 0)
	}))
		.filter((p) => p.weight > 0)
		.sort((a, b) => b.weight - a.weight);
	return played.length > 0 ? played.map((p) => p.label).join(', ') : '—';
}

const FIELDING_COLS: { key: string; label: string; full: string }[] = [
	{ key: 'big_plays', label: 'BP', full: 'Big Plays' },
	{ key: 'diving_catches', label: 'DC', full: 'Diving Catches' },
	{ key: 'jump_catches', label: 'JC', full: 'Jump Catches' },
	{ key: 'wall_jumps', label: 'WJ', full: 'Wall Jumps' },
	{ key: 'bobbles', label: 'BOB', full: 'Bobbles' }
];

function FieldingTable({ roster, captain }: { roster: RosterEntry[]; captain: string }) {
	return (
		<table className="stat-table">
			<thead>
				<tr>
					<th>Fielders</th>
					<th title="Positions">POS</th>
					{FIELDING_COLS.map((col) => (
						<th key={col.key} title={col.full}>
							{col.label}
						</th>
					))}
				</tr>
			</thead>
			<tbody>
				{roster.map(({ name, fielding }) => (
					<tr key={name}>
						<td>
							{name}
							{captain === name && <span className="ml-1 text-star-400">✪</span>}
						</td>
						<td>{playerPositions(fielding)}</td>
						{FIELDING_COLS.map((col) => (
							<td key={col.key}>{fielding?.[col.key] ?? 0}</td>
						))}
					</tr>
				))}
				<tr className="font-bold text-fog-100">
					<td>Total</td>
					<td>—</td>
					{FIELDING_COLS.map((col) => (
						<td key={col.key}>{sum(roster, 'fielding', col.key)}</td>
					))}
				</tr>
			</tbody>
		</table>
	);
}

const MISC_STATS: { group: 'batting' | 'fielding'; stat: string; label: string }[] = [
	{ group: 'batting', stat: 'doubles', label: 'Doubles' },
	{ group: 'batting', stat: 'triples', label: 'Triples' },
	{ group: 'batting', stat: 'perfect_hits', label: 'Perfect Contacts' }
];

function MiscStats({ roster }: { roster: RosterEntry[] }) {
	const lines = MISC_STATS.map(({ group, stat, label }) => {
		const entries = roster
			.filter((entry) => (entry[group]?.[stat] ?? 0) > 0)
			.map((entry) => `${entry.name} ${entry[group][stat]}`);
		return entries.length > 0 ? { label, text: entries.join(', ') } : null;
	}).filter(Boolean) as { label: string; text: string }[];

	if (lines.length === 0) return null;
	return (
		<dl className="space-y-1 px-4 py-3 text-sm text-fog-300">
			{lines.map(({ label, text }) => (
				<div key={label}>
					<dt className="inline font-semibold text-fog-100">{label}: </dt>
					<dd className="inline">{text}</dd>
				</div>
			))}
		</dl>
	);
}

// Star hits are intentionally excluded here (shown separately below the chart)
// so they don't dwarf the ordinary contact-quality bars.
const CONTACT_CATS: { key: string; label: string }[] = [
	{ key: 'sour_hits', label: 'Sour' },
	{ key: 'nice_hits', label: 'Nice' },
	{ key: 'perfect_hits', label: 'Perfect' }
];

const AWAY_COLOR = '#4f9dff';
const HOME_COLOR = '#f43f5e';

function ContactQuality({
	awayRoster,
	homeRoster,
	awayUser,
	homeUser
}: {
	awayRoster: RosterEntry[];
	homeRoster: RosterEntry[];
	awayUser: string;
	homeUser: string;
}) {
	const data = CONTACT_CATS.map(({ key, label }) => ({
		label,
		away: sum(awayRoster, 'batting', key),
		home: sum(homeRoster, 'batting', key)
	}));
	const max = Math.max(1, ...data.flatMap((d) => [d.away, d.home]));
	const PLOT = 150;
	const awayStars = sum(awayRoster, 'batting', 'star_hits');
	const homeStars = sum(homeRoster, 'batting', 'star_hits');

	const Bar = ({ value, color }: { value: number; color: string }) => (
		<div className="flex flex-col items-center">
			<span className="mb-1 text-xs font-semibold tabular-nums text-fog-300">{value}</span>
			<div
				className="w-7 rounded-t"
				style={{ height: `${(value / max) * PLOT}px`, backgroundColor: color }}
			/>
		</div>
	);

	return (
		<Panel>
			<PanelHeader title="Contact Quality" />
			<div className="px-4 py-5">
				<div className="flex items-end justify-around">
					{data.map((d) => (
						<div key={d.label} className="flex flex-1 flex-col items-center gap-2">
							<div className="flex items-end gap-3">
								<Bar value={d.away} color={AWAY_COLOR} />
								<Bar value={d.home} color={HOME_COLOR} />
							</div>
							<span className="text-xs font-semibold uppercase tracking-wide text-fog-500">
								{d.label}
							</span>
						</div>
					))}
				</div>
				<div className="mt-5 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 border-t border-night-700 pt-4 text-sm">
					<span className="flex items-center gap-2 text-fog-300">
						<span className="h-3 w-3 rounded-sm" style={{ backgroundColor: AWAY_COLOR }} />
						{awayUser}
					</span>
					<span className="flex items-center gap-2 text-fog-300">
						<span className="h-3 w-3 rounded-sm" style={{ backgroundColor: HOME_COLOR }} />
						{homeUser}
					</span>
					<span className="text-fog-300">
						<span className="text-star-400">✪</span> Star hits — {awayUser} {awayStars} · {homeUser}{' '}
						{homeStars}
					</span>
				</div>
			</div>
		</Panel>
	);
}

function TeamPanel({
	title,
	roster,
	captain
}: {
	title: string;
	roster: RosterEntry[];
	captain: string;
}) {
	const [tab, setTab] = useState<'batting' | 'fielding'>('batting');

	const toggle = (
		<div className="flex overflow-hidden rounded-lg border border-night-600 text-xs">
			{(['batting', 'fielding'] as const).map((view) => (
				<button
					key={view}
					className={`px-3 py-1 font-display font-semibold uppercase tracking-wider transition-colors ${
						tab === view ? 'bg-rio-500 text-white' : 'hover:bg-night-700'
					}`}
					onClick={() => setTab(view)}
				>
					{view}
				</button>
			))}
		</div>
	);

	return (
		<Panel>
			<PanelHeader title={title} action={toggle} />
			<div className="overflow-x-auto">
				{tab === 'batting' ? (
					<BattingTable roster={roster} captain={captain} />
				) : (
					<FieldingTable roster={roster} captain={captain} />
				)}
			</div>
			<div className="overflow-x-auto border-t border-night-700">
				<PitchingTable roster={roster} captain={captain} />
			</div>
			<div className="border-t border-night-700">
				<MiscStats roster={roster} />
			</div>
		</Panel>
	);
}

function GameLineScore({ info }: { info: GameSummary }) {
	const linescore = info.linescore;
	if (!linescore) return null;
	const [away, home] = linescore;
	const innings = Math.max(away.length, home.length);
	if (innings === 0) return null;
	const homeWon = info.home_score > info.away_score;

	const firstPitch = info.date_time_start ? new Date(info.date_time_start * 1000).toLocaleString() : '—';
	const gameTime =
		info.date_time_start && info.date_time_end
			? msToTime((info.date_time_end - info.date_time_start) * 1000)
			: '—';

	return (
		<LineScore
			innings={innings}
			teams={[
				{ label: info.away_user, runs: away, total: info.away_score, highlight: !homeWon },
				{ label: info.home_user, runs: home, total: info.home_score, highlight: homeWon }
			]}
			meta={
				<>
					<MetaItem label="First Pitch" value={firstPitch} />
					<MetaItem label="Game Time" value={gameTime} />
					<MetaItem label="Stadium" value={stadiums[info.stadium] ?? 'Unknown'} />
				</>
			}
		/>
	);
}

function ScoringPlayRow({ play }: { play: ScoringPlay }) {
	const awayBatting = play.half_inning === 0;
	// The endpoint reports the score BEFORE the play; add the RBIs to the batting side.
	const awayAfter = play.away_score + (awayBatting ? play.result_rbi : 0);
	const homeAfter = play.home_score + (awayBatting ? 0 : play.result_rbi);
	const result = atBatResultName(play.result_of_ab);

	return (
		<div className="flex items-center justify-between gap-3 px-4 py-2 text-sm">
			<div className="flex min-w-0 items-center gap-2">
				<span className="truncate text-fog-100">{characterName(play.batter)}</span>
				{result && <span className="text-fog-500">— {result}</span>}
				{play.result_rbi > 0 && (
					<span className="shrink-0 text-fog-300">
						{play.result_rbi} RBI
					</span>
				)}
			</div>
			<span className="shrink-0 font-display font-bold tabular-nums text-fog-100">
				<span className={awayBatting ? '' : 'text-fog-500'}>{awayAfter}</span>
				<span className="text-fog-500">–</span>
				<span className={awayBatting ? 'text-fog-500' : ''}>{homeAfter}</span>
			</span>
		</div>
	);
}

function ScoringSummary({ info }: { info: GameSummary }) {
	const plays = info.scoring_plays;
	if (!plays || plays.length === 0) return null;

	// Group consecutive plays by half-inning, preserving event order.
	const groups: { inning: number; half: number; plays: ScoringPlay[] }[] = [];
	for (const play of plays) {
		const last = groups[groups.length - 1];
		if (last && last.inning === play.inning && last.half === play.half_inning) {
			last.plays.push(play);
		} else {
			groups.push({ inning: play.inning, half: play.half_inning, plays: [play] });
		}
	}

	return (
		<Panel className="flex h-full flex-col">
			<PanelHeader title="Scoring Summary" />
			<div className="min-h-0 flex-1 divide-y divide-night-800 overflow-y-auto">
				{groups.map((group, gi) => (
					<div key={gi}>
						<div className="bg-night-850 px-4 py-1.5 font-display text-xs font-semibold uppercase tracking-wider">
							<span style={{ color: group.half === 0 ? AWAY_COLOR : HOME_COLOR }}>
								{group.half === 0 ? 'Top' : 'Bottom'} {ordinal(group.inning)}
							</span>
							<span className="text-fog-500">
								{' '}
								— {group.half === 0 ? info.away_user : info.home_user}
							</span>
						</div>
						{group.plays.map((play) => (
							<ScoringPlayRow key={play.event_num} play={play} />
						))}
					</div>
				))}
			</div>
		</Panel>
	);
}

function TeamScore({
	user,
	elo,
	logo,
	score,
	won,
	align
}: {
	user: string;
	elo: number | undefined;
	logo: string | undefined;
	score: number;
	won: boolean;
	align: 'left' | 'right';
}) {
	const img = logo ? (
		// eslint-disable-next-line @next/next/no-img-element
		<img src={teamImage(logo)} alt={logo} className="h-16 w-16 object-contain" />
	) : null;
	return (
		<div className={`flex items-center gap-4 ${align === 'right' ? 'flex-row-reverse text-right' : ''}`}>
			{img}
			<div>
				<PlayerLink username={user} className="font-display text-xl font-bold" />
				{elo !== undefined && <p className="text-xs text-fog-500">ELO {Math.round(elo)}</p>}
			</div>
			<span className={`ml-auto font-display text-5xl font-bold tabular-nums ${won ? 'text-fog-100' : 'text-fog-500'} ${align === 'right' ? 'mr-auto !ml-0' : ''}`}>
				{score}
			</span>
		</div>
	);
}

export default function GamePage({ params }: { params: Promise<{ gameID: string }> }) {
	const { gameID } = use(params);
	const [stats, setStats] = useState<any | null>(null);
	const [info, setInfo] = useState<GameSummary | null>(null);
	const [error, setError] = useState<string | null>(null);
	const tagsets = useTagsets();

	useEffect(() => {
		let cancelled = false;
		(async () => {
			try {
				const id = Number(gameID);
				const gameStats = await getGameStats(id);
				const [user1, user2] = Object.keys(gameStats);
				if (!user1 || !user2) throw new Error('no stats');
				const matchups = await getMatchups(user1, user2, { linescore: true });
				const game = matchups.find((g) => g.game_id === id) ?? null;
				if (!game) throw new Error('no game');
				if (!cancelled) {
					setStats(gameStats);
					setInfo(game);
				}
			} catch {
				if (!cancelled) setError('Could not load this game. It may not exist or the API is unavailable.');
			}
		})();
		return () => {
			cancelled = true;
		};
	}, [gameID]);

	if (error) return <ErrorState message={error} />;
	if (!stats || !info) return <Spinner label="Loading box score…" />;

	const homeRoster = buildRoster(stats[info.home_user], info.home_roster);
	const awayRoster = buildRoster(stats[info.away_user], info.away_roster);
	const homeWon = info.home_score > info.away_score;
	const homeElo = homeWon ? info.winner_result_elo : info.loser_result_elo;
	const awayElo = homeWon ? info.loser_result_elo : info.winner_result_elo;
	const homeLogo = teamName(homeRoster.map((r) => r.name), info.home_captain ?? '');
	const awayLogo = teamName(awayRoster.map((r) => r.name), info.away_captain ?? '');
	const mode = tagSetName(tagsets, info.game_mode as unknown as number);

	return (
		<div className="space-y-8">
			{/* Score header */}
			<div className="panel sticky top-16 z-40 overflow-hidden p-6 shadow-lg shadow-night-950/50">
				<div
					className="pointer-events-none absolute inset-0"
					style={{ backgroundImage: 'radial-gradient(ellipse 70% 120% at 50% -20%, rgb(230 0 18 / 0.18), transparent)' }}
				/>
				<div className="relative grid items-center gap-6 sm:grid-cols-[1fr_auto_1fr]">
					<TeamScore
						user={info.away_user}
						elo={awayElo}
						logo={awayLogo}
						score={info.away_score}
						won={!homeWon}
						align="left"
					/>
					<div className="text-center">
						<p className="font-display text-sm font-bold uppercase tracking-widest text-fog-500">
							Final
							{info.innings_played !== info.innings_selected && (
								<span className="ml-1">({info.innings_played}/{info.innings_selected})</span>
							)}
						</p>
						{mode && (
							<Link href={`/modes/${encodeURIComponent(mode)}`} className="mt-2 inline-block">
								<Badge color="red">{mode}</Badge>
							</Link>
						)}
					</div>
					<TeamScore
						user={info.home_user}
						elo={homeElo}
						logo={homeLogo}
						score={info.home_score}
						won={homeWon}
						align="right"
					/>
				</div>
			</div>

			{/* Line score */}
			<GameLineScore info={info} />

			{/* Box scores */}
			<div className="grid gap-6 lg:grid-cols-2">
				<TeamPanel title={`${info.away_user} (Away)`} roster={awayRoster} captain={info.away_captain ?? ''} />
				<TeamPanel title={`${info.home_user} (Home)`} roster={homeRoster} captain={info.home_captain ?? ''} />
			</div>

			{/* Contact quality + scoring summary side by side. The contact graph
			    sets the row height; the scoring summary fills it and scrolls. */}
			<div className="grid items-stretch gap-6 lg:grid-cols-2">
				<ContactQuality
					awayRoster={awayRoster}
					homeRoster={homeRoster}
					awayUser={info.away_user}
					homeUser={info.home_user}
				/>
				<div className="relative">
					<div className="lg:absolute lg:inset-0">
						<ScoringSummary info={info} />
					</div>
				</div>
			</div>
		</div>
	);
}
