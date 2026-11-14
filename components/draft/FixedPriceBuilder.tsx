'use client';

// Fixed price (Muddyball) is not a room: a private builder with a deadline and
// a list of who has submitted (§7e). Builds are revealed on completion.

import Link from 'next/link';
import type { Asset, DraftSnapshot, FixedPriceCurrent } from '@/lib/draft/types';
import { useDraft, type DraftHandle } from '@/lib/draft/useDraft';
import { Panel, Spinner } from '@/components/ui';
import ActivityFeed from './ActivityFeed';
import CommissionerPanel from './CommissionerPanel';
import DraftBoard from './DraftBoard';
import { DeadlineLabel, useFocusMode } from './DraftRoom';
import PoolPanel from './PoolPanel';
import PreviewBar from './PreviewBar';
import RoomHeader from './RoomHeader';
import { AssetSprite, ClassDot, findTeam, Money, Reason, SectionLabel, TeamLogo } from './primitives';

function BuildPanel({ snapshot, handle }: { snapshot: DraftSnapshot; handle: DraftHandle }) {
	const { you, draft } = snapshot;
	const team = findTeam(snapshot, you.team_id);
	const current = snapshot.current as FixedPriceCurrent;
	if (!team || !you.build) return null;
	const slots = draft.config.slots;
	const characters = you.build.filter((pick) => pick.asset.kind === 'character');
	const stadiums = you.build.filter((pick) => pick.asset.kind === 'stadium');
	const spent = team.spent;
	const pct = Math.min(100, (spent / team.draft_budget) * 100);
	const full = team.open_slots_total === 0;
	const submitted = team.submitted;
	const editable = you.can_act && !submitted && draft.state === 'live';
	const busy = handle.pending.has('submit') || handle.pending.has('unsubmit');
	const captain = team.restriction_status.find((status) => status.label.startsWith('Needs'));

	const Slot = ({ index, pick, kind }: { index: number; pick: (typeof characters)[number] | undefined; kind: Asset['kind'] }) => (
		<li className={`flex items-center gap-2.5 px-2 py-1.5 ${pick ? 'key-on rounded-md' : 'well'}`}>
			<span className="w-5 font-mono text-[10px] tabular-nums text-fog-500">{kind === 'stadium' ? 'ST' : index + 1}</span>
			{pick ? (
				<>
					<AssetSprite asset={pick.asset} size={28} />
					<span className="min-w-0 flex-1 truncate text-sm text-fog-100">
						{pick.nickname ?? pick.asset.name}
						{pick.asset.captain && <span className="ml-1 text-star-400">✪</span>}
					</span>
					<ClassDot asset={pick.asset} />
					<span className="font-mono text-sm font-semibold tabular-nums text-fog-100">
						<Money amount={pick.price} />
					</span>
					{editable && (
						<button type="button" className="ml-1 text-fog-500 hover:text-fog-100" aria-label={`Remove ${pick.asset.name}`} onClick={() => handle.act({ type: 'remove', payload: { pick_id: pick.id } })}>
							×
						</button>
					)}
				</>
			) : (
				<span className="text-xs text-fog-500">{kind === 'stadium' ? 'Pick a stadium' : 'Open slot'}</span>
			)}
		</li>
	);

	return (
		<div className="p-3">
			<div className="mb-3">
				<div className="flex items-baseline justify-between">
					<span className="font-mono text-2xl font-semibold tabular-nums text-star-400">
						<Money amount={team.remaining} />
						<span className="font-body text-sm font-normal text-fog-500"> left of ${team.draft_budget}</span>
					</span>
					<span className="text-xs text-fog-500">
						<span className="font-mono tabular-nums text-fog-300">{slots.character + slots.stadium - team.open_slots_total}/{slots.character + slots.stadium}</span> slots
					</span>
					</div>
					<div className="well mt-1.5 h-2 overflow-hidden !rounded-full">
					<div className={`h-full ${pct >= 100 ? 'bg-fog-100' : 'bg-star-400'}`} style={{ width: `${pct}%` }} />
				</div>
			</div>
			<ul className="space-y-1">
				{Array.from({ length: slots.character }, (_, index) => (
					<Slot key={`c${index}`} index={index} pick={characters[index]} kind="character" />
				))}
				{Array.from({ length: slots.stadium }, (_, index) => (
					<Slot key={`s${index}`} index={index} pick={stadiums[index]} kind="stadium" />
				))}
			</ul>
			{captain && !captain.ok && <p className="mt-2 text-xs text-star-400">Your build still needs a captain.</p>}
			<div className="mt-3 flex flex-wrap items-center gap-3">
				{submitted ? (
					<>
						<span className="plate text-emerald-300 [--plate:#0d4534]">Submitted</span>
						{!current.locked && you.can_act && (
							<button type="button" className="btn-secondary !py-2 text-sm" disabled={busy} onClick={() => handle.act({ type: 'unsubmit' })}>
								Withdraw and rebuild
							</button>
						)}
						{current.locked && <span className="text-xs text-fog-500">Locked at the deadline.</span>}
					</>
				) : (
					<button type="button" className="btn-primary" disabled={!full || busy || !editable} onClick={() => handle.act({ type: 'submit' })}>
						{busy ? 'Submitting…' : full ? 'Submit build' : `Fill ${team.open_slots_total} more slot${team.open_slots_total === 1 ? '' : 's'}`}
					</button>
				)}
			</div>
			<Reason error={handle.error} types={['add', 'remove', 'submit', 'unsubmit']} className="mt-2" />
		</div>
	);
}

