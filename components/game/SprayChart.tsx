'use client';

// Top-down spray chart: every at-bat-ending ball in play, plotted at its
// stored landing position on the real stadium geometry. Reuses the live-game
// SVG field renderer and its per-stadium theming.

import { useMemo, useState } from 'react';
import { buildProjection, StadiumField, STADIUM_THEMES } from '@/components/LiveFieldView';
import { characterName } from '@/lib/data/characters';
import { atBatResultName } from '@/lib/mssb/constants';
import { ordinal } from '@/lib/gameDisplay';
import type { GameEvent } from '@/lib/mssb/BattingSimulation/eventToSim';
import {
	groupAtBats,
	hasBallFlight,
	resultCategory,
	RESULT_COLORS,
	type ResultCategory
} from '@/lib/gameEvents';

const AWAY_COLOR = '#4f9dff';
const HOME_COLOR = '#f43f5e';

interface SprayPoint {
	event: GameEvent;
	x: number; // svg coords (0-100)
	y: number;
	category: ResultCategory;
}

export default function SprayChart({
	stadiumId,
	events,
	awayUser,
	homeUser,
	onVisualize
}: {
	stadiumId: number;
	events: GameEvent[];
	awayUser: string;
	homeUser: string;
	onVisualize: (event: GameEvent) => void;
}) {
	const [side, setSide] = useState<'both' | 0 | 1>('both');
	const [hovered, setHovered] = useState<number | null>(null);

	const proj = useMemo(() => buildProjection(stadiumId), [stadiumId]);
	const theme = STADIUM_THEMES[stadiumId] ?? STADIUM_THEMES[0];

	const points = useMemo<SprayPoint[]>(() => {
		return groupAtBats(events)
			.map((ab) => ab.final)
			.filter(hasBallFlight)
			.filter((e) => resultCategory(e.result_of_ab) !== 'walk')
			.map((event) => {
				const contact = event.pitch!.contact!;
				return {
					event,
					x: proj.px(contact.ball_x_landing_pos),
					y: proj.py(contact.ball_z_landing_pos),
					category: resultCategory(event.result_of_ab)
				};
			});
	}, [events, proj]);

	const visible = points.filter((p) => side === 'both' || p.event.half_inning === side);
	const hoveredPoint = visible.find((p) => p.event.event_num === hovered) ?? null;

	return (
		<div className="panel">
			<div className="flex flex-wrap items-center justify-between gap-2 border-b border-night-700 bg-night-850 px-4 py-3">
				<h2 className="font-display text-sm font-bold uppercase tracking-widest text-fog-300">
					Spray Chart
				</h2>
				<div className="flex overflow-hidden rounded-lg border border-night-600 text-xs">
					{(
						[
							['both', 'Both'],
							[0, awayUser],
							[1, homeUser]
						] as const
					).map(([value, label]) => (
						<button
							key={String(value)}
							className={`px-3 py-1 font-display font-semibold uppercase tracking-wider transition-colors ${
								side === value ? 'bg-rio-500 text-white' : 'text-fog-300 hover:bg-night-700'
							}`}
							onClick={() => setSide(value as typeof side)}
						>
							{label}
						</button>
					))}
				</div>
			</div>

			<div className="relative">
				<div className="relative aspect-square w-full overflow-hidden">
					<StadiumField proj={proj} theme={theme} />
					<svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full">
						{visible.map((p) => {
							const isHovered = hovered === p.event.event_num;
							return (
								<g key={p.event.event_num}>
									{p.category === 'hr' && (
										<circle cx={p.x} cy={p.y} r={isHovered ? 3.4 : 2.6} fill="none" stroke={RESULT_COLORS.hr} strokeWidth="0.35" opacity="0.7" />
									)}
									<circle
										cx={p.x}
										cy={p.y}
										r={isHovered ? 2.2 : 1.5}
										fill={RESULT_COLORS[p.category]}
										stroke={p.event.half_inning === 0 ? AWAY_COLOR : HOME_COLOR}
										strokeWidth="0.5"
										className="cursor-pointer"
										style={{ transition: 'r 120ms' }}
										onMouseEnter={() => setHovered(p.event.event_num)}
										onMouseLeave={() => setHovered(null)}
										onClick={() => onVisualize(p.event)}
									/>
								</g>
							);
						})}
					</svg>

					{hoveredPoint && (
						<div
							className="pointer-events-none absolute z-10 -translate-x-1/2 rounded-lg border border-night-600 bg-night-950/95 px-2.5 py-1.5 text-xs shadow-xl"
							style={{
								left: `${hoveredPoint.x}%`,
								top: `${Math.max(hoveredPoint.y - 6, 2)}%`
							}}
						>
							<p className="font-semibold text-fog-100">
								{characterName(hoveredPoint.event.batter.char_id)} —{' '}
								<span style={{ color: RESULT_COLORS[hoveredPoint.category] }}>
									{atBatResultName(hoveredPoint.event.result_of_ab)}
								</span>
							</p>
							<p className="text-fog-500">
								{hoveredPoint.event.half_inning === 0 ? 'Top' : 'Bot'}{' '}
								{ordinal(hoveredPoint.event.inning)} ·{' '}
								{Math.round(
									Math.hypot(
										hoveredPoint.event.pitch!.contact!.ball_x_landing_pos,
										hoveredPoint.event.pitch!.contact!.ball_z_landing_pos
									)
								)}
								m · click for 3D
							</p>
						</div>
					)}
				</div>
			</div>

			<div className="flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-night-700 px-4 py-2.5 text-[11px] text-fog-300">
				{(
					[
						['hr', 'Home run'],
						['hit', 'Hit'],
						['out', 'Out'],
						['error', 'Error']
					] as const
				).map(([cat, label]) => (
					<span key={cat} className="flex items-center gap-1.5">
						<span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: RESULT_COLORS[cat] }} />
						{label}
					</span>
				))}
				<span className="flex items-center gap-1.5">
					<span className="h-2.5 w-2.5 rounded-full border-2" style={{ borderColor: AWAY_COLOR }} />
					{awayUser}
				</span>
				<span className="flex items-center gap-1.5">
					<span className="h-2.5 w-2.5 rounded-full border-2" style={{ borderColor: HOME_COLOR }} />
					{homeUser}
				</span>
			</div>
		</div>
	);
}
