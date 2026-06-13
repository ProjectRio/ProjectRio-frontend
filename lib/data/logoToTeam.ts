export const logoIdToTeamName: Record<number, string> = {
	0x0: 'Mario Sunshines',
	0x1: 'Mario All Stars',
	0x2: 'Mario Fireballs',
	0x3: 'Mario Heroes',
	0x4: 'Luigi Mansioneers',
	0x5: 'Luigi Leapers',
	0x6: 'Luigi Vacuums',
	0x7: 'Luigi Gentlemen',
	0x8: 'Peach Monarchs',
	0x9: 'Peach Princesses',
	0xa: 'Peach Dynasties',
	0xb: 'Peach Roses',
	0xc: 'Daisy Queen Bees',
	0xd: 'Daisy Petals',
	0xe: 'Daisy Cupids',
	0xf: 'Daisy Lillies',
	0x10: 'Yoshi Islanders',
	0x11: 'Yoshi Flutters',
	0x12: 'Yoshi Speed Stars',
	0x13: 'Yoshi Eggs',
	0x14: 'Birdo Bows',
	0x15: 'Birdo Fans',
	0x16: 'Birdo Models',
	0x17: 'Birdo Beauties',
	0x18: 'Wario Greats',
	0x19: 'Wario Beasts',
	0x1a: 'Wario Steakheads',
	0x1b: 'Wario Garlics',
	0x1c: 'Waluigi Flankers',
	0x1d: 'Waluigi Mashers',
	0x1e: 'Waluigi Smart Alecks',
	0x1f: 'Waluigi Mystiques',
	0x20: 'DK Kongs',
	0x21: 'DK Animals',
	0x22: 'DK Wild Ones',
	0x23: 'DK Explorers',
	0x24: 'Diddy Tails',
	0x25: 'Diddy Red Caps',
	0x26: 'Diddy Ninjas',
	0x27: 'Diddy Survivors',
	0x28: 'Bowser Monsters',
	0x29: 'Bowser Black Stars',
	0x2a: 'Bowser Blue Shells',
	0x2b: 'Bowser Flames',
	0x2c: 'Jr Pixies',
	0x2d: 'Jr Rookies',
	0x2e: 'Jr Bombers',
	0x2f: 'Jr Fangs'
};

export function teamNameFromLogo(logoId: number): string {
	return logoIdToTeamName[logoId] ?? `Team ${logoId}`;
}

export function logoImage(logoId: number): string {
	const name = logoIdToTeamName[logoId];
	if (!name) return '/images/RioLogo.png';
	// The asset for this one team drops the space in its filename.
	const file = name === 'Waluigi Smart Alecks' ? 'Waluigi SmartAlecks' : name;
	return `/images/Teams/${file}.png`;
}
