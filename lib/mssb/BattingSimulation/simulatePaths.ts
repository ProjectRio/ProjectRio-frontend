// Client-side equivalent of RioVisualizer's api.simulate(): runs the batting
// calculation and shapes trajectories for rendering. A replay of a stored
// event (exact rands, no overrides) yields the single true path; exploration
// modes fan out over the five vertical-range zones or random rerolls.

import { hitBall, type HitBallInputs, type HitBallResult } from './calcBatting';

export interface SimPath {
	points: [number, number, number][];
	final: [number, number, number];
	maxHeightPoint: [number, number, number];
	verticalRange: number | null;
}

export interface SimulationOutput {
	paths: SimPath[];
	details: HitBallResult | null;
	errors: string[];
}

function pathToPoints(result: HitBallResult): [number, number, number][] {
	return (result.FlightDetails?.Path ?? []).map((p) => [p.X, p.Y, p.Z]);
}

function toSimPath(result: HitBallResult, verticalRange: number | null): SimPath | null {
	const points = pathToPoints(result);
	if (points.length === 0) return null;
	let maxHeightPoint = points[0];
	for (const p of points) {
		if (p[1] > maxHeightPoint[1]) maxHeightPoint = p;
	}
	return { points, final: points[points.length - 1], maxHeightPoint, verticalRange };
}

// One deterministic trajectory from exact inputs (the replay case).
export function simulateExact(inputs: HitBallInputs): SimulationOutput {
	const result = hitBall(inputs);
	if (result.err) return { paths: [], details: null, errors: [result.err] };
	const path = toSimPath(result, null);
	return { paths: path ? [path] : [], details: result, errors: [] };
}

// Fan out over the five vertical-angle zones the swing could have rolled
// (mirrors RioVisualizer's default five-path view).
export function simulateVerticalSpread(inputs: HitBallInputs): SimulationOutput {
	const out: SimulationOutput = { paths: [], details: null, errors: [] };
	for (let range = 0; range < 5; range++) {
		const result = hitBall({ ...inputs, override_vertical_range: range });
		if (result.err) {
			out.errors.push(`vertical range ${range}: ${result.err}`);
			continue;
		}
		const path = toSimPath(result, range);
		if (path) {
			out.paths.push(path);
			if (!out.details) out.details = result;
		}
	}
	return out;
}

// Landing points across n random RNG rerolls (the "cone" of possible outcomes
// for identical player inputs).
export function simulateRandomLandings(inputs: HitBallInputs, n: number): [number, number, number][] {
	const seen = new Set<string>();
	const landings: [number, number, number][] = [];
	for (let i = 0; i < n; i++) {
		const result = hitBall({
			...inputs,
			rand_1: Math.trunc(Math.random() * 2 ** 15),
			rand_2: Math.trunc(Math.random() * 2 ** 15),
			rand_3: Math.trunc(Math.random() * 2 ** 15)
		});
		const path = result.FlightDetails?.Path;
		if (!path || path.length === 0) continue;
		const last = path[path.length - 1];
		const key = `${last.X},${last.Y},${last.Z}`;
		if (!seen.has(key)) {
			seen.add(key);
			landings.push([last.X, last.Y, last.Z]);
		}
	}
	return landings;
}
