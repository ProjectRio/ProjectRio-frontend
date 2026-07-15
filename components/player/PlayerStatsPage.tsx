'use client';

import { useEffect, useState } from 'react';
import {
	getRecentGames,
	getUserBattingStats,
	getUserPitchingStats,
	DEFAULT_MODE
} from '@/lib/api';
import {
	getPa,
	getAvg,
	getObp,
	getSlg,
	getOps,
	getIpString,
	getOppAvg,
	getKPct,
	getERA,
	fmtRate
} from '@/lib/statCalcs';
import { useTagsets } from '@/lib/useTagsets';
import { usePlayerHistory, lastPlayedModeName, newestModeName, displayName } from '@/lib/playerHistory';
import { BattingStatsTable, PitchingStatsTable, type StatRow } from '@/components/StatsTables';
import { PageHeader, Panel, PanelHeader, Spinner, ErrorState, EmptyState } from '@/components/ui';
import PlayerNav from './PlayerNav';
import ModePicker from './ModePicker';
import { StatBlock } from './widgets';

// Perfect/nice/sour contact distribution as a stacked bar.
function ContactQualityBar({ stats }: { stats: any }) {
	const perfect = stats?.perfect_hits ?? 0;
	const nice = stats?.nice_hits ?? 0;
	const sour = stats?.sour_hits ?? 0;
	const total = perfect + nice + sour;
	if (total === 0) return null;
	const segments = [
		{ label: 'Perfect', count: perfect, color: 'bg-star-500' },
		{ label: 'Nice', count: nice, color: 'bg-emerald-500/80' },
		{ label: 'Sour', count: sour, color: 'bg-night-600' }
	];
	return (
		<div>
			<p className="text-[11px] font-semibold uppercase tracking-widest text-fog-500">Contact Quality</p>
			<div className="mt-2 flex h-2.5 overflow-hidden rounded-full">
				{segments.map((segment) => (
					<div key={segment.label} className={segment.color} style={{ width: `${(segment.count / total) * 100}%` }} />
				))}
			</div>
			<div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-fog-500">
				{segments.map((segment) => (
					<span key={segment.label} className="flex items-center gap-1.5">
						<span className={`h-2 w-2 rounded-full ${segment.color}`} />
						{segment.label} {Math.round((segment.count / total) * 100)}%
					</span>
				))}
			</div>
		</div>
	);
}

