'use client';

// Historic prices for the Collection, pulled over the live room: average,
// low, high and per-season prices for every asset, with what is happening to
// it in this draft. Star a row to target it.

import { useMemo, useState } from 'react';
import { CLASS_HUES } from '@/lib/draft/assets';
import { toggleTarget, usePlan } from '@/lib/draft/plan';
import type { DraftSnapshot } from '@/lib/draft/types';
import Drawer from './Drawer';
import { AssetSprite, ClassDot, findTeam, Money, TeamLogo } from './primitives';

const FILTERS = ['All', 'Power', 'Balance', 'Technique', 'Speed', 'Stadiums'] as const;

export default function PricingDrawer({ snapshot, open, onClose }: { snapshot: DraftSnapshot; open: boolean; onClose: () => void }) {
	const leagueId = snapshot.draft.league_id;
	const plan = usePlan(leagueId);
	const [filter, setFilter] = useState<(typeof FILTERS)[number]>('All');
	const [query, setQuery] = useState('');
	const [sort, setSort] = useState<'avg' | 'max' | 'name'>('avg');
	const history = snapshot.price_history;
	const seasons = Object.values(history)[0]?.samples.map((sample) => sample.season) ?? [];
	const soldTo = useMemo(() => {
		const map = new Map<number, { team_id: number; price: number }[]>();
		for (const team of snapshot.teams) for (const pick of team.picks) map.set(pick.asset.id, [...(map.get(pick.asset.id) ?? []), { team_id: team.id, price: pick.price }]);
		return map;
	}, [snapshot.teams]);
	const queuedBy = useMemo(() => new Map(snapshot.queue.filter((entry) => entry.asset).map((entry) => [entry.asset!.id, entry.team_id])), [snapshot.queue]);
	const onBlock = (snapshot.current.kind === 'auction' || snapshot.current.kind === 'vickrey') && snapshot.current.nomination ? snapshot.current.nomination.asset.id : null;
	const needle = query.trim().toLowerCase();
	const rows = snapshot.pool
		.filter((entry) => (filter === 'All' ? true : filter === 'Stadiums' ? entry.asset.kind === 'stadium' : entry.asset.class === filter))
		.filter((entry) => !needle || entry.asset.name.toLowerCase().includes(needle))
		.sort((a, b) => {
			if (sort === 'name') return a.asset.name.localeCompare(b.asset.name);
			return (history[b.asset.id]?.[sort] ?? -1) - (history[a.asset.id]?.[sort] ?? -1);
		});

	return (
		<Drawer open={open} onClose={onClose} title="Pricing" kicker={`${snapshot.draft.collection} · past drafts`} width="w-[min(100vw,36rem)]">
			<div className="sticky top-0 z-10 flex flex-wrap items-center gap-1 border-b border-night-700 bg-night-850 px-2 py-1.5">
				{FILTERS.map((option) => (
					<button
						key={option}
						type="button"
						className={`border-b-2 px-1.5 py-0.5 font-display text-[10px] font-bold uppercase tracking-widest ${filter === option ? 'text-fog-100' : 'text-fog-500 hover:text-fog-300'}`}
						style={{ borderColor: filter === option ? (option === 'Stadiums' ? '#f59e0b' : (CLASS_HUES[option] ?? 'var(--color-rio-500)')) : 'transparent' }}
						onClick={() => setFilter(option)}
					>
						{option}
					</button>
				))}
				<input className="input ml-auto !w-28 !py-0.5 !text-xs" placeholder="Find…" value={query} onChange={(event) => setQuery(event.target.value)} aria-label="Search" />
				<select className="rounded border border-night-600 bg-night-900 px-1 py-0.5 text-[11px] text-fog-300" value={sort} onChange={(event) => setSort(event.target.value as typeof sort)} aria-label="Sort">
					<option value="avg">Avg</option>
					<option value="max">High</option>
					<option value="name">Name</option>
				</select>
			</div>
			<table className="w-full text-[11px]">
				<thead>
					<tr className="font-display text-[9px] font-semibold uppercase tracking-widest text-fog-500">
						<th className="w-6" />
						<th className="px-1 py-1 text-left">Asset</th>
						<th className="px-1 text-right">Avg</th>
						<th className="px-1 text-right text-fog-500/70">Lo–Hi</th>
						{seasons.map((season) => (
							<th key={season} className="px-1 text-right">
								{season.replace(/^Season /, 'S')}
							</th>
						))}
						<th className="px-1 text-left">This draft</th>
					</tr>
				</thead>
				<tbody className="divide-y divide-night-800">
					{rows.map((entry) => {
						const asset = entry.asset;
						const price = history[asset.id];
						const starred = plan.targets.includes(asset.id);
						const sales = soldTo.get(asset.id) ?? [];
						const gone = entry.remaining_copies !== null && entry.remaining_copies <= 0;
						const queued = queuedBy.get(asset.id);
						return (
							<tr key={asset.id} className={`${starred ? 'bg-star-500/[0.06]' : ''} hover:bg-night-800/60`}>
								<td className="pl-1">
									<button type="button" className={`px-0.5 text-sm ${starred ? 'text-star-400' : 'text-night-600 hover:text-fog-300'}`} onClick={() => toggleTarget(leagueId, asset.id)} aria-pressed={starred} aria-label={starred ? `Unstar ${asset.name}` : `Target ${asset.name}`}>
										{starred ? '★' : '☆'}
									</button>
								</td>
								<td className="px-1 py-0.5">
									<span className="flex items-center gap-1.5">
										<AssetSprite asset={asset} size={22} dim={gone} />
										<span className={`truncate ${gone ? 'text-fog-500' : 'text-fog-100'}`}>{asset.name}</span>
										<ClassDot asset={asset} />
									</span>
								</td>
								<td className="px-1 text-right font-display font-bold tabular-nums text-fog-100">{price ? <Money amount={Math.round(price.avg)} /> : <span className="text-fog-500">—</span>}</td>
								<td className="px-1 text-right tabular-nums text-fog-500">{price ? `${price.min}–${price.max}` : ''}</td>
								{seasons.map((season) => {
									const sample = price?.samples.find((candidate) => candidate.season === season);
									return (
										<td key={season} className="px-1 text-right tabular-nums text-fog-300">
											{sample ? `$${sample.price}` : <span className="text-fog-500/50">·</span>}
										</td>
									);
								})}
								<td className="px-1">
									<span className="flex items-center gap-1">
										{onBlock === asset.id && <span className="rounded-sm bg-rio-500/20 px-1 font-display text-[9px] font-bold uppercase tracking-widest text-rio-300">On the block</span>}
										{sales.map((sale, index) => {
											const team = findTeam(snapshot, sale.team_id);
											return (
												<span key={index} className="flex items-center gap-0.5" title={`${team?.name} · $${sale.price}`}>
													{team && <TeamLogo logo={team.logo} name={team.name} size={14} />}
													<span className="font-display font-bold tabular-nums text-star-400">${sale.price}</span>
												</span>
											);
										})}
										{queued !== undefined && onBlock !== asset.id && (
											<span className="flex items-center gap-0.5 text-fog-500" title={`Queued by ${findTeam(snapshot, queued)?.name}`}>
												<TeamLogo logo={findTeam(snapshot, queued)?.logo ?? null} name={findTeam(snapshot, queued)?.name ?? ''} size={14} />
												<span className="text-[9px] uppercase tracking-wider">queued</span>
											</span>
										)}
										{!gone && entry.remaining_copies !== null && entry.remaining_copies > 0 && sales.length > 0 && <span className="text-[9px] uppercase tracking-wider text-fog-500">{entry.remaining_copies} left</span>}
									</span>
								</td>
							</tr>
						);
					})}
				</tbody>
			</table>
			{rows.length === 0 && <p className="p-4 text-center text-xs text-fog-500">No matches.</p>}
		</Drawer>
	);
}
