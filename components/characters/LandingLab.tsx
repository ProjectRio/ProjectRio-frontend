'use client';

// Landing lab: what actually happened to every ball this character put in
// play. BA broken down by contact frame and by launch-angle bucket, each
// acting as a filter on the spray chart (and on each other), so "late slaps
// on frame 8 that left as liners" is two clicks away.

import { useMemo, useState } from 'react';
import { DEFAULT_MODE } from '@/lib/api';
import { characterIdFromName, characterClasses, characters } from '@/lib/data/characters';
import {
	useLandingData,
	baByFrame,
	baByVertBucket,
	battingAverage,
	vertBucketOf,
	formatBa,
	VERT_BUCKETS,
	type LandingRow,
	type VertBucketKey
} from '@/lib/landingData';
import { RESULT_COLORS, type ResultCategory } from '@/lib/gameEvents';
import { ModeSelect } from '@/components/StatsTables';
import { PanelHeader, Spinner, ErrorState, EmptyState } from '@/components/ui';

type SwingFilter = 'all' | 1 | 2 | 3;

const SWING_OPTIONS: { label: string; value: SwingFilter }[] = [
	{ label: 'All swings', value: 'all' },
	{ label: 'Slap', value: 1 },
	{ label: 'Charge', value: 2 },
	{ label: 'Star', value: 3 }
];

const IN_PLAY: ResultCategory[] = ['hit', 'hr', 'out', 'error'];
const LEGEND: { category: ResultCategory; label: string }[] = [
	{ category: 'hr', label: 'Home run' },
	{ category: 'hit', label: 'Hit' },
	{ category: 'error', label: 'Error' },
	{ category: 'out', label: 'Out' }
];

const MAX_SPRAY_POINTS = 2500;

// All color variants of this character's group share one landing pool.
function groupCharIds(characterName: string): number[] {
	const simplified = characterClasses[characterName]?.SimplifiedName ?? characterName;
	return Object.entries(characters)
		.filter(([, name]) => (characterClasses[name]?.SimplifiedName ?? name) === simplified)
		.map(([id]) => Number(id));
}

