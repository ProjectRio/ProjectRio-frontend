/* eslint-disable @next/next/no-img-element */
import { characterImage, stadiums } from '@/lib/data/characters';
import { stadiumWalls } from '@/lib/data/stadiumWalls';
import type { LiveRosterSlot, LiveTeam } from '@/lib/liveGame';

// Field geometry is in the game's own coordinate system — meters, home plate at
// origin, +x toward right field (first-base line), +y toward center field —
// then projected into a 100x100 SVG viewBox. Chips are HTML overlays positioned
// with the same projection (viewBox units double as percentages).

// Real diamond: 27.432 m (90 ft) between bases, 19.397 m down each foul line at 45°.
const BASE_DIST = 27.432;
const F = BASE_DIST * Math.sin(Math.PI / 4); // 19.397

const FIRST = { x: F, y: F };
const SECOND = { x: 0, y: 2 * F };
const THIRD = { x: -F, y: F };
const MOUND = { x: 0, y: 18.44 };

// Fielder starting positions, decoded from the game's (x, z) float vectors.
// Indexed by fielding-position id: P, C, 1B, 2B, 3B, SS, LF, CF, RF.
// The raw 1B/3B defaults (±18.5, 22) sit right on top of a runner holding the
// bag, so we shift them ~5.5 m back along the foul line (the 45° diagonal away
// from home) to clear the runner.
const FIELDER_COORDS = [
	{ x: 0, y: 18.6 }, // P
	{ x: 0, y: -3.8 }, // C
	{ x: 24.0, y: 27.5 }, // 1B (shifted back from 18.5, 22)
	{ x: 11.0, y: 36.0 }, // 2B
	{ x: -24.0, y: 27.5 }, // 3B (shifted back from -18.5, 22)
	{ x: -11.0, y: 36.0 }, // SS
	{ x: -34.0, y: 60.0 }, // LF
	{ x: 0.0, y: 76.0 }, // CF
	{ x: 34.0, y: 60.0 } // RF
];

// Infield dirt outline: corners just beyond 1B/3B joined by an arc over 2B.
const DIRT = { corner: 23.6, cy: 21.0, r: 23.8, bottom: -5.4 };

// Runners sit just inside their base (a natural lead-off) so they read clearly
// and don't hide behind the bag or the holding fielder.
const RUNNER_LEAD = 0.85;
const RUNNER_SPOTS = {
	first: { x: FIRST.x * RUNNER_LEAD, y: FIRST.y * RUNNER_LEAD },
	second: { x: SECOND.x * RUNNER_LEAD, y: SECOND.y * RUNNER_LEAD },
	third: { x: THIRD.x * RUNNER_LEAD, y: THIRD.y * RUNNER_LEAD }
};

interface StadiumTheme {
	bg: string;
	grass: string;
	grassDark: string;
	dirt: string;
	dirtDark: string;
	lines: string;
	fence: string;
	accent: string;
}

const STADIUM_THEMES: Record<number, StadiumTheme> = {
	// Mario Stadium — classic ballpark greens
	0: {
		bg: '#0c1118',
		grass: '#2e6b35',
		grassDark: '#28602f',
		dirt: '#9b6a3f',
		dirtDark: '#855833',
		lines: '#f5f5f8',
		fence: '#1b4521',
		accent: '#ff3d4e'
	},
	// Bowser Castle — scorched stone and lava glow
	1: {
		bg: '#120b0b',
		grass: '#4a4048',
		grassDark: '#423a41',
		dirt: '#6e4434',
		dirtDark: '#5c382b',
		lines: '#f5e9d8',
		fence: '#2a2026',
		accent: '#ff6a00'
	},
	// Wario Palace — desert gold and royal purple
	2: {
		bg: '#14101a',
		grass: '#6b6326',
		grassDark: '#5f5820',
		dirt: '#b08948',
		dirtDark: '#9a763c',
		lines: '#fdf6e3',
		fence: '#3d2a4a',
		accent: '#ffd23f'
	},
	// Yoshi Park — bright theme-park turf
	3: {
		bg: '#0d1410',
		grass: '#3e8e3a',
		grassDark: '#368033',
		dirt: '#c98a4b',
		dirtDark: '#b3793f',
		lines: '#ffffff',
		fence: '#2b6e2a',
		accent: '#ff7bd5'
	},
	// Peach Garden — soft garden greens and rose
	4: {
		bg: '#150f14',
		grass: '#4d8f4f',
		grassDark: '#448246',
		dirt: '#caa05e',
		dirtDark: '#b48c4e',
		lines: '#fff4f8',
		fence: '#7c4a62',
		accent: '#ff9ec4'
	},
	// DK Jungle — deep canopy
	5: {
		bg: '#0a0f0a',
		grass: '#274d22',
		grassDark: '#21431d',
		dirt: '#7a5430',
		dirtDark: '#684727',
		lines: '#ece4cf',
		fence: '#163019',
		accent: '#a8e063'
	},
	// Toy Field — bright plastic playset
	6: {
		bg: '#0e1016',
		grass: '#48903f',
		grassDark: '#3f8138',
		dirt: '#d9a13f',
		dirtDark: '#c08c33',
		lines: '#ffffff',
		fence: '#b05c2a',
		accent: '#4fc3f7'
	}
};

