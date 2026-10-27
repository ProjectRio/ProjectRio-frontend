'use client';

// Flat companions to the 3D trajectory lab: a top-down fan of the horizontal
// window every contact frame can produce (and how left/right stick shifts the
// selected frame), and side-view fans of the five launch zones showing how
// up/down stick moves the character's zone weights.

import { useMemo } from 'react';
import tables from '@/lib/mssb/BattingSimulation/battingConstants.json';
import { hitBall, type HitBallInputs } from '@/lib/mssb/BattingSimulation/calcBatting';
import { PATH_COLORS } from '@/components/visualizer/scene';

const BATTING_ANGLE_RANGES = (tables as any).BATTING_ANGLE_RANGES as number[][][][];
const UNITS_TO_DEG = 360 / 4096;

// Empirically verified: for a righty, positive units land toward 3B, so the
// bearing toward 1B is -units. Lefties mirror.
function bearingWindow(
	inputDirection: number,
	isCharge: 0 | 1,
	frame: number,
	lefty: boolean
): [number, number] {
	const [lo, hi] = BATTING_ANGLE_RANGES[inputDirection][isCharge][frame] ?? [0, 0];
	const a = (lefty ? 1 : -1) * lo * UNITS_TO_DEG;
	const b = (lefty ? 1 : -1) * hi * UNITS_TO_DEG;
	return a <= b ? [a, b] : [b, a];
}

function stickDirection(stick: 'none' | 'left' | 'right', lefty: boolean): number {
	if (stick === 'none') return 0; // PUSHPULL_NONE
	if (stick === 'right') return lefty ? 1 : 2; // pull for a lefty, push for a righty
	return lefty ? 2 : 1;
}

const pathColor = (i: number) => `#${PATH_COLORS[i % PATH_COLORS.length].toString(16).padStart(6, '0')}`;

// ---------- Horizontal: nested frame bands, top-down ----------

export function HorizontalFan({
	isCharge,
	frame,
	lefty,
	stickX,
	frames
}: {
	isCharge: 0 | 1;
	frame: number;
	lefty: boolean;
	stickX: 'none' | 'left' | 'right';
	frames: number[];
}) {
	const W = 360;
	const H = 210;
	const cx = W / 2;
	const cy = H - 26;
	const r0 = 34;
	const step = (H - 70) / frames.length;

	const point = (bearingDeg: number, r: number): [number, number] => {
		const rad = (bearingDeg * Math.PI) / 180;
		return [cx + r * Math.sin(rad), cy - r * Math.cos(rad)];
	};

	// Annular sector between two bearings (outer arc clockwise, inner back).
	const band = (b0: number, b1: number, rIn: number, rOut: number): string => {
		const [x0, y0] = point(b0, rOut);
		const [x1, y1] = point(b1, rOut);
		const [x2, y2] = point(b1, rIn);
		const [x3, y3] = point(b0, rIn);
		return `M ${x0} ${y0} A ${rOut} ${rOut} 0 0 1 ${x1} ${y1} L ${x2} ${y2} A ${rIn} ${rIn} 0 0 0 ${x3} ${y3} Z`;
	};

	const guide = (bearingDeg: number) => {
		const [x, y] = point(bearingDeg, r0 + frames.length * step + 6);
		return { x, y };
	};

	return (
		<svg viewBox={`0 0 ${W} ${H}`} className="w-full">
			{/* Foul-line guides at ±45° and the center line */}
			{[-45, 0, 45].map((deg) => {
				const g = guide(deg);
				return (
					<g key={deg}>
						<line x1={cx} y1={cy} x2={g.x} y2={g.y} stroke="#1f1f30" strokeWidth="1" />
						<text x={g.x} y={g.y - 3} textAnchor="middle" fontSize="9" className="fill-fog-500">
							{deg === 0 ? 'CF' : deg < 0 ? '3B' : '1B'}
						</text>
					</g>
				);
			})}
			{frames.map((f, idx) => {
				// Every band honors the held stick — a pull hold shifts the whole fan.
				const [b0, b1] = bearingWindow(stickDirection(stickX, lefty), isCharge, f, lefty);
				const rIn = r0 + idx * step;
				const rOut = rIn + step - 2;
				const selected = f === frame;
				const [lx, ly] = point((b0 + b1) / 2, (rIn + rOut) / 2);
				return (
					<g key={f}>
						<path
							d={band(b0, b1, rIn, rOut)}
							fill={selected ? '#e60012' : '#2b2b40'}
							fillOpacity={selected ? 0.85 : 0.55}
							stroke={selected ? '#ff6b78' : '#1f1f30'}
							strokeWidth="1"
						/>
						<text
							x={lx}
							y={ly + 3}
							textAnchor="middle"
							fontSize="9"
							fontWeight={selected ? 700 : 400}
							className={selected ? 'fill-white' : 'fill-fog-500'}
						>
							{f}
						</text>
					</g>
				);
			})}
			<circle cx={cx} cy={cy} r="3" className="fill-fog-300" />
		</svg>
	);
}

