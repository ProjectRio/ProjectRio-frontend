/**
 * The mod catalog: which game tables the editor exposes and the human-facing metadata the decomp
 * cannot provide (descriptions, axis labels, min/max/step, default values).
 *
 * Addresses, element types, array dimensions and struct field offsets are NOT written here. They come
 * from the MSSB decomp (`config/GYQE01/** /symbols.txt` + `include/**`) via `npm run sync-mods`, which
 * writes `generated/symbols.json`. See README.md in this directory for how to add a table.
 */
import { characters } from '@/lib/data/characters';
import { batterReachDefaults } from './defaults/batterReaches';
import {
	captainStarVerticalAngleDefaults,
	curveEffectDefaults,
	exitVelocityDefaults,
	horizontalAngleDefaults,
	nonCaptainStarVerticalAngleDefaults,
	trajMultiplierDefaults,
	verticalAngleDefaults,
	verticalProbabilityDefaults
} from './defaults/battingTables';
import { characterStatDefaults } from './defaults/characterStats';
import { chemistryDefaults } from './defaults/chemistry';
import { bobbleChanceDefaults, fielderHitboxDefaults, hitboxScalerDefaults } from './defaults/fieldingTables';
import type { AxisDef, ColumnMeta, ModDef, ModGroup } from './types';

/** Where `npm run sync-mods` reads game data from. Bump `ref` to pick up new decomp labels. */
export const MODDING_SOURCE = {
	repo: 'ProjectRio/ProjectRio-Modding',
	ref: '6bcb1fb7aea8ff521b4fc472d5c226a29da5b234', // LittleCoaks-Mods, 2026-09-02
	/** Path of the decomp submodule inside that repo. */
	submodule: 'Decomp'
};

export const GROUP_ORDER: ModGroup[] = ['characters', 'batting', 'pitching', 'fielding'];

export const GROUPS: Record<ModGroup, { title: string; description: string }> = {
	characters: {
		title: 'Characters',
		description: 'Per-character stat tables and the chemistry grid.'
	},
	batting: {
		title: 'Batting',
		description: 'Bat reach, exit velocity, launch angle ranges and probabilities, and hit physics constants.'
	},
	pitching: {
		title: 'Pitching',
		description: 'Pitch speed, windups, stamina, the strike zone and star pitch behaviour.'
	},
	fielding: {
		title: 'Fielding',
		description: 'Fielder hitboxes, hitbox scalers and bobble chances.'
	}
};

const CHARACTERS = Array.from({ length: 54 }, (_, id) => characters[String(id)]);
const CHARACTER_AXIS: AxisDef = { name: 'Character', labels: CHARACTERS, kind: 'character' };
const CONTACT_AXIS: AxisDef = { name: 'Contact', labels: ['Right Sour', 'Right Nice', 'Perfect', 'Left Nice', 'Left Sour'] };
const RANGE_COLUMNS: ColumnMeta[] = [{ label: 'Lower Bound Angle' }, { label: 'Upper Bound Angle' }];
const CAPTAINS = ['Mario', 'Luigi', 'Wario', 'Waluigi', 'DK', 'Diddy', 'Bowser', 'Bowser Jr', 'Yoshi', 'Birdo', 'Peach', 'Daisy'];

const BYTE_ANGLE_NOTE =
	'Angles are byte angles out of 4096 rather than 360 degrees: multiply degrees by 4096/360. Negative values are allowed.';

const stat = (label: string, min: number, max: number, description?: string): ColumnMeta => {
	const meta: ColumnMeta = { label, min, max, step: 1 };
	if (description) meta.description = description;
	return meta;
};

