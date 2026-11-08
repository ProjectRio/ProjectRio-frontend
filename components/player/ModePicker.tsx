'use client';

import type { GameSummary, TagSet } from '@/lib/api';
import { modeSummaries } from '@/lib/playerHistory';

// Game mode picker for the player stat pages. Modes the player has actually
// appeared in are listed first (with their game counts); everything else is
// tucked into a second group instead of being one flat, ancient-first list.
export default function ModePicker({
	user,
	history,
	tagsets,
	value,
	onChange
}: {
	user: string;
	history: GameSummary[] | null;
	tagsets: TagSet[];
	value: string;
	onChange: (mode: string) => void;
}) {
	const played = history
		? modeSummaries(history, user, tagsets).filter((summary) => summary.modeId !== null)
		: [];
	const playedNames = new Set(played.map((summary) => summary.name));
	const others = tagsets
		.filter((tagset) => tagset.type !== 'Test' && !playedNames.has(tagset.name))
		.sort((a, b) => (b.start_date ?? 0) - (a.start_date ?? 0));

	return (
		<label className="flex items-center gap-2 text-sm text-fog-300">
			<span className="text-[11px] font-semibold uppercase tracking-widest text-fog-500">Game Mode</span>
			<select className="input !w-auto" value={value} onChange={(event) => onChange(event.target.value)}>
				{played.length > 0 ? (
					<>
						<optgroup label="Played">
							{played.map((summary) => (
								<option key={summary.name} value={summary.name}>
									{summary.name} ({summary.games})
								</option>
							))}
						</optgroup>
						<optgroup label="Other modes">
							{others.map((tagset) => (
								<option key={tagset.id} value={tagset.name}>
									{tagset.name}
								</option>
							))}
						</optgroup>
					</>
				) : (
					others.map((tagset) => (
						<option key={tagset.id} value={tagset.name}>
							{tagset.name}
						</option>
					))
				)}
				{/* Keep the current value selectable even if it's not in either list yet. */}
				{!playedNames.has(value) && !others.some((tagset) => tagset.name === value) && (
					<option value={value}>{value}</option>
				)}
			</select>
		</label>
	);
}
