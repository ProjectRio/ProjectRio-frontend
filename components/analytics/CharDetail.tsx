'use client';

import { useMemo } from 'react';
import {
	companionStats,
	eloBandStats,
	monthlyTrend,
	type CharAgg,
	type CharGroup,
	type TeamRow,
	type VsAgg
} from '@/lib/charAnalytics';
import { CharPortrait, StatBlock } from '@/components/player/widgets';
import { Badge } from '@/components/ui';
import { DIVERGING, pct, signedPp } from './theme';

// Drill-down for one character (or variant group): who it beats, who beats it,
// who it works best alongside, how it fares across rating bands, and its
// month-by-month win rate. All of it respects the page-level filters.

const CLASS_BADGE: { [key: string]: 'red' | 'gold' | 'gray' | 'green' } = {
	Power: 'red',
	Technique: 'gold',
	Speed: 'green',
	Balance: 'gray'
};

function CompanionList({
	title,
	entries,
	emptyText
}: {
	title: string;
	entries: VsAgg[];
	emptyText: string;
}) {
	return (
		<div>
			<p className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-fog-500">
				{title}
			</p>
			{entries.length === 0 ? (
				<p className="py-3 text-xs text-fog-500">{emptyText}</p>
			) : (
				<ul className="space-y-1.5">
					{entries.map((entry) => (
						<li key={entry.group.key} className="flex items-center gap-2.5">
							<CharPortrait name={entry.group.portraitName} size={26} />
							<span className="min-w-0 flex-1 truncate text-sm text-fog-100">
								{entry.group.name}
							</span>
							<span
								className="text-xs text-fog-500"
								style={{ fontVariantNumeric: 'tabular-nums' }}
							>
								{entry.games}g
							</span>
							<span
								className={`w-12 text-right text-sm font-medium ${
									entry.winPct >= 0.5 ? 'text-emerald-300' : 'text-rio-300'
								}`}
								style={{ fontVariantNumeric: 'tabular-nums' }}
							>
								{pct(entry.winPct, 0)}
							</span>
						</li>
					))}
				</ul>
			)}
		</div>
	);
}

// Paired columns per rating band: expected win rate (neutral) beside actual
// (green/red by direction), so a single band can't hide behind a global average.
function EloBandChart({ rows, group }: { rows: TeamRow[]; group: CharGroup }) {
	const bands = useMemo(() => eloBandStats(rows, group), [rows, group]);
	const shown = bands.filter((band) => band.games > 0);
	if (shown.length < 2) {
		return <p className="py-3 text-xs text-fog-500">Not enough ranked games for rating bands.</p>;
	}
	const max = Math.max(...shown.map((band) => Math.max(band.winPct, band.expWinPct)), 0.6);
	return (
		<div>
			<div className="flex items-end gap-3" style={{ height: 96 }}>
				{shown.map((band) => (
					<div key={band.label} className="group/band relative flex flex-1 items-end justify-center gap-1">
						<div
							className="w-3 rounded-t-[3px]"
							title={`Expected ${pct(band.expWinPct)}`}
							style={{ height: `${(band.expWinPct / max) * 88}px`, backgroundColor: DIVERGING.neutral }}
						/>
						<div
							className="w-3 rounded-t-[3px]"
							title={`Actual ${pct(band.winPct)} over ${band.games} games`}
							style={{
								height: `${(band.winPct / max) * 88}px`,
								backgroundColor: band.winPct >= band.expWinPct ? DIVERGING.positive : DIVERGING.negative
							}}
						/>
					</div>
				))}
			</div>
			<div className="mt-1 flex gap-3">
				{shown.map((band) => (
					<p key={band.label} className="flex-1 text-center text-[10px] text-fog-500">
						{band.label}
						<span className="block">{band.games}g</span>
					</p>
				))}
			</div>
			<p className="mt-1.5 text-[10px] text-fog-500">
				Gray = expected from ELO · colored = actual win rate, by the picking player’s rating band
			</p>
		</div>
	);
}

