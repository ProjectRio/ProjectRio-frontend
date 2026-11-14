'use client';

/* eslint-disable @next/next/no-img-element */

// A stadium as the 3D scene rendered it, from up behind home plate: the park
// itself, with its lights and lava breathing on a second layer and a slow
// drift so it never sits still. Children get `place(x, z)` to pin things on
// the picture in stadium coordinates.

import type { ReactNode } from 'react';
import { place, RENDERS_BASE, useStadiumRender, type Placement } from '@/lib/draft/stadiumRender';

export default function StadiumField({ stadiumId, children, className = '' }: { stadiumId: number; children?: (place: (x: number, z: number) => Placement) => ReactNode; className?: string }) {
	const { render, error } = useStadiumRender(stadiumId);
	const aspect = render ? `${render.width} / ${render.height}` : '4 / 3';
	return (
		<div className={`relative w-full select-none overflow-hidden rounded-xl border border-night-700 bg-night-950 ${className}`} style={{ aspectRatio: aspect }}>
			{render && (
				<div className="rio-stadium-drift absolute inset-0">
					<img key={render.scene} src={`${RENDERS_BASE}/${render.scene}`} alt="" draggable={false} className="absolute inset-0 h-full w-full" />
					<img key={render.glow} src={`${RENDERS_BASE}/${render.glow}`} alt="" draggable={false} className="rio-stadium-glow absolute inset-0 h-full w-full" />
					{/* a touch of vignette so the tokens read against the bright grass */}
					<div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_55%,rgb(0_0_0_/_0.35)_100%)]" />
					{children?.((x, z) => place(render, x, z))}
				</div>
			)}
			{!render && <div className="absolute inset-0 flex items-center justify-center px-4 text-center font-display text-[10px] font-semibold uppercase tracking-widest text-fog-500">{error ?? 'Lighting the stadium…'}</div>}
		</div>
	);
}
