'use client';

import { useRef } from 'react';
import { BATTER_BOX, FIRST_BASE } from '@/lib/mssb/RunningSimulation/runningConstants';
import { batterBoxRect, boxPosition, legLength, type BoxSide, type BoxSpot } from '@/lib/mssb/RunningSimulation/runningModel';
import { AXIS_TEXT, GRID } from './chartUtils';

type Pt = [number, number];

/** A preset spot, or a custom one as fractions (u across, v toward the pitcher) of the character's own range. */
export type StartSpot = BoxSpot | { u: number; v: number };

/** g_Batter.boxPosition for a start spot: inside [near, far] × [front, back], before the offset and mirroring. */
export function spotBoxPosition(charId: number, side: BoxSide, spot: StartSpot): Pt {
	if (typeof spot === 'string') return boxPosition(charId, side, spot);
	const [near, far, front, back] = BATTER_BOX[charId];
	return [near + spot.u * (far - near), front + spot.v * (back - front)];
}

/** batterPos (field coordinates) for a start spot. */
export function spotBatterPosition(charId: number, side: BoxSide, spot: StartSpot): Pt {
	const [p, q] = spotBoxPosition(charId, side, spot);
	const [, , , , offX, offZ] = BATTER_BOX[charId];
	const x = p + offX;
	return [side === 'L' ? -x : x, q + offZ];
}

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

/** The custom spot nearest to a field position, clamped to the character's range. */
function spotFromField(charId: number, side: BoxSide, [x, z]: Pt): { u: number; v: number } {
	const [near, far, front, back, offX, offZ] = BATTER_BOX[charId];
	const p = (side === 'L' ? -x : x) - offX;
	const q = z - offZ;
	return { u: far === near ? 0.5 : clamp01((p - near) / (far - near)), v: back === front ? 0.5 : clamp01((q - front) / (back - front)) };
}

// Home plate: 17 in wide, flat edge toward the pitcher, back tip at the origin (as in BatterBoxDiagram).
const HALF_PLATE = 0.2159;
const THIRD_BASE: Pt = [-18.5, 19.3];
const PLATE: Pt[] = [
	[-HALF_PLATE, 2 * HALF_PLATE],
	[HALF_PLATE, 2 * HALF_PLATE],
	[HALF_PLATE, HALF_PLATE],
	[0, 0],
	[-HALF_PLATE, HALF_PLATE]
];

/** View for one side: every character's range on that side plus the plate, padded. Fixed, so the box doesn't jump. */
function sideView(side: BoxSide) {
	const rects = BATTER_BOX.map((_, id) => batterBoxRect(id, side));
	const pad = 0.25;
	const x0 = Math.min(-HALF_PLATE, ...rects.map((r) => r[0])) - pad;
	const x1 = Math.max(HALF_PLATE, ...rects.map((r) => r[1])) + pad;
	const z0 = Math.min(0, ...rects.map((r) => r[2])) - pad;
	const z1 = Math.max(2 * HALF_PLATE, ...rects.map((r) => r[3])) + pad;
	return { x0, x1, z0, z1 };
}
const VIEWS = { L: sideView('L'), R: sideView('R') };
const S = 80; // viewBox units per metre
const KEY_STEP = 0.05;

export interface PickerRunner {
	charId: number;
	spot: StartSpot;
	color: string;
	label: string;
	dashed?: boolean;
}

/**
 * Top-down view of the active batter's box. Each runner's range is drawn as a rectangle, and their start point can be
 * dragged (or moved with the arrow keys) anywhere inside it.
 */
