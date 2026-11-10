/* eslint-disable @next/next/no-img-element */

import type { ReactNode } from 'react';

// The ballpark scoreboard: one board that carries who played, the line score
// and the totals. Shared by the live page (current half lit) and the final.

export interface ScoreboardTeam {
	/** Player name (usually a PlayerLink). */
	name: ReactNode;
	/** Line under the name: captain, team, rating. */
	detail?: ReactNode;
	/** Captain portrait or team logo. */
	image?: string | null;
	/** Small overlay on the image (team logo over a captain portrait). */
	badge?: string | null;
	/** Shown beside the name: AT BAT, the winner's flag. */
	tag?: ReactNode;
	runs: (number | string)[];
	total: number | string;
	hits?: number;
	/** The side's colour in this page's charts, shown as a bar at the row's edge. */
	color?: string;
	/** The losing side of a final is dimmed. */
	dim?: boolean;
}

export default function Scoreboard({
	teams,
	innings,
	regulationInnings,
	cellHighlight,
	status,
	header,
	children
}: {
	teams: [ScoreboardTeam, ScoreboardTeam];
	innings: number;
	regulationInnings?: number;
	cellHighlight?: (inning: number, side: 0 | 1) => boolean;
	/** Left of the header strip: FINAL, or the live half-inning. */
	status: ReactNode;
	/** Right of the header strip: mode, park, date. */
	header?: ReactNode;
	/** Rendered inside the board under the rows (the live situation, tabs). */
	children?: ReactNode;
}) {
	const cols = Array.from({ length: Math.max(innings, 1) }, (_, i) => i + 1);
	const showHits = teams.every((team) => team.hits !== undefined);

	return (
		<div className="overflow-hidden rounded-lg border border-[var(--rim-strong)] bg-[var(--chrome-deep)]">
			<div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-1 border-b border-[var(--rim)] bg-black/35 px-4 py-2">
				<div className="font-display text-sm font-bold uppercase tracking-[0.14em]">{status}</div>
				{header && (
					<div className="flex flex-wrap items-center gap-x-4 gap-y-1 font-display text-sm font-medium uppercase tracking-[0.1em] text-fog-300">
						{header}
					</div>
				)}
			</div>

			<div className="overflow-x-auto">
				<table className="w-full border-collapse">
					<thead>
						<tr className="font-display text-xs font-semibold uppercase tracking-[0.12em] text-fog-500">
							<th className="sticky left-0 z-10 bg-night-950 sm:bg-transparent" />
							{cols.map((i) => (
								<th
									key={i}
									className={`w-10 min-w-9 px-1 pt-2 text-center ${
										regulationInnings && i > regulationInnings ? 'text-star-400' : ''
									}`}
								>
									{i}
								</th>
							))}
							<th className="sticky right-0 z-10 w-16 border-l border-[var(--rim)] bg-night-950 px-3 pt-2 text-center sm:static sm:bg-transparent">R</th>
							{showHits && <th className="hidden w-12 px-3 pt-2 text-center sm:table-cell">H</th>}
						</tr>
					</thead>
					<tbody>
						{teams.map((team, side) => (
							<tr key={side} className={side === 0 ? 'border-b border-[rgb(181_173_165/0.14)]' : ''}>
								<th
									scope="row"
									className="sticky left-0 z-10 bg-night-950 py-3 pl-4 pr-6 text-left font-normal sm:bg-transparent"
								>
									<div className="flex items-center gap-3">
										{team.color && (
											<span className="h-10 w-1 flex-none rounded-full" style={{ backgroundColor: team.color }} />
										)}
										{team.image && (
											<span className="relative flex-none">
												<img
													src={team.image}
													alt=""
													className={`h-12 w-12 object-contain sm:h-14 sm:w-14 ${team.dim ? 'opacity-70' : ''}`}
												/>
												{team.badge && (
													<img
														src={team.badge}
														alt=""
														className="absolute -bottom-1.5 -right-2.5 h-7 w-7 object-contain"
													/>
												)}
											</span>
										)}
										<div className="min-w-0">
											<div className="flex items-center gap-2">
												<span
													className={`truncate font-title text-xl leading-tight sm:text-2xl ${
														team.dim ? 'text-fog-300' : 'text-fog-100'
													}`}
												>
													{team.name}
												</span>
												{team.tag}
											</div>
											{team.detail && <div className="mt-0.5 text-xs text-fog-500">{team.detail}</div>}
										</div>
									</div>
								</th>
								{cols.map((i) => {
									const hot = cellHighlight?.(i, side as 0 | 1);
									const value = team.runs[i - 1];
									return (
										<td
											key={i}
											className={`px-1 text-center font-mono text-lg tabular-nums ${
												hot
													? 'font-semibold text-star-400'
													: value === undefined
														? 'text-fog-500/50'
														: value === 0 || value === 'X'
															? 'text-fog-500'
															: 'text-fog-100'
											}`}
										>
											<span
												className={`inline-block min-w-7 rounded px-1 py-0.5 ${
													hot ? 'bg-star-400/15 [box-shadow:inset_0_0_0_1px_rgb(252_228_84/0.5)]' : ''
												}`}
											>
												{value ?? '·'}
											</span>
										</td>
									);
								})}
								<td
									className={`sticky right-0 z-10 border-l border-[var(--rim)] bg-night-950 px-3 text-center font-mono text-4xl sm:static sm:bg-transparent font-semibold tabular-nums [text-shadow:0_2px_0_rgb(0_0_0/0.5)] sm:text-5xl ${
										team.dim ? 'text-fog-500' : 'text-star-400'
									}`}
								>
									{team.total}
								</td>
								{showHits && (
									<td className="hidden px-3 text-center font-mono text-lg tabular-nums text-fog-300 sm:table-cell">{team.hits}</td>
								)}
							</tr>
						))}
					</tbody>
				</table>
			</div>

			{children}
		</div>
	);
}
