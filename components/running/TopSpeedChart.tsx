'use client';

import { useState } from 'react';
import { speedConstants } from '@/lib/mssb/RunningSimulation/runningModel';
import { SPEED_STAT_CAP } from '@/lib/mssb/RunningSimulation/runningConstants';
import { AXIS_LABEL, AXIS_TEXT, GRID, SERIES, makeScales, niceTicks, pointerToViewX } from './chartUtils';

const FPS = 60;
const W = 760;
const H = 340;
const M = { l: 52, r: 60, t: 40, b: 44 };
const SPEEDS = Array.from({ length: SPEED_STAT_CAP / 10 + 1 }, (_, i) => i * 10);
const TOP = SPEEDS.map((s) => speedConstants(s).maxV * FPS);
/** Top speed gained over the stat 10 below (none for stat 0). */
const GAIN = TOP.map((v, i) => (i === 0 ? null : v - TOP[i - 1]));
const BAR_W = 12;
/**
 * Ranges drawn as brackets above the plot: the stats characters have, what starring them gives, and the stats the
 * game accepts but no character reaches. labelBefore puts the label left of the bracket so it stays off the right axis.
 */
const RANGES = [
	{ label: 'Regular stats', from: 10, to: 90, row: 0 },
	{ label: 'Superstarred', from: 60, to: 140, row: 1 },
	{ label: 'Unused', from: 150, to: SPEED_STAT_CAP, row: 0, labelBefore: true }
];

