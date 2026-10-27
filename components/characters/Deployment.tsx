'use client';

// Deployment heatmaps: where a character actually gets fielded (share of
// pitches spent at each defensive position) and where they bat in the order
// (share of games at each lineup slot).

import { FIELDER_STARTING_POSITIONS } from '@/lib/mssb/fielderPositions';

// API key (pitches_per_<key>) -> position label used by FIELDER_STARTING_POSITIONS.
export const POSITION_KEYS: { [apiKey: string]: string } = {
	p: 'P',
	c: 'C',
	'1b': '1B',
	'2b': '2B',
	'3b': '3B',
	ss: 'SS',
	lf: 'LF',
	cf: 'CF',
	rf: 'RF'
};

export function fieldShares(fielding: Record<string, number> | null): Map<string, number> | null {
	if (!fielding) return null;
	const shares = new Map<string, number>();
	let total = 0;
	for (const [apiKey, position] of Object.entries(POSITION_KEYS)) {
		const pitches = fielding[`pitches_per_${apiKey}`] ?? 0;
		shares.set(position, pitches);
		total += pitches;
	}
	if (total === 0) return null;
	for (const [position, pitches] of shares) shares.set(position, pitches / total);
	return shares;
}

// Top-down field with a glow at each position sized/shaded by time spent there.
export function FieldHeatmap({ shares }: { shares: Map<string, number> }) {
	const W = 340;
	const H = 270;
	const homeX = W / 2;
	const homeY = H - 40;
	const scale = 2.55;

	const px = (x: number) => homeX + x * scale;
	const py = (z: number) => homeY - z * scale;
	const maxShare = Math.max(0.0001, ...shares.values());

	return (
		<svg viewBox={`0 0 ${W} ${H}`} className="w-full rounded-lg border border-night-700 bg-night-850">
			{/* Foul lines and outfield/infield guides */}
			<line x1={homeX} y1={homeY} x2={px(-72)} y2={py(72)} stroke="#2b2b40" strokeWidth="1.5" />
			<line x1={homeX} y1={homeY} x2={px(72)} y2={py(72)} stroke="#2b2b40" strokeWidth="1.5" />
			{[30, 85].map((r) => {
				const rr = r * scale;
				return (
					<path
						key={r}
						d={`M ${homeX - rr * Math.SQRT1_2} ${homeY - rr * Math.SQRT1_2} A ${rr} ${rr} 0 0 1 ${homeX + rr * Math.SQRT1_2} ${homeY - rr * Math.SQRT1_2}`}
						fill="none"
						stroke="#1f1f30"
						strokeWidth="1"
					/>
				);
			})}
			{Object.entries(FIELDER_STARTING_POSITIONS).map(([position, [x, , z]]) => {
				const share = shares.get(position) ?? 0;
				const t = share / maxShare;
				const r = 7 + 13 * Math.sqrt(t);
				return (
					<g key={position}>
						<circle cx={px(x)} cy={py(z)} r={r * 1.6} fill="#e60012" fillOpacity={0.12 * t} />
						<circle
							cx={px(x)}
							cy={py(z)}
							r={r}
							fill="#e60012"
							fillOpacity={0.15 + 0.65 * t}
							stroke={t > 0.02 ? '#ff6b78' : '#2b2b40'}
							strokeWidth="1"
						/>
						<text
							x={px(x)}
							y={py(z) - 2}
							textAnchor="middle"
							fontSize="10"
							fontWeight="700"
							className="fill-fog-100"
						>
							{position}
						</text>
						<text x={px(x)} y={py(z) + 9} textAnchor="middle" fontSize="8.5" className="fill-fog-300">
							{share >= 0.005 ? `${(share * 100).toFixed(0)}%` : share > 0 ? '<1%' : '—'}
						</text>
					</g>
				);
			})}
		</svg>
	);
}

// Nine lineup slots, shaded by how often the character bats there.
export function LineupStrip({ shares }: { shares: number[] }) {
	const maxShare = Math.max(0.0001, ...shares);
	return (
		<div>
			<div className="grid grid-cols-9 gap-1">
				{shares.map((share, slot) => {
					const t = share / maxShare;
					return (
						<div
							key={slot}
							title={`Bats ${ordinal(slot + 1)} in ${(share * 100).toFixed(1)}% of games`}
							className="flex flex-col items-center gap-1 rounded border border-night-700 py-2"
							style={{ backgroundColor: `rgba(230, 0, 18, ${0.04 + 0.5 * t})` }}
						>
							<span className="font-display text-sm font-bold text-fog-100">{slot + 1}</span>
							<span className="text-[10px] tabular-nums text-fog-300">
								{share >= 0.005 ? `${(share * 100).toFixed(0)}%` : share > 0 ? '<1' : '—'}
							</span>
						</div>
					);
				})}
			</div>
			<p className="mt-1 text-[10px] text-fog-500">1 = leadoff · 9 = last</p>
		</div>
	);
}

function ordinal(n: number): string {
	const suffix = n === 1 ? 'st' : n === 2 ? 'nd' : n === 3 ? 'rd' : 'th';
	return `${n}${suffix}`;
}
