'use client';

// What went where: one line per completed lot, newest first. Click a line to
// unfold the bidding that produced it. The raw log lives behind a toggle.

import { useEffect, useState } from 'react';
import type { DraftSnapshot, LotResult } from '@/lib/draft/types';
import ActivityFeed from './ActivityFeed';
import { AssetSprite, findTeam, Money, TeamLogo, timeAgo } from './primitives';

function BidHistory({ snapshot, result, now }: { snapshot: DraftSnapshot; result: LotResult; now: number }) {
	const { draft } = snapshot;
	const nominator = findTeam(snapshot, result.nominated_by_team_id);
	const roundPool = draft.format === 'round_pool';
	return (
		<div className="border-t border-night-800 bg-night-900/60 px-2 py-1.5 text-[11px]">
			<div className="mb-1 flex flex-wrap items-center gap-x-2 text-fog-500">
				<span>
					{draft.format === 'snake' ? `Pick ${result.pick_number}` : `Lot ${result.round}`}
					{nominator && (
						<>
							{' '}
							· nom. <span className="text-fog-300">{nominator.name}</span>
						</>
					)}
					{result.opening_bid !== null && <> · opened ${result.opening_bid}</>}
				</span>
				{result.took_remaining_budget && <span className="text-star-400">last slot · remaining budget</span>}
				{result.note && <span className="text-fog-400">{result.note}</span>}
			</div>
			{result.bids.length > 0 ? (
				<ol className="space-y-0.5">
					{result.bids.map((bid) => {
						const team = findTeam(snapshot, bid.team_id);
						const winner = bid.team_id === result.team_id && (roundPool || bid.id === result.bids.find((candidate) => candidate.team_id === result.team_id)?.id);
						return (
							<li key={bid.id} className={`flex items-center gap-1.5 ${bid.rescind === 'approved' ? 'line-through opacity-50' : ''}`}>
								<span className={`w-8 text-right font-display font-bold tabular-nums ${winner ? 'text-star-400' : 'text-fog-300'}`}>${bid.amount}</span>
								{team && <TeamLogo logo={team.logo} name={team.name} size={14} />}
								<span className={`min-w-0 flex-1 truncate ${winner ? 'text-fog-100' : 'text-fog-400'}`}>{team?.name}</span>
								<span className="tabular-nums text-fog-500">{timeAgo(bid.placed_at, now)}</span>
							</li>
						);
					})}
				</ol>
			) : (
				<p className="text-fog-500">No bids recorded.</p>
			)}
		</div>
	);
}

export default function ResultsFeed({ snapshot, limit = 30, maxHeight = 'max-h-[28rem]' }: { snapshot: DraftSnapshot; limit?: number; maxHeight?: string }) {
	const [now, setNow] = useState(Date.now());
	const [openId, setOpenId] = useState<number | null>(null);
	useEffect(() => {
		const timer = setInterval(() => setNow(Date.now()), 5000);
		return () => clearInterval(timer);
	}, []);
	const money = snapshot.draft.format !== 'snake';
	const items = snapshot.results.slice(0, limit);
	if (items.length === 0) return <p className="px-3 py-4 text-center text-xs text-fog-500">Nothing sold yet.</p>;
	return (
		<ol className={`divide-y divide-night-800 overflow-y-auto ${maxHeight}`}>
			{items.map((result) => {
				const team = findTeam(snapshot, result.team_id);
				const open = openId === result.pick_id;
				const yours = result.team_id === snapshot.you.team_id;
				return (
					<li key={result.pick_id} className={yours ? 'bg-rio-500/[0.06]' : ''}>
						<button
							type="button"
							className="flex w-full items-center gap-1.5 px-2 py-1 text-left text-[11px] leading-snug hover:bg-night-800/60"
							onClick={() => setOpenId(open ? null : result.pick_id)}
							aria-expanded={open}
							title={`${result.asset.name} → ${team?.name} · ${result.bids.length} bid${result.bids.length === 1 ? '' : 's'}`}
						>
							<span className="w-5 shrink-0 text-right font-display text-[10px] tabular-nums text-fog-500">{result.pick_number}</span>
							<AssetSprite asset={result.asset} size={22} />
							<span className="min-w-0 flex-1 truncate text-fog-100">{result.asset.name}</span>
							{team && <TeamLogo logo={team.logo} name={team.name} size={16} />}
							{money && (
								<span className={`w-8 shrink-0 text-right font-display font-bold tabular-nums ${result.took_remaining_budget ? 'text-star-400' : 'text-fog-100'}`}>
									<Money amount={result.price} />
								</span>
							)}
							<span className="w-7 shrink-0 text-right tabular-nums text-fog-500">{timeAgo(result.made_at, now)}</span>
						</button>
						{open && <BidHistory snapshot={snapshot} result={result} now={now} />}
					</li>
				);
			})}
		</ol>
	);
}

/** Results by default, the raw log on demand. */
export function RailFeed({ snapshot, maxHeight = 'max-h-[70vh]' }: { snapshot: DraftSnapshot; maxHeight?: string }) {
	const [view, setView] = useState<'results' | 'log'>('results');
	const [open, setOpen] = useState(true);
	const tab = (key: 'results' | 'log', label: string) => (
		<button type="button" className={`px-1 ${view === key ? 'text-fog-100' : 'text-fog-500 hover:text-fog-300'}`} onClick={() => setView(key)} aria-pressed={view === key}>
			{label}
		</button>
	);
	return (
		<>
			<div className="flex items-center gap-1 border-b border-night-800 px-1 py-1 font-display text-[10px] font-bold uppercase tracking-widest">
				{tab('results', 'Results')}
				{tab('log', 'Log')}
				<button type="button" className="ml-auto px-1 text-fog-500 hover:text-fog-300" onClick={() => setOpen(!open)} aria-expanded={open} aria-label={open ? 'Collapse' : 'Expand'}>
					{open ? '▴' : '▾'}
				</button>
			</div>
			{open && (view === 'results' ? <ResultsFeed snapshot={snapshot} maxHeight={maxHeight} /> : <ActivityFeed snapshot={snapshot} maxHeight={maxHeight} />)}
		</>
	);
}
