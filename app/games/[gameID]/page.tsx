'use client';

/* eslint-disable @next/next/no-img-element */

// Completed-game page — MLB Gameday × esports match hub. Stadium-themed hero
// scoreboard, tabbed sections (Overview / Play-by-Play / Field / Box Score),
// an AB-by-AB timeline fed by /games/events/, and the 3D Rio Visualizer for
// replaying and what-if-ing every ball in play.

import { use, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import {
	getGameStats,
	getMatchups,
	getGameEvents,
	type GameSummary,
	type ScoringPlay
} from '@/lib/api';
import { useTagsets } from '@/lib/useTagsets';
import { stadiums, characterName, characterImage } from '@/lib/data/characters';
import { teamName, teamImage } from '@/lib/data/teamNames';
import { tagSetName, ordinal } from '@/lib/gameDisplay';
import { atBatResultName } from '@/lib/mssb/constants';
import { msToTime } from '@/lib/time';
import type { GameEvent } from '@/lib/mssb/BattingSimulation/eventToSim';
import { groupAtBats, hasBallFlight, linescoreFromEvents } from '@/lib/gameEvents';
import { Spinner, ErrorState, Badge, PlayerLink, Panel, PanelHeader } from '@/components/ui';
import LineScore, { MetaItem } from '@/components/LineScore';
import { buildRoster, sum, TeamPanel, type RosterEntry } from '@/components/game/BoxScore';
import RunFlow from '@/components/game/RunFlow';
import PlayByPlay from '@/components/game/PlayByPlay';
import SprayChart from '@/components/game/SprayChart';
import { getTheme3D } from '@/components/visualizer/stadiumThemes';

const HitVisualizer = dynamic(() => import('@/components/visualizer/HitVisualizer'), {
	ssr: false,
	loading: () => (
		<div className="fixed inset-0 z-[90] flex items-center justify-center bg-night-950/95">
			<Spinner label="Loading visualizer…" />
		</div>
	)
});

const AWAY_COLOR = '#4f9dff';
const HOME_COLOR = '#f43f5e';

// Star hits are intentionally excluded here (shown separately below the chart)
// so they don't dwarf the ordinary contact-quality bars.
const CONTACT_CATS: { key: string; label: string }[] = [
	{ key: 'sour_hits', label: 'Sour' },
	{ key: 'nice_hits', label: 'Nice' },
	{ key: 'perfect_hits', label: 'Perfect' }
];

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
				{play.result_rbi > 0 && <span className="shrink-0 text-fog-300">{play.result_rbi} RBI</span>}
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
							<span className="text-fog-500"> — {group.half === 0 ? info.away_user : info.home_user}</span>
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

function GameLineScore({
	info,
	linescore
}: {
	info: GameSummary;
	linescore: [(number | 'X')[], (number | 'X')[]] | undefined;
}) {
	if (!linescore) return null;
	const [away, home] = linescore;
	const innings = Math.max(away.length, home.length);
	if (innings === 0) return null;
	const homeWon = info.home_score > info.away_score;

	const firstPitch = info.date_time_start
		? new Date(info.date_time_start * 1000).toLocaleString()
		: '—';
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

function EloLine({ elo, delta }: { elo: number | undefined; delta: number | null }) {
	if (elo === undefined) return null;
	return (
		<p className="text-xs text-fog-500">
			ELO {Math.round(elo)}
			{delta !== null && (
				<span className={delta >= 0 ? 'text-emerald-400' : 'text-rio-400'}>
					{' '}
					{delta >= 0 ? '+' : ''}
					{Math.round(delta)}
				</span>
			)}
		</p>
	);
}

function HeroSide({
	user,
	captain,
	elo,
	eloDelta,
	logo,
	won,
	align
}: {
	user: string;
	captain: string;
	elo: number | undefined;
	eloDelta: number | null;
	logo: string | null | undefined;
	won: boolean;
	align: 'left' | 'right';
}) {
	const portrait = captain ? characterImage(captain) : null;
	return (
		<div
			className={`flex items-center gap-4 ${align === 'right' ? 'flex-row-reverse text-right' : ''}`}
		>
			<div className="relative shrink-0">
				{portrait && (
					<img
						src={portrait}
						alt={captain}
						className={`h-20 w-20 rounded-xl border bg-night-900/80 object-contain p-1 sm:h-24 sm:w-24 ${
							won ? 'border-star-500/50' : 'border-night-600'
						}`}
					/>
				)}
				{logo && (
					<img
						src={teamImage(logo)}
						alt={logo}
						className="absolute -bottom-2 -right-2 h-9 w-9 rounded-full border border-night-600 bg-night-950/90 object-contain p-1"
					/>
				)}
			</div>
			<div className="min-w-0">
				{won && <p className="kicker !text-[10px] !text-star-400">Winner</p>}
				<PlayerLink username={user} className="block truncate font-display text-2xl font-bold" />
				<p className="truncate text-xs text-fog-500">{captain || '—'}</p>
				<EloLine elo={elo} delta={eloDelta} />
			</div>
		</div>
	);
}

type Tab = 'overview' | 'plays' | 'field' | 'box';

export default function GamePage({ params }: { params: Promise<{ gameID: string }> }) {
	const { gameID } = use(params);
	const [stats, setStats] = useState<any | null>(null);
	const [info, setInfo] = useState<GameSummary | null>(null);
	const [events, setEvents] = useState<GameEvent[] | null>(null);
	const [eventsFailed, setEventsFailed] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [tab, setTab] = useState<Tab>('overview');
	const [visualized, setVisualized] = useState<GameEvent | null>(null);
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
				if (!cancelled)
					setError('Could not load this game. It may not exist or the API is unavailable.');
			}
		})();
		// Event detail needs a Rio Web deployment with /games/events/ — degrade
		// gracefully (hide the AB-by-AB and field tabs' content) if unavailable.
		(async () => {
			try {
				const res = await getGameEvents(Number(gameID));
				if (!cancelled) setEvents(res.events ?? []);
			} catch {
				if (!cancelled) setEventsFailed(true);
			}
		})();
		return () => {
			cancelled = true;
		};
	}, [gameID]);

	const ballsInPlay = useMemo(
		() => (events ? groupAtBats(events).filter((ab) => hasBallFlight(ab.final)).length : 0),
		[events]
	);

	// Prefer the exact linescore derived from events over the API's
	// scoring-runner reconstruction (which miscounts some games).
	const linescore = useMemo(
		() =>
			events && events.length > 0 && info
				? linescoreFromEvents(events, info.away_score, info.home_score)
				: info?.linescore,
		[events, info]
	);

	if (error) return <ErrorState message={error} />;
	if (!stats || !info) return <Spinner label="Loading game…" />;

	const homeRoster = buildRoster(stats[info.home_user], info.home_roster);
	const awayRoster = buildRoster(stats[info.away_user], info.away_roster);
	const homeWon = info.home_score > info.away_score;
	const homeElo = homeWon ? info.winner_result_elo : info.loser_result_elo;
	const awayElo = homeWon ? info.loser_result_elo : info.winner_result_elo;
	const homeEloDelta =
		info.winner_result_elo !== undefined && info.winner_incoming_elo !== undefined
			? homeWon
				? info.winner_result_elo - info.winner_incoming_elo
				: info.loser_result_elo - info.loser_incoming_elo
			: null;
	const awayEloDelta =
		info.winner_result_elo !== undefined && info.winner_incoming_elo !== undefined
			? homeWon
				? info.loser_result_elo - info.loser_incoming_elo
				: info.winner_result_elo - info.winner_incoming_elo
			: null;
	const homeLogo = teamName(homeRoster.map((r) => r.name), info.home_captain ?? '');
	const awayLogo = teamName(awayRoster.map((r) => r.name), info.away_captain ?? '');
	const mode = tagSetName(tagsets, info.game_mode as number);
	const theme3d = getTheme3D(info.stadium);
	const gameDate = info.date_time_start
		? new Date(info.date_time_start * 1000).toLocaleDateString(undefined, {
				year: 'numeric',
				month: 'short',
				day: 'numeric'
			})
		: null;

	const tabs: { id: Tab; label: string; badge?: string }[] = [
		{ id: 'overview', label: 'Overview' },
		{ id: 'plays', label: 'Play-by-Play', badge: events ? String(groupAtBats(events).length) : undefined },
		{ id: 'field', label: 'Field', badge: events ? String(ballsInPlay) : undefined },
		{ id: 'box', label: 'Box Score' }
	];

	const eventsNotice = eventsFailed ? (
		<Panel>
			<div className="px-6 py-10 text-center">
				<p className="font-display text-lg font-semibold uppercase tracking-wider text-fog-300">
					Event data unavailable
				</p>
				<p className="mx-auto mt-2 max-w-md text-sm text-fog-500">
					The pitch-by-pitch breakdown needs a Rio Web server with the{' '}
					<code className="text-fog-300">/games/events/</code> endpoint. Once the updated API is
					deployed, this game&apos;s full timeline and 3D hit visualizer light up automatically.
				</p>
			</div>
		</Panel>
	) : (
		<Spinner label="Loading events…" />
	);

	return (
		<div className="space-y-6">
			{/* ---- Hero scoreboard ---- */}
			<div className="panel relative overflow-hidden">
				{/* Stadium-tinted backdrop */}
				<div
					className="pointer-events-none absolute inset-0 opacity-25"
					style={{
						backgroundImage: `radial-gradient(ellipse 90% 130% at 50% -30%, ${theme3d.skyTop}, transparent 70%)`
					}}
				/>
				<div
					className="pointer-events-none absolute inset-0"
					style={{
						backgroundImage:
							'radial-gradient(ellipse 70% 120% at 50% -20%, rgb(230 0 18 / 0.14), transparent)'
					}}
				/>

				<div className="relative px-6 pb-5 pt-5">
					<div className="flex flex-wrap items-center justify-between gap-2 text-xs text-fog-500">
						<div className="flex items-center gap-2">
							{mode && (
								<Link href={`/modes/${encodeURIComponent(mode)}`}>
									<Badge color="red">{mode}</Badge>
								</Link>
							)}
							{gameDate && <span>{gameDate}</span>}
						</div>
						<span className="font-display uppercase tracking-widest">
							{stadiums[info.stadium] ?? 'Unknown'}{' '}
							<span className="text-fog-500/60">· {theme3d.label}</span>
						</span>
					</div>

					<div className="mt-4 grid items-center gap-6 sm:grid-cols-[1fr_auto_1fr]">
						<HeroSide
							user={info.away_user}
							captain={info.away_captain ?? ''}
							elo={awayElo}
							eloDelta={awayEloDelta}
							logo={awayLogo}
							won={!homeWon}
							align="left"
						/>

						<div className="text-center">
							<div className="flex items-center justify-center gap-4">
								<span
									className={`font-display text-6xl font-bold tabular-nums sm:text-7xl ${
										!homeWon ? 'text-fog-100' : 'text-fog-500'
									}`}
								>
									{info.away_score}
								</span>
								<div>
									<p className="font-display text-xs font-bold uppercase tracking-widest text-fog-500">
										Final
									</p>
									{info.innings_played !== info.innings_selected && (
										<p className="text-[10px] text-fog-500">
											{info.innings_played}/{info.innings_selected} inn
										</p>
									)}
								</div>
								<span
									className={`font-display text-6xl font-bold tabular-nums sm:text-7xl ${
										homeWon ? 'text-fog-100' : 'text-fog-500'
									}`}
								>
									{info.home_score}
								</span>
							</div>
						</div>

						<HeroSide
							user={info.home_user}
							captain={info.home_captain ?? ''}
							elo={homeElo}
							eloDelta={homeEloDelta}
							logo={homeLogo}
							won={homeWon}
							align="right"
						/>
					</div>
				</div>

				{/* Tab bar */}
				<div className="relative flex overflow-x-auto border-t border-night-700 bg-night-900/80">
					{tabs.map(({ id, label, badge }) => (
						<button
							key={id}
							className={`relative flex items-center gap-1.5 whitespace-nowrap px-5 py-3 font-display text-sm font-bold uppercase tracking-wider transition-colors ${
								tab === id ? 'text-fog-100' : 'text-fog-500 hover:text-fog-300'
							}`}
							onClick={() => setTab(id)}
						>
							{label}
							{badge && (
								<span className="rounded bg-night-700 px-1.5 py-px font-display text-[10px] font-bold text-fog-300">
									{badge}
								</span>
							)}
							{tab === id && <span className="absolute inset-x-3 bottom-0 h-0.5 bg-rio-500" />}
						</button>
					))}
				</div>
			</div>

			{/* ---- Tab content ---- */}
			{tab === 'overview' && (
				<div className="space-y-6">
					<GameLineScore info={info} linescore={linescore} />
					{linescore && (
						<RunFlow linescore={linescore} awayUser={info.away_user} homeUser={info.home_user} />
					)}
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
			)}

			{tab === 'plays' &&
				(events && events.length > 0 ? (
					<PlayByPlay
						events={events}
						awayUser={info.away_user}
						homeUser={info.home_user}
						onVisualize={setVisualized}
					/>
				) : (
					eventsNotice
				))}

			{tab === 'field' &&
				(events && events.length > 0 ? (
					<div className="mx-auto max-w-2xl">
						<SprayChart
							stadiumId={info.stadium}
							events={events}
							awayUser={info.away_user}
							homeUser={info.home_user}
							onVisualize={setVisualized}
						/>
					</div>
				) : (
					eventsNotice
				))}

			{tab === 'box' && (
				<div className="grid gap-6 lg:grid-cols-2">
					<TeamPanel
						title={`${info.away_user} (Away)`}
						roster={awayRoster}
						captain={info.away_captain ?? ''}
					/>
					<TeamPanel
						title={`${info.home_user} (Home)`}
						roster={homeRoster}
						captain={info.home_captain ?? ''}
					/>
				</div>
			)}

			{/* ---- 3D visualizer overlay ---- */}
			{visualized && (
				<HitVisualizer
					stadiumId={info.stadium}
					event={visualized}
					batterUser={visualized.half_inning === 0 ? info.away_user : info.home_user}
					onClose={() => setVisualized(null)}
				/>
			)}
		</div>
	);
}
