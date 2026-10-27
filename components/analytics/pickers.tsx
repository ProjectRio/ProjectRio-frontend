'use client';

import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import type { TagSet } from '@/lib/api';
import { characters, characterClasses } from '@/lib/data/characters';
import { CharPortrait } from '@/components/player/widgets';

// Filter-control building blocks for the analytics page: a character
// multi-picker (portrait grid popover), a player multi-picker (typeahead), and
// a game-mode multi-picker. All of them render the current selection as
// removable chips so the active filter state is always visible.

function usePopover(open: boolean, close: () => void) {
	const ref = useRef<HTMLDivElement>(null);
	useEffect(() => {
		if (!open) return;
		function onDown(event: MouseEvent) {
			if (ref.current && !ref.current.contains(event.target as Node)) close();
		}
		function onKey(event: KeyboardEvent) {
			if (event.key === 'Escape') close();
		}
		window.addEventListener('mousedown', onDown);
		window.addEventListener('keydown', onKey);
		return () => {
			window.removeEventListener('mousedown', onDown);
			window.removeEventListener('keydown', onKey);
		};
	}, [open, close]);
	return ref;
}

export function FieldLabel({ children, hint }: { children: ReactNode; hint?: string }) {
	return (
		<div className="mb-1.5 flex items-baseline justify-between gap-2">
			<span className="text-[11px] font-semibold uppercase tracking-widest text-fog-500">
				{children}
			</span>
			{hint && <span className="text-[10px] text-fog-500/70">{hint}</span>}
		</div>
	);
}

function Chip({ onRemove, children }: { onRemove: () => void; children: ReactNode }) {
	return (
		<span className="inline-flex items-center gap-1.5 rounded border border-night-600 bg-night-800 py-0.5 pl-1.5 pr-1 text-xs text-fog-100">
			{children}
			<button
				type="button"
				aria-label="Remove"
				className="rounded px-1 text-fog-500 transition-colors hover:bg-night-700 hover:text-fog-100"
				onClick={onRemove}
			>
				×
			</button>
		</span>
	);
}

// ---------- Characters ----------

export function CharMultiPicker({
	label,
	hint,
	value,
	onChange
}: {
	label: string;
	hint?: string;
	value: number[];
	onChange: (charIds: number[]) => void;
}) {
	const [open, setOpen] = useState(false);
	const [query, setQuery] = useState('');
	const ref = usePopover(open, () => setOpen(false));
	const selected = new Set(value);

	const matches = Object.entries(characters).filter(([, name]) =>
		name.toLowerCase().includes(query.toLowerCase())
	);

	return (
		<div>
			<FieldLabel hint={hint}>{label}</FieldLabel>
			<div className="relative" ref={ref}>
				<div className="flex flex-wrap items-center gap-1.5">
					{value.map((charId) => (
						<Chip key={charId} onRemove={() => onChange(value.filter((id) => id !== charId))}>
							<CharPortrait name={characters[String(charId)]} size={18} />
							{characters[String(charId)]}
						</Chip>
					))}
					<button
						type="button"
						className="rounded border border-dashed border-night-600 px-2 py-0.5 text-xs text-fog-500 transition-colors hover:border-rio-400 hover:text-fog-100"
						onClick={() => setOpen(!open)}
					>
						+ Add
					</button>
				</div>
				{open && (
					<div className="absolute left-0 top-full z-30 mt-2 w-72 rounded-lg border border-night-600 bg-night-850 p-2 shadow-xl">
						<input
							autoFocus
							className="input mb-2 !py-1.5 text-sm"
							placeholder="Search characters…"
							value={query}
							onChange={(event) => setQuery(event.target.value)}
						/>
						<div className="grid max-h-64 grid-cols-6 gap-1 overflow-y-auto pr-1">
							{matches.map(([id, name]) => {
								const charId = Number(id);
								const active = selected.has(charId);
								const charClass = characterClasses[name]?.Class;
								return (
									<button
										key={id}
										type="button"
										title={`${name}${charClass ? ` · ${charClass}` : ''}`}
										className={`relative rounded p-1 transition-colors ${
											active ? 'bg-rio-500/25 ring-1 ring-rio-400' : 'hover:bg-night-700'
										}`}
										onClick={() =>
											onChange(
												active ? value.filter((v) => v !== charId) : [...value, charId]
											)
										}
									>
										<CharPortrait name={name} size={32} />
									</button>
								);
							})}
						</div>
					</div>
				)}
			</div>
		</div>
	);
}

// ---------- Players ----------