export default function PlayerStatsPage({ user, kind }: { user: string; kind: 'batting' | 'pitching' }) {
	const tagsets = useTagsets();
	const { games: history } = usePlayerHistory(user);
	const [mode, setMode] = useState<string | null>(null);
	const [data, setData] = useState<{ overall: any; byChar: any } | null>(null);
	const [error, setError] = useState<string | null>(null);

	// Default to a mode this player actually appears in (their most recent),
	// falling back to the newest mode site-wide — never a hardcoded old season.
	useEffect(() => {
		if (mode !== null || tagsets.length === 0) return;
		let cancelled = false;
		getRecentGames({ limit: 10, username: user })
			.then((recent) => {
				if (cancelled) return;
				setMode(lastPlayedModeName(recent, tagsets) ?? newestModeName(tagsets) ?? DEFAULT_MODE);
			})
			.catch(() => {
				if (!cancelled) setMode(newestModeName(tagsets) ?? DEFAULT_MODE);
			});
		return () => {
			cancelled = true;
		};
	}, [mode, tagsets, user]);

	useEffect(() => {
		if (!mode) return;
		let cancelled = false;
		setData(null);
		setError(null);
		const load = kind === 'batting' ? getUserBattingStats : getUserPitchingStats;
		load(user, mode)
			.then((result) => {
				if (!cancelled) setData(result);
			})
			.catch(() => {
				if (!cancelled) setError(`Could not load ${kind} stats.`);
			});
		return () => {
			cancelled = true;
		};
	}, [user, mode, kind]);

	const overall = data?.overall?.[kind === 'batting' ? 'Batting' : 'Pitching'];
	const rows: StatRow[] = [];
	if (overall) rows.push({ title: 'ALL', stats: overall, highlight: true });
	if (data?.byChar) {
		const key = kind === 'batting' ? 'Batting' : 'Pitching';
		const sortValue = (stats: any) => (kind === 'batting' ? getPa(stats) : (stats?.batters_faced ?? 0));
		const chars = Object.keys(data.byChar).sort(
			(a, b) => sortValue(data.byChar[b]?.[key]) - sortValue(data.byChar[a]?.[key])
		);
		for (const char of chars) {
			rows.push({
				title: char,
				href: `/characters/${encodeURIComponent(char)}/${kind}`,
				stats: data.byChar[char]?.[key]
			});
		}
	}

	const title = history ? displayName(history, user) : user;

	return (
		<div className="space-y-6">
			<PageHeader kicker={kind === 'batting' ? 'Batting' : 'Pitching'} title={title} />
			<PlayerNav user={user} />

			<div className="flex flex-wrap items-center gap-4">
				{mode && (
					<ModePicker user={user} history={history} tagsets={tagsets} value={mode} onChange={setMode} />
				)}
			</div>

			{error && <ErrorState message={error} />}
			{!error && (!data || !mode) && <Spinner label={`Loading ${kind} stats…`} />}

			{data && !overall && (
				<EmptyState
					title={`No ${kind} data`}
					detail={`No ${kind} stats recorded for ${title} in ${mode}. Try another mode.`}
				/>
			)}

			{overall && (
				<>
					{/* Summary: the headline numbers before the raw table. */}
					<div className="panel space-y-5 p-6">
						{kind === 'batting' ? (
							<>
								<div className="grid grid-cols-2 gap-x-8 gap-y-5 sm:grid-cols-4 lg:grid-cols-8">
									<StatBlock label="AVG" value={fmtRate(getAvg(overall))} />
									<StatBlock label="OBP" value={fmtRate(getObp(overall))} />
									<StatBlock label="SLG" value={fmtRate(getSlg(overall))} />
									<StatBlock label="OPS" value={fmtRate(getOps(overall))} />
									<StatBlock label="HR" value={overall.summary_homeruns ?? 0} />
									<StatBlock label="RBI" value={overall.summary_rbi ?? 0} />
									<StatBlock label="SO" value={overall.summary_strikeouts ?? 0} />
									<StatBlock
										label="BB"
										value={(overall.summary_walks_bb ?? 0) + (overall.summary_walks_hbp ?? 0)}
									/>
								</div>
								<div className="grid gap-5 border-t border-night-700 pt-5 sm:grid-cols-2">
									<ContactQualityBar stats={overall} />
									<div className="text-sm text-fog-500 sm:text-right" style={{ fontVariantNumeric: 'tabular-nums' }}>
										{getPa(overall)} plate appearances in {mode}
									</div>
								</div>
							</>
						) : (
							<div className="grid grid-cols-2 gap-x-8 gap-y-5 sm:grid-cols-4 lg:grid-cols-8">
								<StatBlock label="ERA" value={getERA(overall)} />
								<StatBlock
									label="WHIP"
									value={
										overall.outs_pitched
											? (
													((overall.hits_allowed ?? 0) +
														(overall.walks_bb ?? 0) +
														(overall.walks_hbp ?? 0)) /
													(overall.outs_pitched / 3)
												).toFixed(2)
											: '—'
									}
								/>
								<StatBlock label="K%" value={`${getKPct(overall)}%`} />
								<StatBlock label="Opp AVG" value={getOppAvg(overall)} />
								<StatBlock label="IP" value={getIpString(overall)} />
								<StatBlock label="K" value={overall.strikeouts_pitched ?? 0} />
								<StatBlock label="BB" value={(overall.walks_bb ?? 0) + (overall.walks_hbp ?? 0)} />
								<StatBlock label="Runs" value={overall.runs_allowed ?? 0} />
							</div>
						)}
					</div>

					<Panel>
						<PanelHeader title="By Character" />
						{kind === 'batting' ? (
							<BattingStatsTable label="Character" rows={rows} />
						) : (
							<PitchingStatsTable label="Character" rows={rows} />
						)}
					</Panel>
				</>
			)}
		</div>
	);
}
