'use client';

// The room's feed, derived from bids, nominations and picks (§6d). Newest first, one line each.

import { useEffect, useState } from 'react';
import type { ActivityItem, DraftSnapshot } from '@/lib/draft/types';
import { AssetSprite, findTeam, timeAgo, TeamLogo } from './primitives';

const KIND_STYLES: Record<ActivityItem['kind'], string> = {
	nomination: 'bg-fog-300',
	bid: 'bg-rio-400',
	pass: 'bg-night-600',
	sale: 'bg-star-400',
	pick: 'bg-star-400',
	commissioner: 'bg-emerald-400',
	system: 'bg-night-600',
	presence: 'bg-night-600'
};

export default function ActivityFeed({ snapshot, limit = 30, maxHeight = 'max-h-[28rem]' }: { snapshot: DraftSnapshot; limit?: number; maxHeight?: string }) {
	const [now, setNow] = useState(Date.now());
	useEffect(() => {
		const timer = setInterval(() => setNow(Date.now()), 5000);
		return () => clearInterval(timer);
	}, []);
	const items = snapshot.activity.slice(0, limit);
	if (items.length === 0) return <p className="px-3 py-4 text-center text-xs text-fog-500">Nothing yet.</p>;
	return (
		<ol className={`divide-y divide-night-800 overflow-y-auto ${maxHeight}`}>
			{items.map((item) => {
				const team = findTeam(snapshot, item.team_id);
				return (
					<li key={item.id} className="flex items-center gap-1.5 px-2 py-1 text-[11px] leading-snug">
						<span className={`h-1.5 w-1.5 shrink-0 rounded-full ${KIND_STYLES[item.kind]}`} />
						{item.asset ? <AssetSprite asset={item.asset} size={18} /> : team ? <TeamLogo logo={team.logo} name={team.name} size={16} /> : <span className="w-4" />}
						<span className={`min-w-0 flex-1 ${item.kind === 'system' || item.kind === 'presence' ? 'text-fog-500' : 'text-fog-300'}`}>{item.text}</span>
						<span className="shrink-0 tabular-nums text-fog-500">{timeAgo(item.at, now)}</span>
					</li>
				);
			})}
		</ol>
	);
}
