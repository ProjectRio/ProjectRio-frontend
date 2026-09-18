'use client';

// The big board — the one thing that must always fit on screen. Teams down,
// slots across, sprites only (names in tooltips). Each row also carries what
// the old sheet kept beside it: presence, money left, max bid, and the team's
// queued nomination. The current leader's row shows the asset ghosted into
// the slot it would fill, at the current price. Keepers are marked, the
// newest pick glows, your own picks take nicknames on click, and your queue
// cell is where you nominate.

import { useEffect, useMemo, useRef, useState } from 'react';
import type { Asset, DraftAction, DraftSnapshot, SnapshotPick } from '@/lib/draft/types';
import { AssetCombobox } from './NominationPicker';
import { AssetSprite, Money, PresenceDot, TeamLogo } from './primitives';

const CELL = 'h-[52px] w-[46px]';

function NicknameEditor({ pick, onSave, onCancel }: { pick: SnapshotPick; onSave: (value: string | null) => void; onCancel: () => void }) {
	const [value, setValue] = useState(pick.nickname ?? '');
	return (
		<form
			className="absolute left-1/2 top-full z-30 mt-1 w-44 -translate-x-1/2 rounded-lg border border-night-600 bg-night-900 p-2 shadow-xl"
			onSubmit={(event) => {
				event.preventDefault();
				onSave(value.trim() || null);
			}}
			onClick={(event) => event.stopPropagation()}
		>
			<label className="label !mb-1 !text-[10px]">Nickname · {pick.asset.name}</label>
			<input autoFocus className="input !py-1 !text-xs" maxLength={24} value={value} onChange={(event) => setValue(event.target.value)} placeholder={pick.asset.name} />
			<div className="mt-1.5 flex justify-end gap-2 text-[11px]">
				<button type="button" className="text-fog-500 hover:text-fog-100" onClick={onCancel}>
					Cancel
				</button>
				<button type="submit" className="font-semibold text-rio-300">
					Save
				</button>
			</div>
		</form>
	);
}

/** Where the lot lands if bidding ended now: the leader's next open slot. */
interface Pending {
	team_id: number;
	asset: Asset | null;
	price: number | null;
	yours: boolean;
}

function GhostCell({ pending, money }: { pending: Pending; money: boolean }) {
	if (!pending.asset) {
		return (
			<div className={`${CELL} flex items-center justify-center rounded border border-dashed border-rio-500/70`} title="On the clock">
				<span className="h-2 w-2 animate-pulse rounded-full bg-rio-500" />
			</div>
		);
	}
	return (
		<div
			className={`relative flex ${CELL} flex-col items-center justify-center rounded border border-dashed ${pending.yours ? 'border-rio-400 bg-rio-500/15' : 'border-star-400/80 bg-star-500/10'}`}
			title={`${pending.asset.name} — leading at $${pending.price}`}
		>
			<AssetSprite asset={pending.asset} size={money ? 30 : 36} className="opacity-70" />
			{money && pending.price !== null && (
				<span className={`font-display text-[11px] font-bold leading-none tabular-nums ${pending.yours ? 'text-rio-300' : 'text-star-400'}`}>
					<Money amount={pending.price} />
				</span>
			)}
		</div>
	);
}

