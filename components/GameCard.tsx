import Link from 'next/link';
import type { GameSummary, TagSet } from '@/lib/api';
import { stadiums } from '@/lib/data/characters';
import { recentTeamImage, inningDisplay, eloChange, didHomeWin, tagSetName } from '@/lib/gameDisplay';
import { getTimeSince } from '@/lib/time';
import { Badge } from './ui';

function TeamRow({ game, side }: { game: GameSummary; side: 'home' | 'away' }) {
	const user = game[`${side}_user`];
	const score = game[`${side}_score`];
	const elo = eloChange(game, side);
	const won = didHomeWin(game) === (side === 'home');

	return (
		<div className="flex items-center gap-3 px-4 py-2.5">
			{/* Team logos come from game data; plain img keeps arbitrary names simple */}
			{/* eslint-disable-next-line @next/next/no-img-element */}
			<img src={recentTeamImage(game, side)} alt="" className="h-10 w-10 object-contain" />
			<div className="min-w-0 flex-1">
				<Link
					href={`/users/${encodeURIComponent(user)}`}
					className={`block truncate font-display text-base font-semibold ${won ? 'text-fog-100' : 'text-fog-500'} hover:text-rio-300`}
				>
					{user}
				</Link>
				{elo && (
					<p className="text-xs text-fog-500">
						ELO {Math.round(elo.before)} → <span className={won ? 'text-emerald-400' : 'text-rio-400'}>{Math.round(elo.after)}</span>
					</p>
				)}
			</div>
			<span className={`font-display text-3xl font-bold tabular-nums ${won ? 'text-fog-100' : 'text-fog-500'}`}>
				{score}
			</span>
		</div>
	);
}

export default function GameCard({ game, tagsets }: { game: GameSummary; tagsets: TagSet[] }) {
	const mode = tagSetName(tagsets, game.game_mode as number);

	return (
		<div className="panel panel-glow">
			<div className="flex items-center justify-between border-b border-night-800 px-4 py-2">
				<span className="font-display text-xs font-semibold uppercase tracking-wider text-fog-500">
					Final {inningDisplay(game)}
				</span>
				<span className="text-xs text-fog-500">{game.date_time_end ? getTimeSince(game.date_time_end) : ''}</span>
			</div>
			<TeamRow game={game} side="away" />
			<TeamRow game={game} side="home" />
			<div className="flex items-center justify-between border-t border-night-800 px-4 py-2">
				<div className="flex items-center gap-2">
					{mode && (
						<Link href={`/modes/${encodeURIComponent(mode)}`}>
							<Badge color="gray">{mode}</Badge>
						</Link>
					)}
					{game.stadium !== undefined && <span className="text-xs text-fog-500">{stadiums[game.stadium]}</span>}
				</div>
				<Link
					href={`/games/${game.game_id}`}
					className="font-display text-xs font-semibold uppercase tracking-wider text-rio-400 hover:text-rio-300"
				>
					Box Score →
				</Link>
			</div>
		</div>
	);
}
