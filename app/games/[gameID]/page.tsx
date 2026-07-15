'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { getGameStats, getMatchups, type GameSummary } from '@/lib/api';
import { useTagsets } from '@/lib/useTagsets';
import { stadiums } from '@/lib/data/characters';
import { teamName, teamImage } from '@/lib/data/teamNames';
import { tagSetName } from '@/lib/gameDisplay';
import { getAvg, getOps, getOppAvg, getERA, getIpString } from '@/lib/statCalcs';
import { msToTime } from '@/lib/time';
import { Spinner, ErrorState, Badge, PlayerLink, Panel, PanelHeader } from '@/components/ui';

interface RosterEntry {
	name: string;
	batting: any;
	pitching: any;
	fielding: any;
	misc: any;
}

function buildRoster(teamStats: any): RosterEntry[] {
	return Object.entries(teamStats ?? {}).map(([name, stats]: [string, any]) => ({
		name,
		batting: stats.Batting,
		pitching: stats.Pitching,
		fielding: stats.Fielding,
		misc: stats.Misc
	}));
}

function sum(roster: RosterEntry[], group: 'batting' | 'pitching', stat: string): number {
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
					<th>AB</th>
					<th>H</th>
					<th>RBI</th>
					<th>HR</th>
					<th>BB</th>
					<th>AVG</th>
					<th>OPS</th>
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
					<th>IP</th>
					<th>H</th>
					<th>R</th>
					<th>K</th>
					<th>BB</th>
					<th>OppAVG</th>
					<th>ERA</th>
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
					<td>{(oppAb === 0 ? 0 : hits / oppAb).toFixed(3)}</td>
					<td>{(outs === 0 ? (runs === 0 ? 0 : 99.99) : runs / (outs / 27)).toFixed(2)}</td>
				</tr>
			</tbody>
		</table>
	);
}

const MISC_STATS: { group: 'batting' | 'fielding'; stat: string; label: string }[] = [
	{ group: 'batting', stat: 'doubles', label: 'Doubles' },
	{ group: 'batting', stat: 'triples', label: 'Triples' },
	{ group: 'batting', stat: 'perfect_hits', label: 'Perfect Contacts' },
	{ group: 'fielding', stat: 'wall_jumps', label: 'Wall Jumps' },
	{ group: 'fielding', stat: 'jump_catches', label: 'Jump Catches' },
	{ group: 'fielding', stat: 'diving_catches', label: 'Diving Catches' },
	{ group: 'fielding', stat: 'bobbles', label: 'Bobbles' }
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

function TeamPanel({
	title,
	roster,
	captain
}: {
	title: string;
	roster: RosterEntry[];
	captain: string;
}) {
	return (
		<Panel>
			<PanelHeader title={title} />
			<div className="overflow-x-auto">
				<BattingTable roster={roster} captain={captain} />
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
				const gameStats = await getGameStats(Number(gameID));
				const [user1, user2] = Object.keys(gameStats);
				if (!user1 || !user2) throw new Error('no stats');
				const matchups = await getMatchups(user1, user2);
				const game = matchups.find((g) => g.game_id === Number(gameID)) ?? null;
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

	const homeRoster = buildRoster(stats[info.home_user]);
	const awayRoster = buildRoster(stats[info.away_user]);
	const homeWon = info.home_score > info.away_score;
	const homeElo = homeWon ? info.winner_result_elo : info.loser_result_elo;
	const awayElo = homeWon ? info.loser_result_elo : info.winner_result_elo;
	const homeLogo = teamName(homeRoster.map((r) => r.name), info.home_captain ?? '');
	const awayLogo = teamName(awayRoster.map((r) => r.name), info.away_captain ?? '');
	const mode = tagSetName(tagsets, info.game_mode as number);

	return (
		<div className="space-y-8">
			{/* Score header */}
			<div className="panel relative overflow-hidden p-6">
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

			{/* Box scores */}
			<div className="grid gap-6 lg:grid-cols-2">
				<TeamPanel title={`${info.away_user} (Away)`} roster={awayRoster} captain={info.away_captain ?? ''} />
				<TeamPanel title={`${info.home_user} (Home)`} roster={homeRoster} captain={info.home_captain ?? ''} />
			</div>

			{/* Game info */}
			<Panel>
				<PanelHeader title="Game Info" />
				<dl className="grid gap-4 px-4 py-4 text-sm sm:grid-cols-3">
					<div>
						<dt className="kicker !text-fog-500">First Pitch</dt>
						<dd className="mt-1 text-fog-100">
							{info.date_time_start ? new Date(info.date_time_start * 1000).toLocaleString() : '—'}
						</dd>
					</div>
					<div>
						<dt className="kicker !text-fog-500">Game Time</dt>
						<dd className="mt-1 text-fog-100">
							{info.date_time_start && info.date_time_end
								? msToTime((info.date_time_end - info.date_time_start) * 1000)
								: '—'}
						</dd>
					</div>
					<div>
						<dt className="kicker !text-fog-500">Stadium</dt>
						<dd className="mt-1 text-fog-100">{stadiums[info.stadium] ?? '—'}</dd>
					</div>
				</dl>
			</Panel>
		</div>
	);
}
