'use client';

// A player's full game history, fetched once per session and derived into the
// aggregates the profile pages show (records, ratings, pick rates, rivals,
// activity). The /games/ payload already carries rosters, captains, ELO and
// the mode id, so all of this is computed client-side — no extra endpoints.

import { useEffect, useState } from 'react';
import { getAllPlayerGames, type GameSummary, type TagSet } from './api';
import { characters } from './data/characters';

const historyCache = new Map<string, Promise<GameSummary[]>>();

export function usePlayerHistory(username: string): {
	games: GameSummary[] | null;
	error: string | null;
} {
	const [games, setGames] = useState<GameSummary[] | null>(null);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		let cancelled = false;
		setGames(null);
		setError(null);
		const key = username.toLowerCase();
		let promise = historyCache.get(key);
		if (!promise) {
			promise = getAllPlayerGames(username);
			historyCache.set(key, promise);
			promise.catch(() => historyCache.delete(key));
		}
		promise
			.then((result) => {
				if (!cancelled) setGames(result);
			})
			.catch(() => {
				if (!cancelled) setError('Could not load this player’s game history.');
			});
		return () => {
			cancelled = true;
		};
	}, [username]);

	return { games, error };
}

// ---------- Per-game helpers ----------

export function playerSide(game: GameSummary, username: string): 'home' | 'away' {
	return (game.home_user ?? '').toLowerCase() === username.toLowerCase() ? 'home' : 'away';
}

export function playerWon(game: GameSummary, username: string): boolean {
	const homeWon = game.home_score > game.away_score;
	return homeWon === (playerSide(game, username) === 'home');
}

export function opponentOf(game: GameSummary, username: string): string {
	return playerSide(game, username) === 'home' ? game.away_user : game.home_user;
}

export function playerCaptain(game: GameSummary, username: string): string | undefined {
	return playerSide(game, username) === 'home' ? game.home_captain : game.away_captain;
}

export function opponentCaptain(game: GameSummary, username: string): string | undefined {
	return playerSide(game, username) === 'home' ? game.away_captain : game.home_captain;
}

export function playerScoreline(game: GameSummary, username: string): [number, number] {
	return playerSide(game, username) === 'home'
		? [game.home_score, game.away_score]
		: [game.away_score, game.home_score];
}

// Ranked games record the winner's/loser's rating before and after.
export function playerElo(game: GameSummary, username: string): { before: number; after: number } | null {
	const won = playerWon(game, username);
	const before = won ? game.winner_incoming_elo : game.loser_incoming_elo;
	const after = won ? game.winner_result_elo : game.loser_result_elo;
	if (before == null || after == null) return null;
	return { before, after };
}

// The canonical capitalization of a username, recovered from game data
// (the URL segment may be lowercased or otherwise restyled).
export function displayName(games: GameSummary[], username: string): string {
	for (const game of games) {
		if ((game.home_user ?? '').toLowerCase() === username.toLowerCase()) return game.home_user;
		if ((game.away_user ?? '').toLowerCase() === username.toLowerCase()) return game.away_user;
	}
	return username;
}

// ---------- Aggregates ----------

export interface WinLoss {
	wins: number;
	losses: number;
}

export function overallRecord(games: GameSummary[], username: string): WinLoss {
	let wins = 0;
	let losses = 0;
	for (const game of games) {
		if (playerWon(game, username)) wins += 1;
		else losses += 1;
	}
	return { wins, losses };
}

export interface ModeSummary extends WinLoss {
	modeId: number | null;
	name: string;
	games: number;
	currentElo: number | null;
	peakElo: number | null;
	// Chronological rating after each ranked game in the mode.
	trajectory: number[];
	lastPlayed: number;
}

export function modeSummaries(
	games: GameSummary[],
	username: string,
	tagsets: TagSet[]
): ModeSummary[] {
	const byMode = new Map<number | null, ModeSummary>();
	// games arrive newest-first; walk oldest-first so trajectories are chronological.
	for (let i = games.length - 1; i >= 0; i--) {
		const game = games[i];
		const modeId = game.game_mode ?? null;
		let summary = byMode.get(modeId);
		if (!summary) {
			summary = {
				modeId,
				name:
					modeId === null
						? 'Unranked'
						: (tagsets.find((tagset) => tagset.id === modeId)?.name ?? `Mode #${modeId}`),
				games: 0,
				wins: 0,
				losses: 0,
				currentElo: null,
				peakElo: null,
				trajectory: [],
				lastPlayed: 0
			};
			byMode.set(modeId, summary);
		}
		summary.games += 1;
		if (playerWon(game, username)) summary.wins += 1;
		else summary.losses += 1;
		summary.lastPlayed = Math.max(summary.lastPlayed, game.date_time_end ?? game.date_time_start ?? 0);
		const elo = playerElo(game, username);
		if (elo) {
			summary.trajectory.push(elo.after);
			summary.currentElo = elo.after;
			summary.peakElo = Math.max(summary.peakElo ?? 0, elo.after);
		}
	}
	return [...byMode.values()].sort((a, b) => b.lastPlayed - a.lastPlayed);
}

