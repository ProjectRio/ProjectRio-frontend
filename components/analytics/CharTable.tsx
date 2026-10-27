'use client';

import { useState } from 'react';
import type { CharAgg } from '@/lib/charAnalytics';
import { CharPortrait } from '@/components/player/widgets';
import { DIVERGING, pct, signedNum, signedPp } from './theme';

// The main leaderboard: one row per character (or variant group), sortable by
// any column. Win rate leads; "xWin%" and "± Expected" (the gap vs the
// rating-implied expectation) are kept as context columns — ratings reset to
// 1500 per mode and the payload carries no rating deviation, so expectation is
// too noisy early in a mode's life to headline. A small diverging bar makes
// the gap scannable without reading every number.

type SortKey =
	| 'name'
	| 'games'
	| 'pickPct'
	| 'captainPct'
	| 'winPct'
	| 'expWinPct'
	| 'waeRate'
	| 'wae'
	| 'avgElo';

const COLUMNS: { key: SortKey; label: string; title: string; align?: 'left' }[] = [
	{ key: 'name', label: 'Character', title: 'Character or variant group', align: 'left' },
	{ key: 'games', label: 'G', title: 'Team-games where the character appears' },
	{ key: 'pickPct', label: 'Pick%', title: 'Share of filtered teams that drafted the character' },
	{ key: 'captainPct', label: 'Cap%', title: 'Share of those teams where it was the captain' },
	{ key: 'winPct', label: 'Win%', title: 'Actual win rate' },
	{ key: 'expWinPct', label: 'xWin%', title: 'Rating-implied win rate over the same games (experimental: ratings reset to 1500 each mode; unranked count as 50/50)' },
	{ key: 'waeRate', label: '± Expected', title: 'Win% minus xWin%, in percentage points (experimental)' },
	{ key: 'wae', label: 'WAE', title: 'Total wins above expected' },
	{ key: 'avgElo', label: 'Avg ELO', title: 'Average rating of players who picked it (ranked games)' }
];

function DivergingBar({ value, max }: { value: number; max: number }) {
	const half = 44; // px each side of the midpoint
	const width = max > 0 ? Math.min(1, Math.abs(value) / max) * half : 0;
	return (
		<span className="relative inline-block h-2 align-middle" style={{ width: half * 2 }} aria-hidden>
			<span
				className="absolute inset-y-0 w-px"
				style={{ left: half, backgroundColor: DIVERGING.neutral }}
			/>
			<span
				className="absolute inset-y-0.5 rounded-sm"
				style={{
					left: value >= 0 ? half + 1 : half - width,
					width,
					backgroundColor: value >= 0 ? DIVERGING.positive : DIVERGING.negative
				}}
			/>
		</span>
	);
}

