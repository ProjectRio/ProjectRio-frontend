'use client';

import { useEffect, useState } from 'react';
import { getLiveGames, getRecentGames, type GameSummary } from '@/lib/api';
import { useTagsets } from '@/lib/useTagsets';
import type { BoardData } from './boards';

const LIVE_WINDOW_SECONDS = 60 * 60;
const REFRESH_MS = 30_000;

/** Everything the boards draw from: fetched once, live games on a 30s poll. */
export function useHomeData(): BoardData {
	const [live, setLive] = useState<any[] | null>(null);
	const [recent, setRecent] = useState<GameSummary[] | null>(null);
	const tagsets = useTagsets();

	useEffect(() => {
		let cancelled = false;
		getRecentGames({ limit: 24, rosters: true })
			.then((games) => !cancelled && setRecent(games))
			.catch(() => !cancelled && setRecent([]));

		function loadLive() {
			getLiveGames(LIVE_WINDOW_SECONDS)
				.then((games) => !cancelled && setLive(games))
				.catch(() => !cancelled && setLive([]));
		}
		loadLive();
		const interval = setInterval(loadLive, REFRESH_MS);
		return () => {
			cancelled = true;
			clearInterval(interval);
		};
	}, []);

	return { live, recent, tagsets };
}
