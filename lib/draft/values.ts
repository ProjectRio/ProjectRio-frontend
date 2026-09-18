// Consensus character value on a $40-style scale — the league's Muddyball
// price sheet. Bots use it to decide what to bid; fixtures use it for fixed
// prices and historic price samples. Not shown to users as truth.

const BASE_VALUE: Record<string, number> = {
	Mario: 7, Luigi: 6, DK: 10, Diddy: 4, Peach: 5, Daisy: 4, Yoshi: 8, 'Baby Mario': 2, 'Baby Luigi': 2,
	Bowser: 12, Wario: 7, Waluigi: 7, 'Koopa(G)': 1, 'Toad(R)': 4, Boo: 6, Toadette: 3, 'Shy Guy(R)': 2,
	Birdo: 8, Monty: 1, 'Bowser Jr': 3, 'Paratroopa(R)': 1, 'Pianta(B)': 4, 'Pianta(R)': 5, 'Pianta(Y)': 4,
	'Noki(B)': 3, 'Noki(R)': 3, 'Noki(G)': 6, 'Bro(H)': 9, Toadsworth: 5, 'Toad(B)': 4, 'Toad(Y)': 4,
	'Toad(G)': 4, 'Toad(P)': 4, 'Magikoopa(B)': 8, 'Magikoopa(R)': 8, 'Magikoopa(G)': 8, 'Magikoopa(Y)': 8,
	'King Boo': 8, Petey: 10, Dixie: 4, Goomba: 1, Paragoomba: 1, 'Koopa(R)': 2, 'Paratroopa(G)': 5,
	'Shy Guy(B)': 2, 'Shy Guy(Y)': 2, 'Shy Guy(G)': 2, 'Shy Guy(Bk)': 2, 'Dry Bones(Gy)': 2, 'Dry Bones(G)': 5,
	'Dry Bones(R)': 2, 'Dry Bones(B)': 2, 'Bro(F)': 9, 'Bro(B)': 9
};

const STADIUM_VALUE: Record<string, number> = {
	'Mario Stadium': 3,
	'Bowser Castle': 5,
	'Wario Palace': 4,
	'Yoshi Park': 3,
	'Peach Garden': 2,
	'DK Jungle': 4,
	'Toy Field': 3
};

export function baseValue(name: string): number {
	return BASE_VALUE[name] ?? STADIUM_VALUE[name] ?? 2;
}

/** Scale a base value to a league's budget (base scale ≈ $40 for 9 chars + 1 stadium). */
export function scaledValue(name: string, budget: number): number {
	return Math.max(1, Math.round((baseValue(name) / 40) * budget));
}

/** Deterministic pseudo-random in [0, 1) from a seed — bots and fixtures stay stable. */
export function seeded(seed: number): number {
	let t = (seed + 0x6d2b79f5) | 0;
	t = Math.imul(t ^ (t >>> 15), t | 1);
	t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
	return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}
