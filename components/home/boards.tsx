'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import type { GameSummary, ScoringPlay, TagSet } from '@/lib/api';
import type { LandingRow } from '@/lib/landingData';
import { buildTeamRows, characterGroups, charStats, fetchModeGames, type CharAgg } from '@/lib/charAnalytics';
import { characterImage, characterName, stadiums } from '@/lib/data/characters';
import { didHomeWin, liveCharacter, liveTeamImage, recentTeamImage, tagSetName } from '@/lib/gameDisplay';
import { atBatResultName } from '@/lib/mssb/constants';
import { getTimeSince } from '@/lib/time';
import { BaseDiamond, OutPips, StarOrbs } from '@/components/game/hud';
import { LiveDot } from '@/components/ui';
import { hitsBySide, keyPlays } from './scene';
import { useSeasonModes, type Ranked } from './useRanked';

/** What the page fetches once for every board. */
export interface HomeData {
	live: any[] | null;
	recent: GameSummary[] | null;
	/** The latest final with its line score; undefined while loading, null if there is none. */
	featured: GameSummary | null | undefined;
	/** Where every ball of the featured final came down; null until it loads. */
	landings: LandingRow[] | null;
	tagsets: TagSet[];
}

/** What a board is given: the data, the ladder, and the scoring play lit on the field. */
export interface BoardData extends HomeData {
	ranked: Ranked;
	headline: ScoringPlay | null;
	lit: ScoringPlay | null;
	onLit: (play: ScoringPlay | null) => void;
}

const LABEL = 'font-display text-sm font-semibold uppercase tracking-[0.14em] text-fog-500';
/** A board row you can open: the selection bar lands on it (.pick in globals.css). */
const ROW = 'pick';
/** The same for a whole block of a board, such as a scorebug. */
const BLOCK = 'pick pick-block';

function Waiting() {
	return <div className="swing-sprite m-auto" role="status" aria-label="Loading" />;
}

function Quiet({ children }: { children: React.ReactNode }) {
	return <p className="m-auto max-w-xs text-center font-title text-2xl text-fog-300">{children}</p>;
}

function liveHref(game: any) {
	return `/games/live/${encodeURIComponent(`${game.start_time}-${game.home_player}-${game.away_player}`)}`;
}

/** The tools that explain a board, as quiet links along its foot. Dropped on a short desktop window. */
function Related({ links }: { links: { href: string; label: string }[] }) {
	return (
		<p className="flex flex-wrap gap-x-6 gap-y-1 border-t border-[var(--rim)] pt-3 lg:[@media(max-height:820px)]:hidden">
			{links.map((link) => (
				<Link key={link.href} href={link.href} className={`${LABEL} transition-colors hover:text-fog-100`}>
					{link.label} ›
				</Link>
			))}
		</p>
	);
}

/* ---------- Line score ---------- */

interface LineSide {
	image: string;
	name: string;
	/** Rides beside the name: star power, for a game in progress. */
	note?: React.ReactNode;
	runs: (number | 'X' | null | undefined)[];
	total: number;
	/** Fills an H column when both sides have it. */
	hits?: number;
	/** Chalk and gold for the side that is ahead; a finished game dims the loser. */
	strong: boolean;
}

