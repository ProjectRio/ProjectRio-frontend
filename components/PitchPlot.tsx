'use client';

import { useMemo, useState } from 'react';
import { generatePitchCoordinates } from '@/lib/mssb/PitchSimulation/generatePitchCoordinates';

const FT_TO_M = 0.3048;
// Conversion between an actual home-plate front measurement (16.5 in) and the game's 0.53*2 m
const GAME_HOME_PLATE_SCALE = (0.53 * 2) / 16.5;

const HOME_PLATE: { x: number; y: number }[] = [
	{ x: 0, y: 0 },
	{ x: 0.53, y: 1.06 * 0.513939 },
	{ x: 0.53, y: 1.06 },
	{ x: -0.53, y: 1.06 },
	{ x: -0.53, y: 1.06 * 0.513939 },
	{ x: 0, y: 0 }
];

const MOUND_LEFT = -(24 / 2) * GAME_HOME_PLATE_SCALE;
const MOUND_RIGHT = -MOUND_LEFT;
const MOUND_FRONT = 60.5 * FT_TO_M;
const MOUND_BACK = MOUND_FRONT + 0.5 * 12 * GAME_HOME_PLATE_SCALE;

const PITCHERS_PLATE: { x: number; y: number }[] = [
	{ x: MOUND_LEFT, y: MOUND_BACK },
	{ x: MOUND_RIGHT, y: MOUND_BACK },
	{ x: MOUND_RIGHT, y: MOUND_FRONT },
	{ x: MOUND_LEFT, y: MOUND_FRONT },
	{ x: MOUND_LEFT, y: MOUND_BACK }
];

function scaleLinear([d0, d1]: [number, number], [r0, r1]: [number, number]) {
	return (value: number) => r0 + ((value - d0) / (d1 - d0)) * (r1 - r0);
}

export default function PitchPlot({ pitchInputs, height = 750 }: { pitchInputs: any; height?: number }) {
	const width = height / 3;
	const circleRadius = height / 250;
	const fontSize = Math.floor(height / 75);
	const [hovered, setHovered] = useState<number | null>(null);

	const pitchData = useMemo(() => generatePitchCoordinates(pitchInputs), [pitchInputs]);
	const points: any[] = pitchData.calcedOutputs;

	const xs = points.map((p) => p.calculatedAtBatBallPosPoints.X);
	const bound = Math.max(2, ...xs.map(Math.abs)) + 0.2;
	const sx = scaleLinear([-bound, bound], [0, width]);
	const sy = scaleLinear([19.5, -3], [0, height]);

	const toPath = (pts: { x: number; y: number }[]) =>
		pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${sx(p.x)},${sy(p.y)}`).join(' ');
	const pitchPath = points
		.map((p, i) => `${i === 0 ? 'M' : 'L'}${sx(p.calculatedAtBatBallPosPoints.X)},${sy(p.calculatedAtBatBallPosPoints.Z)}`)
		.join(' ');

	return (
		<svg width={width} height={height} role="img" aria-label="Pitch trajectory plot">
			<path d={toPath(HOME_PLATE)} fill="none" stroke="#45a3ff" strokeWidth={3} />
			<path d={toPath(PITCHERS_PLATE)} fill="none" stroke="#45a3ff" strokeWidth={3} />
			<path d={pitchPath} fill="none" stroke="var(--color-night-600)" strokeWidth={1} />
			{points.map((frame, index) => (
				<g key={frame.pitchFrame}>
					{hovered === index && (
						<text
							x={sx(frame.calculatedAtBatBallPosPoints.X + 0.1)}
							y={sy(frame.calculatedAtBatBallPosPoints.Z)}
							fill="#ffd23f"
							fontSize={fontSize}
						>
							<tspan x={sx(frame.calculatedAtBatBallPosPoints.X + 0.1)} dy={0}>
								Coords {frame.calculatedAtBatBallPosPoints.X.toFixed(5)}, {frame.calculatedAtBatBallPosPoints.Z.toFixed(5)}
							</tspan>
							<tspan x={sx(frame.calculatedAtBatBallPosPoints.X + 0.1)} dy="1.3em">
								Velocity {frame.calculatedVelocity.X.toFixed(5)}, {frame.calculatedVelocity.Z.toFixed(5)}
							</tspan>
							<tspan x={sx(frame.calculatedAtBatBallPosPoints.X + 0.1)} dy="1.3em">
								Frame {frame.pitchFrame}
							</tspan>
							<tspan x={sx(frame.calculatedAtBatBallPosPoints.X + 0.1)} dy="1.3em">
								Curve Input {frame.curveInput}
							</tspan>
						</text>
					)}
					<circle
						cx={sx(frame.calculatedAtBatBallPosPoints.X)}
						cy={sy(frame.calculatedAtBatBallPosPoints.Z)}
						r={circleRadius}
						fill={hovered === index ? '#4ade80' : '#e60012'}
						onMouseOver={() => setHovered(index)}
						onMouseOut={() => setHovered(null)}
					/>
				</g>
			))}
		</svg>
	);
}