function Cell({
	pick,
	snapshot,
	fresh,
	editable,
	onNickname,
	money
}: {
	pick: SnapshotPick | null;
	snapshot: DraftSnapshot;
	fresh: boolean;
	editable: boolean;
	onNickname?: (pick: SnapshotPick, nickname: string | null) => void;
	money: boolean;
}) {
	const [editing, setEditing] = useState(false);
	if (!pick) return <div className={`${CELL} rounded border border-dashed border-night-800`} />;
	const icons = snapshot.pool.find((entry) => entry.asset.id === pick.asset.id)?.restriction_icons ?? [];
	const title = [
		pick.nickname ? `${pick.nickname} (${pick.asset.name})` : pick.asset.name,
		money ? `$${pick.price}${pick.took_remaining_budget ? ' — remaining budget' : ''}` : null,
		pick.is_keeper ? 'keeper' : null,
		...icons.map((icon) => icon.label)
	]
		.filter(Boolean)
		.join(' · ');
	return (
		<div
			title={title}
			onClick={() => editable && setEditing(true)}
			className={`relative flex ${CELL} flex-col items-center justify-center rounded border transition-shadow ${
				fresh ? 'border-rio-500 shadow-[0_0_14px_rgb(230_0_18_/_0.55)]' : pick.is_keeper ? 'border-star-500/50 bg-star-500/5' : 'border-night-700 bg-night-850'
			} ${editable ? 'cursor-text hover:border-fog-500' : ''}`}
		>
			<AssetSprite asset={pick.asset} size={money ? 30 : 36} />
			{money && (
				<span className={`font-display text-[11px] font-bold leading-none tabular-nums ${pick.took_remaining_budget ? 'text-star-400' : 'text-fog-100'}`}>
					<Money amount={pick.price} />
				</span>
			)}
			{pick.is_keeper && <span className="absolute left-0 top-0 rounded-br rounded-tl bg-star-500 px-0.5 font-display text-[8px] font-bold text-night-950">K</span>}
			{pick.nickname && <span className="absolute bottom-0 right-0.5 text-[8px] text-fog-500">”</span>}
			{editing && onNickname && (
				<NicknameEditor
					pick={pick}
					onSave={(value) => {
						onNickname(pick, value);
						setEditing(false);
					}}
					onCancel={() => setEditing(false)}
				/>
			)}
		</div>
	);
}

function TeamHead({ snapshot, teamId, activeIds }: { snapshot: DraftSnapshot; teamId: number; activeIds: Set<number> }) {
	const team = snapshot.teams.find((row) => row.id === teamId)!;
	const yours = team.id === snapshot.you.team_id;
	return (
		<div className={`relative flex min-w-[9.5rem] items-center gap-2 pl-2 ${activeIds.has(team.id) ? 'before:absolute before:inset-y-1 before:left-0 before:w-0.5 before:bg-rio-500' : ''}`}>
			<TeamLogo logo={team.logo} name={team.name} size={24} />
			<div className="min-w-0">
				<div className="flex items-center gap-1">
					<PresenceDot present={team.present} />
					<span className={`truncate font-display text-[11px] font-bold uppercase tracking-wider ${yours ? 'text-rio-300' : 'text-fog-100'}`}>{team.name}</span>
				</div>
				<div className="truncate text-[10px] leading-tight text-fog-500" title={team.managers.map((manager) => `${manager.username}${manager.connected ? '' : ' (away)'}`).join(', ')}>
					{team.managers.map((manager) => manager.username).join(' & ')}
				</div>
			</div>
		</div>
	);
}