/** The scorebug's body: two sides, a run for every inning, the total in gold. */
function LineScore({ innings, sides }: { innings: number; sides: LineSide[] }) {
	const withHits = sides.every((side) => side.hits !== undefined);
	// On a phone the name takes a line of its own and the innings run under it.
	const columns = withHits
		? 'grid-cols-[repeat(var(--innings),minmax(0,1fr))_2.5rem_1.75rem] sm:grid-cols-[minmax(5rem,1fr)_repeat(var(--innings),minmax(0,2.1rem))_minmax(2.5rem,auto)_minmax(2.25rem,auto)]'
		: 'grid-cols-[repeat(var(--innings),minmax(0,1fr))_2.5rem] sm:grid-cols-[minmax(5rem,1fr)_repeat(var(--innings),minmax(0,2.1rem))_minmax(2.5rem,auto)]';
	const grid = `grid gap-x-1 max-sm:gap-x-0.5 ${columns}`;
	return (
		<div style={{ '--innings': innings } as React.CSSProperties}>
			<div className={`${grid} max-sm:tracking-normal ${LABEL}`}>
				<span className="max-sm:hidden" />
				{Array.from({ length: innings }, (_, i) => (
					<span key={i} className="text-center">
						{i + 1}
					</span>
				))}
				<span className="text-right">R</span>
				{withHits && <span className="text-right">H</span>}
			</div>
			{sides.map((side, row) => (
				<div key={row} className={`${grid} items-center py-1`}>
					<span className="flex min-w-0 items-center gap-2.5 max-sm:col-span-full">
						{/* eslint-disable-next-line @next/next/no-img-element */}
						<img src={side.image} alt="" className="h-10 w-10 shrink-0 object-contain max-sm:h-8 max-sm:w-8" />
						<span className={`truncate font-title text-2xl leading-tight max-sm:text-xl ${side.strong ? 'text-fog-100' : 'text-fog-500'}`}>
							{side.name}
						</span>
						{side.note}
					</span>
					{Array.from({ length: innings }, (_, i) => (
						<span
							key={i}
							className={`text-center font-mono text-xl tabular-nums max-sm:text-base ${side.runs[i] ? 'text-fog-100' : 'text-fog-500'}`}
						>
							{side.runs[i] ?? ''}
						</span>
					))}
					<span
						className={`text-right font-mono text-4xl font-semibold tabular-nums [text-shadow:0_3px_0_rgb(0_0_0/0.5)] max-sm:text-2xl ${side.strong ? 'text-star-400' : 'text-fog-500'}`}
					>
						{side.total}
					</span>
					{withHits && (
						<span className={`text-right font-mono text-xl tabular-nums max-sm:text-base ${side.strong ? 'text-fog-100' : 'text-fog-500'}`}>
							{side.hits}
						</span>
					)}
				</div>
			))}
		</div>
	);
}

/** The line across the top of a scorebug: the game's state, then where it is being played. */
function BugHeader({ state, mode, stadium }: { state: React.ReactNode; mode: string; stadium: string }) {
	return (
		<div className="flex items-center justify-between gap-4">
			<span className="flex shrink-0 items-center gap-2 whitespace-nowrap font-display text-base font-bold uppercase tracking-[0.12em] text-fog-100">
				{state}
			</span>
			<span className={`${LABEL} min-w-0 truncate`}>{[mode, stadium].filter(Boolean).join(' · ')}</span>
		</div>
	);
}

/* ---------- Live ---------- */

function Matchup({ name, line }: { name: string; line: string }) {
	return (
		<span className="flex min-w-0 items-center gap-1.5">
			{/* eslint-disable-next-line @next/next/no-img-element */}
			<img src={characterImage(name)} alt="" className="h-8 w-8 shrink-0 object-contain" />
			<span className="truncate">{name}</span>
			<span className="shrink-0 font-mono text-sm font-normal tabular-nums text-fog-500 max-sm:hidden">{line}</span>
		</span>
	);
}

