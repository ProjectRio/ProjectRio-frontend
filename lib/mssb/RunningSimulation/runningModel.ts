// Frame-accurate model of a runner going around the bases, from the batter's box or from a base.
// Mirrors running_updateRunner and the functions it calls in runner.c (mssb-dtk decompilation), plus
// setRunnerSpeedConstants (roster_init.c), in single precision. See the Running Analysis page for the rules.

import {
	BASE_COORDS,
	BASE_REACH_MARGIN,
	BASE_ROUNDING_PATH,
	BATTER_BOX,
	BATTER_RUN_DELAY_FRAMES,
	FIRST_BASE,
	INITIAL_BOX_POSITION,
	LEADOFF_PERCENT,
	MASH_HOLD_FRAMES,
	MAX_ACCEL_PENALTY,
	MAX_SPEED_PENALTY,
	MAX_STAMINA,
	ROUND_START_PERCENT,
	ROUNDING_STRENGTH_PER_FRAME,
	RUNNER_AUTO_START_FRAME,
	RUNNER_SPEED_SCALING,
	RUNNER_VELOCITY_LOOKUP,
	SLIDE_MAX_FRAMES,
	SLIDE_MIN_FRAMES,
	SLIDE_RECOVERY_FRAMES,
	SPEED_STAT_CAP,
	type SpeedStatRange
} from './runningConstants';
import { makeSpline } from './spline';

const F = Math.fround;
const VEL = RUNNER_VELOCITY_LOOKUP.map(F);

/** tas: a new press every frame · human: every 3rd frame (about 20 presses per second) · none: no presses. */
export type MashMode = 'tas' | 'human' | 'none';
/** Frames between mash presses for each mode (0 = never). */
export const MASH_INTERVAL: Record<MashMode, number> = { tas: 1, human: 3, none: 0 };

/**
 * round: the runner rounds the bases (ball in the outfield) and keeps their speed through each base.
 * straight: no rounding (ball in the infield): stop on 1st, slide into 2nd, 3rd and home.
 */
export type PathMode = 'round' | 'straight';
export type BoxSide = 'R' | 'L';
/**
 * def: default start · center: middle · best/worst: corner closest to / farthest from 1B for that side ·
 * fi/fo/bi/bo: front (toward the pitcher) or back (toward the catcher), inside (next to the plate) or outside.
 */
export type BoxSpot = 'def' | 'center' | 'best' | 'worst' | 'fi' | 'fo' | 'bi' | 'bo';
/** 0 = home (the batter), 1 = 1st, 2 = 2nd, 3 = 3rd; as an end base, 4 = home. */
export type BaseIndex = number;

export const BASE_NAMES = ['Home', '1B', '2B', '3B', 'Home'];

export interface SpeedConstants {
	maxV: number;
	accel: number;
	maxMash: number;
	perMash: number;
	decay: number;
}

export type RunnerAction = 'none' | 'slide' | 'recover';

export interface FrameState {
	/** framesSinceHit during this frame's runner update. */
	f: number;
	/** groundVelocity[0] after the update, metres/frame. */
	v: number;
	/** fractionalBasesRan: bases run, e.g. 1.5 = halfway from 1B to 2B. */
	fbr: number;
	/** percentTowardsNextBase: fraction of the current baseline, 0..1. */
	pct: number;
	/** mashPercent, 0..1. */
	mash: number;
	stamina: number;
	/** Velocity cap this frame (0 while held). */
	cap: number;
	held: boolean;
	/** Drawn position (x, z) in metres. */
	x: number;
	z: number;
	/** roundingStrengthPercent: 0 = straight line, 1 = on the rounding spline. */
	strength: number;
	/** calculatedLengthOfCurrentBaseline used for this frame's progress. */
	L: number;
	action: RunnerAction;
}

export interface BaseReach {
	base: BaseIndex;
	frame: number;
}

export interface RunResult {
	/** First frame (from contact) on which the runner counts as on the end base. */
	frame: number;
	/** First frame at the velocity cap, where mashing starts to count. */
	topFrame: number | null;
	/** Distance to the first base on the route, from the start position. */
	L: number;
	k: SpeedConstants;
	trace: FrameState[];
	/** When the runner first counts as on each base along the route. */
	bases: BaseReach[];
	start: [number, number];
}

export interface RunOptions {
	speed: number;
	mash: MashMode;
	path: PathMode;
	/** 0 = batter, 1–3 = runner on that base. */
	startBase: BaseIndex;
	/** Later than startBase; 4 = home. */
	endBase: BaseIndex;
	/** Required when startBase is 0. */
	batterPos?: [number, number];
}

