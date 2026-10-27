'use client';

import type { TagSet } from '@/lib/api';
import { stadiums } from '@/lib/data/characters';
import { countActiveFilters, EMPTY_FILTERS, type AnalyticsFilters } from '@/lib/charAnalytics';
import { CharMultiPicker, FieldLabel, ModeMultiPicker, PlayerMultiPicker } from './pickers';

// The whole left rail: data scope (modes), roster construction filters, match
// context filters, and display options. Filters describe the ANALYZED team —
// every game contributes two team rows, and rows that match are what get
// aggregated — so "Team includes" + "Opponent includes" reads naturally.

export interface DisplayOptions {
	groupVariants: boolean;
	excludeMirrors: boolean;
	minGames: number;
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
	return (
		<div className="border-t border-night-700 px-4 py-4 first:border-t-0">
			<p className="mb-3 font-display text-xs font-bold uppercase tracking-widest text-fog-300">
				{title}
			</p>
			<div className="space-y-4">{children}</div>
		</div>
	);
}

function Toggle({
	label,
	hint,
	checked,
	onChange
}: {
	label: string;
	hint?: string;
	checked: boolean;
	onChange: (checked: boolean) => void;
}) {
	return (
		<label className="flex cursor-pointer items-start gap-2.5">
			<input
				type="checkbox"
				className="mt-0.5 h-4 w-4 accent-rio-500"
				checked={checked}
				onChange={(event) => onChange(event.target.checked)}
			/>
			<span>
				<span className="block text-sm text-fog-100">{label}</span>
				{hint && <span className="block text-xs text-fog-500">{hint}</span>}
			</span>
		</label>
	);
}

function dateToUnix(value: string, endOfDay: boolean): number | null {
	if (!value) return null;
	const ms = Date.parse(`${value}T${endOfDay ? '23:59:59' : '00:00:00'}`);
	return Number.isNaN(ms) ? null : Math.floor(ms / 1000);
}

