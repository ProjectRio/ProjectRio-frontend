import type { CSSProperties } from 'react';

// Seeded PRNG so the scatter is identical on every render.
function mulberry32(seed: number) {
	return () => {
		seed |= 0;
		seed = (seed + 0x6d2b79f5) | 0;
		let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
		t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	};
}

const rand = mulberry32(0x510);

// ~30 mushrooms at random sizes and positions. Depth drives everything:
// nearer sprites are bigger, brighter, and fall faster than distant ones.
const SPRITES = Array.from({ length: 55 }, () => {
	const depth = rand();
	const fallDur = 150 - depth * 85;
	return {
		left: rand() * 100,
		size: Math.round(14 + depth * 46),
		opacity: 0.05 + depth * 0.11,
		fallDur,
		fallDelay: -rand() * fallDur,
		swayDur: 6 + rand() * 8,
		swayAmp: 8 + rand() * 22,
		swayDelay: -rand() * 12,
		restY: 5 + rand() * 90
	};
});

export default function MushroomField() {
	return (
		<div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
			{SPRITES.map((sprite, i) => (
				<div
					key={i}
					className="mushroom-sprite"
					style={
						{
							left: `${sprite.left}%`,
							opacity: sprite.opacity,
							'--fall-dur': `${sprite.fallDur}s`,
							'--fall-delay': `${sprite.fallDelay}s`,
							'--rest-y': `${sprite.restY}vh`
						} as CSSProperties
					}
				>
					<img
						src="/images/mushroom-pixel.svg"
						alt=""
						width={sprite.size}
						height={sprite.size}
						className="mushroom-sway"
						style={
							{
								'--sway-dur': `${sprite.swayDur}s`,
								'--sway-amp': `${sprite.swayAmp}px`,
								'--sway-delay': `${sprite.swayDelay}s`
							} as CSSProperties
						}
					/>
				</div>
			))}
			{/* Arena light spilling from the top of the stadium */}
			<div
				className="absolute inset-0"
				style={{ background: 'radial-gradient(ellipse 90% 55% at 50% -15%, rgb(230 0 18 / 0.2), transparent)' }}
			/>
			{/* Darken the infield so the form and copy stay readable over the sprites */}
			<div
				className="absolute inset-0"
				style={{
					background:
						'radial-gradient(ellipse 75% 65% at 50% 45%, rgb(7 7 11 / 0.88), rgb(7 7 11 / 0.3) 60%, transparent 80%)'
				}}
			/>
		</div>
	);
}
