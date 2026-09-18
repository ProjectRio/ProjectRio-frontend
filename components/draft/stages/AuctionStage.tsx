'use client';

// Auction stage as one strip: the asset, who is winning it (big), the clock,
// who's still in, the last bids — then the bid row for managers. The
// nominator is a footnote; the leader is the headline.

import { useEffect, useRef } from 'react';
import type { AuctionCurrent } from '@/lib/draft/types';
import { playOutbid, playSold, playTick } from '@/lib/draft/sound';
import BidControls from '../BidControls';
import { Clock, findTeam, Money, TeamLogo, useFlash, useThrottled } from '../primitives';
import { AssetHero, LastSaleRibbon, StickyBidBar, WaitingCard, type StageProps } from './shared';

export default function AuctionStage({ snapshot, handle }: StageProps) {
	const current = snapshot.current as AuctionCurrent;
	const { draft, you, teams } = snapshot;
	const nomination = current.nomination;
	const high = current.high_bid;
	const highTeam = findTeam(snapshot, high?.team_id);
	const nominator = findTeam(snapshot, nomination?.nominated_by_team_id);
	const flash = useFlash(high?.id);
	const liveText = useThrottled(high && highTeam ? `${highTeam.name} leads at ${high.amount} dollars` : current.awaiting_opening ? 'Waiting for the opening bid' : 'No bids');

	const previousHighTeam = useRef<number | null>(null);
	const lastTick = useRef(0);
	useEffect(() => {
		if (!handle.preview.sound) return;
		if (previousHighTeam.current === you.team_id && high?.team_id !== you.team_id && you.team_id !== null && high) playOutbid();
		previousHighTeam.current = high?.team_id ?? null;
	}, [high, you.team_id, handle.preview.sound]);
	useEffect(() => {
		if (!handle.preview.sound || !nomination?.closes_at || draft.paused) return;
		const timer = setInterval(() => {
			const remaining = (nomination.closes_at! - handle.serverNow()) / 1000;
			const second = Math.ceil(remaining);
			if (remaining > 0 && remaining < 5 && second !== lastTick.current) {
				lastTick.current = second;
				playTick();
			}
		}, 100);
		return () => clearInterval(timer);
	}, [nomination?.closes_at, draft.paused, handle]);
	const lastSaleId = useRef<string | null>(null);
	useEffect(() => {
		const key = current.last_sale ? `${current.last_sale.asset.id}-${current.last_sale.team_id}` : null;
		if (key && lastSaleId.current && key !== lastSaleId.current && handle.preview.sound) playSold();
		lastSaleId.current = key;
	}, [current.last_sale, handle.preview.sound]);

	if (!nomination) {
		return (
			<div className="flex flex-wrap items-center justify-between gap-4">
				{current.waiting_on_team_id !== null ? (
					<WaitingCard snapshot={snapshot} handle={handle} teamId={current.waiting_on_team_id} reason={snapshot.queue.find((entry) => entry.team_id === current.waiting_on_team_id)?.reason ?? null} />
				) : (
					<div>
						<p className="kicker">Between lots</p>
						<h2 className="text-xl uppercase leading-none">{draft.advance === 'manual' && draft.state === 'live' ? 'Waiting for the commissioner to open bidding' : 'Next nomination is on its way'}</h2>
					</div>
				)}
				{current.last_sale && <LastSaleRibbon snapshot={snapshot} asset={current.last_sale.asset} teamId={current.last_sale.team_id} price={current.last_sale.price} label="Last sale" />}
			</div>
		);
	}

	const stillIn = current.still_in_team_ids;
	const rescind = current.rescind_pending;
	const youLead = !!high && high.team_id === you.team_id;
	const youWereOutbid = !!high && !youLead && you.team_id !== null && current.bids.some((bid) => bid.team_id === you.team_id) && stillIn.includes(you.team_id);
	const isNominator = nomination.nominated_by_team_id === you.team_id;

	return (
		<div className="space-y-2">
			<div className="flex flex-wrap items-center gap-x-5 gap-y-3">
				<AssetHero asset={nomination.asset} snapshot={snapshot}>
					<span title="Nominated by">
						nom. <span className="text-fog-300">{isNominator ? 'you' : nominator?.name}</span>
					</span>
				</AssetHero>

				{/* The leader block — the one thing a viewer needs to read at a glance. */}
				<div
					className={`flex items-center gap-3 rounded-lg border px-3 py-1.5 transition-all ${
						current.awaiting_opening
							? 'border-dashed border-night-600'
							: youLead
								? 'border-rio-500 bg-rio-500/15 shadow-[0_0_18px_rgb(230_0_18_/_0.35)]'
								: youWereOutbid
									? 'border-star-500/70 bg-star-500/10'
									: 'border-night-600 bg-night-850'
					} ${flash ? 'ring-2 ring-rio-400/70' : ''}`}
					aria-live="off"
				>
					{current.awaiting_opening ? (
						<div>
							<div className="font-display text-[10px] font-semibold uppercase tracking-widest text-fog-500">Opening bid</div>
							<div className="font-display text-lg font-bold uppercase leading-none text-fog-300">{isNominator ? 'You set it' : `Waiting on ${nominator?.name}`}</div>
							<div className="mt-0.5 text-[10px] text-fog-500">the clock starts on it</div>
						</div>
					) : (
						<>
							{highTeam && <TeamLogo logo={highTeam.logo} name={highTeam.name} size={44} />}
							<div className="min-w-0">
								<div className={`font-display text-[10px] font-semibold uppercase tracking-widest ${youLead ? 'text-rio-300' : youWereOutbid ? 'text-star-400' : 'text-fog-500'}`}>
									{youLead ? 'You lead' : youWereOutbid ? 'Outbid · leading' : 'Leading'}
									{high?.rescind === 'requested' && <span className="ml-1.5 rounded-sm bg-star-500/20 px-1 text-[9px] text-star-400">rescind?</span>}
								</div>
								<div className={`truncate font-display text-lg font-bold uppercase leading-none tracking-wide ${youLead ? 'text-rio-300' : 'text-fog-100'}`}>{highTeam?.name}</div>
							</div>
							<div className="font-display text-5xl font-bold leading-none tabular-nums text-fog-100">{high && <Money amount={high.amount} />}</div>
						</>
					)}
					<p className="sr-only" aria-live="polite">
						{liveText}
					</p>
				</div>

				<Clock closesAt={nomination.closes_at} pausedRemaining={nomination.paused_remaining_s} paused={draft.paused || !!rescind} serverNow={handle.serverNow} untimedLabel={current.awaiting_opening ? 'Opening' : 'Untimed'} total={draft.config.lot_seconds ?? undefined} size={84} />

				<div className="min-w-0">
					<div className="mb-1 flex items-center gap-2 font-display text-[10px] font-semibold uppercase tracking-widest text-fog-500">
						Still in · {stillIn.length}
						{current.everyone_out && <span className="text-star-400">everyone else is out</span>}
					</div>
					<ul className="flex flex-wrap gap-1">
						{teams
							.filter((team) => current.eligible_team_ids.includes(team.id))
							.map((team) => {
								const inLot = stillIn.includes(team.id);
								const isHigh = high?.team_id === team.id;
								return (
									<li
										key={team.id}
										title={`${team.name} — ${isHigh ? 'leading' : inLot ? `can go to $${team.max_bid}` : current.passed_team_ids.includes(team.id) ? 'out' : "can't afford the next bid"}`}
										className={`rounded-full border p-0.5 ${isHigh ? 'border-rio-500 bg-rio-500/20' : inLot ? 'border-night-600' : 'border-transparent opacity-30 grayscale'}`}
									>
										<TeamLogo logo={team.logo} name={team.name} size={22} />
									</li>
								);
							})}
					</ul>
				</div>

				{current.bids.length > 1 && (
					<ol className="min-w-[7rem] text-[11px] leading-tight" aria-label="Recent bids">
						{current.bids.slice(1, 4).map((bid) => (
							<li key={bid.id} className={`flex items-center gap-1.5 text-fog-500 ${bid.rescind === 'approved' ? 'line-through opacity-50' : ''}`}>
								<span className="w-7 font-display font-bold tabular-nums">${bid.amount}</span>
								<span className="truncate">{findTeam(snapshot, bid.team_id)?.name}</span>
							</li>
						))}
					</ol>
				)}

			</div>

			{rescind && (
				<div className="rounded border border-star-500/50 bg-star-500/10 px-3 py-1 text-xs text-fog-100">
					<span className="font-display font-bold uppercase tracking-widest text-star-400">Clock frozen</span> — {findTeam(snapshot, rescind.team_id)?.name} asked to rescind ${rescind.amount}. The commissioner decides.
				</div>
			)}
			<StickyBidBar>
				<BidControls snapshot={snapshot} current={current} act={handle.act} pending={handle.pending} error={handle.error} />
			</StickyBidBar>
		</div>
	);
}
