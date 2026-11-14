'use client';

// Auction bid controls (§10e) in one row: quick increments disabled past max
// bid, a custom amount, keyboard shortcuts, confirm only over 2× the high.
// When the lot has just opened, the same row is the nominator's opening bid.

import { useEffect, useRef, useState } from 'react';
import type { AuctionCurrent, DraftAction, DraftSnapshot } from '@/lib/draft/types';
import type { ActionError } from '@/lib/draft/useDraft';
import { findTeam, Kbd, Money, Reason } from './primitives';

/**
 * Your situation in one line: what winning at this price leaves per slot,
 * and which league rules you still have to satisfy.
 */
function Situation({ snapshot, teamId, bidding }: { snapshot: DraftSnapshot; teamId: number; bidding: number }) {
	const team = findTeam(snapshot, teamId)!;
	const { config } = snapshot.draft;
	const slots = team.open_slots_total;
	const after = slots > 1 ? Math.floor((team.remaining - bidding) / (slots - 1)) : null;
	const perSlotNow = slots > 0 ? Math.floor(team.remaining / slots) : null;
	const tight = after !== null && after < config.min_bid * 2;
	const rules = team.restriction_status.filter((rule) => !rule.waived);
	return (
		<p className="flex flex-wrap gap-x-3 gap-y-0.5 text-[11px] text-fog-500">
			<span>
				<Money amount={team.remaining} className="font-semibold text-fog-300" /> left · {slots} slot{slots === 1 ? '' : 's'}
				{team.open_slots.stadium > 0 && team.open_slots.character > 0 ? ` (${team.open_slots.character}+${team.open_slots.stadium})` : ''}
				{perSlotNow !== null && (
					<>
						{' '}
						· <Money amount={perSlotNow} className="text-fog-300" />/slot
					</>
				)}
			</span>
			{after !== null && (
				<span className={tight ? 'text-star-400' : ''}>
					win at ${bidding} → <Money amount={after} className={tight ? 'font-semibold text-star-400' : 'font-semibold text-fog-300'} />/slot for the rest
				</span>
			)}
			{slots === 1 && config.last_slot_takes_remaining && <span className="text-star-400">last slot pays your whole remaining budget</span>}
			{rules.map((rule) => (
				<span key={rule.label} className={rule.ok ? 'text-emerald-300/80' : 'text-star-400'}>
					{rule.ok ? '✓' : '!'} {rule.label}
				</span>
			))}
		</p>
	);
}

