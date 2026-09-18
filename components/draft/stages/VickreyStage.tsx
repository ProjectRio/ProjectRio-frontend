'use client';

// Vickrey stage as a strip: the asset, who has sealed, the clock, your sealed
// bid row, and the last reveal.

import { useEffect, useState } from 'react';
import type { VickreyCurrent } from '@/lib/draft/types';
import { AssetSprite, Clock, findTeam, Money, Reason, TeamLogo } from '../primitives';
import RunoffPanel from './RunoffPanel';
import { AssetHero, StickyBidBar, WaitingCard, type StageProps } from './shared';

export default function VickreyStage({ snapshot, handle }: StageProps) {
	const current = snapshot.current as VickreyCurrent;
	const { draft, you, teams } = snapshot;
	const nomination = current.nomination;
	const yourTeam = findTeam(snapshot, you.team_id);
	const maxBid = yourTeam?.max_bid ?? 0;
	const [amount, setAmount] = useState(you.sealed_bid ?? draft.config.min_bid);
	useEffect(() => {
		if (you.sealed_bid !== null) setAmount(you.sealed_bid);
	}, [you.sealed_bid, nomination?.id]);

	if (current.runoff) {
		const contested = snapshot.activity.find((item) => item.kind === 'system' && item.text.includes('runoff'))?.asset ?? current.last_result?.asset ?? null;
		return <RunoffPanel snapshot={snapshot} handle={handle} runoff={current.runoff} asset={contested} tiedAmount={current.last_result?.bids[0]?.amount ?? null} />;
	}

	if (!nomination) {
		return (
			<div className="flex flex-wrap items-center justify-between gap-4">
				{current.waiting_on_team_id !== null ? (
					<WaitingCard snapshot={snapshot} handle={handle} teamId={current.waiting_on_team_id} reason={snapshot.queue.find((entry) => entry.team_id === current.waiting_on_team_id)?.reason ?? null} />
				) : (
					<div>
						<p className="kicker">Between lots</p>
						<h2 className="text-xl uppercase leading-none">{draft.advance === 'manual' ? 'Waiting for the commissioner to open bidding' : 'Next nomination is on its way'}</h2>
					</div>
				)}
				{current.last_result && <RevealLine snapshot={snapshot} result={current.last_result} />}
			</div>
		);
	}

	const eligible = teams.filter((team) => current.eligible_team_ids.includes(team.id));
	const youEligible = you.team_id !== null && current.eligible_team_ids.includes(you.team_id);
	const isNominator = nomination.nominated_by_team_id === you.team_id;
	const submitted = you.team_id !== null && current.submitted_team_ids.includes(you.team_id);
	const passed = you.team_id !== null && current.passed_team_ids.includes(you.team_id);
	const busy = handle.pending.has('sealed_bid') || handle.pending.has('pass');
	const canAct = you.can_act && youEligible && !draft.paused;
	const nominator = findTeam(snapshot, nomination.nominated_by_team_id);

	return (
		<div className="space-y-2">
			<div className="flex flex-wrap items-center gap-x-6 gap-y-3">
				<AssetHero asset={nomination.asset} snapshot={snapshot}>
					<span>
						by <span className="text-fog-300">{nominator?.name}</span> · sealed, second price
					</span>
				</AssetHero>
				<div>
					<div className="font-display text-[10px] font-semibold uppercase tracking-widest text-fog-500">Sealed</div>
					<div className="font-display text-4xl font-bold leading-none tabular-nums">
						{current.submitted_team_ids.length}
						<span className="text-lg text-fog-500">/{eligible.length}</span>
					</div>
				</div>
				<Clock closesAt={nomination.closes_at} pausedRemaining={nomination.paused_remaining_s} paused={draft.paused} serverNow={handle.serverNow} untimedLabel="All in" total={draft.config.lot_seconds ?? undefined} size={84} />
				<ul className="flex flex-wrap gap-1">
					{eligible.map((team) => {
						const done = current.submitted_team_ids.includes(team.id);
						const out = current.passed_team_ids.includes(team.id);
						return (
							<li key={team.id} title={`${team.name} — ${done ? 'sealed' : out ? 'passed' : 'deciding'}${team.id === nomination.nominated_by_team_id ? ' · nominator' : ''}`} className={`rounded-full border p-0.5 ${done ? 'border-emerald-500/70 bg-emerald-500/15' : out ? 'border-transparent opacity-30 grayscale' : 'border-night-600'}`}>
								<TeamLogo logo={team.logo} name={team.name} size={22} />
							</li>
						);
					})}
				</ul>
				{current.last_result && (
					<div className="ml-auto">
						<RevealLine snapshot={snapshot} result={current.last_result} />
					</div>
				)}
			</div>

			{you.team_id !== null && you.can_act && (
				<StickyBidBar>
				<div className="flex flex-wrap items-center gap-2 rounded border border-night-700 bg-night-850 px-3 py-1.5">
					{!youEligible ? (
						<p className="text-xs text-fog-500">{you.ineligible[nomination.asset.id] ?? "You can't bid on this lot."}</p>
					) : (
						<>
							<span className="font-display text-[10px] font-semibold uppercase tracking-widest text-fog-500">{submitted ? 'Sealed · change until close' : 'Your sealed bid'}</span>
							<input type="number" min={draft.config.min_bid} max={maxBid} value={amount} disabled={!canAct || busy} onChange={(event) => setAmount(Number(event.target.value) || draft.config.min_bid)} className="input !w-20 !py-1 font-display text-base font-bold tabular-nums" aria-label="Sealed bid amount" />
							{[0.25, 0.5, 0.75, 1].map((fraction) => {
								const value = Math.max(draft.config.min_bid, Math.round(maxBid * fraction));
								return (
									<button key={fraction} type="button" className="rounded border border-night-600 px-1.5 py-0.5 text-[11px] text-fog-300 hover:border-rio-400" onClick={() => setAmount(value)}>
										${value}
									</button>
								);
							})}
							<button type="button" className="btn-primary !px-4 !py-1.5 text-sm" disabled={!canAct || busy || amount < draft.config.min_bid || amount > maxBid} onClick={() => handle.act({ type: 'sealed_bid', payload: { amount } })}>
								{submitted ? `Update $${amount}` : `Seal $${amount}`}
							</button>
							<span className="text-[11px] text-fog-500">
								max <Money amount={maxBid} className="text-fog-300" />
								{isNominator ? ' · nominator must bid' : ''}
								{submitted && you.sealed_bid !== null && (
									<span className="text-emerald-300">
										{' '}
										· sealed at <Money amount={you.sealed_bid} />
									</span>
								)}
							</span>
							{!isNominator && !submitted && (
								<button type="button" className="ml-auto font-display text-xs font-bold uppercase tracking-widest text-fog-300 hover:text-rio-300 disabled:opacity-40" disabled={!canAct || busy || passed} onClick={() => handle.act({ type: 'pass' })}>
									{passed ? 'Passed' : 'Pass'}
								</button>
							)}
							<Reason error={handle.error} types={['sealed_bid', 'pass']} className="w-full !text-xs" />
						</>
					)}
				</div>
				</StickyBidBar>
			)}
		</div>
	);
}

function RevealLine({ snapshot, result }: { snapshot: StageProps['snapshot']; result: NonNullable<VickreyCurrent['last_result']> }) {
	const winner = findTeam(snapshot, result.team_id);
	return (
		<div className="text-right text-[11px] leading-tight" title={result.bids.map((bid) => `$${bid.amount} ${findTeam(snapshot, bid.team_id)?.name}`).join(' · ')}>
			<div className="flex items-center justify-end gap-1.5">
				<span className="font-display font-semibold uppercase tracking-widest text-fog-500">Last</span>
				<AssetSprite asset={result.asset} size={18} />
				{winner && <TeamLogo logo={winner.logo} name={winner.name} size={14} />}
				<span className="font-display font-bold tabular-nums text-star-400">${result.price}</span>
			</div>
			<div className="text-fog-500">{result.bids.map((bid) => `$${bid.amount}`).join(' · ')}</div>
		</div>
	);
}
