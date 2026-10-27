// Constants for the batter-runner model, copied from the mssb-dtk decompilation.
// Each table names the symbol and source file it comes from.

/** runnerVelocityLookup (gameplay_tables.c): top speed in metres/frame, one entry per 10 speed (0–210). */
export const RUNNER_VELOCITY_LOOKUP = [
	0.132, 0.135, 0.137, 0.139, 0.141, 0.143, 0.145, 0.148, 0.151, 0.154, 0.157, 0.16, 0.164, 0.168, 0.173,
	0.176, 0.179, 0.182, 0.185, 0.188, 0.19, 0.19
];

/** A value interpolated over speed stat 0..100 by setRunnerSpeedConstants (clamped outside that range). */
export interface SpeedStatRange {
	atSpeed0: number;
	atSpeed100: number;
}

/** runnerSpeedScaling (gameplay_tables.c): the speed-dependent runner constants. */
export const RUNNER_SPEED_SCALING: Record<'accel' | 'turnAccel' | 'maxMashBonus' | 'pressesToFillMash' | 'mashDecayFrames', SpeedStatRange> = {
	/** baseAcceleration, metres/frame² */
	accel: { atSpeed0: 0.01, atSpeed100: 0.005 },
	/** baseAccelerationWhileChangingDirection */
	turnAccel: { atSpeed0: 0.005, atSpeed100: 0.005 },
	/** maxMashVeloAdjustment: speed bonus at a full mash meter, metres/frame */
	maxMashBonus: { atSpeed0: 0.02, atSpeed100: 0.02 },
	/** percentAddedPerMash = 1 / this */
	pressesToFillMash: { atSpeed0: 5, atSpeed100: 5 },
	/** mashDecayPerFrame = 1 / this */
	mashDecayFrames: { atSpeed0: 20, atSpeed100: 20 }
};

/** baseCoordsForRunning[1] (gameplay_tables.c): 1st base in metres (x toward 1st, z toward 2nd). */
export const FIRST_BASE: [number, number] = [18.8, 19.4];

/** batterRunDelayFrames (character_constants.c): frames after contact before the batter may move. */
export const BATTER_RUN_DELAY_FRAMES = 30;
/** runnerTimingConsts.mashHoldFrames: frames a mash press holds the bonus before it decays. */
export const MASH_HOLD_FRAMES = 6;
/** runnerTimingConsts.maxStamina */
export const MAX_STAMINA = 4000;
/** runnerStaminaConsts.maxSpeedPenalty / maxAccelPenalty, applied at zero stamina. */
export const MAX_SPEED_PENALTY = 0.3;
export const MAX_ACCEL_PENALTY = 0.5;
/** baseReachMargin_forwards: a runner counts as on the base this fraction of the baseline early. */
export const BASE_REACH_MARGIN = 0.03;
/** initializeInMemRunner caps the runner's speed stat. */
export const SPEED_STAT_CAP = 200;
/** superstarStatBonus.Speed: added to the speed stat when a character is starred. */
export const SUPERSTAR_SPEED_BONUS = 50;
/** initialBoxPosition (x, z): g_Batter.boxPosition at the start of every at-bat, before clamping. */
export const INITIAL_BOX_POSITION: [number, number] = [0, 0.4];

/**
 * One BatterHitbox row (character_constants.c), keeping the fields that place the batter.
 * boxPosition is clamped to [near, far] × [front, back]; batterPos = boxPosition + offset (x mirrored for left-handers).
 */
export type BatterBox = [
	near: number, // HorizontalRangeNear
	far: number, // HorizontalRangeFar
	front: number, // VerticalRangeFront
	back: number, // VerticalRangeBack
	offsetX: number, // batOffsetFromBatterX
	offsetZ: number // batOffsetFromBatterZ
];

/**
 * Speed stat for each character ID (unstarred). Source: pyrio constants/character_attributes.csv;
 * its batter's-box columns match BatterHitbox above, which cross-checks the table.
 */
export const CHARACTER_SPEED = [
	50, 60, 40, 70, 50, 40, 90, 70, 80, 10, 30, 40, 40, 60, 40, 90, 40, 40, 60, 40, 60, 20, 10, 10, 70, 60, 60,
	30, 40, 70, 60, 60, 50, 20, 10, 10, 10, 30, 10, 60, 50, 70, 30, 60, 50, 40, 40, 40, 40, 30, 30, 30, 20, 30
];

