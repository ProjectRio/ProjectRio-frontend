'use client';

// A single-elimination bracket drawn from the pybracket projection (§8a):
// one column per round, matches as cards with per-game scores.

import type { Bracket, BracketMatch, Competition } from '@/lib/compete/types';
import { Mark, ParticipantName, participantByName } from './shared';

function MatchCard({ competition, match, bestOf }: { competition: Competition; match: BracketMatch; bestOf: number }) {
	let aWins = 0;
	let bWins = 0;
	for (const [x, y] of match.games) x > y ? aWins++ : bWins++;
	const sides = [
		{ side: match.a, wins: aWins, scores: match.games.map((game) => game[0]) },
		{ side: match.b, wins: bWins, scores: match.games.map((game) => game[1]) }
	];
	const border = match.status === 'live' ? 'border-rio-500/60' : match.status === 'ready' ? 'border-star-500/40' : 'border-night-700';
	return (
		<div className={`panel w-56 border ${border}`}>
			{sides.map(({ side, wins, scores }, index) => {
				const won = match.winner && side?.name === match.winner;
				const lost = match.winner && side && side.name !== match.winner;
				return (
					<div key={index} className={`flex items-center gap-2 px-2.5 py-1.5 ${index === 0 ? 'border-b border-night-800' : ''} ${lost ? 'opacity-50' : ''}`}>
						{side ? (
							<>
								<span className="w-4 text-[10px] font-bold text-fog-500">{side.seed ?? ''}</span>
								<Mark participant={participantByName(competition, side.name)} size={20} />
								<ParticipantName participant={participantByName(competition, side.name)} name={side.name} className={`min-w-0 flex-1 truncate text-sm ${won ? '!text-star-400' : ''}`} />
							</>
						) : (
							<span className="flex-1 text-xs italic text-fog-500">TBD</span>
						)}
						<span className="flex items-center gap-1 font-mono text-[11px] text-fog-500">
							{scores.map((score, i) => (
								<span key={i} className={score > (index === 0 ? match.games[i][1] : match.games[i][0]) ? 'text-fog-100' : ''}>
									{score}
								</span>
							))}
						</span>
						<span className={`w-4 text-right font-display text-sm font-bold tabular-nums ${won ? 'text-star-400' : 'text-fog-100'}`}>{side ? wins : ''}</span>
					</div>
				);
			})}
			<div className="flex items-center justify-between bg-night-850 px-2.5 py-1 text-[10px] uppercase tracking-widest text-fog-500">
				<span>Bo{bestOf}</span>
				<span className={match.status === 'live' ? 'text-rio-300' : match.status === 'ready' ? 'text-star-400' : ''}>
					{match.status === 'live' ? `Live${match.station ? ` · ${match.station}` : ''}` : match.status === 'ready' ? `Ready${match.station ? ` · ${match.station}` : ''}` : match.status === 'done' ? 'Final' : 'Pending'}
				</span>
			</div>
		</div>
	);
}

export default function BracketView({ competition, bracket }: { competition: Competition; bracket: Bracket }) {
	return (
		<div className="overflow-x-auto pb-2">
			<div className="flex min-w-max items-stretch gap-6 px-1">
				{bracket.rounds.map((round) => (
					<div key={round.name} className="flex flex-col">
						<div className="mb-3 font-display text-xs font-bold uppercase tracking-widest text-fog-300">
							{round.name} <span className="text-fog-500">· Bo{round.best_of}</span>
						</div>
						<div className="flex flex-1 flex-col justify-around gap-4">
							{round.matches.map((match) => (
								<MatchCard key={match.id} competition={competition} match={match} bestOf={round.best_of} />
							))}
						</div>
					</div>
				))}
				{bracket.champion && (
					<div className="flex flex-col">
						<div className="mb-3 font-display text-xs font-bold uppercase tracking-widest text-star-400">Champion</div>
						<div className="flex flex-1 items-center">
							<div className="panel flex w-56 items-center gap-3 border-star-500/50 px-3 py-3">
								<Mark participant={participantByName(competition, bracket.champion)} size={36} />
								<div>
									<ParticipantName participant={participantByName(competition, bracket.champion)} name={bracket.champion} className="font-display text-lg font-bold uppercase !text-star-400" />
									<p className="text-[10px] uppercase tracking-widest text-fog-500">{competition.season_label}</p>
								</div>
							</div>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
