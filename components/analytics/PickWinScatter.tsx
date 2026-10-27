'use client';

import { useMemo, useState } from 'react';
import type { CharAgg } from '@/lib/charAnalytics';
import { characterImage } from '@/lib/data/characters';
import { pct, signedPp } from './theme';

// Pick rate (x) vs win rate (y). The 50% line is the natural break-even;
// upper-left is under-picked characters that win anyway, lower-right is
// popular picks that don't deliver. Each mark is the character's own icon —
// it identifies itself, so there is no color coding and no legend.

interface Placed {
	agg: CharAgg;
	cx: number;
	cy: number;
}

export default function PickWinScatter({
	aggs,
	selectedKey,
	onSelect
}: {
	aggs: CharAgg[];
	selectedKey: string | null;
	onSelect: (key: string) => void;
}) {
	const [hovered, setHovered] = useState<Placed | null>(null);

	const width = 640;
	const height = 340;
	const margin = { top: 14, right: 20, bottom: 34, left: 46 };
	const innerW = width - margin.left - margin.right;
	const innerH = height - margin.top - margin.bottom;
	const icon = 22;

	const { placed, xMax, yMin, yMax } = useMemo(() => {
		const xMax = Math.max(0.05, ...aggs.map((agg) => agg.pickPct)) * 1.08;
		// Dynamic y-domain padded around the data, always including the 50% line.
		const winRates = aggs.map((agg) => agg.winPct);
		const yMin = Math.max(0, Math.min(0.45, ...winRates) - 0.04);
		const yMax = Math.min(1, Math.max(0.55, ...winRates) + 0.04);
		const placed: Placed[] = aggs.map((agg) => ({
			agg,
			cx: margin.left + (agg.pickPct / xMax) * innerW,
			cy: margin.top + (1 - (agg.winPct - yMin) / (yMax - yMin)) * innerH
		}));
		return { placed, xMax, yMin, yMax };
	}, [aggs, innerW, innerH, margin.left, margin.top]);

	const xTicks = [0, 0.25, 0.5, 0.75, 1].map((t) => t * xMax);
	const yTicks = useMemo(() => {
		const ticks: number[] = [];
		for (let v = Math.ceil(yMin * 10) / 10; v <= yMax + 1e-9; v += 0.1) {
			ticks.push(Math.round(v * 10) / 10);
		}
		return ticks;
	}, [yMin, yMax]);

	const yPos = (value: number) =>
		margin.top + (1 - (value - yMin) / (yMax - yMin)) * innerH;

	// Selected/hovered marks render last (on top).
	const drawOrder = [...placed].sort((a, b) => {
		const rank = (point: Placed) =>
			point === hovered ? 2 : point.agg.group.key === selectedKey ? 1 : 0;
		return rank(a) - rank(b);
	});

	return (
		<div className="relative">
			<svg
				viewBox={`0 0 ${width} ${height}`}
				className="w-full"
				role="img"
				aria-label="Scatter of pick rate versus win rate per character"
				onMouseLeave={() => setHovered(null)}
			>
				{/* grid + axes (recessive); the 50% line is the emphasized reference */}
				{yTicks.map((tick) => {
					const y = yPos(tick);
					const isBreakEven = Math.abs(tick - 0.5) < 1e-9;
					return (
						<g key={`y${tick}`}>
							<line
								x1={margin.left}
								x2={width - margin.right}
								y1={y}
								y2={y}
								stroke={isBreakEven ? '#2b2b40' : '#1f1f30'}
								strokeWidth={isBreakEven ? 1.5 : 1}
								strokeDasharray={isBreakEven ? '4 3' : undefined}
							/>
							<text x={margin.left - 8} y={y + 3} textAnchor="end" fontSize={10} fill="#8f8fa3">
								{pct(tick, 0)}
							</text>
						</g>
					);
				})}
				{xTicks.map((tick) => {
					const x = margin.left + (tick / xMax) * innerW;
					return (
						<text
							key={`x${tick}`}
							x={x}
							y={height - margin.bottom + 16}
							textAnchor="middle"
							fontSize={10}
							fill="#8f8fa3"
						>
							{pct(tick, 0)}
						</text>
					);
				})}
				<text
					x={margin.left + innerW / 2}
					y={height - 4}
					textAnchor="middle"
					fontSize={10}
					fill="#8f8fa3"
				>
					Pick rate →
				</text>
				<text
					transform={`translate(12 ${margin.top + innerH / 2}) rotate(-90)`}
					textAnchor="middle"
					fontSize={10}
					fill="#8f8fa3"
				>
					Win rate →
				</text>

				{/* character icons as marks */}
				{drawOrder.map((point) => {
					const isSelected = point.agg.group.key === selectedKey;
					const isHovered = point === hovered;
					return (
						<g key={point.agg.group.key}>
							{(isSelected || isHovered) && (
								<circle
									cx={point.cx}
									cy={point.cy}
									r={icon / 2 + 4}
									fill={isSelected ? 'rgba(255,61,78,0.15)' : 'none'}
									stroke="#ff3d4e"
									strokeWidth={1.5}
									pointerEvents="none"
								/>
							)}
							<image
								href={characterImage(point.agg.group.portraitName)}
								x={point.cx - icon / 2}
								y={point.cy - icon / 2}
								width={icon}
								height={icon}
								pointerEvents="none"
								style={{ imageRendering: 'pixelated' }}
							/>
							{/* oversized invisible hit target */}
							<circle
								cx={point.cx}
								cy={point.cy}
								r={icon / 2 + 4}
								fill="transparent"
								style={{ cursor: 'pointer' }}
								onMouseEnter={() => setHovered(point)}
								onClick={() => onSelect(point.agg.group.key)}
							>
								<title>{point.agg.group.name}</title>
							</circle>
						</g>
					);
				})}
			</svg>

			{hovered && (
				<div
					className="pointer-events-none absolute z-20 w-52 rounded-lg border border-night-600 bg-night-850 p-2.5 text-xs shadow-xl"
					style={{
						left: `${Math.min(92, (hovered.cx / width) * 100)}%`,
						top: `${(hovered.cy / height) * 100}%`,
						transform: `translate(${hovered.cx > width * 0.65 ? '-108%' : '14px'}, -50%)`
					}}
				>
					<p className="mb-1 font-display text-sm font-bold text-fog-100">{hovered.agg.group.name}</p>
					<dl className="space-y-0.5 text-fog-300">
						<div className="flex justify-between"><dt className="text-fog-500">Pick rate</dt><dd>{pct(hovered.agg.pickPct)}</dd></div>
						<div className="flex justify-between"><dt className="text-fog-500">Win rate</dt><dd className="font-medium text-fog-100">{pct(hovered.agg.winPct)}</dd></div>
						<div className="flex justify-between"><dt className="text-fog-500">vs expected</dt><dd>{signedPp(hovered.agg.waeRate)}</dd></div>
						<div className="flex justify-between"><dt className="text-fog-500">Games</dt><dd>{hovered.agg.games}</dd></div>
					</dl>
				</div>
			)}

			<p className="mt-2 px-1 text-[11px] text-fog-500">
				Dashed line = 50% · upper-left = under-picked characters that win anyway · click an icon to
				inspect
			</p>
		</div>
	);
}