export function LandingLab({ characterName }: { characterName: string }) {
	const [mode, setMode] = useState(DEFAULT_MODE);
	const charIds = useMemo(() => groupCharIds(characterName), [characterName]);
	const { rows, loading, error } = useLandingData(mode, charIds);

	const [swing, setSwing] = useState<SwingFilter>('all');
	const [frames, setFrames] = useState<Set<number>>(new Set());
	const [vertKeys, setVertKeys] = useState<Set<VertBucketKey>>(new Set());
	const [hand, setHand] = useState<'R' | 'L' | null>(null);

	const inPlay = useMemo(
		() => (rows ?? []).filter((row) => IN_PLAY.includes(row.category)),
		[rows]
	);

	// A stance is always selected — mixing lefty and righty contacts would blur
	// the spray and the frame story. Default to the stance with more PA.
	const leftyPa = useMemo(() => inPlay.filter((row) => row.battingHand).length, [inPlay]);
	const rightyPa = inPlay.length - leftyPa;
	const effHand: 'R' | 'L' = hand ?? (leftyPa > rightyPa ? 'L' : 'R');

	const byHand = useMemo(
		() => inPlay.filter((row) => row.battingHand === (effHand === 'L')),
		[inPlay, effHand]
	);

	const bySwing = useMemo(
		() => (swing === 'all' ? byHand : byHand.filter((row) => row.typeOfSwing === swing)),
		[byHand, swing]
	);
	const frameFiltered = useMemo(
		() => (frames.size === 0 ? bySwing : bySwing.filter((row) => frames.has(row.frame))),
		[bySwing, frames]
	);
	const vertFiltered = useMemo(
		() =>
			vertKeys.size === 0
				? bySwing
				: bySwing.filter((row) => vertKeys.has(vertBucketOf(row.vertAngle))),
		[bySwing, vertKeys]
	);
	// Spray + headline respect every filter; each breakdown ignores only its own.
	const sprayRows = useMemo(
		() =>
			frameFiltered.filter(
				(row) => vertKeys.size === 0 || vertKeys.has(vertBucketOf(row.vertAngle))
			),
		[frameFiltered, vertKeys]
	);

	const frameBuckets = useMemo(() => baByFrame(vertFiltered), [vertFiltered]);
	const vertBuckets = useMemo(() => baByVertBucket(frameFiltered), [frameFiltered]);
	const headline = useMemo(() => battingAverage(sprayRows), [sprayRows]);

	const hasFilters = swing !== 'all' || frames.size > 0 || vertKeys.size > 0 || hand !== null;

	const toggleFrame = (frame: number) =>
		setFrames((prev) => {
			const next = new Set(prev);
			if (next.has(frame)) next.delete(frame);
			else next.add(frame);
			return next;
		});
	const toggleVert = (key: VertBucketKey) =>
		setVertKeys((prev) => {
			const next = new Set(prev);
			if (next.has(key)) next.delete(key);
			else next.add(key);
			return next;
		});

	const maxFrameBa = Math.max(0.001, ...frameBuckets.map((b) => b.ba ?? 0));

	return (
		<div className="panel">
			<PanelHeader title="Where the ball goes" action={<ModeSelect value={mode} onChange={setMode} />} />
			<div className="p-5">
				{error && <ErrorState message={error} />}
				{loading && (
					<Spinner label="Loading every recorded contact… first load of a mode can take a moment" />
				)}
				{!loading && !error && rows && inPlay.length === 0 && (
					<EmptyState
						title="No balls in play"
						detail="No recorded contact for this character in this mode."
					/>
				)}
				{!loading && !error && inPlay.length > 0 && (
					<div className="space-y-5">
						<div className="flex flex-wrap items-center justify-between gap-3">
							<div className="flex flex-wrap items-center gap-3">
								<div className="flex gap-1">
									{(
										[
											{ label: `Righty · ${rightyPa}`, value: 'R' },
											{ label: `Lefty · ${leftyPa}`, value: 'L' }
										] as const
									).map((opt) => (
										<button
											key={opt.value}
											onClick={() => setHand(opt.value)}
											className={`rounded border px-2.5 py-1 font-display text-xs font-semibold uppercase tracking-wider transition-colors ${
												effHand === opt.value
													? 'border-star-500/60 bg-star-500/15 text-star-400'
													: 'border-night-600 bg-night-850 text-fog-500 hover:text-fog-300'
											}`}
										>
											{opt.label}
										</button>
									))}
								</div>
								<div className="flex flex-wrap gap-1">
								{SWING_OPTIONS.map((opt) => (
									<button
										key={String(opt.value)}
										onClick={() => setSwing(opt.value)}
										className={`rounded border px-2.5 py-1 font-display text-xs font-semibold uppercase tracking-wider transition-colors ${
											swing === opt.value
												? 'border-rio-500/60 bg-rio-500/20 text-rio-300'
												: 'border-night-600 bg-night-850 text-fog-500 hover:text-fog-300'
										}`}
									>
										{opt.label}
									</button>
								))}
								</div>
							</div>
							<div className="flex items-center gap-3">
								<p className="text-sm text-fog-300">
									<span className="font-display text-xl font-bold text-fog-100">
										{formatBa(headline.ba)}
									</span>{' '}
									BA in play · {headline.hits}/{headline.ab}
								</p>
								{hasFilters && (
									<button
										onClick={() => {
											setSwing('all');
											setFrames(new Set());
											setVertKeys(new Set());
											setHand(null); // back to the majority stance
										}}
										className="text-xs text-rio-300 hover:text-rio-400"
									>
										Clear filters
									</button>
								)}
							</div>
						</div>

						<div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
							<SprayChart rows={sprayRows} />

							<div className="space-y-6">
								<div>
									<h3 className="mb-2 font-display text-xs font-bold uppercase tracking-widest text-fog-500">
										BA by contact frame · click to filter
									</h3>
									<div className="flex items-end gap-1">
										{frameBuckets.map((bucket) => {
											const selected = frames.has(bucket.key as number);
											return (
												<button
													key={bucket.key}
													onClick={() => toggleFrame(bucket.key as number)}
													title={`Frame ${bucket.label}: ${formatBa(bucket.ba)} on ${bucket.ab} at-bats`}
													className="group flex flex-1 flex-col items-center gap-1"
												>
													<span className="text-[10px] tabular-nums text-fog-300">
														{formatBa(bucket.ba)}
													</span>
													<div className="flex h-24 w-full items-end">
														<div
															className={`w-full rounded-t-[4px] transition-colors ${
																selected
																	? 'bg-star-400'
																	: 'bg-rio-400/80 group-hover:bg-rio-300'
															}`}
															style={{
																height: `${Math.max(((bucket.ba ?? 0) / maxFrameBa) * 100, 2)}%`
															}}
														/>
													</div>
													<span
														className={`font-display text-xs font-bold tabular-nums ${
															selected ? 'text-star-400' : 'text-fog-300'
														}`}
													>
														{bucket.label}
													</span>
													<span className="text-[10px] tabular-nums text-fog-500">{bucket.ab}</span>
												</button>
											);
										})}
									</div>
								</div>

								<div>
									<h3 className="mb-2 font-display text-xs font-bold uppercase tracking-widest text-fog-500">
										BA by launch angle · click to filter
									</h3>
									<div className="space-y-1">
										{vertBuckets.map((bucket) => {
											const meta = VERT_BUCKETS.find((v) => v.key === bucket.key)!;
											const selected = vertKeys.has(bucket.key as VertBucketKey);
											return (
												<button
													key={bucket.key}
													onClick={() => toggleVert(bucket.key as VertBucketKey)}
													className={`flex w-full items-center gap-2 rounded border px-2 py-1.5 text-left transition-colors ${
														selected
															? 'border-star-500/50 bg-star-500/10'
															: 'border-transparent hover:border-night-600'
													}`}
												>
													<span className="w-20 shrink-0 text-xs text-fog-100">{bucket.label}</span>
													<span className="w-12 shrink-0 text-[10px] text-fog-500">{meta.deg}</span>
													<div className="h-1.5 flex-1 overflow-hidden rounded-full bg-night-700">
														<div
															className={`h-full rounded-full ${selected ? 'bg-star-400' : 'bg-rio-400/80'}`}
															style={{ width: `${((bucket.ba ?? 0) / 0.6) * 100}%` }}
														/>
													</div>
													<span className="w-10 shrink-0 text-right font-display text-xs font-bold tabular-nums text-fog-300">
														{formatBa(bucket.ba)}
													</span>
													<span className="w-10 shrink-0 text-right text-[10px] tabular-nums text-fog-500">
														{bucket.ab}
													</span>
												</button>
											);
										})}
									</div>
								</div>
							</div>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}

// Top-down field: home plate bottom center, +X (1B line) to the right,
// distance arcs for scale. Coordinates are game meters.
function SprayChart({ rows }: { rows: LandingRow[] }) {
	const shown = rows.length > MAX_SPRAY_POINTS ? rows.slice(-MAX_SPRAY_POINTS) : rows;

	const W = 520;
	const H = 470;
	const homeX = W / 2;
	const homeY = H - 30;
	const scale = (H - 60) / 130; // fit ~130 m of fair territory

	const px = (x: number) => homeX + x * scale;
	const py = (z: number) => homeY - z * scale;

	const counts = new Map<ResultCategory, number>();
	for (const row of shown) counts.set(row.category, (counts.get(row.category) ?? 0) + 1);

	return (
		<div>
			<svg viewBox={`0 0 ${W} ${H}`} className="w-full rounded-lg border border-night-700 bg-night-850">
				{/* Distance arcs */}
				{[30, 60, 90, 120].map((r) => {
					const rr = r * scale;
					return (
						<g key={r}>
							<path
								d={`M ${homeX - rr * Math.SQRT1_2} ${homeY - rr * Math.SQRT1_2} A ${rr} ${rr} 0 0 1 ${homeX + rr * Math.SQRT1_2} ${homeY - rr * Math.SQRT1_2}`}
								fill="none"
								stroke="#2b2b40"
								strokeWidth="1"
							/>
							<text
								x={homeX}
								y={homeY - rr - 3}
								textAnchor="middle"
								className="fill-fog-500"
								fontSize="9"
							>
								{r} m
							</text>
						</g>
					);
				})}
				{/* Foul lines */}
				<line
					x1={homeX}
					y1={homeY}
					x2={homeX - (H - 45) * Math.SQRT1_2}
					y2={homeY - (H - 45) * Math.SQRT1_2}
					stroke="#2b2b40"
					strokeWidth="1.5"
				/>
				<line
					x1={homeX}
					y1={homeY}
					x2={homeX + (H - 45) * Math.SQRT1_2}
					y2={homeY - (H - 45) * Math.SQRT1_2}
					stroke="#2b2b40"
					strokeWidth="1.5"
				/>
				<text x={homeX - 100} y={homeY + 14} textAnchor="middle" className="fill-fog-500" fontSize="9">
					3B line
				</text>
				<text x={homeX + 100} y={homeY + 14} textAnchor="middle" className="fill-fog-500" fontSize="9">
					1B line
				</text>

				{shown.map((row, i) => {
					const distance = Math.hypot(row.landingX, row.landingZ);
					return (
						<circle
							key={i}
							cx={px(row.landingX)}
							cy={py(row.landingZ)}
							r="3"
							fill={RESULT_COLORS[row.category]}
							fillOpacity="0.8"
						>
							<title>
								{`${row.category === 'hr' ? 'Home run' : row.category} · ${distance.toFixed(0)} m · frame ${row.frame}`}
							</title>
						</circle>
					);
				})}
			</svg>
			<div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-fog-300">
				{LEGEND.map(({ category, label }) => (
					<span key={category} className="inline-flex items-center gap-1.5">
						<span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: RESULT_COLORS[category] }} />
						{label} ({counts.get(category) ?? 0})
					</span>
				))}
				{rows.length > MAX_SPRAY_POINTS && (
					<span className="text-fog-500">showing latest {MAX_SPRAY_POINTS.toLocaleString()}</span>
				)}
			</div>
		</div>
	);
}
