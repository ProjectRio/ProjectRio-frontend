import { characters } from './data/characters';

// Fielding position ids as reported by the live game endpoint.
export const FIELD_POSITIONS = ['P', 'C', '1B', '2B', '3B', 'SS', 'LF', 'CF', 'RF'] as const;

export interface LiveRosterSlot {
	rosterIdx: number;
	charId: number;
	name: string;
	positionId: number;
	position: string;
	isCaptain: boolean;
	isSuperstar: boolean;
}

export interface LiveTeam {
	side: 'home' | 'away';
	player: string;
	logoId: number;
	score: number;
	stars: number;
	slots: LiveRosterSlot[];
	allSuperstars: boolean;
}

export function parseLiveTeam(game: any, side: 'home' | 'away'): LiveTeam {
	const charIds: number[] =
		game[`${side}_char_ids`] ?? Array.from({ length: 9 }, (_, i) => game[`${side}_roster_${i}_char`]);
	const positions: number[] = game[`${side}_fielding_positions`] ?? [];
	const superstars: number[] = game[`${side}_superstars`] ?? [];

	const slots: LiveRosterSlot[] = charIds.map((charId, i) => ({
		rosterIdx: i,
		charId,
		name: characters[String(charId)] ?? `Char ${charId}`,
		positionId: positions[i] ?? -1,
		position: FIELD_POSITIONS[positions[i]] ?? '?',
		isCaptain: game[`${side}_captain`] === i,
		isSuperstar: !!superstars[i]
	}));

	return {
		side,
		player: game[`${side}_player`],
		logoId: game[`${side}_logo`],
		score: game[`${side}_score`] ?? 0,
		stars: game[`${side}_stars`] ?? 0,
		slots,
		allSuperstars: slots.length > 0 && slots.every((slot) => slot.isSuperstar)
	};
}

// batter_hand: 0 = right-handed, 1 = left-handed.
export function handLabel(hand: number): string {
	return hand === 1 ? 'L' : 'R';
}

export function inningsPitched(outsPitched: number): string {
	return `${Math.floor(outsPitched / 3)}.${outsPitched % 3}`;
}

// What a roster slot is doing right now, if anything ("At Bat", "On 2B", "Pitching").
export function slotStatus(game: any, team: LiveTeam, rosterIdx: number): string | null {
	const batting = (game.half_inning === 0) === (team.side === 'away');
	if (batting) {
		if (game.batter === rosterIdx) return 'At Bat';
		if (game.runner_on_first && game.runner_on_first_roster === rosterIdx) return 'On 1B';
		if (game.runner_on_second && game.runner_on_second_roster === rosterIdx) return 'On 2B';
		if (game.runner_on_third && game.runner_on_third_roster === rosterIdx) return 'On 3B';
	} else if (game.pitcher === rosterIdx) {
		return 'Pitching';
	}
	return null;
}
