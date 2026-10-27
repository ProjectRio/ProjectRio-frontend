'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import type { GameSummary, TagSet } from '@/lib/api';
import { tagSetName } from '@/lib/gameDisplay';
import {
	playerWon,
	opponentOf,
	playerCaptain,
	opponentCaptain,
	playerScoreline,
	playerElo,
	modeSummaries
} from '@/lib/playerHistory';
import { Panel, PanelHeader, EmptyState } from '@/components/ui';
import { CharPortrait } from './widgets';

const PAGE_SIZE = 25;

// Searchable, filterable full game log for one player.
export default function GameHistory({
	games,
	user,
	tagsets
}: {
	games: GameSummary[];
	user: string;
	tagsets: TagSet[];
}) {
	const [query, setQuery] = useState('');
	const [modeFilter, setModeFilter] = useState('all');
	const [result, setResult] = useState<'all' | 'w' | 'l'>('all');
	const [visible, setVisible] = useState(PAGE_SIZE);

	const modes = useMemo(() => modeSummaries(games, user, tagsets), [games, user, tagsets]);

	const filtered = useMemo(() => {
		const needle = query.trim().toLowerCase();
		return games.filter((game) => {
			if (result !== 'all' && playerWon(game, user) !== (result === 'w')) return false;
			if (modeFilter !== 'all') {
				const name = game.game_mode == null ? 'Unranked' : tagSetName(tagsets, game.game_mode);
				if (name !== modeFilter) return false;
			}
			if (needle) {
				const opponent = (opponentOf(game, user) ?? '').toLowerCase();
				const captain = (playerCaptain(game, user) ?? '').toLowerCase();
				const vsCaptain = (opponentCaptain(game, user) ?? '').toLowerCase();
				if (![opponent, captain, vsCaptain].some((field) => field.includes(needle))) return false;
			}
			return true;
		});
	}, [games, user, tagsets, query, modeFilter, result]);

	const shown = filtered.slice(0, visible);

	function updateFilter(update: () => void) {
		update();
		setVisible(PAGE_SIZE);
	}

	return (
		<Panel>
			<PanelHeader title={`Game History (${games.length})`} />
			<div className="flex flex-wrap items-center gap-3 border-b border-night-700 p-4">
				<input
					type="search"
					className="input max-w-xs flex-1"
					placeholder="Search opponent or captain…"
					value={query}
					onChange={(event) => updateFilter(() => setQuery(event.target.value))}
				/>
				<select
					className="input !w-auto"
					value={modeFilter}
					aria-label="Filter by game mode"
					onChange={(event) => updateFilter(() => setModeFilter(event.target.value))}
				>
					<option value="all">All modes</option>
					{modes.map((mode) => (
						<option key={mode.name} value={mode.name}>
							{mode.name} ({mode.games})
						</option>
					))}
				</select>
				<select
					className="input !w-auto"
					value={result}
					aria-label="Filter by result"
					onChange={(event) => updateFilter(() => setResult(event.target.value as 'all' | 'w' | 'l'))}
				>
					<option value="all">Wins & losses</option>
					<option value="w">Wins only</option>
					<option value="l">Losses only</option>
				</select>
				<span className="ml-auto text-sm text-fog-500" style={{ fontVariantNumeric: 'tabular-nums' }}>
					{filtered.length} games
				</span>
			</div>

			{filtered.length === 0 ? (
				<EmptyState title="No games match" detail="Try clearing the search or filters." />
			) : (
				<div className="overflow-x-auto">
					<table className="stat-table">
						<thead>
							<tr>
								<th>Date</th>
								<th>Mode</th>
								<th></th>
								<th>Score</th>
								<th>Opponent</th>
								<th>Matchup</th>
								<th className="text-right">Rating</th>
							</tr>
						</thead>
						<tbody>
							{shown.map((game) => {
								const won = playerWon(game, user);
								const [forScore, againstScore] = playerScoreline(game, user);
								const opponent = opponentOf(game, user);
								const captain = playerCaptain(game, user);
								const vsCaptain = opponentCaptain(game, user);
								const elo = playerElo(game, user);
								const delta = elo ? elo.after - elo.before : null;
								return (
									<tr key={game.game_id}>
										<td className="whitespace-nowrap" style={{ fontVariantNumeric: 'tabular-nums' }}>
											<Link href={`/games/${game.game_id}`} className="text-fog-300 hover:text-rio-300">
												{game.date_time_start
													? new Date(game.date_time_start * 1000).toLocaleDateString()
													: '—'}
											</Link>
										</td>
										<td className="whitespace-nowrap text-fog-500">
											{game.game_mode == null ? 'Unranked' : tagSetName(tagsets, game.game_mode) || '—'}
										</td>
										<td>
											<span
												className={`flex h-6 w-6 items-center justify-center rounded font-display text-xs font-bold ${
													won ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rio-500/20 text-rio-300'
												}`}
											>
												{won ? 'W' : 'L'}
											</span>
										</td>
										<td
											className="whitespace-nowrap font-semibold text-fog-100"
											style={{ fontVariantNumeric: 'tabular-nums' }}
										>
											{forScore}–{againstScore}
										</td>
										<td className="whitespace-nowrap">
											<Link
												href={`/users/${encodeURIComponent(opponent ?? '')}`}
												className="font-medium text-fog-100 hover:text-rio-300"
											>
												{opponent ?? '—'}
											</Link>
										</td>
										<td>
											<span className="flex items-center gap-1.5 whitespace-nowrap text-fog-500">
												{captain && <CharPortrait name={captain} size={24} />}
												<span className="text-xs">vs</span>
												{vsCaptain && <CharPortrait name={vsCaptain} size={24} />}
											</span>
										</td>
										<td
											className={`whitespace-nowrap text-right font-semibold ${
												delta == null ? 'text-fog-500' : delta >= 0 ? 'text-emerald-300' : 'text-rio-300'
											}`}
											style={{ fontVariantNumeric: 'tabular-nums' }}
										>
											{delta == null ? '—' : `${delta >= 0 ? '+' : ''}${delta}`}
										</td>
									</tr>
								);
							})}
						</tbody>
					</table>
				</div>
			)}

			{filtered.length > visible && (
				<div className="border-t border-night-700 p-4 text-center">
					<button type="button" className="btn-secondary" onClick={() => setVisible(visible + PAGE_SIZE)}>
						Show {Math.min(PAGE_SIZE, filtered.length - visible)} more
					</button>
				</div>
			)}
		</Panel>
	);
}
