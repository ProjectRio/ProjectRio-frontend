'use client';

import { useState } from 'react';
import { AXIS_LABEL, AXIS_TEXT, GRID, makeScales, niceTicks, pointerToViewX } from './chartUtils';

export interface SpeedScenario {
	key: string;
	label: string;
	shortLabel: string;
	color: string;
	tas: number[];
	none: number[];
}

const W = 760;
const H = 380;
const M = { l: 52, r: 150, t: 14, b: 44 };

export default function FramesBySpeedChart({ speeds, scenarios }: { speeds: number[]; scenarios: SpeedScenario[] }) {
	const [hover, setHover] = useState<{ i: number; left: number; top: number } | null>(null);
	const all = scenarios.flatMap((s) => s.tas.concat(s.none));
	const y0 = Math.floor(Math.min(...all) / 10) * 10;
	const y1 = Math.ceil(Math.max(...all) / 10) * 10;
	const x1 = speeds[speeds.length - 1];
	const { X, Y } = makeScales(W, H, M, 0, x1, y0, y1);
	const points = (arr: number[]) => arr.map((v, i) => `${X(speeds[i]).toFixed(1)},${Y(v).toFixed(1)}`).join(' ');

	// End-of-line labels, nudged apart so they never overlap.
	const labels = scenarios
		.map((s) => ({ s, y: Y(s.tas[s.tas.length - 1]) }))
		.sort((a, b) => a.y - b.y);
	for (let i = 1; i < labels.length; i++) if (labels[i].y - labels[i - 1].y < 14) labels[i].y = labels[i - 1].y + 14;

	function onMove(event: React.PointerEvent<SVGRectElement>) {
		const vx = pointerToViewX(event, W);
		const i = Math.max(0, Math.min(speeds.length - 1, Math.round(((vx - M.l) / (W - M.l - M.r)) * (speeds.length - 1))));
		const wrap = (event.currentTarget.ownerSVGElement!.parentElement as HTMLElement).getBoundingClientRect();
		setHover({ i, left: event.clientX - wrap.left, top: event.clientY - wrap.top });
	}

	return (
		<div className="relative">
			<svg viewBox={`0 0 ${W} ${H}`} className="block h-auto w-full" role="img" aria-label="Frames to reach 1st base by speed stat">
				{niceTicks(y0, y1, 6).map((v) => (
					<g key={v}>
						<line x1={M.l} x2={W - M.r} y1={Y(v)} y2={Y(v)} stroke={GRID} />
						<text x={M.l - 8} y={Y(v) + 4} textAnchor="end" fontSize={11} fill={AXIS_TEXT} className="font-mono">
							{v}
						</text>
					</g>
				))}
				{speeds
					.filter((s) => s % 40 === 0)
					.map((s) => (
						<text key={s} x={X(s)} y={H - M.b + 16} textAnchor="middle" fontSize={11} fill={AXIS_TEXT} className="font-mono">
							{s}
						</text>
					))}
				<line x1={M.l} x2={W - M.r} y1={H - M.b} y2={H - M.b} stroke={AXIS_TEXT} />
				<text x={(M.l + W - M.r) / 2} y={H - 6} textAnchor="middle" fontSize={12} fill={AXIS_LABEL}>
					Speed stat (characters 10–90, starring adds 50, the game caps it at 200)
				</text>
				<text
					x={14}
					y={(M.t + H - M.b) / 2}
					textAnchor="middle"
					fontSize={12}
					fill={AXIS_LABEL}
					transform={`rotate(-90 14 ${(M.t + H - M.b) / 2})`}
				>
					Frames from contact
				</text>
				<line x1={X(100)} x2={X(100)} y1={M.t} y2={H - M.b} stroke={AXIS_TEXT} strokeDasharray="2 4" />
				<text x={X(100) + 4} y={M.t + 10} fontSize={11} fill={AXIS_TEXT}>
					acceleration stops falling
				</text>
				{scenarios.map((s) => (
					<g key={s.key}>
						<polyline points={points(s.none)} fill="none" stroke={s.color} strokeWidth={2} strokeDasharray="5 4" strokeLinejoin="round" />
						<polyline points={points(s.tas)} fill="none" stroke={s.color} strokeWidth={2} strokeLinejoin="round" />
					</g>
				))}
				{labels.map(({ s, y }) => (
					<text key={s.key} x={X(x1) + 8} y={y + 4} fontSize={11.5} fill={AXIS_LABEL}>
						{s.shortLabel}
					</text>
				))}
				{hover && <line x1={X(speeds[hover.i])} x2={X(speeds[hover.i])} y1={M.t} y2={H - M.b} stroke={AXIS_LABEL} opacity={0.5} />}
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
			{hover && (
				<div
					className="pointer-events-none absolute z-10 whitespace-nowrap rounded-md border border-night-600 bg-night-850 px-3 py-2 text-xs shadow-xl"
					style={{ left: hover.left + 14, top: hover.top, transform: hover.left > 420 ? 'translate(calc(-100% - 28px), -50%)' : 'translateY(-50%)' }}
				>
					<div className="mb-1 font-semibold text-fog-100">Speed {speeds[hover.i]}</div>
					{scenarios.map((s) => (
						<div key={s.key} className="flex items-center justify-between gap-4 text-fog-300">
							<span className="flex items-center gap-1.5">
								<span className="inline-block h-2 w-2 rounded-full" style={{ background: s.color }} />
								{s.shortLabel}
							</span>
							<span className="font-mono tabular-nums text-fog-100">
								{s.tas[hover.i]} / {s.none[hover.i]}
							</span>
						</div>
					))}
					<div className="mt-1 text-fog-500">TAS / no mash, frames</div>
				</div>
			)}
		</div>
	);
}
