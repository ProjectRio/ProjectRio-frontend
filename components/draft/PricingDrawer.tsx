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
		<Drawer open={open} onClose={onClose} title="Pricing" kicker={
				<>
					<span>{snapshot.draft.collection}</span>
					<span>Past drafts</span>
				</>
			} width="w-[min(100vw,36rem)]">
			<div className="sticky top-0 z-10 flex flex-wrap items-center gap-2 bg-[#0b2219] px-3 py-2">
				<div className="seg flex-wrap">
					{FILTERS.map((option) => (
						<button key={option} type="button" aria-pressed={filter === option} className="flex items-center gap-1 !px-2 !py-0.5 !text-[11px]" onClick={() => setFilter(option)}>
							{option !== 'All' && <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: option === 'Stadiums' ? '#f59e0b' : CLASS_HUES[option] }} />}
							{option}
						</button>
					))}
				</div>
				<input className="input ml-auto !w-28 !py-0.5 !text-xs" placeholder="Find…" value={query} onChange={(event) => setQuery(event.target.value)} aria-label="Search" />
				<select className="input !w-auto !py-0.5 !text-[11px]" value={sort} onChange={(event) => setSort(event.target.value as typeof sort)} aria-label="Sort">
					<option value="avg">Avg</option>
					<option value="max">High</option>
					<option value="name">Name</option>
				</select>
			</div>
			<div className="overflow-x-auto px-1">
			<table className="stat-table text-[11px] [&_td]:!px-1 [&_td]:!py-0.5 [&_th]:!px-1 [&_th]:!py-1 [&_th]:!text-[10px]">
				<thead>
					<tr>
						<th className="w-6" />
						<th className="text-left">Asset</th>
						<th className="!text-right">Avg</th>
						<th className="!text-right">Lo–Hi</th>
						{seasons.map((season) => (
							<th key={season} className="!text-right">
								{season.replace(/^Season /, 'S')}
							</th>
						))}
						<th className="text-left">This draft</th>
					</tr>
				</thead>
				<tbody>
					{rows.map((entry) => {
						const asset = entry.asset;
						const price = history[asset.id];
						const starred = plan.targets.includes(asset.id);
						const sales = soldTo.get(asset.id) ?? [];
						const gone = entry.remaining_copies !== null && entry.remaining_copies <= 0;
						const queued = queuedBy.get(asset.id);
						return (
							<tr key={asset.id} className={starred ? 'bg-star-400/[0.06]' : ''}>
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
								<td className="num font-semibold text-fog-100">{price ? <Money amount={Math.round(price.avg)} /> : <span className="text-fog-500">—</span>}</td>
								<td className="num text-fog-500">{price ? `${price.min}–${price.max}` : ''}</td>
								{seasons.map((season) => {
									const sample = price?.samples.find((candidate) => candidate.season === season);
									return (
										<td key={season} className="num text-fog-300">
											{sample ? `$${sample.price}` : <span className="text-fog-500/50">·</span>}
										</td>
									);
								})}
								<td className="px-1">
									<span className="flex items-center gap-1">
										{onBlock === asset.id && <span className="plate !px-1 !py-0 text-[9px] text-rio-300 [--plate:#56161b]">On the block</span>}
										{sales.map((sale, index) => {
											const team = findTeam(snapshot, sale.team_id);
											return (
												<span key={index} className="flex items-center gap-0.5" title={`${team?.name} · $${sale.price}`}>
													{team && <TeamLogo logo={team.logo} name={team.name} size={14} />}
													<span className="font-mono font-semibold tabular-nums text-star-400">${sale.price}</span>
												</span>
											);
										})}
										{queued !== undefined && onBlock !== asset.id && (
											<span className="flex items-center gap-0.5 text-fog-500" title={`Queued by ${findTeam(snapshot, queued)?.name}`}>
												<TeamLogo logo={findTeam(snapshot, queued)?.logo ?? null} name={findTeam(snapshot, queued)?.name ?? ''} size={14} />
												<span className="text-[10px]">queued</span>
											</span>
										)}
										{!gone && entry.remaining_copies !== null && entry.remaining_copies > 0 && sales.length > 0 && <span className="text-[10px] text-fog-500">{entry.remaining_copies} left</span>}
									</span>
								</td>
							</tr>
						);
					})}
				</tbody>
			</table>
			</div>
			{rows.length === 0 && <p className="p-4 text-center text-xs text-fog-500">No matches.</p>}
		</Drawer>
	);
}
