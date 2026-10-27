import React from 'react';
import { Badge } from '../core/Badge.jsx';

function TeamRow({ team, won }) {
	return (
		<div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.625rem 1rem' }}>
			{team.sprite && (
				<img
					src={team.sprite}
					alt=""
					style={{ height: 40, width: 40, objectFit: 'contain', imageRendering: 'pixelated' }}
				/>
			)}
			<div style={{ minWidth: 0, flex: 1 }}>
				<span
					style={{
						display: 'block',
						fontFamily: 'var(--font-display)',
						fontSize: 'var(--text-base)',
						fontWeight: 600,
						color: won ? 'var(--fog-100)' : 'var(--fog-500)',
						whiteSpace: 'nowrap',
						overflow: 'hidden',
						textOverflow: 'ellipsis'
					}}
				>
					{team.user}
				</span>
				{team.elo != null && (
					<span style={{ fontSize: 'var(--text-xs)', color: 'var(--fog-500)' }}>
						ELO {team.elo.before} →{' '}
						<span style={{ color: won ? 'var(--emerald-400)' : 'var(--rio-400)' }}>{team.elo.after}</span>
					</span>
				)}
			</div>
			<span
				style={{
					fontFamily: 'var(--font-display)',
					fontSize: 'var(--text-3xl)',
					fontWeight: 700,
					fontVariantNumeric: 'tabular-nums',
					color: won ? 'var(--fog-100)' : 'var(--fog-500)'
				}}
			>
				{team.score}
			</span>
		</div>
	);
}

/**
 * Final-score card for a completed game. `away`/`home` carry the user,
 * score, optional team sprite, and ELO {before, after}.
 */
export function GameScoreCard({ away, home, status = 'Final', timeAgo, mode, stadium, onBoxScore }) {
	const homeWon = home.score > away.score;
	return (
		<div className="panel panel-glow">
			<div
				style={{
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'space-between',
					padding: '0.5rem 1rem',
					borderBottom: '1px solid var(--border-hairline)'
				}}
			>
				<span
					style={{
						fontFamily: 'var(--font-display)',
						fontSize: 'var(--text-xs)',
						fontWeight: 600,
						textTransform: 'uppercase',
						letterSpacing: 'var(--tracking-wider)',
						color: 'var(--fog-500)'
					}}
				>
					{status}
				</span>
				{timeAgo && <span style={{ fontSize: 'var(--text-xs)', color: 'var(--fog-500)' }}>{timeAgo}</span>}
			</div>
			<TeamRow team={away} won={!homeWon} />
			<TeamRow team={home} won={homeWon} />
			<div
				style={{
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'space-between',
					padding: '0.5rem 1rem',
					borderTop: '1px solid var(--border-hairline)'
				}}
			>
				<div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
					{mode && <Badge color="gray">{mode}</Badge>}
					{stadium && <span style={{ fontSize: 'var(--text-xs)', color: 'var(--fog-500)' }}>{stadium}</span>}
				</div>
				{onBoxScore && (
					<button
						onClick={onBoxScore}
						style={{
							background: 'none',
							border: 'none',
							cursor: 'pointer',
							fontFamily: 'var(--font-display)',
							fontSize: 'var(--text-xs)',
							fontWeight: 600,
							textTransform: 'uppercase',
							letterSpacing: 'var(--tracking-wider)',
							color: 'var(--rio-400)'
						}}
					>
						Box Score →
					</button>
				)}
			</div>
		</div>
	);
}
