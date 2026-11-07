'use client';

import { useMemo, useState } from 'react';
import { characters } from '@/lib/data/characters';
import { batterPosition, legLength, type BoxSide, type BoxSpot } from '@/lib/mssb/RunningSimulation/runningModel';
import { BATTER_BOX, FIRST_BASE } from '@/lib/mssb/RunningSimulation/runningConstants';
import { AXIS_LABEL, AXIS_TEXT, GRID, SERIES } from './chartUtils';

type Pt = [number, number];

// View, in metres: x is toward 1B (right), z is toward the pitcher (up).
const X0 = -5.4;
const X1 = 5.4;
const Z0 = -2.3;
const Z1 = 1.45;
const S = 68; // px per metre
/** Outline in the panel colour so labels stay readable where they cross lines. */
const HALO = { paintOrder: 'stroke', stroke: 'var(--color-night-900)', strokeWidth: 4, strokeLinejoin: 'round' } as const;
const PAD = 13;
const W = (X1 - X0) * S + PAD * 2;
const H = (Z1 - Z0) * S + PAD * 2;
const sx = (x: number) => PAD + (x - X0) * S;
const sy = (z: number) => PAD + (Z1 - z) * S;

const SIDES: BoxSide[] = ['L', 'R'];
const CORNERS: BoxSpot[] = ['fi', 'fo', 'bi', 'bo'];
const SIDE_NAME: Record<BoxSide, string> = { L: 'Left-handed box', R: 'Right-handed box' };
const charName = (id: number) => characters[String(id)];

// Home plate: 17 in (0.43 m) wide, flat edge toward the pitcher, back tip at the origin of the game's coordinates.
const HALF_PLATE = 0.2159;
const PLATE_TIP: Pt = [0, 0];
const PLATE: Pt[] = [
	[-HALF_PLATE, 2 * HALF_PLATE],
	[HALF_PLATE, 2 * HALF_PLATE],
	[HALF_PLATE, HALF_PLATE],
	PLATE_TIP,
	[-HALF_PLATE, HALF_PLATE]
];
const THIRD_BASE: Pt = [-18.5, 19.3];

/** Point where the line from `a` toward `b` leaves the view. */
function toEdge(a: Pt, b: Pt): Pt {
	const dx = b[0] - a[0];
	const dz = b[1] - a[1];
	const t = Math.min(dx > 0 ? (X1 - a[0]) / dx : (X0 - a[0]) / dx, (Z1 - a[1]) / dz);
	return [a[0] + dx * t, a[1] + dz * t];
}

function boxCorners(id: number, side: BoxSide) {
	return CORNERS.map((spot) => {
		const p = batterPosition(id, side, spot);
		return { spot, p, L: legLength(p) };
	});
}

function bounds(ps: Pt[]) {
	const xs = ps.map((p) => p[0]);
	const zs = ps.map((p) => p[1]);
	return { x0: Math.min(...xs), x1: Math.max(...xs), z0: Math.min(...zs), z1: Math.max(...zs) };
}

/**
 * Outline of the union of every character's box on one side. Box edges are multiples of 0.05 m, so the union is
 * rasterised on a 0.05 m grid and its boundary drawn as a path.
 */
function unionOutline(side: BoxSide): string {
	const STEP = 0.05;
	const q = (v: number) => Math.round(v / STEP);
	const rects = BATTER_BOX.map((_, id) => {
		const b = bounds(boxCorners(id, side).map((c) => c.p));
		return { x0: q(b.x0), x1: q(b.x1), z0: q(b.z0), z1: q(b.z1) };
	});
	const gx0 = Math.min(...rects.map((r) => r.x0));
	const gx1 = Math.max(...rects.map((r) => r.x1));
	const gz0 = Math.min(...rects.map((r) => r.z0));
	const gz1 = Math.max(...rects.map((r) => r.z1));
	const covered = (i: number, j: number) => rects.some((r) => i >= r.x0 && i < r.x1 && j >= r.z0 && j < r.z1);
	const segs: string[] = [];
	const P = (i: number, j: number) => `${sx(i * STEP).toFixed(1)},${sy(j * STEP).toFixed(1)}`;
	for (let i = gx0 - 1; i <= gx1; i++) {
		for (let j = gz0 - 1; j <= gz1; j++) {
			const c = covered(i, j);
			if (c !== covered(i + 1, j)) segs.push(`M${P(i + 1, j)}L${P(i + 1, j + 1)}`);
			if (c !== covered(i, j + 1)) segs.push(`M${P(i, j + 1)}L${P(i + 1, j + 1)}`);
		}
	}
	return segs.join('');
}

