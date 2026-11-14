'use client';

import { useMemo, useState } from 'react';
import { standingStart } from '@/lib/mssb/RunningSimulation/runningModel';
import { AXIS_LABEL, AXIS_TEXT, GRID, SERIES, makeScales, niceTicks, pointerToViewX } from './chartUtils';

const FRAMES = 100;
const W = 720;
const M = { l: 56, r: 92, t: 14, b: 22 };
const H_TOP = 230;
const H_GAP = 190;

export interface AccelerationSeries {
	speed: number;
	label: string;
}

const COLORS = [SERIES.blue, SERIES.aqua, SERIES.gold, SERIES.orange];

/** Label y positions near their targets, in the same order, at least minGap apart and inside [lo, hi]. */
function spreadLabels(targets: number[], minGap: number, lo: number, hi: number): number[] {
	const order = targets.map((y, i) => ({ y, i })).sort((a, b) => a.y - b.y);
	const ys = order.map((o) => o.y);
	for (let k = 1; k < ys.length; k++) ys[k] = Math.max(ys[k], ys[k - 1] + minGap);
	const overflow = ys[ys.length - 1] - hi;
	if (overflow > 0) for (let k = 0; k < ys.length; k++) ys[k] -= overflow;
	for (let k = ys.length - 2; k >= 0; k--) ys[k] = Math.min(ys[k], ys[k + 1] - minGap);
	if (ys[0] < lo) for (let k = 0; k < ys.length; k++) ys[k] += lo - ys[0];
	const out = new Array<number>(targets.length);
	order.forEach((o, k) => (out[o.i] = ys[k]));
	return out;
}

/** Rows for small labels along an axis so that neighbours closer than minDx don't overlap. */
function labelRows(xs: number[], minDx: number): number[] {
	const order = xs.map((x, i) => ({ x, i })).filter((o) => o.x >= 0).sort((a, b) => a.x - b.x);
	const rowEnds: number[] = [];
	const rows = new Array<number>(xs.length).fill(0);
	for (const o of order) {
		let r = rowEnds.findIndex((end) => o.x - end >= minDx);
		if (r < 0) r = rowEnds.length;
		rowEnds[r] = o.x;
		rows[o.i] = r;
	}
	return rows;
}

