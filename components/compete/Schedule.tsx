'use client';

// Fixtures and results by week. A played fixture shows its game's score and
// stat-file status; an unplayed one shows its window, park and station.

import Link from 'next/link';
import { useMemo, useState } from 'react';
import type { Competition, CompetitionGame, Fixture } from '@/lib/compete/types';
import { weekIndex } from '@/lib/compete/nnl';
import { FileDot, Mark, ParticipantName, participantByName, shortDate, stadiumName } from './shared';
import { EmptyState } from '@/components/ui';

interface WeekGroup {
	week: string;
	window: string;
	rows: { fixture?: Fixture; game?: CompetitionGame }[];
}

export function groupByWeek(competition: Competition): WeekGroup[] {
	const groups = new Map<string, WeekGroup>();
	const gameById = new Map(competition.games.map((game) => [game.id, game]));
	const seenGames = new Set<number>();
	for (const fixture of competition.fixtures) {
		const group = groups.get(fixture.week) ?? { week: fixture.week, window: fixture.window, rows: [] };
		const game = fixture.game_id !== undefined ? gameById.get(fixture.game_id) : undefined;
		if (game) seenGames.add(game.id);
		group.rows.push({ fixture, game });
		groups.set(fixture.week, group);
	}
	for (const game of competition.games) {
		if (seenGames.has(game.id)) continue;
		const group = groups.get(game.week) ?? { week: game.week, window: game.series ? 'Playoffs' : '', rows: [] };
		group.rows.push({ game });
		groups.set(game.week, group);
	}
	return [...groups.values()].sort((a, b) => weekIndex(a.week) - weekIndex(b.week) || firstTime(a) - firstTime(b));
}

function firstTime(group: WeekGroup): number {
	return Math.min(...group.rows.map((row) => row.game?.played_at ?? row.fixture?.scheduled_at ?? Number.MAX_SAFE_INTEGER));
}

/** One game. A played game with a Rio game behind it is a row that opens the game page; everything else is a plain row. Sits in a list padded 1rem (px-4). */
export function ScoreRow({ competition, row, filter }: { competition: Competition; row: WeekGroup['rows'][number]; filter?: string }) {
	const game = row.game;
	const fixture = row.fixture;
	const home = game?.home ?? fixture!.home;
	const away = game?.away ?? fixture!.away;
	const stadium = game?.stadium ?? fixture?.stadium;
	const homeWon = game ? game.home_score > game.away_score : null;
	const dim = filter && home !== filter && away !== filter;
	const href = game?.rio_game_id ? `/games/${game.rio_game_id}` : undefined;
	const awayParticipant = participantByName(competition, away);
	const homeParticipant = participantByName(competition, home);
	const grid = 'grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-x-3 @xl:grid-cols-[6.5rem_minmax(0,1fr)_auto_minmax(0,1fr)_9rem]';
	const body = (
		<>
			<span className="hidden text-sm text-fog-500 @xl:block">
				{game ? shortDate(game.played_at) : fixture?.scheduled_at ? shortDate(fixture.scheduled_at) : fixture?.window}
				{fixture?.station && <span className="ml-2 text-fog-300">{fixture.station}</span>}
			</span>
			<span className="flex min-w-0 items-center justify-end gap-2 text-right">
				<ParticipantName participant={awayParticipant} name={away} plain={!!href} className={`truncate ${homeWon === true ? '!font-normal !text-fog-500' : homeWon === false ? '!font-bold' : ''}`} />
				<Mark participant={awayParticipant} size={22} />
			</span>
			<span className="font-mono text-base font-semibold tabular-nums">
				{game ? (
					<>
						<span className={homeWon ? 'text-fog-500' : 'text-fog-100'}>{game.away_score}</span>
						<span className="mx-1 text-fog-500">–</span>
						<span className={homeWon ? 'text-fog-100' : 'text-fog-500'}>{game.home_score}</span>
					</>
				) : (
					<span className="font-body text-sm font-normal text-fog-500">{fixture?.status === 'ready' ? 'up next' : 'at'}</span>
				)}
			</span>
			<span className="flex min-w-0 items-center gap-2">
				<Mark participant={homeParticipant} size={22} />
				<ParticipantName participant={homeParticipant} name={home} plain={!!href} className={`truncate ${homeWon === false ? '!font-normal !text-fog-500' : homeWon === true ? '!font-bold' : ''}`} />
			</span>
			<span className="col-span-3 mt-1 flex items-center justify-between gap-2 text-xs text-fog-500 @xl:col-span-1 @xl:mt-0 @xl:justify-end">
				<span className="truncate">{stadiumName(stadium)}</span>
				{game && <FileDot status={game.files} />}
			</span>
		</>
	);
	return (
		<li className={`@container ${dim ? 'opacity-40' : ''}`}>
			{href ? (
				<Link href={href} className={`pick ${grid}`}>
					{body}
				</Link>
			) : (
				<div className={`${grid} py-[0.4rem]`}>{body}</div>
			)}
		</li>
	);
}

export default function Schedule({ competition, filter, limit, onlyUpcoming = false }: { competition: Competition; filter?: string; limit?: number; onlyUpcoming?: boolean }) {
	const groups = useMemo(() => groupByWeek(competition), [competition]);
	const [who, setWho] = useState<string>(filter ?? '');
	const names = useMemo(() => Array.from(new Set(competition.fixtures.flatMap((fixture) => [fixture.home, fixture.away]).concat(competition.games.flatMap((game) => [game.home, game.away])))).sort(), [competition]);
	let visible = groups;
	if (onlyUpcoming) visible = groups.map((group) => ({ ...group, rows: group.rows.filter((row) => !row.game) })).filter((group) => group.rows.length);
	if (limit) {
		const flat = visible.flatMap((group) => group.rows.map((row) => ({ group, row }))).slice(0, limit);
		const regrouped = new Map<string, WeekGroup>();
		for (const { group, row } of flat) {
			const target = regrouped.get(group.week) ?? { ...group, rows: [] };
			target.rows.push(row);
			regrouped.set(group.week, target);
		}
		visible = [...regrouped.values()];
	}
	if (visible.length === 0) return <EmptyState title={onlyUpcoming ? 'Nothing scheduled' : 'No schedule yet'} detail={onlyUpcoming ? 'Every fixture has been played.' : 'Fixtures appear once the commissioner publishes the schedule.'} />;
	return (
		<div className="px-4 pb-3 pt-4">
			{!limit && names.length > 2 && (
				<div className="mb-2 flex items-center gap-2">
					<label htmlFor="schedule-filter" className="label !mb-0">
						Show
					</label>
					<select id="schedule-filter" className="input !w-auto !py-1.5 text-sm" value={who} onChange={(event) => setWho(event.target.value)}>
						<option value="">Everyone</option>
						{names.map((name) => (
							<option key={name} value={name}>
								{name}
							</option>
						))}
					</select>
				</div>
			)}
			{visible.map((group) => (
				<section key={group.week} className="pt-3 first:pt-1">
					<div className="flex items-baseline justify-between gap-3 pb-1">
						<h3 className="text-base text-fog-100">{group.week}</h3>
						<span className="text-sm text-fog-500">{group.window}</span>
					</div>
					<ul>
						{group.rows.map((row, index) => (
							<ScoreRow key={row.game?.id ?? `f${row.fixture?.id ?? index}`} competition={competition} row={row} filter={who || undefined} />
						))}
					</ul>
				</section>
			))}
		</div>
	);
}
