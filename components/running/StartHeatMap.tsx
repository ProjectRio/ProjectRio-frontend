'use client';

import { useMemo, useState } from 'react';
import { FIRST_BASE } from '@/lib/mssb/RunningSimulation/runningConstants';
import { batterBoxRect, legLength, simulateRun, type BoxSide, type MashMode } from '@/lib/mssb/RunningSimulation/runningModel';
import { spotBatterPosition, spotFromField, type StartSpot } from './BoxPicker';

type Pt = [number, number];

/** Blue sequential ramp, darkest (slowest) to lightest (fastest), from the validated chart palette. */
const RAMP = ['#104281', '#184f95', '#1c5cab', '#256abf', '#2a78d6', '#3987e5', '#5598e7', '#6da7ec', '#86b6ef', '#9ec5f4', '#b7d3f6'];
const S = 140; // viewBox units per metre
/** Room around the boxes for the corner callouts. */
const PAD_X = 84;
const PAD_Y = 44;
const SIDES: BoxSide[] = ['R', 'L'];

// Home plate: 17 in wide, flat edge toward the pitcher, back tip at the origin.
const HALF_PLATE = 0.2159;
const PLATE: Pt[] = [
	[-HALF_PLATE, 2 * HALF_PLATE],
	[HALF_PLATE, 2 * HALF_PLATE],
	[HALF_PLATE, HALF_PLATE],
	[0, 0],
	[-HALF_PLATE, HALF_PLATE]
];

const dist = (a: Pt, b: Pt) => Math.hypot(a[0] - b[0], a[1] - b[1]);

/** Dark ink on the light half of the ramp, light ink on the dark half. */
const inkFor = (color: string) => (RAMP.indexOf(color) >= 6 ? 'var(--color-night-900)' : 'var(--color-fog-100)');

/**
 * Frame bands for one box. A straight run to 1B depends only on the distance to the base, and the frame count never
 * decreases with distance, so each change of frame is a circle around 1B: the boundary radii are found by bisection
 * along the segment from the range's closest point to its farthest corner.
 */
function boxBands(rect: [number, number, number, number], speed: number, mash: MashMode) {
	const [x0, x1, z0, z1] = rect;
	const near: Pt = [Math.min(Math.max(FIRST_BASE[0], x0), x1), Math.min(Math.max(FIRST_BASE[1], z0), z1)];
	const corners: Pt[] = [
		[x0, z0],
		[x0, z1],
		[x1, z0],
		[x1, z1]
	];
	const far = corners.reduce((a, c) => (dist(c, FIRST_BASE) > dist(a, FIRST_BASE) ? c : a));
	const along = (t: number): Pt => [near[0] + (far[0] - near[0]) * t, near[1] + (far[1] - near[1]) * t];
	const framesAt = (p: Pt) => simulateRun({ speed, mash, path: 'straight', startBase: 0, endBase: 1, batterPos: p }).frame;
	const fMin = framesAt(near);
	const fMax = framesAt(far);
	const boundaries: { t: number; r: number }[] = [];
	let lo = 0;
	for (let f = fMin; f < fMax; f++) {
		let a = lo;
		let b = 1;
		for (let i = 0; i < 24; i++) {
			const m = (a + b) / 2;
			if (framesAt(along(m)) <= f) a = m;
			else b = m;
		}
		boundaries.push({ t: b, r: dist(along(b), FIRST_BASE) });
		lo = b;
	}
	const bands = Array.from({ length: fMax - fMin + 1 }, (_, i) => {
		const t0 = i === 0 ? 0 : boundaries[i - 1].t;
		const t1 = i === fMax - fMin ? 1 : boundaries[i].t;
		return { frame: fMin + i, mid: along((t0 + t1) / 2), span: dist(along(t0), along(t1)) };
	});
	// 1B is up and to the right of both boxes, so the closest point is the front-right corner and the farthest the back-left.
	return { rect, boundaries, bands, fMin, fMax, near, far, nearL: dist(near, FIRST_BASE), farL: dist(far, FIRST_BASE) };
}

