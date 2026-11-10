'use client';

import { useEffect, useState } from 'react';
import { getTagSetLadder, type LadderPlayer } from '@/lib/api';
import { getTier, getTierColor } from '@/lib/ladder';
import { Spinner, ErrorState, EmptyState, PlayerLink } from '@/components/ui';

export default function LadderTable({ gameMode, limit }: { gameMode: string; limit?: number }) {
	const [players, setPlayers] = useState<LadderPlayer[] | null>(null);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		let cancelled = false;
		getTagSetLadder(gameMode)
			.then((result) => {
				if (!cancelled) setPlayers(limit ? result.slice(0, limit) : result);
			})
			.catch(() => {
				if (!cancelled) setError('Could not load the ladder for this game mode.');
			});
		return () => {
			cancelled = true;
		};
	}, [gameMode, limit]);

	if (error) return <ErrorState message={error} />;
	if (players === null) return <Spinner label="Loading ladder…" />;
	if (players.length === 0) return <EmptyState title="No ranked players yet" />;

	return (
		<div className="overflow-x-auto">
			<table className="stat-table">
				<thead>
					<tr>
						<th>#</th>
						<th>Tier</th>
						<th>Player</th>
						<th>Rating</th>
						<th>W–L</th>
						<th>Win %</th>
					</tr>
				</thead>
				<tbody>
					{players.map((player, i) => {
						const tier = getTier(player.adjusted_rating);
						const color = getTierColor(player.adjusted_rating);
						return (
							<tr key={player.username}>
								<td className="font-mono font-bold tabular-nums text-fog-500">{i + 1}</td>
								<td>
									<span
										className="inline-block rounded px-2 py-0.5 font-display text-xs font-bold uppercase tracking-wider"
										style={{ backgroundColor: `${color}22`, color, border: `1px solid ${color}55` }}
									>
										{tier}
									</span>
								</td>
								<td>
									<PlayerLink username={player.username} />
								</td>
								<td className="font-mono font-bold tabular-nums text-fog-100">{player.adjusted_rating}</td>
								<td className="font-mono tabular-nums">
									{player.num_wins}–{player.num_losses}
								</td>
								<td className="font-mono tabular-nums">
									{((player.num_wins / (player.num_wins + player.num_losses)) * 100).toFixed(1)}%
								</td>
							</tr>
						);
					})}
				</tbody>
			</table>
		</div>
	);
}
