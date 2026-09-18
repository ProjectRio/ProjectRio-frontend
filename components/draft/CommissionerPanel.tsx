'use client';

// Commissioner controls (§7g), all through the same action endpoint.

import { useState } from 'react';
import type { DraftSnapshot } from '@/lib/draft/types';
import type { DraftHandle } from '@/lib/draft/useDraft';
import { getServer } from '@/lib/draft/mock/transport';
import { findTeam, Money, Reason } from './primitives';

function Row({ children }: { children: React.ReactNode }) {
	return <div className="flex flex-wrap items-center gap-2">{children}</div>;
}

function Small({ children, onClick, disabled, tone = 'default', title }: { children: React.ReactNode; onClick: () => void; disabled?: boolean; tone?: 'default' | 'primary' | 'danger'; title?: string }) {
	const styles = {
		default: 'border-night-600 text-fog-300 hover:border-fog-500 hover:text-fog-100',
		primary: 'border-rio-500 bg-rio-500 text-white hover:bg-rio-400',
		danger: 'border-rio-700/60 text-rio-300 hover:border-rio-400'
	};
	return (
		<button type="button" title={title} disabled={disabled} onClick={onClick} className={`rounded border px-2.5 py-1 font-display text-[11px] font-bold uppercase tracking-widest transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${styles[tone]}`}>
			{children}
		</button>
	);
}

