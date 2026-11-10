'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getAllUsers, getTagSetLadder, type GameSummary, type LadderPlayer, type TagSet } from '@/lib/api';
import { characterImage, stadiums } from '@/lib/data/characters';
import { TOOLS } from '@/lib/data/tools';
import { didHomeWin, liveCharacter, liveTeamImage, recentTeamImage, tagSetName } from '@/lib/gameDisplay';
import { getTimeSince } from '@/lib/time';
import { BaseDiamond, OutPips, StarOrbs } from '@/components/game/hud';
import { LiveDot } from '@/components/ui';

/** What every board can draw from; fetched once by the title screen. */
export interface BoardData {
	live: any[] | null;
	recent: GameSummary[] | null;
	tagsets: TagSet[];
}

const LABEL = 'font-display text-sm font-semibold uppercase tracking-[0.14em] text-fog-500';
/** A board row that takes the selection bar on hover or focus. */
const ROW =
	'rounded-md border border-transparent outline-none transition-colors duration-[120ms] hover:border-[var(--color-rim)] hover:bg-black/55 focus-visible:border-[var(--color-rim)] focus-visible:bg-black/55';

function Waiting() {
	return <div className="swing-sprite m-auto" role="status" aria-label="Loading" />;
}

function Quiet({ children }: { children: React.ReactNode }) {
	return <p className="m-auto max-w-xs text-center font-title text-2xl text-fog-300">{children}</p>;
}

function liveHref(game: any) {
	return `/games/live/${encodeURIComponent(`${game.start_time}-${game.home_player}-${game.away_player}`)}`;
}

/* ---------- Live ---------- */

function LiveSide({ game, side }: { game: any; side: 'home' | 'away' }) {
	const batting = (game.half_inning === 0) === (side === 'away');
	return (
		<div className="flex items-center gap-4">
			{/* eslint-disable-next-line @next/next/no-img-element */}
			<img src={liveTeamImage(game, side)} alt="" className="h-16 w-16 shrink-0 object-contain sm:h-20 sm:w-20" />
			<div className="min-w-0 flex-1">
				<p className="truncate font-title text-2xl leading-tight sm:text-3xl">{game[`${side}_player`]}</p>
				<div className="mt-1.5 flex items-center gap-3">
					<StarOrbs stars={game[`${side}_stars`] ?? 0} />
					{batting && (
						<span className="font-display text-xs font-bold uppercase tracking-[0.14em] text-star-400">At bat</span>
					)}
				</div>
			</div>
			<span className="font-mono text-6xl font-semibold tabular-nums text-star-400 [text-shadow:0_3px_0_rgb(0_0_0/0.5)] sm:text-7xl">
				{game[`${side}_score`]}
			</span>
		</div>
	);
}

