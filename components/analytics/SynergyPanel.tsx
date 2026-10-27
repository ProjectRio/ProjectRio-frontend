'use client';

import type { PairAgg } from '@/lib/charAnalytics';
import { CharPortrait } from '@/components/player/widgets';
import { pct, signedPp } from './theme';

// Best and worst duos: pairs drafted together, ranked by win rate. The gap vs
// rating expectation rides along as context, not the ranking.

function PairRow({ pair }: { pair: PairAgg }) {
	return (
		<li className="flex items-center gap-3 px-4 py-2">
			<span className="flex shrink-0 -space-x-1.5">
				<CharPortrait name={pair.a.portraitName} size={30} />
				<CharPortrait name={pair.b.portraitName} size={30} />
			</span>
			<span className="min-w-0 flex-1 truncate text-sm text-fog-100">
				{pair.a.name} + {pair.b.name}
			</span>
			<span className="text-xs text-fog-500" style={{ fontVariantNumeric: 'tabular-nums' }}>
				{signedPp(pair.waeRate)} · {pair.games}g
			</span>
			<span
				className={`w-14 text-right text-sm font-medium ${
					pair.winPct >= 0.5 ? 'text-emerald-300' : 'text-rio-300'
				}`}
				style={{ fontVariantNumeric: 'tabular-nums' }}
			>
				{pct(pair.winPct)}
			</span>
		</li>
	);
}

export default function SynergyPanel({ pairs, minGames }: { pairs: PairAgg[]; minGames: number }) {
	const eligible = pairs.filter((pair) => pair.games >= minGames);
	const sorted = [...eligible].sort((a, b) => b.winPct - a.winPct);
	const best = sorted.slice(0, 8);
	const worst = sorted.slice(-8).reverse();

	if (eligible.length === 0) {
		return (
			<p className="px-4 py-8 text-center text-sm text-fog-500">
				No duos clear {minGames} games together under these filters.
			</p>
		);
	}

	return (
		<div className="grid gap-0 md:grid-cols-2 md:divide-x md:divide-night-700">
			<div>
				<p className="border-b border-night-800 px-4 py-2 text-[11px] font-semibold uppercase tracking-widest text-emerald-300">
					Winningest duos
				</p>
				<ul className="divide-y divide-night-800">
					{best.map((pair) => (
						<PairRow key={`${pair.a.key}-${pair.b.key}`} pair={pair} />
					))}
				</ul>
			</div>
			<div>
				<p className="border-b border-night-800 px-4 py-2 text-[11px] font-semibold uppercase tracking-widest text-rio-300">
					Losingest duos
				</p>
				<ul className="divide-y divide-night-800">
					{worst.map((pair) => (
						<PairRow key={`${pair.a.key}-${pair.b.key}`} pair={pair} />
					))}
				</ul>
			</div>
		</div>
	);
}