// The selected frame's window under each left/right stick option, on a shared
// bearing axis, so the shift is directly comparable.
export function StickShiftBars({
	isCharge,
	frame,
	lefty,
	stickX
}: {
	isCharge: 0 | 1;
	frame: number;
	lefty: boolean;
	stickX: 'none' | 'left' | 'right';
}) {
	const MIN = -70;
	const MAX = 70;
	const toPct = (deg: number) => ((deg - MIN) / (MAX - MIN)) * 100;
	const rows: { label: string; stick: 'none' | 'left' | 'right' }[] = [
		{ label: 'Stick —', stick: 'none' },
		{ label: 'Stick L', stick: 'left' },
		{ label: 'Stick R', stick: 'right' }
	];
	return (
		<div className="space-y-1">
			{rows.map(({ label, stick }) => {
				const [b0, b1] = bearingWindow(stickDirection(stick, lefty), isCharge, frame, lefty);
				const active = stick === stickX;
				return (
					<div key={stick} className="flex items-center gap-2 text-[10px]">
						<span className={`w-12 shrink-0 font-display font-semibold uppercase ${active ? 'text-rio-300' : 'text-fog-500'}`}>
							{label}
						</span>
						<div className="relative h-3 flex-1 rounded bg-night-800">
							{/* center + foul-line ticks */}
							{[-45, 0, 45].map((deg) => (
								<span
									key={deg}
									className="absolute top-0 h-full w-px bg-night-600"
									style={{ left: `${toPct(deg)}%` }}
								/>
							))}
							<span
								className={`absolute top-0 h-full rounded ${active ? 'bg-rio-500' : 'bg-fog-500/40'}`}
								style={{ left: `${toPct(b0)}%`, width: `${Math.max(toPct(b1) - toPct(b0), 1)}%` }}
							/>
						</div>
						<span className="w-20 shrink-0 text-right tabular-nums text-fog-500">
							{b0.toFixed(0)}°…{b1.toFixed(0)}°
						</span>
					</div>
				);
			})}
			<p className="pl-14 text-[10px] text-fog-500">−70° = 3B line side · +70° = 1B line side</p>
		</div>
	);
}

// ---------- Vertical: one full-width launch-zone fan (live stick state) ----------

export function VerticalFan({ inputs }: { inputs: HitBallInputs }) {
	const { zones, weights } = useMemo(() => {
		const details = hitBall(inputs)['Vertical Details'];
		return { zones: details?.Zones ?? [], weights: details?.Weights ?? [] };
	}, [inputs]);

	const W = 380;
	const H = 250;
	const ox = 16;
	const oy = H - 26;
	const R = W - 66;

	const point = (angleDeg: number, r: number): [number, number] => {
		const rad = (angleDeg * Math.PI) / 180;
		return [ox + r * Math.cos(rad), oy - r * Math.sin(rad)];
	};

	const maxWeight = Math.max(1, ...weights);

	return (
		<svg viewBox={`0 0 ${W} ${H}`} className="w-full">
			{/* horizon + angle guides */}
			<line x1={ox} y1={oy} x2={ox + R + 14} y2={oy} stroke="#2b2b40" strokeWidth="1" />
			{[15, 30, 45].map((deg) => {
				const [gx, gy] = point(deg, R + 14);
				return (
					<g key={deg}>
						<line x1={ox} y1={oy} x2={gx} y2={gy} stroke="#1f1f30" strokeWidth="1" />
						<text x={gx + 2} y={gy} fontSize="9" className="fill-fog-500">
							{deg}°
						</text>
					</g>
				);
			})}
			{zones.map((zone, i) => {
				const a0 = zone[0] * UNITS_TO_DEG;
				const a1 = zone[1] * UNITS_TO_DEG;
				const weight = weights[i] ?? 0;
				const [x0, y0] = point(a0, R);
				const [x1, y1] = point(a1, R);
				const [lx, ly] = point((a0 + a1) / 2, R * 0.72);
				return (
					<g key={i}>
						<path
							d={`M ${ox} ${oy} L ${x0} ${y0} A ${R} ${R} 0 0 0 ${x1} ${y1} Z`}
							fill={pathColor(i)}
							fillOpacity={0.08 + 0.72 * (weight / maxWeight)}
							stroke="#10101a"
							strokeWidth="0.75"
						/>
						{weight > 0 && (
							<text
								x={lx}
								y={ly}
								textAnchor="middle"
								fontSize="11"
								fontWeight="700"
								className="fill-fog-100"
							>
								{weight}%
							</text>
						)}
					</g>
				);
			})}
			<circle cx={ox} cy={oy} r="3" className="fill-fog-300" />
			<text x={ox + R + 12} y={oy + 12} textAnchor="end" fontSize="9" className="fill-fog-500">
				launch angle from horizontal · shade = odds of that zone
			</text>
		</svg>
	);
}
