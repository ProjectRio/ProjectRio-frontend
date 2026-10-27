'use client';

// Swing lab: for one character, across any set of game modes, which contact
// frame / stick hold / swing type actually produced the best results.
//
// Shape of the thing: one fetch per mode (cached, so groups share work), then
// every panel below is a pure function of (contacts × filters). The matrix is
// the primary control — selecting a cell narrows the 3D flights and the
// headline to that exact swing.

import { useEffect, useMemo, useRef, useState } from 'react';
import { useTagsets } from '@/lib/useTagsets';
import { characters, characterClasses } from '@/lib/data/characters';
import { CharPortrait } from '@/components/player/widgets';
import {
	bucketBy,
	sortBuckets,
	swingStats,
	stickLabel,
	formatBa,
	useLandingDataModes,
	CONTACT_TYPES,
	SWING_TYPES,
	type LandingRow,
	type RankMetric
} from '@/lib/landingData';
import { PageHeader, Panel, PanelHeader, Spinner, EmptyState, ErrorState } from '@/components/ui';
import ModeGroupPicker from './ModeGroupPicker';
import SwingMatrix, { cellMatches, type CellKey } from './SwingMatrix';
import BucketBars from './BucketBars';
import TrajectoryView from './TrajectoryView';

const DEFAULT_CHARACTER = 'Mario';

// All colour variants of a character share one swing model, so they share one
// pool of contacts.
function groupCharIds(characterName: string): number[] {
	const simplified = characterClasses[characterName]?.SimplifiedName ?? characterName;
	return Object.entries(characters)
		.filter(([, name]) => (characterClasses[name]?.SimplifiedName ?? name) === simplified)
		.map(([id]) => Number(id));
}

type SwingFilter = 'all' | 1 | 2 | 3;