/** LinearInterpolateToNewRange (sub.c): the input fraction is clamped to 0..1. */
function lerpRange(v: number, a: number, b: number, c: number, d: number): number {
	const r = F(b - a);
	let t = r === 0 ? 1 : F(F(v - a) / r);
	t = t > 1 ? 1 : t < 0 ? 0 : t;
	return F(F(F(d - c) * t) + c);
}

const overSpeed = (speed: number, r: SpeedStatRange) => lerpRange(speed, 0, 100, F(r.atSpeed0), F(r.atSpeed100));

/** setRunnerSpeedConstants (roster_init.c). */
export function speedConstants(speed: number): SpeedConstants {
	const s = Math.min(speed, SPEED_STAT_CAP);
	const lo = Math.floor(s / 10) * 10;
	const hi = lo + 10;
	return {
		maxV: lerpRange(s, lo, hi, VEL[lo / 10], VEL[hi / 10]),
		accel: overSpeed(s, RUNNER_SPEED_SCALING.accel),
		maxMash: overSpeed(s, RUNNER_SPEED_SCALING.maxMashBonus),
		perMash: F(1 / overSpeed(s, RUNNER_SPEED_SCALING.pressesToFillMash)),
		decay: F(1 / overSpeed(s, RUNNER_SPEED_SCALING.mashDecayFrames))
	};
}

// running_basePathPosition: one spline per baseline, through 4 of the rounding points (3 for 3B to home).
const LEG_SPLINES = [0, 3, 6, 9].map((start, leg) => makeSpline(BASE_ROUNDING_PATH.slice(start, start + (leg === 3 ? 3 : 4))));
export const roundingPathPoint = (leg: number, pct: number) => LEG_SPLINES[Math.min(leg, 3)](pct);

const dist = (a: [number, number], b: [number, number]) => F(Math.hypot(F(a[0] - b[0]), F(a[1] - b[1])));
const lerp2 = (a: [number, number], b: [number, number], t: number): [number, number] => [
	F(a[0] + F(F(b[0] - a[0]) * t)),
	F(a[1] + F(F(b[1] - a[1]) * t))
];

