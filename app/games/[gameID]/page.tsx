'use client';

/* eslint-disable @next/next/no-img-element */

// Completed-game page. The ballpark scoreboard up top (the page takes on the
// stadium the game was played in), tabbed sections (Overview / Play-by-Play / Field / Box Score),
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
import { Spinner, ErrorState, PlayerLink, Panel, PanelHeader } from '@/components/ui';
import Scoreboard from '@/components/game/Scoreboard';
import { useGamePark } from '@/lib/useGamePark';
import { buildRoster, sum, TeamPanel, type RosterEntry } from '@/components/game/BoxScore';
import RunFlow from '@/components/game/RunFlow';
import { AtBatRow } from '@/components/game/PlayByPlay';
import Scorecard, { buildPlates, type ScorecardTotals } from '@/components/game/Scorecard';
import SprayChart from '@/components/game/SprayChart';

const HitVisualizer = dynamic(() => import('@/components/visualizer/HitVisualizer'), {
	ssr: false,
	loading: () => (
		<div className="fixed inset-0 z-[90] flex items-center justify-center bg-night-950/95">
			<Spinner label="Loading visualizer…" />
		</div>
	)
});

const AWAY_COLOR = 'var(--color-series-1)';
const HOME_COLOR = 'var(--color-series-2)';

// Contact quality, worst to best. Star hits are counted apart: they are a
// spent resource, not a quality of contact.
const CONTACT_CATS: { key: string; label: string; fill: string; edge: string; ink: string }[] = [
	{ key: 'sour_hits', label: 'Sour', fill: '#7d8a80', edge: '#3f4842', ink: '#0d1410' },
	{ key: 'nice_hits', label: 'Nice', fill: '#5284bd', edge: '#08298c', ink: '#ffffff' },
	{ key: 'perfect_hits', label: 'Perfect', fill: '#ffbd00', edge: '#8a5a00', ink: '#14140c' }
];

/** One side's contact as a single capsule, split by quality. */
function ContactRow({ user, color, roster }: { user: string; color: string; roster: RosterEntry[] }) {
	const parts = CONTACT_CATS.map((cat) => ({ ...cat, value: sum(roster, 'batting', cat.key) }));
	const total = parts.reduce((n, part) => n + part.value, 0);
	const stars = sum(roster, 'batting', 'star_hits');

	return (
		<div>
			<div className="mb-1.5 flex items-baseline justify-between gap-3">
				<span className="flex min-w-0 items-center gap-2 font-display text-base font-semibold text-fog-100">
					<span className="h-3.5 w-1 flex-none rounded-full" style={{ backgroundColor: color }} />
					<span className="truncate">{user}</span>
				</span>
				<span className="flex-none font-mono text-xs tabular-nums text-fog-500">
					{total} contacts{stars > 0 && <span className="text-star-400"> · {stars} star</span>}
				</span>
			</div>
			<div className="flex h-8 overflow-hidden rounded-full border border-[var(--rim-strong)] bg-black/50">
				{parts.map(
					(part) =>
						part.value > 0 && (
							<div
								key={part.key}
								title={`${part.label}: ${part.value}`}
								className="flex min-w-7 items-center justify-center border-r font-mono text-sm font-semibold tabular-nums last:border-r-0 [box-shadow:inset_0_2px_0_rgb(255_255_255/0.3)]"
								style={{
									flexGrow: part.value,
									flexBasis: 0,
									backgroundColor: part.fill,
									borderColor: part.edge,
									color: part.ink
								}}
							>
								{part.value}
							</div>
						)
				)}
			</div>
		</div>
	);
}

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
	return (
		<Panel>
			<PanelHeader
				title="Contact quality"
				action={
					<span className="flex items-center gap-3 font-display text-xs font-semibold uppercase tracking-[0.1em] text-fog-300">
						{CONTACT_CATS.map((cat) => (
							<span key={cat.key} className="flex items-center gap-1.5">
								<span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: cat.fill }} />
								{cat.label}
							</span>
						))}
					</span>
				}
			/>
			<div className="space-y-4 px-4 py-4">
				<ContactRow user={awayUser} color={AWAY_COLOR} roster={awayRoster} />
				<ContactRow user={homeUser} color={HOME_COLOR} roster={homeRoster} />
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
			<span className="shrink-0 font-mono font-bold tabular-nums text-fog-100">
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
						<div className="bg-black/30 px-4 py-1.5 font-display text-xs font-semibold uppercase tracking-wider">
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

