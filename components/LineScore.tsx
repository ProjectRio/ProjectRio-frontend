import type { ReactNode } from 'react';

export interface LineScoreTeam {
	label: ReactNode;
	runs: (number | string)[];
	total: number | string;
	// false dims the row (e.g. the losing team on a finished game); defaults to bright.
	highlight?: boolean;
}

export function MetaItem({ label, value }: { label: string; value: string }) {
	return (
		<div>
			<dt className="font-display text-[10px] font-semibold uppercase tracking-widest text-fog-500">{label}</dt>
			<dd className="mt-0.5 text-xs text-fog-100">{value}</dd>
		</div>
	);
}

// Shared inning-by-inning line score. Each page maps its own data shape into
// `teams`; live games pass `cellHighlight` (batting now) and `regulationInnings`
// (extra-inning columns get a star tint). Cells fall back to '–' when a team
// has no entry for that inning yet.
export default function LineScore({
	teams,
	innings,
	regulationInnings,
	cellHighlight,
	meta
}: {
	teams: [LineScoreTeam, LineScoreTeam];
	innings: number;
	regulationInnings?: number;
	cellHighlight?: (inning: number, side: 0 | 1) => boolean;
	meta?: ReactNode;
}) {
	const cols = Array.from({ length: innings }, (_, i) => i + 1);

	return (
		<div className="panel p-6">
			<div className="flex flex-wrap items-center justify-between gap-x-10 gap-y-4">
				<div className="overflow-x-auto">
					<table className="text-xs leading-tight">
						<thead>
							<tr className="font-display uppercase tracking-wider text-fog-500">
								<th></th>
								{cols.map((i) => (
									<th
										key={i}
										className={`min-w-7 px-2.5 pb-1 text-center font-semibold ${
											regulationInnings && i > regulationInnings ? 'text-star-400' : ''
										}`}
									>
										{i}
									</th>
								))}
								<th className="min-w-7 border-l border-night-700 pb-1 pl-3 text-center font-bold">R</th>
							</tr>
						</thead>
						<tbody>
							{teams.map((team, side) => {
								const tone = team.highlight === false ? 'text-fog-300' : 'text-fog-100';
								return (
									<tr key={side}>
										<td className={`whitespace-nowrap pr-4 font-display font-semibold ${tone}`}>{team.label}</td>
										{cols.map((i) => {
											const hot = cellHighlight?.(i, side as 0 | 1);
											return (
												<td
													key={i}
													className={`min-w-7 px-2.5 py-1 text-center tabular-nums ${
														hot ? 'rounded bg-rio-500/20 font-bold text-fog-100' : 'text-fog-300'
													}`}
												>
													{team.runs[i - 1] ?? '–'}
												</td>
											);
										})}
										<td className={`min-w-7 border-l border-night-700 pl-3 text-center font-bold tabular-nums ${tone}`}>
											{team.total}
										</td>
									</tr>
								);
							})}
						</tbody>
					</table>
				</div>
				{meta && <dl className="flex flex-wrap gap-x-8 gap-y-3 text-left">{meta}</dl>}
			</div>
		</div>
	);
}
