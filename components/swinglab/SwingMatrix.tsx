'use client';

// The core read of the lab: contact frame across the top, stick hold down the
// side, one cell per combination. Magnitude (BA or SLG) is a single-hue
// sequential ramp — dark surface up to bright — and sample size rides on the
// cell's opacity, so a .500 built on four at-bats never looks like a finding.

import { useMemo } from 'react';
import {
	stickLabel,
	swingStats,
	formatBa,
	type LandingRow,
	type RankMetric
} from '@/lib/landingData';

// Sequential ramp, one hue (the brand red), monotonic lightness against the
// night-850 panel. Never a rainbow: these are magnitudes, not identities.
const RAMP = ['#241a20', '#431d27', '#6b2230', '#96283a', '#c03444', '#e64f58', '#ff8a92'];

export interface CellKey {
	frame: number;
	stickX: string;
	stickY: string;
}

export function cellMatches(row: LandingRow, key: CellKey): boolean {
	return row.frame === key.frame && row.stick.x === key.stickX && row.stick.y === key.stickY;
}

// Hand-relative order so the pull side always sits together, whatever the stance.
const STICK_ORDER: { x: string; y: string }[] = [
	{ x: 'none', y: 'none' },
	{ x: 'pull', y: 'none' },
	{ x: 'push', y: 'none' },
	{ x: 'none', y: 'up' },
	{ x: 'none', y: 'down' },
	{ x: 'pull', y: 'up' },
	{ x: 'pull', y: 'down' },
	{ x: 'push', y: 'up' },
	{ x: 'push', y: 'down' }
];

// "pull"/"push" are stance-relative; the stored hold is absolute left/right.
// A righty pulls by holding left, a lefty by holding right (see stickLabel).
function toAbsolute(x: string, lefty: boolean): string {
	if (x === 'none') return 'none';
	if (x === 'pull') return lefty ? 'right' : 'left';
	return lefty ? 'left' : 'right';
}

export default function SwingMatrix({
	rows,
	metric,
	minAb,
	lefty,
	selected,
	onSelect
}: {
	rows: LandingRow[];
	metric: RankMetric;
	minAb: number;
	lefty: boolean;
	selected: CellKey | null;
	onSelect: (key: CellKey | null) => void;
}) {
	const { frames, cells, max } = useMemo(() => {
		const byKey = new Map<string, LandingRow[]>();
		const frameSet = new Set<number>();
		for (const row of rows) {
			frameSet.add(row.frame);
			const id = `${row.frame}|${row.stick.x}|${row.stick.y}`;
			const bucket = byKey.get(id);
			if (bucket) bucket.push(row);
			else byKey.set(id, [row]);
		}
		const cellMap = new Map<string, ReturnType<typeof swingStats>>();
		let peak = 0;
		for (const [id, group] of byKey) {
			const stats = swingStats(group);
			cellMap.set(id, stats);
			const value = stats[metric];
			if (value !== null && stats.ab >= minAb && value > peak) peak = value;
		}
		return {
			frames: [...frameSet].sort((a, b) => a - b),
			cells: cellMap,
			max: peak || (metric === 'slg' ? 1 : 0.4)
		};
	}, [rows, metric, minAb]);

	// Only show stick holds this character actually used.
	const stickRows = STICK_ORDER.map((hold) => ({
		...hold,
		absX: toAbsolute(hold.x, lefty)
	})).filter((hold) =>
		frames.some((frame) => cells.has(`${frame}|${hold.absX}|${hold.y}`))
	);

	if (frames.length === 0) return null;

	return (
		<div className="overflow-x-auto p-4">
			<table className="w-full min-w-[34rem] border-separate border-spacing-[2px]">
				<thead>
					<tr>
						<th className="w-24 text-left text-[11px] font-semibold uppercase tracking-widest text-fog-500">
							Stick
						</th>
						{frames.map((frame) => (
							<th
								key={frame}
								className="text-center font-display text-xs font-bold tabular-nums text-fog-300"
							>
								{frame}
							</th>
						))}
					</tr>
				</thead>
				<tbody>
					{stickRows.map((hold) => (
						<tr key={`${hold.x}|${hold.y}`}>
							<td className="whitespace-nowrap pr-2 text-xs text-fog-300">
								{stickLabel({ mask: 0, x: hold.absX as any, y: hold.y as any }, lefty)}
							</td>
							{frames.map((frame) => {
								const id = `${frame}|${hold.absX}|${hold.y}`;
								const stats = cells.get(id);
								const value = stats?.[metric] ?? null;
								const qualified = (stats?.ab ?? 0) >= minAb;
								const isSelected =
									selected?.frame === frame &&
									selected.stickX === hold.absX &&
									selected.stickY === hold.y;

								if (!stats || stats.contacts === 0) {
									return (
										<td key={frame} className="h-10 rounded bg-night-850/40" />
									);
								}

								const step =
									value === null
										? 0
										: Math.min(RAMP.length - 1, Math.round((value / max) * (RAMP.length - 1)));

								return (
									<td key={frame} className="p-0">
										<button
											type="button"
											onClick={() =>
												onSelect(
													isSelected
														? null
														: { frame, stickX: hold.absX, stickY: hold.y }
												)
											}
											title={`Frame ${frame} · ${stickLabel(
												{ mask: 0, x: hold.absX as any, y: hold.y as any },
												lefty
											)}
${stats.contacts} contacts · ${stats.ab} AB
BA ${formatBa(stats.ba)} · SLG ${formatBa(stats.slg)}
${Math.round((stats.foulRate ?? 0) * 100)}% fouled${
												qualified ? '' : `\nbelow the ${minAb}-AB minimum`
											}`}
											className={`flex h-10 w-full flex-col items-center justify-center rounded transition-all ${
												isSelected ? 'ring-2 ring-star-400' : 'hover:ring-1 hover:ring-fog-300'
											}`}
											style={{
												backgroundColor: RAMP[step],
												opacity: qualified ? 1 : 0.35
											}}
										>
											<span className="font-display text-xs font-bold tabular-nums text-fog-100">
												{formatBa(value)}
											</span>
											<span className="text-[9px] tabular-nums text-fog-100/60">
												{stats.ab}
											</span>
										</button>
									</td>
								);
							})}
						</tr>
					))}
				</tbody>
			</table>

			<div className="mt-3 flex flex-wrap items-center gap-3 text-[11px] text-fog-500">
				<span className="uppercase tracking-widest">
					{metric === 'ba' ? 'Batting average' : 'Slugging'}
				</span>
				<span className="flex items-center gap-1">
					<span>0</span>
					{RAMP.map((color) => (
						<span
							key={color}
							className="h-2.5 w-5 first:rounded-l last:rounded-r"
							style={{ backgroundColor: color }}
						/>
					))}
					<span className="tabular-nums">{formatBa(max)}</span>
				</span>
				<span>faded = under {minAb} AB · number below each cell is at-bats</span>
			</div>
		</div>
	);
}