export default function BoxPicker({
	side,
	runners,
	onChange
}: {
	side: BoxSide;
	runners: PickerRunner[];
	onChange: (index: number, spot: { u: number; v: number }) => void;
}) {
	const view = VIEWS[side];
	const W = (view.x1 - view.x0) * S;
	const H = (view.z1 - view.z0) * S;
	const sx = (x: number) => (x - view.x0) * S;
	const sy = (z: number) => (view.z1 - z) * S;
	const dragging = useRef<number | null>(null);

	const items = runners.map((r) => {
		const pos = spotBatterPosition(r.charId, side, r.spot);
		return { ...r, pos, rect: batterBoxRect(r.charId, side), L: legLength(pos) };
	});

	function toField(e: React.PointerEvent<SVGSVGElement>): Pt {
		const b = e.currentTarget.getBoundingClientRect();
		return [view.x0 + ((e.clientX - b.left) * W) / b.width / S, view.z1 - ((e.clientY - b.top) * H) / b.height / S];
	}

	function moveTo(i: number, p: Pt) {
		onChange(i, spotFromField(items[i].charId, side, p));
	}

	function onPointerDown(e: React.PointerEvent<SVGSVGElement>) {
		const p = toField(e);
		const hit = (e.target as Element).getAttribute('data-runner');
		let i = hit !== null ? Number(hit) : -1;
		if (i < 0) {
			// Otherwise the runner whose range was clicked (the main runner first), else the nearest point.
			i = items.findIndex(({ rect: [a, b, c, d] }) => p[0] >= a && p[0] <= b && p[1] >= c && p[1] <= d);
			if (i < 0) {
				const d2 = items.map((it) => (it.pos[0] - p[0]) ** 2 + (it.pos[1] - p[1]) ** 2);
				i = d2.indexOf(Math.min(...d2));
			}
		}
		dragging.current = i;
		e.currentTarget.setPointerCapture(e.pointerId);
		// Grabbing a point doesn't move it until the pointer moves; clicking elsewhere jumps the runner there.
		if (hit === null) moveTo(i, p);
	}

	function onKeyDown(i: number, e: React.KeyboardEvent) {
		const d: Record<string, Pt> = { ArrowLeft: [-KEY_STEP, 0], ArrowRight: [KEY_STEP, 0], ArrowUp: [0, KEY_STEP], ArrowDown: [0, -KEY_STEP] };
		const step = d[e.key];
		if (!step) return;
		e.preventDefault();
		moveTo(i, [items[i].pos[0] + step[0], items[i].pos[1] + step[1]]);
	}

	// Foul lines from the plate's back tip toward 1B and 3B, to the edge of the view.
	const foulEnds = [FIRST_BASE, THIRD_BASE].map(([dx, dz]): Pt => {
		const t = Math.min((dx > 0 ? view.x1 : view.x0) / dx, view.z1 / dz);
		return [dx * t, dz * t];
	});

	return (
		<div className="space-y-1.5">
			<svg
				viewBox={`0 0 ${W} ${H}`}
				className="block h-auto w-full cursor-crosshair touch-none select-none rounded-md border border-night-700 bg-night-850"
				role="group"
				aria-label="Drag a point to set where that runner starts in the batter's box"
				onPointerDown={onPointerDown}
				onPointerMove={(e) => dragging.current !== null && moveTo(dragging.current, toField(e))}
				onPointerUp={() => (dragging.current = null)}
				onPointerCancel={() => (dragging.current = null)}
			>
				{foulEnds.map((e, k) => (
					<line key={k} x1={sx(0)} y1={sy(0)} x2={sx(e[0])} y2={sy(e[1])} stroke={GRID} strokeWidth={2} />
				))}
				<polygon points={PLATE.map((p) => `${sx(p[0])},${sy(p[1])}`).join(' ')} fill="var(--color-fog-100)" opacity={0.85} />
				{[...items].reverse().map((it, k) => {
					const [a, b, c, d] = it.rect;
					return (
						<rect
							key={`r-${k}`}
							x={sx(a)}
							y={sy(d)}
							width={(b - a) * S}
							height={(d - c) * S}
							fill={it.color}
							fillOpacity={0.12}
							stroke={it.color}
							strokeWidth={2}
							strokeDasharray={it.dashed ? '6 4' : undefined}
						/>
					);
				})}
				{[...items.keys()].reverse().map((i) => {
					const it = items[i];
					return (
						<g key={`p-${i}`}>
							{/* Larger invisible target for easier grabbing. */}
							<circle data-runner={i} cx={sx(it.pos[0])} cy={sy(it.pos[1])} r={14} fill="transparent" className="cursor-grab" />
							<circle
								data-runner={i}
								cx={sx(it.pos[0])}
								cy={sy(it.pos[1])}
								r={7}
								fill={it.color}
								stroke="var(--color-night-900)"
								strokeWidth={2.5}
								tabIndex={0}
								role="slider"
								aria-label={`${it.label} start position`}
								aria-valuetext={`(${it.pos[0].toFixed(2)}, ${it.pos[1].toFixed(2)}) m, ${it.L.toFixed(2)} m to 1st base`}
								onKeyDown={(e) => onKeyDown(i, e)}
								className="cursor-grab outline-none focus-visible:stroke-fog-100"
							/>
						</g>
					);
				})}
				<text x={W - 6} y={14} textAnchor="end" fontSize={12} fill={AXIS_TEXT}>
					↑ pitcher
				</text>
			</svg>
			<div className="space-y-0.5 text-xs">
				{items.map((it, i) => (
					<div key={i} className="flex items-center justify-between gap-3 text-fog-300">
						<span className="flex items-center gap-1.5">
							<span className="inline-block h-2 w-2 rounded-full" style={{ background: it.color }} />
							{it.label}
						</span>
						<span className="font-mono tabular-nums text-fog-100">{it.L.toFixed(2)} m to 1B</span>
					</div>
				))}
			</div>
		</div>
	);
}