function EloLine({ elo, delta }: { elo: number | undefined; delta: number | null }) {
	if (elo === undefined) return null;
	return (
		<>
			{' · '}
			<span className="font-mono tabular-nums">{Math.round(elo)}</span>
			{delta !== null && (
				<span className={`font-mono tabular-nums ${delta >= 0 ? 'text-emerald-400' : 'text-rio-400'}`}>
					{' '}
					{delta >= 0 ? '+' : ''}
					{Math.round(delta)}
				</span>
			)}
		</>
	);
}

/** The winner's flag, flown beside their name on the board. */
function WinFlag() {
	return (
		<span
			title="Winner"
			className="flex-none bg-[var(--park-accent)] py-1 pl-1.5 pr-3.5 font-display text-xs font-bold leading-none text-[#14140c] [clip-path:polygon(0_0,62%_0,100%_50%,62%_100%,0_100%)]"
		>
			W
		</span>
	);
}

type Tab = 'book' | 'field' | 'box';

export default function GamePage({ params }: { params: Promise<{ gameID: string }> }) {
	const { gameID } = use(params);
	const [stats, setStats] = useState<any | null>(null);
	const [info, setInfo] = useState<GameSummary | null>(null);
	const [events, setEvents] = useState<GameEvent[] | null>(null);
	const [eventsFailed, setEventsFailed] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [tab, setTab] = useState<Tab>('book');
	const [visualized, setVisualized] = useState<GameEvent | null>(null);
	const [picked, setPicked] = useState<number | null>(null);
	const tagsets = useTagsets();
	useGamePark(info?.stadium);

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

	const plates = useMemo(() => (events && events.length > 0 ? buildPlates(events) : null), [events]);
	// Until one is picked, the strip shows the plate appearance that drove in
	// the most runs.
	const featured = useMemo(() => {
		if (!plates || plates.length === 0) return null;
		return plates.reduce((best, plate) => (plate.rbi > best.rbi ? plate : best), plates[0]).index;
	}, [plates]);

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
	const gameDate = info.date_time_start
		? new Date(info.date_time_start * 1000).toLocaleDateString(undefined, {
				year: 'numeric',
				month: 'short',
				day: 'numeric'
			})
		: null;

	const tabs: { id: Tab; label: string; count?: number }[] = [
		{ id: 'book', label: plates ? 'Scorebook' : 'Overview' },
		{ id: 'field', label: 'Field', count: events ? ballsInPlay : undefined },
		{ id: 'box', label: 'Box score' }
	];
	const lineTotals = (roster: RosterEntry[]): Record<string, ScorecardTotals> =>
		Object.fromEntries(
			roster.map((entry) => [
				entry.name,
				{
					ab: entry.batting?.summary_at_bats ?? 0,
					h: entry.batting?.summary_hits ?? 0,
					rbi: entry.batting?.summary_rbi ?? 0
				}
			])
		);
	const shown = plates ? plates[picked ?? featured ?? 0] : null;
	const gameTime =
		info.date_time_start && info.date_time_end
			? msToTime((info.date_time_end - info.date_time_start) * 1000)
			: null;
	const [awayRuns, homeRuns] = linescore ?? [[], []];
	const shortened = info.innings_played !== info.innings_selected;

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
			<Scoreboard
				innings={Math.max(awayRuns.length, homeRuns.length, info.innings_played ?? 0)}
				regulationInnings={info.innings_selected}
				status={
					<span className="text-fog-100">
						Final
						{shortened && (
							<span className="ml-2 font-mono text-xs font-medium tracking-normal text-fog-500">
								{info.innings_played}/{info.innings_selected}
							</span>
						)}
					</span>
				}
				header={
					<>
						{mode && (
							<Link href={`/modes/${encodeURIComponent(mode)}`} className="text-fog-100 hover:text-star-400">
								{mode}
							</Link>
						)}
						<span>{stadiums[info.stadium] ?? 'Unknown'}</span>
						{gameDate && <span>{gameDate}</span>}
						{gameTime && <span className="font-mono text-xs normal-case tracking-normal">{gameTime}</span>}
					</>
				}
				teams={[
					{
						name: <PlayerLink username={info.away_user} className="!font-normal" />,
						detail: (
							<>
								{info.away_captain || '—'}
								<EloLine elo={awayElo} delta={awayEloDelta} />
							</>
						),
						image: info.away_captain ? characterImage(info.away_captain) : null,
						badge: awayLogo ? teamImage(awayLogo) : null,
						tag: !homeWon ? <WinFlag /> : undefined,
						runs: awayRuns,
						total: info.away_score,
						hits: sum(awayRoster, 'batting', 'summary_hits'),
						color: AWAY_COLOR,
						dim: homeWon
					},
					{
						name: <PlayerLink username={info.home_user} className="!font-normal" />,
						detail: (
							<>
								{info.home_captain || '—'}
								<EloLine elo={homeElo} delta={homeEloDelta} />
							</>
						),
						image: info.home_captain ? characterImage(info.home_captain) : null,
						badge: homeLogo ? teamImage(homeLogo) : null,
						tag: homeWon ? <WinFlag /> : undefined,
						runs: homeRuns,
						total: info.home_score,
						hits: sum(homeRoster, 'batting', 'summary_hits'),
						color: HOME_COLOR,
						dim: !homeWon
					}
				]}
			>
				<div role="tablist" className="tab-strip mt-1 border-b-0 border-t border-[var(--rim)] bg-black/35 px-3 pt-2">
					{tabs.map(({ id, label, count }) => (
						<button key={id} role="tab" aria-selected={tab === id} onClick={() => setTab(id)}>
							{label}
							{count !== undefined && (
								<span className="ml-2 font-mono text-xs font-medium tabular-nums opacity-70">{count}</span>
							)}
						</button>
					))}
				</div>
			</Scoreboard>

			{/* ---- Tab content ---- */}
			{tab === 'book' && (
				<div className="space-y-6">
					{plates && (
						<>
							<Scorecard
								plates={plates}
								side={0}
								user={info.away_user}
								color={AWAY_COLOR}
								innings={Math.max(awayRuns.length, homeRuns.length)}
								totals={lineTotals(awayRoster)}
								selected={shown?.index ?? null}
								onSelect={setPicked}
							/>
							{shown && (
								<div className="sel sticky bottom-3 z-30 overflow-hidden !bg-night-950">
									<AtBatRow atBat={shown.atBat} onVisualize={setVisualized} />
								</div>
							)}
							<Scorecard
								plates={plates}
								side={1}
								user={info.home_user}
								color={HOME_COLOR}
								innings={Math.max(awayRuns.length, homeRuns.length)}
								totals={lineTotals(homeRoster)}
								selected={shown?.index ?? null}
								onSelect={setPicked}
							/>
						</>
					)}
					{!plates && !eventsFailed && <Spinner label="Loading the scorebook…" />}
					<div className="grid items-start gap-6 lg:grid-cols-2">
						{linescore && (
							<RunFlow linescore={linescore} awayUser={info.away_user} homeUser={info.home_user} />
						)}
						<ContactQuality
							awayRoster={awayRoster}
							homeRoster={homeRoster}
							awayUser={info.away_user}
							homeUser={info.home_user}
						/>
					</div>
					{!plates && eventsFailed && <ScoringSummary info={info} />}
				</div>
			)}

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