/** The closest spot to 1B any character can stand in, per side. */
function closestOverall(side: BoxSide) {
	return BATTER_BOX.map((_, id) => {
		const p = batterPosition(id, side, 'best');
		return { id, p, L: legLength(p) };
	}).reduce((a, b) => (b.L < a.L ? b : a));
}

const OUTLINES = { L: unionOutline('L'), R: unionOutline('R') };
const RECORDS = { L: closestOverall('L'), R: closestOverall('R') };
const OPTIONS = BATTER_BOX.map((_, id) => id).sort((a, b) => charName(a).localeCompare(charName(b)));

function cornerName(spot: BoxSpot) {
	return `${spot[0] === 'f' ? 'Front' : 'Back'}-${spot[1] === 'i' ? 'inside' : 'outside'} corner`;
}

/** Top-down view of both batter's boxes with the distance to 1B from each corner, for one character. */
export default function BatterBoxDiagram() {
	const [charId, setCharId] = useState(0);
	const boxes = useMemo(
		() =>
			SIDES.map((side) => {
				const corners = boxCorners(charId, side);
				const b = bounds(corners.map((c) => c.p));
				const best = corners.reduce((a, c) => (c.L < a.L ? c : a));
				const def = batterPosition(charId, side, 'def');
				return { side, corners, b, best, def, defL: legLength(def) };
			}),
		[charId]
	);

	const lineTo1B = toEdge(PLATE_TIP, FIRST_BASE);
	const lineTo3B = toEdge(PLATE_TIP, THIRD_BASE);

	return (
		<div className="space-y-3">
			<div className="max-w-xs">
				<label className="label" htmlFor="bb-char">
					Character
				</label>
				<select id="bb-char" className="input" value={charId} onChange={(e) => setCharId(Number(e.target.value))}>
					{OPTIONS.map((id) => (
						<option key={id} value={id}>
							{charName(id)}
						</option>
					))}
				</select>
			</div>

			<svg viewBox={`0 0 ${W} ${H}`} className="block h-auto w-full" role="img" aria-label={`Batter's boxes for ${charName(charId)} with the distance to 1st base from each corner`}>
				{/* Foul lines from the back tip of the plate toward 1B and 3B. */}
				<line x1={sx(PLATE_TIP[0])} y1={sy(PLATE_TIP[1])} x2={sx(lineTo1B[0])} y2={sy(lineTo1B[1])} stroke={GRID} strokeWidth={2} />
				<line x1={sx(PLATE_TIP[0])} y1={sy(PLATE_TIP[1])} x2={sx(lineTo3B[0])} y2={sy(lineTo3B[1])} stroke={GRID} strokeWidth={2} />
				<polygon points={PLATE.map((p) => `${sx(p[0])},${sy(p[1])}`).join(' ')} fill="var(--color-fog-100)" opacity={0.85} />

				{SIDES.map((side) => (
					<g key={side}>
						{/* Every character's range combined, for reference. */}
						<path d={OUTLINES[side]} fill="none" stroke={AXIS_TEXT} strokeWidth={1.5} strokeDasharray="1 3" strokeLinecap="round" />
						<text x={sx(side === 'L' ? 2.6 : -2.6)} y={sy(-1.6) + 38} textAnchor="middle" fontSize={13.5} fill={AXIS_LABEL}>
							{SIDE_NAME[side]}
						</text>
						<g>
							<title>{`Closest spot any character reaches in the ${SIDE_NAME[side].toLowerCase()}: ${charName(RECORDS[side].id)}, ${RECORDS[side].L.toFixed(2)} m`}</title>
							<text x={sx(RECORDS[side].p[0])} y={sy(RECORDS[side].p[1]) + 4} textAnchor="middle" fontSize={12} fill={SERIES.gold}>
								★
							</text>
						</g>
					</g>
				))}

				{boxes.map(({ side, corners, b, best, def, defL }) => {
					const cx = (b.x0 + b.x1) / 2;
					const cz = (b.z0 + b.z1) / 2;
					return (
						<g key={side}>
							<rect
								x={sx(b.x0)}
								y={sy(b.z1)}
								width={(b.x1 - b.x0) * S}
								height={(b.z1 - b.z0) * S}
								fill={SERIES.blue}
								fillOpacity={0.18}
								stroke={SERIES.blue}
								strokeWidth={2}
							/>
							{corners.map((c) => {
								const right = c.p[0] > cx;
								const up = c.p[1] > cz;
								const isBest = c === best;
								return (
									<g key={c.spot}>
										<title>{`${SIDE_NAME[side]}, ${cornerName(c.spot).toLowerCase()}: ${c.L.toFixed(2)} m to 1B`}</title>
										<circle cx={sx(c.p[0])} cy={sy(c.p[1])} r={isBest ? 5 : 3.5} fill={isBest ? SERIES.gold : SERIES.blue} stroke="var(--color-night-900)" strokeWidth={2} />
										<text
											x={sx(c.p[0]) + (right ? 8 : -8)}
											y={sy(c.p[1]) + (up ? -9 : 19)}
											textAnchor={right ? 'start' : 'end'}
											fontSize={14}
											fontWeight={isBest ? 700 : 400}
											fill={isBest ? 'var(--color-fog-100)' : AXIS_LABEL}
											className="font-mono"
											{...HALO}
										>
											{c.L.toFixed(2)} m
										</text>
									</g>
								);
							})}
							<g>
								<title>{`${SIDE_NAME[side]}, default position: ${defL.toFixed(2)} m to 1B`}</title>
								<circle cx={sx(def[0])} cy={sy(def[1])} r={5} fill="none" stroke="var(--color-fog-100)" strokeWidth={2} />
								<circle cx={sx(def[0])} cy={sy(def[1])} r={1.5} fill="var(--color-fog-100)" />
								<text x={sx(def[0])} y={sy(def[1]) + 20} textAnchor="middle" fontSize={13} fill="var(--color-fog-100)" className="font-mono" {...HALO}>
									{defL.toFixed(2)} m
								</text>
							</g>
						</g>
					);
				})}
			</svg>

			<div className="flex flex-wrap gap-x-5 gap-y-1 text-xs text-fog-300">
				<span className="flex items-center gap-2">
					<span className="inline-block h-3 w-4 rounded-sm border-2" style={{ borderColor: SERIES.blue, background: 'rgba(57,135,229,0.18)' }} />
					{charName(charId)}&apos;s range
				</span>
				<span className="flex items-center gap-2">
					<span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: SERIES.gold }} />
					Closest corner
				</span>
				<span className="flex items-center gap-2">
					<span className="inline-block h-2.5 w-2.5 rounded-full border-2 border-fog-100" />
					Default position
				</span>
				<span className="flex items-center gap-2">
					<span className="inline-block w-5 border-t-2 border-dotted border-fog-500" />
					Combined range of all characters
				</span>
				<span className="flex items-center gap-2">
					<span style={{ color: SERIES.gold }}>★</span>
					Closest spot anyone can reach: {charName(RECORDS.L.id)} {RECORDS.L.L.toFixed(2)} m (left), {charName(RECORDS.R.id)}{' '}
					{RECORDS.R.L.toFixed(2)} m (right)
				</span>
			</div>
		</div>
	);
}