export function LiveBoard({ live, recent, tagsets }: BoardData) {
	if (live === null) return <Waiting />;

	if (live.length === 0) {
		const last = recent?.[0];
		return (
			<div className="m-auto flex w-full max-w-md flex-col gap-5">
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

	const [game, ...others] = live;
	const battingSide = game.half_inning === 0 ? 'away' : 'home';
	const pitchingSide = game.half_inning === 0 ? 'home' : 'away';
	const batter = liveCharacter(game, battingSide, 'batter');
	const pitcher = liveCharacter(game, pitchingSide, 'pitcher');
	const mode = tagSetName(tagsets, game.tag_set);

	return (
		<div className="flex min-h-0 flex-1 flex-col gap-3">
			<Link href={liveHref(game)} className={`${ROW} flex flex-1 flex-col justify-between gap-4 p-3 sm:p-4`}>
				<div className="flex items-center justify-between gap-4">
					<span className="flex shrink-0 items-center gap-2 whitespace-nowrap font-display text-base font-bold uppercase tracking-[0.12em] text-rio-400">
						<LiveDot /> {game.half_inning === 0 ? 'Top' : 'Bot'} {game.inning}
					</span>
					<span className={`${LABEL} min-w-0 truncate`}>
						{[mode, stadiums[game.stadium_id]].filter(Boolean).join(' · ')}
					</span>
				</div>
				<div className="space-y-3">
					<LiveSide game={game} side="away" />
					<LiveSide game={game} side="home" />
				</div>
				<div className="flex items-center justify-between gap-4 border-t border-[var(--rim)] pt-3">
					<div className="flex min-w-0 items-center gap-3 font-display text-lg font-semibold">
						{batter && (
							<span className="flex min-w-0 items-center gap-1.5">
								{/* eslint-disable-next-line @next/next/no-img-element */}
								<img src={characterImage(batter)} alt="" className="h-8 w-8 object-contain" />
								<span className="truncate">{batter}</span>
							</span>
						)}
						{batter && pitcher && <span className="text-sm uppercase tracking-wider text-fog-500">vs</span>}
						{pitcher && (
							<span className="flex min-w-0 items-center gap-1.5">
								{/* eslint-disable-next-line @next/next/no-img-element */}
								<img src={characterImage(pitcher)} alt="" className="h-8 w-8 object-contain" />
								<span className="truncate">{pitcher}</span>
							</span>
						)}
					</div>
					<div className="flex shrink-0 items-center gap-4">
						<BaseDiamond
							first={!!Number(game.runner_on_first)}
							second={!!Number(game.runner_on_second)}
							third={!!Number(game.runner_on_third)}
							size={38}
						/>
						<OutPips outs={game.outs} />
					</div>
				</div>
			</Link>
			{others.slice(0, 2).map((other) => (
				<Link
					key={liveHref(other)}
					href={liveHref(other)}
					className={`${ROW} grid grid-cols-[4.5rem_1fr_auto_1fr] items-center gap-3 px-3 py-2 font-display text-lg font-semibold`}
				>
					<span className="text-sm font-bold uppercase tracking-[0.12em] text-rio-400">
						{other.half_inning === 0 ? 'Top' : 'Bot'} {other.inning}
					</span>
					<span className="truncate text-right">{other.away_player}</span>
					<span className="font-mono text-xl tabular-nums text-star-400">
						{other.away_score}–{other.home_score}
					</span>
					<span className="truncate">{other.home_player}</span>
				</Link>
			))}
		</div>
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
			className={`${ROW} grid grid-cols-[1fr_auto_1fr] items-center gap-x-3 px-2 py-1.5 sm:px-3`}
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

export function RecentBoard({ recent, tagsets }: BoardData) {
	if (recent === null) return <Waiting />;
	if (recent.length === 0) return <Quiet>The scores are not coming through right now.</Quiet>;
	return (
		<div className="flex flex-1 flex-col justify-between gap-1">
			{recent.slice(0, 7).map((game) => (
				<FinalRow key={game.game_id} game={game} tagsets={tagsets} />
			))}
		</div>
	);
}

/* ---------- Ranked ---------- */

const ladderCache = new Map<string, LadderPlayer[]>();

export function RankedBoard({ recent, tagsets }: BoardData) {
	// Official ladders still in season, busiest first going by the latest finals.
	const modes = useMemo(() => {
		const now = Date.now() / 1000;
		const played = new Map<number, number>();
		for (const game of recent ?? []) {
			const id = game.game_mode as number;
			played.set(id, (played.get(id) ?? 0) + 1);
		}
		return tagsets
			.filter((t) => t.comm_type === 'Official' && (t.end_date ?? 0) >= now)
			.sort((a, b) => (played.get(b.id) ?? 0) - (played.get(a.id) ?? 0) || (b.start_date ?? 0) - (a.start_date ?? 0))
			.slice(0, 4);
	}, [recent, tagsets]);

	const [picked, setPicked] = useState<string | null>(null);
	const mode = picked ?? modes[0]?.name ?? null;
	const [players, setPlayers] = useState<LadderPlayer[] | null>(null);
	const [failed, setFailed] = useState(false);

	useEffect(() => {
		if (!mode) return;
		let cancelled = false;
		setFailed(false);
		const cached = ladderCache.get(mode);
		setPlayers(cached ?? null);
		if (cached) return;
		getTagSetLadder(mode)
			.then((result) => {
				ladderCache.set(mode, result);
				if (!cancelled) setPlayers(result);
			})
			.catch(() => {
				if (!cancelled) setFailed(true);
			});
		return () => {
			cancelled = true;
		};
	}, [mode]);

	if (tagsets.length === 0) return <Waiting />;
	if (!mode) return <Quiet>No official ladder is in season.</Quiet>;

	return (
		<div className="flex min-h-0 flex-1 flex-col gap-3">
			<div className="seg max-w-full self-start overflow-x-auto [scrollbar-width:none]" role="tablist" aria-label="Ladder">
				{modes.map((t) => (
					<button
						key={t.id}
						type="button"
						role="tab"
						aria-selected={t.name === mode}
						onClick={() => setPicked(t.name)}
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
				<ol className="flex flex-1 flex-col justify-between">
					{players.slice(0, 8).map((player, i) => (
						<li key={player.username}>
							<Link
								href={`/users/${encodeURIComponent(player.username)}`}
								className={`${ROW} grid grid-cols-[2rem_1fr_auto_5.5rem] items-center gap-3 px-3 py-1`}
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

/* ---------- Players ---------- */

let usersCache: string[] | null = null;

export function PlayersBoard({ recent }: BoardData) {
	const router = useRouter();
	const [users, setUsers] = useState<string[] | null>(usersCache);
	const [query, setQuery] = useState('');

	useEffect(() => {
		if (usersCache) return;
		let cancelled = false;
		getAllUsers()
			.then((result) => {
				usersCache = result;
				if (!cancelled) setUsers(result);
			})
			.catch(() => {});
		return () => {
			cancelled = true;
		};
	}, []);

	const q = query.trim().toLowerCase();
	const matches = useMemo(() => {
		if (!q || !users) return [];
		// Names that start with the query first, then names that contain it.
		const starts: string[] = [];
		const contains: string[] = [];
		for (const user of users) {
			const at = user.toLowerCase().indexOf(q);
			if (at === 0) starts.push(user);
			else if (at > 0) contains.push(user);
		}
		const byName = (a: string, b: string) => a.localeCompare(b);
		return [...starts.sort(byName), ...contains.sort(byName)].slice(0, 12);
	}, [q, users]);

	const justPlayed = useMemo(() => {
		const seen = new Set<string>();
		for (const game of recent ?? []) {
			seen.add(game.away_user);
			seen.add(game.home_user);
		}
		return [...seen].slice(0, 21);
	}, [recent]);

	const shown = q ? matches : justPlayed;

	return (
		<div className="flex min-h-0 flex-1 flex-col gap-4">
			<form
				onSubmit={(event) => {
					event.preventDefault();
					const target = matches[0] ?? query.trim();
					if (target) router.push(`/users/${encodeURIComponent(target)}`);
				}}
			>
				<input
					type="search"
					className="input !py-3 !text-lg"
					aria-label="Find a player"
					placeholder={users ? `Search ${users.length.toLocaleString()} players` : 'Search players'}
					value={query}
					onChange={(event) => setQuery(event.target.value)}
				/>
			</form>
			<div className="min-h-0 flex-1">
				{!q && shown.length > 0 && <p className={`${LABEL} mb-1.5 px-3`}>Just played</p>}
				{q && users && matches.length === 0 && <Quiet>No player by that name.</Quiet>}
				<ul className="grid grid-cols-2 gap-x-3 sm:grid-cols-3">
					{shown.map((user) => (
						<li key={user}>
							<Link
								href={`/users/${encodeURIComponent(user)}`}
								className={`${ROW} block truncate px-3 py-2 font-display text-xl font-semibold`}
							>
								{user}
							</Link>
						</li>
					))}
				</ul>
			</div>
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
			<p className={`${LABEL} mb-1.5 px-3`}>Running now</p>
			<ul className="flex flex-1 flex-col justify-between">
				{running.map((t) => (
					<li key={t.id}>
						<Link
							href={`/modes/${encodeURIComponent(t.name)}`}
							className={`${ROW} grid grid-cols-[1fr_auto_auto] items-baseline gap-4 px-3 py-1.5`}
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

/* ---------- Tools ---------- */

export function ToolsBoard() {
	return (
		<ul className="grid flex-1 content-between gap-x-3 gap-y-1 sm:grid-cols-2">
			{TOOLS.map((tool) => (
				<li key={tool.href}>
					<Link href={tool.href} className={`${ROW} block px-3 py-2`}>
						<span className="block font-title text-xl leading-tight">{tool.title}</span>
						<span className="mt-1 line-clamp-2 block text-sm leading-snug text-fog-500">{tool.description}</span>
					</Link>
				</li>
			))}
		</ul>
	);
}