function TrendChart({ rows, group }: { rows: TeamRow[]; group: CharGroup }) {
	const points = useMemo(() => monthlyTrend(rows, group), [rows, group]);
	if (points.length < 3) return null;
	const width = 260;
	const height = 64;
	const pad = 4;
	const path = points
		.map((point, index) => {
			const x = pad + (index / (points.length - 1)) * (width - pad * 2);
			const y = pad + (1 - point.winPct) * (height - pad * 2);
			return `${index === 0 ? 'M' : 'L'}${x.toFixed(1)} ${y.toFixed(1)}`;
		})
		.join(' ');
	const mid = pad + 0.5 * (height - pad * 2);
	return (
		<div>
			<p className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-fog-500">
				Monthly win rate
			</p>
			<svg viewBox={`0 0 ${width} ${height}`} className="w-full" aria-hidden>
				<line x1={pad} x2={width - pad} y1={mid} y2={mid} stroke="#2b2b40" strokeDasharray="3 3" />
				<path d={path} fill="none" stroke="#ff3d4e" strokeWidth={2} strokeLinejoin="round" />
			</svg>
			<div className="flex justify-between text-[10px] text-fog-500">
				<span>{points[0].label}</span>
				<span>50% line</span>
				<span>{points[points.length - 1].label}</span>
			</div>
		</div>
	);
}

export default function CharDetail({
	agg,
	rows,
	groups,
	excludeMirrors,
	minGames,
	onClose
}: {
	agg: CharAgg;
	rows: TeamRow[];
	groups: CharGroup[];
	excludeMirrors: boolean;
	minGames: number;
	onClose: () => void;
}) {
	const group = agg.group;
	const vs = useMemo(
		() => companionStats(rows, groups, group, 'vs', excludeMirrors),
		[rows, groups, group, excludeMirrors]
	);
	const withMates = useMemo(
		() => companionStats(rows, groups, group, 'with', excludeMirrors),
		[rows, groups, group, excludeMirrors]
	);
	const threshold = Math.max(5, Math.floor(minGames / 2));
	const vsEligible = vs.filter((entry) => entry.games >= threshold);
	const withEligible = withMates.filter((entry) => entry.games >= threshold);
	const beats = [...vsEligible].sort((a, b) => b.winPct - a.winPct).slice(0, 5);
	const losesTo = [...vsEligible].sort((a, b) => a.winPct - b.winPct).slice(0, 5);
	const bestWith = [...withEligible].sort((a, b) => b.winPct - a.winPct).slice(0, 5);

	return (
		<div className="panel">
			<div className="flex items-center gap-4 border-b border-night-700 bg-night-850 px-4 py-3">
				<CharPortrait name={group.portraitName} size={44} />
				<div className="min-w-0 flex-1">
					<h2 className="truncate font-display text-xl font-bold uppercase text-fog-100">
						{group.name}
					</h2>
					<div className="mt-0.5 flex items-center gap-2">
						{group.charClass && <Badge color={CLASS_BADGE[group.charClass]}>{group.charClass}</Badge>}
						{group.charIds.length > 1 && (
							<span className="text-xs text-fog-500">{group.charIds.length} variants grouped</span>
						)}
					</div>
				</div>
				<button
					type="button"
					className="rounded px-2 py-1 text-sm text-fog-500 transition-colors hover:bg-night-700 hover:text-fog-100"
					onClick={onClose}
				>
					✕
				</button>
			</div>

			<div className="grid grid-cols-2 gap-4 border-b border-night-800 px-4 py-4 sm:grid-cols-4">
				<StatBlock label="Record" value={`${agg.wins}–${agg.losses}`} sub={`${pct(agg.winPct)} win rate`} />
				<StatBlock label="Pick rate" value={pct(agg.pickPct)} sub="of filtered teams" />
				<StatBlock
					label="As captain"
					value={agg.captainGames > 0 ? pct(agg.captainWins / agg.captainGames, 0) : '—'}
					sub={agg.captainGames > 0 ? `${agg.captainGames} games as captain` : 'never captained here'}
				/>
				<StatBlock
					label="vs Expected"
					value={
						<span className={agg.waeRate >= 0 ? 'text-emerald-300' : 'text-rio-300'}>
							{signedPp(agg.waeRate)}
						</span>
					}
					sub="experimental — see note below"
				/>
			</div>

			<div className="grid gap-6 px-4 py-4 md:grid-cols-3">
				<CompanionList title="Feasts on" entries={beats} emptyText="No opponent seen often enough." />
				<CompanionList title="Struggles against" entries={losesTo} emptyText="No opponent seen often enough." />
				<CompanionList title="Best teammates" entries={bestWith} emptyText="No teammate seen often enough." />
			</div>

			<div className="grid gap-6 border-t border-night-800 px-4 py-4 md:grid-cols-2">
				<div>
					<p className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-fog-500">
						Win rate by player rating
					</p>
					<EloBandChart rows={rows} group={group} />
				</div>
				<TrendChart rows={rows} group={group} />
			</div>
		</div>
	);
}
