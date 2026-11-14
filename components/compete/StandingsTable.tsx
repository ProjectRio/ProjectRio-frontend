'use client';

// Regular-season standings, modelled on the league sheet: record, run
// differential, per-game rates with offensive/defensive rank, home/away
// splits, home park and park factor, plus the playoff line.

import { useState } from 'react';
import type { Competition } from '@/lib/compete/types';
import { standings, type StandingRow } from '@/lib/compete/stats';
import { Mark, ParticipantName, participantsOf, stadiumName } from './shared';
import { EmptyState } from '@/components/ui';

export type PlayoffTier = 'bye' | 'in' | 'play_in' | 'out' | 'none';

export function playoffTier(competition: Competition, rank: number): PlayoffTier {
	const format = competition.playoffs;
	if (!format) return 'none';
	if (rank <= format.direct) return rank === 1 ? 'bye' : 'in';
	if (rank <= format.direct + format.play_in) return 'play_in';
	return 'out';
}

const TIER_LABELS: Record<PlayoffTier, string> = { bye: 'Home field', in: 'Clinched', play_in: 'Play-in', out: 'Eliminated', none: '' };
const TIER_CLASS: Record<PlayoffTier, string> = { bye: 'text-star-400', in: 'text-emerald-300', play_in: 'text-star-400/80', out: 'text-fog-500', none: '' };

/** Standings rows for a competition: from games, or from recorded finals when games were never migrated. */
export function standingsFor(competition: Competition): StandingRow[] {
	const participants = participantsOf(competition);
	const parks = Object.fromEntries(participants.map((participant) => [participant.name, participant.home_park]));
	if (competition.games.some((game) => !game.series)) return standings(participants.map((participant) => participant.name), competition.games, parks);
	const rows = participants
		.filter((participant) => competition.entrants.find((entrant) => entrant.username === participant.name)?.record)
		.map((participant, index) => {
			const record = competition.entrants.find((entrant) => entrant.username === participant.name)!.record!;
			const gp = record.w + record.l;
			const split = { gp, w: record.w, l: record.l, rf: 0, ra: 0 };
			return { name: participant.name, rank: index + 1, total: split, home: { ...split, gp: 0 }, away: { ...split, gp: 0 }, pct: gp ? record.w / gp : 0, diff: NaN, rfpg: NaN, rapg: NaN, o_rank: 0, d_rank: 0, park_factor: NaN, streak: '', last5: [] as ('W' | 'L')[] };
		});
	rows.sort((a, b) => b.pct - a.pct || b.total.w - a.total.w);
	rows.forEach((row, index) => (row.rank = index + 1));
	return rows;
}

function num(value: number, digits = 2): string {
	return Number.isFinite(value) ? value.toFixed(digits) : '—';
}

