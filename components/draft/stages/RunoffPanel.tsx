'use client';

// A $1 runoff between tied teams (§7i): open ascending among only them.

import { useState } from 'react';
import type { Asset, DraftSnapshot, RunoffView } from '@/lib/draft/types';
import type { DraftHandle } from '@/lib/draft/useDraft';
import { AssetSprite, Clock, findTeam, Money, Reason, TeamLogo } from '../primitives';

export default function RunoffPanel({ snapshot, handle, runoff, asset, tiedAmount }: { snapshot: DraftSnapshot; handle: DraftHandle; runoff: RunoffView; asset: Asset | null; tiedAmount: number | null }) {
	const { you, draft } = snapshot;
	const inRunoff = you.team_id !== null && runoff.team_ids.includes(you.team_id);
	const high = runoff.high_bid;
	const floor = (high?.amount ?? tiedAmount ?? draft.config.min_bid) + draft.config.bid_increment;
	const maxBid = findTeam(snapshot, you.team_id)?.max_bid ?? 0;
	const [amount, setAmount] = useState(floor);
	const passed = you.team_id !== null && runoff.passed_team_ids.includes(you.team_id);
	const youAreHigh = high?.team_id === you.team_id;
	const canAct = inRunoff && you.can_act && !draft.paused && !youAreHigh && !passed;
	const busy = handle.pending.has('runoff_bid') || handle.pending.has('runoff_pass');

	return (
		<div className="rounded-lg border border-star-500/50 bg-star-500/5 p-4">
			<div className="flex flex-wrap items-center justify-between gap-4">
				<div className="flex items-center gap-3">
					{asset && <AssetSprite asset={asset} size={44} />}
					<div>
						<p className="font-display text-[10px] font-bold uppercase tracking-widest text-star-400">Runoff</p>
						<h3 className="text-xl uppercase leading-none">{asset ? asset.name : 'Tie-break'} · tied at ${tiedAmount ?? '?'}</h3>
						<p className="mt-1 text-xs text-fog-500">Only the tied teams bid, in ${draft.config.bid_increment} steps, until all but one pass.</p>
					</div>
				</div>
				<div className="flex items-center gap-4">
					<div>
						<div className="font-display text-[10px] font-semibold uppercase tracking-widest text-fog-500">Runoff high</div>
						<div className="font-display text-3xl font-bold leading-none tabular-nums">{high ? <Money amount={high.amount} /> : '—'}</div>
						<div className="text-xs text-fog-300">{high ? findTeam(snapshot, high.team_id)?.name : 'no runoff bids yet'}</div>
					</div>
					<Clock closesAt={runoff.closes_at} paused={draft.paused} serverNow={handle.serverNow} size={72} total={draft.config.lot_seconds ?? undefined} />
				</div>
			</div>
			<ul className="mt-3 flex flex-wrap gap-1.5">
				{runoff.team_ids.map((id) => {
					const team = findTeam(snapshot, id);
					const out = runoff.passed_team_ids.includes(id);
					return (
						<li key={id} className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs ${high?.team_id === id ? 'border-rio-500 bg-rio-500/15 text-fog-100' : out ? 'border-night-800 text-fog-500 line-through' : 'border-night-600 text-fog-300'}`}>
							{team && <TeamLogo logo={team.logo} name={team.name} size={14} />}
							{team?.name}
						</li>
					);
				})}
			</ul>
			{inRunoff && (
				<div className="mt-3 flex flex-wrap items-center gap-2">
					<button type="button" className="btn-primary !py-2 text-sm disabled:opacity-40" disabled={!canAct || busy || floor > maxBid} onClick={() => handle.act({ type: 'runoff_bid', payload: { amount: floor } })}>
						Bid ${floor}
					</button>
					<form
						className="flex items-center gap-2"
						onSubmit={(event) => {
							event.preventDefault();
							void handle.act({ type: 'runoff_bid', payload: { amount } });
						}}
					>
						<input type="number" min={floor} max={maxBid} value={amount} onChange={(event) => setAmount(Number(event.target.value) || floor)} className="input !w-24 font-display font-bold tabular-nums" disabled={!canAct || busy} aria-label="Runoff bid" />
						<button type="submit" className="btn-secondary !py-2 text-sm disabled:opacity-40" disabled={!canAct || busy || amount < floor || amount > maxBid}>
							Bid ${amount}
						</button>
					</form>
					<button type="button" className="ml-auto font-display text-xs font-bold uppercase tracking-widest text-fog-300 hover:text-rio-300 disabled:opacity-40" disabled={!canAct || busy} onClick={() => handle.act({ type: 'runoff_pass' })}>
						{youAreHigh ? 'You lead' : passed ? "You're out" : "I'm out"}
					</button>
				</div>
			)}
			<Reason error={handle.error} types={['runoff_bid', 'runoff_pass']} className="mt-2" />
		</div>
	);
}
