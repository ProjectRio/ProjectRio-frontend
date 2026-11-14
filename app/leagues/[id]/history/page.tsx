'use client';

// Past drafts and prices across the Collection (§10f): every asset's average,
// low and high, per season. Top-ups and keepers are excluded upstream.

import { use, useMemo, useState } from 'react';
import Link from 'next/link';
import { ALL_ASSETS, CLASS_HUES } from '@/lib/draft/assets';
import { LEAGUES, leagueById, priceHistoryFor } from '@/lib/draft/fixtures';
import { FORMAT_LABELS } from '@/lib/draft/types';
import { AssetSprite, ClassTag, Money, StateChip } from '@/components/draft/primitives';
import { Badge, EmptyState, PageHeader, Panel } from '@/components/ui';

const FILTERS = ['All', 'Power', 'Balance', 'Technique', 'Speed', 'Stadiums'] as const;

export default function HistoryPage({ params }: { params: Promise<{ id: string }> }) {
	const { id } = use(params);
	const league = leagueById(Number(id));
	const [filter, setFilter] = useState<(typeof FILTERS)[number]>('All');
	const [sort, setSort] = useState<'avg' | 'max' | 'name'>('avg');
	const history = useMemo(() => (league ? priceHistoryFor(league.collection) : {}), [league]);
	if (!league) return <EmptyState title="No such league" />;
	const seasons = Object.values(history)[0]?.samples.map((sample) => sample.season) ?? [];
	const rows = ALL_ASSETS.filter((asset) => history[asset.id])
		.filter((asset) => (filter === 'All' ? true : filter === 'Stadiums' ? asset.kind === 'stadium' : asset.class === filter))
		.sort((a, b) => (sort === 'name' ? a.name.localeCompare(b.name) : history[b.id][sort] - history[a.id][sort]));
	const past = LEAGUES.filter((candidate) => candidate.collection === league.collection && candidate.id !== league.id);
	const maxAvg = Math.max(1, ...rows.map((asset) => history[asset.id].avg));

	return (
		<div>
			<PageHeader kicker={`${league.collection} price history`} title="Draft history">
			<Link href={`/leagues/${league.id}`} className="btn-secondary !py-2 text-sm">
				{league.name}
			</Link>
			</PageHeader>
			<div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_18rem]">
				<Panel>
					{seasons.length === 0 ? (
						<EmptyState title="No past drafts" detail={`${league.collection} has no completed drafts to price from yet.`} />
					) : (
						<>
							<div className="flex flex-wrap items-center gap-2 px-4 py-3">
								<div className="seg flex-wrap">
									{FILTERS.map((option) => (
										<button key={option} type="button" aria-pressed={filter === option} className="flex items-center gap-1.5 !px-2.5 !text-sm" onClick={() => setFilter(option)}>
											{option !== 'All' && <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: option === 'Stadiums' ? '#f59e0b' : CLASS_HUES[option] }} />}
											{option}
										</button>
									))}
								</div>
								<select className="input ml-auto !w-auto !py-1 !text-xs" aria-label="Sort" value={sort} onChange={(event) => setSort(event.target.value as typeof sort)}>
									<option value="avg">Highest average</option>
									<option value="max">Highest ever</option>
									<option value="name">Name</option>
								</select>
							</div>
							<div className="overflow-x-auto">
								<table className="stat-table">
									<thead>
										<tr>
											<th>Asset</th>
											<th className="!text-right">Avg</th>
											<th className="!text-right">Low</th>
											<th className="!text-right">High</th>
											{seasons.map((season) => (
												<th key={season} className="!text-right">
													{season}
												</th>
											))}
											<th className="w-40" />
										</tr>
									</thead>
									<tbody>
										{rows.map((asset) => {
											const entry = history[asset.id];
											return (
												<tr key={asset.id}>
													<td>
														<div className="flex items-center gap-2">
															<AssetSprite asset={asset} size={26} />
															<div>
																<div className="text-fog-100">{asset.name}</div>
																<ClassTag asset={asset} />
															</div>
														</div>
													</td>
													<td className="num font-semibold text-fog-100">
														<Money amount={entry.avg} />
													</td>
													<td className="num text-fog-500">${entry.min}</td>
													<td className="num text-fog-500">${entry.max}</td>
													{entry.samples.map((sample) => (
														<td key={sample.season} className="num text-fog-300">
															${sample.price}
														</td>
													))}
													<td>
														<div className="well h-2 w-full overflow-hidden !rounded-full">
															<div className="h-full bg-fog-300" style={{ width: `${(entry.avg / maxAvg) * 100}%` }} />
														</div>
													</td>
												</tr>
											);
										})}
									</tbody>
								</table>
							</div>
						</>
					)}
				</Panel>
				<div className="space-y-4">
					<Panel>
						<h2 className="px-4 pb-1 pt-4 text-lg">Drafts in {league.collection}</h2>
						<ul className="space-y-1 px-4 pb-3">
							{[league, ...past].map((candidate) => (
								<li key={candidate.id}>
									<Link href={`/leagues/${candidate.id}/draft`} className="pick block !py-1.5 font-display text-sm font-semibold text-fog-100">
										{candidate.name}
									</Link>
									<div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-fog-500">
										<Badge color="gray">{FORMAT_LABELS[candidate.format]}</Badge>
										<StateChip state={candidate.state} paused={false} />
										{candidate.completed_at && <span className="font-mono tabular-nums">{new Date(candidate.completed_at).toLocaleDateString()}</span>}
									</div>
								</li>
							))}
						</ul>
					</Panel>
					<Panel className="p-4 text-xs text-fog-500">
						Prices come from past drafts&apos; recorded price, grouped by Collection. Picks priced by the last-slot rule and keepers are excluded so top-ups don&apos;t distort character value.
					</Panel>
				</div>
			</div>
		</div>
	);
}
