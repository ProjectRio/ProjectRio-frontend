'use client';

import { useEffect, useState } from 'react';
import { getLiveGames, getRecentGames, type GameSummary } from '@/lib/api';
import { useTagsets } from '@/lib/useTagsets';
import GCButton from '@/components/GCButton';
import MainMenu, { MENU_ITEMS, type MenuKey } from './MainMenu';
import {
	CommunitiesBoard,
	LiveBoard,
	PlayersBoard,
	RankedBoard,
	RecentBoard,
	ToolsBoard,
	type BoardData
} from './boards';

const LIVE_WINDOW_SECONDS = 60 * 60;
const REFRESH_MS = 30_000;

const BOARDS: Record<MenuKey, (props: BoardData) => React.ReactNode> = {
	live: LiveBoard,
	ranked: RankedBoard,
	recent: RecentBoard,
	players: PlayersBoard,
	communities: CommunitiesBoard,
	tools: ToolsBoard
};

/**
 * The landing page as the game's title menu: the list on the left is the whole
 * site, and the board on the right shows what is behind the lit row, live.
 */
export default function TitleScreen() {
	const [index, setIndex] = useState(0);
	const [live, setLive] = useState<any[] | null>(null);
	const [recent, setRecent] = useState<GameSummary[] | null>(null);
	const tagsets = useTagsets();

	useEffect(() => {
		let cancelled = false;
		getRecentGames({ limit: 24, rosters: true })
			.then((games) => !cancelled && setRecent(games))
			.catch(() => !cancelled && setRecent([]));

		function loadLive() {
			getLiveGames(LIVE_WINDOW_SECONDS)
				.then((games) => !cancelled && setLive(games))
				.catch(() => !cancelled && setLive([]));
		}
		loadLive();
		const interval = setInterval(loadLive, REFRESH_MS);
		return () => {
			cancelled = true;
			clearInterval(interval);
		};
	}, []);

	const item = MENU_ITEMS[index];
	const Board = BOARDS[item.key];

	return (
		<div className="title-screen relative overflow-hidden">
			<div className="mx-auto w-full max-w-[1480px] px-5 pb-14 pt-4 sm:px-8 lg:flex lg:min-h-[calc(100dvh-67px)] lg:flex-col lg:justify-center lg:px-12 lg:pb-[clamp(2.5rem,9vh,6rem)] lg:pt-0">
				{/* The masthead is every page's header at full size: pennant, title, foul line. */}
				<div className="flex flex-wrap items-end justify-between gap-x-12 gap-y-5">
					<div>
						<p className="kicker text-[0.95rem] max-sm:text-[0.8rem]">The Mario Superstar Baseball Center</p>
						<h1 className="mt-3 text-[clamp(3.5rem,6.2vw,5.9rem)] leading-[0.92] [text-shadow:0_4px_0_rgb(0_0_0/0.5)]">
							Project <span className="text-rio-400">Rio</span>
						</h1>
					</div>
					<div className="flex flex-wrap items-center gap-x-7 gap-y-4 lg:pb-1.5">
						<p className="max-w-[23rem] text-lg leading-snug text-fog-300 lg:text-right">
							Netplay, ranked ladders and a stat line for every pitch of Mario Superstar Baseball.
						</p>
						<a href="https://www.projectrio.online/" target="_blank" rel="noreferrer" className="btn-primary shrink-0">
							<GCButton button="start" size={24} pressed /> Get Project Rio
						</a>
					</div>
				</div>
				<div className="chalk mt-[clamp(1rem,2.4vh,1.5rem)]" />

				<div className="mt-[clamp(1.5rem,4vh,2.5rem)] grid grid-cols-[minmax(0,1fr)] gap-x-14 gap-y-8 lg:grid-cols-[minmax(0,4fr)_minmax(0,7fr)]">
					<div className="relative z-10 flex flex-col justify-between gap-6">
						<MainMenu index={index} onIndex={setIndex} live={live ? live.length : null} />
						<p className="hidden items-center gap-4 pl-5 font-display text-sm font-semibold uppercase tracking-[0.12em] text-fog-500 lg:flex">
							<span className="flex items-center gap-1.5">
								<GCButton button="stick" size={18} /> Move
							</span>
							<span className="flex items-center gap-1.5">
								<GCButton button="a" size={18} /> Select
							</span>
						</p>
					</div>

					<div className="relative">
						{/* Mario Stadium, laid back behind the board like the game's HUD over the field. */}
						{/* eslint-disable-next-line @next/next/no-img-element */}
						<img
							src="/images/parks/mario.svg"
							alt=""
							className="title-park pointer-events-none absolute left-1/2 top-1/2 hidden w-[112%] max-w-none lg:block"
						/>
						<section
							aria-label={item.label}
							aria-live="polite"
							className="title-board relative flex flex-col p-4 sm:p-5 lg:h-[var(--board-h)]"
						>
							<div key={item.key} className="route-in flex min-h-0 flex-1 flex-col">
								<Board live={live} recent={recent} tagsets={tagsets} />
							</div>
						</section>
					</div>
				</div>
			</div>
		</div>
	);
}