/** Simulates the run frame by frame from contact (frame 0) until the runner is on endBase. */
export function simulateRun(o: RunOptions): RunResult {
	const k = speedConstants(o.speed);
	const margin = F(BASE_REACH_MARGIN);
	const isBatter = o.startBase === 0;
	const batterPos = o.batterPos ?? BASE_COORDS[0];
	const startFrame = isBatter ? BATTER_RUN_DELAY_FRAMES : RUNNER_AUTO_START_FRAME;
	// running_updateDistAndFramesToClosestBases: the batter's first baseline starts at batterPos.
	const legCoords = (leg: number): [[number, number], [number, number]] => [
		leg === 0 ? batterPos : BASE_COORDS[leg % 4],
		BASE_COORDS[(leg + 1) % 4]
	];

	// Start: the batter at batterPos; a runner on base at a full lead (running_updateLeadoff), cancelled at contact.
	let pct = isBatter ? F(0) : F(F(LEADOFF_PERCENT) + margin);
	let fbr = isBatter ? F(0) : F(o.startBase + pct);
	let pos: [number, number] = isBatter ? batterPos : lerp2(BASE_COORDS[o.startBase], BASE_COORDS[(o.startBase + 1) % 4], pct);
	const start = pos;

	let stamina = MAX_STAMINA;
	let v = F(0);
	let prevV = F(0);
	let m = F(0);
	let since = 0;
	let firstTop: number | null = null;
	let moving = false;
	let restartAfter = startFrame; // first frame the runner may accelerate
	let strength = F(0);
	let batterOverrunCheck = isBatter; // baseRoundingState 1 until running_overrun1BIndicator clears it at 50%
	let standingOn = -1;
	let action: RunnerAction = 'none';
	let actionCD = 0;
	let step = F(0); // percentRanPerFrame
	let leftToReach = F(F(1 - pct) - margin); // percentLeftToNextBaseReach
	const bases: BaseReach[] = [];
	const trace: FrameState[] = [];
	const interval = MASH_INTERVAL[o.mash];

	for (let f = 1; f < 4000; f++) {
		// running_updateStamina (running_beginFrame), from last frame's velocity.
		if (prevV >= F(0.1)) stamina -= 1;
		const ratio = F(1 - F(stamina / MAX_STAMINA));
		const staminaMult = F(1 - F(F(MAX_SPEED_PENALTY) * ratio));
		const accelEffect = F(1 - F(F(MAX_ACCEL_PENALTY) * ratio));

		// running_updateDistAndFramesToClosestBases: baseline coordinates and the distance used for progress.
		const fbrStart = fbr;
		const leg = Math.trunc(fbr);
		let [cur, next] = legCoords(leg);
		const L = F(dist(cur, pos) + dist(next, pos));
		const nextBase = (leg + 1) % 4;

		// running_roundBaseDecision (only when not in a slide), then running_overrun1BIndicator for the batter.
		let rounding = false;
		if (o.path === 'round' && action === 'none') {
			if (!(batterOverrunCheck && leg === 0)) {
				const dontRound = strength === 0 && (pct < F(ROUND_START_PERCENT) || fbr >= 3);
				rounding = !dontRound;
				if (rounding && standingOn >= 0) strength = F(1);
			}
		}
		if (batterOverrunCheck && fbr >= F(0.5)) batterOverrunCheck = false; // ball in the outfield: no 1B overrun

		// running_triggerSlideOrBodyCheck: a runner who isn't rounding slides into any base but 1st.
		if (action === 'none' && !rounding && moving && step > 0 && standingOn < 0 && nextBase !== 1) {
			const framesToBase = Math.trunc(F(leftToReach / step)) + 1;
			if (framesToBase >= SLIDE_MIN_FRAMES && framesToBase <= SLIDE_MAX_FRAMES) {
				action = 'slide';
				actionCD = framesToBase;
			}
		}

		// running_calcSpeedVariables
		const held = f < restartAfter && !moving && action === 'none';
		let cap = F(0);
		if (action === 'slide') {
			// running_updateActionAndVelocity, stage MOVING: cover the rest of the baseline in equal steps.
			actionCD--;
			const excess = F(F(1 - margin) - pct);
			step = actionCD <= 0 ? F(F(0.03) + excess) : F(excess / (actionCD + 1));
			if (actionCD <= 0) {
				action = 'recover';
				actionCD = SLIDE_RECOVERY_FRAMES;
				step = F(0);
				fbr = F(leg + 1);
				pct = F(0);
			}
		} else if (action === 'recover') {
			actionCD--;
			v = F(0);
			step = F(0);
			if (actionCD <= 0) {
				// Recovery over: stop and place on the base (pct = margin), then go again next frame.
				action = 'none';
				moving = false;
				restartAfter = f + 1;
				pct = margin;
				fbr = F(Math.trunc(fbr) + margin);
				[cur, next] = legCoords(Math.trunc(fbr));
			}
		} else if (!held) {
			moving = true;
			const acc = F(k.accel * accelEffect);
			cap = F(F(1) * F(k.maxV * staminaMult)); // runnerSpeedCapMult.normal
			v = F(v + acc);
			let maxed = false;
			if (v > cap) {
				v = cap;
				maxed = true;
			}
			if (maxed) {
				if (firstTop === null) firstTop = f;
				if (interval > 0 && (f - firstTop) % interval === 0) {
					since = MASH_HOLD_FRAMES;
					m = F(m + k.perMash);
					if (m > 1) m = F(1);
				} else if (since !== 0) {
					since--;
				} else {
					m = F(m - k.decay);
					if (m < 0) m = F(0);
				}
				v = F(v + F(m * k.maxMash));
			} else {
				m = F(0);
				since = 0;
			}
			step = F(v * F(1 / L));
		}
		if (step !== 0) {
			const scaled = Math.trunc(F(F(10000) * F(fbr + step)));
			fbr = F(scaled / 10000);
			pct = F((scaled % 10000) / 10000);
		}
		prevV = v;

		// running_updateBaseArrival: crossing a base.
		if (v > 0 && Math.trunc(fbr) > Math.trunc(fbrStart)) {
			const b = Math.trunc(fbr);
			if (rounding || action !== 'none') {
				fbr = F(b); // keeps speed; progress past the base this frame is dropped
				pct = F(0);
			} else {
				// running_stopRunner + running_placeRunnerOnBase: stop, and stand 3% along the next baseline.
				v = F(0);
				prevV = v;
				strength = F(0);
				moving = false;
				restartAfter = f + 1;
				step = F(0);
				pct = margin;
				fbr = F(b + margin);
				[cur, next] = legCoords(b);
			}
		}
		leftToReach = F(F(1 - pct) - margin);
		// baseStandingOn: on a base within the margin either side (only past half a base).
		let reached = -1;
		if (fbr > 0.5) {
			if (fbr >= 4) reached = 4;
			else if (pct <= margin) reached = Math.trunc(fbr);
			else if (pct >= F(1 - margin)) reached = Math.trunc(fbr) + 1;
		}
		standingOn = reached < 0 ? -1 : reached % 4;
		if (reached > o.startBase && !bases.some((r) => r.base === reached)) bases.push({ base: reached, frame: f });

		// running_updatePosition: straight-line position, blended onto the rounding spline while rounding.
		const xF = lerp2(cur, next, pct);
		if (action === 'recover') {
			pos = BASE_COORDS[Math.trunc(fbr) % 4];
		} else if (rounding) {
			if (moving) strength = F(Math.min(1, strength + F(ROUNDING_STRENGTH_PER_FRAME)));
			const vec = roundingPathPoint(Math.trunc(fbr), pct);
			pos = lerp2(xF, vec, strength);
		} else {
			strength = F(0);
			pos = xF;
		}

		trace.push({ f, v, fbr, pct, mash: m, stamina, cap, held, x: pos[0], z: pos[1], strength, L, action });
		if (reached === o.endBase) {
			return { frame: f, topFrame: firstTop, L: legLength(start, o.startBase), k, trace, bases, start };
		}
	}
	throw new Error('Runner never reached the end base');
}