export default function SwingLab() {
	const tagsets = useTagsets();
	const [modes, setModes] = useState<string[]>([]);
	const modesTouched = useRef(false);
	const [characterName, setCharacterName] = useState(DEFAULT_CHARACTER);
	const [charPickerOpen, setCharPickerOpen] = useState(false);
	const [metric, setMetric] = useState<RankMetric>('ba');
	const [minAb, setMinAb] = useState(15);
	const [swing, setSwing] = useState<SwingFilter>('all');
	const [hand, setHand] = useState<'R' | 'L' | null>(null);
	const [cell, setCell] = useState<CellKey | null>(null);

	// Seed with the newest competitive Superstars Off season — the mode most
	// people mean by "the meta" — until the user picks for themselves.
	useEffect(() => {
		if (modesTouched.current || modes.length > 0 || tagsets.length === 0) return;
		const seed = tagsets
			.filter((tagset) => /superstars off|stars off/i.test(tagset.name))
			.filter((tagset) => !/practice|training|test|hazard|random/i.test(tagset.name))
			.sort((a, b) => (b.start_date ?? 0) - (a.start_date ?? 0))[0];
		if (seed) setModes([seed.name]);
	}, [tagsets, modes.length]);

	const charIds = useMemo(() => groupCharIds(characterName), [characterName]);
	const { rows, loading, loaded, total, error } = useLandingDataModes(modes, charIds);

	// A stance has to be pinned: mixing lefty and righty contacts mirrors the
	// spray and scrambles the pull/push reading. Default to the busier one.
	const leftyCount = useMemo(() => (rows ?? []).filter((row) => row.battingHand).length, [rows]);
	const rightyCount = (rows?.length ?? 0) - leftyCount;
	const lefty = (hand ?? (leftyCount > rightyCount ? 'L' : 'R')) === 'L';

	const filtered = useMemo(() => {
		let out = (rows ?? []).filter((row) => row.battingHand === lefty);
		if (swing !== 'all') out = out.filter((row) => row.typeOfSwing === swing);
		return out;
	}, [rows, lefty, swing]);

	const selection = useMemo(
		() => (cell ? filtered.filter((row) => cellMatches(row, cell)) : filtered),
		[filtered, cell]
	);

	const headline = useMemo(() => swingStats(selection), [selection]);

	const frameBuckets = useMemo(
		() =>
			sortBuckets(
				bucketBy(
					filtered,
					(row) => row.frame,
					(frame) => `Frame ${frame}`
				),
				metric,
				minAb
			),
		[filtered, metric, minAb]
	);

	const stickBuckets = useMemo(
		() =>
			sortBuckets(
				bucketBy(
					filtered,
					(row) => `${row.stick.x}|${row.stick.y}`,
					(_key, group) => stickLabel(group[0].stick, lefty)
				),
				metric,
				minAb
			),
		[filtered, metric, minAb, lefty]
	);

	const swingBuckets = useMemo(
		() =>
			sortBuckets(
				bucketBy(
					filtered,
					(row) => row.typeOfSwing,
					(type) => SWING_TYPES[type as number] ?? `Swing ${type}`
				),
				metric,
				minAb
			),
		[filtered, metric, minAb]
	);

	const contactBuckets = useMemo(
		() =>
			sortBuckets(
				bucketBy(
					filtered,
					(row) => row.typeOfContact,
					(type) => CONTACT_TYPES[type as number] ?? `Contact ${type}`
				),
				metric,
				minAb
			),
		[filtered, metric, minAb]
	);

	// The one line the page exists to produce.
	const best = frameBuckets[0]?.ab >= minAb ? frameBuckets[0] : null;
	const bestStick = stickBuckets[0]?.ab >= minAb ? stickBuckets[0] : null;

	const gameCount = useMemo(
		() => (rows ? new Set(rows.map((row) => row.gameId)).size : 0),
		[rows]
	);

	const selectionLabel = cell
		? `Frame ${cell.frame} · ${stickLabel(
				{ mask: 0, x: cell.stickX as any, y: cell.stickY as any },
				lefty
			)}`
		: 'All swings shown';

	return (
		<div>
			<PageHeader kicker="Swing Lab" title="Batting & Landing Trajectory">
				{rows && !loading && (
					<p className="text-sm text-fog-500" style={{ fontVariantNumeric: 'tabular-nums' }}>
						<span className="font-semibold text-fog-100">
							{(rows.length ?? 0).toLocaleString()}
						</span>{' '}
						recorded contacts · {gameCount.toLocaleString()} games · {modes.length} mode
						{modes.length === 1 ? '' : 's'}
					</p>
				)}
			</PageHeader>

			<div className="grid gap-6 lg:grid-cols-[300px_minmax(0,1fr)] xl:grid-cols-[320px_minmax(0,1fr)]">
				<div className="lg:sticky lg:top-20 lg:max-h-[calc(100vh-6rem)] lg:self-start lg:overflow-y-auto">
					<Panel>
						<PanelHeader title="Filters" />
						<div className="space-y-4 p-4">
							{/* Character */}
							<div className="relative">
								<span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-widest text-fog-500">
									Character
								</span>
								<button
									type="button"
									onClick={() => setCharPickerOpen(!charPickerOpen)}
									className="flex w-full items-center gap-2 rounded border border-night-600 bg-night-850 px-2 py-1.5 text-left text-sm text-fog-100 transition-colors hover:border-rio-400"
								>
									<CharPortrait name={characterName} size={24} />
									{characterName}
								</button>
								{charPickerOpen && (
									<div className="absolute left-0 top-full z-30 mt-1 w-full rounded-lg border border-night-600 bg-night-850 p-2 shadow-xl">
										<div className="grid max-h-64 grid-cols-6 gap-1 overflow-y-auto pr-1">
											{[
												...new Set(
													Object.values(characters).map(
														(name) => characterClasses[name]?.SimplifiedName ?? name
													)
												)
											]
												.sort()
												.map((name) => (
													<button
														key={name}
														type="button"
														title={name}
														onClick={() => {
															setCharacterName(name);
															setCell(null);
															setHand(null);
															setCharPickerOpen(false);
														}}
														className={`rounded p-1 transition-colors ${
															name === characterName
																? 'bg-rio-500/25 ring-1 ring-rio-400'
																: 'hover:bg-night-700'
														}`}
													>
														<CharPortrait name={name} size={32} />
													</button>
												))}
										</div>
									</div>
								)}
							</div>

							<ModeGroupPicker
								tagsets={tagsets}
								value={modes}
								onChange={(next) => {
									modesTouched.current = true;
									setModes(next);
									setCell(null);
								}}
							/>

							{/* Stance */}
							<div>
								<span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-widest text-fog-500">
									Stance
								</span>
								<div className="flex gap-1">
									{(
										[
											{ label: `Righty · ${rightyCount}`, value: 'R' },
											{ label: `Lefty · ${leftyCount}`, value: 'L' }
										] as const
									).map((opt) => (
										<button
											key={opt.value}
											onClick={() => {
												setHand(opt.value);
												setCell(null);
											}}
											className={`rounded border px-2 py-1 text-xs font-semibold transition-colors ${
												(lefty ? 'L' : 'R') === opt.value
													? 'border-star-500/60 bg-star-500/15 text-star-400'
													: 'border-night-600 bg-night-850 text-fog-500 hover:text-fog-300'
											}`}
										>
											{opt.label}
										</button>
									))}
								</div>
							</div>

							{/* Swing type */}
							<div>
								<span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-widest text-fog-500">
									Swing
								</span>
								<div className="flex flex-wrap gap-1">
									{(
										[
											{ label: 'All', value: 'all' },
											{ label: 'Slap', value: 1 },
											{ label: 'Charge', value: 2 },
											{ label: 'Star', value: 3 }
										] as const
									).map((opt) => (
										<button
											key={String(opt.value)}
											onClick={() => {
												setSwing(opt.value as SwingFilter);
												setCell(null);
											}}
											className={`rounded border px-2.5 py-1 text-xs font-semibold transition-colors ${
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

							{/* Metric */}
							<div>
								<span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-widest text-fog-500">
									Rank by
								</span>
								<div className="flex gap-1">
									{(
										[
											{ label: 'BA', value: 'ba' },
											{ label: 'SLG', value: 'slg' }
										] as const
									).map((opt) => (
										<button
											key={opt.value}
											onClick={() => setMetric(opt.value)}
											className={`rounded border px-2.5 py-1 text-xs font-semibold transition-colors ${
												metric === opt.value
													? 'border-rio-500/60 bg-rio-500/20 text-rio-300'
													: 'border-night-600 bg-night-850 text-fog-500 hover:text-fog-300'
											}`}
										>
											{opt.label}
										</button>
									))}
								</div>
							</div>

							{/* Minimum sample */}
							<div>
								<div className="mb-1 flex items-center justify-between">
									<span className="text-[11px] font-semibold uppercase tracking-widest text-fog-500">
										Min at-bats
									</span>
									<span className="font-display text-xs font-bold tabular-nums text-fog-100">
										{minAb}
									</span>
								</div>
								<input
									type="range"
									min={1}
									max={60}
									value={minAb}
									onChange={(event) => setMinAb(Number(event.target.value))}
									className="w-full accent-rio-500"
								/>
								<p className="text-[10px] text-fog-500">
									Buckets under this sink to the bottom and fade out.
								</p>
							</div>
						</div>
					</Panel>
				</div>

				<div className="min-w-0 space-y-6">
					{error && <ErrorState message={error} />}

					{modes.length === 0 && !loading && (
						<Panel>
							<EmptyState
								title="Pick a game mode"
								detail="Choose a ruleset group or individual modes in the rail to load every recorded contact for this character."
							/>
						</Panel>
					)}

					{loading && (
						<Panel>
							<Spinner
								label={
									total > 1
										? `Loading recorded contacts… (${loaded}/${total} modes)`
										: 'Loading every recorded contact… the first load of a mode can take a moment'
								}
							/>
						</Panel>
					)}

					{rows && !loading && filtered.length === 0 && modes.length > 0 && (
						<Panel>
							<EmptyState
								title="No contacts match"
								detail="No recorded contact for this character with these filters. Try another mode, stance or swing type."
							/>
						</Panel>
					)}

					{rows && !loading && filtered.length > 0 && (
						<>
							{(best || bestStick) && (
								<Panel>
									<div className="grid gap-4 p-4 sm:grid-cols-2">
										{best && (
											<div>
												<span className="text-[11px] font-semibold uppercase tracking-widest text-fog-500">
													Best contact frame
												</span>
												<p className="font-display text-2xl font-bold text-fog-100">
													{best.label}
												</p>
												<p className="text-xs text-fog-500">
													{formatBa(best[metric])} {metric.toUpperCase()} on {best.ab} AB
												</p>
											</div>
										)}
										{bestStick && (
											<div>
												<span className="text-[11px] font-semibold uppercase tracking-widest text-fog-500">
													Best stick hold
												</span>
												<p className="font-display text-2xl font-bold text-fog-100">
													{bestStick.label}
												</p>
												<p className="text-xs text-fog-500">
													{formatBa(bestStick[metric])} {metric.toUpperCase()} on{' '}
													{bestStick.ab} AB
												</p>
											</div>
										)}
									</div>
								</Panel>
							)}

							<Panel>
								<PanelHeader
									title="Frame × stick"
									action={
										<span className="text-xs text-fog-500">
											click a cell to isolate it
										</span>
									}
								/>
								<SwingMatrix
									rows={filtered}
									metric={metric}
									minAb={minAb}
									lefty={lefty}
									selected={cell}
									onSelect={setCell}
								/>
							</Panel>

							<Panel>
								<PanelHeader
									title="Landing trajectories"
									action={
										<span className="flex items-center gap-3 text-xs text-fog-500">
											<span>{selectionLabel}</span>
											{cell && (
												<button
													onClick={() => setCell(null)}
													className="text-rio-300 hover:text-rio-400"
												>
													Clear
												</button>
											)}
										</span>
									}
								/>
								<div className="border-b border-night-700 px-4 py-2 text-sm text-fog-300">
									<span className="font-display text-xl font-bold text-fog-100">
										{formatBa(headline.ba)}
									</span>{' '}
									BA ·{' '}
									<span className="font-display text-xl font-bold text-fog-100">
										{formatBa(headline.slg)}
									</span>{' '}
									SLG · {headline.hits}/{headline.ab} · {headline.homers} HR ·{' '}
									{Math.round((headline.foulRate ?? 0) * 100)}% fouled
								</div>
								<TrajectoryView rows={selection} />
							</Panel>

							<div className="grid gap-6 lg:grid-cols-2">
								<Panel>
									<PanelHeader title="By contact frame" />
									<BucketBars buckets={frameBuckets} metric={metric} minAb={minAb} />
								</Panel>
								<Panel>
									<PanelHeader title="By stick hold" />
									<BucketBars buckets={stickBuckets} metric={metric} minAb={minAb} />
								</Panel>
								<Panel>
									<PanelHeader title="By swing type" />
									<BucketBars buckets={swingBuckets} metric={metric} minAb={minAb} />
								</Panel>
								<Panel>
									<PanelHeader title="By contact quality" />
									<BucketBars buckets={contactBuckets} metric={metric} minAb={minAb} />
								</Panel>
							</div>

							<p className="px-1 text-xs leading-relaxed text-fog-500">
								<span className="font-semibold text-fog-300">How to read this:</span> every row
								is one recorded contact, so fouls count against a swing here even though they
								never reach an at-bat line — the fouled percentage is the share of contacts
								that didn&apos;t end the plate appearance. BA and SLG are computed over
								at-bat-ending contact only, with reached-on-error counting as an at-bat
								without a hit. Stick holds are named relative to the stance: &quot;pull&quot;
								is toward the batter&apos;s power side. The 3D flights are reconstructed from
								each contact&apos;s recorded launch point, apex and landing spot, not
								re-simulated — for a bit-exact replay of one swing, open that game&apos;s
								visualizer.
							</p>
						</>
					)}
				</div>
			</div>
		</div>
	);
}
