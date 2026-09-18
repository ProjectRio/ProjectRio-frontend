'use client';

// Nominating is one click: a sprite in the pool, or a name typed into this
// small combobox. No opening bid here — the nominator names it when the lot
// comes up. `NominationInline` is the one-line "your nomination" control.

import { useEffect, useMemo, useRef, useState } from 'react';
import type { Asset, AssetKind, DraftAction, DraftSnapshot } from '@/lib/draft/types';
import type { DraftHandle } from '@/lib/draft/useDraft';
import { AssetSprite, Reason, RestrictionMarks } from './primitives';

export function AssetCombobox({
	snapshot,
	kind,
	onPick,
	forTeamId,
	placeholder = 'Search…',
	autoFocus = false,
	className = ''
}: {
	snapshot: DraftSnapshot;
	kind?: AssetKind | null;
	onPick: (asset: Asset) => void | Promise<unknown>;
	/** Judge eligibility for this team (default: you). Other teams get pool-level checks only. */
	forTeamId?: number | null;
	placeholder?: string;
	autoFocus?: boolean;
	className?: string;
}) {
	const [query, setQuery] = useState('');
	const [open, setOpen] = useState(false);
	const [cursor, setCursor] = useState(0);
	const wrap = useRef<HTMLDivElement>(null);
	const own = forTeamId === undefined || forTeamId === snapshot.you.team_id;
	const queuedIds = useMemo(() => new Set(snapshot.queue.filter((entry) => entry.asset).map((entry) => entry.asset!.id)), [snapshot.queue]);
	const options = useMemo(() => {
		const needle = query.trim().toLowerCase();
		return snapshot.pool
			.filter((entry) => entry.remaining_copies === null || entry.remaining_copies > 0)
			.filter((entry) => !kind || entry.asset.kind === kind)
			.filter((entry) => !needle || entry.asset.name.toLowerCase().includes(needle))
			.map((entry) => {
				const reason = own ? snapshot.you.ineligible[entry.asset.id] : undefined;
				const queued = queuedIds.has(entry.asset.id) && (entry.remaining_copies ?? 2) <= 1;
				return { entry, reason: reason ?? (queued ? 'already queued' : null) };
			})
			.slice(0, 8);
	}, [snapshot.pool, snapshot.you.ineligible, kind, query, own, queuedIds]);

	useEffect(() => setCursor(0), [query]);
	useEffect(() => {
		if (!open) return;
		function onDown(event: MouseEvent) {
			if (wrap.current && !wrap.current.contains(event.target as Node)) setOpen(false);
		}
		window.addEventListener('mousedown', onDown);
		return () => window.removeEventListener('mousedown', onDown);
	}, [open]);

	function choose(index: number) {
		const option = options[index];
		if (!option || option.reason) return;
		void onPick(option.entry.asset);
		setQuery('');
		setOpen(false);
	}

	return (
		<div ref={wrap} className={`relative ${className}`}>
			<input
				autoFocus={autoFocus}
				className="input !py-1 !text-xs"
				placeholder={placeholder}
				value={query}
				role="combobox"
				aria-expanded={open}
				aria-autocomplete="list"
				onFocus={() => setOpen(true)}
				onChange={(event) => {
					setQuery(event.target.value);
					setOpen(true);
				}}
				onKeyDown={(event) => {
					if (event.key === 'ArrowDown') {
						event.preventDefault();
						setCursor((value) => Math.min(options.length - 1, value + 1));
					} else if (event.key === 'ArrowUp') {
						event.preventDefault();
						setCursor((value) => Math.max(0, value - 1));
					} else if (event.key === 'Enter') {
						event.preventDefault();
						choose(cursor);
					} else if (event.key === 'Escape') {
						setOpen(false);
						(event.target as HTMLInputElement).blur();
					}
				}}
			/>
			{open && (
				<ul role="listbox" className="absolute left-0 top-full z-30 mt-1 w-56 overflow-hidden rounded border border-night-600 bg-night-900 shadow-xl">
					{options.map(({ entry, reason }, index) => (
						<li key={entry.asset.id} role="option" aria-selected={index === cursor} aria-disabled={!!reason}>
							<button
								type="button"
								disabled={!!reason}
								onMouseEnter={() => setCursor(index)}
								onClick={() => choose(index)}
								className={`flex w-full items-center gap-2 px-2 py-1 text-left text-xs ${reason ? 'cursor-not-allowed text-fog-500' : index === cursor ? 'bg-rio-500/15 text-fog-100' : 'text-fog-100'}`}
							>
								<AssetSprite asset={entry.asset} size={20} dim={!!reason} />
								<span className="flex-1 truncate">{entry.asset.name}</span>
								{entry.asset.captain && <span className="text-star-400">✪</span>}
								<RestrictionMarks icons={entry.restriction_icons} />
								{entry.remaining_copies !== null && entry.remaining_copies > 1 && <span className="text-[10px] text-fog-500">×{entry.remaining_copies}</span>}
								{reason && <span className="max-w-[7rem] truncate text-[10px] uppercase tracking-wider text-fog-500">{reason}</span>}
							</button>
						</li>
					))}
					{options.length === 0 && <li className="px-2 py-2 text-center text-[11px] text-fog-500">No matches.</li>}
				</ul>
			)}
		</div>
	);
}

/**
 * "Your nomination": the queued sprite with a clear button, or a prompt to
 * click the pool / type a name. One line.
 */
export function NominationInline({
	snapshot,
	handle,
	kind,
	label,
	hint = 'click a sprite in the pool or'
}: {
	snapshot: DraftSnapshot;
	handle: DraftHandle;
	kind?: AssetKind | null;
	label: string;
	hint?: string;
}) {
	const entry = snapshot.queue.find((candidate) => candidate.team_id === snapshot.you.team_id);
	const queue = (asset: Asset) => handle.act({ type: 'queue_nomination', payload: { asset_id: asset.id } } satisfies DraftAction);
	const pending = handle.pending.has('queue_nomination') || handle.pending.has('clear_nomination');
	return (
		<div className="flex flex-wrap items-center gap-2 text-xs">
			<span className="font-display text-[10px] font-semibold uppercase tracking-widest text-fog-500">{label}</span>
			{entry?.asset ? (
				<span className={`inline-flex items-center gap-1.5 rounded border px-1.5 py-0.5 ${entry.valid ? 'border-night-600 bg-night-850' : 'border-star-500/60 bg-star-500/10'}`}>
					<AssetSprite asset={entry.asset} size={22} dim={!entry.valid} />
					<span className="font-display text-xs font-bold uppercase tracking-wide text-fog-100">{entry.asset.name}</span>
					{!entry.valid && entry.reason && <span className="text-[10px] text-star-400">{entry.reason}</span>}
					<button type="button" className="ml-1 text-fog-500 hover:text-rio-300" title="Clear" aria-label="Clear nomination" disabled={pending} onClick={() => handle.act({ type: 'clear_nomination' })}>
						×
					</button>
				</span>
			) : (
				<span className="italic text-fog-500">{hint}</span>
			)}
			<AssetCombobox snapshot={snapshot} kind={kind} onPick={queue} placeholder={entry?.asset ? 'Change…' : 'Type a name…'} className="w-36" />
			<Reason error={handle.error} types={['queue_nomination', 'clear_nomination']} className="!text-xs" />
		</div>
	);
}
