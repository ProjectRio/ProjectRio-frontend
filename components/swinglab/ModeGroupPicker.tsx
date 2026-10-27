'use client';

// Mode selection for the swing lab. Three ways in: a predefined ruleset group
// ("Superstars Off"), a group the user saved earlier, or individual modes.
// Whichever route, the result is the same flat list of mode names — groups are
// a way to fill that list quickly, not a separate kind of selection.

import { useEffect, useMemo, useRef, useState } from 'react';
import type { TagSet } from '@/lib/api';
import { isCompetitive, predefinedGroups, useCustomGroups } from '@/lib/modeGroups';
import { FieldLabel } from '@/components/analytics/pickers';

// Past roughly this many modes the pull runs into minutes and the biggest
// seasons start hitting the API's request ceiling, so say so up front.
const LARGE_SELECTION = 6;

export default function ModeGroupPicker({
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
	const [groupName, setGroupName] = useState('');
	const [showAll, setShowAll] = useState(false);
	const ref = useRef<HTMLDivElement>(null);
	const { groups: custom, save, remove } = useCustomGroups();

	useEffect(() => {
		if (!open) return;
		function onDown(event: MouseEvent) {
			if (ref.current && !ref.current.contains(event.target as Node)) setOpen(false);
		}
		window.addEventListener('mousedown', onDown);
		return () => window.removeEventListener('mousedown', onDown);
	}, [open]);

	const predefined = useMemo(() => predefinedGroups(tagsets), [tagsets]);
	const selected = useMemo(() => new Set(value.map((m) => m.toLowerCase())), [value]);

	const options = useMemo(
		() =>
			tagsets
				.filter((t) => showAll || isCompetitive(t))
				.filter((t) => t.name.toLowerCase().includes(query.toLowerCase()))
				.sort((a, b) => (b.start_date ?? 0) - (a.start_date ?? 0)),
		[tagsets, query, showAll]
	);

	// A group button is "on" when every one of its modes is already selected,
	// so clicking it a second time takes them back out.
	function toggleGroup(modes: string[]) {
		const all = modes.every((m) => selected.has(m.toLowerCase()));
		if (all) {
			const drop = new Set(modes.map((m) => m.toLowerCase()));
			onChange(value.filter((m) => !drop.has(m.toLowerCase())));
		} else {
			const merged = [...value];
			for (const mode of modes) {
				if (!selected.has(mode.toLowerCase())) merged.push(mode);
			}
			onChange(merged);
		}
	}

	function toggleMode(name: string) {
		if (selected.has(name.toLowerCase())) {
			onChange(value.filter((m) => m.toLowerCase() !== name.toLowerCase()));
		} else {
			onChange([...value, name]);
		}
	}

	return (
		<div className="space-y-3">
			<div>
				<FieldLabel hint="each mode is fetched once, then cached">Game modes</FieldLabel>
				<div className="flex flex-wrap gap-1.5">
					{predefined.map((group) => {
						const active =
							group.modes.length > 0 &&
							group.modes.every((m) => selected.has(m.toLowerCase()));
						return (
							<button
								key={group.id}
								type="button"
								title={group.hint}
								onClick={() => toggleGroup(group.modes)}
								className={`rounded border px-2 py-1 text-xs font-semibold transition-colors ${
									active
										? 'border-rio-500/60 bg-rio-500/20 text-rio-300'
										: 'border-night-600 bg-night-850 text-fog-500 hover:text-fog-300'
								}`}
							>
								{group.label}
								<span className="ml-1.5 text-[10px] font-normal opacity-70">
									{group.modes.length}
								</span>
							</button>
						);
					})}
				</div>
			</div>

			{custom.length > 0 && (
				<div>
					<FieldLabel>Saved groups</FieldLabel>
					<div className="flex flex-wrap gap-1.5">
						{custom.map((group) => {
							const active =
								group.modes.length > 0 &&
								group.modes.every((m) => selected.has(m.toLowerCase()));
							return (
								<span
									key={group.id}
									className={`inline-flex items-center rounded border text-xs transition-colors ${
										active
											? 'border-star-500/60 bg-star-500/15 text-star-400'
											: 'border-night-600 bg-night-850 text-fog-500'
									}`}
								>
									<button
										type="button"
										className="py-1 pl-2 font-semibold hover:text-fog-100"
										onClick={() => toggleGroup(group.modes)}
									>
										{group.label}
										<span className="ml-1.5 text-[10px] font-normal opacity-70">
											{group.modes.length}
										</span>
									</button>
									<button
										type="button"
										aria-label={`Delete ${group.label}`}
										className="px-1.5 py-1 text-fog-500 hover:text-fog-100"
										onClick={() => remove(group.id)}
									>
										×
									</button>
								</span>
							);
						})}
					</div>
				</div>
			)}

			<div className="relative" ref={ref}>
				<div className="flex flex-wrap items-center gap-1.5">
					{value.length > 0 && (
						<span className="text-xs text-fog-300">
							{value.length} mode{value.length === 1 ? '' : 's'} selected
						</span>
					)}
					<button
						type="button"
						className="rounded border border-dashed border-night-600 px-2 py-0.5 text-xs text-fog-500 transition-colors hover:border-rio-400 hover:text-fog-100"
						onClick={() => setOpen(!open)}
					>
						{value.length > 0 ? 'Edit list' : '+ Add modes'}
					</button>
					{value.length > 0 && (
						<button
							type="button"
							className="text-xs text-fog-500 transition-colors hover:text-fog-300"
							onClick={() => onChange([])}
						>
							Clear
						</button>
					)}
				</div>

				{value.length > LARGE_SELECTION && (
					<p className="mt-1.5 text-[10px] leading-relaxed text-star-400/80">
						{value.length} modes is a big pull — expect a few minutes, and the largest
						seasons can time out server-side. Anything that fails is reported and the rest
						still loads.
					</p>
				)}

				{open && (
					<div className="absolute left-0 top-full z-30 mt-2 w-80 rounded-lg border border-night-600 bg-night-850 p-2 shadow-xl">
						<input
							autoFocus
							className="input mb-2 !py-1.5 text-sm"
							placeholder="Search modes…"
							value={query}
							onChange={(event) => setQuery(event.target.value)}
						/>
						<label className="mb-2 flex items-center gap-2 px-1 text-[11px] text-fog-500">
							<input
								type="checkbox"
								checked={showAll}
								onChange={(event) => setShowAll(event.target.checked)}
								className="accent-rio-500"
							/>
							Include practice, training and test modes
						</label>
						<div className="max-h-56 overflow-y-auto">
							{options.map((tagset) => {
								const active = selected.has(tagset.name.toLowerCase());
								return (
									<button
										key={tagset.id}
										type="button"
										className={`block w-full rounded px-2 py-1.5 text-left text-sm transition-colors ${
											active ? 'bg-rio-500/20 text-fog-100' : 'text-fog-300 hover:bg-night-700'
										}`}
										onClick={() => toggleMode(tagset.name)}
									>
										<span className="mr-2 inline-block w-3 text-rio-400">
											{active ? '✓' : ''}
										</span>
										{tagset.name}
									</button>
								);
							})}
							{options.length === 0 && (
								<p className="px-2 py-3 text-center text-xs text-fog-500">No modes match.</p>
							)}
						</div>

						{value.length > 0 && (
							<div className="mt-2 flex gap-1 border-t border-night-700 pt-2">
								<input
									className="input !py-1.5 text-sm"
									placeholder="Save selection as…"
									value={groupName}
									onChange={(event) => setGroupName(event.target.value)}
								/>
								<button
									type="button"
									disabled={groupName.trim() === ''}
									className="shrink-0 rounded border border-night-600 px-2 text-xs text-fog-300 transition-colors hover:border-rio-400 hover:text-fog-100 disabled:opacity-40"
									onClick={() => {
										save(groupName, value);
										setGroupName('');
									}}
								>
									Save
								</button>
							</div>
						)}
					</div>
				)}
			</div>
		</div>
	);
}