/** The batter running to 1st (no rounding: the 1B overrun logic handles this baseline). */
export function simulateHomeToFirst(speed: number, batterPos: [number, number], mash: MashMode): RunResult {
	return simulateRun({ speed, mash, path: 'straight', startBase: 0, endBase: 1, batterPos });
}

/** batterPos for a spot in a character's box (batter.c box movement + mirroring for left-handers). */
export function batterPosition(charId: number, side: BoxSide, spot: BoxSpot): [number, number] {
	const [p, q] = boxPosition(charId, side, spot);
	const [, , , , offX, offZ] = BATTER_BOX[charId];
	let x = p + offX;
	const z = q + offZ;
	if (side === 'L') x = -x;
	return [x, z];
}

/** g_Batter.boxPosition (x, z) for a spot: the position in the box before the body offset and mirroring. */
export function boxPosition(charId: number, side: BoxSide, spot: BoxSpot): [number, number] {
	const [near, far, front, back] = BATTER_BOX[charId];
	const clamp = (v: number, a: number, b: number) => Math.min(Math.max(v, a), b);
	let p: number;
	let q: number;
	if (spot === 'def') {
		p = clamp(INITIAL_BOX_POSITION[0], near, far);
		q = clamp(INITIAL_BOX_POSITION[1], front, back);
	} else if (spot === 'center') {
		p = (near + far) / 2;
		q = (front + back) / 2;
	} else if (spot === 'best') {
		p = side === 'R' ? far : near;
		q = back;
	} else if (spot === 'worst') {
		p = side === 'R' ? near : far;
		q = front;
	} else {
		// HorizontalRangeFar is next to the plate on both sides once mirrored; VerticalRangeBack is toward the pitcher.
		p = spot === 'fi' || spot === 'bi' ? far : near;
		q = spot === 'fi' || spot === 'fo' ? back : front;
	}
	return [p, q];
}

/** Straight-line distance from a start position to the next base (1st for the batter). */
export function legLength([x, z]: [number, number], fromBase: BaseIndex = 0): number {
	const target = fromBase === 0 ? FIRST_BASE : BASE_COORDS[(fromBase + 1) % 4];
	return Math.hypot(target[0] - x, target[1] - z);
}

export interface ExtremeSpot {
	charId: number;
	side: BoxSide;
	L: number;
	pos: [number, number];
}

/** The closest and farthest starting spots any character's box allows. */
export function extremeSpots(): { best: ExtremeSpot; worst: ExtremeSpot } {
	let best: ExtremeSpot | null = null;
	let worst: ExtremeSpot | null = null;
	for (let charId = 0; charId < BATTER_BOX.length; charId++) {
		for (const side of ['R', 'L'] as const) {
			const bp = batterPosition(charId, side, 'best');
			const wp = batterPosition(charId, side, 'worst');
			const b = legLength(bp);
			const w = legLength(wp);
			if (!best || b < best.L) best = { charId, side, L: b, pos: bp };
			if (!worst || w > worst.L) worst = { charId, side, L: w, pos: wp };
		}
	}
	return { best: best!, worst: worst! };
}

/** The rectangle of batterPos values a character can reach in one box: [xMin, xMax, zMin, zMax]. */
export function batterBoxRect(charId: number, side: BoxSide): [number, number, number, number] {
	const [near, far, front, back, offX, offZ] = BATTER_BOX[charId];
	const xs = [near + offX, far + offX].map((x) => (side === 'L' ? -x : x));
	return [Math.min(...xs), Math.max(...xs), front + offZ, back + offZ];
}

export const framesToSeconds = (frames: number) => (frames / 60).toFixed(2);
