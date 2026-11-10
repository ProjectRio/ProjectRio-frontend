'use client';

import { useEffect, useState } from 'react';
import { usePark } from '@/lib/usePark';
import type { ParkKey } from '@/lib/parks';

/**
 * The loading screen. The game fills its loads with a tip about the park you
 * are about to play in; the site does the same for the current home park.
 */
const PARK_TIPS: Record<ParkKey, string> = {
	mario: 'Mario Stadium has no hazards. What you hit is what you get.',
	bowser: 'At Bowser Castle, Thwomps on the wall knock home-run balls back into play.',
	wario: 'At Wario Palace, Chain Chomps patrol the outfield and sandstorms carry the ball.',
	yoshi: 'At Yoshi Park, Piranha Plants swallow a ball and spit it somewhere else.',
	peach: "At Peach Garden, a ball off the blocks in the outfield doesn't go where you expect.",
	dk: 'At DK Jungle, barrels roll across the outfield and Klaptraps wait in the river.',
	toy: 'Toy Field scores by the panel the ball lands on, not by the bases.'
};

const TIPS = [
	'Mercy ends a game once the lead reaches 10 runs.',
	'Chemistry runs both ways: any two characters share a single value.'
];

export default function LoadingTip({ label }: { label: string }) {
	const park = usePark();
	const [tip, setTip] = useState<string | null>(null);

	// Chosen after mount so server and client markup agree.
	useEffect(() => {
		const pool = [PARK_TIPS[park], PARK_TIPS[park], ...TIPS];
		setTip(pool[Math.floor(Math.random() * pool.length)]);
	}, [park]);

	return (
		<div className="flex flex-col items-center justify-center gap-3 py-12 text-center" role="status">
			<div className="swing-sprite" aria-hidden />
			<span className="font-display text-sm font-semibold uppercase tracking-[0.16em] text-fog-500">{label}</span>
			<p className="sel min-h-[2.75rem] max-w-md px-4 py-2.5 text-sm text-fog-100" aria-hidden={!tip}>
				{tip && (
					<>
						<span className="mr-2 font-title text-base text-[var(--park-accent)]">Tip</span>
						{tip}
					</>
				)}
			</p>
		</div>
	);
}
