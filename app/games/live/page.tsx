'use client';

import { useEffect, useState } from 'react';
import { getLiveGames } from '@/lib/api';
import { useTagsets } from '@/lib/useTagsets';
import LiveGameCard from '@/components/LiveGameCard';
import { PageHeader, Spinner, EmptyState, ErrorState, LiveDot } from '@/components/ui';

const REFRESH_MS = 30_000;
const LIVE_WINDOW_SECONDS = 60 * 60;

export default function LiveGamesPage() {
	const [games, setGames] = useState<any[] | null>(null);
	const [error, setError] = useState<string | null>(null);
	const tagsets = useTagsets();

	useEffect(() => {
		let cancelled = false;

		async function load() {
			try {
				const result = await getLiveGames(LIVE_WINDOW_SECONDS);
				if (!cancelled) {
					setGames(result);
					setError(null);
				}
			} catch {
				if (!cancelled) setError('Could not load live games. Retrying shortly…');
			}
		}

		load();
		const interval = setInterval(load, REFRESH_MS);
		return () => {
			cancelled = true;
			clearInterval(interval);
		};
	}, []);

	return (
		<div>
			<PageHeader kicker="Happening now" title="Live Games">
				<span className="flex items-center gap-2 text-sm text-fog-500">
					<LiveDot /> Auto-refreshes every 30s
				</span>
			</PageHeader>

			{error && <ErrorState message={error} />}
			{games === null && !error && <Spinner label="Checking for live games…" />}
			{games !== null && games.length === 0 && (
				<EmptyState
					title="No live games right now"
					detail="This page refreshes automatically — games appear here within seconds of first pitch."
				/>
			)}
			{games !== null && games.length > 0 && (
				<>
					{games.some((game) => game._devFixture) && (
						<p className="mb-4 rounded-lg border border-star-500/40 bg-star-500/10 px-4 py-2 text-sm text-star-400">
							Dev mode: no real games are live, so these are example fixtures from{' '}
							<code>example_ongoing_game.json</code>.
						</p>
					)}
					<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
						{games.map((game) => (
							<LiveGameCard key={game.start_time} game={game} tagsets={tagsets} />
						))}
					</div>
				</>
			)}
		</div>
	);
}