export default function BidControls({ snapshot, current, act, pending, error }: { snapshot: DraftSnapshot; current: AuctionCurrent; act: (action: DraftAction) => Promise<unknown>; pending: Set<string>; error: ActionError | null }) {
	const { you, draft } = snapshot;
	const team = findTeam(snapshot, you.team_id);
	const high = current.high_bid;
	const increment = draft.config.bid_increment;
	const opening = current.awaiting_opening;
	const floor = high ? high.amount + increment : draft.config.min_bid;
	const maxBid = team?.max_bid ?? 0;
	const [amount, setAmount] = useState(floor);
	const [confirming, setConfirming] = useState<number | null>(null);
	const inputRef = useRef<HTMLInputElement>(null);

	const nomination = current.nomination;
	const isNominator = !!nomination && nomination.nominated_by_team_id === you.team_id;
	const youAreHigh = !!high && high.team_id === you.team_id;
	const passed = you.team_id !== null && current.passed_team_ids.includes(you.team_id);
	const eligible = you.team_id !== null && current.eligible_team_ids.includes(you.team_id);
	const ineligibleReason = nomination ? you.ineligible[nomination.asset.id] : undefined;
	const locked = draft.paused || !!current.rescind_pending || !nomination;
	const canBid = you.can_act && eligible && !youAreHigh && !locked && !ineligibleReason && floor <= maxBid && (!opening || isNominator);

	useEffect(() => {
		setAmount((value) => Math.max(floor, Math.min(value, maxBid || floor)));
	}, [floor, maxBid]);
	useEffect(() => {
		if (opening) setAmount(floor);
	}, [opening, nomination?.id, floor]);

	async function bid(value: number) {
		if (!canBid) return;
		if (high && value > high.amount * 2 && confirming !== value) {
			setConfirming(value);
			return;
		}
		setConfirming(null);
		await act({ type: 'bid', payload: { amount: value } });
	}

	useEffect(() => {
		function onKey(event: KeyboardEvent) {
			const target = event.target as HTMLElement | null;
			const typing = target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT');
			if (event.key === 'b' && !typing) {
				event.preventDefault();
				inputRef.current?.focus();
				inputRef.current?.select();
			} else if (event.key === 'o' && !typing && canBid && !opening) {
				event.preventDefault();
				void act({ type: 'pass' });
			} else if ((event.key === '+' || event.key === '=') && !typing && canBid && !opening) {
				event.preventDefault();
				void bid(floor);
			} else if (event.key === 'Escape') setConfirming(null);
		}
		window.addEventListener('keydown', onKey);
		return () => window.removeEventListener('keydown', onKey);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [canBid, floor, opening]);

	if (!you.can_act || you.team_id === null || !nomination) return null;
	if (team && team.open_slots_total === 0) return <p className="text-xs text-fog-500">Your roster is full.</p>;

	const busy = pending.has('bid') || pending.has('pass') || pending.has('request_rescind');
	const situation = team ? <Situation snapshot={snapshot} teamId={team.id} bidding={amount} /> : null;

	if (opening && !isNominator) {
		return <p className="text-xs text-fog-500">Bidding opens once {findTeam(snapshot, nomination.nominated_by_team_id)?.name} names the opening bid.</p>;
	}

	if (opening) {
		const quick = [draft.config.min_bid, 5, 10, 15, 20].filter((value, index, all) => value >= draft.config.min_bid && value <= maxBid && all.indexOf(value) === index);
		return (
			<div className="space-y-1.5">
				<form
					className="flex flex-wrap items-center gap-1.5 rounded border border-rio-500/50 bg-rio-500/5 px-2 py-1.5"
					onSubmit={(event) => {
						event.preventDefault();
						void bid(amount);
					}}
				>
					<span className="font-display text-[11px] font-bold uppercase tracking-widest text-rio-300">Your nomination · open the bidding at</span>
					<input ref={inputRef} type="number" min={floor} max={maxBid} step={increment} value={amount} disabled={!canBid || busy} onChange={(event) => setAmount(Number(event.target.value) || floor)} className="input !w-20 !py-1 font-display text-base font-bold tabular-nums" aria-label="Opening bid" autoFocus />
					{quick.map((value) => (
						<button key={value} type="button" disabled={!canBid || busy} onClick={() => setAmount(value)} className={`rounded border px-2 py-1 text-xs ${amount === value ? 'border-rio-400 text-fog-100' : 'border-night-600 text-fog-300 hover:border-rio-400'} disabled:opacity-40`}>
							${value}
						</button>
					))}
					<button type="submit" className="btn-primary !px-4 !py-1.5 text-sm disabled:cursor-not-allowed disabled:opacity-40" disabled={!canBid || busy || amount < floor || amount > maxBid}>
						Open at ${amount}
					</button>
					<span className="text-[11px] text-fog-500">
						max <Money amount={maxBid} className="font-semibold text-fog-300" /> · you hold it until someone bids
					</span>
				</form>
				{situation}
				<Reason error={error} types={['bid']} className="!text-xs" />
			</div>
		);
	}

	const quick = [increment * 2, increment * 5, increment * 10];

	if (youAreHigh) {
		return (
			<div className="flex flex-wrap items-center gap-3 rounded border border-rio-500/50 bg-rio-500/10 px-3 py-1.5 text-xs">
				<span className="font-display font-bold uppercase tracking-widest text-rio-300">You hold the high bid</span>
				<span className="text-fog-300">
					<Money amount={high!.amount} /> · {high!.placed_by}
				</span>
				{high!.rescind === 'requested' ? (
					<span className="ml-auto text-star-400">Rescind requested — commissioner deciding</span>
				) : (
					<button type="button" className="ml-auto text-fog-500 underline decoration-dotted underline-offset-2 hover:text-fog-100" disabled={busy} onClick={() => act({ type: 'request_rescind' })}>
						Request to rescind
					</button>
				)}
			</div>
		);
	}

	return (
		<div className="space-y-1.5">
			<div className="flex flex-wrap items-center gap-1.5">
				<button type="button" disabled={!canBid || busy} onClick={() => bid(floor)} className="btn-primary !px-4 !py-1.5 text-sm disabled:cursor-not-allowed disabled:opacity-40">
					Bid ${floor}
				</button>
				{quick.map((step) => (
					<button key={step} type="button" disabled={!canBid || busy || floor + step - increment > maxBid} onClick={() => bid(floor + step - increment)} className="btn-secondary !px-3 !py-1.5 text-xs disabled:cursor-not-allowed disabled:opacity-40">
						+${step}
					</button>
				))}
				<form
					className="flex items-center gap-1.5"
					onSubmit={(event) => {
						event.preventDefault();
						void bid(amount);
					}}
				>
					<input ref={inputRef} type="number" min={floor} max={maxBid} step={increment} value={amount} disabled={!canBid || busy} onChange={(event) => setAmount(Number(event.target.value) || floor)} className="input !w-20 !py-1 font-display text-base font-bold tabular-nums" aria-label="Custom bid" />
					<button type="submit" className="btn-secondary !px-3 !py-1.5 text-xs disabled:opacity-40" disabled={!canBid || busy || amount < floor || amount > maxBid}>
						Bid ${amount}
					</button>
				</form>
				<span className="text-[11px] text-fog-500">
					max <Money amount={maxBid} className="font-semibold text-fog-300" />
					{floor > maxBid && !ineligibleReason && <span className="text-star-400"> · can't cover the next increment</span>}
					{ineligibleReason && <span className="text-star-400"> · {ineligibleReason}</span>}
				</span>
				{!passed ? (
					<button type="button" className="ml-auto font-display text-xs font-bold uppercase tracking-widest text-fog-300 hover:text-rio-300 disabled:opacity-40" disabled={busy || locked} onClick={() => act({ type: 'pass' })}>
						I'm out
					</button>
				) : (
					<span className="ml-auto font-display text-[11px] font-bold uppercase tracking-widest text-fog-500">You're out · bid to rejoin</span>
				)}
				<span className="hidden text-[10px] text-fog-500 xl:inline">
					<Kbd>B</Kbd> <Kbd>+</Kbd> <Kbd>O</Kbd>
				</span>
			</div>
			{situation}
			{confirming !== null && (
				<div className="flex flex-wrap items-center gap-3 rounded border border-star-500/50 bg-star-500/10 px-3 py-1.5 text-xs">
					<span className="text-fog-100">${confirming} is more than double the high bid. Place it?</span>
					<button type="button" className="btn-primary !px-3 !py-1 text-xs" onClick={() => bid(confirming)}>
						Yes, bid ${confirming}
					</button>
					<button type="button" className="text-fog-500 hover:text-fog-100" onClick={() => setConfirming(null)}>
						Cancel
					</button>
				</div>
			)}
			<Reason error={error} types={['bid', 'pass', 'request_rescind']} className="!text-xs" />
		</div>
	);
}