interface Projection {
	wall: [number, number][];
	scale: number;
	px: (x: number) => number;
	py: (y: number) => number;
	maxDist: number;
	wallDist: (dir: { x: number; y: number }) => number;
}

function buildProjection(stadiumId: number): Projection {
	const wall = stadiumWalls[stadiumId] ?? stadiumWalls[0];
	let minX = Infinity,
		maxX = -Infinity,
		minY = Infinity,
		maxY = -Infinity,
		maxDist = 0;
	for (const [x, y] of wall) {
		minX = Math.min(minX, x);
		maxX = Math.max(maxX, x);
		minY = Math.min(minY, y);
		maxY = Math.max(maxY, y);
		maxDist = Math.max(maxDist, Math.hypot(x, y));
	}
	const pad = 5;
	const scale = (100 - 2 * pad) / Math.max(maxX - minX, maxY - minY);
	const cx = (minX + maxX) / 2;
	const cy = (minY + maxY) / 2;
	const px = (x: number) => 50 + scale * (x - cx);
	const py = (y: number) => 50 - scale * (y - cy);

	// Distance from home plate to the wall along a unit direction.
	const wallDist = (dir: { x: number; y: number }) => {
		let best = maxDist;
		for (let i = 0; i < wall.length; i++) {
			const [x1, y1] = wall[i];
			const [x2, y2] = wall[(i + 1) % wall.length];
			const ex = x2 - x1;
			const ey = y2 - y1;
			const det = ex * dir.y - ey * dir.x;
			if (Math.abs(det) < 1e-9) continue;
			const t = (ex * y1 - ey * x1) / det;
			const u = (dir.x * y1 - dir.y * x1) / det;
			if (t > 0 && u >= 0 && u <= 1) best = Math.min(best, t);
		}
		return best;
	};

	return { wall, scale, px, py, maxDist, wallDist };
}