export function LiveBoard({ live, recent, tagsets }: BoardData) {
	if (live === null) return <Waiting />;

	if (live.length === 0) {
		const last = recent?.[0];
		return (
			<div className="m-auto flex w-full max-w-md flex-col gap-3">
				<p className="text-center font-title text-2xl text-fog-300">Nobody is on the field right now.</p>
				{last && (
					<div>
						<p className={LABEL}>Last final</p>
						<FinalRow game={last} tagsets={tagsets} />
					</div>
				)}
			</div>
		);
	}

	const game = live[0];
	const top = game.half_inning === 0;
	const batter = liveCharacter(game, top ? 'away' : 'home', 'batter');
	const pitcher = liveCharacter(game, top ? 'home' : 'away', 'pitcher');
	const innings = Math.max(
		game.innings_selected ?? 9,
		game.away_inning_scores?.length ?? 0,
		game.home_inning_scores?.length ?? 0
	);
	const first = !!Number(game.runner_on_first);
	const second = !!Number(game.runner_on_second);
	const third = !!Number(game.runner_on_third);

	const side = (which: 'away' | 'home'): LineSide => ({
		image: liveTeamImage(game, which),
		name: game[`${which}_player`],
		note: <StarOrbs stars={game[`${which}_stars`] ?? 0} className="shrink-0" />,
		runs: game[`${which}_inning_scores`] ?? [],
		total: game[`${which}_score`],
		strong: true
	});

	return (
		<Link href={liveHref(game)} className={`${BLOCK} flex min-h-0 flex-1 flex-col gap-2`}>
			<BugHeader
				state={
					<span className="flex items-center gap-2 text-rio-400">
						<LiveDot /> {top ? 'Top' : 'Bot'} {game.inning}
					</span>
				}
				mode={tagSetName(tagsets, game.tag_set)}
				stadium={stadiums[game.stadium_id]}
			/>
			<LineScore innings={innings} sides={[side('away'), side('home')]} />
			<div className="mt-auto flex items-center justify-between gap-x-4 gap-y-2 border-t border-[var(--rim)] pt-2 max-sm:flex-wrap">
				<div className="flex min-w-0 items-center gap-3 font-display text-lg font-semibold max-sm:w-full">
					{batter && (
						<Matchup
							name={batter}
							line={game.batter_stats ? `${game.batter_stats.Hits ?? 0} for ${game.batter_stats['At Bats'] ?? 0}` : ''}
						/>
					)}
					{batter && pitcher && <span className="text-sm uppercase tracking-wider text-fog-500">vs</span>}
					{pitcher && (
						<Matchup
							name={pitcher}
							line={game.pitcher_stats ? `${game.pitcher_stats['Pitches Thrown'] ?? 0} pitches` : ''}
						/>
					)}
				</div>
				<div className="flex shrink-0 items-center gap-4">
					<BaseDiamond first={first} second={second} third={third} size={34} />
					<OutPips outs={game.outs} />
				</div>
			</div>
		</Link>
	);
}

/* ---------- Recent ---------- */

function FinalRow({ game, tagsets }: { game: GameSummary; tagsets: TagSet[] }) {
	const homeWon = didHomeWin(game);
	const mode = tagSetName(tagsets, game.game_mode as number);
	const name = (won: boolean) => `truncate font-display text-xl font-semibold ${won ? 'text-fog-100' : 'text-fog-500'}`;
	const score = (won: boolean) => `font-mono text-2xl font-semibold tabular-nums ${won ? 'text-star-400' : 'text-fog-500'}`;
	return (
		<Link
			href={`/games/${game.game_id}`}
			className={`${ROW} grid grid-cols-[1fr_auto_1fr] items-center gap-x-3`}
		>
			<span className="flex min-w-0 items-center justify-end gap-2.5">
				<span className={name(!homeWon)}>{game.away_user}</span>
				{/* eslint-disable-next-line @next/next/no-img-element */}
				<img src={recentTeamImage(game, 'away')} alt="" className="h-9 w-9 shrink-0 object-contain" />
			</span>
			<span className="flex flex-col items-center">
				<span className="flex items-baseline gap-2">
					<span className={score(!homeWon)}>{game.away_score}</span>
					<span className={score(homeWon)}>{game.home_score}</span>
				</span>
				<span className="max-w-[15rem] truncate text-[0.7rem] leading-tight text-fog-500">
					{[game.date_time_end ? getTimeSince(game.date_time_end) : '', mode].filter(Boolean).join(' · ')}
				</span>
			</span>
			<span className="flex min-w-0 items-center gap-2.5">
				{/* eslint-disable-next-line @next/next/no-img-element */}
				<img src={recentTeamImage(game, 'home')} alt="" className="h-9 w-9 shrink-0 object-contain" />
				<span className={name(homeWon)}>{game.home_user}</span>
			</span>
		</Link>
	);
}

/* ---------- Every pitch ---------- */

