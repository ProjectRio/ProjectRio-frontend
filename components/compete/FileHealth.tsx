'use client';

// The league sheet's "Stat File Tracking" summary: how many played games have
// a processed stat file behind them, and which need chasing.

import type { Competition, FileStatus } from '@/lib/compete/types';
import { FILE_LABELS } from './shared';

const ORDER: FileStatus[] = ['processed', 'submitted', 'not_submitted', 'problem'];

export function fileCounts(competition: Competition): Record<FileStatus, number> {
	const counts: Record<FileStatus, number> = { processed: 0, submitted: 0, not_submitted: 0, problem: 0 };
	for (const game of competition.games) counts[game.files] += 1;
	return counts;
}

export default function FileHealth({ competition }: { competition: Competition }) {
	const counts = fileCounts(competition);
	const total = competition.games.length;
	if (total === 0) return null;
	return (
		<div>
			<div className="flex h-2 overflow-hidden rounded-full bg-night-800">
				{ORDER.map((status) => (
					<div key={status} className={FILE_LABELS[status].dot} style={{ width: `${(counts[status] / total) * 100}%` }} title={`${FILE_LABELS[status].label}: ${counts[status]}`} />
				))}
			</div>
			<ul className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
				{ORDER.map((status) => (
					<li key={status} className={`flex items-center justify-between gap-2 ${FILE_LABELS[status].className}`}>
						<span className="flex items-center gap-1.5">
							<span className={`inline-block h-1.5 w-1.5 rounded-full ${FILE_LABELS[status].dot}`} />
							{FILE_LABELS[status].label}
						</span>
						<span className="tabular-nums">
							{counts[status]} <span className="text-fog-500">({Math.round((counts[status] / total) * 100)}%)</span>
						</span>
					</li>
				))}
			</ul>
		</div>
	);
}
