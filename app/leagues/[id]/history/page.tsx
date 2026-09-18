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
			<PageHeader kicker={`${league.collection} · price history`} title="Draft history">
				<Link href={`/leagues/${league.id}`} className="btn-secondary !py-2 text-sm">
					← {league.name}
				</Link>
			</PageHeader>
			<div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_18rem]">
				<Panel>
					{seasons.length === 0 ? (
						<EmptyState title="No past drafts" detail={`${league.collection} has no completed drafts to price from yet.`} />
					) : (
						<>
							<div className="flex flex-wrap items-center gap-2 border-b border-night-700 bg-night-850 px-3 py-2">
								{FILTERS.map((option) => (
									<button
										key={option}
										type="button"
										className={`border-b-2 px-2 py-1 font-display text-[11px] font-bold uppercase tracking-widest ${filter === option ? 'text-fog-100' : 'text-fog-500 hover:text-fog-300'}`}
										style={{ borderColor: filter === option ? (option === 'Stadiums' ? '#f59e0b' : (CLASS_HUES[option] ?? 'var(--color-rio-500)')) : 'transparent' }}
										onClick={() => setFilter(option)}
									>
										{option}
									</button>
								))}
								<select className="ml-auto rounded border border-night-600 bg-night-900 px-2 py-1 text-xs text-fog-300" value={sort} onChange={(event) => setSort(event.target.value as typeof sort)}>
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
											<th className="text-right">Avg</th>
											<th className="text-right">Low</th>
											<th className="text-right">High</th>
											{seasons.map((season) => (
												<th key={season} className="text-right">
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
													<td className="text-right font-display font-bold tabular-nums text-fog-100">
														<Money amount={entry.avg} />
													</td>
													<td className="text-right tabular-nums text-fog-500">${entry.min}</td>
													<td className="text-right tabular-nums text-fog-500">${entry.max}</td>
													{entry.samples.map((sample) => (
														<td key={sample.season} className="text-right tabular-nums text-fog-300">
															${sample.price}
														</td>
													))}
													<td>
														<div className="h-1.5 w-full rounded-full bg-night-800">
															<div className="h-full rounded-full bg-fog-300" style={{ width: `${(entry.avg / maxAvg) * 100}%` }} />
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
						<div className="border-b border-night-700 bg-night-850 px-3 py-2 font-display text-xs font-bold uppercase tracking-widest text-fog-300">Drafts in {league.collection}</div>
						<ul className="divide-y divide-night-800">
							{[league, ...past].map((candidate) => (
								<li key={candidate.id} className="px-3 py-2.5">
									<Link href={`/leagues/${candidate.id}/draft`} className="font-display text-sm font-bold uppercase tracking-wide hover:text-rio-300">
										{candidate.name}
									</Link>
									<div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-fog-500">
										<Badge color="gray">{FORMAT_LABELS[candidate.format]}</Badge>
										<StateChip state={candidate.state} paused={false} />
										{candidate.completed_at && <span>{new Date(candidate.completed_at).toLocaleDateString()}</span>}
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
