'use client';

import { PARKS, setPark } from '@/lib/parks';
import { usePark } from '@/lib/usePark';

/**
 * Stadium select. Steps through the seven parks the way the game's own
 * stadium screen does; the whole site takes the park's ground and wall.
 */
export default function ParkPicker({ className = 'mt-5' }: { className?: string }) {
	const park = usePark();
	const index = PARKS.findIndex((p) => p.key === park);

	function step(delta: number) {
		setPark(PARKS[(index + delta + PARKS.length) % PARKS.length].key);
	}

	return (
		<div className={className}>
			<p className="font-display text-sm font-semibold uppercase tracking-[0.16em] text-fog-500">Home park</p>
			<div className="sel mt-2 inline-flex h-10 items-center">
				<button
					type="button"
					aria-label="Previous park"
					onClick={() => step(-1)}
					className="h-full px-3 text-fog-300 hover:text-fog-100"
				>
					◀
				</button>
				<span className="w-36 text-center font-title text-lg leading-none" aria-live="polite">
					{PARKS[index].name}
				</span>
				<button
					type="button"
					aria-label="Next park"
					onClick={() => step(1)}
					className="h-full px-3 text-fog-300 hover:text-fog-100"
				>
					▶
				</button>
			</div>
		</div>
	);
}
