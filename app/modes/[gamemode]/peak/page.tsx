'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { apiGet, STAT_ENDPOINTS } from '@/lib/api';
import { PageHeader, Panel, Spinner, ErrorState, PlayerLink } from '@/components/ui';

interface Peak {
	player: string;
	score: number;
	date: string;
}

function computePeaks(games: any[]): Peak[] {
	const peaks: { [player: string]: { score: number; date: string } } = {};

	for (const game of games) {
		const homeWon = game.home_score > game.away_score;
		const entries: [string, number][] = [
			[homeWon ? game.home_user : game.away_user, Math.max(game.winner_incoming_elo, game.winner_result_elo)],
			[homeWon ? game.away_user : game.home_user, Math.max(game.loser_incoming_elo, game.loser_result_elo)]
		];
		for (const [player, score] of entries) {
			if (!peaks[player] || peaks[player].score < score) {
				peaks[player] = { score, date: new Date(game.date_time_start * 1000).toLocaleDateString() };
			}
		}
	}

	return Object.entries(peaks)
		.map(([player, { score, date }]) => ({ player, score, date }))
		.filter((peak) => peak.score > 1500)
		.sort((a, b) => b.score - a.score);
}

export default function PeakPage({ params }: { params: Promise<{ gamemode: string }> }) {
	const modeName = decodeURIComponent(use(params).gamemode);
	const [peaks, setPeaks] = useState<Peak[] | null>(null);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		let cancelled = false;
		apiGet(STAT_ENDPOINTS.GAMES, `?tag=${encodeURIComponent(modeName)}&limit_games=false`)
			.then((res) => {
				if (!cancelled) setPeaks(computePeaks(res.games ?? []));
			})
			.catch(() => {
				if (!cancelled) setError('Could not load games for this mode.');
			});
		return () => {
			cancelled = true;
		};
	}, [modeName]);

	return (
		<div className="space-y-6">
			<PageHeader kicker="All-time highs" title={`${modeName} — ELO Peaks`}>
				<Link href={`/modes/${encodeURIComponent(modeName)}/ladder`} className="btn-secondary text-sm">
					Current Ladder
				</Link>
			</PageHeader>

			{error && <ErrorState message={error} />}
			{!peaks && !error && <Spinner label="Crunching every game ever played…" />}
			{peaks && (
				<Panel>
					<div className="overflow-x-auto">
						<table className="stat-table">
							<thead>
								<tr>
									<th>#</th>
									<th>Peak Rating</th>
									<th>Player</th>
									<th>Date of Peak</th>
								</tr>
							</thead>
							<tbody>
								{peaks.map((peak, i) => (
									<tr key={peak.player}>
										<td className="font-mono font-bold tabular-nums text-fog-500">{i + 1}</td>
										<td className="font-mono font-bold tabular-nums text-star-400">{peak.score}</td>
										<td>
											<PlayerLink username={peak.player} />
										</td>
										<td>{peak.date}</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</Panel>
			)}
		</div>
	);
}