export interface CaptainSummary extends WinLoss {
	name: string;
	picks: number;
}

export function captainSummaries(games: GameSummary[], username: string): CaptainSummary[] {
	const byCaptain = new Map<string, CaptainSummary>();
	for (const game of games) {
		const captain = playerCaptain(game, username);
		if (!captain) continue;
		let summary = byCaptain.get(captain);
		if (!summary) {
			summary = { name: captain, picks: 0, wins: 0, losses: 0 };
			byCaptain.set(captain, summary);
		}
		summary.picks += 1;
		if (playerWon(game, username)) summary.wins += 1;
		else summary.losses += 1;
	}
	return [...byCaptain.values()].sort((a, b) => b.picks - a.picks);
}

export interface CharacterUsage {
	name: string;
	count: number;
}

export function rosterUsage(games: GameSummary[], username: string): CharacterUsage[] {
	const counts = new Map<string, number>();
	for (const game of games) {
		const roster = playerSide(game, username) === 'home' ? game.home_roster : game.away_roster;
		if (!roster) continue;
		for (const charId of Object.values(roster) as any[]) {
			const name = characters[String(charId)];
			if (!name) continue;
			counts.set(name, (counts.get(name) ?? 0) + 1);
		}
	}
	return [...counts.entries()]
		.map(([name, count]) => ({ name, count }))
		.sort((a, b) => b.count - a.count);
}

export interface RivalSummary extends WinLoss {
	opponent: string;
	games: number;
	lastPlayed: number;
}

export function rivalSummaries(games: GameSummary[], username: string): RivalSummary[] {
	const byOpponent = new Map<string, RivalSummary>();
	for (const game of games) {
		const opponent = opponentOf(game, username);
		if (!opponent) continue;
		const key = opponent.toLowerCase();
		let summary = byOpponent.get(key);
		if (!summary) {
			summary = { opponent, games: 0, wins: 0, losses: 0, lastPlayed: 0 };
			byOpponent.set(key, summary);
		}
		summary.games += 1;
		if (playerWon(game, username)) summary.wins += 1;
		else summary.losses += 1;
		summary.lastPlayed = Math.max(summary.lastPlayed, game.date_time_end ?? game.date_time_start ?? 0);
	}
	return [...byOpponent.values()].sort((a, b) => b.games - a.games);
}

export interface MonthActivity {
	label: string;
	count: number;
}

export function activityByMonth(games: GameSummary[], months = 12): MonthActivity[] {
	const buckets: { key: string; label: string; count: number }[] = [];
	const index = new Map<string, number>();
	const now = new Date();
	for (let i = months - 1; i >= 0; i--) {
		const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
		const key = `${date.getFullYear()}-${date.getMonth()}`;
		index.set(key, buckets.length);
		buckets.push({
			key,
			label: date.toLocaleDateString(undefined, { month: 'short' }),
			count: 0
		});
	}
	for (const game of games) {
		const ts = game.date_time_start ?? game.date_time_end;
		if (!ts) continue;
		const date = new Date(ts * 1000);
		const bucket = index.get(`${date.getFullYear()}-${date.getMonth()}`);
		if (bucket !== undefined) buckets[bucket].count += 1;
	}
	return buckets.map(({ label, count }) => ({ label, count }));
}

// The mode a player most recently appeared in — used to default the stats
// pages to something the player actually plays instead of a hardcoded season.
export function lastPlayedModeName(games: GameSummary[], tagsets: TagSet[]): string | null {
	for (const game of games) {
		if (game.game_mode == null) continue;
		const tagset = tagsets.find((candidate) => candidate.id === game.game_mode);
		if (tagset) return tagset.name;
	}
	return null;
}

// Site-wide fallback: the newest non-test mode by start date.
export function newestModeName(tagsets: TagSet[]): string | null {
	const sorted = tagsets
		.filter((tagset) => tagset.type !== 'Test')
		.sort((a, b) => (b.start_date ?? 0) - (a.start_date ?? 0));
	return sorted[0]?.name ?? null;
}
