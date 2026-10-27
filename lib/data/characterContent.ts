// Community-authored character content: executive-summary writeups and the
// official community tier lists.
//
// WRITEUPS ARE DRAFT PLACEHOLDERS. The commissioned community writeups slot in
// here — replace `text` (and set `author`) per character as they arrive. Keyed
// by SimplifiedName so one writeup covers all color variants.

import { characters, characterClasses } from './characters';

export interface CharacterWriteup {
	text: string;
	author?: string;
}

export const characterWriteups: { [simplifiedName: string]: CharacterWriteup } = {
	Bowser: {
		text: 'The consensus best captain in the game with stars off. His charge swing erases mistakes over any wall, his weight makes him nearly impossible to beat in a collision, and a lineup built around him bats with permanent scoring pressure. You pay for it in team speed and defense — and pay it gladly.'
	},
	Petey: {
		text: 'The best non-captain bat in the game and the anchor of nearly every serious lineup. Enormous power from both swing types with reach that turns bad pitches into base hits. Station him somewhere the ball rarely goes, and let him work.'
	},
	Bro: {
		text: 'The Hammer Bro is the premium glove on the market: a cannon arm, huge fielding reach, and real pop at the plate. Chemistry-proof value — he makes any nine better without asking for links in return.'
	},
	DK: {
		text: 'The alternative power captain. Big charge power and a wide contact zone make him one of the most reliable extra-base threats in the game, and his arm plays anywhere on the diamond. Slower than he looks, and he looks slow.'
	},
	Birdo: {
		text: 'A complete two-way piece: heavy contact with legitimate power at the plate and one of the better non-captain pitching kits in the game. Birdo lineups rarely have a hole to attack.'
	},
	Yoshi: {
		text: 'The gold standard for the speed class. Elite contact, elite range, and base-running that manufactures runs out of ground balls. The rare speed pick that never feels like a compromise.'
	},
	Boo: {
		text: 'A curveball that bends physics and the control to place it anywhere. Boo wins innings before the batter swings. Light bat, but the run prevention pays the rent.'
	},
	'King Boo': {
		text: 'Everything Boo does with a real bat attached. Massive curve, sneaky power, and enough weight to shrug off contact plays. One of the best value picks per roster slot.'
	},
	Magikoopa: {
		text: 'A technique pitcher with a deep bag: sharp curve, deceptive speed changes, and warp-assisted fielding coverage. At the plate he is a liability you accept for the innings he steals.'
	},
	Waluigi: {
		text: 'Reach for days. Waluigi covers the plate like few others, drives mistakes with real charge power, and brings a usable curveball. A staple of stars-off lineups that want offense without giving up the mound.'
	},
	Wario: {
		text: 'A pure bat with a wide barrel and heavy hands. Wario punishes anything left in the zone. Fielding and speed are liabilities, so hide him well.'
	},
	Toadsworth: {
		text: 'The sneakiest hitter in the game — a technique frame with genuine pull power and elite bunting. Ages well in long sets when opponents forget to respect the swing.'
	},
	Luigi: {
		text: 'The balanced captain who actually pitches. A real curveball, dependable contact, and no exploitable weakness. Luigi teams win close games on fundamentals.'
	},
	Mario: {
		text: 'The benchmark. Solid contact, respectable power, average speed, average arm — Mario is the line every other character is measured against. Never the reason you lose; rarely the reason you win.'
	},
	Pianta: {
		text: 'A heavyweight bat and one of the strongest arms in the game. Piantas hit the ball hard and throw it harder, at the cost of foot speed that measures in geological time.'
	},
	Dixie: {
		text: 'Technique-class contact with ponytail-glide fielding that covers gaps other characters concede. A glue piece: chemistry-friendly, versatile, and quietly excellent in the outfield.'
	},
	Noki: {
		text: 'Quick, compact, and consistent. Noki puts the ball in play, takes the extra base, and holds down a middle-infield spot without drama.'
	},
	Diddy: {
		text: 'One of the best gloves in the game — speed, reach, and an accurate release. The bat is light, so his value lives on defense and the base paths.'
	},
	Toad: {
		text: 'The classic utility speedster. Toads slap, bunt, and run, turning small ball into real runs. No power to speak of, but five colors of dependable.'
	},
	'Dry Bones': {
		text: 'Great wheels, elite bunting, and a fearless glove. Dry Bones is a small-ball engine and a chemistry hub for villain lineups. Keep the throws short — the arm is the weak joint.'
	},
	Toadette: {
		text: 'A contact-and-bunt specialist who beats out infield hits and keeps innings alive. Defensively fragile, so slot her where the ball is quiet.'
	},
	Paratroopa: {
		text: 'Wings buy outfield coverage that grounded fielders cannot match, and the bat is respectable for the price. A tidy, chemistry-flexible role player.'
	},
	'Shy Guy': {
		text: 'The definition of serviceable: average bat, average glove, five colors of roster filler with useful chemistry links. You pick Shy Guy for the team he completes, not the box score.'
	},
	Daisy: {
		text: 'A balanced bat with more pop than her class suggests. Daisy holds her own anywhere in the order but never quite headlines.'
	},
	'Bowser Jr': {
		text: 'Compact power with real speed — a rare combination. The short reach shrinks his contact zone, so he feasts on pitchers who miss middle and starves against ones who do not.'
	},
	Peach: {
		text: 'Technique-class charge control that rewards patient hitting. The foot speed and light contact keep her out of most serious stars-off lineups.'
	},
	Monty: {
		text: 'Pure acceleration. Monty terrorizes the base paths and beats out anything on the ground, but the bat and glove are strictly economy class.'
	},
	Koopa: {
		text: 'Below average at nearly everything, without a standout tool to justify the slot. A chemistry body in shell-heavy lineups and little more.'
	},
	Goomba: {
		text: 'No arms, no answers. Goomba fields with his face and hits like it, too. Beloved, and benched.'
	},
	'Baby Mario': {
		text: 'Fast and fearless, but a featherweight bat and a toy arm make every inning an adventure. A meme with wheels.'
	},
	'Baby Luigi': {
		text: 'Everything Baby Mario is, in green. Speed keeps him watchable; everything else keeps him at the bottom of the ladder.'
	},
	Paragoomba: {
		text: 'The wings help him reach fly balls and nothing else. Statistically the floor of the roster — pick him for love, not for wins.'
	}
};