/** BatterHitbox placement fields, indexed by character ID. */
export const BATTER_BOX: BatterBox[] = [
	[-0.65, 0.55, -0.2, 1.5, -2.1, -1], // 0
	[-0.65, 0.65, 0.3, 1.9, -1.8, -1], // 1
	[-0.55, 0.65, 0.4, 1.4, -2.65, -1], // 2
	[-0.55, 0.55, -0.3, 1.8, -1.7, -1], // 3
	[-0.75, 0.5, 0.1, 1.5, -1.9, -1.3], // 4
	[-0.65, 0.6, -0.2, 1.6, -2, -1.3], // 5
	[-0.65, 0.65, 0.2, 1.5, -2.05, -1], // 6
	[-0.75, 0.55, -0.1, 1.7, -1.8, -1.3], // 7
	[-0.65, 0.55, -0.1, 1.8, -1.9, -1.15], // 8
	[-0.55, 1.45, 0.1, 0.2, -3.6, -1], // 9
	[-0.55, 0.75, 0.4, 1.5, -2.4, -1.6], // 10
	[-0.55, 0.85, 0.3, 1.5, -2.3, -1], // 11
	[-0.5, 0.55, -0.2, 1.6, -2.15, -1], // 12
	[-0.95, 0.55, -0.1, 1.8, -1.7, -1], // 13
	[-0.45, 0.85, -0.1, 1.6, -2.4, -1], // 14
	[-0.65, 0.5, -0.1, 1.7, -1.8, -1], // 15
	[-0.55, 0.65, -0.1, 1.4, -2.5, -1], // 16
	[-0.55, 0.55, 0.1, 1.8, -1.9, -1], // 17
	[-0.55, 0.85, 0.3, 1.4, -2.5, -1], // 18
	[-0.65, 0.65, 0.2, 1.4, -2.5, -1], // 19
	[-0.55, 0.65, -0.2, 1.6, -2.2, -1], // 20
	[-0.45, 0.85, 0.5, 1.3, -2.3, -1], // 21
	[-0.45, 0.85, 0.5, 1.3, -2.3, -1], // 22
	[-0.45, 0.85, 0.5, 1.3, -2.3, -1], // 23
	[-0.65, 0.65, 0.1, 1.4, -2, -1.2], // 24
	[-0.65, 0.65, 0.1, 1.4, -2, -1.2], // 25
	[-0.65, 0.65, 0.1, 1.4, -2, -1.2], // 26
	[-0.65, 0.65, -0.2, 1.2, -1.7, -1], // 27
	[-0.65, 0.55, -0.1, 1.6, -1.75, -1], // 28
	[-0.45, 0.45, -0.6, 1.2, -1.7, -1], // 29
	[-0.45, 0.45, -0.6, 1.2, -1.7, -1], // 30
	[-0.45, 0.45, -0.6, 1.2, -1.7, -1], // 31
	[-0.45, 0.45, -0.6, 1.2, -1.7, -1], // 32
	[-0.6, 0.7, -0.2, 1.5, -2, -1], // 33
	[-0.6, 0.7, -0.2, 1.5, -2, -1], // 34
	[-0.6, 0.7, -0.2, 1.5, -2, -1], // 35
	[-0.6, 0.7, -0.2, 1.5, -2, -1], // 36
	[-0.65, 0.65, -0.1, 1.8, -2.3, -1], // 37
	[-0.65, 0.65, -0.2, 1.2, -1.9, -1.4], // 38
	[-0.65, 0.55, 0.2, 1.7, -1.6, -1], // 39
	[-0.55, 0.55, 0, 1.5, -2.1, -1], // 40
	[-0.55, 0.55, -0.2, 1.4, -2.3, -1], // 41
	[-0.5, 0.55, -0.2, 1.6, -2.15, -1], // 42
	[-0.55, 0.65, -0.2, 1.6, -2.1, -1], // 43
	[-0.55, 0.65, -0.1, 1.4, -2.5, -1], // 44
	[-0.55, 0.65, -0.1, 1.4, -2.5, -1], // 45
	[-0.55, 0.65, -0.1, 1.4, -2.5, -1], // 46
	[-0.55, 0.65, -0.1, 1.4, -2.5, -1], // 47
	[-0.75, 0.55, -0.1, 1.3, -1.9, -1.1], // 48
	[-0.75, 0.55, -0.1, 1.3, -1.9, -1.1], // 49
	[-0.75, 0.55, -0.1, 1.3, -1.9, -1.1], // 50
	[-0.75, 0.55, -0.1, 1.3, -1.9, -1.1], // 51
	[-0.65, 0.65, -0.2, 1.2, -1.7, -1], // 52
	[-0.65, 0.65, -0.2, 1.2, -1.7, -1], // 53
];

// ---- Running the bases ----

/** baseCoordsForRunning (gameplay_tables.c): home, 1B, 2B, 3B in metres. */
export const BASE_COORDS: [number, number][] = [
	[0.4, 0.3],
	[18.8, 19.4],
	[0, 38.7],
	[-18.5, 19.3]
];

/** baseRoundingPathPoints[0] (gameplay_tables.c): spline control points for rounding the bases in normal games. */
export const BASE_ROUNDING_PATH: [number, number][] = [
	[0, 0],
	[12.5, 10.5],
	[18, 16.5],
	[18.8, 19.4],
	[18.6, 22],
	[3, 37.5],
	[0, 38.7],
	[-3, 38.7],
	[-17.5, 22],
	[-18.5, 19.3],
	[-18.5, 17.5],
	[0.4, 0.3],
	[0, 0]
];

/** leadoffDistancePercent: runners on base lead off this fraction of the baseline (plus BASE_REACH_MARGIN) every pitch. */
export const LEADOFF_PERCENT = 0.1;
/** running_getDirectionOverride sends every runner forward on this framesSinceHit. */
export const RUNNER_AUTO_START_FRAME = 5;
/** running_roundBaseDecision: rounding can start once the runner is this far along a baseline. */
export const ROUND_START_PERCENT = 0.5;
/** roundingStrengthPerFrame: how fast the runner blends from the straight line onto the rounding spline. */
export const ROUNDING_STRENGTH_PER_FRAME = 0.012;
/** runnerCharConsts slide window and recovery (the same for every character). */
export const SLIDE_MIN_FRAMES = 16;
export const SLIDE_MAX_FRAMES = 22;
export const SLIDE_RECOVERY_FRAMES = 25;

/** overrun1BPathPoints (gameplay_tables.c): spline the batter follows when overrunning 1B. */
export const OVERRUN_1B_PATH: [number, number][] = [
	[18.8, 19.4],
	[23, 22],
	[25.1, 22.5]
];
/** overrun1BStageFrames: frames running out along the overrun spline, then frames returning to 1B. */
export const OVERRUN_1B_SLOWDOWN_FRAMES = 60;
export const OVERRUN_1B_RETURN_FRAMES = 120;