export default function CharTable({
	aggs,
	selectedKey,
	onSelect
}: {
	aggs: CharAgg[];
	selectedKey: string | null;
	onSelect: (key: string) => void;
}) {
	const [sortKey, setSortKey] = useState<SortKey>('winPct');
	const [descending, setDescending] = useState(true);

	const sorted = [...aggs].sort((a, b) => {
		let diff: number;
		if (sortKey === 'name') diff = a.group.name.localeCompare(b.group.name);
		else diff = (a[sortKey] ?? -Infinity) - ((b[sortKey] ?? -Infinity) as number);
		return descending ? -diff : diff;
	});
	const maxAbsWae = Math.max(0.001, ...aggs.map((agg) => Math.abs(agg.waeRate)));

	function toggleSort(key: SortKey) {
		if (key === sortKey) setDescending(!descending);
		else {
			setSortKey(key);
			setDescending(key !== 'name');
		}
	}

	return (
		<div className="overflow-x-auto">
			<table className="w-full text-sm" style={{ fontVariantNumeric: 'tabular-nums' }}>
				<thead>
					<tr className="border-b border-night-700 text-[11px] uppercase tracking-wider text-fog-500">
						{COLUMNS.map((column) => (
							<th
								key={column.key}
								className={`whitespace-nowrap px-3 py-2 font-semibold ${
									column.align === 'left' ? 'text-left' : 'text-right'
								}`}
							>
								<button
									type="button"
									title={column.title}
									className={`transition-colors hover:text-fog-100 ${
										sortKey === column.key ? 'text-rio-300' : ''
									}`}
									onClick={() => toggleSort(column.key)}
								>
									{column.label}
									{sortKey === column.key ? (descending ? ' ↓' : ' ↑') : ''}
								</button>
							</th>
						))}
					</tr>
				</thead>
				<tbody>
					{sorted.map((agg) => {
						const selected = agg.group.key === selectedKey;
						return (
							<tr
								key={agg.group.key}
								className={`cursor-pointer border-b border-night-800 transition-colors ${
									selected ? 'bg-rio-500/10' : 'hover:bg-night-800/60'
								}`}
								onClick={() => onSelect(agg.group.key)}
							>
								<td className="px-3 py-1.5">
									<span className="flex items-center gap-2.5">
										<CharPortrait name={agg.group.portraitName} size={28} />
										<span className="font-medium text-fog-100">{agg.group.name}</span>
										{agg.group.charClass && (
											<span className="text-[10px] uppercase tracking-wider text-fog-500">
												{agg.group.charClass}
											</span>
										)}
									</span>
								</td>
								<td className="px-3 py-1.5 text-right text-fog-300">{agg.games}</td>
								<td className="px-3 py-1.5 text-right text-fog-300">{pct(agg.pickPct)}</td>
								<td className="px-3 py-1.5 text-right text-fog-300">
									{agg.captainGames > 0 ? pct(agg.captainPct, 0) : '—'}
								</td>
								<td className="px-3 py-1.5 text-right font-medium text-fog-100">
									{pct(agg.winPct)}
								</td>
								<td className="px-3 py-1.5 text-right text-fog-300">{pct(agg.expWinPct)}</td>
								<td className="whitespace-nowrap px-3 py-1.5 text-right">
									<DivergingBar value={agg.waeRate} max={maxAbsWae} />
									<span
										className={`ml-2 inline-block w-16 text-right font-medium ${
											agg.waeRate >= 0 ? 'text-emerald-300' : 'text-rio-300'
										}`}
									>
										{signedPp(agg.waeRate)}
									</span>
								</td>
								<td
									className={`px-3 py-1.5 text-right ${
										agg.wae >= 0 ? 'text-emerald-300' : 'text-rio-300'
									}`}
								>
									{signedNum(agg.wae)}
								</td>
								<td className="px-3 py-1.5 text-right text-fog-300">
									{agg.avgElo !== null ? Math.round(agg.avgElo) : '—'}
								</td>
							</tr>
						);
					})}
				</tbody>
			</table>
			{sorted.length === 0 && (
				<p className="py-10 text-center text-sm text-fog-500">
					No characters clear the minimum-games threshold with these filters.
				</p>
			)}
		</div>
	);
}

export function OutlierCallouts({ aggs }: { aggs: CharAgg[] }) {
	if (aggs.length === 0) return null;
	const byWin = [...aggs].sort((a, b) => b.winPct - a.winPct);
	const best = byWin[0];
	const worst = byWin[byWin.length - 1];
	const byPick = [...aggs].sort((a, b) => b.pickPct - a.pickPct);
	const popular = byPick[0];
	if (!best || best === worst) return null;
	return (
		<div className="grid gap-3 sm:grid-cols-3">
			{[
				{ agg: best, label: 'Highest win rate', color: 'text-emerald-300' },
				{ agg: worst, label: 'Lowest win rate', color: 'text-rio-300' },
				{ agg: popular, label: 'Most picked', color: 'text-fog-100' }
			].map(({ agg, label, color }) => (
				<div key={label} className="panel flex items-center gap-3 p-3">
					<CharPortrait name={agg.group.portraitName} size={44} />
					<div className="min-w-0">
						<p className="text-[11px] font-semibold uppercase tracking-widest text-fog-500">
							{label}
						</p>
						<p className="truncate font-display text-lg font-bold text-fog-100">
							{agg.group.name}
							<span className={`ml-2 ${color}`}>
								{label === 'Most picked' ? pct(agg.pickPct) : pct(agg.winPct)}
							</span>
						</p>
						<p className="text-xs text-fog-500">
							{label === 'Most picked'
								? `${pct(agg.winPct)} win rate · ${agg.games} games`
								: `${signedPp(agg.waeRate)} vs expected · ${agg.games} games`}
						</p>
					</div>
				</div>
			))}
		</div>
	);
}
