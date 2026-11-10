// In-game character attributes, sourced from the decompiled stat table that the
// batting simulation already ships (battingConstants.json STATS — indexed by
// char id). This module is the read-only "baseball card" view of that data.

import battingConstants from '../mssb/BattingSimulation/battingConstants.json';
import { characterIdFromName } from './characters';

export interface CharacterAttributes {
	'Char Id': number;
	Name: string;
	'Curve Ball Speed': number;
	'Fast Ball Speed': number;
	'Cursed Ball': number;
	Curve: number;
	'Curve Control': number;
	'Slap Contact Spot Size': number;
	'Charge Contact Spot Size': number;
	'Slap Hit Power': number;
	'Charge Hit Power': number;
	Bunting: number;
	Speed: number;
	'Throwing Arm': number;
	Weight: number;
	'Batting Stat Bar': number;
	'Pitching Stat Bar': number;
	'Running Stat Bar': number;
	'Fielding Stat Bar': number;
	'Can Be Captain': number;
	'Fielding Ability': number;
	'Character Class': number;
	'Horizontal Hit Trajectory': number;
	'Vertical Hit Trajectory': number;
}

export const characterAttributes = (battingConstants as { STATS: CharacterAttributes[] }).STATS;

export function attributesFor(name: string): CharacterAttributes | null {
	const id = characterIdFromName(name);
	return id !== null ? (characterAttributes[Number(id)] ?? null) : null;
}

// The four in-game "stat bar" ratings (out of 10) shown on the character select
// screen — the at-a-glance shape of a character.
export interface StatBarSet {
	label: string;
	value: number;
}

export function statBars(attrs: CharacterAttributes): StatBarSet[] {
	return [
		{ label: 'Batting', value: attrs['Batting Stat Bar'] },
		{ label: 'Pitching', value: attrs['Pitching Stat Bar'] },
		{ label: 'Running', value: attrs['Running Stat Bar'] },
		{ label: 'Fielding', value: attrs['Fielding Stat Bar'] }
	];
}