function StadiumField({ proj, theme }: { proj: Projection; theme: StadiumTheme }) {
	const { wall, scale: s, px, py } = proj;
	const wallPath = wall.map(([x, y], i) => `${i === 0 ? 'M' : 'L'} ${px(x).toFixed(2)} ${py(y).toFixed(2)}`).join(' ') + ' Z';

	const foulDirs = [
		{ x: -Math.SQRT1_2, y: Math.SQRT1_2 },
		{ x: Math.SQRT1_2, y: Math.SQRT1_2 }
	];
	const foulPoles = foulDirs.map((dir) => {
		const d = proj.wallDist(dir);
		return { x: px(dir.x * d), y: py(dir.y * d) };
	});

	const stripeRadii: number[] = [];
	for (let r = 14; r < proj.maxDist; r += 12) stripeRadii.push(r);

	const dirtPath =
		`M ${px(0)} ${py(DIRT.bottom)} ` +
		`L ${px(DIRT.corner)} ${py(DIRT.corner)} ` +
		`A ${DIRT.r * s} ${DIRT.r * s} 0 0 0 ${px(-DIRT.corner)} ${py(DIRT.corner)} Z`;

	const innerGrass = `M ${px(0)} ${py(5.4)} L ${px(14)} ${py(F)} L ${px(0)} ${py(33.4)} L ${px(-14)} ${py(F)} Z`;
	const basePaths = `M ${px(0)} ${py(0)} L ${px(FIRST.x)} ${py(FIRST.y)} L ${px(SECOND.x)} ${py(SECOND.y)} L ${px(THIRD.x)} ${py(THIRD.y)} Z`;

	const batterBox = (side: 1 | -1) => ({
		x: px(side === 1 ? 4.8 : -8.8),
		y: py(2.6),
		width: 4 * s,
		height: 6.4 * s
	});

	const base = (pt: { x: number; y: number }) => {
		const size = 3.1 * s;
		return (
			<rect
				key={`${pt.x}-${pt.y}`}
				x={px(pt.x) - size / 2}
				y={py(pt.y) - size / 2}
				width={size}
				height={size}
				fill={theme.lines}
				transform={`rotate(45 ${px(pt.x)} ${py(pt.y)})`}
			/>
		);
	};

	return (
		<svg viewBox="0 0 100 100" className="h-full w-full" aria-hidden>
			<defs>
				<radialGradient id="stadium-glow" cx="50%" cy="0%" r="85%">
					<stop offset="0%" stopColor={theme.accent} stopOpacity="0.3" />
					<stop offset="60%" stopColor={theme.accent} stopOpacity="0" />
				</radialGradient>
				<clipPath id="field-walls">
					<path d={wallPath} />
				</clipPath>
			</defs>

			<rect width="100" height="100" fill={theme.bg} />
			<rect width="100" height="100" fill="url(#stadium-glow)" />

			{/* Grass inside the real walls, with mow stripes */}
			<path d={wallPath} fill={theme.grass} />
			<g clipPath="url(#field-walls)">
				{stripeRadii.map((r) => (
					<circle key={r} cx={px(0)} cy={py(0)} r={r * s} fill="none" stroke={theme.grassDark} strokeWidth={6 * s} />
				))}
			</g>

			{/* Infield dirt and inner grass */}
			<path d={dirtPath} fill={theme.dirt} />
			<path d={innerGrass} fill={theme.grass} />

			{/* Home plate dirt circle + batter's boxes */}
			<circle cx={px(0)} cy={py(0)} r={6 * s} fill={theme.dirt} />
			{([1, -1] as const).map((side) => (
				<rect key={side} {...batterBox(side)} fill="none" stroke={theme.lines} strokeWidth="0.35" opacity="0.55" />
			))}

			{/* Base paths + foul lines out to the actual walls */}
			<path d={basePaths} fill="none" stroke={theme.lines} strokeWidth="0.5" opacity="0.7" />
			<g clipPath="url(#field-walls)">
				{foulPoles.map((pole, i) => (
					<path
						key={i}
						d={`M ${px(0)} ${py(0)} L ${pole.x} ${pole.y}`}
						stroke={theme.lines}
						strokeWidth="0.5"
						opacity="0.8"
					/>
				))}
			</g>

			{/* Mound — real dimensions: 2.7 m radius, 18.44 m from home */}
			<circle cx={px(MOUND.x)} cy={py(MOUND.y)} r={2.7 * s} fill={theme.dirtDark} />
			<rect x={px(MOUND.x) - 0.95 * s} y={py(MOUND.y) - 0.35 * s} width={1.9 * s} height={0.7 * s} fill={theme.lines} opacity="0.9" />

			{/* Bases + home plate */}
			{[FIRST, SECOND, THIRD].map(base)}
			<rect x={px(0) - 1.3 * s} y={py(0) - 1.3 * s} width={2.6 * s} height={2.6 * s} fill={theme.lines} />

			{/* The wall itself + foul poles */}
			<path d={wallPath} fill="none" stroke={theme.fence} strokeWidth="2" />
			{foulPoles.map((pole, i) => (
				<circle key={i} cx={pole.x} cy={pole.y} r="1" fill={theme.accent} />
			))}
		</svg>
	);
}