/** One scoring play. Lighting it draws that ball's flight on the field. */
function PlayChip({
	play,
	href,
	lit,
	onLit
}: {
	play: ScoringPlay;
	href: string;
	lit: boolean;
	onLit: (play: ScoringPlay) => void;
}) {
	const batter = characterName(play.batter);
	return (
		<Link
			href={href}
			onMouseEnter={() => onLit(play)}
			onFocus={() => onLit(play)}
			aria-current={lit}
			data-lit={lit}
			className="pick mx-0 flex min-w-0 items-center gap-2 font-display text-lg font-semibold leading-tight"
		>
			<span className={`${LABEL} shrink-0`}>
				{play.half_inning === 0 ? 'Top' : 'Bot'} {play.inning}
			</span>
			{/* eslint-disable-next-line @next/next/no-img-element */}
			<img src={characterImage(batter)} alt="" className="h-7 w-7 shrink-0 object-contain" />
			<span className="truncate">{batter}</span>
			<span className="shrink-0 text-fog-300">{atBatResultName(play.result_of_ab)}</span>
			{play.result_rbi > 1 && <span className="shrink-0 text-sm uppercase tracking-wider text-fog-500">{play.result_rbi} RBI</span>}
		</Link>
	);
}

export function EveryPitchBoard({ featured, landings, tagsets, headline, lit, onLit }: BoardData) {
	if (featured === undefined) return <Waiting />;
	if (!featured?.linescore) return <Quiet>The last scorecard is not coming through right now.</Quiet>;

	const game = featured;
	const href = `/games/${game.game_id}`;
	const innings = Math.max(game.linescore![0].length, game.linescore![1].length);
	const homeWon = didHomeWin(game);
	const plays = keyPlays(game.scoring_plays ?? [], headline, 3);
	const hits = landings && hitsBySide(game, landings);

	const side = (which: 'away' | 'home', runs: (number | 'X')[], won: boolean): LineSide => ({
		image: recentTeamImage(game, which),
		name: game[`${which}_user`],
		runs,
		total: game[`${which}_score`],
		hits: hits?.[which],
		strong: won
	});

	return (
		<div className="flex min-h-0 flex-1 flex-col gap-2">
			<Link href={href} className={`${BLOCK} flex flex-col gap-2`}>
				<BugHeader
					state={`Final${game.date_time_end ? ` · ${getTimeSince(game.date_time_end)}` : ''}`}
					mode={tagSetName(tagsets, game.game_mode as number)}
					stadium={stadiums[game.stadium]}
				/>
				<LineScore innings={innings} sides={[side('away', game.linescore![0], !homeWon), side('home', game.linescore![1], homeWon)]} />
			</Link>
			{plays.length > 0 && (
				// Leaving the row hands the field back to the game's headline play.
				<div className="mt-auto border-t border-[var(--rim)] pt-1.5">
					<div className="-mx-3 grid grid-cols-1 gap-x-1 sm:grid-cols-2 lg:flex" onMouseLeave={() => onLit(null)}>
						{plays.map((play) => (
							<PlayChip key={play.event_num} play={play} href={href} lit={lit === play} onLit={onLit} />
						))}
					</div>
				</div>
			)}
		</div>
	);
}

/* ---------- Ranked ---------- */

/**
 * On a desktop the ladder is not on the board at all: the top five fly as
 * flags over the outfield wall (Flags.tsx) and the board is only the season
 * picker. Without a park to fly them over, a phone gets the ladder as a list.
 */