export default function StandingsTable({ competition, compact = false, highlight }: { competition: Competition; compact?: boolean; highlight?: string }) {
	const [showSplits, setShowSplits] = useState(false);
	const rows = standingsFor(competition);
	const participants = participantsOf(competition);
	const hasRuns = rows.some((row) => Number.isFinite(row.diff));
	const live = competition.state !== 'completed';
	if (rows.length === 0) return <EmptyState title="No standings yet" detail="Standings fill in as games are played." />;
	const tiers = rows.map((row) => playoffTier(competition, row.rank));
	return (
		<div>
			{!compact && (
				<div className="flex flex-wrap items-center justify-between gap-2 border-b border-night-700 bg-night-850 px-3 py-2 text-xs text-fog-500">
					<span>{live ? 'If the season ended today' : 'Final'}{competition.playoffs ? ` · ${competition.playoffs.description}` : ''}</span>
					{hasRuns && (
						<label className="flex items-center gap-1.5">
							<input type="checkbox" className="accent-rio-500" checked={showSplits} onChange={(event) => setShowSplits(event.target.checked)} />
							Home / away splits
						</label>
					)}
				</div>
			)}
			<div className="overflow-x-auto">
				<table className="stat-table">
					<thead>
						<tr>
							<th>#</th>
							<th>{competition.teams ? 'Team' : 'Manager'}</th>
							<th className="text-right">W</th>
							<th className="text-right">L</th>
							<th className="text-right">%</th>
							{hasRuns && !compact && (
								<>
									<th className="text-right">RF</th>
									<th className="text-right">RA</th>
								</>
							)}
							{hasRuns && <th className="text-right">Diff</th>}
							{hasRuns && !compact && (
								<>
									<th className="text-right" title="Runs for per game (offensive rank)">
										RF/G
									</th>
									<th className="text-right" title="Runs against per game (defensive rank)">
										RA/G
									</th>
								</>
							)}
							{showSplits && hasRuns && (
								<>
									<th className="text-right">Home</th>
									<th className="text-right">Diff</th>
									<th className="text-right">Away</th>
									<th className="text-right">Diff</th>
								</>
							)}
							{!compact && hasRuns && (
								<>
									<th>Streak</th>
									<th>Last 5</th>
								</>
							)}
							{!compact && rows.some((row) => row.home_park !== undefined) && (
								<>
									<th>Home park</th>
									<th className="text-right" title="Total runs per game at home ÷ total runs per game away">
										Park
									</th>
								</>
							)}
							{competition.playoffs && <th />}
						</tr>
					</thead>
					<tbody>
						{rows.map((row, index) => {
							const tier = tiers[index];
							const boundary = index > 0 && tiers[index - 1] !== tier && (tier === 'play_in' || tier === 'out');
							const participant = participants.find((candidate) => candidate.name === row.name);
							return (
								<tr key={row.name} className={`${boundary ? 'border-t-2 border-t-night-600' : ''} ${row.name === highlight ? 'bg-rio-500/[0.06]' : ''}`}>
									<td className="font-display font-bold text-fog-500">{row.rank}</td>
									<td>
										<span className="inline-flex items-center gap-2">
											<Mark participant={participant} size={compact ? 20 : 24} />
											<ParticipantName participant={participant} name={row.name} />
											{row.h2h && <span className="text-[10px] text-fog-500" title="Tiebreak: head to head">{row.h2h}</span>}
										</span>
									</td>
									<td className="text-right font-display font-bold tabular-nums text-fog-100">{row.total.w}</td>
									<td className="text-right tabular-nums text-fog-300">{row.total.l}</td>
									<td className="text-right tabular-nums">{row.total.gp ? row.pct.toFixed(3).replace(/^0/, '') : '—'}</td>
									{hasRuns && !compact && (
										<>
											<td className="text-right tabular-nums text-fog-300">{row.total.rf}</td>
											<td className="text-right tabular-nums text-fog-300">{row.total.ra}</td>
										</>
									)}
									{hasRuns && <td className={`text-right tabular-nums ${row.diff > 0 ? 'text-emerald-300' : row.diff < 0 ? 'text-rio-300' : 'text-fog-300'}`}>{Number.isFinite(row.diff) ? (row.diff > 0 ? `+${row.diff}` : row.diff) : '—'}</td>}
									{hasRuns && !compact && (
										<>
											<td className="text-right tabular-nums text-fog-300">
												{num(row.rfpg)} <span className="text-[10px] text-fog-500">#{row.o_rank}</span>
											</td>
											<td className="text-right tabular-nums text-fog-300">
												{num(row.rapg)} <span className="text-[10px] text-fog-500">#{row.d_rank}</span>
											</td>
										</>
									)}
									{showSplits && hasRuns && (
										<>
											<td className="text-right tabular-nums text-fog-300">
												{row.home.w}–{row.home.l}
											</td>
											<td className="text-right tabular-nums text-fog-500">{row.home.rf - row.home.ra > 0 ? '+' : ''}{row.home.rf - row.home.ra}</td>
											<td className="text-right tabular-nums text-fog-300">
												{row.away.w}–{row.away.l}
											</td>
											<td className="text-right tabular-nums text-fog-500">{row.away.rf - row.away.ra > 0 ? '+' : ''}{row.away.rf - row.away.ra}</td>
										</>
									)}
									{!compact && hasRuns && (
										<>
											<td className={`tabular-nums ${row.streak.startsWith('W') ? 'text-emerald-300' : 'text-rio-300'}`}>{row.streak}</td>
											<td>
												<span className="inline-flex gap-0.5">
													{row.last5.map((result, i) => (
														<span key={i} className={`inline-block h-2 w-2 rounded-sm ${result === 'W' ? 'bg-emerald-400' : 'bg-rio-500/70'}`} />
													))}
												</span>
											</td>
										</>
									)}
									{!compact && rows.some((candidate) => candidate.home_park !== undefined) && (
										<>
											<td className="text-xs text-fog-300">{stadiumName(row.home_park)}</td>
											<td className={`text-right tabular-nums ${row.park_factor > 1.1 ? 'text-star-400' : row.park_factor < 0.9 ? 'text-fog-500' : 'text-fog-300'}`}>{num(row.park_factor)}</td>
										</>
									)}
									{competition.playoffs && <td className={`font-display text-[10px] font-bold uppercase tracking-widest ${TIER_CLASS[tier]}`}>{live && tier !== 'out' ? `${TIER_LABELS[tier]}`.replace('Clinched', 'In') : TIER_LABELS[tier]}</td>}
								</tr>
							);
						})}
					</tbody>
				</table>
			</div>
		</div>
	);
}
