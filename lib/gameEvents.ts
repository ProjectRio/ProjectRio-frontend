// Shapes the raw per-pitch event stream from /games/events/ into the
// at-bat-by-at-bat structure the game page renders.

import type { GameEvent } from './mssb/BattingSimulation/eventToSim';

export interface AtBat {
	// All events in this plate appearance, in order. The last one carries the result.
	events: GameEvent[];
	final: GameEvent;
	inning: number;
	halfInning: number; // 0 top (away bats), 1 bottom (home bats)
	// Score AFTER the at-bat resolves (the event stores the score before it).
	awayScoreAfter: number;
	homeScoreAfter: number;
	starChance: boolean;
}

export interface HalfInningGroup {
	inning: number;
	halfInning: number;
	atBats: AtBat[];
}

// Consecutive events belong to one at-bat until result_of_ab > 0 closes it.
export function groupAtBats(events: GameEvent[]): AtBat[] {
	const atBats: AtBat[] = [];
	let current: GameEvent[] = [];

	for (const event of events) {
		current.push(event);
		if (event.result_of_ab > 0) {
			const final = event;
			const awayRbi = final.half_inning === 0 ? final.result_rbi : 0;
			const homeRbi = final.half_inning === 1 ? final.result_rbi : 0;
			atBats.push({
				events: current,
				final,
				inning: final.inning,
				halfInning: final.half_inning,
				awayScoreAfter: final.away_score + awayRbi,
				homeScoreAfter: final.home_score + homeRbi,
				starChance: current.some((e) => e.star_chance !== 0)
			});
			current = [];
		}
	}
	// A quit-out game can leave a dangling unfinished at-bat; drop it.
	return atBats;
}

export function groupByHalfInning(atBats: AtBat[]): HalfInningGroup[] {
	const groups: HalfInningGroup[] = [];
	for (const ab of atBats) {
		const last = groups[groups.length - 1];
		if (last && last.inning === ab.inning && last.halfInning === ab.halfInning) {
			last.atBats.push(ab);
		} else {
			groups.push({ inning: ab.inning, halfInning: ab.halfInning, atBats: [ab] });
		}
	}
	return groups;
}

export type ResultCategory = 'hr' | 'hit' | 'out' | 'walk' | 'error' | 'other';

// Event.result_of_ab -> display category (see AT_BAT_RESULTS in lib/mssb/constants).
export function resultCategory(resultOfAb: number): ResultCategory {
	switch (resultOfAb) {
		case 0xa:
			return 'hr';
		case 0x7:
		case 0x8:
		case 0x9:
		case 0xd:
			return 'hit';
		case 0x2:
		case 0x3:
			return 'walk';
		case 0xb:
		case 0xc:
			return 'error';
		case 0x1:
		case 0x4:
		case 0x5:
		case 0x6:
		case 0xe:
		case 0xf:
		case 0x10:
			return 'out';
		default:
			return 'other';
	}
}

export const RESULT_COLORS: Record<ResultCategory, string> = {
	hr: '#ffd23f',
	hit: '#34d399',
	out: '#8f8fa3',
	walk: '#4f9dff',
	error: '#c084fc',
	other: '#c9c9d6'
};

export type PitchOutcome = 'ball' | 'strike' | 'foul' | 'in-play' | 'result' | 'event';

// What did this pitch do to the count? Derived by comparing with the next
// event in the same at-bat (the DB stores the count BEFORE each pitch).
export function pitchOutcome(event: GameEvent, next: GameEvent | null): PitchOutcome {
	if (event.result_of_ab > 0) {
		const category = resultCategory(event.result_of_ab);
		if (category === 'walk') return 'ball';
		return event.pitch?.contact ? 'in-play' : 'result';
	}
	if (!event.pitch || event.pitch.type_of_swing === 0) {
		if (next && next.balls > event.balls) return 'ball';
		if (next && next.strikes > event.strikes) return 'strike';
		return 'event';
	}
	if (next) {
		if (next.balls > event.balls) return 'ball';
		if (next.strikes > event.strikes) return 'strike';
		// Contact but the count didn't advance: two-strike foul (or foul catch).
		return event.pitch.contact ? 'foul' : 'event';
	}
	return 'event';
}

// Exact linescore derived from the event stream (each event stores the score
// BEFORE it). The API's include_linescore reconstruction counts scoring
// runners and miscounts some games, so prefer this when events are loaded.
export function linescoreFromEvents(
	events: GameEvent[],
	finalAway: number,
	finalHome: number
): [(number | 'X')[], (number | 'X')[]] {
	const halves: { inning: number; half: number; away: number; home: number }[] = [];
	for (const e of events) {
		const last = halves[halves.length - 1];
		if (!last || last.inning !== e.inning || last.half !== e.half_inning) {
			halves.push({ inning: e.inning, half: e.half_inning, away: e.away_score, home: e.home_score });
		}
	}

	const away: (number | 'X')[] = [];
	const home: (number | 'X')[] = [];
	for (let i = 0; i < halves.length; i++) {
		const h = halves[i];
		const next = halves[i + 1];
		const endAway = next ? next.away : finalAway;
		const endHome = next ? next.home : finalHome;
		if (h.half === 0) away[h.inning - 1] = endAway - h.away;
		else home[h.inning - 1] = endHome - h.home;
	}

	const innings = Math.max(away.length, home.length);
	for (let i = 0; i < innings; i++) {
		if (away[i] === undefined) away[i] = 0;
		// The home side of the final inning may never happen (home already led).
		if (home[i] === undefined) home[i] = i === innings - 1 ? 'X' : 0;
	}
	return [away, home];
}

// Does this event carry a visualizable ball flight?
export function hasBallFlight(event: GameEvent): boolean {
	const contact = event.pitch?.contact;
	return !!contact && contact.ball_x_landing_pos != null && contact.type_of_contact !== 255;
}
