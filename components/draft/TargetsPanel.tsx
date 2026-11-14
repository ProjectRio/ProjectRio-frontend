'use client';

// Your targets, one line each: sprite, name, past average, and what is
// happening to it right now — on the block, queued by someone, taken, or
// yours. Click a line to queue it; the star drops it.

import { assetById } from '@/lib/draft/assets';
import { releaseFromLineup, toggleTarget, usePlan } from '@/lib/draft/plan';
import type { Asset, DraftSnapshot } from '@/lib/draft/types';
import { AssetSprite, findTeam, Money, TeamLogo } from './primitives';

type Status = { kind: 'block' } | { kind: 'yours'; price: number } | { kind: 'gone'; team_id: number | null } | { kind: 'queued'; team_id: number } | { kind: 'open'; copies: number | null };

function statusFor(snapshot: DraftSnapshot, asset: Asset): Status {
	const { current, teams, you, pool, queue } = snapshot;
	const mine = teams.find((team) => team.id === you.team_id)?.picks.find((pick) => pick.asset.id === asset.id);
	if (mine) return { kind: 'yours', price: mine.price };
	if ((current.kind === 'auction' || current.kind === 'vickrey') && current.nomination?.asset.id === asset.id) return { kind: 'block' };
	const entry = pool.find((candidate) => candidate.asset.id === asset.id);
	if (entry && entry.remaining_copies !== null && entry.remaining_copies <= 0) {
		const taker = teams.find((team) => team.picks.some((pick) => pick.asset.id === asset.id));
		return { kind: 'gone', team_id: taker?.id ?? null };
	}
	const queued = queue.find((candidate) => candidate.asset?.id === asset.id);
	if (queued) return { kind: 'queued', team_id: queued.team_id };
	return { kind: 'open', copies: entry?.remaining_copies ?? null };
}

export default function TargetsPanel({ snapshot, canQueue, onQueue, onPlan }: { snapshot: DraftSnapshot; canQueue: boolean; onQueue: (asset: Asset) => void; onPlan: () => void }) {
	const leagueId = snapshot.draft.league_id;
	const plan = usePlan(leagueId);
	const targets = plan.targets.map(assetById);
	return (
		<>
			<div className="flex items-center gap-2 px-3 pb-1 pt-2.5">
				<h3 className="font-display text-sm font-semibold text-fog-300">Targets</h3>
				<span className="font-mono text-xs tabular-nums text-fog-500">{targets.length}</span>
				<button type="button" className="key ml-auto px-2 pb-0.5 pt-1 font-display text-xs font-semibold" onClick={onPlan}>
					Lineup
				</button>
			</div>
			{targets.length === 0 ? (
				<p className="px-3 pb-3 pt-1 text-[11px] text-fog-500">Star sprites in the pool (or rows in Pricing) to build a watchlist. It is private to you.</p>
			) : (
				<ul className="px-3 pb-2">
					{targets.map((asset) => {
						const status = statusFor(snapshot, asset);
						const avg = snapshot.price_history[asset.id]?.avg;
						const reason = snapshot.you.ineligible[asset.id];
						const queueable = canQueue && status.kind === 'open' && !reason;
						const dim = status.kind === 'gone';
						const label =
							status.kind === 'block' ? 'On the block' : status.kind === 'yours' ? `Yours · $${status.price}` : status.kind === 'gone' ? `Taken${status.team_id !== null ? ` by ${findTeam(snapshot, status.team_id)?.name}` : ''}` : status.kind === 'queued' ? `Queued by ${findTeam(snapshot, status.team_id)?.name}` : reason ? reason : queueable ? 'Click to queue' : 'Available';
						const inner = (
							<>
								<AssetSprite asset={asset} size={22} dim={dim} />
								<span className={`min-w-0 flex-1 truncate ${dim ? 'text-fog-500 line-through' : status.kind === 'yours' ? 'text-star-400' : 'text-fog-100'}`}>{asset.name}</span>
{status.kind === 'block' && <span className="plate !px-1 !py-0 text-[9px] text-rio-300 [--plate:#56161b]">Now</span>}
{status.kind === 'yours' && <span className="font-mono font-semibold tabular-nums text-star-400">${status.price}</span>}
								{(status.kind === 'gone' || status.kind === 'queued') && status.team_id !== null && <TeamLogo logo={findTeam(snapshot, status.team_id)?.logo ?? null} name={findTeam(snapshot, status.team_id)?.name ?? ''} size={14} className={dim ? 'opacity-50 grayscale' : ''} />}
								{status.kind === 'open' && status.copies !== null && status.copies > 1 && <span className="font-mono text-[9px] tabular-nums text-fog-500">×{status.copies}</span>}
								{avg !== undefined && status.kind !== 'yours' && (
									<span className="w-7 text-right font-mono tabular-nums text-fog-500">
										<Money amount={Math.round(avg)} />
									</span>
								)}
							</>
						);
						return (
							<li key={asset.id} className={`flex items-center gap-1 text-[11px] ${status.kind === 'block' ? 'sel -mx-2 px-2' : ''}`} title={label}>
								{queueable ? (
									<button type="button" className="pick flex min-w-0 flex-1 items-center gap-1.5 !py-1 text-left" onClick={() => onQueue(asset)}>
										{inner}
									</button>
								) : (
									<span className="flex min-w-0 flex-1 items-center gap-1.5 py-1">{inner}</span>
								)}
								<button
									type="button"
									className="px-0.5 text-star-400 hover:text-fog-300"
									aria-label={`Drop ${asset.name} from targets`}
									onClick={() => {
										toggleTarget(leagueId, asset.id);
										if (status.kind !== 'yours') releaseFromLineup(leagueId, asset.id);
									}}
								>
									★
								</button>
							</li>
						);
					})}
				</ul>
			)}
		</>
	);
}