export function PlayerMultiPicker({
	label,
	hint,
	value,
	onChange,
	allUsers
}: {
	label: string;
	hint?: string;
	value: string[];
	onChange: (players: string[]) => void;
	allUsers: string[];
}) {
	const [query, setQuery] = useState('');
	const [open, setOpen] = useState(false);
	const ref = usePopover(open, () => setOpen(false));
	const lowerSelected = new Set(value.map((name) => name.toLowerCase()));

	const suggestions = useMemo(() => {
		if (query.length < 2) return [];
		const q = query.toLowerCase();
		return allUsers
			.filter((name) => name.toLowerCase().includes(q) && !lowerSelected.has(name.toLowerCase()))
			.slice(0, 8);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [query, allUsers, value]);

	function add(name: string) {
		onChange([...value, name]);
		setQuery('');
		setOpen(false);
	}

	return (
		<div>
			<FieldLabel hint={hint}>{label}</FieldLabel>
			<div className="relative" ref={ref}>
				<div className="flex flex-wrap items-center gap-1.5">
					{value.map((name) => (
						<Chip key={name} onRemove={() => onChange(value.filter((v) => v !== name))}>
							{name}
						</Chip>
					))}
				</div>
				<input
					className="input mt-1.5 !py-1.5 text-sm"
					placeholder="Type a username…"
					value={query}
					onChange={(event) => {
						setQuery(event.target.value);
						setOpen(true);
					}}
					onKeyDown={(event) => {
						if (event.key === 'Enter' && suggestions.length > 0) {
							event.preventDefault();
							add(suggestions[0]);
						}
					}}
				/>
				{open && suggestions.length > 0 && (
					<div className="absolute left-0 top-full z-30 mt-1 w-full overflow-hidden rounded-lg border border-night-600 bg-night-850 shadow-xl">
						{suggestions.map((name) => (
							<button
								key={name}
								type="button"
								className="block w-full px-3 py-1.5 text-left text-sm text-fog-300 transition-colors hover:bg-night-700 hover:text-fog-100"
								onClick={() => add(name)}
							>
								{name}
							</button>
						))}
					</div>
				)}
			</div>
		</div>
	);
}

// ---------- Game modes ----------

export function ModeMultiPicker({
	tagsets,
	value,
	onChange
}: {
	tagsets: TagSet[];
	value: string[];
	onChange: (modes: string[]) => void;
}) {
	const [open, setOpen] = useState(false);
	const [query, setQuery] = useState('');
	const ref = usePopover(open, () => setOpen(false));
	const selected = new Set(value.map((name) => name.toLowerCase()));

	const modes = tagsets
		.filter((tagset) => tagset.type !== 'Test')
		.sort((a, b) => (b.start_date ?? 0) - (a.start_date ?? 0))
		.filter((tagset) => tagset.name.toLowerCase().includes(query.toLowerCase()));

	return (
		<div>
			<FieldLabel hint="each mode is fetched once, then cached">Game modes</FieldLabel>
			<div className="relative" ref={ref}>
				<div className="flex flex-wrap items-center gap-1.5">
					{value.map((name) => (
						<Chip key={name} onRemove={() => onChange(value.filter((v) => v !== name))}>
							{name}
						</Chip>
					))}
					<button
						type="button"
						className="rounded border border-dashed border-night-600 px-2 py-0.5 text-xs text-fog-500 transition-colors hover:border-rio-400 hover:text-fog-100"
						onClick={() => setOpen(!open)}
					>
						+ Add mode
					</button>
				</div>
				{open && (
					<div className="absolute left-0 top-full z-30 mt-2 w-80 rounded-lg border border-night-600 bg-night-850 p-2 shadow-xl">
						<input
							autoFocus
							className="input mb-2 !py-1.5 text-sm"
							placeholder="Search modes…"
							value={query}
							onChange={(event) => setQuery(event.target.value)}
						/>
						<div className="max-h-64 overflow-y-auto">
							{modes.map((tagset) => {
								const active = selected.has(tagset.name.toLowerCase());
								return (
									<button
										key={tagset.id}
										type="button"
										className={`block w-full rounded px-2 py-1.5 text-left text-sm transition-colors ${
											active ? 'bg-rio-500/20 text-fog-100' : 'text-fog-300 hover:bg-night-700'
										}`}
										onClick={() =>
											onChange(
												active
													? value.filter((v) => v.toLowerCase() !== tagset.name.toLowerCase())
													: [...value, tagset.name]
											)
										}
									>
										<span className="mr-2 inline-block w-3 text-rio-400">{active ? '✓' : ''}</span>
										{tagset.name}
										{tagset.community_name && (
											<span className="ml-2 text-xs text-fog-500">{tagset.community_name}</span>
										)}
									</button>
								);
							})}
							{modes.length === 0 && (
								<p className="px-2 py-3 text-center text-xs text-fog-500">No modes match.</p>
							)}
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
