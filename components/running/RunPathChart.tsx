'use client';

import { useState } from 'react';
import {
	BASE_COORDS,
	BASE_ROUNDING_PATH,
	LEADOFF_PERCENT,
	OVERRUN_1B_PATH,
	OVERRUN_1B_RETURN_FRAMES,
	OVERRUN_1B_SLOWDOWN_FRAMES,
	SLIDE_RECOVERY_FRAMES
} from '@/lib/mssb/RunningSimulation/runningConstants';
import { makeSpline } from '@/lib/mssb/RunningSimulation/spline';
import {
	BASE_NAMES,
	batterBoxRect,
	framesToSeconds,
	roundingPathPoint,
	type BoxSide,
	type RunResult
} from '@/lib/mssb/RunningSimulation/runningModel';
import { AXIS_LABEL, AXIS_TEXT, GRID } from './chartUtils';

// Top-down field in metres: x toward 1st, z toward 2nd, viewed from behind home plate.
const XMIN = -24;
const XMAX = 28;
const ZMIN = -4;
const ZMAX = 43;
const K = 12;
const PL = 36;
const PT = 12;
const PR = 12;
const PB = 30;
const W = PL + (XMAX - XMIN) * K + PR;
const H = PT + (ZMAX - ZMIN) * K + PB;
const X = (x: number) => PL + (x - XMIN) * K;
const Y = (z: number) => PT + (ZMAX - z) * K;
const CENTER: [number, number] = [0, 19.4];

// Inset: a zoomed view of the home-plate area, drawn in the empty foul ground at the bottom right.
const INSET_SCALE = 26;
const INSET_X0 = -4.4;
const INSET_X1 = 4.4;
const INSET_Z0 = -1.8;
const INSET_Z1 = 1.25;
const IW = (INSET_X1 - INSET_X0) * INSET_SCALE;
const IH = (INSET_Z1 - INSET_Z0) * INSET_SCALE;
const INSET_LEFT = W - PR - 8 - IW;
const INSET_TOP = H - 46 - IH;
const IX = (x: number) => INSET_LEFT + (x - INSET_X0) * INSET_SCALE;
const IY = (z: number) => INSET_TOP + (INSET_Z1 - z) * INSET_SCALE;
// Home plate at the game's size (1.06 m across, as in the pitch calculator): back point at the origin, toward the catcher.
const PLATE: [number, number][] = [
	[0, 0],
	[0.53, 0.545],
	[0.53, 1.06],
	[-0.53, 1.06],
	[-0.53, 0.545]
];

// running_overrun1BControl: the slowdown stage steps along the overrun spline by countdown × 1 / ((n + 1) · n / 2)
// for countdown n−1 … 1, so it ends short of the last control point (about 96.7% of the way).
const OVERRUN_SPLINE = makeSpline(OVERRUN_1B_PATH);
const OVERRUN_STEPS = (() => {
	const n = OVERRUN_1B_SLOWDOWN_FRAMES;
	const perFrame = 1 / ((n + 1) * (n / 2));
	const out: number[] = [0];
	let progress = 0;
	for (let cd = n - 1; cd >= 1; cd--) {
		progress += perFrame * cd;
		out.push(progress);
	}
	return out;
})();
const OVERRUN_POINTS = OVERRUN_STEPS.map((t) => OVERRUN_SPLINE(t));

const REFERENCE_SPLINE = [0, 1, 2, 3].flatMap((leg) => Array.from({ length: 41 }, (_, i) => roundingPathPoint(leg, i / 40)));
const BASE_LABEL_OFFSET: [number, number, 'middle' | 'start' | 'end'][] = [
	[0, -1.9, 'middle'],
	[1.6, -0.4, 'start'],
	[0, 1.6, 'middle'],
	[-1.6, -0.4, 'end']
];

/**
 * A label with a short leader line back to its point. By default it is pushed out from the middle of the diamond;
 * dir (x, z) and anchor override that where the default would run off the map.
 */
