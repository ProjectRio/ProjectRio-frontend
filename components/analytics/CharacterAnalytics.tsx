'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { getAllUsers } from '@/lib/api';
import { useTagsets } from '@/lib/useTagsets';
import { newestModeName } from '@/lib/playerHistory';
import {
	applyFilters,
	buildTeamRows,
	characterGroups,
	charStats,
	pairStats,
	EMPTY_FILTERS,
	useModesGames,
	type AnalyticsFilters
} from '@/lib/charAnalytics';
import { PageHeader, Panel, PanelHeader, Spinner, EmptyState, ErrorState } from '@/components/ui';
import FilterPanel, { type DisplayOptions } from './FilterPanel';
import CharTable, { OutlierCallouts } from './CharTable';
import PickWinScatter from './PickWinScatter';
import SynergyPanel from './SynergyPanel';
import CharDetail from './CharDetail';

// Page orchestrator: one fetch per selected mode, then every view below is a
// pure function of (rows × filters × display options). The through-line is
// "who wins more than they should": every panel compares actual win rate to
// the ELO-implied expectation over the exact same games.

export default function CharacterAnalytics() {
	const tagsets = useTagsets();
	const [modes, setModes] = useState<string[]>([]);
	const modesTouched = useRef(false);
	const [filters, setFilters] = useState<AnalyticsFilters>(EMPTY_FILTERS);
	const [display, setDisplay] = useState<DisplayOptions>({
		groupVariants: false,
		excludeMirrors: false,
		minGames: 20
	});
	const [selectedKey, setSelectedKey] = useState<string | null>(null);
	const [allUsers, setAllUsers] = useState<string[]>([]);

	// Default to the newest real mode once tagsets arrive (unless the user
	// already picked something).
	useEffect(() => {
		if (modesTouched.current || modes.length > 0 || tagsets.length === 0) return;
		const newest = newestModeName(tagsets);
		if (newest) setModes([newest]);
	}, [tagsets, modes.length]);

	useEffect(() => {
		getAllUsers().then(setAllUsers).catch(() => setAllUsers([]));
	}, []);

	const { games, loading, loadedCount, error } = useModesGames(modes);

	const allRows = useMemo(() => (games ? buildTeamRows(games) : []), [games]);
	const rows = useMemo(() => applyFilters(allRows, filters), [allRows, filters]);
	const groups = useMemo(() => characterGroups(display.groupVariants), [display.groupVariants]);
	const aggs = useMemo(
		() => charStats(rows, groups, display.excludeMirrors),
		[rows, groups, display.excludeMirrors]
	);
	const shownAggs = useMemo(
		() => aggs.filter((agg) => agg.games >= display.minGames),
		[aggs, display.minGames]
	);
	const pairs = useMemo(
		() => pairStats(rows, groups, display.excludeMirrors),
		[rows, groups, display.excludeMirrors]
	);

	const selectedAgg = shownAggs.find((agg) => agg.group.key === selectedKey) ?? null;

	const gameCount = rows.length > 0 ? new Set(rows.map((row) => row.gameId)).size : 0;
	const rankedShare = rows.length > 0 ? rows.filter((row) => row.ranked).length / rows.length : 0;
	const dateSpan = useMemo(() => {
		if (rows.length === 0) return null;
		let min = Infinity;
		let max = 0;
		for (const row of rows) {
			if (!row.date) continue;
			if (row.date < min) min = row.date;
			if (row.date > max) max = row.date;
		}
		if (!Number.isFinite(min) || max === 0) return null;
		const format = (unix: number) =>
			new Date(unix * 1000).toLocaleDateString(undefined, { month: 'short', year: 'numeric' });
		return `${format(min)} – ${format(max)}`;
	}, [rows]);

	return (
		<div>
			<PageHeader kicker="Analytics Lab" title="Character Win Rates">
				{games && !loading && (
					<p className="text-sm text-fog-500" style={{ fontVariantNumeric: 'tabular-nums' }}>
						<span className="font-semibold text-fog-100">{gameCount.toLocaleString()}</span> games
						{dateSpan && <span> · {dateSpan}</span>}
						<span> · {Math.round(rankedShare * 100)}% ranked</span>
					</p>
				)}
			</PageHeader>

			<div className="grid gap-6 lg:grid-cols-[300px_minmax(0,1fr)] xl:grid-cols-[320px_minmax(0,1fr)]">
				<div className="lg:sticky lg:top-20 lg:max-h-[calc(100vh-6rem)] lg:self-start lg:overflow-y-auto">
					<FilterPanel
						tagsets={tagsets}
						modes={modes}
						onModesChange={(next) => {
							modesTouched.current = true;
							setModes(next);
						}}
						filters={filters}
						onFiltersChange={setFilters}
						display={display}
						onDisplayChange={setDisplay}
						allUsers={allUsers}
					/>
				</div>

				<div className="min-w-0 space-y-6">
					{error && <ErrorState message={error} />}

					{modes.length === 0 && !loading && (
						<Panel>
							<EmptyState
								title="Pick a game mode"
								detail="Add one or more game modes in the filter rail to load their full game history."
							/>
						</Panel>
					)}

					{loading && (
						<Panel>
							<Spinner
								label={
									modes.length > 1
										? `Loading game history… (${loadedCount}/${modes.length} modes)`
										: 'Loading full game history…'
								}
							/>
						</Panel>
					)}

					{games && !loading && rows.length === 0 && modes.length > 0 && (
						<Panel>
							<EmptyState
								title="No games match"
								detail="These filters eliminated every game. Try removing a character or player constraint."
							/>
						</Panel>
					)}

					{games && !loading && rows.length > 0 && (
						<>
							<OutlierCallouts aggs={shownAggs} />

							{selectedAgg && (
								<CharDetail
									agg={selectedAgg}
									rows={rows}
									groups={groups}
									excludeMirrors={display.excludeMirrors}
									minGames={display.minGames}
									onClose={() => setSelectedKey(null)}
								/>
							)}

							<Panel>
								<PanelHeader title="Pick rate vs win rate" />
								<div className="px-4 pt-4">
									<PickWinScatter
										aggs={shownAggs}
										selectedKey={selectedKey}
										onSelect={(key) => setSelectedKey(key === selectedKey ? null : key)}
									/>
								</div>
							</Panel>

							<Panel>
								<PanelHeader
									title="Character leaderboard"
									action={
										<span className="text-xs text-fog-500">
											click a row to inspect · min {display.minGames} games
										</span>
									}
								/>
								<CharTable
									aggs={shownAggs}
									selectedKey={selectedKey}
									onSelect={(key) => setSelectedKey(key === selectedKey ? null : key)}
								/>
							</Panel>

							<Panel>
								<PanelHeader
									title="Duo synergy"
									action={
										<span className="text-xs text-fog-500">
											win rate when drafted together
										</span>
									}
								/>
								<SynergyPanel pairs={pairs} minGames={display.minGames} />
							</Panel>

							<p className="px-1 text-xs leading-relaxed text-fog-500">
								<span className="font-semibold text-fog-300">How to read this:</span> every game
								counts once for each team, and win rate is the headline stat. The{' '}
								<span className="text-fog-300">xWin%</span> and{' '}
								<span className="text-fog-300">± Expected</span> columns compare a
								character&apos;s results to the win probability implied by the two players&apos;
								Glicko-2 ratings — useful context because strong players gravitate to meta picks —
								but treat them as experimental: ratings restart at 1500 in every mode, the game
								payload doesn&apos;t carry rating deviation, so early-mode and small-mode
								expectations are unreliable. Small samples are noisy in general: at 50 games,
								±7 pp is within normal variance.
							</p>
						</>
					)}
				</div>
			</div>
		</div>
	);
}
