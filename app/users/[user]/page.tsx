'use client';

import { use, useMemo } from 'react';
import Link from 'next/link';
import { useTagsets } from '@/lib/useTagsets';
import {
	usePlayerHistory,
	displayName,
	overallRecord,
	modeSummaries,
	captainSummaries,
	rosterUsage,
	rivalSummaries,
	activityByMonth
} from '@/lib/playerHistory';
import { PageHeader, Panel, PanelHeader, Spinner, ErrorState, EmptyState } from '@/components/ui';
import PlayerNav from '@/components/player/PlayerNav';
import GameHistory from '@/components/player/GameHistory';
import { StatBlock, WinRing, Sparkline, UsageBar, FormStrip, CharPortrait } from '@/components/player/widgets';

function pct(wins: number, losses: number): string {
	const total = wins + losses;
	return total === 0 ? '—' : `${Math.round((wins / total) * 100)}%`;
}

export default function UserPage({ params }: { params: Promise<{ user: string }> }) {
	const user = decodeURIComponent(use(params).user);
	const { games, error } = usePlayerHistory(user);
	const tagsets = useTagsets();

	const derived = useMemo(() => {
		if (!games || games.length === 0) return null;
		const modes = modeSummaries(games, user, tagsets);
		const ranked = modes.filter((mode) => mode.currentElo !== null);
		return {
			name: displayName(games, user),
			record: overallRecord(games, user),
			modes,
			currentMode: ranked[0] ?? null,
			peak: ranked.reduce<{ elo: number; mode: string } | null>(
				(best, mode) =>
					mode.peakElo !== null && (!best || mode.peakElo > best.elo)
						? { elo: mode.peakElo, mode: mode.name }
						: best,
				null
			),
			captains: captainSummaries(games, user),
			usage: rosterUsage(games, user),
			rivals: rivalSummaries(games, user),
			activity: activityByMonth(games),
			firstSeen: games[games.length - 1]?.date_time_start,
			lastSeen: games[0]?.date_time_end ?? games[0]?.date_time_start
		};
	}, [games, user, tagsets]);

	if (error) {
		return (
			<div>
				<PageHeader kicker="Player profile" title={user} />
				<ErrorState message="Could not load this player — they may not exist or have no recorded games." />
			</div>
		);
	}

	if (!games) {
		return (
			<div>
				<PageHeader kicker="Player profile" title={user} />
				<PlayerNav user={user} />
				<Spinner label="Loading game history…" />
			</div>
		);
	}

	if (!derived) {
		return (
			<div>
				<PageHeader kicker="Player profile" title={user} />
				<PlayerNav user={user} />
				<EmptyState title="No games found" detail="This player has no recorded games yet." />
			</div>
		);
	}

	const { record } = derived;
	const maxActivity = Math.max(1, ...derived.activity.map((month) => month.count));
	const topCaptains = derived.captains.slice(0, 5);
	const topUsage = derived.usage.slice(0, 8);
	const topRivals = derived.rivals.slice(0, 6);

	return (
		<div className="space-y-6">
			<PageHeader kicker="Player profile" title={derived.name}>
				<FormStrip games={games} user={user} />
			</PageHeader>
			<PlayerNav user={user} />

			{/* Hero: the at-a-glance career line. */}
			<div className="panel flex flex-wrap items-center gap-x-10 gap-y-6 p-6">
				<WinRing wins={record.wins} losses={record.losses} />
				<StatBlock label="All-Time Record" value={`${record.wins}–${record.losses}`} sub={`${games.length} games`} />
				<StatBlock
					label={derived.currentMode ? `Rating · ${derived.currentMode.name}` : 'Rating'}
					value={derived.currentMode?.currentElo ?? '—'}
					sub={derived.currentMode ? 'most recent ranked mode' : 'no ranked games'}
				/>
				<StatBlock
					label="Peak Rating"
					value={derived.peak?.elo ?? '—'}
					sub={derived.peak?.mode}
				/>
				<StatBlock
					label="Active Since"
					value={derived.firstSeen ? new Date(derived.firstSeen * 1000).getFullYear() : '—'}
					sub={
						derived.lastSeen
							? `last game ${new Date(derived.lastSeen * 1000).toLocaleDateString()}`
							: undefined
					}
				/>
			</div>

			<div className="grid gap-6 lg:grid-cols-2">
				{/* Ratings per mode with ELO sparklines. */}
				<Panel>
					<PanelHeader title="Ranked Modes" />
					{derived.modes.filter((mode) => mode.currentElo !== null).length === 0 ? (
						<EmptyState title="No ranked games" detail="Ranked modes will appear here once this player queues up." />
					) : (
						<div className="divide-y divide-night-700">
							{derived.modes
								.filter((mode) => mode.currentElo !== null)
								.slice(0, 5)
								.map((mode) => (
									<div key={mode.name} className="flex items-center gap-4 px-4 py-3">
										<div className="min-w-0 flex-1">
											<p className="truncate font-semibold text-fog-100">{mode.name}</p>
											<p className="text-xs text-fog-500" style={{ fontVariantNumeric: 'tabular-nums' }}>
												{mode.wins}–{mode.losses} · {pct(mode.wins, mode.losses)} win rate
											</p>
										</div>
										<div className="w-32 sm:w-40">
											<Sparkline values={mode.trajectory} />
										</div>
										<div className="w-16 text-right">
											<p
												className="font-display text-lg font-bold text-fog-100"
												style={{ fontVariantNumeric: 'tabular-nums' }}
											>
												{mode.currentElo}
											</p>
											<p className="text-[10px] uppercase tracking-widest text-fog-500">
												peak {mode.peakElo}
											</p>
										</div>
									</div>
								))}
						</div>
					)}
				</Panel>

				{/* Captains: pick rate and win rate. */}
				<Panel>
					<PanelHeader title="Captains" />
					{topCaptains.length === 0 ? (
						<EmptyState title="No captain data" />
					) : (
						<div className="space-y-3 p-4">
							{topCaptains.map((captain) => (
								<div key={captain.name} className="flex items-center gap-3">
									<CharPortrait name={captain.name} size={36} />
									<div className="min-w-0 flex-1">
										<div className="flex items-baseline justify-between gap-2">
											<p className="truncate text-sm font-semibold text-fog-100">{captain.name}</p>
											<p className="text-xs text-fog-500" style={{ fontVariantNumeric: 'tabular-nums' }}>
												{captain.picks} games · {pct(captain.wins, captain.losses)} WR
											</p>
										</div>
										<UsageBar pct={captain.picks / games.length} />
									</div>
								</div>
							))}
						</div>
					)}
				</Panel>

				{/* Full-roster pick rates. */}
				<Panel>
					<PanelHeader title="Most Used Characters" />
					<div className="grid grid-cols-2 gap-x-6 gap-y-3 p-4">
						{topUsage.map((char) => (
							<div key={char.name} className="flex items-center gap-2.5">
								<CharPortrait name={char.name} size={30} />
								<div className="min-w-0 flex-1">
									<div className="flex items-baseline justify-between gap-2">
										<p className="truncate text-xs font-semibold text-fog-100">{char.name}</p>
										<p className="text-[11px] text-fog-500" style={{ fontVariantNumeric: 'tabular-nums' }}>
											{Math.round((char.count / games.length) * 100)}%
										</p>
									</div>
									<UsageBar pct={char.count / games.length} color="bg-star-500" />
								</div>
							</div>
						))}
					</div>
				</Panel>

				{/* Activity: games per month, last 12 months. */}
				<Panel>
					<PanelHeader title="Activity" />
					<div className="p-4">
						<div className="flex h-28 items-end gap-1.5">
							{derived.activity.map((month, i) => (
								<div key={i} className="flex flex-1 flex-col items-center gap-1" title={`${month.count} games`}>
									<div
										className={`w-full rounded-t ${month.count > 0 ? 'bg-rio-500/70' : 'bg-night-700'}`}
										style={{ height: `${Math.max(4, (month.count / maxActivity) * 100)}%` }}
									/>
									<span className="text-[9px] uppercase text-fog-500">{month.label}</span>
								</div>
							))}
						</div>
						<p className="mt-3 text-xs text-fog-500" style={{ fontVariantNumeric: 'tabular-nums' }}>
							{derived.activity.reduce((sum, month) => sum + month.count, 0)} games in the last 12 months
						</p>
					</div>
				</Panel>
			</div>

			{/* Rivals: most-played opponents. */}
			<Panel>
				<PanelHeader title="Rivals" />
				<div className="overflow-x-auto">
					<table className="stat-table">
						<thead>
							<tr>
								<th>Opponent</th>
								<th>Games</th>
								<th>Record</th>
								<th>Win Rate</th>
								<th>Last Played</th>
							</tr>
						</thead>
						<tbody>
							{topRivals.map((rival) => (
								<tr key={rival.opponent}>
									<td>
										<Link
											href={`/users/${encodeURIComponent(rival.opponent)}`}
											className="font-semibold text-fog-100 hover:text-rio-300"
										>
											{rival.opponent}
										</Link>
									</td>
									<td style={{ fontVariantNumeric: 'tabular-nums' }}>{rival.games}</td>
									<td style={{ fontVariantNumeric: 'tabular-nums' }}>
										{rival.wins}–{rival.losses}
									</td>
									<td className="w-48">
										<div className="flex items-center gap-2">
											<div className="w-24">
												<UsageBar pct={rival.games === 0 ? 0 : rival.wins / rival.games} />
											</div>
											<span className="text-xs text-fog-500" style={{ fontVariantNumeric: 'tabular-nums' }}>
												{pct(rival.wins, rival.losses)}
											</span>
										</div>
									</td>
									<td className="text-fog-500" style={{ fontVariantNumeric: 'tabular-nums' }}>
										{rival.lastPlayed ? new Date(rival.lastPlayed * 1000).toLocaleDateString() : '—'}
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</Panel>

			<GameHistory games={games} user={user} tagsets={tagsets} />
		</div>
	);
}
