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
		<div className="well mx-2 mb-1.5 px-2 py-1.5 text-[11px]">
			<div className="mb-1 flex flex-wrap items-center gap-x-2 text-fog-500">
				<span className="font-mono tabular-nums">{draft.format === 'snake' ? `Pick ${result.pick_number}` : `Lot ${result.round}`}</span>
				{nominator && (
					<span>
						nom. <span className="text-fog-300">{nominator.name}</span>
					</span>
				)}
				{result.opening_bid !== null && (
					<span>
						opened <span className="font-mono tabular-nums">${result.opening_bid}</span>
					</span>
				)}
				{result.took_remaining_budget && <span className="text-star-400">last slot</span>}
				{result.took_remaining_budget && <span className="text-star-400">remaining budget</span>}
				{result.note && <span className="text-fog-300">{result.note}</span>}
			</div>
			{result.bids.length > 0 ? (
				<ol className="space-y-0.5">
					{result.bids.map((bid) => {
						const team = findTeam(snapshot, bid.team_id);
						const winner = bid.team_id === result.team_id && (roundPool || bid.id === result.bids.find((candidate) => candidate.team_id === result.team_id)?.id);
						return (
							<li key={bid.id} className={`flex items-center gap-1.5 ${bid.rescind === 'approved' ? 'line-through opacity-50' : ''}`}>
								<span className={`w-8 text-right font-mono font-semibold tabular-nums ${winner ? 'text-star-400' : 'text-fog-300'}`}>${bid.amount}</span>
								{team && <TeamLogo logo={team.logo} name={team.name} size={14} />}
								<span className={`min-w-0 flex-1 truncate ${winner ? 'text-fog-100' : 'text-fog-300'}`}>{team?.name}</span>
								<span className="font-mono tabular-nums text-fog-500">{timeAgo(bid.placed_at, now)}</span>
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
		<ol className={`overflow-y-auto px-3 pb-2 ${maxHeight}`}>
			{items.map((result) => {
				const team = findTeam(snapshot, result.team_id);
				const open = openId === result.pick_id;
				const yours = result.team_id === snapshot.you.team_id;
				return (
					<li key={result.pick_id} className={yours ? '-mx-3 bg-star-400/[0.06] px-3' : ''}>
						<button
							type="button"
							className="pick flex w-full items-center gap-1.5 !py-1 text-left text-[11px] leading-snug"
							onClick={() => setOpenId(open ? null : result.pick_id)}
							aria-expanded={open}
							title={`${result.asset.name} → ${team?.name} · ${result.bids.length} bid${result.bids.length === 1 ? '' : 's'}`}
						>
							<span className="w-5 shrink-0 text-right font-mono text-[10px] tabular-nums text-fog-500">{result.pick_number}</span>
							<AssetSprite asset={result.asset} size={22} />
							<span className="min-w-0 flex-1 truncate text-fog-100">{result.asset.name}</span>
							{team && <TeamLogo logo={team.logo} name={team.name} size={16} />}
							{money && (
								<span className={`w-8 shrink-0 text-right font-mono font-semibold tabular-nums ${result.took_remaining_budget ? 'text-star-400' : 'text-fog-100'}`}>
									<Money amount={result.price} />
								</span>
							)}
							<span className="w-7 shrink-0 text-right font-mono tabular-nums text-fog-500">{timeAgo(result.made_at, now)}</span>
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
		<button type="button" className="!px-2 !py-0.5 !text-xs" onClick={() => setView(key)} aria-pressed={view === key}>
			{label}
		</button>
	);
	return (
		<>
			<div className="flex items-center gap-1 px-2 pb-1.5 pt-2">
				<div className="seg">
					{tab('results', 'Results')}
					{tab('log', 'Log')}
				</div>
				<button type="button" className="ml-auto px-1 text-fog-500 hover:text-fog-300" onClick={() => setOpen(!open)} aria-expanded={open} aria-label={open ? 'Collapse' : 'Expand'}>
					{open ? '▴' : '▾'}
				</button>
			</div>
			{open && (view === 'results' ? <ResultsFeed snapshot={snapshot} maxHeight={maxHeight} /> : <ActivityFeed snapshot={snapshot} maxHeight={maxHeight} />)}
		</>
	);
}
