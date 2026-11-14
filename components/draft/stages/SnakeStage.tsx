'use client';

// Snake stage as a strip: on the clock, the clock, your pick confirm, and the
// recent → upcoming ticker.

import { useEffect, useRef } from 'react';
import type { Asset, SnakeCurrent } from '@/lib/draft/types';
import { playYourTurn } from '@/lib/draft/sound';
import { AssetSprite, ClassTag, Clock, findTeam, Reason, TeamLogo } from '../primitives';
import type { StageProps } from './shared';

export default function SnakeStage({ snapshot, handle, selected, onClearSelection }: StageProps & { selected: Asset | null; onClearSelection: () => void }) {
	const current = snapshot.current as SnakeCurrent;
	const { draft, you } = snapshot;
	const clock = current.on_the_clock;
	const team = findTeam(snapshot, clock?.team_id);
	const yourTurn = !!clock && clock.team_id === you.team_id;
	const overtime = !!clock?.closes_at && clock.closes_at < handle.serverNow();
	const wasYourTurn = useRef(false);
	useEffect(() => {
		if (yourTurn && !wasYourTurn.current && handle.preview.sound) playYourTurn();
		wasYourTurn.current = yourTurn;
	}, [yourTurn, handle.preview.sound]);

	if (!clock) {
		return (
			<div>
				<p className="kicker">Board full</p>
				<h2 className="text-xl uppercase leading-none">Every pick is in</h2>
			</div>
		);
	}

	const canPick = yourTurn && you.can_act && !draft.paused;
	const reason = selected ? you.ineligible[selected.id] : undefined;

	return (
		<div className="space-y-2">
			<div className="flex flex-wrap items-center gap-x-5 gap-y-3">
				<div className="flex items-center gap-3">
					{team && <TeamLogo logo={team.logo} name={team.name} size={44} />}
					<div>
						<p className={`kicker ${yourTurn ? '' : '!text-fog-500'}`}>{yourTurn ? "You're on the clock" : 'On the clock'}</p>
						<h2 className="text-2xl uppercase leading-none">{team?.name}</h2>
						<p className="mt-0.5 text-[11px] text-fog-500">
							Round {clock.round} · pick {clock.pick_number}/{current.total_picks}
							{team && ` · ${team.open_slots.character} char, ${team.open_slots.stadium} stadium open`}
							{overtime && !draft.paused && <span className="text-star-400"> · over time, no auto-pick</span>}
						</p>
					</div>
				</div>
				<Clock closesAt={clock.closes_at} paused={draft.paused} serverNow={handle.serverNow} untimedLabel="No clock" total={draft.config.pick_seconds ?? undefined} size={76} />

				{canPick && (
					<div className={`flex flex-wrap items-center gap-3 rounded border px-3 py-1.5 ${selected ? 'border-rio-500/60 bg-rio-500/10' : 'border-night-700 bg-night-850'}`}>
						{selected ? (
							<>
								<AssetSprite asset={selected} size={40} />
								<div>
									<ClassTag asset={selected} />
									<div className="text-lg uppercase leading-none">{selected.name}</div>
									{reason && <p className="text-[11px] text-star-400">{reason}</p>}
								</div>
								<button type="button" className="btn-primary !py-1.5 text-sm" disabled={!!reason || handle.pending.has('pick')} onClick={() => handle.act({ type: 'pick', payload: { asset_id: selected.id } }).then((result) => result.ok && onClearSelection())}>
									{handle.pending.has('pick') ? 'Drafting…' : `Draft ${selected.name}`}
								</button>
								<button type="button" className="text-xs text-fog-500 hover:text-fog-100" onClick={onClearSelection}>
									Change
								</button>
							</>
						) : (
							<p className="text-xs text-fog-300">Pick from the pool below, then confirm here.</p>
						)}
						<Reason error={handle.error} types={['pick']} className="w-full !text-xs" />
					</div>
				)}

				<ol className="ml-auto flex gap-1 overflow-x-auto" aria-label="Pick ticker">
					{[...current.recent].reverse().slice(-4).map((pick) => {
						const owner = findTeam(snapshot, pick.team_id);
						return (
							<li key={pick.id} className="flex w-14 shrink-0 flex-col items-center rounded border border-night-800 bg-night-900 py-1 opacity-80" title={`${pick.round}.${pick.pick_number} ${pick.nickname ?? pick.asset.name} — ${owner?.name}`}>
								<span className="font-display text-[9px] tabular-nums text-fog-500">
									{pick.round}.{pick.pick_number}
								</span>
								<AssetSprite asset={pick.asset} size={26} />
								{owner && <TeamLogo logo={owner.logo} name={owner.name} size={14} className="mt-0.5" />}
							</li>
						);
					})}
					<li className="flex w-14 shrink-0 flex-col items-center rounded border border-rio-500 bg-rio-500/10 py-1" title={`Now: ${team?.name}`}>
						<span className="font-display text-[9px] font-bold uppercase tracking-widest text-rio-300">Now</span>
						{team && <TeamLogo logo={team.logo} name={team.name} size={26} />}
						<span className="font-display text-[9px] tabular-nums text-fog-500">
							{clock.round}.{clock.pick_number}
						</span>
					</li>
					{current.upcoming.slice(0, 6).map((entry) => {
						const owner = findTeam(snapshot, entry.team_id);
						return (
							<li key={entry.pick_number} className={`flex w-14 shrink-0 flex-col items-center rounded border py-1 ${entry.team_id === you.team_id ? 'border-rio-500/40 bg-night-850' : 'border-night-800 bg-night-900'}`} title={`${entry.round}.${entry.pick_number} ${owner?.name}`}>
								<span className="font-display text-[9px] tabular-nums text-fog-500">
									{entry.round}.{entry.pick_number}
								</span>
								{owner && <TeamLogo logo={owner.logo} name={owner.name} size={26} />}
								<span className="font-display text-[9px] uppercase text-fog-500">{entry.team_id === you.team_id ? 'you' : ' '}</span>
							</li>
						);
					})}
				</ol>
			</div>
		</div>
	);
}
