// Small HUD pieces shared by the live and completed game pages. Shapes follow
// the game's own: star power is five orbs on silver backdrops, outs are pips.

/** Team star meter: five orbs, lit from the left. */
export function StarOrbs({ stars, className = '' }: { stars: number; className?: string }) {
	return (
		<span className={`inline-flex gap-1 ${className}`} role="img" aria-label={`${stars} of 5 team stars`}>
			{Array.from({ length: 5 }, (_, i) => (
				<span
					key={i}
					className={`h-2.5 w-2.5 rounded-full border ${
						i < stars
							? 'border-[#a34b00] bg-[#ff9c2a] [box-shadow:inset_0_1.5px_0_rgb(255_255_255/0.55)]'
							: 'border-[#59635d] bg-[#2a302d]'
					}`}
				/>
			))}
		</span>
	);
}

/** Outs: two pips, as on the game's HUD (the third out ends the half). */
export function OutPips({ outs }: { outs: number }) {
	return (
		<span className="inline-flex items-center gap-1.5" role="img" aria-label={`${outs} out${outs === 1 ? '' : 's'}`}>
			<span className="font-display text-xs font-semibold uppercase tracking-[0.14em] text-fog-500">Out</span>
			{[0, 1].map((i) => (
				<span
					key={i}
					className={`h-3 w-3 rounded-full border ${
						i < outs
							? 'border-[#7c1017] bg-[#e63e3e] [box-shadow:inset_0_1.5px_0_rgb(255_255_255/0.45)]'
							: 'border-[#59635d] bg-[#2a302d]'
					}`}
				/>
			))}
		</span>
	);
}

/** The base diamond with occupied bases lit. */
export function BaseDiamond({ first, second, third, size = 44 }: { first: boolean; second: boolean; third: boolean; size?: number }) {
	const base = (on: boolean, x: number, y: number) => (
		<rect
			x={x - 7}
			y={y - 7}
			width="14"
			height="14"
			transform={`rotate(45 ${x} ${y})`}
			fill={on ? 'var(--color-star-400)' : '#2a302d'}
			stroke={on ? '#7a5a00' : '#59635d'}
			strokeWidth="1.5"
		/>
	);
	const occupied = [first && 'first', second && 'second', third && 'third'].filter(Boolean).join(', ');
	return (
		<svg viewBox="0 0 60 44" width={(size * 60) / 44} height={size} role="img" aria-label={occupied ? `Runners on ${occupied}` : 'Bases empty'}>
			{base(third, 13, 28)}
			{base(second, 30, 12)}
			{base(first, 47, 28)}
		</svg>
	);
}

/** Captain mark for roster rows. */
export function CaptainMark() {
	return (
		<span
			title="Captain"
			className="inline-flex h-4 w-4 flex-none items-center justify-center rounded-full border border-[#7a5a00] bg-star-400 font-display text-[10px] font-bold leading-none text-[#14140c]"
		>
			C
		</span>
	);
}