export default function FixedPriceBuilder({ leagueId }: { leagueId: number }) {
	const handle = useDraft(leagueId);
	const { snapshot, connection } = handle;
	useFocusMode(handle.preview.focus);
	if (connection === 'offline') {
		return (
			<div>
				<PreviewBar leagueId={leagueId} />
				<Panel className="p-8 text-center">
					<h2 className="text-2xl text-rio-300">Server unreachable</h2>
					<p className="mt-2 text-sm text-fog-500">Your build is saved on the server as you go. Reconnecting…</p>
				</Panel>
			</div>
		);
	}
	if (!snapshot) {
		return (
			<div>
				<PreviewBar leagueId={leagueId} />
				<Spinner label="Loading your build…" />
			</div>
		);
	}
	const { draft, you, teams } = snapshot;
	const current = snapshot.current as FixedPriceCurrent;
	const submittedCount = current.submitted_team_ids.length;
	const canBuild = you.team_id !== null && draft.state === 'live';
	const revealed = draft.state === 'completed';

	return (
		<div>
			<PreviewBar leagueId={leagueId} />
			<RoomHeader snapshot={snapshot} connection={connection} sound={handle.preview.sound} focus={handle.preview.focus} />
			<div className="mb-4 grid gap-3 sm:grid-cols-3">
				<div className="panel p-3">
					<div className="font-display text-[11px] font-semibold uppercase tracking-wider text-fog-500">Deadline</div>
					<div className="text-2xl font-semibold text-star-400">
						<DeadlineLabel deadline={current.deadline} serverNow={handle.serverNow} />
					</div>
					<div className="font-mono text-xs tabular-nums text-fog-500">{current.deadline ? new Date(current.deadline).toLocaleString() : ''}</div>
				</div>
				<div className="panel p-3">
					<div className="font-display text-[11px] font-semibold uppercase tracking-wider text-fog-500">Submitted</div>
					<div className="font-mono text-2xl font-semibold tabular-nums text-fog-100">
						{submittedCount}
						<span className="text-sm text-fog-500"> / {teams.length}</span>
					</div>
					<div className="text-xs text-fog-500">{revealed ? 'Builds revealed' : 'Builds stay private until the commissioner completes the draft'}</div>
				</div>
				<div className="panel p-3">
					<div className="font-display text-[11px] font-semibold uppercase tracking-wider text-fog-500">Rules</div>
					<div className="flex flex-wrap gap-x-3 text-sm text-fog-300">
						<span className="font-mono tabular-nums">${draft.config.budget}</span>
						<span>
							{draft.config.slots.character} characters + {draft.config.slots.stadium} stadium
						</span>
					</div>
					<div className="flex flex-wrap gap-x-3 text-xs text-fog-500">
						<span>Identical rosters allowed</span>
						<span>No trades</span>
					</div>
				</div>
			</div>

			{revealed ? (
				<Panel>
					<SectionLabel>Revealed builds</SectionLabel>
					<div className="p-2">
						<DraftBoard snapshot={snapshot} previous={handle.previous} act={handle.act} />
					</div>
				</Panel>
			) : (
				<div className="grid gap-4 lg:grid-cols-[20rem_minmax(0,1fr)] xl:grid-cols-[20rem_minmax(0,1fr)_18rem]">
					<aside className="space-y-4">
						{canBuild ? (
							<Panel>
								<SectionLabel>
	Your build <span className="ml-2 font-body font-normal text-fog-500">{findTeam(snapshot, you.team_id)?.name}</span>
</SectionLabel>
								<BuildPanel snapshot={snapshot} handle={handle} />
							</Panel>
						) : (
							<Panel className="p-4 text-sm text-fog-500">
								{you.role === 'none' ? (
									<>
										<Link href="/login" className="text-star-400 underline underline-offset-4">
											Log in
										</Link>{' '}
										as a manager to build a team.
									</>
								) : (
									'Only managers build. You can see who has submitted.'
								)}
							</Panel>
						)}
						{you.role === 'commissioner' && (
							<Panel>
								<SectionLabel>Commissioner</SectionLabel>
								<CommissionerPanel snapshot={snapshot} handle={handle} />
							</Panel>
						)}
					</aside>
					<Panel>
						<SectionLabel action={canBuild && !findTeam(snapshot, you.team_id)?.submitted ? <span className="font-display text-xs font-semibold text-star-400">Click to add</span> : undefined}>
							Price sheet
						</SectionLabel>
						<PoolPanel snapshot={snapshot} mode={canBuild && !findTeam(snapshot, you.team_id)?.submitted ? 'add' : 'browse'} onSelect={(asset) => handle.act({ type: 'add', payload: { asset_id: asset.id } })} />
					</Panel>
					<aside className="space-y-4">
						<Panel>
							<SectionLabel>Teams</SectionLabel>
							<ul className="px-1 pb-1">
								{teams.map((team) => (
									<li key={team.id} className={`flex items-center gap-2 rounded-md px-2 py-1.5 text-sm ${team.id === you.team_id ? 'bg-star-400/[0.07]' : ''}`}>
										<TeamLogo logo={team.logo} name={team.name} size={22} />
										<span className="min-w-0 flex-1 truncate text-fog-100">{team.name}</span>
										{team.submitted ? <span className="plate text-[10px] text-emerald-300 [--plate:#0d4534]">Submitted</span> : <span className="text-xs text-fog-500">Building</span>}
									</li>
								))}
							</ul>
						</Panel>
						<Panel>
							<SectionLabel>Activity</SectionLabel>
							<ActivityFeed snapshot={snapshot} limit={15} />
						</Panel>
					</aside>
				</div>
			)}
		</div>
	);
}
