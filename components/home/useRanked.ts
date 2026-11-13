'use client';

import { useEffect, useMemo, useState } from 'react';
import { getTagSetLadder, type GameSummary, type LadderPlayer, type TagSet } from '@/lib/api';

/*
 * A ranked season has a last day. The always-open "Mario Baseball (Base Game
 * + QoL)" mode is official too, but its end date is the largest a 32-bit
 * clock can hold, and it is not a season anyone is ranked in.
 */
const NEVER_ENDS = 2 ** 31 - 1;

/** The ranked seasons being played now, busiest first going by the latest finals. */
export function useSeasonModes(recent: GameSummary[] | null, tagsets: TagSet[]) {
	return useMemo(() => {
		const now = Date.now() / 1000;
		const played = new Map<number, number>();
		for (const game of recent ?? []) {
			const id = game.game_mode as number;
			played.set(id, (played.get(id) ?? 0) + 1);
		}
		return tagsets
			.filter((t) => t.comm_type === 'Official' && (t.end_date ?? 0) >= now && (t.end_date ?? 0) < NEVER_ENDS)
			.sort((a, b) => (played.get(b.id) ?? 0) - (played.get(a.id) ?? 0) || (b.start_date ?? 0) - (a.start_date ?? 0))
			.slice(0, 4);
	}, [recent, tagsets]);
}

/** The ladder the Ranked row is showing: on the board on a phone, on the field on a desktop. */
export interface Ranked {
	modes: TagSet[];
	mode: string | null;
	pick: (name: string) => void;
	/** Best first; null while the ladder is on its way. */
	players: LadderPlayer[] | null;
	failed: boolean;
}

const ladderCache = new Map<string, LadderPlayer[]>();

/**
 * Fetched as soon as the seasons are known rather than when the row is lit,
 * so the flags are ready to go up the moment the cursor lands on Ranked.
 */
export function useRanked(recent: GameSummary[] | null, tagsets: TagSet[]): Ranked {
	const modes = useSeasonModes(recent, tagsets);
	const [picked, setPicked] = useState<string | null>(null);
	const mode = picked ?? modes[0]?.name ?? null;
	const [players, setPlayers] = useState<LadderPlayer[] | null>(null);
	const [failed, setFailed] = useState(false);

	useEffect(() => {
		if (!mode) return;
		let cancelled = false;
		setFailed(false);
		const cached = ladderCache.get(mode);
		setPlayers(cached ?? null);
		if (cached) return;
		getTagSetLadder(mode)
			.then((result) => {
				ladderCache.set(mode, result);
				if (!cancelled) setPlayers(result);
			})
			.catch(() => {
				if (!cancelled) setFailed(true);
			});
		return () => {
			cancelled = true;
		};
	}, [mode]);

	return { modes, mode, pick: setPicked, players, failed };
}