/** Your queue cell doubles as the nomination control: click to type a name, × to clear. */
function QueueCell({
	snapshot,
	teamId,
	position,
	act,
	interactive
}: {
	snapshot: DraftSnapshot;
	teamId: number;
	position: number;
	act?: (action: DraftAction) => Promise<unknown>;
	interactive: boolean;
}) {
	const { draft, queue, current } = snapshot;
	const entry = queue.find((candidate) => candidate.team_id === teamId);
	const [open, setOpen] = useState(false);
	const [anchor, setAnchor] = useState<{ top: number; right: number } | null>(null);
	const wrap = useRef<HTMLDivElement>(null);
	const button = useRef<HTMLButtonElement>(null);
	useEffect(() => {
		if (!open) return;
		function onDown(event: MouseEvent) {
			if (wrap.current && !wrap.current.contains(event.target as Node)) setOpen(false);
		}
		function onKey(event: KeyboardEvent) {
			if (event.key === 'Escape') setOpen(false);
		}
		window.addEventListener('mousedown', onDown);
		window.addEventListener('keydown', onKey);
		return () => {
			window.removeEventListener('mousedown', onDown);
			window.removeEventListener('keydown', onKey);
		};
	}, [open]);
	if (!entry) return null;
	// The board scrolls sideways, which clips anything absolutely positioned
	// inside it — so the popover is fixed at the cell's corner instead.
	const toggle = () => {
		if (!open && button.current) {
			const rect = button.current.getBoundingClientRect();
			setAnchor({ top: rect.bottom + 4, right: window.innerWidth - rect.right });
		}
		setOpen(!open);
	};
	const roundPool = draft.format === 'round_pool';
	const front = position === 1 && !roundPool;
	const waitingOnThis = (current.kind === 'auction' || current.kind === 'vickrey') && current.waiting_on_team_id === teamId;
	const roundKind = current.kind === 'round_pool' && current.phase === 'nominating' ? current.round_kind : null;
	const soon = !roundPool && position <= 2;
	const title = entry.asset ? `${entry.asset.name}${entry.reason ? ` — ${entry.reason}` : ''}${interactive ? ' · click to change' : ''}` : interactive ? 'Nothing queued — click to nominate' : 'Nothing queued';
	const tone = waitingOnThis ? 'border-rio-500 bg-rio-500/15 animate-pulse' : !entry.valid && entry.asset ? 'border-star-500/60' : front ? 'border-rio-500/50 bg-rio-500/10' : interactive && !entry.asset && soon ? 'border-star-500/50' : 'border-night-800';
	const body = (
		<>
			<span className={`w-3 font-display text-[10px] font-bold tabular-nums ${front ? 'text-rio-400' : 'text-fog-500'}`}>{roundPool ? '' : position}</span>
			{entry.asset ? (
				<>
					<AssetSprite asset={entry.asset} size={30} dim={!entry.valid} />
					{!entry.valid && <span className="text-[10px] text-star-400">!</span>}
				</>
			) : interactive ? (
				<span className={`flex-1 text-center font-display text-lg font-bold leading-none ${waitingOnThis || soon ? 'text-rio-300' : 'text-fog-500'}`}>+</span>
			) : (
				<span className="text-[9px] uppercase tracking-wider text-fog-500">none</span>
			)}
		</>
	);
	if (!interactive || !act) {
		return (
			<div className={`flex h-[52px] w-[4.25rem] items-center gap-1 rounded border px-1 ${tone}`} title={title}>
				{body}
			</div>
		);
	}
	return (
		<div ref={wrap} className="relative">
			<button ref={button} type="button" className={`flex h-[52px] w-[4.25rem] items-center gap-1 rounded border px-1 text-left hover:border-rio-400 ${tone}`} title={title} onClick={toggle} aria-expanded={open}>
				{body}
			</button>
			{open && anchor && (
				<div className="fixed z-40 w-60 rounded-lg border border-night-600 bg-night-900 p-2 shadow-xl" style={{ top: anchor.top, right: anchor.right }}>
					<div className="mb-1.5 flex items-center justify-between">
						<span className="font-display text-[10px] font-bold uppercase tracking-widest text-fog-300">Your nomination</span>
						{entry.asset && (
							<button
								type="button"
								className="text-[11px] text-fog-500 hover:text-rio-300"
								onClick={() => {
									void act({ type: 'clear_nomination' });
									setOpen(false);
								}}
							>
								Clear
							</button>
						)}
					</div>
					<AssetCombobox
						snapshot={snapshot}
						kind={roundKind}
						autoFocus
						placeholder={entry.asset ? `Replace ${entry.asset.name}…` : 'Type a name…'}
						onPick={(asset) => {
							void act({ type: 'queue_nomination', payload: { asset_id: asset.id } });
							setOpen(false);
						}}
					/>
					<p className="mt-1.5 text-[10px] text-fog-500">Or click a sprite in the pool. {draft.format === 'auction' ? 'You name the opening bid when it comes up.' : ''}</p>
				</div>
			)}
		</div>
	);
}

/** Which teams are "hot": high bidder, on the clock, or holding things up. */
export function activeTeamIds(snapshot: DraftSnapshot): Set<number> {
	const { current, draft } = snapshot;
	const ids = new Set<number>();
	if (draft.state !== 'live') return ids;
	switch (current.kind) {
		case 'auction':
			if (current.high_bid) ids.add(current.high_bid.team_id);
			if (current.waiting_on_team_id !== null) ids.add(current.waiting_on_team_id);
			if (current.awaiting_opening && current.nomination) ids.add(current.nomination.nominated_by_team_id);
			break;
		case 'vickrey':
			if (current.waiting_on_team_id !== null) ids.add(current.waiting_on_team_id);
			break;
		case 'snake':
			if (current.on_the_clock) ids.add(current.on_the_clock.team_id);
			break;
		case 'round_pool':
			for (const id of current.waiting_on_team_ids) ids.add(id);
			break;
	}
	return ids;
}

