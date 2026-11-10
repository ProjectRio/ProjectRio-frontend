import Link from 'next/link';
import type { TagSet } from '@/lib/api';
import { stadiums } from '@/lib/data/characters';
import { liveTeamImage, liveCharacter, tagSetName } from '@/lib/gameDisplay';
import { BaseDiamond, OutPips, StarOrbs } from './game/hud';
import { characterImage } from '@/lib/data/characters';
import { Badge, LiveDot } from './ui';

function LiveTeamRow({ game, side }: { game: any; side: 'home' | 'away' }) {
	const batting = (game.half_inning === 0) === (side === 'away');
	const player = game[`${side}_player`];
	const stars = game[`${side}_stars`] ?? 0;

	return (
		<div className="flex items-center gap-3 px-4 py-2.5">
			{/* eslint-disable-next-line @next/next/no-img-element */}
			<img src={liveTeamImage(game, side)} alt="" className="h-10 w-10 object-contain" />
			<div className="min-w-0 flex-1">
				<p className="truncate font-display text-base font-semibold text-fog-100">
					{player}
					{batting && <span className="ml-2 text-xs font-bold uppercase tracking-wider text-star-400">At bat</span>}
				</p>
				<StarOrbs stars={stars} className="mt-1" />
			</div>
			<span className="font-mono text-3xl font-semibold tabular-nums text-star-400 [text-shadow:0_2px_0_rgb(0_0_0/0.5)]">
				{game[`${side}_score`]}
			</span>
		</div>
	);
}

export default function LiveGameCard({ game, tagsets }: { game: any; tagsets: TagSet[] }) {
	const mode = tagSetName(tagsets, game.tag_set);
	const battingSide = game.half_inning === 0 ? 'away' : 'home';
	const pitchingSide = game.half_inning === 0 ? 'home' : 'away';
	const batter = liveCharacter(game, battingSide, 'batter');
	const pitcher = liveCharacter(game, pitchingSide, 'pitcher');
	const gameId = `${game.start_time}-${game.home_player}-${game.away_player}`;

	return (
		<Link href={`/games/live/${encodeURIComponent(gameId)}`}>
			<div className="panel panel-glow cursor-pointer">
				<div className="flex items-center justify-between border-b border-night-800 px-4 py-2">
					<span className="flex items-center gap-2 font-display text-xs font-semibold uppercase tracking-wider text-rio-400">
						<LiveDot /> Live — {game.half_inning === 0 ? 'Top' : 'Bot'} {game.inning}
					</span>
					<span className="text-xs text-fog-500">{stadiums[game.stadium_id] ?? ''}</span>
				</div>
				<LiveTeamRow game={game} side="away" />
				<LiveTeamRow game={game} side="home" />
				<div className="flex items-center justify-between border-t border-night-800 px-4 py-2">
					<div className="flex items-center gap-3 text-xs text-fog-300">
						{batter && (
							<span className="flex items-center gap-1">
								{/* eslint-disable-next-line @next/next/no-img-element */}
								<img src={characterImage(batter)} alt="" className="h-5 w-5 object-contain" /> {batter}
							</span>
						)}
						<span className="text-fog-500">vs</span>
						{pitcher && (
							<span className="flex items-center gap-1">
								{/* eslint-disable-next-line @next/next/no-img-element */}
								<img src={characterImage(pitcher)} alt="" className="h-5 w-5 object-contain" /> {pitcher}
							</span>
						)}
					</div>
					<div className="flex items-center gap-3">
						<BaseDiamond
							first={!!Number(game.runner_on_first)}
							second={!!Number(game.runner_on_second)}
							third={!!Number(game.runner_on_third)}
							size={26}
						/>
						<OutPips outs={game.outs} />
					</div>
				</div>
				{mode && (
					<div className="border-t border-night-800 px-4 py-2">
						<Badge color="gray">{mode}</Badge>
					</div>
				)}
			</div>
		</Link>
	);
}
