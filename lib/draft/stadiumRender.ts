'use client';

// The pre-rendered stadium fields (public/stadiums/renders), produced from the
// Rio Visualizer's three.js scene by scripts/render-stadiums.mjs. The manifest
// carries each image's projection matrix, so anything at stadium coordinates
// (home plate at the origin, first base +X, outfield +Z) can be pinned to the
// picture the same way the 3D camera saw it.

import { useEffect, useState } from 'react';

export interface StadiumRender {
	width: number;
	height: number;
	/** Column-major clip-space matrix for (x, 0, z, 1) in stadium units. */
	matrix: number[];
	scene: string;
	glow: string;
}

interface Manifest {
	version: number;
	stadiums: Record<string, StadiumRender>;
}

export const RENDERS_BASE = '/stadiums/renders';

let manifestPromise: Promise<Manifest> | null = null;

export function loadManifest(): Promise<Manifest> {
	if (!manifestPromise) {
		manifestPromise = fetch(`${RENDERS_BASE}/manifest.json`).then((response) => {
			if (!response.ok) throw new Error('stadium renders missing — run npm run render:stadiums');
			return response.json();
		});
	}
	return manifestPromise;
}

export interface Placement {
	/** Percent of the image width / height. */
	x: number;
	y: number;
	/** 1 at home plate, smaller toward the fence — for sizing tokens with perspective. */
	scale: number;
}

/** Project a spot on the field onto the render. */
export function place(render: StadiumRender, x: number, z: number): Placement {
	const e = render.matrix;
	const cx = e[0] * x + e[8] * z + e[12];
	const cy = e[1] * x + e[9] * z + e[13];
	const cw = e[3] * x + e[11] * z + e[15];
	const home = e[15];
	return { x: ((cx / cw + 1) / 2) * 100, y: ((1 - cy / cw) / 2) * 100, scale: Math.max(0.55, Math.min(1.1, home / cw)) };
}

export function useStadiumRender(stadiumId: number): { render: StadiumRender | null; error: string | null } {
	const [state, setState] = useState<{ render: StadiumRender | null; error: string | null }>({ render: null, error: null });
	useEffect(() => {
		let cancelled = false;
		loadManifest()
			.then((manifest) => {
				if (cancelled) return;
				const render = manifest.stadiums[String(stadiumId)] ?? manifest.stadiums['0'] ?? null;
				setState({ render, error: render ? null : 'no render for this stadium' });
			})
			.catch((error: Error) => {
				if (!cancelled) setState({ render: null, error: error.message });
			});
		return () => {
			cancelled = true;
		};
	}, [stadiumId]);
	return state;
}