export function RankedBoard({ tagsets, ranked }: BoardData) {
	const { modes, mode, pick, players, failed } = ranked;

	if (tagsets.length === 0) return <Waiting />;
	if (!mode) return <Quiet>No ranked season is being played right now.</Quiet>;

	return (
		<div className="flex min-h-0 flex-1 flex-col gap-3">
			<div className="seg max-w-full self-start overflow-x-auto [scrollbar-width:none]" role="tablist" aria-label="Season">
				{modes.map((t) => (
					<button
						key={t.id}
						type="button"
						role="tab"
						aria-selected={t.name === mode}
						onClick={() => pick(t.name)}
						className="shrink-0 whitespace-nowrap !py-1 !text-sm"
					>
						{t.name}
					</button>
				))}
			</div>
			{failed ? (
				<Quiet>That ladder would not load.</Quiet>
			) : players === null ? (
				<Waiting />
			) : players.length === 0 ? (
				<Quiet>Nobody is ranked here yet.</Quiet>
			) : (
				<ol className="flex flex-1 flex-col justify-between lg:hidden">
					{players.slice(0, 8).map((player, i) => (
						<li key={player.username}>
							<Link
								href={`/users/${encodeURIComponent(player.username)}`}
								className={`${ROW} grid grid-cols-[2rem_1fr_auto_5.5rem] items-center gap-3`}
							>
								<span className={`font-mono text-lg font-semibold tabular-nums ${i === 0 ? 'text-star-400' : 'text-fog-500'}`}>
									{i + 1}
								</span>
								<span className="truncate font-display text-xl font-semibold">{player.username}</span>
								<span className="font-mono text-sm tabular-nums text-fog-500">
									{player.num_wins}–{player.num_losses}
								</span>
								<span className="text-right font-mono text-xl font-semibold tabular-nums">{player.adjusted_rating}</span>
							</Link>
						</li>
					))}
				</ol>
			)}
		</div>
	);
}

/* ---------- Characters ---------- */

interface CharBoard {
	aggs: CharAgg[];
	games: number;
}

const charCache = new Map<string, CharBoard>();
const pct = (value: number) => `${(value * 100).toFixed(1)}%`;

export function CharactersBoard({ recent, tagsets }: BoardData) {
	// The busiest ranked season being played now.
	const mode = useSeasonModes(recent, tagsets)[0]?.name ?? null;
	const [board, setBoard] = useState<CharBoard | null>(null);
	const [failed, setFailed] = useState(false);

	useEffect(() => {
		if (!mode) return;
		let cancelled = false;
		setFailed(false);
		const cached = charCache.get(mode);
		setBoard(cached ?? null);
		if (cached) return;
		fetchModeGames(mode)
			.then((games) => {
				const rows = buildTeamRows(games);
				// A character needs a real sample before its win rate means anything.
				const floor = Math.max(20, Math.round(rows.length * 0.05));
				const aggs = charStats(rows, characterGroups(true), true)
					.filter((agg) => agg.games >= floor)
					.sort((a, b) => b.waeRate - a.waeRate);
				const result = { aggs, games: games.length };
				charCache.set(mode, result);
				if (!cancelled) setBoard(result);
			})
			.catch(() => {
				if (!cancelled) setFailed(true);
			});
		return () => {
			cancelled = true;
		};
	}, [mode]);

	if (tagsets.length === 0) return <Waiting />;
	if (!mode) return <Quiet>No ranked season is being played right now.</Quiet>;
	if (failed) return <Quiet>The character numbers would not load.</Quiet>;
	if (!board) return <Waiting />;
	if (board.aggs.length === 0) return <Quiet>Not enough games this season yet.</Quiet>;

	const columns = 'grid grid-cols-[1.5rem_2.5rem_minmax(0,1fr)_4rem_4.5rem_5.5rem] items-center gap-3';

	return (
		<div className="flex min-h-0 flex-1 flex-col gap-3">
			<Link href="/characters/analytics" className={`${BLOCK} flex min-h-0 flex-1 flex-col`}>
				<div className={`${columns} ${LABEL} pb-1`}>
					<span className="col-span-3 truncate">
						{mode} · {board.games.toLocaleString()} games
					</span>
					<span className="text-right">Picked</span>
					<span className="text-right">Win rate</span>
					<span className="text-right">Vs expected</span>
				</div>
				<ol className="flex flex-1 flex-col justify-between [@media(max-height:820px)]:[&>*:nth-child(n+6)]:hidden">
					{board.aggs.slice(0, 6).map((agg, i) => (
						<li key={agg.group.key} className={`${columns} py-0.5`}>
							<span className={`font-mono text-lg font-semibold tabular-nums ${i === 0 ? 'text-star-400' : 'text-fog-500'}`}>
								{i + 1}
							</span>
							{/* eslint-disable-next-line @next/next/no-img-element */}
							<img src={characterImage(agg.group.portraitName)} alt="" className="h-10 w-10 object-contain" />
							<span className="truncate font-title text-2xl leading-none">{agg.group.name}</span>
							<span className="text-right font-mono text-sm tabular-nums text-fog-500">{pct(agg.pickPct)}</span>
							<span className="text-right font-mono text-lg tabular-nums">{pct(agg.winPct)}</span>
							<span
								className={`text-right font-mono text-xl font-semibold tabular-nums ${agg.waeRate > 0 ? 'text-star-400' : 'text-fog-500'}`}
							>
								{agg.waeRate > 0 ? '+' : '−'}
								{Math.abs(agg.waeRate * 100).toFixed(1)}
							</span>
						</li>
					))}
				</ol>
			</Link>
			<Related
				links={[{ href: '/characters/swing-lab', label: 'Swing Lab' }]}
			/>
		</div>
	);
}