export const catalog: ModDef[] = [
	// -----------------------------------------------------------------------
	// Characters
	// -----------------------------------------------------------------------
	{
		kind: 'table',
		id: 'character-stats',
		group: 'characters',
		title: 'Character Stats',
		description:
			'The base stat table for every character: pitching, batting, running and fielding numbers, plus captain and star swing settings.',
		notes: ['Fielding abilities are a set of flags; the game reads them as one 32-bit value.'],
		// The decomp models the static table region as padding, so the layout is declared here using
		// the decomp's own CharacterStats type (the same one it uses for the in-memory roster). That
		// struct computes to 0x9E bytes from its offset comments, but the game steps 0xA0 per character
		// (inMemRoster is 18 × 0xA0 in symbols.txt), hence the explicit stride.
		source: { symbol: 'Static_Stats_Tables', declare: { type: 'CharacterStats', dims: [54], stride: 0xa0 }, path: '[].stats' },
		axes: [CHARACTER_AXIS],
		columns: {
			CurveBallSpeed: stat('Curve Ball Speed', 1, 255),
			FastBallSpeed: stat('Fast Ball Speed', 1, 255),
			cursedBall: stat('Cursed Ball', 1, 255),
			Curve: stat('Curve', 1, 255),
			curveControl: stat('Curve Control', 1, 255),
			FieldingStats: { label: 'Fielding Abilities' },
			FieldingArm: stat('Fielding Arm', 0, 1),
			BattingStance: { label: 'Batting Stance', display: 'select', enum: 'BATTING_HAND' },
			SlapContactSize: stat('Slap Contact Size', 1, 255),
			ChargeContactSize: stat('Charge Contact Size', 1, 255),
			SlapHitPower: stat('Slap Power', 1, 255),
			ChargeHitPower: stat('Charge Power', 1, 255),
			BuntingContactSize: stat('Bunting', 1, 255),
			HitTrajectoryPushPull: stat('Hit Trajectory (Push/Pull)', 0, 2),
			HitTrajectoryHighLow: stat('Hit Trajectory (High/Low)', 0, 2),
			Speed: stat('Speed', 1, 255),
			ThrowingArm: stat('Throwing Arm', 1, 255),
			CharacterClass: { label: 'Class', display: 'select' },
			Weight: stat('Weight', 0, 4),
			Captain: stat('Captain', 0, 1),
			CaptainStarHitPitch: stat('Captain Star Skill', 0, 12, 'Which captain star swing and pitch the character uses.'),
			NonCaptainStarSwing: { label: 'Star Swing', display: 'select', enum: 'REGULAR_STAR_SWING' },
			NonCaptainStarPitch: stat('Star Pitch', 1, 3),
			BattingStatBar: stat('Batting Stat Bar', 1, 10),
			PitchingStatBar: stat('Pitching Stat Bar', 1, 10),
			RunningStatBar: stat('Running Stat Bar', 1, 10),
			FieldingStatBar: stat('Fielding Stat Bar', 1, 10)
		},
		defaults: characterStatDefaults,
		randomize: { min: 1, max: 100 }
	},
	{
		kind: 'table',
		id: 'chemistry',
		group: 'characters',
		title: 'Chemistry',
		description: 'Chemistry between every pair of characters. Rows are the character, columns are their teammate.',
		source: { symbol: 'Static_Stats_Tables', declare: { type: 'CharacterStats', dims: [54], stride: 0xa0 }, path: '[].chemistry' },
		axes: [CHARACTER_AXIS],
		allColumns: { labels: CHARACTERS, kind: 'character', min: 0, max: 99, step: 1 },
		defaults: chemistryDefaults,
		randomize: { min: 1, max: 100 }
	},

	// -----------------------------------------------------------------------
	// Batting
	// -----------------------------------------------------------------------
	{
		kind: 'table',
		id: 'batter-reaches',
		group: 'batting',
		title: 'Batter Ranges',
		description: 'How far each character can reach with the bat, where the easy-batting spot sits, and batting box movement.',
		source: { symbol: 'BatterHitbox' },
		axes: [CHARACTER_AXIS],
		columns: {
			HorizontalRangeNear: { label: 'Horizontal Reach Near', step: 0.01 },
			HorizontalRangeFar: { label: 'Horizontal Reach Far', step: 0.01 },
			VerticalRangeFront: { label: 'Vertical Reach Front', step: 0.01 },
			VerticalRangeBack: { label: 'Vertical Reach Back', step: 0.01 },
			batOffsetFromBatterX: { label: 'Easy Batting Spot X', step: 0.01 },
			batOffsetFromBatterZ: { label: 'Easy Batting Spot Z', step: 0.01 },
			BoxMoveSpeed: { label: 'Box Movement Speed', step: 0.01 },
			PitchingHeight: { label: 'Pitch Height', step: 0.01 },
			TrimmedBat: {
				label: 'Trimmed Bat',
				type: 'word',
				min: 0,
				max: 1,
				step: 1,
				description: 'Written as a whole-number word (0 or 1), matching the original generator, although the decomp types the slot as a float.'
			}
		},
		defaults: batterReachDefaults,
		randomize: { min: -5, max: 5 }
	},
	{
		kind: 'table',
		id: 'exit-velocity',
		group: 'batting',
		title: 'Exit Velocity',
		description:
			'Hit exit velocity is drawn from a range chosen by the contact quality. Each hit and contact type also adds a gravity factor; negative values make the ball fall faster.',
		source: { symbol: 'BallHitArray', declare: { type: 's16', dims: [2, 5, 3] } },
		axes: [
			{ name: 'Hit type', labels: ['Slap', 'Charge / Moonshot'] },
			CONTACT_AXIS,
			{ name: 'Value', labels: ['Lower Bound Power', 'Upper Bound Power', 'Added Gravity Factor'] }
		],
		defaults: exitVelocityDefaults
	},
	{
		kind: 'table',
		id: 'horizontal-angles',
		group: 'batting',
		title: 'Horizontal Angle Ranges',
		description:
			'The horizontal launch angle depends on the stick input, the swing type and the frame of contact. Frames count down until the ball passes the batter, so frame 10 is the earliest swing and frame 2 the latest.',
		notes: [
			'Slaps use frames 2 to 10; charge swings use frames 3 to 9.',
			BYTE_ANGLE_NOTE,
			'0 points straight at the pitcher. Positive angles go to the third-base side, negative to the first-base side.'
		],
		source: { symbol: 'BattingAngleRanges', declare: { type: 's16', dims: [3, 2, 15, 2] } },
		axes: [
			{ name: 'Stick input', labels: ['No Input', 'Pull Input', 'Push Input'] },
			{ name: 'Swing', labels: ['Slap', 'Charge'] },
			{ name: 'Frame', labels: Array.from({ length: 15 }, (_, i) => `Frame ${i}`) },
			{ name: 'Bound', labels: ['Lower Bound Angle', 'Upper Bound Angle'] }
		],
		defaults: horizontalAngleDefaults
	},
	{
		kind: 'table',
		id: 'horizontal-power-multipliers',
		group: 'batting',
		title: 'Horizontal Power Multipliers',
		description: "A character's horizontal trajectory type sets a power multiplier based on which part of the field the ball is hit to.",
		source: { symbol: 'horizTrajPowerMultipliers', declare: { type: 'f32', dims: [3, 5] } },
		axes: [
			{ name: 'Character trajectory', labels: ['Mid', 'Push', 'Pull'] },
			{ name: 'Field zone', labels: ['Full Pull Side', 'Pull-Center', 'Center Field', 'Push-Center', 'Full Push Side'] }
		],
		valueMeta: { min: 0, max: 5, step: 0.01 },
		defaults: trajMultiplierDefaults
	},
	{
		kind: 'table',
		id: 'curve-effects',
		group: 'batting',
		title: 'Curve Effects',
		description: "A character's curve type sets how much the ball accelerates sideways and along the field while in the air.",
		source: { symbol: 's_ballCurveData' },
		axes: [{ name: 'Curve type', labels: ['Normal', 'Super Curve'] }],
		columns: {
			x: { label: 'Curve Dampening Factor', min: 0, max: 5, step: 0.001 },
			y: { label: 'X Acceleration Factor', min: 0, max: 1, step: 0.001 },
			z: { label: 'Z Acceleration Factor', min: 0, max: 1, step: 0.001 }
		},
		defaults: curveEffectDefaults
	},
	{
		kind: 'table',
		id: 'vertical-angles',
		group: 'batting',
		title: 'Vertical Angle Ranges',
		description:
			'The launch angle of a regular hit is picked between a lower and upper bound chosen by the hit type, the contact quality, and a range selected by a separate random roll (see Vertical Angle Probabilities).',
		notes: [BYTE_ANGLE_NOTE],
		source: { symbol: 'HitVertTrajRanges' },
		axes: [
			{ name: 'Hit type', labels: ['Slap', 'Charge / Moonshot'] },
			CONTACT_AXIS,
			{ name: 'Range', labels: ['Range 0', 'Range 1', 'Range 2', 'Range 3', 'Range 4'] },
			{ name: 'Bound', labels: ['Lower Bound Angle', 'Upper Bound Angle'] }
		],
		columnMeta: RANGE_COLUMNS,
		defaults: verticalAngleDefaults
	},
	{
		kind: 'table',
		id: 'vertical-probabilities',
		group: 'batting',
		title: 'Vertical Angle Probabilities',
		description:
			'On contact the game picks one of five vertical trajectory ranges. These weights control how likely each range is; they do not need to add up to 100.',
		notes: [
			'Easy batting has the same weights as regular batting in the unmodified game. Since the game tells them apart, this can give player 1 and player 2 different odds.'
		],
		source: { symbol: 'BattingVerticalAngleRangeProbabilities' },
		axes: [
			{ name: 'Trajectory', labels: ['High', 'Mid', 'Low'] },
			{ name: 'Hit type', labels: ['Slap', 'Charge'] },
			{ name: 'Batting mode', labels: ['Regular Batting', 'Easy Batting'] },
			CONTACT_AXIS
		],
		columns: {
			bottom: { label: 'Range 0 (bottom)', min: 0, max: 255 },
			low: { label: 'Range 1 (low)', min: 0, max: 255 },
			mid: { label: 'Range 2 (mid)', min: 0, max: 255 },
			high: { label: 'Range 3 (high)', min: 0, max: 255 },
			top: { label: 'Range 4 (top)', min: 0, max: 255 }
		},
		defaults: verticalProbabilityDefaults
	},
	{
		kind: 'table',
		id: 'captain-star-vertical-angles',
		group: 'batting',
		title: 'Captain Star Swing Angles',
		description: 'Launch angle bounds for each captain star swing, by contact quality.',
		notes: [BYTE_ANGLE_NOTE],
		source: { symbol: 'CaptainStarSwingBattingVerticalAngleRanges' },
		axes: [{ name: 'Captain star', labels: CAPTAINS }, CONTACT_AXIS, { name: 'Bound', labels: ['Lower Bound Angle', 'Upper Bound Angle'] }],
		defaults: captainStarVerticalAngleDefaults
	},
	{
		kind: 'table',
		id: 'star-swing-vertical-angles',
		group: 'batting',
		title: 'Non-Captain Star Swing Angles',
		description: 'Launch angle bounds for the pop fly, grounder and line drive star swings, by contact quality.',
		notes: [BYTE_ANGLE_NOTE],
		source: { symbol: 'NonCaptainStarSwingBattingVerticalAngleRanges' },
		axes: [
			{ name: 'Star swing', labels: ['Pop Fly', 'Grounder', 'Line Drive'] },
			CONTACT_AXIS,
			{ name: 'Bound', labels: ['Lower Bound Angle', 'Upper Bound Angle'] }
		],
		defaults: nonCaptainStarVerticalAngleDefaults
	},
	{
		kind: 'constants',
		id: 'batting-constants',
		group: 'batting',
		title: 'Batting Constants',
		description: 'Global batting physics, charge timing, star costs and star hit behaviour.',
		entries: [
			{ source: { symbol: 'g_hitFloats', path: 'overChargeLerpBtwnSlapAndChargePower' }, label: 'On overcharge, interpolation between charge and slap hit power', default: 0.5, min: 0, max: 1, step: 0.01 },
			{ source: { symbol: 'g_hitFloats', path: 'regularBoxSpeedMult' }, label: 'Box movement speed modifier', default: 1, min: 0, max: 10, step: 0.1 },
			{ source: { symbol: 'g_hitFloats', path: 'centeringBoxSpeedMult' }, label: 'Box movement speed modifier when centering (R press)', default: 3, min: 0, max: 10, step: 0.1 },
			{ source: { symbol: 'g_hitFloats', path: 'moonshotMult' }, label: 'Moonshot (5 star) power multiplier', default: 1.5, min: 0, max: 10, step: 0.01 },
			{ source: { symbol: 'g_hitFloats', path: 'minStarHitVelo' }, label: 'Minimum star hit velocity', default: 0.05, min: 0, max: 10, step: 0.01 },
			{ source: { symbol: 'g_hitShorts', path: 'frameChargeDownEnds' }, label: 'Frame fully overcharged', default: 180, min: 0, max: 500 },
			{ source: { symbol: 'g_hitShorts', path: 'framesUntilChargeIsEnabled' }, label: 'Frames holding A until a charge hit is enabled', default: 12, min: 0, max: 500 },
			{ source: { symbol: 'g_hitShorts', path: 'regularHitGamePause' }, label: 'Frames paused on contact: regular hit', default: 1, min: 0, max: 500 },
			{ source: { symbol: 'g_hitShorts', path: 'captainStarHitGamePause' }, label: 'Frames paused on contact: captain star hit', default: 50, min: 0, max: 500 },
			{ source: { symbol: 'g_hitShorts', path: 'moonshotGamePause' }, label: 'Frames paused on contact: moonshot (5 star)', default: 50, min: 0, max: 500 },
			{ source: { address: 0x807b5c00, type: 'byte' }, label: 'Air resistance', default: 40, min: 0, max: 255 },
			{ source: { address: 0x807b5bfc, type: 'float' }, label: 'Gravity', default: 0.00275, min: 0, max: 1, step: 0.00001 },
			{ source: { address: 0x807b70f0, type: 'float' }, label: '% of final hit power that is fixed (not tied to contact quality)', default: 0.8, min: 0, max: 1, step: 0.01 },
			{ source: { address: 0x807adb20, type: 'float' }, label: 'Global power adjustment', default: 0.5, min: 0, max: 4, step: 0.01 },
			{ source: { symbol: 'chemBobbleMults', path: '[2]', declare: { type: 'f32', dims: [8] } }, label: 'Chemistry power boost 1', default: 1.05, min: 0, max: 5, step: 0.01 },
			{ source: { symbol: 'chemBobbleMults', path: '[3]', declare: { type: 'f32', dims: [8] } }, label: 'Chemistry power boost 2', default: 1.1, min: 0, max: 5, step: 0.01 },
			{ source: { symbol: 'chemBobbleMults', path: '[4]', declare: { type: 'f32', dims: [8] } }, label: 'Chemistry power boost 3', default: 1.2, min: 0, max: 5, step: 0.01 },
			{ source: { symbol: 'starPowerCosts', path: 'moonShotCost' }, label: 'Maximum team stars (moonshot cost)', default: 5, min: 0, max: 255 },
			{ source: { symbol: 'starPowerCosts', path: 'captainStarCost' }, label: 'Stars spent: captain star swing/pitch with the captain', default: 1, min: 0, max: 5 },
			{ source: { symbol: 'starPowerCosts', path: 'nonCaptain_CaptainStarCost' }, label: 'Stars spent: captain star swing/pitch with a non-captain', default: 2, min: 0, max: 5 },
			{ source: { symbol: 'starPowerCosts', path: 'regularStarCost' }, label: 'Stars spent: non-captain star swing/pitch', default: 1, min: 0, max: 5 },
			{ source: { symbol: 'g_hitShorts', path: 'fireballStunFrames' }, label: 'Fire star hit: stun frames', default: 90, min: 0, max: 500 },
			{ source: { symbol: 'g_hitShorts', path: 'FrameWhenPeachHitAppearsAgain' }, label: 'Peach star hit: frames before landing when the ball is visible again', description: 'Unverified.', default: 1, min: 0, max: 200 },
			{ source: { symbol: 'g_hitShorts', path: 'FrameWhenDaisyHitAppearsAgain' }, label: 'Daisy star hit: frames before landing when the ball is visible again', description: 'Unverified.', default: 1, min: 0, max: 200 },
			{ source: { symbol: 'g_hitFloats', path: 'DKStarAngleDelta' }, label: 'Banana star hit: direction change each frame (radians)', default: 0.008, min: 0, max: 1, step: 0.001 },
			{ source: { symbol: 'g_hitFloats', path: 'DKStarHangtimePercentStart' }, label: 'Banana star hit: % of hangtime when the curve starts', default: 0.25, min: 0, max: 1, step: 0.01 },
			{ source: { symbol: 'g_hitFloats', path: 'DKStarHangtimePercentEnd' }, label: 'Banana star hit: % of hangtime when the curve ends', default: 0.95, min: 0, max: 1, step: 0.01 },
			{ source: { symbol: 'g_hitShorts', path: 'framesBeforeGroundWhenGarlicSplits' }, label: 'Garlic / Eggplant star hit: frames before the ground when the ball splits', default: 120, min: 0, max: 500 },
			{ source: { symbol: 'g_hitFloats', path: 'garlicSpreadLower' }, label: 'Garlic / Eggplant star hit: spread angle lower bound (radians)', default: 0.2, min: 0, max: 1, step: 0.01 },
			{ source: { symbol: 'g_hitFloats', path: 'garlicSpreadUpper' }, label: 'Garlic / Eggplant star hit: spread angle upper bound (radians)', default: 0.3, min: 0, max: 1, step: 0.01 },
			{ source: { symbol: 'g_hitFloats', path: 'bulletStarEnergyMultiplier' }, label: 'Bullet star hit: pushback factor', default: 4, min: 0, max: 50, step: 0.01 },
			{ source: { symbol: 'g_hitFloats', path: 'eggVeloMaintainedOnBounce' }, label: 'Egg star hit: velocity kept after each bounce', default: 0.8, min: 0, max: 1, step: 0.01 },
			{ source: { symbol: 'g_hitShorts', path: 'NEggBounces' }, label: 'Egg star hit: number of bounces', default: 2, min: 0, max: 20 }
		]
	},

	// -----------------------------------------------------------------------
	// Pitching
	// -----------------------------------------------------------------------
	{
		kind: 'constants',
		id: 'pitching-constants',
		group: 'pitching',
		title: 'Pitching Constants',
		description: 'Pitch speed, windups, perfect pitches, tired pitchers, the strike zone and star pitch behaviour.',
		notes: [
			'The Bowser and Bowser Jr. loop values keep the original generator’s layout of four bytes each; the decomp records the block as twelve bytes, so that pairing is unverified.'
		],
		entries: [
			{ source: { address: 0x807b5a7c, type: 'float' }, label: 'Pitcher movement speed on the mound', default: 0.08, min: 0, max: 1, step: 0.01 },
			{ source: { symbol: 'pitchSpeedScaler', path: '[0]', declare: { type: 'f32', dims: [12] } }, label: 'Pitch speed scaler', default: 240, min: 0, max: 1000, step: 1 },
			{ source: { symbol: 'pitchSpeedScaler', path: '[1]', declare: { type: 'f32', dims: [12] } }, label: 'Air resistance factor', default: 0.998, min: 0, max: 5, step: 0.001 },
			{ source: { address: 0x807b9682, type: 'short' }, label: 'Charge windup duration', default: 100, min: 0, max: 255 },
			{ source: { address: 0x807b9684, type: 'short' }, label: 'Curve windup duration', default: 60, min: 0, max: 255 },
			{ source: { address: 0x807b7540, type: 'short' }, label: 'Perfect pitch frame window (frames until the pitch is released)', default: 15, min: 0, max: 255 },
			{ source: { address: 0x807b7530, type: 'float' }, label: 'Perfect pitch speed scaler', default: 1.05, min: 0, max: 3, step: 0.01 },
			{ source: { address: 0x807b752c, type: 'float' }, label: 'Slider speed: proportion between the fastball and curve speed stats', default: 0.85, min: 0, max: 3, step: 0.01 },
			{ source: { address: 0x807b7528, type: 'float' }, label: 'Cursed ball modifier (charge, changeup, fastball star, changeup star)', default: 1, min: 0, max: 5, step: 0.01 },
			{ source: { address: 0x807b751c, type: 'float' }, label: 'Curve control modifier (charge, changeup, fastball star, changeup star)', default: 1, min: 0, max: 5, step: 0.01 },
			{ source: { address: 0x807b7510, type: 'float' }, label: 'Curve modifier (charge, changeup, fastball star, changeup star)', default: 0.02, min: 0, max: 5, step: 0.01 },
			{ source: { address: 0x807b74e6, type: 'short' }, label: 'Tired pitcher curve reduction factor (curve pitches only)', default: 99, min: 0, max: 100 },
			{ source: { address: 0x807b74e8, type: 'short' }, label: 'Tired pitcher speed reduction factor (charge pitches only)', default: 20, min: 0, max: 100 },
			{ source: { address: 0x807b74ea, type: 'short' }, label: 'Tired pitcher curve control reduction factor', default: 100, min: 0, max: 100 },
			{ source: { address: 0x807b74ec, type: 'short' }, label: 'Tired pitcher cursed ball reduction factor', default: 100, min: 0, max: 100 },
			{ source: { address: 0x807b74dc, type: 'short' }, label: 'Starting stamina', default: 10, min: 0, max: 100 },
			{ source: { address: 0x807b74e2, type: 'short' }, label: 'Tired stamina threshold', default: 4, min: 0, max: 10 },
			{ source: { symbol: 'strikeZone', path: '[0]', declare: { type: 'f32', dims: [6] } }, label: 'Strike zone left side', default: -0.53, min: -3, max: 3, step: 0.01 },
			{ source: { symbol: 'strikeZone', path: '[1]', declare: { type: 'f32', dims: [6] } }, label: 'Strike zone right side', default: 0.53, min: -3, max: 3, step: 0.01 },
			{ source: { symbol: 'strikeZone', path: '[2]', declare: { type: 'f32', dims: [6] } }, label: 'Strike zone front (where the game starts checking for strikes)', default: 1.05, min: -1, max: 10, step: 0.01 },
			{ source: { symbol: 'strikeZone', path: '[3]', declare: { type: 'f32', dims: [6] } }, label: 'Strike zone back (where the game stops checking for strikes)', default: 0.5, min: -1, max: 10, step: 0.01 },
			{ source: { symbol: 'strikeZone', path: '[4]', declare: { type: 'f32', dims: [6] } }, label: 'Pitch peak height', description: 'Unverified.', default: 0.7, min: 0, max: 10, step: 0.1 },
			{ source: { symbol: 'eggConstants', path: '[0]', declare: { type: 'f32', dims: [8] } }, label: 'Egg star pitch: bounce height', default: 0.35, min: 0, max: 5, step: 0.01 },
			{ source: { symbol: 'eggConstants', path: '[1]', declare: { type: 'f32', dims: [8] } }, label: 'Egg star pitch: first bounce distance lower bound', default: 7, min: 0, max: 18.5, step: 0.1 },
			{ source: { symbol: 'eggConstants', path: '[2]', declare: { type: 'f32', dims: [8] } }, label: 'Egg star pitch: first bounce distance upper bound', default: 9, min: 0, max: 18.5, step: 0.1 },
			{ source: { symbol: 'eggConstants', path: '[3]', declare: { type: 'f32', dims: [8] } }, label: 'Egg star pitch: first bounce side-to-side range', default: 1, min: 0, max: 10, step: 0.1 },
			{ source: { symbol: 'eggConstants', path: '[4]', declare: { type: 'f32', dims: [8] } }, label: 'Egg star pitch: second bounce distance lower bound', default: 3, min: 0, max: 18.5, step: 0.1 },
			{ source: { symbol: 'eggConstants', path: '[5]', declare: { type: 'f32', dims: [8] } }, label: 'Egg star pitch: second bounce distance upper bound', default: 5, min: 0, max: 18.5, step: 0.1 },
			{ source: { symbol: 'eggConstants', path: '[6]', declare: { type: 'f32', dims: [8] } }, label: 'Egg star pitch: second bounce side-to-side range', default: 1, min: 0, max: 10, step: 0.1 },
			{ source: { symbol: 'eggConstants', path: '[7]', declare: { type: 'f32', dims: [8] } }, label: 'Egg star pitch: ending side-to-side range', default: 0.3, min: 0, max: 10, step: 0.1 },
			{ source: { address: 0x807b757c, type: 'short' }, label: 'Egg star pitch: initial speed lower bound', default: 80, min: 0, max: 32767 },
			{ source: { address: 0x807b757e, type: 'short' }, label: 'Egg star pitch: initial speed upper bound', default: 80, min: 0, max: 32767 },
			{ source: { address: 0x807b7580, type: 'short' }, label: 'Egg star pitch: parabolic constant lower bound', default: 55, min: 0, max: 32767 },
			{ source: { address: 0x807b7582, type: 'short' }, label: 'Egg star pitch: parabolic constant upper bound', default: 60, min: 0, max: 32767 },
			{ source: { symbol: 'bulletBallConstants', path: '[0]', declare: { type: 'u8', dims: [12] } }, label: 'Bowser star pitch: loop duration lower bound', default: 20, min: 0, max: 255 },
			{ source: { symbol: 'bulletBallConstants', path: '[1]', declare: { type: 'u8', dims: [12] } }, label: 'Bowser star pitch: loop duration upper bound', default: 35, min: 0, max: 255 },
			{ source: { symbol: 'bulletBallConstants', path: '[2]', declare: { type: 'u8', dims: [12] } }, label: 'Bowser star pitch: loop starting frame lower bound', default: 40, min: 0, max: 255 },
			{ source: { symbol: 'bulletBallConstants', path: '[3]', declare: { type: 'u8', dims: [12] } }, label: 'Bowser star pitch: loop starting frame upper bound', default: 55, min: 0, max: 255 },
			{ source: { symbol: 'bulletBallConstants', path: '[4]', declare: { type: 'u8', dims: [12] } }, label: 'Bowser Jr. star pitch: loop duration lower bound', default: 25, min: 0, max: 255 },
			{ source: { symbol: 'bulletBallConstants', path: '[5]', declare: { type: 'u8', dims: [12] } }, label: 'Bowser Jr. star pitch: loop duration upper bound', default: 38, min: 0, max: 255 },
			{ source: { symbol: 'bulletBallConstants', path: '[6]', declare: { type: 'u8', dims: [12] } }, label: 'Bowser Jr. star pitch: loop starting frame lower bound', default: 30, min: 0, max: 255 },
			{ source: { symbol: 'bulletBallConstants', path: '[7]', declare: { type: 'u8', dims: [12] } }, label: 'Bowser Jr. star pitch: loop starting frame upper bound', default: 55, min: 0, max: 255 },
			{ source: { symbol: 'pitchSpeedScaler', path: '[8]', declare: { type: 'f32', dims: [12] } }, label: 'Peach star pitch: % of flight when the ball disappears', default: 0, min: 0, max: 1, step: 0.01 },
			{ source: { symbol: 'pitchSpeedScaler', path: '[9]', declare: { type: 'f32', dims: [12] } }, label: 'Daisy star pitch: % of flight when the ball disappears', default: 0, min: 0, max: 1, step: 0.01 },
			{ source: { symbol: 'pitchSpeedScaler', path: '[10]', declare: { type: 'f32', dims: [12] } }, label: 'Peach star pitch: % of flight when the ball reappears', default: 0.99, min: 0, max: 1, step: 0.01 },
			{ source: { symbol: 'pitchSpeedScaler', path: '[11]', declare: { type: 'f32', dims: [12] } }, label: 'Daisy star pitch: % of flight when the ball reappears', default: 0.99, min: 0, max: 1, step: 0.01 }
		]
	},

	// -----------------------------------------------------------------------
	// Fielding
	// -----------------------------------------------------------------------
	{
		kind: 'table',
		id: 'fielder-hitboxes',
		group: 'fielding',
		title: 'Fielder Hitboxes',
		description:
			'Catch radii, heights and dive ranges per character. A hitbox is Global Scaler × Character Scaler × value, then clamped to Global Scaler × the matching minimum.',
		// The decomp's extent is 55 rows: 54 characters plus one row of minimums (see Hitbox Minimums).
		source: { symbol: 'FielderHitboxConsts', declare: { type: 's16', dims: [55, 8] } },
		axes: [
			{ name: 'Character', labels: [...CHARACTERS, null], kind: 'character' },
			{
				name: 'Hitbox',
				labels: [
					'Air / Hard Grounder Radius',
					'Slow Grounder Radius',
					'Air / Hard Grounder Centered Radius',
					'Height',
					'Reaching Up / Down',
					'Unknown',
					'Dive Range',
					'Infield Dive Height'
				]
			}
		],
		columnMeta: [
			{ label: 'Air / Hard Grounder Radius', description: 'Radius around a fielder to catch a ball in the air or a fast-moving grounder.' },
			{ label: 'Slow Grounder Radius', description: 'Radius around a fielder to catch a slow-moving grounder.' },
			{ label: 'Air / Hard Grounder Centered Radius', description: 'Fly balls and fast grounders caught within this radius have lower bobble chances.' },
			{ label: 'Height', description: "Height of the fielder's hitbox." },
			{ label: 'Reaching Up / Down', description: 'Related to the reaching up or down animation.' },
			{ label: 'Unknown' },
			{ label: 'Dive Range', description: "Extra range between the fielder's position and the landing spot when diving." },
			{ label: 'Infield Dive Height', description: "When diving for a line drive, the ball's trajectory must be lower than this where its ground position is within dive range." }
		],
		valueMeta: { min: 0, max: 32767, step: 1 },
		defaults: fielderHitboxDefaults
	},
	{
		kind: 'table',
		id: 'hitbox-scalers',
		group: 'fielding',
		title: 'Character Hitbox Scalers',
		description: 'Per-character multiplier applied to every fielding hitbox value.',
		source: { symbol: 'charSizeMultipliers' },
		axes: [CHARACTER_AXIS, { name: 'Scaler', labels: ['Hitbox Scaler', null] }],
		columnMeta: [{ label: 'Hitbox Scaler', min: 0, max: 10, step: 0.01 }],
		defaults: hitboxScalerDefaults
	},
	{
		kind: 'constants',
		id: 'hitbox-constants',
		group: 'fielding',
		title: 'Hitbox Minimums and Scalers',
		description: 'The global hitbox scaler and the minimum values a scaled hitbox is clamped to.',
		entries: [
			{ source: { symbol: '_0_01_HitboxScaleMultiplier', declare: { type: 'f32' } }, label: 'Global hitbox scaler', default: 0.01, min: 0, max: 2, step: 0.01 },
			// The minimums are the 55th row of the fielder hitbox table.
			{ source: { symbol: 'FielderHitboxConsts', declare: { type: 's16', dims: [55, 8] }, path: '[54][0]' }, label: 'Air / hard grounder radius minimum', default: 70, min: 0, max: 32767 },
			{ source: { symbol: 'FielderHitboxConsts', declare: { type: 's16', dims: [55, 8] }, path: '[54][1]' }, label: 'Height minimum', default: 80, min: 0, max: 32767 },
			{ source: { symbol: 'FielderHitboxConsts', declare: { type: 's16', dims: [55, 8] }, path: '[54][4]' }, label: 'Dive range minimum', default: 0, min: 0, max: 32767 },
			{ source: { symbol: 'FielderHitboxConsts', declare: { type: 's16', dims: [55, 8] }, path: '[54][5]' }, label: 'Infield dive height minimum', default: 250, min: 0, max: 32767 }
		]
	},
	{
		kind: 'table',
		id: 'bobble-chances',
		group: 'fielding',
		title: 'Bobble Chances',
		description: 'How likely a fielder is to bobble a catch, by stadium type, character class, how the ball is moving and how the catch is made.',
		source: { symbol: 'BobbleArray', declare: { type: 'u8', dims: [2, 4, 2, 3] } },
		axes: [
			{ name: 'Stadium', labels: ['Regular', 'Toy Field'] },
			{ name: 'Character class', labels: ['Balance', 'Power', 'Speed', 'Technique'] },
			{ name: 'Ball movement', labels: ['Fly Ball or Fast-Moving Grounder', 'Slow-Moving Grounder'] },
			{ name: 'Catch type', labels: ['Centered', 'Side', 'Dive / Running Catch'] }
		],
		valueMeta: { min: 0, max: 100, step: 1 },
		defaults: bobbleChanceDefaults
	}
];
