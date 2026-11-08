import React from 'react';
import { TierBadge } from '../core/TierBadge.jsx';

/**
 * Ranked ladder leaderboard. Each row: { username, rating, wins, losses }.
 * Renders rank, tier chip, player, rating, W–L, and win %.
 */
export function LadderTable({ rows, highlightUser }) {
	return (
		<div style={{ overflowX: 'auto' }}>
			<table className="stat-table">
				<thead>
					<tr>
						<th>#</th>
						<th>Tier</th>
						<th>Player</th>
						<th style={{ textAlign: 'right' }}>Rating</th>
						<th style={{ textAlign: 'right' }}>W–L</th>
						<th style={{ textAlign: 'right' }}>Win %</th>
					</tr>
				</thead>
				<tbody>
					{rows.map((row, i) => {
						const total = row.wins + row.losses;
						const pct = total ? ((row.wins / total) * 100).toFixed(1) : '0.0';
						const featured = highlightUser && row.username === highlightUser;
						return (
							<tr key={row.username} style={featured ? { background: 'var(--surface-raised)' } : undefined}>
								<td style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--fog-500)' }}>{i + 1}</td>
								<td><TierBadge rating={row.rating} /></td>
								<td style={{ fontWeight: 500, color: featured ? 'var(--star-400)' : 'var(--fog-100)' }}>{row.username}</td>
								<td style={{ textAlign: 'right', fontFamily: 'var(--font-display)', fontWeight: 700, fontVariantNumeric: 'tabular-nums', color: 'var(--fog-100)' }}>{row.rating}</td>
								<td style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{row.wins}–{row.losses}</td>
								<td style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{pct}%</td>
							</tr>
						);
					})}
				</tbody>
			</table>
		</div>
	);
}
