'use client';

import type { ReactNode } from 'react';
import type { GameSummary } from '@/lib/api';
import { playerWon } from '@/lib/playerHistory';

// Small presentational pieces for the player pages: headline stat blocks,
// a win-rate donut, ELO sparklines, usage bars, and the recent-form strip.

export function StatBlock({ label, value, sub }: { label: string; value: ReactNode; sub?: string }) {
	return (
		<div className="min-w-0">
			<p className="text-[11px] font-semibold uppercase tracking-widest text-fog-500">{label}</p>
			<p
				className="mt-1 truncate font-display text-2xl font-bold text-fog-100 sm:text-3xl"
				style={{ fontVariantNumeric: 'tabular-nums' }}
			>
				{value}
			</p>
			{sub && <p className="mt-0.5 truncate text-xs text-fog-500">{sub}</p>}
		</div>
	);
}

export function WinRing({ wins, losses, size = 104 }: { wins: number; losses: number; size?: number }) {
	const total = wins + losses;
	const pct = total === 0 ? 0 : wins / total;
	const stroke = 9;
	const radius = (size - stroke) / 2;
	const circumference = 2 * Math.PI * radius;

	return (
		<div className="relative shrink-0" style={{ width: size, height: size }}>
			<svg width={size} height={size} className="-rotate-90">
				<circle
					cx={size / 2}
					cy={size / 2}
					r={radius}
					fill="none"
					strokeWidth={stroke}
					className="stroke-night-700"
				/>
				<circle
					cx={size / 2}
					cy={size / 2}
					r={radius}
					fill="none"
					strokeWidth={stroke}
					strokeLinecap="round"
					strokeDasharray={`${circumference * pct} ${circumference}`}
					className="stroke-rio-500"
				/>
			</svg>
			<div className="absolute inset-0 flex flex-col items-center justify-center">
				<span className="font-display text-xl font-bold text-fog-100" style={{ fontVariantNumeric: 'tabular-nums' }}>
					{total === 0 ? '—' : `${Math.round(pct * 100)}%`}
				</span>
				<span className="text-[10px] font-semibold uppercase tracking-widest text-fog-500">Win rate</span>
			</div>
		</div>
	);
}

export function Sparkline({
	values,
	width = 160,
	height = 40
}: {
	values: number[];
	width?: number;
	height?: number;
}) {
	if (values.length < 2) {
		return <div className="h-10 rounded bg-night-950" />;
	}
	const min = Math.min(...values);
	const max = Math.max(...values);
	const span = max - min || 1;
	const pad = 3;
	const points = values
		.map((value, i) => {
			const x = pad + (i / (values.length - 1)) * (width - pad * 2);
			const y = pad + (1 - (value - min) / span) * (height - pad * 2);
			return `${x.toFixed(1)},${y.toFixed(1)}`;
		})
		.join(' ');

	return (
		<svg viewBox={`0 0 ${width} ${height}`} className="h-10 w-full" preserveAspectRatio="none" aria-hidden>
			<polyline
				points={points}
				fill="none"
				strokeWidth={2}
				strokeLinejoin="round"
				strokeLinecap="round"
				className="stroke-rio-400"
			/>
		</svg>
	);
}

export function UsageBar({ pct, color = 'bg-rio-500' }: { pct: number; color?: string }) {
	return (
		<div className="h-1.5 w-full overflow-hidden rounded-full bg-night-700">
			<div className={`h-full rounded-full ${color}`} style={{ width: `${Math.min(100, pct * 100)}%` }} />
		</div>
	);
}

// Last-N results as W/L chips, newest last — the esports "recent form" strip.
export function FormStrip({ games, user }: { games: GameSummary[]; user: string }) {
	const recent = games.slice(0, 10).reverse();
	if (recent.length === 0) return null;
	return (
		<div className="flex items-center gap-1" title="Last 10 games, oldest to newest">
			{recent.map((game) => {
				const won = playerWon(game, user);
				return (
					<span
						key={game.game_id}
						className={`flex h-6 w-6 items-center justify-center rounded font-display text-xs font-bold ${
							won ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rio-500/20 text-rio-300'
						}`}
					>
						{won ? 'W' : 'L'}
					</span>
				);
			})}
		</div>
	);
}

export function CharPortrait({ name, size = 36 }: { name: string; size?: number }) {
	return (
		// eslint-disable-next-line @next/next/no-img-element
		<img
			src={`/images/Characters/${name}.png`}
			alt={name}
			width={size}
			height={size}
			className="shrink-0 rounded bg-night-950 object-contain [image-rendering:pixelated]"
			onError={(event) => {
				(event.target as HTMLImageElement).style.visibility = 'hidden';
			}}
		/>
	);
}
