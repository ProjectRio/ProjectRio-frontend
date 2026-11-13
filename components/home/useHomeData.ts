'use client';

import { useEffect, useState } from 'react';
import { getLiveGames, getRecentGames, type GameSummary } from '@/lib/api';
import { fetchGameLandings, type LandingRow } from '@/lib/landingData';
import { useTagsets } from '@/lib/useTagsets';
import type { HomeData } from './boards';

const LIVE_WINDOW_SECONDS = 60 * 60;
const REFRESH_MS = 30_000;
/* The game's stadium id for Mario Stadium, the only park the landing page draws. */
const MARIO_STADIUM = 0;
/*
 * How many recent finals to look through for one played at Mario Stadium.
 * About half of all games are played there, so eight nearly always holds one,
 * and the wider request costs about a tenth of a second over asking for three.
 */
const FEATURED_CANDIDATES = 8;

/**
 * Everything the boards draw from: fetched once, live games on a 30s poll.
 * `featured` is the latest final at Mario Stadium, with its line score and
 * scoring plays, and `landings` is where every ball of that game came down.
 * The field behind the board is always Mario Stadium, and landings from any
 * other park would sit on the wrong side of its walls. If none of the recent
 * finals was played there, `featured` is simply the latest final and
 * `landings` stays null: the scoreboard still works and the field stays empty.
 */
export function useHomeData(): HomeData {
	const [live, setLive] = useState<any[] | null>(null);
	const [recent, setRecent] = useState<GameSummary[] | null>(null);
	const [featured, setFeatured] = useState<GameSummary | null | undefined>(undefined);
	const [landings, setLandings] = useState<LandingRow[] | null>(null);
	const tagsets = useTagsets();

	useEffect(() => {
		let cancelled = false;
		getRecentGames({ limit: 24, rosters: true })
			.then((games) => !cancelled && setRecent(games))
			.catch(() => !cancelled && setRecent([]));
		getRecentGames({ limit: FEATURED_CANDIDATES, rosters: true, linescore: true })
			.then((games) => {
				if (cancelled) return;
				// Newest first, so the first match is the most recent one.
				const finals = games.filter((game) => game.linescore);
				setFeatured(finals.find((game) => game.stadium === MARIO_STADIUM) ?? finals[0] ?? null);
			})
			.catch(() => !cancelled && setFeatured(null));

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

	// Landings are only fetched for a game at Mario Stadium; see the note above.
	const sprayId = featured?.stadium === MARIO_STADIUM ? featured.game_id : undefined;
	useEffect(() => {
		if (!sprayId) return;
		let cancelled = false;
		// Without the landings the board still has its line score; the field just stays empty.
		fetchGameLandings(sprayId)
			.then((rows) => !cancelled && setLandings(rows))
			.catch(() => {});
		return () => {
			cancelled = true;
		};
	}, [sprayId]);

	return { live, recent, featured, landings, tagsets };
}