/** Top speed (m/s) for every speed stat the game accepts. */
export default function TopSpeedChart() {
	const [hover, setHover] = useState<{ i: number; left: number; top: number } | null>(null);
	const y0 = Math.floor(Math.min(...TOP) * 2) / 2;
	const y1 = Math.ceil(Math.max(...TOP) * 2) / 2;
	const { X, Y } = makeScales(W, H, M, 0, SPEED_STAT_CAP, y0, y1);
	const g1 = Math.ceil(Math.max(...GAIN.map((g) => g ?? 0)) * 20) / 20;
	const YR = (v: number) => H - M.b - (v / g1) * (H - M.t - M.b);
	const points = TOP.map((v, i) => `${X(SPEEDS[i]).toFixed(1)},${Y(v).toFixed(1)}`).join(' ');

	function onMove(event: React.PointerEvent<SVGRectElement>) {
		const vx = pointerToViewX(event, W);
		const i = Math.max(0, Math.min(SPEEDS.length - 1, Math.round(((vx - M.l) / (W - M.l - M.r)) * (SPEEDS.length - 1))));
		const wrap = (event.currentTarget.ownerSVGElement!.parentElement as HTMLElement).getBoundingClientRect();
		setHover({ i, left: event.clientX - wrap.left, top: event.clientY - wrap.top });
	}

	return (
		<div className="relative">
			<svg viewBox={`0 0 ${W} ${H}`} className="block h-auto w-full" role="img" aria-label="Top speed in metres per second by speed stat, with the gain over the previous 10 stat points">
				{niceTicks(y0, y1, 6).map((v) => (
					<g key={v}>
						<line x1={M.l} x2={W - M.r} y1={Y(v)} y2={Y(v)} stroke={GRID} />
						<text x={M.l - 8} y={Y(v) + 4} textAnchor="end" fontSize={11} fill={AXIS_TEXT} className="font-mono">
							{v.toFixed(1)}
						</text>
					</g>
				))}
				{niceTicks(0, g1, 6).map((v) => (
					<text key={`r${v}`} x={W - M.r + 8} y={YR(v) + 4} fontSize={11} fill={AXIS_TEXT} className="font-mono">
						{v.toFixed(2)}
					</text>
				))}
				{SPEEDS.filter((s) => s % 20 === 0).map((s) => (
					<text key={s} x={X(s)} y={H - M.b + 16} textAnchor="middle" fontSize={11} fill={AXIS_TEXT} className="font-mono">
						{s}
					</text>
				))}
				<line x1={M.l} x2={W - M.r} y1={H - M.b} y2={H - M.b} stroke={AXIS_TEXT} />
				<text x={(M.l + W - M.r) / 2} y={H - 6} textAnchor="middle" fontSize={12} fill={AXIS_LABEL}>
					Speed stat
				</text>
				<text x={14} y={(M.t + H - M.b) / 2} textAnchor="middle" fontSize={12} fill={AXIS_LABEL} transform={`rotate(-90 14 ${(M.t + H - M.b) / 2})`}>
					Top speed (m/s)
				</text>
				<text
					x={W - 10}
					y={(M.t + H - M.b) / 2}
					textAnchor="middle"
					fontSize={12}
					fill={AXIS_LABEL}
					transform={`rotate(90 ${W - 10} ${(M.t + H - M.b) / 2})`}
				>
					Gain over previous +10 (m/s)
				</text>
				{RANGES.map((r) => {
					const y = 10 + r.row * 14;
					return (
						<g key={r.label}>
							<line x1={X(r.from)} x2={X(r.to)} y1={y} y2={y} stroke={AXIS_TEXT} />
							<line x1={X(r.from)} x2={X(r.from)} y1={y - 3} y2={y + 3} stroke={AXIS_TEXT} />
							<line x1={X(r.to)} x2={X(r.to)} y1={y - 3} y2={y + 3} stroke={AXIS_TEXT} />
							<text
								x={r.labelBefore ? X(r.from) - 6 : X(r.to) + 6}
								y={y + 4}
								textAnchor={r.labelBefore ? 'end' : 'start'}
								fontSize={11}
								fill={AXIS_TEXT}
							>
								{r.label}
							</text>
						</g>
					);
				})}
				{GAIN.map((g, i) =>
					g === null ? null : (
						<rect
							key={i}
							x={X(SPEEDS[i]) - BAR_W / 2}
							y={YR(g)}
							width={BAR_W}
							height={H - M.b - YR(g)}
							rx={2}
							fill={SERIES.orange}
							opacity={hover && hover.i !== i ? 0.45 : 0.8}
						/>
					)
				)}
				<polyline points={points} fill="none" stroke={SERIES.blue} strokeWidth={2} strokeLinejoin="round" />
				{TOP.map((v, i) => (
					<circle key={i} cx={X(SPEEDS[i])} cy={Y(v)} r={hover?.i === i ? 5 : 3} fill={SERIES.blue} stroke="var(--color-night-900)" strokeWidth={2} />
				))}
				{hover && <line x1={X(SPEEDS[hover.i])} x2={X(SPEEDS[hover.i])} y1={M.t} y2={H - M.b} stroke={AXIS_LABEL} opacity={0.5} />}
				<rect
					x={M.l}
					y={M.t}
					width={W - M.l - M.r}
					height={H - M.t - M.b}
					fill="transparent"
					onPointerMove={onMove}
					onPointerLeave={() => setHover(null)}
				/>
			</svg>
			<div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-xs text-fog-300">
				<span className="flex items-center gap-2">
					<span className="inline-block w-5 border-t-2" style={{ borderColor: SERIES.blue }} />
					Top speed (left axis)
				</span>
				<span className="flex items-center gap-2">
					<span className="inline-block h-2.5 w-2.5 rounded-sm" style={{ background: SERIES.orange }} />
					Gain over the stat 10 below (right axis)
				</span>
			</div>
			{hover && (
				<div
					className="pointer-events-none absolute z-10 whitespace-nowrap rounded-md border border-night-600 bg-night-850 px-3 py-2 text-xs shadow-xl"
					style={{ left: hover.left + 14, top: hover.top, transform: hover.left > 420 ? 'translate(calc(-100% - 28px), -50%)' : 'translateY(-50%)' }}
				>
					<div className="mb-1 font-semibold text-fog-100">Speed {SPEEDS[hover.i]}</div>
					<div className="flex justify-between gap-4 text-fog-300">
						<span className="flex items-center gap-1.5">
							<span className="inline-block h-2 w-2 rounded-full" style={{ background: SERIES.blue }} />
							Top speed
						</span>
						<span className="font-mono tabular-nums text-fog-100">{TOP[hover.i].toFixed(2)} m/s</span>
					</div>
					{hover.i > 0 && (
						<div className="flex justify-between gap-4 text-fog-300">
							<span className="flex items-center gap-1.5">
								<span className="inline-block h-2 w-2 rounded-sm" style={{ background: SERIES.orange }} />
								Gain over {SPEEDS[hover.i - 1]}
							</span>
							<span className="font-mono tabular-nums text-fog-100">+{(TOP[hover.i] - TOP[hover.i - 1]).toFixed(2)} m/s</span>
						</div>
					)}
				</div>
			)}
		</div>
	);
}
