'use client';

// Bits shared by the stages: the compact asset hero, the "waiting on" card,
// and the commissioner's act-for-team nomination.

import { useState } from 'react';
import { usePlan } from '@/lib/draft/plan';
import type { Asset, DraftSnapshot } from '@/lib/draft/types';
import type { DraftHandle } from '@/lib/draft/useDraft';
import { AssetCombobox, NominationInline } from '../NominationPicker';
import { AssetSprite, ClassTag, findTeam, RestrictionMarks, TeamLogo } from '../primitives';

export interface StageProps {
	snapshot: DraftSnapshot;
	handle: DraftHandle;
}

/** Sprite, name, class, restrictions and the asset's past prices in one block. */
export function AssetHero({ asset, snapshot, size = 84, children }: { asset: Asset; snapshot: DraftSnapshot; size?: number; children?: React.ReactNode }) {
	const icons = snapshot.pool.find((entry) => entry.asset.id === asset.id)?.restriction_icons ?? [];
	const history = snapshot.price_history[asset.id];
	const target = usePlan(snapshot.draft.league_id).targets.includes(asset.id) && snapshot.you.team_id !== null;
	return (
		<div className="flex min-w-0 items-center gap-3">
			<div className="relative flex shrink-0 items-center justify-center rounded-full" style={{ width: size + 16, height: size + 16, background: 'radial-gradient(circle, rgb(230 0 18 / 0.28), rgb(230 0 18 / 0.04) 60%, transparent 72%)' }}>
				<AssetSprite asset={asset} size={size} />
			</div>
			<div className="min-w-0">
				<div className="flex items-center gap-2">
					<ClassTag asset={asset} />
					{icons.length > 0 && <RestrictionMarks icons={icons} />}
					{target && <span className="rounded-sm bg-star-500/20 px-1 font-display text-[9px] font-bold uppercase tracking-widest text-star-400">★ your target</span>}
				</div>
				<h2 className="text-2xl uppercase leading-none sm:text-3xl">{asset.name}</h2>
				<div className="mt-1 text-[11px] text-fog-500">
					{history && (
						<span title={history.samples.map((sample) => `${sample.season} $${sample.price}`).join(' · ')}>
							avg <span className="text-fog-300">${Math.round(history.avg)}</span> ({history.min}–{history.max})
						</span>
					)}
					{children && (
						<>
							{history ? ' · ' : ''}
							{children}
						</>
					)}
					{icons.length > 0 && <span> · {icons.map((icon) => icon.label).join(' · ')}</span>}
				</div>
			</div>
		</div>
	);
}

export function StatBlock({ label, children, accent = false }: { label: string; children: React.ReactNode; accent?: boolean }) {
	return (
		<div>
			<div className="font-display text-[10px] font-semibold uppercase tracking-widest text-fog-500">{label}</div>
			<div className={`font-display text-2xl font-bold leading-none tabular-nums ${accent ? 'text-rio-300' : 'text-fog-100'}`}>{children}</div>
		</div>
	);
}

/** "The draft waits" — the front of the queue is missing or invalid. */
export function WaitingCard({ snapshot, handle, teamId, reason }: { snapshot: DraftSnapshot; handle: DraftHandle; teamId: number; reason: string | null }) {
	const team = findTeam(snapshot, teamId);
	const yours = teamId === snapshot.you.team_id;
	const commissioner = snapshot.you.role === 'commissioner';
	const [acting, setActing] = useState(false);

	async function nominateFor(asset: Asset) {
		const result = await handle.act({ type: 'act_for_team', payload: { team_id: teamId, action: { type: 'queue_nomination', payload: { asset_id: asset.id } } } });
		if (result.ok) setActing(false);
	}

	return (
		<div className="flex flex-wrap items-center gap-x-5 gap-y-2">
			<div className="flex items-center gap-3">
				{team && <TeamLogo logo={team.logo} name={team.name} size={36} />}
				<div>
					<p className="kicker">{yours ? 'Your turn to nominate' : 'The draft waits'}</p>
					<h2 className="text-xl uppercase leading-none">{yours ? 'Name your nomination' : `Waiting on ${team?.name ?? 'a team'}`}</h2>
					<p className="mt-0.5 text-[11px] text-fog-500">{reason ?? 'No nomination queued'} · no nomination timer; the commissioner can nominate for the team.</p>
				</div>
			</div>
			{yours && snapshot.you.can_act && <NominationInline snapshot={snapshot} handle={handle} label="Nominate" />}
			{commissioner && !yours && (
				<div className="flex items-center gap-2 text-xs">
					{!acting ? (
						<button type="button" className="btn-secondary !py-1 text-[11px]" onClick={() => setActing(true)}>
							Nominate for {team?.name}
						</button>
					) : (
						<>
							<AssetCombobox snapshot={snapshot} onPick={nominateFor} forTeamId={teamId} autoFocus placeholder={`Nominate for ${team?.name}…`} className="w-44" />
							<button type="button" className="text-fog-500 hover:text-fog-100" onClick={() => setActing(false)}>
								Cancel
							</button>
							{handle.error?.type === 'act_for_team' && <span className="text-rio-300">{handle.error.message}</span>}
						</>
					)}
				</div>
			)}
		</div>
	);
}

/**
 * On phones the bid row pins to the bottom of the screen so a manager can bid
 * with a thumb while the board scrolls behind it. Desktop: in the strip.
 */
export function StickyBidBar({ children }: { children: React.ReactNode }) {
	return <div className="max-lg:fixed max-lg:inset-x-0 max-lg:bottom-0 max-lg:z-40 max-lg:border-t max-lg:border-night-700 max-lg:bg-night-950/95 max-lg:px-3 max-lg:py-2 max-lg:shadow-[0_-8px_24px_rgb(0_0_0_/_0.5)] max-lg:backdrop-blur">{children}</div>;
}

export function LastSaleRibbon({ snapshot, asset, teamId, price, label = 'Last' }: { snapshot: DraftSnapshot; asset: Asset; teamId: number; price: number; label?: string }) {
	const team = findTeam(snapshot, teamId);
	return (
		<span className="inline-flex items-center gap-1.5 text-[11px] text-fog-500" title={`${asset.name} to ${team?.name} for $${price}`}>
			<span className="font-display font-semibold uppercase tracking-widest">{label}</span>
			<AssetSprite asset={asset} size={18} />
			{team && <TeamLogo logo={team.logo} name={team.name} size={14} />}
			<span className="font-display font-bold tabular-nums text-star-400">${price}</span>
		</span>
	);
}
