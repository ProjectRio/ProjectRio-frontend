'use client';

/* eslint-disable @next/next/no-img-element */

// The lineup planner, built like the Muddyball draft board: a Lineup tab
// (draggable batting order) and a Field tab (the diamond, with characters
// placed on positions — tap to select and swap, drag to move, ✕ to remove).
// The bench holds what you have drafted and what you are targeting; targets
// sit on the field as ghosts, and anything another team took turns red.
// Private to this browser.

import { useMemo, useState, type DragEvent } from 'react';
import { assetById, assetImage, CLASS_HUES } from '@/lib/draft/assets';
import { clearRosterSlot, FIELD_POSITIONS, placeInRoster, releaseFromLineup, setPlan, swapBattingOrder, swapRosterSlots, toggleTarget, usePlan } from '@/lib/draft/plan';
import type { Asset, DraftSnapshot } from '@/lib/draft/types';
import Drawer from './Drawer';
import StadiumField from './StadiumField';
import { AssetSprite, ClassDot, findTeam, Money } from './primitives';

type Source = 'drafted' | 'target' | 'lost';

interface Candidate {
	asset: Asset;
	source: Source;
	price: number | null;
}

/** Everything the plan can draw on: your picks, then targets you have not won. */
function candidatesFor(snapshot: DraftSnapshot, targets: number[]): Candidate[] {
	const team = findTeam(snapshot, snapshot.you.team_id);
	const picks = team?.picks ?? [];
	const drafted = new Set(picks.map((pick) => pick.asset.id));
	const list: Candidate[] = picks.map((pick) => ({ asset: pick.asset, source: 'drafted', price: pick.price }));
	for (const id of targets) {
		if (drafted.has(id)) continue;
		const entry = snapshot.pool.find((candidate) => candidate.asset.id === id);
		const gone = entry ? entry.remaining_copies !== null && entry.remaining_copies <= 0 : true;
		list.push({ asset: assetById(id), source: gone ? 'lost' : 'target', price: null });
	}
	return list;
}

const DRAG_TYPE = 'text/x-rio-asset';

function SourceBadge({ source }: { source: Source }) {
	if (source === 'drafted') return null;
	return <span className={`rounded-sm px-1 font-display text-[8px] font-bold uppercase tracking-widest ${source === 'target' ? 'bg-star-500/20 text-star-400' : 'bg-rio-500/20 text-rio-300'}`}>{source === 'target' ? 'target' : 'gone'}</span>;
}

