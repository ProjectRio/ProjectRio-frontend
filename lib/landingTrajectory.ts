// Flight paths for contacts pulled from /landing_data/.
//
// WHY THIS ISN'T THE BATTING SIM: the game page replays a hit by feeding the
// stored event through calcBatting.ts, which reproduces the real trajectory
// bit-exact. That needs /games/events/ and one fetch per game — no good for a
// lab that pulls thousands of contacts across whole seasons.
//
// /landing_data/ gives us the recorded endpoints instead: contact position,
// exit velocity, apex, flight frames and where the ball ended up. Integrating
// the stored exit velocity does NOT get you back to the recorded landing spot
// (measured over 1,200 real contacts: median closest approach 1.9 m, only ~30%
// within 1 m — the recorded landing is where a fielder took the ball, and the
// velocity columns alone don't account for that). So instead of re-simulating,
// we reconstruct the arc that the recorded numbers describe: it starts at the
// contact point, peaks at the recorded apex, and ends exactly at the recorded
// landing spot.
//
// Within those constraints the shape is the game's own motion model — no
// lateral acceleration on a batted ball, so the ground track is a straight
// line, and both axes decay by `airResistance` every frame under `gravity`.

import tables from './mssb/BattingSimulation/battingConstants.json';
import type { LandingRow } from './landingData';

const T = tables as Record<string, any>;
const GRAVITY: number = T.gravity;
const AIR: number = T.airResistance;
const BATTER_HITBOXES: { PitchingHeight: number }[] = T.BATTER_HITBOXES;

export type Point3 = [number, number, number];

// Distance covered after k frames by a velocity that decays by AIR each frame,
// in units of the initial per-frame velocity. Closed form of
// sum(AIR^i, i < k) so we never have to step the whole flight.
function dragSum(k: number): number {
	return (1 - Math.pow(AIR, k)) / (1 - AIR);
}

// Height after n frames is linear in the launch velocity:
//   y_n = y0 + v0 * S(n) - gravity * D(n)
// where S is dragSum and D is the accumulated pull of gravity. Inverting it
// gives the one launch velocity that lands where the game says it landed.
function gravityDrop(n: number): number {
	return (AIR / (1 - AIR)) * (n - dragSum(n));
}

export function contactHeight(charId: number): number {
	return BATTER_HITBOXES[charId]?.PitchingHeight ?? 1;
}

// Height after k frames for a given launch velocity.
function heightAt(y0: number, launchY: number, k: number): number {
	return y0 + launchY * dragSum(k) - GRAVITY * gravityDrop(k);
}

// The ball peaks when its velocity crosses zero. v_k = A^k*v0 - g*A*(1-A^k)/(1-A),
// so that happens at a frame we can name outright rather than search for.
function apexFrame(launchY: number): number {
	if (launchY <= 0) return 0;
	const pull = (GRAVITY * AIR) / (1 - AIR);
	return Math.log(pull / (launchY + pull)) / Math.log(AIR);
}

// Solving only for "ends at the recorded landing spot after the recorded number
// of frames" reproduces the endpoints exactly but misses the recorded apex by
// ~1.8 m at the median — and the apex is the most visible part of an arc. So
// fit the launch velocity to the recorded apex instead (it's monotonic, so a
// bisection nails it), then read off the frame where the ball comes back down
// to the recorded landing height. Flight duration becomes a derived value,
// which is fine here: these arcs are drawn, not animated.
function launchForApex(y0: number, apexHeight: number): number {
	let lo = 0;
	let hi = 5; // far beyond any real exit velocity
	for (let i = 0; i < 60; i++) {
		const mid = (lo + hi) / 2;
		if (heightAt(y0, mid, apexFrame(mid)) < apexHeight) lo = mid;
		else hi = mid;
	}
	return (lo + hi) / 2;
}

// First frame after the peak at which the ball is back down to `targetY`.
function framesToHeight(y0: number, launchY: number, targetY: number, cap: number): number {
	const peak = apexFrame(launchY);
	let lo = peak;
	let hi = peak + 1;
	while (hi < cap && heightAt(y0, launchY, hi) > targetY) hi *= 2;
	for (let i = 0; i < 60; i++) {
		const mid = (lo + hi) / 2;
		if (heightAt(y0, launchY, mid) > targetY) lo = mid;
		else hi = mid;
	}
	return Math.max(1, (lo + hi) / 2);
}

// Sampled points along one contact's flight, in game coordinates (X toward
// 1B, Y up, Z toward center field).
export function trajectoryPoints(row: LandingRow, samples = 24): Point3[] {
	// The two ends of the arc are recorded in different frames. Landing X is
	// world space (it lines up with the fielder columns, which match pyRio's
	// starting spots to a metre for both stances). Contact X is righty-local —
	// the game only mirrors it for a lefty when calculateHitGround builds the
	// path — so mirror it here. Checked on 634 recorded lefty contacts: the
	// contact -> landing bearing sits 1.7° off the recorded exit velocity with
	// the mirror and 3.5° off without it, measured on short flights where a
	// metre of start error actually shows.
	const startX = row.battingHand ? -row.contactX : row.contactX;
	const startZ = row.contactZ;
	const startY = contactHeight(row.batterCharId);

	const recordedFrames = Math.max(1, Math.round(row.hangTime));
	const apexHeight = Math.max(row.maxHeight, startY);

	let launchY: number;
	let frames: number;
	if (apexHeight > startY + 1e-4) {
		launchY = launchForApex(startY, apexHeight);
		// Cap the search generously past the recorded flight so a ball that was
		// caught well above the ground still terminates.
		frames = framesToHeight(startY, launchY, row.landingY, recordedFrames * 8 + 240);
	} else {
		// Hit flat or downward: there's no peak to fit, so fall back to the
		// launch velocity that puts it at the recorded spot on schedule.
		frames = recordedFrames;
		launchY = (row.landingY - startY + GRAVITY * gravityDrop(frames)) / dragSum(frames);
	}

	const dx = row.landingX - startX;
	const dz = row.landingZ - startZ;
	const groundTotal = dragSum(frames);

	const points: Point3[] = [];
	const step = frames / Math.max(1, samples - 1);
	for (let i = 0; i < samples; i++) {
		const k = Math.min(frames, i * step);
		points.push([
			startX + dx * (dragSum(k) / groundTotal),
			heightAt(startY, launchY, k),
			startZ + dz * (dragSum(k) / groundTotal)
		]);
	}
	// Pin the last sample to the recorded landing spot so sampling never moves
	// the one number we actually know.
	points[points.length - 1] = [row.landingX, row.landingY, row.landingZ];
	return points;
}

// Apex of the reconstructed flight. Compared against the recorded
// ball_max_height this is a useful sanity read, but the recorded value is the
// one to display.
export function trajectoryApex(points: Point3[]): Point3 {
	let apex = points[0];
	for (const point of points) if (point[1] > apex[1]) apex = point;
	return apex;
}
