import { characters } from './data/characters';
import { teamName, teamImage } from './data/teamNames';
import type { GameSummary, TagSet } from './api';

// Finished games: roster is an object of char ids; captain is a character name.
export function recentTeamImage(game: GameSummary, side: 'home' | 'away'): string {
	const roster = game[`${side}_roster`];
	if (roster) {
		const names = Object.values(roster).map((charId: any) => characters[charId]);
		const team = teamName(names, game[`${side}_captain`] ?? '');
		if (team) return teamImage(team);
	}
	return `/images/Characters/${game[`${side}_captain`]}.png`;
}

// Live games: roster is flattened as `<side>_roster_<i>_char`; captain is a roster index.
export function liveTeamImage(game: any, side: 'home' | 'away'): string {
	const roster: string[] = [];
	for (let i = 0; i < 9; i++) {
		roster.push(characters[game[`${side}_roster_${i}_char`]]);
	}
	const captain = characters[game[`${side}_roster_${game[`${side}_captain`]}_char`]];
	const team = teamName(roster, captain);
	return team ? teamImage(team) : `/images/Characters/${captain}.png`;
}

export function liveCharacter(game: any, side: 'home' | 'away', role: 'batter' | 'pitcher'): string {
	return characters[game[`${side}_roster_${game[role]}_char`]] ?? '';
}

export function inningDisplay(game: GameSummary): string {
	return game.innings_played === game.innings_selected ? '' : `(${game.innings_played}/${game.innings_selected})`;
}

export function didHomeWin(game: GameSummary): boolean {
	return game.home_score > game.away_score;
}

export function eloChange(game: GameSummary, side: 'home' | 'away'): { before: number; after: number } | null {
	const won = didHomeWin(game) === (side === 'home');
	const before = won ? game.winner_incoming_elo : game.loser_incoming_elo;
	const after = won ? game.winner_result_elo : game.loser_result_elo;
	if (before === undefined || after === undefined) return null;
	return { before, after };
}

export function basesImage(first: boolean, second: boolean, third: boolean): string {
	return `/images/Bases/R${(first ? '1' : '') + (second ? '2' : '') + (third ? '3' : '')}.png`;
}

export function outsDisplay(outs: number): string {
	return '●'.repeat(Math.min(outs, 3)) + '○'.repeat(Math.max(3 - outs, 0));
}

export function tagSetName(tagsets: TagSet[], id: number): string {
	return tagsets.find((t) => t.id === id)?.name ?? '';
}

export function ordinal(n: number): string {
	const tens = n % 100;
	if (tens >= 11 && tens <= 13) return `${n}th`;
	return n + (['th', 'st', 'nd', 'rd'][n % 10] ?? 'th');
}
