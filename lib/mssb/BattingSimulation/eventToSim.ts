// Maps a stored game event (from /games/events/) to the batting-simulation
// inputs that reproduce the hit, so the visualizer can replay it and "what-if"
// variants can tweak individual inputs from the real baseline.
//
// Coordinate notes:
// - The simulation works in a righty-local frame: lefty world X is negated on
//   the way in (calculateHitGround negates it back when building the path).
// - The batter's plate position is not stored in the DB, but contact_absolute
//   (the game's 0-200 contact-spot value) is, so posX is recovered by
//   inverting the CalculatedBallPos formula from calculateContact().

import tables from './battingConstants.json';
import type { HitBallInputs } from './calcBatting';

const BATTER_HITBOXES = (tables as any).BATTER_HITBOXES as {
	HorizontalRangeNear: number;
	HorizontalRangeFar: number;
}[];

export interface EventCgsRef {
	char_id: number;
	team_id: number;
	roster_loc: number;
	captain: boolean;
	superstar: boolean;
	batting_hand: boolean; // true = lefty (HAND_BOOL in the stat-file decoders)
	fielding_hand: boolean;
}

export interface EventContact {
	type_of_contact: number;
	charge_power_up: number;
	charge_power_down: number;
	star_swing_five_star: number;
	input_direction: number;
	input_direction_stick: number;
	frame_of_swing_upon_contact: number;
	ball_power: number;
	ball_vert_angle: number;
	ball_horiz_angle: number;
	contact_absolute: number;
	contact_quality: number;
	rng1: number;
	rng2: number;
	rng3: number;
	ball_x_velocity: number;
	ball_y_velocity: number;
	ball_z_velocity: number;
	ball_x_contact_pos: number;
	ball_z_contact_pos: number;
	ball_x_landing_pos: number;
	ball_y_landing_pos: number;
	ball_z_landing_pos: number;
	ball_max_height: number;
	ball_hang_time: number;
	primary_result: number;
	secondary_result: number;
	fielding: {
		fielder: EventCgsRef | null;
		position: number;
		action: number;
		jump: number;
		bobble: number;
		swap: boolean;
		manual_select: number;
		fielder_x_pos: number;
		fielder_y_pos: number;
		fielder_z_pos: number;
	} | null;
}

export interface EventPitch {
	pitch_type: number; // 0 curve, 1 charge, 2 changeup
	charge_pitch_type: number; // 0 n/a, 2 slider, 3 perfect
	star_pitch: number;
	pitch_speed: number;
	d_ball: boolean;
	ball_position_strikezone: number;
	in_strikezone: boolean;
	type_of_swing: number; // 0 none, 1 slap, 2 charge, 3 star, 4 bunt
	bat_x_contact_pos: number;
	bat_z_contact_pos: number;
	contact: EventContact | null;
}

export interface EventRunner {
	char_id: number;
	roster_loc: number;
	initial_base: number;
	result_base: number;
	out_type: number;
	out_location: number;
	steal: number;
}

export interface GameEvent {
	event_num: number;
	inning: number;
	half_inning: number; // 0 top (away bats), 1 bottom (home bats)
	away_score: number;
	home_score: number;
	balls: number;
	strikes: number;
	outs: number;
	chem_links_ob: number;
	star_chance: number;
	away_stars: number;
	home_stars: number;
	pitcher_stamina: number;
	result_num_of_outs: number;
	result_rbi: number;
	result_of_ab: number;
	batter: EventCgsRef;
	pitcher: EventCgsRef;
	catcher: EventCgsRef;
	runners: {
		batter: EventRunner | null;
		first: EventRunner | null;
		second: EventRunner | null;
		third: EventRunner | null;
	};
	pitch: EventPitch | null;
}

export interface GameEventsResponse {
	game_id: number;
	events: GameEvent[];
}

// input_direction_stick bitmask (INPUT_DIRECTION in the stat-file decoders).
export function decodeStick(mask: number): {
	stick_left: boolean;
	stick_right: boolean;
	stick_down: boolean;
	stick_up: boolean;
} {
	return {
		stick_left: (mask & 1) !== 0,
		stick_right: (mask & 2) !== 0,
		stick_down: (mask & 4) !== 0,
		stick_up: (mask & 8) !== 0
	};
}

// DB pitch columns -> hit_ball pitch_type (0 curve, 1 charge, 2 perfect charge, 3 changeup)
export function simPitchType(pitch: EventPitch): number {
	if (pitch.pitch_type === 1) return pitch.charge_pitch_type === 3 ? 2 : 1;
	if (pitch.pitch_type === 2) return 3;
	return 0;
}

// DB type_of_swing -> hit_ball hit_type (0 slap, 1 charge, 2 star, 3 bunt)
export function simHitType(typeOfSwing: number): number {
	switch (typeOfSwing) {
		case 2:
			return 1;
		case 3:
			return 2;
		case 4:
			return 3;
		default:
			return 0;
	}
}

// Invert calculateContact()'s CalculatedBallPos to recover the batter's plate
// X from the stored contact_absolute. Returned in the same frame as ballX.
export function recoverBatterX(
	charId: number,
	isLefty: boolean,
	ballXLocal: number,
	contactAbsolute: number
): number {
	const hitbox = BATTER_HITBOXES[charId];
	const flippedDiff =
		contactAbsolute >= 100
			? ((contactAbsolute - 100) / 100) * hitbox.HorizontalRangeFar
			: ((100 - contactAbsolute) / 100) * hitbox.HorizontalRangeNear;
	const diff = isLefty ? -flippedDiff : flippedDiff;
	return ballXLocal - diff;
}

// Build simulation inputs that replay a stored contact event exactly.
export function eventToHitInputs(event: GameEvent): HitBallInputs | null {
	const pitch = event.pitch;
	const contact = pitch?.contact;
	if (!pitch || !contact) return null;

	const isLefty = event.batter.batting_hand;
	// World -> righty-local: the simulation negates lefty X back on output.
	const ballXLocal = isLefty ? -contact.ball_x_contact_pos : contact.ball_x_contact_pos;
	const batterStars = event.half_inning === 0 ? event.away_stars : event.home_stars;

	return {
		batter_id: event.batter.char_id,
		is_batter_captain: event.batter.captain,
		pitcher_id: event.pitcher.char_id,
		easy_batting: false,
		handedness: isLefty ? 1 : 0,
		batter_x: recoverBatterX(event.batter.char_id, isLefty, ballXLocal, contact.contact_absolute),
		ball_x: ballXLocal,
		ball_z: contact.ball_z_contact_pos,
		chem: event.chem_links_ob,
		num_stars: batterStars,
		hit_type: simHitType(pitch.type_of_swing),
		is_star_hit: pitch.type_of_swing === 3,
		is_starred: event.batter.superstar,
		pitch_type: simPitchType(pitch),
		charge_up: contact.charge_power_up,
		charge_down: contact.charge_power_down,
		frame: contact.frame_of_swing_upon_contact,
		...decodeStick(contact.input_direction_stick),
		rand_1: contact.rng1,
		rand_2: contact.rng2,
		rand_3: contact.rng3
	};
}
