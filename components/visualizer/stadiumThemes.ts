// Stream-view stadium themes for the 3D hit visualizer, ported from
// RioVisualizer web/themes.js. Each theme recolors the stadium's collision-type
// triangles to evoke the real arena (palettes sampled from gameplay
// screenshots) using only colors, fog, and lighting — no copyrighted assets.
//
// Palettes are tuned to how each stadium ACTUALLY uses the collision types
// (measured from the stadium JSONs):
//   Bowser Castle:  floor is mostly `oob`; lava pools are `pit`
//   DK Jungle:      brown dirt patches are `rough`; `dirt` unused
//   Wario Palace:   sand is `dirt`; the green base pads are `grass`
//   Yoshi Park:     surrounding hills are `oob`; fence is `wall`
//   Toy Field:      blue panel floor is `grass`/`oob`; the two floor holes
//                   expose the `pit` under-floor; their sides are `pitWall`

export interface StadiumTheme3D {
	label: string;
	skyTop: string;
	skyBottom: string;
	fog: string;
	fogDensity: number;
	hemi: { sky: string; ground: string; intensity: number };
	sun: { color: string; intensity: number; position: [number, number, number] };
	lineGlow: string;
	palette: Record<string, string>;
	emissive: Record<string, string>;
	foulMult: number;
	decals?: { x: number; z: number; r: number; color: string }[];
	/** Horizon ground plane color (fog-faded); the terrain surrounding the arena. */
	ground?: string;
	/** Dark-sky theme: the sky dome gets a starfield. */
	night?: boolean;
}