function Callout({
	at,
	text,
	sub,
	color,
	push = 34,
	dir,
	anchor: anchorOverride
}: {
	at: [number, number];
	text: string;
	sub?: string | string[];
	color: string;
	push?: number;
	dir?: [number, number];
	anchor?: 'start' | 'middle' | 'end';
}) {
	const px = X(at[0]);
	const py = Y(at[1]);
	let dx = dir ? dir[0] : at[0] - CENTER[0];
	let dz = dir ? dir[1] : at[1] - CENTER[1];
	const len = Math.hypot(dx, dz) || 1;
	dx /= len;
	dz /= len;
	const tx = px + dx * push;
	const ty = py - dz * push;
	const anchor = anchorOverride ?? (dx > 0.35 ? 'start' : dx < -0.35 ? 'end' : 'middle');
	const subs = sub === undefined ? [] : Array.isArray(sub) ? sub : [sub];
	return (
		<g>
			<line x1={px} y1={py} x2={tx - dx * 4} y2={ty + dz * 4} stroke={color} strokeWidth={1} />
			<circle cx={px} cy={py} r={3} fill={color} />
			<text x={tx} y={ty + 4} textAnchor={anchor} fontSize={11.5} fontWeight={600} fill="var(--color-fog-100)">
				{text}
			</text>
			{subs.map((line, i) => (
				<text key={i} x={tx} y={ty + 17 + i * 13} textAnchor={anchor} fontSize={10.5} fill="var(--color-fog-300)">
					{line}
				</text>
			))}
		</g>
	);
}

