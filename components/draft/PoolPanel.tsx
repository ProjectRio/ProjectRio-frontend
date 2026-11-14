'use client';

// The pool, sheet-style: sprites grouped by class, no names (tooltips carry
// them), copies left as a corner count, dimmed-with-reason when ineligible
// for you. `mode` decides what clicking a tile does.

import { useMemo, useState } from 'react';
import { CLASS_HUES } from '@/lib/draft/assets';
import { toggleTarget, usePlan } from '@/lib/draft/plan';
import type { Asset, DraftSnapshot, PoolEntry } from '@/lib/draft/types';
import { AssetSprite } from './primitives';

export type PoolMode = 'browse' | 'queue' | 'pick' | 'add';

const GROUPS: { label: string; hue: string; match: (asset: Asset) => boolean; cols: number }[] = [
	{ label: 'Power', hue: CLASS_HUES.Power, match: (asset) => asset.class === 'Power', cols: 4 },
	{ label: 'Balance', hue: CLASS_HUES.Balance, match: (asset) => asset.class === 'Balance', cols: 5 },
	{ label: 'Technique', hue: CLASS_HUES.Technique, match: (asset) => asset.class === 'Technique', cols: 4 },
	{ label: 'Speed', hue: CLASS_HUES.Speed, match: (asset) => asset.class === 'Speed', cols: 4 },
	{ label: 'Stadiums', hue: '#f59e0b', match: (asset) => asset.kind === 'stadium', cols: 4 }
];

const MODE_VERB: Record<PoolMode, string> = { browse: '', queue: 'Queue', pick: 'Draft', add: 'Add' };

export default function PoolPanel({
	snapshot,
	mode = 'browse',
	onSelect,
	selectedId,
	onlyIds,
	tile = 40
}: {
	snapshot: DraftSnapshot;
	mode?: PoolMode;
	onSelect?: (asset: Asset) => void;
	selectedId?: number | null;
	onlyIds?: number[];
	tile?: number;
}) {
	const [search, setSearch] = useState('');
	const { pool, you, price_history: history, draft } = snapshot;
	const plan = usePlan(draft.league_id);
	const canStar = you.team_id !== null;
	const isFixed = draft.format === 'fixed_price';
	const query = search.trim().toLowerCase();

	const available = useMemo(
		() => pool.filter((entry) => (onlyIds ? onlyIds.includes(entry.asset.id) : true)).filter((entry) => entry.remaining_copies === null || entry.remaining_copies > 0),
		[pool, onlyIds]
	);

	const renderTile = (entry: PoolEntry) => {
		const reason = you.ineligible[entry.asset.id];
		const clickable = mode !== 'browse' && !!onSelect && !reason;
		const selected = selectedId === entry.asset.id;
		const miss = query && !entry.asset.name.toLowerCase().includes(query);
		const avg = history[entry.asset.id]?.avg;
		const starred = plan.targets.includes(entry.asset.id);
		const title = [entry.asset.name, starred ? '★ target' : null, isFixed && entry.price !== undefined ? `$${entry.price}` : avg !== undefined ? `avg $${Math.round(avg)}` : null, entry.remaining_copies !== null ? `${entry.remaining_copies} left` : null, ...entry.restriction_icons.map((icon) => icon.label), reason ? `— ${reason}` : clickable ? `— click to ${MODE_VERB[mode].toLowerCase()}` : null]
			.filter(Boolean)
			.join(' · ');
		return (
			<li key={entry.asset.id} className={`relative ${miss ? 'opacity-20' : ''}`}>
				<button
					type="button"
					disabled={!clickable}
					title={title}
					aria-label={`${MODE_VERB[mode] || 'View'} ${entry.asset.name}`}
					onClick={() => clickable && onSelect?.(entry.asset)}
					className={`relative flex flex-col items-center justify-center rounded-[5px] border transition-colors ${
						selected ? 'sel' : reason ? 'border-transparent' : clickable ? `key-on hover:!border-rim ${starred ? '!bg-[#5a4a12]' : ''}` : starred ? 'border-transparent bg-star-400/15' : 'border-transparent bg-black/20'
					} ${clickable ? 'cursor-pointer' : 'cursor-default'}`}
					style={{ width: tile + 8, height: isFixed ? tile + 20 : tile + 8 }}
				>
					<AssetSprite asset={entry.asset} size={tile} dim={!!reason} />
					{isFixed && entry.price !== undefined && <span className="font-mono text-[10px] font-semibold leading-none tabular-nums text-fog-100">${entry.price}</span>}
					{entry.remaining_copies !== null && entry.remaining_copies > 1 && (
						<span className="absolute right-0 top-0 rounded-bl rounded-tr bg-black/60 px-0.5 font-mono text-[8px] tabular-nums text-fog-300">×{entry.remaining_copies}</span>
					)}
					{entry.asset.captain && <span className="absolute left-0.5 top-0 text-[8px] text-star-400">✪</span>}
					{entry.restriction_icons.length > 0 && <span className="absolute bottom-0 left-0.5 font-display text-[8px] font-bold text-star-400">{entry.restriction_icons.map((icon) => icon.code).join('')}</span>}
				</button>
				{canStar && (
					<button
						type="button"
						aria-pressed={starred}
						aria-label={starred ? `Drop ${entry.asset.name} from targets` : `Target ${entry.asset.name}`}
						title={starred ? 'Drop from targets' : 'Target'}
						onClick={() => toggleTarget(draft.league_id, entry.asset.id)}
						className={`absolute -bottom-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full text-[10px] leading-none ${starred ? 'bg-star-400 text-night-950' : 'bg-[var(--card-side)] text-night-600 hover:text-star-400'}`}
					>
						{starred ? '★' : '☆'}
					</button>
				)}
			</li>
		);
	};

	return (
		<div className="p-2">
			<div className="flex flex-wrap items-start gap-x-4 gap-y-2">
				{GROUPS.map((group) => {
					const entries = available.filter((entry) => group.match(entry.asset));
					if (entries.length === 0) return null;
					return (
						<div key={group.label}>
							<h4 className="mb-1 flex items-center gap-1.5 font-display text-xs font-semibold text-fog-300">
								<span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: group.hue }} />
								{group.label}
								<span className="font-mono font-normal tabular-nums text-fog-500">{entries.length}</span>
							</h4>
							<ul className="grid gap-1" style={{ gridTemplateColumns: `repeat(${group.cols}, max-content)` }}>
								{entries.map(renderTile)}
							</ul>
						</div>
					);
				})}
				<div className="ml-auto flex flex-col items-end gap-1">
					<input className="input !w-32 !py-1 !text-xs" placeholder="Find…" value={search} onChange={(event) => setSearch(event.target.value)} aria-label="Search pool" />
					{mode !== 'browse' && <span className="font-display text-xs font-semibold text-star-400">Click to {MODE_VERB[mode].toLowerCase()}</span>}
					<span className="flex flex-wrap justify-end gap-x-2 text-[10px] text-fog-500">
						<span>✪ captain</span>
						<span>★ your target</span>
						<span>C/G/L restriction</span>
						<span>×n copies</span>
					</span>
				</div>
			</div>
			{available.length === 0 && <p className="py-4 text-center text-xs text-fog-500">Nothing left.</p>}
		</div>
	);
}