// Keyed by stadium_id (matches lib/data/characters.ts `stadiums`).
export const THEMES_3D: Record<number, StadiumTheme3D> = {
	// Mario Stadium
	0: {
		label: 'Sunny Island Park',
		skyTop: '#4da3e8',
		skyBottom: '#cdeefb',
		fog: '#cdeefb',
		fogDensity: 0.0028,
		hemi: { sky: '#bdd9ff', ground: '#7fae6a', intensity: 0.95 },
		sun: { color: '#fff3d6', intensity: 1.25, position: [-60, 120, -40] },
		lineGlow: '#ffffff',
		palette: {
			grass: '#43a047',
			dirt: '#c98e54',
			wall: '#3f5fc4',
			oob: '#d7dde6',
			foulLine: '#f5f5f0',
			back: '#aeb8ca',
			pitWall: '#8a93a4',
			pit: '#c4cdd9',
			rough: '#3a8c3e',
			water: '#3fc9d8',
			chomp: '#e8c84a'
		},
		emissive: { water: '#2fb8d8' },
		foulMult: 0.82,
		// Sunny Island sits in the sea.
		ground: '#4db4d4'
	},
	// Bowser Castle
	1: {
		label: 'Molten Keep',
		skyTop: '#171015',
		skyBottom: '#3a1f16',
		fog: '#2c1812',
		fogDensity: 0.004,
		hemi: { sky: '#5a3a32', ground: '#1c1016', intensity: 0.7 },
		sun: { color: '#ff9c5a', intensity: 0.85, position: [40, 90, -70] },
		lineGlow: '#ffd9a0',
		palette: {
			grass: '#5e5a6a',
			dirt: '#787082',
			wall: '#6e6657',
			oob: '#514b5c',
			foulLine: '#e8d6a8',
			back: '#4a3e48',
			pitWall: '#3a3340',
			pit: '#ff5a00',
			rough: '#4a4456',
			water: '#ff6a10',
			chomp: '#ffd03f'
		},
		emissive: { pit: '#ff4800', water: '#ff5a00', chomp: '#ffb300' },
		foulMult: 0.74,
		ground: '#221419'
	},
	// Wario Palace
	2: {
		label: 'Desert Arena',
		skyTop: '#d9a45e',
		skyBottom: '#f3ddab',
		fog: '#ecd9a8',
		fogDensity: 0.0036,
		hemi: { sky: '#f0dcb0', ground: '#a08252', intensity: 0.95 },
		sun: { color: '#ffd9a0', intensity: 1.15, position: [70, 70, -50] },
		lineGlow: '#fff0c8',
		palette: {
			grass: '#5fae4a',
			dirt: '#dcc078',
			wall: '#b3a384',
			oob: '#a89578',
			foulLine: '#f0e2bc',
			back: '#8e7c62',
			pitWall: '#7d6c52',
			pit: '#c9a85e',
			rough: '#c4a25a',
			water: '#5fc0c9',
			chomp: '#e8c34a'
		},
		emissive: {},
		foulMult: 0.8,
		ground: '#c9a86a'
	},
	// Yoshi Park
	3: {
		label: 'Picture-Book Meadow',
		skyTop: '#3f8fe0',
		skyBottom: '#bfe8f8',
		fog: '#cfeaf4',
		fogDensity: 0.0022,
		hemi: { sky: '#d8ecff', ground: '#5fa848', intensity: 1.05 },
		sun: { color: '#fff8e0', intensity: 1.2, position: [-50, 110, -50] },
		lineGlow: '#ffffff',
		palette: {
			grass: '#5cc24f',
			dirt: '#d8b878',
			wall: '#d9cdb0',
			oob: '#62b84a',
			foulLine: '#ffffff',
			back: '#c9aa6e',
			pitWall: '#8a9c8a',
			pit: '#b4c4b4',
			rough: '#4aa040',
			water: '#3fa9e8',
			chomp: '#e8c84a'
		},
		emissive: { water: '#3fa0e0' },
		foulMult: 0.86,
		ground: '#54ad46'
	},
	// Peach Garden (Peach's Castle)
	4: {
		label: 'Royal Garden',
		skyTop: '#7fa9e0',
		skyBottom: '#f4cfd9',
		fog: '#e9d4dc',
		fogDensity: 0.003,
		hemi: { sky: '#dcd4ec', ground: '#7c9c66', intensity: 1.0 },
		sun: { color: '#ffe2ce', intensity: 1.1, position: [-90, 80, -30] },
		lineGlow: '#fff4ec',
		palette: {
			grass: '#4fae44',
			dirt: '#bd6a42',
			wall: '#9aa6c4',
			oob: '#c2bdb4',
			foulLine: '#f6efe2',
			back: '#b4a8c4',
			pitWall: '#8e8aa8',
			pit: '#7d96c9',
			rough: '#2f7a38',
			water: '#6fb8e8',
			chomp: '#e8cf6a'
		},
		emissive: { water: '#5fb0e0' },
		foulMult: 0.84,
		ground: '#79a468'
	},
	// DK Jungle (Donkey Kong Jungle)
	5: {
		label: 'Volcano Jungle',
		skyTop: '#9fb4bc',
		skyBottom: '#dde8e6',
		fog: '#cfdcd8',
		fogDensity: 0.0048,
		hemi: { sky: '#cfe0da', ground: '#42603a', intensity: 0.9 },
		sun: { color: '#eef4e2', intensity: 0.9, position: [-30, 100, -60] },
		lineGlow: '#fff8e0',
		palette: {
			grass: '#3f8a37',
			dirt: '#6b4a2e',
			wall: '#7a5b3a',
			oob: '#557a44',
			foulLine: '#e8e3cf',
			back: '#5e7264',
			pitWall: '#4f4438',
			pit: '#56402a',
			rough: '#6b4a2e',
			water: '#7fc9dd',
			chomp: '#e0b84a'
		},
		emissive: { water: '#6fc0d8' },
		foulMult: 0.78,
		ground: '#3d5c36'
	},
	// Toy Field
	6: {
		label: 'Midnight Toy Box',
		skyTop: '#040407',
		skyBottom: '#0b1026',
		fog: '#070910',
		fogDensity: 0.0015,
		hemi: { sky: '#3a4a7a', ground: '#0a0c18', intensity: 0.85 },
		sun: { color: '#cfe0ff', intensity: 1.3, position: [0, 130, -40] },
		lineGlow: '#ffffff',
		palette: {
			grass: '#2a4fae',
			dirt: '#33549f',
			wall: '#2f55b8',
			oob: '#22408c',
			foulLine: '#e8e8f0',
			back: '#28448f',
			// the two floor holes expose the pit under-floor: golden bonus panels
			pit: '#d9a93a',
			pitWall: '#2f55b8',
			rough: '#2a4fae',
			water: '#3fa9e8',
			chomp: '#e8c84a'
		},
		emissive: { pit: '#d9a93a' },
		foulMult: 0.92,
		ground: '#0a0e1e',
		night: true,
		// HIT / COIN / bonus pads — colors only, positions approximate
		decals: [
			{ x: -25, z: 50, r: 7, color: '#d42b2b' },
			{ x: 25, z: 50, r: 7, color: '#d42b2b' },
			{ x: 0, z: 62, r: 7, color: '#d42b2b' },
			{ x: -45, z: 60, r: 8, color: 'rainbow' },
			{ x: 45, z: 60, r: 8, color: 'rainbow' },
			{ x: -20, z: 78, r: 7, color: '#2fa83c' },
			{ x: 20, z: 78, r: 7, color: '#2fa83c' },
			{ x: 0, z: 82, r: 7, color: '#d4742b' }
		]
	}
};

export const COLLISION_TYPE_KEYS: Record<number, string> = {
	0x01: 'grass',
	0x02: 'wall',
	0x03: 'oob',
	0x04: 'foulLine',
	0x05: 'back',
	0x06: 'dirt',
	0x07: 'pitWall',
	0x08: 'pit',
	0x09: 'rough',
	0x0a: 'water',
	0x0b: 'chomp'
};

export function getTheme3D(stadiumId: number): StadiumTheme3D {
	return THEMES_3D[stadiumId] ?? THEMES_3D[0];
}