export default function RunPathChart({
	run,
	color,
	charId,
	side,
	startBase
}: {
	run: RunResult;
	color: string;
	charId: number;
	side: BoxSide;
	startBase: number;
}) {
	const [hover, setHover] = useState<{ i: number; left: number; top: number } | null>(null);
	const moving = run.trace.filter((t) => !t.held);
	const toPath = (pts: [number, number][]) => pts.map((p, i) => `${i ? 'L' : 'M'}${X(p[0]).toFixed(1)} ${Y(p[1]).toFixed(1)}`).join('');
	const d = toPath([run.start, ...moving.map((t) => [t.x, t.z] as [number, number])]);
	const refD = toPath(REFERENCE_SPLINE);

	// Events along the run.
	const roundStart = run.trace.find((t) => t.strength > 0);
	const slides = run.trace.filter((t, i) => i > 0 && t.action === 'slide' && run.trace[i - 1].action !== 'slide');
	const slideSegments = slides.map((s) => {
		const i = run.trace.indexOf(s);
		const seg: [number, number][] = [run.trace[i - 1] ? [run.trace[i - 1].x, run.trace[i - 1].z] : [s.x, s.z]];
		for (let j = i; j < run.trace.length && run.trace[j].action === 'slide'; j++) seg.push([run.trace[j].x, run.trace[j].z]);
		const end = run.trace.slice(i).find((t) => t.action === 'recover');
		if (end) seg.push([end.x, end.z]);
		return { start: s, d: toPath(seg), base: end ? Math.trunc(end.fbr) : null };
	});
	const seconds = moving.filter((t) => t.f % 60 === 0);
	const endBase = run.bases.length ? run.bases[run.bases.length - 1].base : -1;
	const showOverrun = startBase === 0 && endBase === 1;
	const leadBase = startBase > 0 ? BASE_COORDS[startBase] : null;
	const leadMetres = leadBase ? Math.hypot(run.start[0] - leadBase[0], run.start[1] - leadBase[1]) : 0;

	function onMove(event: React.PointerEvent<SVGRectElement>) {
		const svg = event.currentTarget.ownerSVGElement!;
		const r = svg.getBoundingClientRect();
		const mx = ((event.clientX - r.left) * W) / r.width;
		const my = ((event.clientY - r.top) * H) / r.height;
		let best = -1;
		let bd = 14 * 14;
		moving.forEach((t, i) => {
			const dd = (X(t.x) - mx) ** 2 + (Y(t.z) - my) ** 2;
			if (dd < bd) {
				bd = dd;
				best = i;
			}
		});
		if (best < 0) return setHover(null);
		const wrap = (svg.parentElement as HTMLElement).getBoundingClientRect();
		setHover({ i: best, left: event.clientX - wrap.left, top: event.clientY - wrap.top });
	}
	const hoverFrame = hover ? moving[hover.i] : null;

	const boxes = (['R', 'L'] as const).map((sd) => ({ sd, rect: batterBoxRect(charId, sd) }));

	return (
		<div className="relative">
			<svg viewBox={`0 0 ${W} ${H}`} className="block h-auto w-full" role="img" aria-label="The runner's path around the bases">
				{Array.from({ length: 11 }, (_, i) => -20 + i * 5).map((x) => (
					<line key={`gx${x}`} x1={X(x)} x2={X(x)} y1={Y(ZMAX)} y2={Y(ZMIN)} stroke={GRID} />
				))}
				{Array.from({ length: 9 }, (_, i) => i * 5).map((z) => (
					<line key={`gz${z}`} x1={X(XMIN)} x2={X(XMAX)} y1={Y(z)} y2={Y(z)} stroke={GRID} />
				))}
				{[-20, -10, 0, 10, 20].map((x) => (
					<text key={`tx${x}`} x={X(x)} y={H - 10} textAnchor="middle" fontSize={11} fill={AXIS_TEXT} className="font-mono">
						{x}
					</text>
				))}
				{[0, 10, 20, 30, 40].map((z) => (
					<text key={`tz${z}`} x={PL - 6} y={Y(z) + 4} textAnchor="end" fontSize={11} fill={AXIS_TEXT} className="font-mono">
						{z}
					</text>
				))}
				<text x={W - PR} y={H - 10} textAnchor="end" fontSize={11} fill={AXIS_TEXT}>
					x (m)
				</text>
				{[
					[18.8, 19.4],
					[-18.5, 19.3]
				].map(([dx, dz]) => {
					const l = Math.hypot(dx, dz);
					return <line key={dx} x1={X(0)} y1={Y(0)} x2={X((dx / l) * 33)} y2={Y((dz / l) * 33)} stroke="var(--color-night-600)" strokeWidth={1.5} />;
				})}
				{BASE_COORDS.map((b, i) => {
					const n = BASE_COORDS[(i + 1) % 4];
					return <line key={`bl${i}`} x1={X(b[0])} y1={Y(b[1])} x2={X(n[0])} y2={Y(n[1])} stroke={AXIS_TEXT} strokeDasharray="4 4" opacity={0.6} />;
				})}
				<path d={refD} fill="none" stroke={AXIS_LABEL} strokeWidth={1} strokeDasharray="1 3" opacity={0.7} />
				{BASE_ROUNDING_PATH.map((p, i) => (
					<circle key={`cp${i}`} cx={X(p[0])} cy={Y(p[1])} r={2.5} fill="var(--color-night-900)" stroke={AXIS_TEXT} strokeWidth={1} />
				))}
				{/* batter's boxes at full scale (tiny; the inset shows them up close) */}
				{boxes.map(({ sd, rect }) => (
					<rect
						key={`box${sd}`}
						x={X(rect[0])}
						y={Y(rect[3])}
						width={(rect[1] - rect[0]) * K}
						height={Math.max(2, (rect[3] - rect[2]) * K)}
						fill="none"
						stroke={sd === side && startBase === 0 ? color : AXIS_TEXT}
						strokeWidth={1}
					/>
				))}
				<polygon points={PLATE.map((p) => `${X(p[0])},${Y(p[1])}`).join(' ')} fill="var(--color-night-850)" stroke="var(--color-fog-300)" strokeWidth={1.5} />
				<circle cx={X(BASE_COORDS[0][0])} cy={Y(BASE_COORDS[0][1])} r={2.5} fill="var(--color-fog-300)" />
				{BASE_COORDS.map((b, i) => {
					const o = BASE_LABEL_OFFSET[i];
					return (
						<g key={`b${i}`}>
							{i > 0 && (
							<rect
								x={X(b[0]) - 7}
								y={Y(b[1]) - 7}
								width={14}
								height={14}
								transform={`rotate(45 ${X(b[0])} ${Y(b[1])})`}
								fill="var(--color-night-850)"
								stroke="var(--color-fog-300)"
								strokeWidth={1.5}
							/>
							)}
							<text x={X(b[0] + o[0])} y={Y(b[1] + o[1]) + 4} textAnchor={o[2]} fontSize={12.5} fontWeight={600} fill="var(--color-fog-100)">
								{BASE_NAMES[i]}
							</text>
						</g>
					);
				})}

				{/* lead off a base */}
				{leadBase && (
					<>
						<line
							x1={X(leadBase[0])}
							y1={Y(leadBase[1])}
							x2={X(run.start[0])}
							y2={Y(run.start[1])}
							stroke={color}
							strokeWidth={5}
							strokeLinecap="round"
							opacity={0.45}
						/>
						<Callout
							at={[(leadBase[0] + run.start[0]) / 2, (leadBase[1] + run.start[1]) / 2]}
							text="Lead"
							sub={`${Math.round((LEADOFF_PERCENT + 0.03) * 100)}% of the baseline · ${leadMetres.toFixed(1)} m`}
							color={color}
							push={42}
						/>
					</>
				)}

				{/* the runner's path, with slides drawn dashed over it */}
				<path d={d} fill="none" stroke={color} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
				{slideSegments.map((s) => (
					<path key={`slide${s.start.f}`} d={s.d} fill="none" stroke="var(--color-fog-100)" strokeWidth={2} strokeDasharray="4 3" />
				))}
				<circle cx={X(run.start[0])} cy={Y(run.start[1])} r={5} fill="var(--color-night-900)" stroke={color} strokeWidth={2.5} />

				{/* the 1B overrun, after the batter is safe */}
				{showOverrun && (
					<>
						<path
							d={toPath(OVERRUN_POINTS)}
							fill="none"
							stroke={color}
							strokeWidth={3}
							strokeDasharray="2 5"
							strokeLinecap="round"
						/>
						<circle cx={X(OVERRUN_POINTS[OVERRUN_POINTS.length - 1][0])} cy={Y(OVERRUN_POINTS[OVERRUN_POINTS.length - 1][1])} r={3.5} fill={color} />
						<Callout
							at={OVERRUN_POINTS[OVERRUN_POINTS.length - 1]}
							text="Overrun past 1B"
							sub={['after the batter is safe:', `${OVERRUN_1B_SLOWDOWN_FRAMES} frames out, ${OVERRUN_1B_RETURN_FRAMES} back`]}
							color={color}
							dir={[0, 1]}
							anchor="end"
							push={58}
						/>
					</>
				)}

				{roundStart && (
					<Callout at={[roundStart.x, roundStart.z]} text="Rounding starts" sub={`${framesToSeconds(roundStart.f)} s`} color="var(--color-fog-300)" />
				)}
				{slideSegments.map((s) => (
					<Callout
						key={`slidecall${s.start.f}`}
						at={[s.start.x, s.start.z]}
						text={`Slide${s.base !== null ? ` into ${BASE_NAMES[s.base]}` : ''}`}
						sub={
							s.base === endBase
								? `${framesToSeconds(s.start.f)} s`
								: `${framesToSeconds(s.start.f)} s · then ${SLIDE_RECOVERY_FRAMES}-frame recovery`
						}
						color="var(--color-fog-100)"
						dir={[1, 0.15]}
						anchor="start"
						push={40}
					/>
				))}

				{/* whole seconds since contact */}
				{seconds.map((t) => {
					// A second that ticks over while the runner is on or right by a base would cover the base drawing,
					// so set it beside the base (toward the infield at 3B, where the label is on the outside).
					const dists = BASE_COORDS.map((bc) => Math.hypot(X(bc[0]) - X(t.x), Y(bc[1]) - Y(t.z)));
					const b = dists.indexOf(Math.min(...dists));
					const onBase = dists[b] < 14;
					const cx = X(t.x) + (onBase ? (b === 3 ? 22 : -22) : 0);
					const cy = Y(t.z) + (onBase ? 14 : 0);
					return (
						<g key={`sec${t.f}`}>
							{onBase && <line x1={X(t.x)} y1={Y(t.z)} x2={cx} y2={cy} stroke={color} strokeWidth={1} />}
							<circle cx={cx} cy={cy} r={8} fill="var(--color-night-900)" stroke={color} strokeWidth={1.5} />
							<text x={cx} y={cy + 3.5} textAnchor="middle" fontSize={10} fontWeight={700} fill="var(--color-fog-100)" className="font-mono">
								{t.f / 60}
							</text>
						</g>
					);
				})}

				{/* time each base is reached */}
				{run.bases.map((b) => {
					const t = run.trace.find((x) => x.f === b.frame)!;
					const i = b.base % 4;
					const o = BASE_LABEL_OFFSET[i];
					// 2B's name sits above the base, so its time goes to the right of the base instead of under the name.
					const tx = i === 2 ? X(BASE_COORDS[i][0]) + 13 : X(BASE_COORDS[i][0] + o[0]);
					const ty = i === 2 ? Y(BASE_COORDS[i][1]) + 4 : Y(BASE_COORDS[i][1] + o[1]) + 18;
					return (
						<g key={`reach${b.base}`}>
							<circle cx={X(t.x)} cy={Y(t.z)} r={6} fill={color} stroke="var(--color-night-900)" strokeWidth={2} />
							<text
								x={tx}
								y={ty}
								textAnchor={i === 2 ? 'start' : o[2]}
								fontSize={11}
								fontWeight={600}
								fill={color}
								className="font-mono"
							>
								{framesToSeconds(b.frame)} s
							</text>
						</g>
					);
				})}

				{/* inset: batter's boxes up close */}
				<g>
					<rect x={INSET_LEFT - 8} y={INSET_TOP - 24} width={IW + 16} height={IH + 48} rx={6} fill="var(--color-night-900)" stroke="var(--color-night-600)" />
					<text x={INSET_LEFT} y={INSET_TOP - 9} fontSize={11} fontWeight={600} fill="var(--color-fog-300)">
						Batter&apos;s boxes (zoomed)
					</text>
					<polygon points={PLATE.map((p) => `${IX(p[0])},${IY(p[1])}`).join(' ')} fill="var(--color-fog-100)" opacity={0.8} />
					{boxes.map(({ sd, rect }) => {
						const active = sd === side && startBase === 0;
						return (
							<g key={`ibox${sd}`}>
								<rect
									x={IX(rect[0])}
									y={IY(rect[3])}
									width={(rect[1] - rect[0]) * INSET_SCALE}
									height={Math.max(2, (rect[3] - rect[2]) * INSET_SCALE)}
									fill={active ? color : 'none'}
									fillOpacity={active ? 0.15 : 0}
									stroke={active ? color : AXIS_TEXT}
									strokeWidth={active ? 2 : 1}
								/>
								<text
									x={IX((rect[0] + rect[1]) / 2)}
									y={IY(rect[2]) + 13}
									textAnchor="middle"
									fontSize={10}
									fill={active ? 'var(--color-fog-100)' : AXIS_TEXT}
								>
									{sd === 'R' ? 'RHB' : 'LHB'}
								</text>
							</g>
						);
					})}
					{startBase === 0 && <circle cx={IX(run.start[0])} cy={IY(run.start[1])} r={4.5} fill={color} stroke="var(--color-night-900)" strokeWidth={1.5} />}
					{startBase === 0 ? (
						<g>
							<circle cx={INSET_LEFT + 4} cy={INSET_TOP + IH + 15} r={4} fill={color} />
							<text x={INSET_LEFT + 13} y={INSET_TOP + IH + 19} fontSize={10} fill={AXIS_TEXT}>
								batter&apos;s start
							</text>
						</g>
					) : (
						<text x={INSET_LEFT} y={INSET_TOP + IH + 19} fontSize={10} fill={AXIS_TEXT}>
							runner starts on base, not in the box
						</text>
					)}
				</g>

				{hoverFrame && <circle cx={X(hoverFrame.x)} cy={Y(hoverFrame.z)} r={5} fill="none" stroke="var(--color-fog-100)" strokeWidth={2} />}
				<rect x={0} y={0} width={W} height={H} fill="transparent" onPointerMove={onMove} onPointerLeave={() => setHover(null)} />
			</svg>
			{hover && hoverFrame && (
				<div
					className="pointer-events-none absolute z-10 whitespace-nowrap rounded-md border border-night-600 bg-night-850 px-3 py-2 text-xs shadow-xl"
					style={{ left: hover.left + 14, top: hover.top, transform: hover.left > 360 ? 'translate(calc(-100% - 28px), -50%)' : 'translateY(-50%)' }}
				>
					<div className="font-semibold text-fog-100">
						Frame {hoverFrame.f} · {framesToSeconds(hoverFrame.f)} s
					</div>
					<div className="font-mono tabular-nums text-fog-300">
						({hoverFrame.x.toFixed(2)}, {hoverFrame.z.toFixed(2)}) m · {hoverFrame.v.toFixed(4)} m/frame
					</div>
					<div className="text-fog-500">
						Rounding {Math.round(hoverFrame.strength * 100)}%{hoverFrame.action !== 'none' ? ` · ${hoverFrame.action === 'slide' ? 'sliding' : 'recovering'}` : ''}
					</div>
				</div>
			)}
		</div>
	);
}