function CharChip({
	x,
	y,
	slot,
	ring,
	showStar,
	tooltip,
	chemNote
}: {
	x: number;
	y: number;
	slot: LiveRosterSlot;
	ring: string;
	showStar: boolean;
	tooltip: string;
	chemNote?: boolean;
}) {
	return (
		<div
			className="absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center"
			style={{ left: `${x}%`, top: `${y}%` }}
			title={tooltip}
		>
			<div className={`relative h-8 w-8 rounded-full border-2 bg-night-950/75 shadow-lg sm:h-10 sm:w-10 ${ring}`}>
				<img src={characterImage(slot.name)} alt={slot.name} className="h-full w-full object-contain p-0.5" />
				{showStar && slot.isSuperstar && (
					<span className="absolute -right-1.5 -top-1.5 text-[11px] leading-none text-star-400 drop-shadow">★</span>
				)}
				{slot.isCaptain && (
					<span className="absolute -left-1.5 -top-1.5 text-[10px] leading-none drop-shadow">👑</span>
				)}
				{chemNote && (
					<span className="absolute -right-2.5 top-1/2 -translate-y-1/2 text-sm font-bold leading-none text-star-400 drop-shadow">
						♪
					</span>
				)}
			</div>
		</div>
	);
}

export default function LiveFieldView({
	game,
	batting,
	fielding
}: {
	game: any;
	batting: LiveTeam;
	fielding: LiveTeam;
}) {
	const theme = STADIUM_THEMES[game.stadium_id] ?? STADIUM_THEMES[0];
	const stadiumName = stadiums[game.stadium_id] ?? 'Unknown Stadium';
	const proj = buildProjection(game.stadium_id);

	const fielderSpot = (positionId: number) => FIELDER_COORDS[positionId] ?? null;

	const batter = batting.slots[game.batter];
	// Right-handed batters (hand 0) stand in the third-base side box.
	const batterSpot = game.batter_hand === 1 ? { x: 6.8, y: 1 } : { x: -6.8, y: 1 };

	const chemLinks = game.chemistry_links_on_base ?? 0;
	const runners = (
		[
			['first', game.runner_on_first, game.runner_on_first_roster],
			['second', game.runner_on_second, game.runner_on_second_roster],
			['third', game.runner_on_third, game.runner_on_third_roster]
		] as const
	)
		.filter(([, on, rosterIdx]) => on && rosterIdx >= 0 && batting.slots[rosterIdx])
		.map(([baseName, , rosterIdx], i) => ({
			baseName,
			slot: batting.slots[rosterIdx],
			// The API only reports a link count, so mark runners in base order.
			chemNote: i < chemLinks
		}));

	const chip = (spot: { x: number; y: number }, props: Omit<Parameters<typeof CharChip>[0], 'x' | 'y'>) => (
		<CharChip key={`${props.ring}${props.slot.rosterIdx}`} x={proj.px(spot.x)} y={proj.py(spot.y)} {...props} />
	);

	return (
		<div>
			<div className="relative aspect-square w-full overflow-hidden">
				<StadiumField proj={proj} theme={theme} />

				{fielding.slots.map((slot) => {
					const spot = fielderSpot(slot.positionId);
					return spot
						? chip(spot, {
								slot,
								ring: 'border-sky-400',
								showStar: !fielding.allSuperstars,
								tooltip: `${slot.name} — ${slot.position}`
							})
						: null;
				})}

				{runners.map(({ baseName, slot, chemNote }) =>
					chip(RUNNER_SPOTS[baseName], {
						slot,
						ring: 'border-rio-400',
						showStar: !batting.allSuperstars,
						tooltip:
							`${slot.name} — on ${baseName} base` +
							(chemNote ? ` · chemistry with ${batter?.name ?? 'the batter'}` : ''),
						chemNote
					})
				)}

				{batter &&
					chip(batterSpot, {
						slot: batter,
						ring: 'border-rio-400',
						showStar: !batting.allSuperstars,
						tooltip: `${batter.name} — at bat (bats ${game.batter_hand === 1 ? 'left' : 'right'})`
					})}

				<span className="absolute left-2 top-2 rounded bg-night-950/70 px-2 py-0.5 font-display text-[10px] font-semibold uppercase tracking-widest text-fog-300">
					{stadiumName}
				</span>
			</div>

			<div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-night-800 px-4 py-2.5 text-xs text-fog-300">
				<span className="flex items-center gap-1.5">
					<span className="h-2.5 w-2.5 rounded-full border-2 border-rio-400" /> {batting.player} batting
				</span>
				<span className="flex items-center gap-1.5">
					<span className="h-2.5 w-2.5 rounded-full border-2 border-sky-400" /> {fielding.player} fielding
				</span>
			</div>
		</div>
	);
}
