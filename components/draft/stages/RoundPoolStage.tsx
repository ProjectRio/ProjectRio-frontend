'use client';

// Round pool stage as a strip: phase, the round's pool as sprites, sealed bid
// row, pick order, tied-group choices and runoffs.

import { useEffect, useState } from 'react';
import type { RoundPoolCurrent } from '@/lib/draft/types';
import { AssetSprite, Clock, findTeam, Money, Reason, TeamLogo } from '../primitives';
import { NominationInline } from '../NominationPicker';
import RunoffPanel from './RunoffPanel';
import { StickyBidBar, type StageProps } from './shared';

const PHASE_LABEL: Record<RoundPoolCurrent['phase'], string> = {
	nominating: 'Nominations',
	bidding: 'Sealed bids',
	picking: 'Picking',
	done: 'Round complete'
};

export default function RoundPoolStage({ snapshot, handle }: StageProps) {
	const current = snapshot.current as RoundPoolCurrent;
	const { draft, you, teams } = snapshot;
	const yourTeam = findTeam(snapshot, you.team_id);
	const participating = you.team_id !== null && current.participating_team_ids.includes(you.team_id);
	const maxBid = yourTeam?.max_bid ?? 0;
	const [amount, setAmount] = useState(you.sealed_bid ?? draft.config.min_bid);
	useEffect(() => {
		if (you.sealed_bid !== null) setAmount(you.sealed_bid);
	}, [you.sealed_bid, draft.round]);
	const yourPick = you.team_id !== null && current.picking_team_ids.includes(you.team_id);
	const yourOrder = current.order.find((entry) => entry.team_id === you.team_id);
	const tiles = current.phase === 'nominating' ? snapshot.queue.filter((entry) => entry.asset).map((entry) => ({ team_id: entry.team_id, asset: entry.asset! })) : current.nominations;
	const needsNomination = current.phase === 'nominating' && participating && !snapshot.queue.find((entry) => entry.team_id === you.team_id)?.asset && you.can_act;

	return (
		<div className="space-y-2">
			<div className="flex flex-wrap items-center gap-x-5 gap-y-3">
				<div>
					<p className="font-display text-sm font-semibold text-fog-500">{current.round_kind === 'stadium' ? 'Stadium round' : `Round ${draft.round}`}</p>
					<h2 className="text-2xl leading-none">{PHASE_LABEL[current.phase]}</h2>
					<p className="mt-0.5 max-w-xs text-[11px] text-fog-500">
						{current.phase === 'nominating' && `${current.participating_team_ids.length} teams nominate one each; the round opens when all are in.`}
						{current.phase === 'bidding' && 'One sealed bid each — bids buy pick order, not a character.'}
						{current.phase === 'picking' && 'Pick from the pool in bid order. Tied teams choose privately at the same time.'}
					</p>
				</div>

				<ul className="flex flex-wrap gap-1" aria-label="This round's pool">
					{tiles.map((entry) => {
						const team = findTeam(snapshot, entry.team_id);
						const asset = entry.asset;
						const available = current.available.some((candidate) => candidate.id === asset.id);
						const taken = current.phase === 'picking' && !available;
						const reason = you.ineligible[asset.id];
						const clickable = yourPick && available && !reason && you.can_act && !draft.paused && !current.runoff;
						const chosen = you.tie_choice === asset.id;
						return (
							<li key={`${entry.team_id}-${asset.id}`}>
								<button
									type="button"
									disabled={!clickable}
									onClick={() => handle.act({ type: 'pick', payload: { asset_id: asset.id } })}
									title={`${asset.name} · by ${team?.name}${taken ? ' · taken' : reason ? ` · ${reason}` : clickable ? ' · click to pick' : ''}`}
									className={`relative flex h-[58px] w-[46px] flex-col items-center justify-center rounded-[5px] border ${chosen ? 'sel' : taken ? 'border-transparent bg-black/20 opacity-40' : 'key-on'} ${clickable ? 'cursor-pointer hover:!border-rim' : ''}`}
								>
									<AssetSprite asset={asset} size={34} dim={taken || !!reason} />
									{team && <TeamLogo logo={team.logo} name={team.name} size={12} className="absolute bottom-0.5 right-0.5" />}
								</button>
							</li>
						);
					})}
				</ul>

				{current.phase === 'bidding' && (
					<>
						<div>
							<div className="font-display text-[11px] font-semibold uppercase tracking-wider text-fog-500">Sealed</div>
							<div className="font-mono text-3xl font-semibold leading-none tabular-nums text-fog-100">
								{current.submitted_team_ids.length}
								<span className="text-base text-fog-500">/{current.participating_team_ids.length}</span>
							</div>
						</div>
						<Clock closesAt={current.closes_at} paused={draft.paused} serverNow={handle.serverNow} untimedLabel="All in" total={draft.config.lot_seconds ?? undefined} size={76} />
						<ul className="flex flex-wrap gap-1">
							{teams
								.filter((team) => current.participating_team_ids.includes(team.id))
								.map((team) => (
									<li key={team.id} title={`${team.name} — ${current.submitted_team_ids.includes(team.id) ? 'sealed' : 'deciding'}`} className={`rounded-full p-0.5 ${current.submitted_team_ids.includes(team.id) ? 'bg-fog-100' : 'bg-black/30'}`}>
										<TeamLogo logo={team.logo} name={team.name} size={22} />
									</li>
								))}
						</ul>
					</>
				)}

				{(current.phase === 'picking' || current.phase === 'done') && current.order.length > 0 && (
					<ol className="flex flex-wrap gap-1" aria-label="Pick order">
						{current.order.map((entry, index) => {
							const team = findTeam(snapshot, entry.team_id);
							const now = current.picking_team_ids.includes(entry.team_id);
							const tied = current.order.filter((other) => other.group === entry.group).length > 1;
							return (
								<li key={entry.team_id} title={`${index + 1}. ${team?.name} — $${entry.bid}${tied ? ' (tied)' : ''}${entry.picked ? ' · picked' : now ? ' · picking' : ''}`} className={`flex items-center gap-1 border py-0.5 pl-0.5 pr-1.5 text-[10px] ${now ? 'sel !rounded-full text-fog-100' : entry.picked ? 'rounded-full border-transparent bg-black/20 text-fog-500 opacity-60' : 'rounded-full border-transparent bg-black/30 text-fog-300'}`}>
									{team && <TeamLogo logo={team.logo} name={team.name} size={18} />}
									<span className={`font-mono font-semibold tabular-nums ${now ? 'text-star-400' : 'text-fog-100'}`}>${entry.bid}</span>
									{tied && <span className="text-fog-500">=</span>}
								</li>
							);
						})}
					</ol>
				)}
				{current.phase === 'nominating' && current.waiting_on_team_ids.length > 0 && (
					<p className="text-[11px] text-fog-500">Waiting on {current.waiting_on_team_ids.map((id) => findTeam(snapshot, id)?.name).join(', ')}</p>
				)}
			</div>

			{needsNomination && (
				<div className="sel px-3 py-1.5">
					<NominationInline snapshot={snapshot} handle={handle} label="Your nomination this round" kind={current.round_kind} />
				</div>
			)}

			{current.phase === 'bidding' && participating && you.can_act && (
				<StickyBidBar>
				<div className="well flex flex-wrap items-center gap-2 px-3 py-1.5">
					<span className="font-display text-xs font-semibold text-fog-300">Your sealed bid</span>
					<input type="number" min={draft.config.min_bid} max={maxBid} value={amount} onChange={(event) => setAmount(Number(event.target.value) || 0)} className="input !w-20 !py-1 font-mono text-base font-semibold tabular-nums !text-star-400" disabled={draft.paused} aria-label="Sealed bid" />
					<button type="button" className="btn-primary !px-4 !py-1.5 text-sm" disabled={draft.paused || handle.pending.has('sealed_bid') || amount < draft.config.min_bid || amount > maxBid} onClick={() => handle.act({ type: 'sealed_bid', payload: { amount } })}>
						{you.sealed_bid !== null ? 'Update' : 'Seal'} ${amount}
					</button>
					<span className="text-[11px] text-fog-500">
						max <Money amount={maxBid} className="font-mono text-fog-100" />
					</span>
					<span className="text-[11px] text-fog-500">you pay your own bid whatever you pick</span>
					{you.sealed_bid !== null && (
						<span className="text-[11px] text-star-400">
							sealed at <Money amount={you.sealed_bid} className="font-mono" />
						</span>
					)}
					<Reason error={handle.error} types={['sealed_bid']} className="w-full !text-xs" />
				</div>
				</StickyBidBar>
			)}

			{current.phase === 'picking' && yourPick && !current.runoff && (
				<div className="sel flex flex-wrap items-center gap-x-3 px-3 py-1.5 text-xs">
					<span className="font-display text-sm font-semibold text-star-400">
						{current.tie && current.tie.team_ids.length > 1 ? `Tied with ${current.tie.team_ids.filter((id) => id !== you.team_id).map((id) => findTeam(snapshot, id)?.name).join(', ')} — choose privately` : 'Your pick'}
					</span>
					<span className="text-fog-300">click a sprite above</span>
					{yourOrder && (
						<span className="text-fog-300">
							you pay <span className="font-mono tabular-nums text-fog-100">${yourOrder.bid}</span>
						</span>
					)}
					{you.tie_choice !== null && <span className="text-star-400">choice locked, waiting for the others</span>}
					<Reason error={handle.error} types={['pick', 'tie_choice']} className="!text-xs" />
				</div>
			)}
			{current.phase === 'picking' && !yourPick && current.picking_team_ids.length > 0 && (
				<p className="text-[11px] text-fog-500">
					Picking now: {current.picking_team_ids.map((id) => findTeam(snapshot, id)?.name).join(' and ')}
					{current.tie && current.tie.team_ids.length > 1 && ` (tied — ${current.tie.chosen_team_ids.length}/${current.tie.team_ids.length} chosen)`}
				</p>
			)}

			{current.runoff && <RunoffPanel snapshot={snapshot} handle={handle} runoff={current.runoff} asset={current.tie?.contested ?? null} tiedAmount={current.order.find((entry) => current.runoff!.team_ids.includes(entry.team_id))?.bid ?? null} />}
		</div>
	);
}
