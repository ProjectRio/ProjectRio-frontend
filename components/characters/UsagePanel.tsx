'use client';

// Live community usage for one character: how often it's picked, how often it
// wins, usage over time, and its most common teammates. All aggregation reuses
// the character-analytics pipeline (one cached /games/ fetch per mode).

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { DEFAULT_MODE, getCharFieldingStats } from '@/lib/api';
import {
	useModesGames,
	buildTeamRows,
	characterGroups,
	charStats,
	companionStats,
	monthlyTrend,
	type CharGroup
} from '@/lib/charAnalytics';
import { characterIdFromName, characterImage } from '@/lib/data/characters';
import { ModeSelect } from '@/components/StatsTables';
import { PanelHeader, Spinner, ErrorState, EmptyState } from '@/components/ui';
import { pct } from '@/components/analytics/theme';
import { FieldHeatmap, LineupStrip, fieldShares } from './Deployment';

const fieldingCache = new Map<string, Promise<Record<string, number> | null>>();

function fetchFielding(mode: string, charIds: number[]): Promise<Record<string, number> | null> {
	const key = `${mode.toLowerCase()}|${charIds.join(',')}`;
	let promise = fieldingCache.get(key);
	if (!promise) {
		promise = getCharFieldingStats(charIds, mode);
		fieldingCache.set(key, promise);
		promise.catch(() => fieldingCache.delete(key));
	}
	return promise;
}

function Tile({ label, value, detail }: { label: string; value: string; detail?: string }) {
	return (
		<div className="rounded-lg border border-night-700 bg-night-850 px-4 py-3">
			<p className="font-display text-[11px] font-semibold uppercase tracking-widest text-fog-500">
				{label}
			</p>
			<p className="mt-1 font-display text-2xl font-bold text-fog-100">{value}</p>
			{detail && <p className="text-xs text-fog-500">{detail}</p>}
		</div>
	);
}

