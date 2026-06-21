'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { getLiveGames, getRecentGames, type GameSummary } from '@/lib/api';
import { useTagsets } from '@/lib/useTagsets';
import { tagSetName, didHomeWin } from '@/lib/gameDisplay';
import { getTimeSince } from '@/lib/time';
import { LiveDot } from './ui';

const LIVE_WINDOW_SECONDS = 60 * 60;
const REFRESH_MS = 30_000;
const RECENT_COUNT = 15;

interface TickerItem {
	key: string;
	href: string;
	live: boolean;
	status: string;
	mode: string;
	away: { name: string; score: number; lead: boolean };
	home: { name: string; score: number; lead: boolean };
}

function liveItem(game: any, mode: string): TickerItem {
	const half = game.half_inning === 0 ? 'Top' : 'Bot';
	return {
		key: `live-${game.start_time}-${game.away_player}`,
		href: `/games/live/${encodeURIComponent(`${game.start_time}-${game.home_player}-${game.away_player}`)}`,
		live: true,
		status: `${half} ${game.inning}`,
		mode,
		away: { name: game.away_player, score: game.away_score, lead: game.away_score > game.home_score },
		home: { name: game.home_player, score: game.home_score, lead: game.home_score > game.away_score }
	};
}

function pastItem(game: GameSummary, mode: string): TickerItem {
	const homeWon = didHomeWin(game);
	return {
		key: `past-${game.game_id}`,
		href: `/games/${game.game_id}`,
		live: false,
		status: game.date_time_end ? getTimeSince(game.date_time_end) : '',
		mode,
		away: { name: game.away_user, score: game.away_score, lead: !homeWon },
		home: { name: game.home_user, score: game.home_score, lead: homeWon }
	};
}

function TeamLine({ team }: { team: { name: string; score: number; lead: boolean } }) {
	return (
		<div className="flex items-center justify-between gap-2">
			<span
				className={`truncate font-display text-sm font-semibold ${team.lead ? 'text-fog-100' : 'text-fog-500'}`}
			>
				{team.name}
			</span>
			<span className={`font-display text-sm font-bold tabular-nums ${team.lead ? 'text-fog-100' : 'text-fog-500'}`}>
				{team.score}
			</span>
		</div>
	);
}

function TickerBox({ item }: { item: TickerItem }) {
	return (
		<Link
			href={item.href}
			className="block w-44 shrink-0 rounded-lg border border-night-700 bg-night-850 px-3 py-2 transition-colors hover:border-night-600 hover:bg-night-800"
		>
			<div className="mb-1 flex items-center justify-between gap-2">
				<span
					className={`flex items-center gap-1 font-display text-[0.65rem] font-bold uppercase tracking-wider ${
						item.live ? 'text-rio-400' : 'text-fog-500'
					}`}
				>
					{item.live ? (
						<>
							<LiveDot /> Live · {item.status}
						</>
					) : (
						<>Final{item.status ? ` · ${item.status}` : ''}</>
					)}
				</span>
			</div>
			<TeamLine team={item.away} />
			<TeamLine team={item.home} />
			{item.mode && <p className="mt-1 truncate text-[0.65rem] text-fog-500">{item.mode}</p>}
		</Link>
	);
}

export default function GamesTicker() {
	const [items, setItems] = useState<TickerItem[]>([]);
	const tagsets = useTagsets();
	const scrollRef = useRef<HTMLDivElement>(null);
	const [edges, setEdges] = useState({ left: false, right: false });

	// Live games refresh on an interval; recent games are loaded once.
	useEffect(() => {
		let cancelled = false;
		let recent: GameSummary[] = [];

		async function loadLive() {
			let live: any[] = [];
			try {
				live = await getLiveGames(LIVE_WINDOW_SECONDS);
			} catch {
				live = [];
			}
			if (cancelled) return;
			setItems([
				...live.map((g) => liveItem(g, tagSetName(tagsets, g.tag_set))),
				...recent.map((g) => pastItem(g, tagSetName(tagsets, g.game_mode as unknown as number)))
			]);
		}

		getRecentGames({ limit: RECENT_COUNT })
			.then((result) => {
				recent = result;
			})
			.catch(() => {})
			.finally(loadLive);

		const interval = setInterval(loadLive, REFRESH_MS);
		return () => {
			cancelled = true;
			clearInterval(interval);
		};
	}, [tagsets]);

	function updateEdges() {
		const el = scrollRef.current;
		if (!el) return;
		setEdges({
			left: el.scrollLeft > 4,
			right: el.scrollLeft + el.clientWidth < el.scrollWidth - 4
		});
	}

	useEffect(() => {
		updateEdges();
	}, [items]);

	function scrollBy(direction: 1 | -1) {
		const el = scrollRef.current;
		if (!el) return;
		el.scrollBy({ left: direction * el.clientWidth * 0.8, behavior: 'smooth' });
	}

	if (items.length === 0) return null;

	return (
		<div className="sticky top-16 z-40 border-b border-night-700 bg-night-900/95 backdrop-blur">
			<div className="relative mx-auto max-w-7xl">
				{edges.left && (
					<button
						aria-label="Scroll left"
						onClick={() => scrollBy(-1)}
						className="absolute left-0 top-0 bottom-0 z-10 flex w-9 items-center justify-center bg-gradient-to-r from-night-900 to-transparent text-fog-300 hover:text-fog-100"
					>
						‹
					</button>
				)}
				<div
					ref={scrollRef}
					onScroll={updateEdges}
					className="flex gap-2 overflow-x-auto px-9 py-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
				>
					{items.map((item) => (
						<TickerBox key={item.key} item={item} />
					))}
				</div>
				{edges.right && (
					<button
						aria-label="Scroll right"
						onClick={() => scrollBy(1)}
						className="absolute right-0 top-0 bottom-0 z-10 flex w-9 items-center justify-center bg-gradient-to-l from-night-900 to-transparent text-fog-300 hover:text-fog-100"
					>
						›
					</button>
				)}
			</div>
		</div>
	);
}
