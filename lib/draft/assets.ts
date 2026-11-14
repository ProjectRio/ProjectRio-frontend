// The asset catalog for drafts: every MSSB character and stadium as a draftable
// `asset` row (§6d). Asset ids are stable: characters are char_id + 1, stadiums
// are 100 + stadium_id, so fixtures and price history can reference them.

import { characters, characterClasses, characterImage, stadiums } from '@/lib/data/characters';
import type { Asset, AssetKind } from './types';

export const CHARACTER_ASSET_OFFSET = 1;
export const STADIUM_ASSET_OFFSET = 100;

// The twelve team captains (char ids 0–11).
const CAPTAIN_IDS = new Set([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]);

export const ALL_ASSETS: Asset[] = [
	...Object.entries(characters).map(([id, name]) => {
		const charId = Number(id);
		return {
			id: charId + CHARACTER_ASSET_OFFSET,
			kind: 'character' as const,
			name,
			char_id: charId,
			class: characterClasses[name]?.Class,
			captain: CAPTAIN_IDS.has(charId)
		};
	}),
	...Object.entries(stadiums).map(([id, name]) => ({
		id: Number(id) + STADIUM_ASSET_OFFSET,
		kind: 'stadium' as const,
		name,
		stadium_id: Number(id)
	}))
];

const BY_ID = new Map(ALL_ASSETS.map((asset) => [asset.id, asset]));

export function assetById(id: number): Asset {
	const asset = BY_ID.get(id);
	if (!asset) throw new Error(`Unknown asset ${id}`);
	return asset;
}

export function assetIdForCharacter(charId: number): number {
	return charId + CHARACTER_ASSET_OFFSET;
}

export function assetIdForStadium(stadiumId: number): number {
	return stadiumId + STADIUM_ASSET_OFFSET;
}

export function assetImage(asset: Asset): string | null {
	return asset.kind === 'character' ? characterImage(asset.name) : null;
}

export function assetsOfKind(kind: AssetKind): Asset[] {
	return ALL_ASSETS.filter((asset) => asset.kind === kind);
}

/** Short stadium labels for tight board cells. */
export const STADIUM_SHORT: Record<number, string> = {
	0: 'MS',
	1: 'BC',
	2: 'WP',
	3: 'YP',
	4: 'PG',
	5: 'DKJ',
	6: 'TF'
};

/** Stadium accent colours sampled from the visualizer themes. */
export const STADIUM_HUES: Record<number, string> = {
	0: '#43a047',
	1: '#ff5722',
	2: '#e0b04a',
	3: '#7bd35b',
	4: '#f48fb1',
	5: '#6d4c2b',
	6: '#4fa3ff'
};

/** Class hues used as data colour only — never as a UI accent. */
export const CLASS_HUES: Record<string, string> = {
	Power: '#e8746f',
	Balance: '#6fcf8a',
	Technique: '#f2d16b',
	Speed: '#6fb4f2'
};