// ---------- Community tier lists ----------

export type TierName =
	| 'SS'
	| 'S'
	| 'S-'
	| 'A+'
	| 'A'
	| 'A-'
	| 'B+'
	| 'B'
	| 'B-'
	| 'C+'
	| 'C'
	| 'C-'
	| 'D+'
	| 'D'
	| 'D-'
	| 'F';

export interface TierEntry {
	rank: number;
	character: string; // SimplifiedName
	score: number; // community average placement (lower = better)
}

export interface TierRow {
	tier: TierName;
	entries: TierEntry[];
}

export interface CommunityTierList {
	id: 'stars-off' | 'stars-on';
	title: string;
	edition: string;
	tiers: TierRow[];
}

// 2nd Official Superstars Off community tier list. Toadette and Paratroopa
// tied at 21.44, so both hold rank 21 and rank 22 is skipped.
export const starsOffTierList: CommunityTierList = {
	id: 'stars-off',
	title: 'Superstars Off',
	edition: '2nd Official Community Tier List',
	tiers: [
		{ tier: 'SS', entries: [{ rank: 1, character: 'Bowser', score: 1.0 }] },
		{
			tier: 'S',
			entries: [
				{ rank: 2, character: 'Petey', score: 2.52 },
				{ rank: 3, character: 'Bro', score: 3.08 },
				{ rank: 4, character: 'DK', score: 3.92 },
				{ rank: 5, character: 'Birdo', score: 5.08 },
				{ rank: 6, character: 'Yoshi', score: 5.92 },
				{ rank: 7, character: 'Boo', score: 7.04 },
				{ rank: 8, character: 'King Boo', score: 7.84 },
				{ rank: 9, character: 'Magikoopa', score: 8.72 }
			]
		},
		{ tier: 'S-', entries: [{ rank: 10, character: 'Waluigi', score: 10.56 }] },
		{
			tier: 'A+',
			entries: [
				{ rank: 11, character: 'Wario', score: 12.04 },
				{ rank: 12, character: 'Toadsworth', score: 12.28 },
				{ rank: 13, character: 'Luigi', score: 12.56 }
			]
		},
		{ tier: 'A', entries: [{ rank: 14, character: 'Mario', score: 13.96 }] },
		{ tier: 'A-', entries: [{ rank: 15, character: 'Pianta', score: 15.32 }] },
		{
			tier: 'B+',
			entries: [
				{ rank: 16, character: 'Dixie', score: 16.76 },
				{ rank: 17, character: 'Noki', score: 17.16 }
			]
		},
		{
			tier: 'B-',
			entries: [
				{ rank: 18, character: 'Diddy', score: 19.4 },
				{ rank: 19, character: 'Toad', score: 20.24 },
				{ rank: 20, character: 'Dry Bones', score: 20.88 },
				{ rank: 21, character: 'Toadette', score: 21.44 },
				{ rank: 21, character: 'Paratroopa', score: 21.44 }
			]
		},
		{
			tier: 'C',
			entries: [
				{ rank: 23, character: 'Shy Guy', score: 23.08 },
				{ rank: 24, character: 'Daisy', score: 23.36 },
				{ rank: 25, character: 'Bowser Jr', score: 23.56 },
				{ rank: 26, character: 'Peach', score: 24.4 }
			]
		},
		{ tier: 'D+', entries: [{ rank: 27, character: 'Monty', score: 26.28 }] },
		{ tier: 'D-', entries: [{ rank: 28, character: 'Koopa', score: 27.8 }] },
		{
			tier: 'F',
			entries: [
				{ rank: 29, character: 'Goomba', score: 29.68 },
				{ rank: 30, character: 'Baby Mario', score: 29.76 },
				{ rank: 31, character: 'Baby Luigi', score: 30.24 },
				{ rank: 32, character: 'Paragoomba', score: 30.32 }
			]
		}
	]
};

