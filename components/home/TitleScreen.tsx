'use client';

import { useState } from 'react';
import GCButton from '@/components/GCButton';
import MainMenu from './MainMenu';
import { BoardStage, ControlsHint, Park } from './parts';
import { useHomeData } from './useHomeData';

/**
 * The landing page as the game's title menu: the list on the left is the whole
 * site, and the board on the right shows what is behind the lit row, live.
 */
export default function TitleScreen() {
	const data = useHomeData();
	const [index, setIndex] = useState(0);

	return (
		<div className="title-screen relative [--park-peek:18rem]">
			<div className="mx-auto w-full max-w-[1480px] px-5 pb-14 pt-4 sm:px-8 lg:flex lg:min-h-[calc(100dvh-67px)] lg:flex-col lg:justify-center lg:px-12 lg:pb-[var(--park-peek)] lg:pt-0">
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
						<MainMenu index={index} onIndex={setIndex} live={data.live ? data.live.length : null} />
						<ControlsHint className="pl-5" />
					</div>

					<div className="title-stage relative">
						<Park />
						<BoardStage index={index} data={data} />
					</div>
				</div>
			</div>
		</div>
	);
}