export function UsagePanel({ characterName }: { characterName: string }) {
	const [mode, setMode] = useState(DEFAULT_MODE);
	const { games, loading, error } = useModesGames(useMemo(() => [mode], [mode]));

	const rows = useMemo(() => (games ? buildTeamRows(games) : []), [games]);
	const group: CharGroup | null = useMemo(() => {
		const id = characterIdFromName(characterName);
		if (id === null) return null;
		return characterGroups(true).find((g) => g.charIds.includes(Number(id))) ?? null;
	}, [characterName]);

	const agg = useMemo(
		() => (group && rows.length ? (charStats(rows, [group], false)[0] ?? null) : null),
		[rows, group]
	);
	const trend = useMemo(
		() => (group && rows.length ? monthlyTrend(rows, group, 12) : []),
		[rows, group]
	);
	const teammates = useMemo(() => {
		if (!group || !rows.length) return [];
		return companionStats(rows, characterGroups(true), group, 'with', false)
			.sort((a, b) => b.games - a.games)
			.slice(0, 6);
	}, [rows, group]);

	// Lineup-slot distribution: roster order in the /games/ payload IS the
	// batting order, so the character's index is their lineup slot.
	const lineupShares = useMemo(() => {
		if (!group) return [];
		const groupIds = new Set(group.charIds);
		const slots = new Array(9).fill(0);
		let total = 0;
		for (const row of rows) {
			const slot = row.roster.findIndex((id) => groupIds.has(id));
			if (slot >= 0 && slot < 9) {
				slots[slot] += 1;
				total += 1;
			}
		}
		return total > 0 ? slots.map((n) => n / total) : [];
	}, [rows, group]);

	const [fielding, setFielding] = useState<Record<string, number> | null | 'loading'>('loading');
	useEffect(() => {
		if (!group) return;
		let cancelled = false;
		setFielding('loading');
		fetchFielding(mode, group.charIds)
			.then((data) => {
				if (!cancelled) setFielding(data);
			})
			.catch(() => {
				if (!cancelled) setFielding(null);
			});
		return () => {
			cancelled = true;
		};
	}, [mode, group]);
	const positionShares = useMemo(
		() => (fielding === 'loading' ? null : fieldShares(fielding)),
		[fielding]
	);

	const maxTrendGames = Math.max(1, ...trend.map((p) => p.games));

	return (
		<div className="panel">
			<PanelHeader
				title="In the wild"
				action={<ModeSelect value={mode} onChange={setMode} />}
			/>
			<div className="p-5">
				{group && group.charIds.length > 1 && (
					<p className="mb-4 text-xs text-fog-500">
						Counting every {group.name} color variant together.
					</p>
				)}
				{error && <ErrorState message={error} />}
				{loading && <Spinner label="Loading community games…" />}
				{!loading && !error && games && agg === null && (
					<EmptyState
						title="No recorded picks"
						detail={`Nobody has fielded ${group?.name ?? characterName} in this mode yet.`}
					/>
				)}
				{!loading && !error && agg && group && (
					<div className="space-y-6">
						<div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
							<Tile label="Team games" value={String(agg.games)} detail={`of ${rows.length} recorded`} />
							<Tile label="Pick rate" value={pct(agg.pickPct)} detail="share of rosters" />
							<Tile
								label="Win rate"
								value={pct(agg.winPct)}
								detail={`${agg.wins}–${agg.losses}`}
							/>
							<Tile
								label="As captain"
								value={agg.captainGames > 0 ? pct(agg.captainPct) : '—'}
								detail={
									agg.captainGames > 0
										? `${agg.captainGames} games, ${pct(agg.captainGames ? agg.captainWins / agg.captainGames : 0)} won`
										: 'no captain picks'
								}
							/>
						</div>

						<div className="grid gap-6 lg:grid-cols-2">
							<div>
								<h3 className="mb-2 font-display text-xs font-bold uppercase tracking-widest text-fog-500">
									Where they play · share of pitches at each position
								</h3>
								{positionShares ? (
									<FieldHeatmap shares={positionShares} />
								) : (
									<p className="text-xs text-fog-500">
										{fielding === 'loading' ? 'Loading fielding data…' : 'No fielding data recorded.'}
									</p>
								)}
							</div>
							{lineupShares.length > 0 && (
								<div>
									<h3 className="mb-2 font-display text-xs font-bold uppercase tracking-widest text-fog-500">
										Batting order · share of games at each slot
									</h3>
									<LineupStrip shares={lineupShares} />
								</div>
							)}
						</div>

						{trend.length > 1 && (
							<div>
								<h3 className="mb-2 font-display text-xs font-bold uppercase tracking-widest text-fog-500">
									Games picked per month
								</h3>
								<div className="flex h-24 items-end gap-1">
									{trend.map((point) => (
										<div
											key={point.label}
											className="group flex h-full flex-1 flex-col items-center justify-end gap-1"
											title={`${point.label}: ${point.games} games, ${pct(point.winPct)} win rate`}
										>
											<span className="hidden text-[10px] tabular-nums text-fog-300 group-hover:block">
												{point.games}
											</span>
											<div
												className="w-full max-w-8 rounded-t-[4px] bg-rio-400/80 transition-colors group-hover:bg-rio-300"
												style={{ height: `${Math.max((point.games / maxTrendGames) * 100, 3)}%` }}
											/>
											<span className="text-[10px] text-fog-500">{point.label}</span>
										</div>
									))}
								</div>
							</div>
						)}

						{teammates.length > 0 && (
							<div>
								<h3 className="mb-2 font-display text-xs font-bold uppercase tracking-widest text-fog-500">
									Most common teammates
								</h3>
								<div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
									{teammates.map((mate) => (
										<Link
											key={mate.group.key}
											href={`/characters/${encodeURIComponent(mate.group.portraitName)}`}
											className="flex items-center gap-3 rounded-lg border border-night-700 bg-night-850 px-3 py-2 transition-colors hover:border-rio-500/50"
										>
											{/* eslint-disable-next-line @next/next/no-img-element */}
											<img
												src={characterImage(mate.group.portraitName)}
												alt=""
												className="h-8 w-8 object-contain"
											/>
											<div className="min-w-0 flex-1">
												<p className="truncate text-sm font-medium text-fog-100">{mate.group.name}</p>
												<p className="text-xs text-fog-500">{mate.games} games together</p>
											</div>
											<span className="font-display text-sm font-bold tabular-nums text-fog-300">
												{pct(mate.winPct, 0)}
											</span>
										</Link>
									))}
								</div>
							</div>
						)}
					</div>
				)}
			</div>
		</div>
	);
}