export default function AccelerationChart({ series }: { series: AccelerationSeries[] }) {
	const [hover, setHover] = useState<{ f: number; left: number; top: number } | null>(null);
	const data = useMemo(() => series.map((s, i) => ({ ...s, color: COLORS[i % COLORS.length], ...standingStart(s.speed, FRAMES) })), [series]);
	const base = data[0];
	const gaps = data.map((s) => s.dist.map((d, f) => d - base.dist[f]));
	// First frame each faster runner draws level with (and passes) the first series.
	const overtakes = data.map((s, i) => (i === 0 ? -1 : s.dist.findIndex((d, f) => f > 0 && d > base.dist[f])));

	const dMax = Math.max(...data.map((s) => s.dist[FRAMES]));
	const top = makeScales(W, H_TOP, M, 0, FRAMES, 0, dMax * 1.04);
	const gMin = Math.min(...gaps.flat());
	const gMax = Math.max(...gaps.flat());
	const gap = makeScales(W, H_GAP, M, 0, FRAMES, gMin * 1.15, gMax * 1.15);
	const line = (xs: number[], Xs: (v: number) => number, Ys: (v: number) => number) =>
		xs.map((v, f) => `${Xs(f).toFixed(1)},${Ys(v).toFixed(1)}`).join(' ');
	const endX = W - M.r;
	const topEnds = data.map((s) => top.Y(s.dist[FRAMES]));
	const topLabelY = spreadLabels(topEnds, 14, M.t + 6, H_TOP - M.b - 4);
	const gapEnds = gaps.map((g) => gap.Y(g[FRAMES]));
	const gapLabelY = spreadLabels(gapEnds, 14, M.t + 6, H_GAP - M.b - 4);
	const overtakeX = overtakes.map((f) => (f > 0 ? gap.X(f) : -1));
	const overtakeRow = labelRows(overtakeX, 20);

	function onMove(event: React.PointerEvent<SVGRectElement>) {
		const px = pointerToViewX(event, W);
		const f = Math.max(0, Math.min(FRAMES, Math.round(((px - M.l) / (W - M.l - M.r)) * FRAMES)));
		const wrap = (event.currentTarget.ownerSVGElement!.parentElement!.parentElement as HTMLElement).getBoundingClientRect();
		setHover({ f, left: event.clientX - wrap.left, top: event.clientY - wrap.top });
	}

	const xTicks = niceTicks(0, FRAMES, 10);
	const axisX = (H: number, scaleX: (v: number) => number, label: boolean) => (
		<>
			{xTicks.map((v) => (
				<text key={v} x={scaleX(v)} y={H - M.b + 15} textAnchor="middle" fontSize={11} fill={AXIS_TEXT} className="font-mono">
					{v}
				</text>
			))}
			{label && (
				<text x={(M.l + W - M.r) / 2} y={H + 8} textAnchor="middle" fontSize={12} fill={AXIS_LABEL}>
					Frames since the runner started moving
				</text>
			)}
		</>
	);
	const hoverRect = (H: number) => (
		<rect
			x={M.l}
			y={M.t}
			width={W - M.l - M.r}
			height={H - M.t - M.b}
			fill="transparent"
			onPointerMove={onMove}
			onPointerLeave={() => setHover(null)}
		/>
	);

	return (
		<div className="relative space-y-1">
			{/* distance covered */}
			<div>
				<p className="pl-1 text-xs uppercase tracking-widest text-fog-500">Distance covered (m)</p>
				<svg viewBox={`0 0 ${W} ${H_TOP}`} className="block h-auto w-full" role="img" aria-label="Distance covered from a standing start by speed stat">
					{niceTicks(0, dMax * 1.04, 5).map((v) => (
						<g key={v}>
							<line x1={M.l} x2={W - M.r} y1={top.Y(v)} y2={top.Y(v)} stroke={GRID} />
							<text x={M.l - 8} y={top.Y(v) + 4} textAnchor="end" fontSize={11} fill={AXIS_TEXT} className="font-mono">
								{v}
							</text>
						</g>
					))}
					{axisX(H_TOP, top.X, false)}
					{data.map((s) => (
						<polyline key={s.speed} points={line(s.dist, top.X, top.Y)} fill="none" stroke={s.color} strokeWidth={2} />
					))}
					{data.map((s) => (
						<circle
							key={`top${s.speed}`}
							cx={top.X(s.topFrame)}
							cy={top.Y(s.dist[s.topFrame])}
							r={4}
							fill={s.color}
							stroke="var(--color-night-900)"
							strokeWidth={1.5}
						/>
					))}
					{data.map((s, i) => (
						<g key={`lbl${s.speed}`}>
							<polyline
								points={`${endX},${topEnds[i]} ${endX + 6},${topEnds[i]} ${endX + 12},${topLabelY[i]}`}
								fill="none"
								stroke={s.color}
								strokeWidth={1}
							/>
							<text x={endX + 15} y={topLabelY[i] + 4} fontSize={11.5} fill={AXIS_LABEL}>
								{s.label}
							</text>
						</g>
					))}
					{hover && <line x1={top.X(hover.f)} x2={top.X(hover.f)} y1={M.t} y2={H_TOP - M.b} stroke={AXIS_LABEL} opacity={0.5} />}
					{hoverRect(H_TOP)}
				</svg>
			</div>

			{/* gap to the first runner */}
			<div>
				<p className="pl-1 text-xs uppercase tracking-widest text-fog-500">M ahead of (+) or behind (−) the {base.label} runner</p>
				<svg viewBox={`0 0 ${W} ${H_GAP + 14}`} className="block h-auto w-full" role="img" aria-label="Distance ahead of or behind the slowest runner">
					{niceTicks(gMin * 1.15, gMax * 1.15, 5).map((v) => (
						<g key={v}>
							<line x1={M.l} x2={W - M.r} y1={gap.Y(v)} y2={gap.Y(v)} stroke={v === 0 ? AXIS_TEXT : GRID} strokeWidth={v === 0 ? 1.2 : 1} />
							<text x={M.l - 8} y={gap.Y(v) + 4} textAnchor="end" fontSize={11} fill={AXIS_TEXT} className="font-mono">
								{v > 0 ? `+${v}` : v}
							</text>
						</g>
					))}
					{axisX(H_GAP, gap.X, true)}
					{data.map((s, i) => (
						<polyline key={s.speed} points={line(gaps[i], gap.X, gap.Y)} fill="none" stroke={s.color} strokeWidth={2} />
					))}
					{data.map((s, i) =>
						overtakes[i] > 0 ? (
							<g key={`ov${s.speed}`}>
								<circle cx={gap.X(overtakes[i])} cy={gap.Y(0)} r={4} fill={s.color} stroke="var(--color-night-900)" strokeWidth={1.5} />
								<text
									x={gap.X(overtakes[i])}
									y={gap.Y(0) + 17 + overtakeRow[i] * 12}
									textAnchor="middle"
									fontSize={10.5}
									fill={s.color}
									fontWeight={600}
									className="font-mono"
								>
									{overtakes[i]}
								</text>
							</g>
						) : null
					)}
					{data.map((s, i) => (
						<g key={`glbl${s.speed}`}>
							<polyline
								points={`${endX},${gapEnds[i]} ${endX + 6},${gapEnds[i]} ${endX + 12},${gapLabelY[i]}`}
								fill="none"
								stroke={s.color}
								strokeWidth={1}
							/>
							<text x={endX + 15} y={gapLabelY[i] + 4} fontSize={11.5} fill={AXIS_LABEL}>
								{s.label}
							</text>
						</g>
					))}
					{hover && <line x1={gap.X(hover.f)} x2={gap.X(hover.f)} y1={M.t} y2={H_GAP - M.b} stroke={AXIS_LABEL} opacity={0.5} />}
					{hoverRect(H_GAP)}
				</svg>
			</div>

			{hover && (
				<div
					className="pointer-events-none absolute z-10 whitespace-nowrap rounded-md border border-night-600 bg-night-850 px-3 py-2 text-xs shadow-xl"
					style={{ left: hover.left + 14, top: hover.top, transform: hover.left > 420 ? 'translate(calc(-100% - 28px), -50%)' : 'translateY(-50%)' }}
				>
					<div className="mb-1 font-semibold text-fog-100">Frame {hover.f}</div>
					{data.map((s, i) => (
						<div key={s.speed} className="flex items-center justify-between gap-4 text-fog-300">
							<span className="flex items-center gap-1.5">
								<span className="inline-block h-2 w-2 rounded-full" style={{ background: s.color }} />
								{s.label}
							</span>
							<span className="font-mono tabular-nums text-fog-100">
								{s.dist[hover.f].toFixed(2)} m{i > 0 ? ` (${gaps[i][hover.f] >= 0 ? '+' : ''}${gaps[i][hover.f].toFixed(2)})` : ''}
							</span>
						</div>
					))}
				</div>
			)}

			<div className="flex flex-wrap gap-x-5 gap-y-1 pt-1 text-xs text-fog-500">
				{data.map((s) => (
					<span key={s.speed} className="flex items-center gap-2">
						<span className="inline-block w-5 border-t-2" style={{ borderColor: s.color }} />
						{s.label}: accel {s.k.accel.toFixed(4)} m/frame², top speed {s.k.maxV.toFixed(3)} m/frame (frame {s.topFrame})
					</span>
				))}
			</div>
			<p className="text-xs text-fog-500">
				Dots on the top chart mark when each runner reaches top speed. On the lower chart, dots on the zero line mark the frame each faster
				runner draws level with the {base.label} runner, with the frame number underneath in that runner&apos;s colour.
			</p>
		</div>
	);
}