/**
 * Heat map of the frame the batter reaches 1B from every point in their range, in both batter's boxes, on one shared
 * colour scale. Clicking a box starts the batter there (switching sides if needed).
 */
export default function StartHeatMap({
	charId,
	side,
	speed,
	mash,
	spot,
	color,
	onPick
}: {
	charId: number;
	side: BoxSide;
	speed: number;
	mash: MashMode;
	spot: StartSpot;
	color: string;
	onPick: (side: BoxSide, spot: { u: number; v: number }) => void;
}) {
	const [hover, setHover] = useState<{ p: Pt; side: BoxSide; left: number; top: number } | null>(null);

	const maps = useMemo(() => {
		const out = {} as Record<BoxSide, ReturnType<typeof boxBands>>;
		for (const sd of SIDES) out[sd] = boxBands(batterBoxRect(charId, sd), speed, mash);
		return out;
	}, [charId, speed, mash]);

	// Shared scale: the fastest frame in either box is the lightest colour, the slowest the darkest.
	const lo = Math.min(maps.L.fMin, maps.R.fMin);
	const hi = Math.max(maps.L.fMax, maps.R.fMax);
	const colorOf = (frame: number) => RAMP[Math.round((hi === lo ? 1 : (hi - frame) / (hi - lo)) * (RAMP.length - 1))];

	// View: both boxes and the plate.
	const rects = SIDES.map((sd) => maps[sd].rect);
	const vx0 = Math.min(...rects.map((r) => r[0]));
	const vx1 = Math.max(...rects.map((r) => r[1]));
	const vz0 = Math.min(0, ...rects.map((r) => r[2]));
	const vz1 = Math.max(2 * HALF_PLATE, ...rects.map((r) => r[3]));
	const W = (vx1 - vx0) * S + PAD_X * 2;
	const H = (vz1 - vz0) * S + PAD_Y * 2;
	const sx = (x: number) => PAD_X + (x - vx0) * S;
	const sy = (z: number) => PAD_Y + (vz1 - z) * S;
	const base: Pt = [sx(FIRST_BASE[0]), sy(FIRST_BASE[1])];

	const cur = spotBatterPosition(charId, side, spot);
	const frameAt = (sd: BoxSide, L: number) => maps[sd].fMin + maps[sd].boundaries.filter((b) => L > b.r).length;

	function toField(e: React.PointerEvent<SVGRectElement>, sd: BoxSide) {
		const svg = e.currentTarget.ownerSVGElement!;
		const b = svg.getBoundingClientRect();
		const vx = ((e.clientX - b.left) * W) / b.width;
		const vy = ((e.clientY - b.top) * H) / b.height;
		const wrap = (svg.parentElement as HTMLElement).getBoundingClientRect();
		const p: Pt = [vx0 + (vx - PAD_X) / S, vz1 - (vy - PAD_Y) / S];
		return { p, side: sd, left: e.clientX - wrap.left, top: e.clientY - wrap.top };
	}

	return (
		<div className="space-y-2">
			<div className="relative">
				<svg viewBox={`0 0 ${W} ${H}`} className="block h-auto w-full touch-none select-none" role="img" aria-label="Frame the batter reaches 1st base from each point in their range, in both batter's boxes">
					<polygon points={PLATE.map((p) => `${sx(p[0])},${sy(p[1])}`).join(' ')} fill="var(--color-fog-100)" opacity={0.85} />
					{SIDES.map((sd) => {
						const m = maps[sd];
						const [x0, x1, z0, z1] = m.rect;
						const box = { x: sx(x0), y: sy(z1), width: (x1 - x0) * S, height: (z1 - z0) * S };
						const clipId = `heat-clip-${sd}`;
						return (
							<g key={sd}>
								<defs>
									<clipPath id={clipId}>
										<rect {...box} />
									</clipPath>
								</defs>
								<g clipPath={`url(#${clipId})`}>
									<rect {...box} fill={colorOf(m.fMax)} />
									{/* Each circle covers every point closer to 1B than a boundary; largest first so the fastest band ends on top. */}
									{[...m.boundaries].reverse().map((b, k) => {
										const i = m.boundaries.length - 1 - k;
										return <circle key={`f-${i}`} cx={base[0]} cy={base[1]} r={b.r * S} fill={colorOf(m.fMin + i)} />;
									})}
									{m.boundaries.map((b, i) => (
										<circle key={`l-${i}`} cx={base[0]} cy={base[1]} r={b.r * S} fill="none" stroke="var(--color-night-900)" strokeWidth={2} />
									))}
									{m.bands
										.filter((band) => band.span * S >= 15 && band.frame !== m.fMin && band.frame !== m.fMax) // the corner callouts label the extremes
										.map((band) => (
											<text
												key={band.frame}
												x={Math.min(Math.max(sx(band.mid[0]), box.x + 14), box.x + box.width - 14)}
												y={Math.min(Math.max(sy(band.mid[1]) + 4, box.y + 13), box.y + box.height - 5)}
												textAnchor="middle"
												fontSize={11}
												fontWeight={600}
												fill={inkFor(colorOf(band.frame))}
												className="pointer-events-none font-mono"
											>
												{band.frame}
											</text>
										))}
								</g>
								<rect {...box} fill="none" stroke="var(--color-fog-500)" strokeWidth={1.5} />
								{/* Extremes: the front-right corner (closest to 1B) and the back-left corner (farthest). */}
								{[
									{ p: m.near, frame: m.fMin, L: m.nearL, dir: 1 },
									{ p: m.far, frame: m.fMax, L: m.farL, dir: -1 }
								].map(({ p, frame, L, dir }) => {
									const cx = sx(p[0]);
									const cy = sy(p[1]);
									const ex = cx + dir * 18;
									const ey = cy - dir * 18;
									const tx = ex + dir * 4;
									return (
										<g key={dir} className="pointer-events-none">
											<line x1={cx} y1={cy} x2={ex} y2={ey} stroke="var(--color-fog-300)" strokeWidth={1.5} />
											<circle cx={cx} cy={cy} r={3.5} fill="var(--color-fog-100)" stroke="var(--color-night-900)" strokeWidth={1.5} />
											<text x={tx} y={dir > 0 ? ey - 14 : ey + 12} textAnchor={dir > 0 ? 'start' : 'end'} fontSize={12} fontWeight={700} fill="var(--color-fog-100)" className="font-mono">
												Frame {frame}
											</text>
											<text x={tx} y={dir > 0 ? ey - 1 : ey + 25} textAnchor={dir > 0 ? 'start' : 'end'} fontSize={11} fill="var(--color-fog-500)" className="font-mono">
												{L.toFixed(2)} m
											</text>
										</g>
									);
								})}
								<rect
									{...box}
									fill="transparent"
									className="cursor-crosshair"
									onPointerMove={(e) => setHover(toField(e, sd))}
									onPointerLeave={() => setHover(null)}
									onPointerDown={(e) => onPick(sd, spotFromField(charId, sd, toField(e, sd).p))}
								/>
							</g>
						);
					})}
					<circle cx={sx(cur[0])} cy={sy(cur[1])} r={7} fill={color} stroke="var(--color-night-900)" strokeWidth={2.5} className="pointer-events-none" />
				</svg>
				{hover && (
					<div
						className="pointer-events-none absolute z-10 whitespace-nowrap rounded-md border border-night-600 bg-night-850 px-3 py-2 text-xs shadow-xl"
						style={{ left: hover.left + 14, top: hover.top, transform: hover.side === 'L' ? 'translate(calc(-100% - 28px), -50%)' : 'translateY(-50%)' }}
					>
						<div className="font-semibold text-fog-100">Frame {frameAt(hover.side, dist(hover.p, FIRST_BASE))}</div>
						<div className="font-mono tabular-nums text-fog-300">{dist(hover.p, FIRST_BASE).toFixed(2)} m to 1B · click to start here</div>
					</div>
				)}
			</div>
		</div>
	);
}
