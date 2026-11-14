'use client';

// A single-elimination bracket drawn from the pybracket projection (§8a):
// one column per round, matches as small cards with per-game scores, joined
// by plain chalk-grey lines. Each round's matches sit in groups of two that
// share the column's height equally, so a group's centre lines up with the
// match it feeds in the next round.

import type { Bracket, BracketMatch, Competition } from '@/lib/compete/types';
import { Mark, ParticipantName, participantByName } from './shared';

/** Half the gap between rounds: the length of each connector stub. */
const STUB = 'w-4';
const LINE = 'bg-[var(--rim)]';

function MatchCard({ competition, match }: { competition: Competition; match: BracketMatch }) {
	let aWins = 0;
	let bWins = 0;
	for (const [x, y] of match.games) x > y ? aWins++ : bWins++;
	const sides = [
		{ side: match.a, wins: aWins, scores: match.games.map((game) => game[0]) },
		{ side: match.b, wins: bWins, scores: match.games.map((game) => game[1]) }
	];
	const status = match.status === 'live' ? 'Live' : match.status === 'ready' ? 'Ready' : null;
	return (
		<div className="panel w-52 px-2.5 py-1.5">
			{sides.map(({ side, wins, scores }, index) => {
				const won = !!match.winner && side?.name === match.winner;
				const lost = !!match.winner && !!side && side.name !== match.winner;
				const tone = won ? '!font-bold !text-fog-100' : lost ? '!font-normal !text-fog-500' : '';
				return (
					<div key={index} className="flex items-center gap-2 py-0.5">
						{side ? (
							<>
								<span className="w-4 shrink-0 font-mono text-xs text-fog-500">{side.seed ?? ''}</span>
								<Mark participant={participantByName(competition, side.name)} size={18} />
								<ParticipantName participant={participantByName(competition, side.name)} name={side.name} className={`min-w-0 flex-1 truncate text-sm ${tone}`} />
							</>
						) : (
							<span className="flex-1 text-sm text-fog-500">TBD</span>
						)}
						<span className="flex items-center gap-1 font-mono text-xs text-fog-500">
							{scores.map((score, i) => (
								<span key={i} className={score > (index === 0 ? match.games[i][1] : match.games[i][0]) ? 'text-fog-100' : ''}>
									{score}
								</span>
							))}
						</span>
						<span className={`w-4 text-right font-mono text-sm font-semibold tabular-nums ${won ? 'text-fog-100' : 'text-fog-500'}`}>{side ? wins : ''}</span>
					</div>
				);
			})}
			{status && (
				<p className={`mt-0.5 flex gap-2 text-xs ${match.status === 'live' ? 'text-rio-300' : 'text-star-400'}`}>
					<span>{status}</span>
					{match.station && <span className="text-fog-300">{match.station}</span>}
				</p>
			)}
		</div>
	);
}

function pairs<T>(items: T[]): T[][] {
	const out: T[][] = [];
	for (let i = 0; i < items.length; i += 2) out.push(items.slice(i, i + 2));
	return out;
}

export default function BracketView({ competition, bracket }: { competition: Competition; bracket: Bracket }) {
	const lastRound = bracket.rounds.length - 1;
	return (
		<div className="overflow-x-auto pb-2">
			<div className="flex min-w-max items-stretch gap-8 px-1 pb-2">
				{bracket.rounds.map((round, roundIndex) => {
					const feedsOn = roundIndex < lastRound || !!bracket.champion;
					return (
						<div key={round.name} className="flex flex-col">
							<div className="mb-3 flex h-6 items-baseline gap-2">
								<h3 className="text-base text-fog-100">{round.name}</h3>
								<span className="text-sm text-fog-500">Bo{round.best_of}</span>
							</div>
							<div className="flex flex-1 flex-col">
								{pairs(round.matches).map((group) => (
									<div key={group[0].id} className="relative flex flex-1 flex-col justify-around">
										{group.map((match) => (
											<div key={match.id} className="relative py-2">
												{roundIndex > 0 && <span aria-hidden className={`absolute right-full top-1/2 h-0.5 -translate-y-1/2 ${STUB} ${LINE}`} />}
												<MatchCard competition={competition} match={match} />
												{feedsOn && <span aria-hidden className={`absolute left-full top-1/2 h-0.5 -translate-y-1/2 ${STUB} ${LINE}`} />}
											</div>
										))}
										{group.length === 2 && roundIndex < lastRound && <span aria-hidden className={`absolute bottom-1/4 right-[-1rem] top-1/4 w-0.5 translate-x-1/2 ${LINE}`} />}
									</div>
								))}
							</div>
						</div>
					);
				})}
				{bracket.champion && (
					<div className="flex flex-col">
						<div className="mb-3 flex h-6 items-baseline">
							<h3 className="text-base text-star-400">Champion</h3>
						</div>
						<div className="flex flex-1 items-center py-2">
							<div className="relative">
								<span aria-hidden className={`absolute right-full top-1/2 h-0.5 -translate-y-1/2 ${STUB} ${LINE}`} />
								<div className="panel flex w-52 items-center gap-3 px-3 py-2.5">
									<Mark participant={participantByName(competition, bracket.champion)} size={32} />
									<ParticipantName participant={participantByName(competition, bracket.champion)} name={bracket.champion} className="min-w-0 truncate font-display text-lg font-bold !text-star-400" />
								</div>
							</div>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
