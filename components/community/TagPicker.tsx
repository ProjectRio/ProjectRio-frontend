'use client';

import { useEffect, useMemo, useState } from 'react';
import { getAllTags } from '@/lib/api';
import type { RioTag } from '@/lib/communityApi';

// Rule tags a game mode can carry — Community/Competition tags are
// system-managed and never selectable.
function isRuleTag(tag: RioTag) {
	return tag.type !== 'Community' && tag.type !== 'Competition';
}

function TagCheckboxGrid({
	tags,
	selected,
	onToggle
}: {
	tags: RioTag[];
	selected: Set<number>;
	onToggle: (id: number) => void;
}) {
	return (
		<div className="grid max-h-64 gap-1 overflow-y-auto rounded-lg border border-night-700 p-3 sm:grid-cols-2">
			{tags.map((tag) => (
				<label key={tag.id} className="flex items-baseline gap-2 text-sm text-fog-300" title={tag.desc}>
					<input
						type="checkbox"
						className="accent-rio-500"
						checked={selected.has(tag.id)}
						onChange={() => onToggle(tag.id)}
					/>
					<span>
						{tag.name} <span className="text-xs text-fog-500">{tag.type}</span>
					</span>
				</label>
			))}
		</div>
	);
}

/**
 * Checkbox picker for a game mode's rule tags: the community's own tags
 * first, then global tags from other communities (official gecko codes etc.).
 */
export default function TagPicker({
	communityId,
	communityTags,
	selected,
	onToggle
}: {
	communityId: number;
	communityTags: RioTag[] | null;
	selected: Set<number>;
	onToggle: (id: number) => void;
}) {
	const [allTags, setAllTags] = useState<RioTag[]>([]);

	useEffect(() => {
		getAllTags()
			.then(setAllTags)
			.catch(() => {});
	}, []);

	const { ownTags, globalTags } = useMemo(() => {
		const own = (communityTags ?? []).filter(isRuleTag);
		const ownIds = new Set(own.map((tag) => tag.id));
		const global = allTags.filter(
			(tag) => isRuleTag(tag) && tag.comm_id !== communityId && !ownIds.has(tag.id)
		);
		const byName = (a: RioTag, b: RioTag) => a.name.localeCompare(b.name);
		return { ownTags: [...own].sort(byName), globalTags: [...global].sort(byName) };
	}, [communityTags, allTags, communityId]);

	return (
		<div className="space-y-4">
			<div>
				<span className="label">Community Tags</span>
				{ownTags.length === 0 ? (
					<p className="rounded-lg border border-night-700 p-3 text-sm text-fog-500">
						This community has no rule tags yet.
					</p>
				) : (
					<TagCheckboxGrid tags={ownTags} selected={selected} onToggle={onToggle} />
				)}
			</div>
			{globalTags.length > 0 && (
				<div>
					<span className="label">Global &amp; Other Community Tags</span>
					<TagCheckboxGrid tags={globalTags} selected={selected} onToggle={onToggle} />
				</div>
			)}
		</div>
	);
}