// Stars On list hasn't been ratified yet — fill in `tiers` when the community
// vote lands and the board renders it automatically.
export const starsOnTierList: CommunityTierList = {
	id: 'stars-on',
	title: 'Superstars On',
	edition: 'Awaiting ratification',
	tiers: []
};

export const tierLists: CommunityTierList[] = [starsOffTierList, starsOnTierList];

// ---------- Lookups ----------

// Canonical playable variant for a simplified name (e.g. "Toad" -> "Toad(R)"),
// taken as the first variant in the roster table.
const canonicalBySimplified = new Map<string, string>();
for (const name of Object.values(characters)) {
	const simplified = characterClasses[name]?.SimplifiedName ?? name;
	if (!canonicalBySimplified.has(simplified)) canonicalBySimplified.set(simplified, name);
}

export function canonicalVariant(simplifiedName: string): string {
	return canonicalBySimplified.get(simplifiedName) ?? simplifiedName;
}

export function variantsOf(simplifiedName: string): string[] {
	return Object.values(characters).filter(
		(name) => (characterClasses[name]?.SimplifiedName ?? name) === simplifiedName
	);
}

export function simplifiedName(characterName: string): string {
	return characterClasses[characterName]?.SimplifiedName ?? characterName;
}

export function writeupFor(characterName: string): CharacterWriteup | null {
	return characterWriteups[simplifiedName(characterName)] ?? null;
}

// One hue per letter grade (the +/- refinement is carried by the printed tier
// label, not by color). Tuned for the night background.
const TIER_HUES: { [letter: string]: string } = {
	SS: '#ffd23f',
	S: '#ff3d4e',
	A: '#ff9640',
	B: '#34d399',
	C: '#5aa9ff',
	D: '#a78bfa',
	F: '#8f8fa3'
};

export function tierHue(tier: TierName): string {
	return tier === 'SS' ? TIER_HUES.SS : (TIER_HUES[tier[0]] ?? TIER_HUES.F);
}

export interface TierPlacement {
	list: CommunityTierList;
	tier: TierName;
	rank: number;
	score: number;
}

export function tierPlacements(characterName: string): TierPlacement[] {
	const simplified = simplifiedName(characterName);
	const placements: TierPlacement[] = [];
	for (const list of tierLists) {
		for (const row of list.tiers) {
			for (const entry of row.entries) {
				if (entry.character === simplified) {
					placements.push({ list, tier: row.tier, rank: entry.rank, score: entry.score });
				}
			}
		}
	}
	return placements;
}
