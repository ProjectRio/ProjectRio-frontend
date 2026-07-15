// Game-domain enums / constants from MSSB itself.

// Event.result_of_ab codes -> human label (mirrors the game's cAtBatResult map).
export const AT_BAT_RESULTS: Record<number, string> = {
	0x0: 'None',
	0x1: 'Strikeout',
	0x2: 'Walk (BB)',
	0x3: 'Walk (HBP)',
	0x4: 'Out',
	0x5: 'Caught',
	0x6: 'Caught line-drive',
	0x7: 'Single',
	0x8: 'Double',
	0x9: 'Triple',
	0xa: 'HR',
	0xb: 'Error (Input)',
	0xc: 'Error (Chem)',
	0xd: 'Bunt',
	0xe: 'Sac Fly',
	0xf: 'Ground-ball Double Play',
	0x10: 'Foul Catch'
};

export function atBatResultName(code: number): string {
	return AT_BAT_RESULTS[code] ?? '';
}