export default function CommissionerPanel({ snapshot, handle }: { snapshot: DraftSnapshot; handle: DraftHandle }) {
	const { draft, current, teams } = snapshot;
	const [budgetTeam, setBudgetTeam] = useState<number | ''>('');
	const [budget, setBudget] = useState<number>(draft.config.budget);
	const [waiveTeam, setWaiveTeam] = useState<number | ''>('');
	const [waiveRule, setWaiveRule] = useState('captain_required');
	const busy = (type: string) => handle.pending.has(type);
	const live = draft.state === 'live';
	const hasLots = draft.format === 'auction' || draft.format === 'vickrey';
	const openLot = (current.kind === 'auction' || current.kind === 'vickrey') && current.nomination !== null;
	const rescind = current.kind === 'auction' ? current.rescind_pending : null;
	const everyoneOut = current.kind === 'auction' && current.everyone_out;
	const awaitingOpening = current.kind === 'auction' && current.awaiting_opening ? current.nomination : null;
	const stuck = getServer(draft.league_id)?.stuckTeams() ?? [];
	const lastPick = [...teams.flatMap((team) => team.picks.filter((pick) => !pick.is_keeper))].sort((a, b) => (b.made_at ?? 0) - (a.made_at ?? 0))[0];
	const rules = draft.config.restrictions.map((restriction) => (restriction.type === 'group_max' ? `group:${restriction.name}` : restriction.type === 'handedness' ? `handedness:${restriction.char_id}` : restriction.type));

	return (
		<div className="space-y-3 p-3 text-sm">
			{draft.state === 'lobby' || draft.state === 'setup' ? (
				<Row>
					<Small tone="primary" onClick={() => handle.act({ type: 'start' })} disabled={busy('start')}>
						Start the draft
					</Small>
					<a href={`/leagues/${draft.league_id}/draft/setup`} className="text-xs text-fog-500 underline decoration-dotted underline-offset-2 hover:text-fog-100">
						Setup
					</a>
				</Row>
			) : null}

			{live && (
				<Row>
					{draft.paused ? (
						<Small tone="primary" onClick={() => handle.act({ type: 'resume' })} disabled={busy('resume')}>
							Resume
						</Small>
					) : (
						<Small onClick={() => handle.act({ type: 'pause', payload: { reason: 'Paused by the commissioner' } })} disabled={busy('pause')}>
							Pause
						</Small>
					)}
					{hasLots && !openLot && (
						<Small onClick={() => handle.act({ type: 'open_bidding' })} disabled={busy('open_bidding') || draft.paused} title="Put the front of the queue up">
							Open bidding
						</Small>
					)}
					{awaitingOpening && (
						<Small
							onClick={() => handle.act({ type: 'act_for_team', payload: { team_id: awaitingOpening.nominated_by_team_id, action: { type: 'bid', payload: { amount: draft.config.min_bid } } } })}
							disabled={busy('act_for_team') || draft.paused}
							title={`Place the opening bid on behalf of ${findTeam(snapshot, awaitingOpening.nominated_by_team_id)?.name}`}
						>
							Open at ${draft.config.min_bid} for {findTeam(snapshot, awaitingOpening.nominated_by_team_id)?.name}
						</Small>
					)}
					{((openLot && !awaitingOpening) || (current.kind === 'round_pool' && current.phase === 'bidding')) && (
						<Small onClick={() => handle.act({ type: 'close_current' })} disabled={busy('close_current') || draft.paused || !!rescind} tone={everyoneOut ? 'primary' : 'default'} title="Close bidding now">
							Close {current.kind === 'round_pool' ? 'bids' : 'lot'}
							{everyoneOut ? ' · all out' : ''}
						</Small>
					)}
					{hasLots && (
						<Small onClick={() => handle.act({ type: 'set_advance', payload: { advance: draft.advance === 'auto' ? 'manual' : 'auto' } })} disabled={busy('set_advance')}>
							Advance: {draft.advance}
						</Small>
					)}
					{draft.format === 'fixed_price' && (
						<Small onClick={() => handle.act({ type: 'extend_deadline', payload: { deadline: (draft.config.deadline ?? Date.now()) + 24 * 3600 * 1000 } })} disabled={busy('extend_deadline')}>
							Extend deadline +1d
						</Small>
					)}
					<Small tone="danger" onClick={() => window.confirm('Complete the draft and commit rosters to the ledger?') && handle.act({ type: 'complete' })} disabled={busy('complete')}>
						Complete
					</Small>
				</Row>
			)}

			{rescind && (
				<div className="rounded border border-star-500/50 bg-star-500/10 p-2">
					<p className="text-xs text-fog-100">
						<span className="font-display font-bold uppercase tracking-widest text-star-400">Rescind request</span> — {findTeam(snapshot, rescind.team_id)?.name} wants to withdraw <Money amount={rescind.amount} />.
					</p>
					<Row>
						<Small tone="primary" onClick={() => handle.act({ type: 'resolve_rescind', payload: { bid_id: rescind.id, approve: true } })} disabled={busy('resolve_rescind')}>
							Approve
						</Small>
						<Small onClick={() => handle.act({ type: 'resolve_rescind', payload: { bid_id: rescind.id, approve: false } })} disabled={busy('resolve_rescind')}>
							Reject
						</Small>
					</Row>
				</div>
			)}

			{stuck.length > 0 && (
				<div className="rounded border border-star-500/50 bg-star-500/10 p-2 text-xs text-fog-100">
					<span className="font-display font-bold uppercase tracking-widest text-star-400">No legal option</span> for {stuck.map((id) => findTeam(snapshot, id)?.name).join(', ')}. Waive a restriction below.
				</div>
			)}

			{live && draft.config.restrictions.length > 0 && (
				<div>
					<label className="label !mb-1">Waive a restriction</label>
					<Row>
						<select className="rounded border border-night-600 bg-night-900 px-2 py-1 text-xs" value={waiveTeam} onChange={(event) => setWaiveTeam(event.target.value ? Number(event.target.value) : '')}>
							<option value="">Team…</option>
							{teams.map((team) => (
								<option key={team.id} value={team.id}>
									{team.name}
								</option>
							))}
						</select>
						<select className="rounded border border-night-600 bg-night-900 px-2 py-1 text-xs" value={waiveRule} onChange={(event) => setWaiveRule(event.target.value)}>
							{[...new Set(rules)].map((rule) => (
								<option key={rule} value={rule}>
									{rule}
								</option>
							))}
						</select>
						<Small onClick={() => waiveTeam !== '' && handle.act({ type: 'waive_restriction', payload: { team_id: waiveTeam, restriction: waiveRule } })} disabled={waiveTeam === '' || busy('waive_restriction')}>
							Waive
						</Small>
					</Row>
				</div>
			)}

			{draft.format !== 'snake' && draft.state !== 'completed' && (
				<div>
					<label className="label !mb-1">Edit a draft budget</label>
					<Row>
						<select
							className="rounded border border-night-600 bg-night-900 px-2 py-1 text-xs"
							value={budgetTeam}
							onChange={(event) => {
								const id = event.target.value ? Number(event.target.value) : '';
								setBudgetTeam(id);
								if (id !== '') setBudget(findTeam(snapshot, id)?.draft_budget ?? draft.config.budget);
							}}
						>
							<option value="">Team…</option>
							{teams.map((team) => (
								<option key={team.id} value={team.id}>
									{team.name} (${team.draft_budget})
								</option>
							))}
						</select>
						<input type="number" className="input !w-20 !py-1 text-xs tabular-nums" value={budget} onChange={(event) => setBudget(Number(event.target.value) || 0)} aria-label="New budget" />
						<Small onClick={() => budgetTeam !== '' && handle.act({ type: 'set_team_budget', payload: { team_id: budgetTeam, budget } })} disabled={budgetTeam === '' || busy('set_team_budget')}>
							Set
						</Small>
					</Row>
				</div>
			)}

			{lastPick && draft.state !== 'setup' && (
				<Row>
					<Small
						tone="danger"
						onClick={() => {
							const note = window.prompt(`Void ${lastPick.asset.name} (${findTeam(snapshot, lastPick.team_id)?.name}, $${lastPick.price})? Reason:`);
							if (note) void handle.act({ type: 'void', payload: { pick_id: lastPick.id, note } });
						}}
						disabled={busy('void')}
					>
						Void last pick
					</Small>
					<span className="text-[11px] text-fog-500">
						{lastPick.asset.name} → {findTeam(snapshot, lastPick.team_id)?.name}
					</span>
				</Row>
			)}

			<Reason error={handle.error} types={['start', 'pause', 'resume', 'open_bidding', 'close_current', 'set_advance', 'complete', 'resolve_rescind', 'waive_restriction', 'set_team_budget', 'void', 'extend_deadline', 'act_for_team']} />
		</div>
	);
}