function pendingFor(snapshot: DraftSnapshot): Pending | null {
	const { current, draft, you } = snapshot;
	if (draft.state !== 'live') return null;
	if (current.kind === 'auction' && current.nomination && current.high_bid) {
		return { team_id: current.high_bid.team_id, asset: current.nomination.asset, price: current.high_bid.amount, yours: current.high_bid.team_id === you.team_id };
	}
	if (current.kind === 'snake' && current.on_the_clock) {
		return { team_id: current.on_the_clock.team_id, asset: null, price: null, yours: current.on_the_clock.team_id === you.team_id };
	}
	return null;
}

export default function DraftBoard({
	snapshot,
	previous,
	act,
	readOnly = false
}: {
	snapshot: DraftSnapshot;
	previous: DraftSnapshot | null;
	act?: (action: DraftAction) => Promise<unknown>;
	readOnly?: boolean;
}) {
	const { draft, teams, you, queue } = snapshot;
	const money = draft.format !== 'snake';
	const slots = draft.config.slots;
	const hidden = draft.format === 'fixed_price' && draft.state !== 'completed';
	const queueFormat = draft.format === 'auction' || draft.format === 'vickrey' || draft.format === 'round_pool';
	const showQueue = queueFormat && draft.state !== 'completed';
	const showMax = money && draft.format !== 'fixed_price' && draft.state !== 'completed';
	const active = activeTeamIds(snapshot);
	const pending = pendingFor(snapshot);
	const positions = useMemo(() => new Map(queue.map((entry, index) => [entry.team_id, index + 1])), [queue]);
	const canQueue = !readOnly && !!act && you.team_id !== null && (draft.state === 'live' || draft.state === 'lobby');

	const [freshIds, setFreshIds] = useState<Set<number>>(new Set());
	useEffect(() => {
		if (!previous) return;
		const before = new Set(previous.teams.flatMap((team) => team.picks.map((pick) => pick.id)));
		const fresh = teams.flatMap((team) => team.picks.filter((pick) => !before.has(pick.id)).map((pick) => pick.id));
		if (fresh.length === 0) return;
		setFreshIds(new Set(fresh));
		const timer = setTimeout(() => setFreshIds(new Set()), 2500);
		return () => clearTimeout(timer);
	}, [teams, previous]);

	const canNickname = (teamId: number) => !readOnly && !!act && (teamId === you.team_id || you.role === 'commissioner') && draft.state !== 'setup';
	const onNickname = (pick: SnapshotPick, nickname: string | null) => act?.({ type: 'set_nickname', payload: { pick_id: pick.id, nickname } });
	const head = 'px-1 pb-1 text-center font-display text-[10px] font-semibold uppercase tracking-widest text-fog-500';

	if (draft.format === 'snake') {
		// Rounds down, teams across — the classic fantasy board.
		const order = [...teams].sort((a, b) => a.draft_order - b.draft_order);
		const rounds = Array.from({ length: slots.character + slots.stadium }, (_, index) => index + 1);
		const clock = snapshot.current.kind === 'snake' ? snapshot.current.on_the_clock : null;
		return (
			<div className="overflow-x-auto">
				<table className="border-separate border-spacing-x-1 border-spacing-y-0.5">
					<thead>
						<tr>
							<th className={`${head} text-left`}>Rd</th>
							{order.map((team) => (
								<th key={team.id} className="px-1 pb-1 text-center">
									<div className="flex flex-col items-center gap-0.5" title={team.managers.map((manager) => manager.username).join(' & ')}>
										<span className="flex items-center gap-1">
											<PresenceDot present={team.present} />
											<TeamLogo logo={team.logo} name={team.name} size={22} />
										</span>
										<span className={`max-w-[5.5rem] truncate font-display text-[10px] font-bold uppercase tracking-wider ${team.id === you.team_id ? 'text-rio-300' : 'text-fog-300'} ${active.has(team.id) ? 'underline decoration-rio-500 underline-offset-2' : ''}`}>
											{team.name}
										</span>
									</div>
								</th>
							))}
						</tr>
					</thead>
					<tbody>
						{rounds.map((round) => {
							const sequence = round % 2 === 1 ? order : [...order].reverse();
							return (
								<tr key={round}>
									<td className="pr-1 font-display text-xs font-bold tabular-nums text-fog-500">{round}</td>
									{order.map((team) => {
										const pick = team.picks.find((candidate) => candidate.round === round) ?? null;
										const position = sequence.indexOf(team) + 1;
										const onClock = !pick && clock?.team_id === team.id && clock.round === round && pending;
										return (
											<td key={team.id} className="relative">
												<span className="pointer-events-none absolute left-1 top-0.5 z-10 font-display text-[8px] tabular-nums text-fog-500">
													{round}.{position}
												</span>
												{onClock ? <GhostCell pending={pending} money={false} /> : <Cell pick={pick} snapshot={snapshot} fresh={pick ? freshIds.has(pick.id) : false} editable={!!pick && canNickname(team.id)} onNickname={onNickname} money={false} />}
											</td>
										);
									})}
								</tr>
							);
						})}
					</tbody>
				</table>
			</div>
		);
	}

	const columns = [
		...Array.from({ length: slots.character }, (_, index) => ({ key: `c${index}`, label: String(index + 1), kind: 'character' as const, index })),
		...Array.from({ length: slots.stadium }, (_, index) => ({ key: `s${index}`, label: slots.stadium === 1 ? 'Stad' : `St${index + 1}`, kind: 'stadium' as const, index }))
	];

	return (
		<div className="overflow-x-auto">
			<table className="w-full border-separate border-spacing-x-1 border-spacing-y-0.5">
				<thead>
					<tr>
						<th className={`${head} text-left`}>Team</th>
						{columns.map((column) => (
							<th key={column.key} className={head}>
								{column.label}
							</th>
						))}
						{money && <th className={`${head} text-right`}>Left</th>}
						{showMax && <th className={`${head} text-right`}>Max</th>}
						{showQueue && <th className={`${head} text-left`}>Queue</th>}
					</tr>
				</thead>
				<tbody>
					{teams.map((team) => {
						const characters = team.picks.filter((pick) => pick.asset.kind === 'character');
						const stadiums = team.picks.filter((pick) => pick.asset.kind === 'stadium');
						const teamHidden = hidden && team.id !== you.team_id;
						const full = team.open_slots_total === 0;
						const leader = pending?.team_id === team.id && pending.asset ? pending : null;
						const ghostIndex = leader ? (leader.asset!.kind === 'character' ? characters.length : stadiums.length) : -1;
						const yours = team.id === you.team_id;
						const rowTone = leader ? (yours ? 'bg-rio-500/[0.14]' : 'bg-star-500/[0.07]') : yours ? 'bg-rio-500/[0.06]' : '';
						return (
							<tr key={team.id} className={`${rowTone} ${full && draft.state === 'live' ? 'opacity-70' : ''}`}>
								<td className="pr-1">
									<TeamHead snapshot={snapshot} teamId={team.id} activeIds={active} />
								</td>
								{columns.map((column) => {
									const list = column.kind === 'character' ? characters : stadiums;
									const pick = teamHidden ? null : (list[column.index] ?? null);
									const ghost = leader && column.kind === leader.asset!.kind && column.index === ghostIndex;
									return (
										<td key={column.key}>
											{teamHidden ? (
												<div className={`${CELL} flex items-center justify-center rounded border border-night-800 text-[9px] uppercase tracking-widest text-fog-500`}>{team.submitted ? 'sealed' : ''}</div>
											) : ghost ? (
												<GhostCell pending={leader} money={money} />
											) : (
												<Cell pick={pick} snapshot={snapshot} fresh={pick ? freshIds.has(pick.id) : false} editable={!!pick && canNickname(team.id)} onNickname={onNickname} money={money} />
											)}
										</td>
									);
								})}
								{money && (
									<td className="text-right font-display text-sm font-bold tabular-nums text-fog-100">
										{teamHidden ? '—' : <Money amount={draft.state === 'completed' ? team.spent : team.remaining} />}
									</td>
								)}
								{showMax && <td className="text-right font-display text-xs font-bold tabular-nums text-fog-400">{full ? '—' : <Money amount={team.max_bid} />}</td>}
								{showQueue && (
									<td className="pl-1">
										{!full && positions.has(team.id) && <QueueCell snapshot={snapshot} teamId={team.id} position={positions.get(team.id)!} act={act} interactive={canQueue && yours} />}
									</td>
								)}
							</tr>
						);
					})}
				</tbody>
			</table>
		</div>
	);
}