/* ---------- Communities ---------- */

export function CommunitiesBoard({ tagsets }: BoardData) {
	// Community-run leagues, seasons and tournaments that are open today.
	const running = useMemo(() => {
		const now = Date.now() / 1000;
		return tagsets
			.filter((t) => t.comm_type !== 'Official' && t.type !== 'Test' && (t.end_date ?? 0) >= now && (t.start_date ?? 0) <= now)
			.sort((a, b) => (b.start_date ?? 0) - (a.start_date ?? 0))
			.slice(0, 8);
	}, [tagsets]);

	if (tagsets.length === 0) return <Waiting />;
	if (running.length === 0) return <Quiet>No community league is running right now.</Quiet>;

	return (
		<div className="flex flex-1 flex-col">
			<ul className="flex flex-1 flex-col justify-between">
				{running.map((t) => (
					<li key={t.id}>
						<Link
							href={`/modes/${encodeURIComponent(t.name)}`}
							className={`${ROW} grid grid-cols-[1fr_auto_auto] items-baseline gap-4`}
						>
							<span className="truncate font-display text-xl font-semibold">{t.name}</span>
							<span className={LABEL}>{t.type}</span>
							<span className="w-24 text-right font-mono text-sm tabular-nums text-fog-500">
								{t.end_date
									? `to ${new Date(t.end_date * 1000).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`
									: ''}
							</span>
						</Link>
					</li>
				))}
			</ul>
		</div>
	);
}

/* ---------- Getting started ---------- */

const STEPS = [
	{
		href: 'https://github.com/ProjectRio/ProjectRio/releases/latest',
		title: 'Download Project Rio',
		body: 'A Dolphin build tuned for Mario Superstar Baseball netplay. You bring your own copy of the game.'
	},
	{
		href: '/signup',
		title: 'Make an account',
		body: 'Your Rio Key links the client to your account, so every game you play lands on your stat page.'
	},
	{
		href: 'https://discord.gg/c3r9PabfRU',
		title: 'Find a game',
		body: 'Find an opponent in the Discord, then host or join from Online Play. Mark the game Ranked to put it on the ladder.'
	}
];

export function PlayBoard() {
	return (
		<div className="flex min-h-0 flex-1 flex-col gap-3">
			<ol className="flex flex-1 flex-col justify-between gap-1">
				{STEPS.map((step, i) => {
					const external = step.href.startsWith('http');
					return (
						<li key={step.href}>
							<a
								href={step.href}
								{...(external ? { target: '_blank', rel: 'noreferrer' } : {})}
								className={`${ROW} grid grid-cols-[2.75rem_minmax(0,1fr)] items-center gap-x-4 py-2.5`}
							>
								<span className="font-mono text-5xl font-semibold leading-none text-star-400 [text-shadow:0_3px_0_rgb(0_0_0/0.5)]">
									{i + 1}
								</span>
								<span className="min-w-0">
									<span className="block font-title text-2xl leading-tight">{step.title}</span>
									<span className="mt-1 block text-[0.95rem] leading-snug text-fog-300">{step.body}</span>
								</span>
							</a>
						</li>
					);
				})}
			</ol>
			<Related
				links={[
					{ href: '/rio-online/tutorial', label: 'Setup tutorial' },
					{ href: '/rio-online/optimize', label: 'Optimize' },
					{ href: '/codes', label: 'Gecko codes' }
				]}
			/>
		</div>
	);
}
