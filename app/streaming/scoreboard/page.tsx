'use client';

import { useEffect, useState } from 'react';
import { getRecentGames, getLiveGames, type GameSummary } from '@/lib/api';
import { useTagsets } from '@/lib/useTagsets';
import GameCard from '@/components/GameCard';
import LiveGameCard from '@/components/LiveGameCard';
import { Spinner } from '@/components/ui';

const GREENSCREEN = '#00b140';

function useRotation(length: number, intervalSeconds: number) {
	const [index, setIndex] = useState(0);
	useEffect(() => {
		if (length === 0) return;
		const interval = setInterval(() => setIndex((i) => (i + 1) % length), intervalSeconds * 1000);
		return () => clearInterval(interval);
	}, [length, intervalSeconds]);
	return length === 0 ? 0 : index % length;
}

export default function StreamScoreboardPage() {
	const tagsets = useTagsets();
	const [greenscreen, setGreenscreen] = useState(false);
	const [displaySeconds, setDisplaySeconds] = useState(10);
	const [nGames, setNGames] = useState(5);
	const [includeLogos, setIncludeLogos] = useState(false);
	const [liveWindowMinutes, setLiveWindowMinutes] = useState(60);

	const [recentGames, setRecentGames] = useState<GameSummary[] | null>(null);
	const [liveGames, setLiveGames] = useState<any[] | null>(null);

	// Recent games — refresh every 2 minutes.
	useEffect(() => {
		let cancelled = false;
		const load = () =>
			getRecentGames({ limit: nGames, rosters: includeLogos })
				.then((games) => {
					if (!cancelled) setRecentGames(games);
				})
				.catch(() => {});
		load();
		const interval = setInterval(load, 2 * 60 * 1000);
		return () => {
			cancelled = true;
			clearInterval(interval);
		};
	}, [nGames, includeLogos]);

	// Live games — refresh every 20 seconds.
	useEffect(() => {
		let cancelled = false;
		const load = () =>
			getLiveGames(liveWindowMinutes * 60)
				.then((games) => {
					if (!cancelled) setLiveGames(games);
				})
				.catch(() => {});
		load();
		const interval = setInterval(load, 20 * 1000);
		return () => {
			cancelled = true;
			clearInterval(interval);
		};
	}, [liveWindowMinutes]);

	const recentIndex = useRotation(recentGames?.length ?? 0, displaySeconds);
	const liveIndex = useRotation(liveGames?.length ?? 0, displaySeconds);

	return (
		<div
			className="grid gap-8 rounded-lg p-6 lg:grid-cols-[24rem_1fr]"
			style={greenscreen ? { backgroundColor: GREENSCREEN } : undefined}
		>
			<div className="space-y-8">
				<section>
					{!greenscreen && <h2 className="kicker mb-3">Recent Game</h2>}
					{recentGames === null && <Spinner label="Loading…" />}
					{recentGames && recentGames.length > 0 && (
						<GameCard game={recentGames[recentIndex]} tagsets={tagsets} />
					)}
					{recentGames && recentGames.length === 0 && !greenscreen && (
						<p className="text-sm text-fog-500">No recent games.</p>
					)}
				</section>
				<section>
					{!greenscreen && <h2 className="kicker mb-3">Live Game</h2>}
					{liveGames && liveGames.length > 0 && <LiveGameCard game={liveGames[liveIndex]} tagsets={tagsets} />}
					{liveGames && liveGames.length === 0 && !greenscreen && (
						<p className="text-sm text-fog-500">No current live games.</p>
					)}
				</section>
			</div>

			{!greenscreen && (
				<div className="panel h-fit p-5">
					<h2 className="font-display text-sm font-bold uppercase tracking-widest text-fog-300">
						Overlay Options
					</h2>
					<div className="mt-4 space-y-3 text-sm text-fog-300">
						<label className="flex items-center gap-2">
							<input
								type="checkbox"
								className="accent-star-400"
								checked={includeLogos}
								onChange={(event) => setIncludeLogos(event.target.checked)}
							/>
							Include team logos (slower loading)
						</label>
						<label className="flex items-center gap-3">
							<input
								type="number"
								className="input !w-20"
								min={1}
								max={20}
								value={displaySeconds}
								onChange={(event) => setDisplaySeconds(Number(event.target.value))}
							/>
							Rotation frequency (s)
						</label>
						<label className="flex items-center gap-3">
							<input
								type="number"
								className="input !w-20"
								min={1}
								max={20}
								value={nGames}
								onChange={(event) => setNGames(Number(event.target.value))}
							/>
							# of recent games to rotate
						</label>
						<label className="flex items-center gap-3">
							<input
								type="number"
								className="input !w-20"
								min={20}
								max={1440}
								value={liveWindowMinutes}
								onChange={(event) => setLiveWindowMinutes(Number(event.target.value))}
							/>
							Live game window (minutes)
						</label>
						<label className="flex items-center gap-2">
							<input
								type="checkbox"
								className="accent-star-400"
								checked={greenscreen}
								onChange={(event) => setGreenscreen(event.target.checked)}
							/>
							Greenscreen mode (click again on the green background to exit)
						</label>
					</div>
				</div>
			)}
			{greenscreen && (
				<button
					className="h-fit text-xs text-black/40"
					onClick={() => setGreenscreen(false)}
					title="Exit greenscreen mode"
				>
					exit greenscreen
				</button>
			)}
		</div>
	);
}
