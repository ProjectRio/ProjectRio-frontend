'use client';

import { useMemo, useState } from 'react';
import type { ScoringPlay } from '@/lib/api';
import GCButton from '@/components/GCButton';
import MainMenu from './MainMenu';
import { MENU_ITEMS } from './menu';
import { BoardStage, Stadium } from './parts';
import { headlinePlay, liveScene, sprayScene } from './scene';
import { useHomeData } from './useHomeData';
import { useRanked } from './useRanked';

/**
 * The landing page as the game's title menu: the list on the left is the whole
 * site, and the board on the right shows what is behind the lit row, live.
 * When the row is about a game, the board folds down to a scorebug and the
 * game is played out on the stadium behind it; on Ranked the board steps
 * aside and the top of the ladder is run up flagpoles along the outfield wall.
 */
export default function TitleScreen() {
	const data = useHomeData();
	const ranked = useRanked(data.recent, data.tagsets);
	// The cursor starts on the first row, as a title menu's does.
	const [index, setIndex] = useState(0);
	const item = MENU_ITEMS[index];

	// The last final opens on the play it is remembered by; pointing at another
	// scoring play on the board swaps that ball's flight onto the field.
	const [pointed, setPointed] = useState<ScoringPlay | null>(null);
	const { featured, landings } = data;
	const headline = useMemo(() => headlinePlay(featured?.scoring_plays ?? [], landings), [featured, landings]);
	const lit = pointed ?? headline;

	const game = data.live?.[0];
	const scene = useMemo(() => {
		if (item.key === 'live') return game ? liveScene(game) : null;
		if (item.key === 'pitch') return featured && landings ? sprayScene(featured, landings, lit) : null;
		return null;
	}, [item.key, game, featured, landings, lit]);
	const ladder = useMemo(
		() =>
			item.key === 'ranked' && ranked.mode && ranked.players?.length ? { season: ranked.mode, players: ranked.players } : null,
		[item.key, ranked.mode, ranked.players]
	);

	return (
		<div className="title-screen relative">
			<div className="mx-auto w-full max-w-[1400px] px-5 pb-14 pt-4 sm:px-8 title-fill lg:flex lg:flex-col lg:justify-center lg:px-12 lg:pb-6 lg:pt-6">
				{/* The masthead is every page's header at full size: pennant, title, foul line. */}
				<div className="flex flex-wrap items-end justify-between gap-x-12 gap-y-5">
					<div>
						<p className="kicker text-[0.95rem] max-sm:text-[0.8rem]">The Mario Superstar Baseball Center</p>
						{/* The mark sits centred on the title: the header's lockup at full size. */}
						<h1 className="mt-3 flex items-center gap-[0.18em] text-[clamp(2.9rem,6.2vw,5.9rem)] leading-[0.92] [text-shadow:0_4px_0_rgb(0_0_0/0.5)] sm:text-[clamp(3.5rem,6.2vw,5.9rem)]">
							{/* eslint-disable-next-line @next/next/no-img-element */}
							<img src="/images/RioMark.svg" alt="" className="h-12 w-12 shrink-0 sm:h-16 sm:w-16 lg:h-20 lg:w-20" />
							<span>
								Project <span className="text-rio-400">Rio</span>
							</span>
						</h1>
					</div>
					<a
						href="https://github.com/ProjectRio/ProjectRio/releases/latest"
						target="_blank"
						rel="noreferrer"
						className="btn-primary shrink-0 lg:mb-1.5"
					>
						<GCButton button="start" size={24} pressed /> Download
					</a>
				</div>
				<div className="chalk mt-[clamp(1rem,2.4vh,1.5rem)]" />

				<div className="mt-[clamp(1.5rem,4vh,2.5rem)] grid grid-cols-[minmax(0,1fr)] items-start gap-x-14 gap-y-8 lg:grid-cols-[minmax(0,4fr)_minmax(0,7fr)]">
					<div className="relative z-10">
						<MainMenu index={index} onIndex={setIndex} live={data.live ? data.live.length : null} />
					</div>

					<div className="title-stage relative">
						<Stadium scene={scene} ladder={ladder} />
						{/* The board keeps its full height of room, so the park never moves when it folds. */}
						<div className="lg:h-[var(--board-h)]">
							<BoardStage index={index} data={{ ...data, ranked, headline, lit, onLit: setPointed }} />
						</div>
						<div className="title-peek hidden lg:block" />
					</div>
				</div>
			</div>
		</div>
	);
}