function unixToDate(value: number | null): string {
	if (value == null) return '';
	// Format in local time (matching dateToUnix) — toISOString would shift the
	// displayed day for viewers east of UTC.
	const date = new Date(value * 1000);
	const pad = (n: number) => String(n).padStart(2, '0');
	return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export default function FilterPanel({
	tagsets,
	modes,
	onModesChange,
	filters,
	onFiltersChange,
	display,
	onDisplayChange,
	allUsers
}: {
	tagsets: TagSet[];
	modes: string[];
	onModesChange: (modes: string[]) => void;
	filters: AnalyticsFilters;
	onFiltersChange: (filters: AnalyticsFilters) => void;
	display: DisplayOptions;
	onDisplayChange: (display: DisplayOptions) => void;
	allUsers: string[];
}) {
	const set = (patch: Partial<AnalyticsFilters>) => onFiltersChange({ ...filters, ...patch });
	const activeCount = countActiveFilters(filters);

	return (
		<div className="panel overflow-visible">
			<div className="flex items-center justify-between border-b border-night-700 bg-night-850 px-4 py-3">
				<h2 className="font-display text-sm font-bold uppercase tracking-widest text-fog-300">
					Filters
				</h2>
				{activeCount > 0 && (
					<button
						type="button"
						className="text-xs font-medium text-rio-300 transition-colors hover:text-rio-400"
						onClick={() => onFiltersChange(EMPTY_FILTERS)}
					>
						Clear all ({activeCount})
					</button>
				)}
			</div>

			<Section title="Data">
				<ModeMultiPicker tagsets={tagsets} value={modes} onChange={onModesChange} />
			</Section>

			<Section title="Team construction">
				<CharMultiPicker
					label="Team includes all of"
					hint="every pick required"
					value={filters.teamAll}
					onChange={(teamAll) => set({ teamAll })}
				/>
				<CharMultiPicker
					label="Team includes any of"
					hint="at least one"
					value={filters.teamAny}
					onChange={(teamAny) => set({ teamAny })}
				/>
				<CharMultiPicker
					label="Team excludes"
					value={filters.teamNone}
					onChange={(teamNone) => set({ teamNone })}
				/>
				<CharMultiPicker
					label="Team captain is"
					value={filters.captains}
					onChange={(captains) => set({ captains })}
				/>
			</Section>

			<Section title="Opposition">
				<CharMultiPicker
					label="Opponent includes all of"
					value={filters.oppAll}
					onChange={(oppAll) => set({ oppAll })}
				/>
				<CharMultiPicker
					label="Opponent excludes"
					value={filters.oppNone}
					onChange={(oppNone) => set({ oppNone })}
				/>
				<CharMultiPicker
					label="Opponent captain is"
					value={filters.oppCaptains}
					onChange={(oppCaptains) => set({ oppCaptains })}
				/>
			</Section>

			<Section title="Players & rating">
				<PlayerMultiPicker
					label="Only these players"
					hint="the team being analyzed"
					value={filters.players}
					onChange={(players) => set({ players })}
					allUsers={allUsers}
				/>
				<PlayerMultiPicker
					label="Against these players"
					value={filters.vsPlayers}
					onChange={(vsPlayers) => set({ vsPlayers })}
					allUsers={allUsers}
				/>
				<PlayerMultiPicker
					label="Exclude players"
					hint="drops their games entirely"
					value={filters.excludePlayers}
					onChange={(excludePlayers) => set({ excludePlayers })}
					allUsers={allUsers}
				/>
				<div>
					<FieldLabel hint="player rating going into the game">Rating range</FieldLabel>
					<div className="flex items-center gap-2">
						<input
							type="number"
							className="input !py-1.5 text-sm"
							placeholder="Min"
							value={filters.eloMin ?? ''}
							onChange={(event) =>
								set({ eloMin: event.target.value === '' ? null : Number(event.target.value) })
							}
						/>
						<span className="text-fog-500">–</span>
						<input
							type="number"
							className="input !py-1.5 text-sm"
							placeholder="Max"
							value={filters.eloMax ?? ''}
							onChange={(event) =>
								set({ eloMax: event.target.value === '' ? null : Number(event.target.value) })
							}
						/>
					</div>
				</div>
				<Toggle
					label="Ranked games only"
					hint="drop games with no recorded rating"
					checked={filters.rankedOnly}
					onChange={(rankedOnly) => set({ rankedOnly })}
				/>
			</Section>

			<Section title="Match context">
				<div>
					<FieldLabel>Date range</FieldLabel>
					<div className="flex items-center gap-2">
						<input
							type="date"
							className="input !py-1.5 text-sm"
							value={unixToDate(filters.dateFrom)}
							onChange={(event) => set({ dateFrom: dateToUnix(event.target.value, false) })}
						/>
						<span className="text-fog-500">–</span>
						<input
							type="date"
							className="input !py-1.5 text-sm"
							value={unixToDate(filters.dateTo)}
							onChange={(event) => set({ dateTo: dateToUnix(event.target.value, true) })}
						/>
					</div>
				</div>
				<div>
					<FieldLabel>Stadiums</FieldLabel>
					<div className="flex flex-wrap gap-1.5">
						{Object.entries(stadiums).map(([id, name]) => {
							const stadiumId = Number(id);
							const active = filters.stadiums.includes(stadiumId);
							return (
								<button
									key={id}
									type="button"
									className={`rounded border px-2 py-1 text-xs transition-colors ${
										active
											? 'border-rio-400 bg-rio-500/20 text-fog-100'
											: 'border-night-600 text-fog-500 hover:text-fog-100'
									}`}
									onClick={() =>
										set({
											stadiums: active
												? filters.stadiums.filter((v) => v !== stadiumId)
												: [...filters.stadiums, stadiumId]
										})
									}
								>
									{name}
								</button>
							);
						})}
					</div>
				</div>
			</Section>

			<Section title="Display">
				<Toggle
					label="Group color variants"
					hint="Toads, Shy Guys, Magikoopas… as one row"
					checked={display.groupVariants}
					onChange={(groupVariants) => onDisplayChange({ ...display, groupVariants })}
				/>
				<Toggle
					label="Ignore mirror picks"
					hint="skip games where both teams picked the character"
					checked={display.excludeMirrors}
					onChange={(excludeMirrors) => onDisplayChange({ ...display, excludeMirrors })}
				/>
				<div>
					<FieldLabel hint="hides tiny samples">Min games</FieldLabel>
					<input
						type="number"
						min={1}
						className="input !w-24 !py-1.5 text-sm"
						value={display.minGames}
						onChange={(event) =>
							onDisplayChange({ ...display, minGames: Math.max(1, Number(event.target.value) || 1) })
						}
					/>
				</div>
			</Section>
		</div>
	);
}
