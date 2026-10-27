import { statBars, type CharacterAttributes } from '@/lib/data/characterAttributes';

// The four character-select stat bars (out of 10), rendered as pip meters.
export function StatBars({
	attrs,
	compact = false
}: {
	attrs: CharacterAttributes;
	compact?: boolean;
}) {
	return (
		<div className={compact ? 'space-y-1' : 'space-y-2'}>
			{statBars(attrs).map(({ label, value }) => (
				<div key={label} className="flex items-center gap-2">
					<span
						className={`shrink-0 font-display font-semibold uppercase tracking-wider text-fog-500 ${
							compact ? 'w-14 text-[10px]' : 'w-16 text-xs'
						}`}
					>
						{label}
					</span>
					<div className="flex gap-[3px]" role="img" aria-label={`${label} ${value} out of 10`}>
						{Array.from({ length: 10 }, (_, i) => (
							<span
								key={i}
								className={`${compact ? 'h-2 w-1.5' : 'h-2.5 w-2'} skew-x-[-12deg] rounded-[2px] ${
									i < value ? 'bg-rio-400' : 'bg-night-700'
								}`}
							/>
						))}
					</div>
					<span
						className={`font-display font-bold tabular-nums text-fog-300 ${compact ? 'text-[10px]' : 'text-xs'}`}
					>
						{value}
					</span>
				</div>
			))}
		</div>
	);
}