export default function LineupDrawer({ snapshot, open, onClose }: { snapshot: DraftSnapshot; open: boolean; onClose: () => void }) {
	const leagueId = snapshot.draft.league_id;
	const plan = usePlan(leagueId);
	const [view, setView] = useState<'lineup' | 'field'>('field');
	const [selected, setSelected] = useState<number | null>(null);
	const [dragOver, setDragOver] = useState<number | null>(null);
	const [orderDragFrom, setOrderDragFrom] = useState<number | null>(null);
	const [orderDragOver, setOrderDragOver] = useState<number | null>(null);

	const candidates = useMemo(() => candidatesFor(snapshot, plan.targets), [snapshot, plan.targets]);
	const byId = useMemo(() => new Map(candidates.map((candidate) => [candidate.asset.id, candidate])), [candidates]);
	const you = findTeam(snapshot, snapshot.you.team_id);

	// Roster entries that are no longer in the candidate set (un-starred elsewhere) read as empty.
	const roster = plan.roster.map((id) => (id !== null && byId.has(id) ? byId.get(id)! : null));
	const onField = new Set(roster.filter((entry): entry is Candidate => entry !== null).map((entry) => entry.asset.id));
	const bench = candidates.filter((candidate) => candidate.asset.kind === 'character' && !onField.has(candidate.asset.id));
	const stadiums = candidates.filter((candidate) => candidate.asset.kind === 'stadium');
	const stadium = plan.stadium_id !== null ? byId.get(plan.stadium_id) : undefined;
	const filled = roster.filter((entry) => entry && entry.source !== 'lost').length;
	const drafted = roster.filter((entry) => entry?.source === 'drafted').length;
	const lost = roster.filter((entry) => entry?.source === 'lost').length;
	const rosterFull = roster.every((entry) => entry !== null);

	function tapSlot(slot: number) {
		if (selected === null) {
			if (roster[slot]) setSelected(slot);
		} else if (selected === slot) {
			setSelected(null);
		} else {
			swapRosterSlots(leagueId, selected, slot);
			setSelected(null);
		}
	}

	function dropOnSlot(slot: number, event: DragEvent) {
		event.preventDefault();
		const raw = event.dataTransfer.getData(DRAG_TYPE);
		if (raw) {
			const [kind, value] = raw.split(':');
			if (kind === 'slot' && Number(value) !== slot) swapRosterSlots(leagueId, Number(value), slot);
			if (kind === 'asset') placeInRoster(leagueId, Number(value), slot);
		}
		setDragOver(null);
		setSelected(null);
	}

	function startDrag(event: DragEvent, payload: string) {
		event.dataTransfer.setData(DRAG_TYPE, payload);
		event.dataTransfer.effectAllowed = 'move';
	}

	const allowDrop = (event: DragEvent) => {
		event.preventDefault();
		event.dataTransfer.dropEffect = 'move';
	};

	const benchChip = (candidate: Candidate) => (
		<button
			key={candidate.asset.id}
			type="button"
			draggable={candidate.source !== 'lost'}
			onDragStart={(event) => startDrag(event, `asset:${candidate.asset.id}`)}
			onClick={() => {
				if (candidate.source === 'lost') return;
				if (selected !== null) {
					placeInRoster(leagueId, candidate.asset.id, selected);
					setSelected(null);
				} else placeInRoster(leagueId, candidate.asset.id);
			}}
			disabled={candidate.source !== 'lost' && rosterFull && selected === null}
			title={candidate.source === 'lost' ? `${candidate.asset.name} — taken by another team` : selected !== null ? `Put ${candidate.asset.name} at ${FIELD_POSITIONS[selected].label}` : rosterFull ? 'Field is full — select a slot first' : `Add ${candidate.asset.name} · drag onto a position`}
			className={`flex items-center gap-1 rounded border px-1 py-0.5 text-[11px] transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
				candidate.source === 'drafted' ? 'border-night-600 bg-night-850 hover:border-rio-400' : candidate.source === 'target' ? 'border-dashed border-star-500/50 hover:border-star-400' : 'cursor-not-allowed border-rio-700/40 opacity-60'
			}`}
		>
			<AssetSprite asset={candidate.asset} size={24} dim={candidate.source === 'lost'} className={candidate.source === 'target' ? 'opacity-70' : ''} />
			<span className={candidate.source === 'lost' ? 'text-fog-500 line-through' : 'text-fog-100'}>{candidate.asset.name}</span>
			{candidate.price !== null && <Money amount={candidate.price} className="font-display text-[10px] font-bold text-rio-300" />}
			<SourceBadge source={candidate.source} />
			{candidate.source === 'lost' && (
				<span
					role="button"
					className="ml-0.5 text-fog-500 hover:text-rio-300"
					title="Drop this target"
					onClick={(event) => {
						event.stopPropagation();
						releaseFromLineup(leagueId, candidate.asset.id);
						toggleTarget(leagueId, candidate.asset.id);
					}}
				>
					✕
				</span>
			)}
		</button>
	);

	return (
		<Drawer open={open} onClose={onClose} title="Lineup" kicker={you ? `${you.name} · private to you` : 'Private to you'} width="w-[min(100vw,26rem)]">
			<div className="space-y-3 p-3">
				<div className="flex flex-wrap items-center gap-x-3 gap-y-1 font-display text-[10px] font-semibold uppercase tracking-widest text-fog-500">
					<span>
						<span className="text-fog-100">{drafted}</span>/9 drafted
					</span>
					{filled - drafted > 0 && <span className="text-star-400">{filled - drafted} target{filled - drafted === 1 ? '' : 's'} pencilled in</span>}
					{lost > 0 && <span className="text-rio-300">{lost} gone — re-plan</span>}
					{filled === 9 && lost === 0 && <span className="text-emerald-300">field covered</span>}
				</div>

				<div className="flex overflow-hidden rounded-lg border border-night-600 text-sm">
					{(['field', 'lineup'] as const).map((option) => (
						<button key={option} type="button" className={`flex-1 py-1 font-display text-xs font-semibold uppercase tracking-wider transition-colors ${view === option ? 'bg-rio-500 text-white' : 'hover:bg-night-700'}`} onClick={() => setView(option)}>
							{option}
						</button>
					))}
				</div>

				{view === 'field' ? (
					<>
						<StadiumField stadiumId={stadium?.asset.stadium_id ?? 0}>
						{(place) => FIELD_POSITIONS.map((position, slot) => {
							const entry = roster[slot];
							const isSelected = selected === slot;
							const isSwapTarget = selected !== null && selected !== slot;
							const isDragTarget = dragOver === slot;
							const battingNumber = plan.order.indexOf(slot) + 1;
							const hue = entry ? (entry.asset.kind === 'stadium' ? '#f59e0b' : CLASS_HUES[entry.asset.class ?? '']) : undefined;
							const spot = place(position.x, position.z);
							return (
								<div
									key={position.label}
									className="absolute z-10"
									style={{ left: `${spot.x}%`, top: `${spot.y}%`, transform: `translate(-50%, -50%) scale(${spot.scale})` }}
									draggable={!!entry}
									role="button"
									tabIndex={0}
									aria-label={`${position.label}: ${entry?.asset.name ?? 'empty'}`}
									onDragStart={(event) => {
										if (!entry) {
											event.preventDefault();
											return;
										}
										setSelected(null);
										startDrag(event, `slot:${slot}`);
									}}
									onDragOver={(event) => {
										allowDrop(event);
										setDragOver(slot);
									}}
									onDragLeave={() => {
										if (dragOver === slot) setDragOver(null);
									}}
									onDrop={(event) => dropOnSlot(slot, event)}
									onDragEnd={() => setDragOver(null)}
									onKeyDown={(event) => {
										if ((event.key === 'Delete' || event.key === 'Backspace') && entry) clearRosterSlot(leagueId, slot);
										if (event.key === 'Enter' || event.key === ' ') {
											event.preventDefault();
											tapSlot(slot);
										}
									}}
								>
									{entry ? (
										<div className={`group flex flex-col items-center gap-0.5 transition-transform ${isDragTarget || isSelected ? 'scale-110' : 'hover:scale-105'}`}>
											<div className="relative">
												{/* grounding shadow */}
												<span className="pointer-events-none absolute left-1/2 top-[88%] h-2 w-9 -translate-x-1/2 rounded-full bg-black/50 blur-[2px]" />
												<button
													type="button"
													onClick={() => tapSlot(slot)}
													title={`${entry.asset.name} · ${position.name}${entry.source === 'target' ? ' · target' : entry.source === 'lost' ? ' · taken by another team' : ''} — ${isSelected ? 'tap another slot to swap' : 'tap to select · drag to move'}`}
													className={`relative flex h-11 w-11 items-center justify-center rounded-full border-2 bg-night-950/85 shadow-[0_6px_14px_rgb(0_0_0_/_0.55)] backdrop-blur transition-shadow ${
														entry.source === 'target' ? 'border-dashed' : ''
													} ${isSelected ? 'ring-2 ring-white shadow-[0_0_18px_rgb(255_255_255_/_0.45)]' : isDragTarget ? 'ring-2 ring-white' : ''}`}
													style={{ borderColor: entry.source === 'lost' ? 'var(--color-rio-500)' : entry.source === 'target' ? 'var(--color-star-400)' : hue }}
												>
													<img src={assetImage(entry.asset) ?? ''} alt={entry.asset.name} draggable={false} className={`h-8 w-8 object-contain [image-rendering:pixelated] ${entry.source === 'target' ? 'opacity-65' : entry.source === 'lost' ? 'opacity-40 grayscale' : ''}`} />
												</button>
												<span className="absolute -left-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-rio-500 px-1 font-display text-[9px] font-bold tabular-nums leading-none text-white ring-2 ring-night-950" title={`Bats ${battingNumber}`}>
													{battingNumber}
												</span>
												{isSelected && (
													<button
														type="button"
														className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-night-950 text-[9px] leading-none text-rio-300 ring-2 ring-rio-500 hover:bg-rio-500 hover:text-white"
														onClick={(event) => {
															event.stopPropagation();
															clearRosterSlot(leagueId, slot);
															setSelected(null);
														}}
														title={`Remove ${entry.asset.name}`}
													>
														✕
													</button>
												)}
											</div>
											<span className={`rounded-sm px-1 font-display text-[8px] font-bold uppercase tracking-widest backdrop-blur ${entry.source === 'lost' ? 'bg-rio-600/85 text-white' : entry.source === 'target' ? 'bg-star-500/85 text-night-950' : 'bg-night-950/75 text-fog-200'}`}>{position.label}</span>
										</div>
									) : (
										<button type="button" className={`flex flex-col items-center gap-0.5 transition-all ${isDragTarget || isSwapTarget ? 'scale-110 opacity-100' : 'opacity-75 hover:opacity-100'}`} onClick={() => tapSlot(slot)} title={selected !== null ? `Move here (${position.name})` : `${position.name} — drag a character here`}>
											<div className={`flex h-11 w-11 items-center justify-center rounded-full border-2 border-dashed transition-all ${isDragTarget || isSwapTarget ? 'border-white bg-white/25' : 'border-white/45 bg-black/25'}`}>
												<span className="font-display text-sm font-bold text-white/80">{isDragTarget || isSwapTarget ? '↓' : '+'}</span>
											</div>
											<span className="rounded-sm bg-night-950/60 px-1 font-display text-[8px] font-bold uppercase tracking-widest text-white/80">{position.label}</span>
										</button>
									)}
								</div>
							);
						})}
					</StadiumField>
						<p className="text-center text-[11px] text-fog-500">Tap to select &amp; swap · drag to rearrange · ✕ to remove · numbers are the batting order</p>
					</>
				) : (
					<div className="space-y-1">
						{plan.order.map((slot, place) => {
							const entry = roster[slot];
							const position = FIELD_POSITIONS[slot];
							const isSource = orderDragFrom === place;
							const isTarget = orderDragOver === place && orderDragFrom !== null && orderDragFrom !== place;
							return (
								<div
									key={place}
									draggable
									role="listitem"
									className={`flex cursor-grab select-none items-center gap-2 rounded-lg p-1.5 transition-all active:cursor-grabbing ${entry ? 'bg-night-800' : 'border border-dashed border-night-600 opacity-50'} ${isSource ? 'scale-95 opacity-40' : ''} ${isTarget ? 'scale-[1.02] ring-2 ring-rio-500' : ''}`}
									onDragStart={(event) => {
										setOrderDragFrom(place);
										event.dataTransfer.effectAllowed = 'move';
									}}
									onDragOver={(event) => {
										allowDrop(event);
										setOrderDragOver(place);
									}}
									onDragLeave={() => {
										if (orderDragOver === place) setOrderDragOver(null);
									}}
									onDrop={(event) => {
										event.preventDefault();
										if (orderDragFrom !== null && orderDragFrom !== place) swapBattingOrder(leagueId, orderDragFrom, place);
										setOrderDragFrom(null);
										setOrderDragOver(null);
									}}
									onDragEnd={() => {
										setOrderDragFrom(null);
										setOrderDragOver(null);
									}}
								>
									<span className="shrink-0 text-sm leading-none text-fog-500">⠿</span>
									<span className="w-4 shrink-0 text-xs tabular-nums text-fog-500">{place + 1}</span>
									<span className="w-6 shrink-0 font-display text-[10px] font-bold uppercase text-fog-400">{position.label}</span>
									{entry ? (
										<>
											<AssetSprite asset={entry.asset} size={26} dim={entry.source === 'lost'} className={entry.source === 'target' ? 'opacity-70' : ''} />
											<span className={`flex-1 truncate text-xs ${entry.source === 'lost' ? 'text-fog-500 line-through' : 'text-fog-100'}`}>{entry.asset.name}</span>
											<ClassDot asset={entry.asset} />
											{entry.price !== null && <Money amount={entry.price} className="font-display text-xs font-bold text-rio-300" />}
											<SourceBadge source={entry.source} />
											<button type="button" className="h-5 w-5 rounded text-xs leading-none text-rio-400 hover:bg-rio-500/20" onClick={() => clearRosterSlot(leagueId, slot)} aria-label={`Remove ${entry.asset.name}`}>
												✕
											</button>
										</>
									) : (
										<>
											<div className="h-7 w-6 rounded bg-night-700" />
											<span className="text-xs text-fog-500">empty</span>
										</>
									)}
								</div>
							);
						})}
						<p className="text-center text-[11px] text-fog-500">Drag rows to set the batting order · positions come from the field</p>
					</div>
				)}

				<div className="flex items-center justify-between gap-2 rounded-lg border border-night-600 p-2">
					<div>
						<div className="text-sm font-medium">Stadium</div>
						<div className="text-[11px] text-fog-500">{stadium ? stadium.asset.name : 'none planned yet'}</div>
					</div>
					{stadium ? (
						<span className="flex items-center gap-1.5">
							<AssetSprite asset={stadium.asset} size={22} dim={stadium.source === 'lost'} />
							<SourceBadge source={stadium.source} />
							<button type="button" className="text-xs text-rio-400 hover:text-rio-300" onClick={() => setPlan(leagueId, { stadium_id: null })} aria-label="Clear stadium">
								✕
							</button>
						</span>
					) : (
						<select className="rounded border border-night-600 bg-night-900 px-1 py-0.5 text-[11px] text-fog-300" value="" onChange={(event) => event.target.value && setPlan(leagueId, { stadium_id: Number(event.target.value) })} aria-label="Stadium">
							<option value="">Choose…</option>
							{stadiums.map((candidate) => (
								<option key={candidate.asset.id} value={candidate.asset.id}>
									{candidate.asset.name}
									{candidate.source === 'target' ? ' (target)' : ''}
								</option>
							))}
						</select>
					)}
				</div>

				<div>
					<div className="mb-1 font-display text-[10px] font-semibold uppercase tracking-widest text-fog-500">Bench · drafted and targets · click or drag onto the field</div>
					{bench.length === 0 ? <p className="text-[11px] text-fog-500">Everyone is on the field. Star more targets in the pool or the pricing sheet.</p> : <div className="flex flex-wrap gap-1">{bench.map(benchChip)}</div>}
				</div>
			</div>
		</Drawer>
	);
}
