'use client';

// The Competition page (scoping §3c): standings or bracket, its games, its
// entrants — with the stats the league sheet tracked. Tabs adapt to the kind:
// a league gets standings/schedule/playoffs/stats/rosters, a bracket leads with
// the bracket and stations, a ranked season shows the live ladder, and a
// Triple Play night shows the two sides and their nine fixtures.

import { Suspense, use, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { competitionBySlug, collectionBySlug, breadcrumbs } from '@/lib/compete/fixtures';
import type { Competition } from '@/lib/compete/types';
import { getRecentGames, type GameSummary } from '@/lib/api';
import { useTagsets } from '@/lib/useTagsets';
import { Tabs } from '@/components/overlay';
import { Badge, EmptyState, PageHeader, Panel, PanelHeader, Spinner } from '@/components/ui';
import LadderTable from '@/components/LadderTable';
import GameCard from '@/components/GameCard';
import { KindBadge, Mark, ParticipantName, Section, Stat, StateChip, participantByName, participantsOf, shortDate, stadiumName } from '@/components/compete/shared';
import StandingsTable, { playoffTier, standingsFor } from '@/components/compete/StandingsTable';
import Schedule, { ScoreRow, groupByWeek } from '@/components/compete/Schedule';
import BracketView from '@/components/compete/BracketView';
import StatsTab, { Leaders } from '@/components/compete/StatsTab';
import RosterGrid from '@/components/compete/RosterGrid';
import FileHealth, { fileCounts } from '@/components/compete/FileHealth';

type TabId = 'overview' | 'standings' | 'schedule' | 'playoffs' | 'stats' | 'rosters' | 'entrants';

function tabsFor(competition: Competition): { id: TabId; label: string }[] {
	const tabs: { id: TabId; label: string }[] = [{ id: 'overview', label: 'Overview' }];
	if (competition.kind === 'league' || competition.kind === 'night') tabs.push({ id: 'standings', label: 'Standings' });
	if (competition.fixtures.length || competition.games.length) tabs.push({ id: 'schedule', label: competition.kind === 'tournament' ? 'Matches' : 'Schedule' });
	if (competition.bracket || competition.playoffs) tabs.push({ id: 'playoffs', label: competition.kind === 'tournament' ? 'Bracket' : 'Playoffs' });
	if (competition.kind !== 'season') tabs.push({ id: 'stats', label: 'Stats' });
	if (competition.rosters || competition.draft_league_id) tabs.push({ id: 'rosters', label: 'Rosters' });
	tabs.push({ id: 'entrants', label: competition.kind === 'season' ? 'Rules' : 'Entrants & rules' });
	return tabs;
}

// ── Overview pieces ────────────────────────────────────────────────────────

function RecentResults({ competition, count = 6 }: { competition: Competition; count?: number }) {
	const rows = useMemo(() => {
		const groups = groupByWeek(competition);
		const flat = groups.flatMap((group) => group.rows.filter((row) => row.game));
		return flat.sort((a, b) => b.game!.played_at - a.game!.played_at).slice(0, count);
	}, [competition, count]);
	if (rows.length === 0) return <p className="px-4 py-3 text-sm text-fog-500">No results yet.</p>;
	return (
		<ul className="divide-y divide-night-800">
			{rows.map((row) => (
				<ScoreRow key={row.game!.id} competition={competition} row={row} />
			))}
		</ul>
	);
}

function UpNext({ competition, count = 4 }: { competition: Competition; count?: number }) {
	const rows = useMemo(() => {
		const groups = groupByWeek(competition);
		return groups
			.flatMap((group) => group.rows.filter((row) => !row.game && row.fixture))
			.sort((a, b) => (a.fixture!.status === 'ready' ? -1 : 1) - (b.fixture!.status === 'ready' ? -1 : 1) || (a.fixture!.scheduled_at ?? 0) - (b.fixture!.scheduled_at ?? 0))
			.slice(0, count);
	}, [competition, count]);
	if (rows.length === 0) return <p className="px-4 py-3 text-sm text-fog-500">Nothing scheduled.</p>;
	return (
		<ul className="divide-y divide-night-800">
			{rows.map((row) => (
				<ScoreRow key={row.fixture!.id} competition={competition} row={row} />
			))}
		</ul>
	);
}

function RulesPanel({ competition }: { competition: Competition }) {
	return (
		<Panel>
			<PanelHeader title="Rules" />
			<div className="space-y-3 p-4 text-sm">
				{competition.rulesets.map((ruleset) => (
					<div key={ruleset.name}>
						<p className="font-semibold text-fog-100">{ruleset.name}</p>
						<p className="mt-1 flex flex-wrap gap-1">
							{ruleset.labels.map((label) => (
								<Badge key={label} color="gray">
									{label}
								</Badge>
							))}
						</p>
						{ruleset.codes && <p className="mt-1 text-xs text-fog-500">Codes: {ruleset.codes.join(' · ')}</p>}
					</div>
				))}
				<dl className="space-y-1.5 border-t border-night-800 pt-3 text-xs text-fog-500">
					<div className="flex justify-between gap-3">
						<dt>Innings</dt>
						<dd className="text-fog-300">{competition.innings}</dd>
					</div>
					<div className="flex justify-between gap-3">
						<dt>Signups</dt>
						<dd className="text-fog-300">{competition.signup_policy === 'open' ? 'Open' : 'Invite only'}</dd>
					</div>
					{competition.games_per_entrant && (
						<div className="flex justify-between gap-3">
							<dt>Season length</dt>
							<dd className="text-fog-300">{competition.games_per_entrant} games each</dd>
						</div>
					)}
					{competition.playoffs && (
						<div>
							<dt>Playoffs</dt>
							<dd className="mt-0.5 text-fog-300">{competition.playoffs.description}</dd>
						</div>
					)}
					<div className="flex justify-between gap-3">
						<dt>Organizers</dt>
						<dd className="text-fog-300">
							{competition.organizers.map((name, index) => (
								<span key={name}>
									{index > 0 && ', '}
									<Link href={`/users/${encodeURIComponent(name)}`} className="hover:text-rio-300">
										{name}
									</Link>
								</span>
							))}
						</dd>
					</div>
				</dl>
			</div>
		</Panel>
	);
}

function LeagueOverview({ competition }: { competition: Competition }) {
	const rows = standingsFor(competition);
	const leader = rows[0];
	const played = competition.games.filter((game) => !game.series).length;
	const scheduled = competition.fixtures.length || played;
	const counts = fileCounts(competition);
	const processedPct = competition.games.length ? Math.round((counts.processed / competition.games.length) * 100) : null;
	const byOffense = [...rows].filter((row) => Number.isFinite(row.rfpg)).sort((a, b) => b.rfpg - a.rfpg)[0];
	const byDefense = [...rows].filter((row) => Number.isFinite(row.rapg)).sort((a, b) => a.rapg - b.rapg)[0];
	return (
		<div className="space-y-6">
			<div className="panel flex flex-wrap items-center gap-x-10 gap-y-5 p-5">
				{competition.champion ? (
					<Stat
						label="Champion"
						value={
							<span className="inline-flex items-center gap-2 text-star-400">
								<Mark participant={participantByName(competition, competition.champion)} size={30} />
								{competition.champion}
							</span>
						}
						sub={competition.season_label}
					/>
				) : leader ? (
					<Stat
						label={competition.state === 'completed' ? 'First seed' : 'Leader'}
						value={
							<span className="inline-flex items-center gap-2">
								<Mark participant={participantByName(competition, leader.name)} size={30} />
								{leader.name}
							</span>
						}
						sub={`${leader.total.w}–${leader.total.l}${Number.isFinite(leader.diff) ? ` · ${leader.diff > 0 ? '+' : ''}${leader.diff} run diff` : ''}`}
					/>
				) : null}
				<Stat label="Games" value={`${played}${scheduled ? ` / ${scheduled}` : ''}`} sub={competition.games.some((game) => game.series) ? `+${competition.games.filter((game) => game.series).length} playoff games` : 'regular season'} />
				{byOffense && <Stat label="Best offense" value={byOffense.rfpg.toFixed(1)} sub={`${byOffense.name} · runs per game`} />}
				{byDefense && <Stat label="Best defense" value={byDefense.rapg.toFixed(1)} sub={`${byDefense.name} · runs allowed per game`} />}
				{processedPct !== null && <Stat label="Stat files" value={`${processedPct}%`} sub={counts.problem ? `${counts.problem} with problems` : 'processed by Rio Web'} />}
			</div>
			<div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
				<div className="space-y-6">
					<Panel>
						<PanelHeader title={competition.state === 'completed' ? 'Final standings' : 'Standings'} />
						<StandingsTable competition={competition} compact />
					</Panel>
					{competition.lines.length > 0 && (
						<Section title="Leaders">
							<Leaders competition={competition} />
						</Section>
					)}
					{competition.bracket && (
						<Section title={competition.state === 'completed' ? 'Playoffs' : 'Playoff bracket'}>
							<BracketView competition={competition} bracket={competition.bracket} />
						</Section>
					)}
				</div>
				<div className="space-y-6">
					{competition.state !== 'completed' && (
						<Panel>
							<PanelHeader title="Up next" />
							<UpNext competition={competition} />
						</Panel>
					)}
					<Panel>
						<PanelHeader title="Latest results" />
						<RecentResults competition={competition} />
					</Panel>
					{competition.games.length > 0 && (
						<Panel>
							<PanelHeader title="Stat file tracking" />
							<div className="p-4">
								<FileHealth competition={competition} />
								<p className="mt-3 text-xs text-fog-500">Every played game should have a stat file processed by Rio Web. Submitted files are queued; problems need the commissioner.</p>
							</div>
						</Panel>
					)}
					<RulesPanel competition={competition} />
				</div>
			</div>
		</div>
	);
}

function TournamentOverview({ competition }: { competition: Competition }) {
	const ready = competition.fixtures.filter((fixture) => fixture.status === 'ready');
	const entrants = competition.entrants;
	return (
		<div className="space-y-6">
			{competition.bracket ? (
				<Section title="Bracket">
					<BracketView competition={competition} bracket={competition.bracket} />
				</Section>
			) : (
				<Panel>
					<EmptyState title="Bracket not generated yet" detail={`${entrants.filter((entrant) => entrant.status === 'confirmed').length} confirmed entrants${entrants.some((entrant) => entrant.status === 'pending') ? `, ${entrants.filter((entrant) => entrant.status === 'pending').length} pending` : ''}. The bracket generates when signups close.`} />
				</Panel>
			)}
			<div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
				<div className="space-y-6">
					{competition.stations && competition.stations.length > 0 && (
						<Panel>
							<PanelHeader title="Stations" />
							<ul className="grid gap-px bg-night-800 sm:grid-cols-2">
								{competition.stations.map((station) => {
									const fixture = ready.find((candidate) => candidate.station === station);
									const live = competition.bracket?.rounds.flatMap((round) => round.matches).find((match) => match.station === station && match.status === 'live');
									return (
										<li key={station} className="bg-night-900 px-4 py-3">
											<div className="flex items-center justify-between">
												<span className="font-display text-sm font-bold uppercase tracking-widest text-fog-300">{station}</span>
												<span className={`text-[10px] font-bold uppercase tracking-widest ${live ? 'text-rio-300' : fixture ? 'text-star-400' : 'text-fog-500'}`}>{live ? 'Playing' : fixture ? 'Assigned' : 'Free'}</span>
											</div>
											{live ? (
												<p className="mt-1 text-sm text-fog-100">
													{live.a?.name} vs {live.b?.name}
												</p>
											) : fixture ? (
												<p className="mt-1 text-sm text-fog-100">
													{fixture.home} vs {fixture.away} <span className="text-xs text-fog-500">· up next</span>
												</p>
											) : (
												<p className="mt-1 text-sm text-fog-500">Open</p>
											)}
										</li>
									);
								})}
							</ul>
						</Panel>
					)}
					<Panel>
						<PanelHeader title="Results" />
						<RecentResults competition={competition} count={8} />
					</Panel>
				</div>
				<div className="space-y-6">
					<Panel>
						<PanelHeader title="Entrants" />
						<ul className="divide-y divide-night-800">
							{[...entrants]
								.sort((a, b) => (a.seed ?? 99) - (b.seed ?? 99))
								.map((entrant) => (
									<li key={entrant.username} className="flex items-center gap-2 px-4 py-2 text-sm">
										<span className="w-5 text-xs text-fog-500">{entrant.seed ?? ''}</span>
										<Mark participant={participantByName(competition, entrant.username)} size={22} />
										<ParticipantName participant={participantByName(competition, entrant.username)} name={entrant.username} />
										{entrant.status === 'pending' && (
											<span className="ml-auto">
												<Badge color="gold">Pending</Badge>
											</span>
										)}
									</li>
								))}
						</ul>
					</Panel>
					<RulesPanel competition={competition} />
				</div>
			</div>
		</div>
	);
}

function SeasonOverview({ competition }: { competition: Competition }) {
	const tagsets = useTagsets();
	const [games, setGames] = useState<GameSummary[] | null>(null);
	const mode = competition.ladder_tag_set!;
	useEffect(() => {
		let cancelled = false;
		getRecentGames({ limit: 4, mode: mode.replace(/[ ,]/g, '') })
			.then((result) => {
				if (!cancelled) setGames(result);
			})
			.catch(() => {
				if (!cancelled) setGames([]);
			});
		return () => {
			cancelled = true;
		};
	}, [mode]);
	return (
		<div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
			<Panel>
				<PanelHeader
					title="Ladder"
					action={
						<Link href={`/modes/${encodeURIComponent(mode)}/ladder`} className="font-display text-xs font-semibold uppercase tracking-wider text-rio-400 hover:text-rio-300">
							Full ladder →
						</Link>
					}
				/>
				<LadderTable gameMode={mode} limit={15} />
			</Panel>
			<div className="space-y-6">
				<Section title="Latest games">
					{games === null ? (
						<Spinner label="Loading…" />
					) : games.length === 0 ? (
						<p className="text-sm text-fog-500">No games recorded yet.</p>
					) : (
						<div className="space-y-3">
							{games.map((game) => (
								<GameCard key={game.game_id} game={game} tagsets={tagsets} />
							))}
						</div>
					)}
				</Section>
				<RulesPanel competition={competition} />
			</div>
		</div>
	);
}

function NightOverview({ competition }: { competition: Competition }) {
	const teams = competition.teams ?? [];
	const wins = new Map<string, number>();
	for (const game of competition.games) {
		const winner = game.home_score > game.away_score ? game.home : game.away;
		const team = teams.find((candidate) => candidate.members.includes(winner));
		if (team) wins.set(team.name, (wins.get(team.name) ?? 0) + 1);
	}
	const needed = Math.floor(competition.fixtures.length / 2) + 1;
	return (
		<div className="space-y-6">
			<div className="panel grid grid-cols-[1fr_auto_1fr] items-center gap-4 p-5">
				{teams.map((team, index) => {
					const count = wins.get(team.name) ?? 0;
					return (
						<div key={team.id} className={`${index === 1 ? 'order-3 text-right' : ''} min-w-0`}>
							<p className="kicker !text-[10px]">{team.name}</p>
							<p className={`mt-1 font-display text-5xl font-bold tabular-nums ${count >= needed ? 'text-star-400' : 'text-fog-100'}`}>{count}</p>
							<ul className={`mt-2 flex flex-wrap gap-x-3 gap-y-1 text-sm ${index === 1 ? 'justify-end' : ''}`}>
								{team.members.map((member) => (
									<li key={member}>
										<ParticipantName participant={participantByName(competition, member)} name={member} />
									</li>
								))}
							</ul>
						</div>
					);
				})}
				<div className="order-2 text-center text-xs uppercase tracking-widest text-fog-500">
					first to {needed}
					<br />
					{competition.games.length}/{competition.fixtures.length} played
				</div>
			</div>
			<div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
				<Panel>
					<PanelHeader title="Fixtures" />
					<Schedule competition={competition} />
				</Panel>
				<div className="space-y-6">
					<Panel>
						<PanelHeader title="Draft" />
						<p className="p-4 text-sm text-fog-300">All 54 characters were drafted between the six players — nine each — before the first pitch. Rosters load from the fixture when the client supports it.</p>
					</Panel>
					<RulesPanel competition={competition} />
				</div>
			</div>
		</div>
	);
}

// ── Tabs ───────────────────────────────────────────────────────────────────

function EntrantsTab({ competition }: { competition: Competition }) {
	const participants = participantsOf(competition);
	const rows = standingsFor(competition);
	return (
		<div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
			<Panel>
				<PanelHeader title={competition.teams ? 'Teams' : 'Entrants'} action={<span className="text-xs text-fog-500">{competition.entrants.length} entered · {competition.signup_policy === 'open' ? 'open signups' : 'invite only'}</span>} />
				{competition.kind === 'season' ? (
					<EmptyState title="Open entry" detail="Anyone can play this season from the Rio client. The ladder is the entrant list." />
				) : (
					<ul className="divide-y divide-night-800">
						{participants.map((participant) => {
							const row = rows.find((candidate) => candidate.name === participant.name);
							const tier = row ? playoffTier(competition, row.rank) : 'none';
							const entrant = competition.entrants.find((candidate) => candidate.username === participant.name);
							return (
								<li key={participant.name} className="flex items-center gap-3 px-4 py-2.5 text-sm">
									<Mark participant={participant} size={30} />
									<div className="min-w-0 flex-1">
										<ParticipantName participant={participant} name={participant.name} />
										{participant.members.length > 1 || participant.members[0] !== participant.name ? (
											<p className="text-xs text-fog-500">
												{participant.members.map((member, index) => (
													<span key={member}>
														{index > 0 && ' · '}
														<Link href={`/users/${encodeURIComponent(member)}`} className="hover:text-fog-100">
															{member}
														</Link>
													</span>
												))}
											</p>
										) : (
											<p className="text-xs text-fog-500">
												{entrant?.source === 'draft' ? 'Drafted a roster' : entrant?.source === 'bracket' ? 'Seeded into the bracket' : entrant?.source === 'signup' ? 'Signed up' : 'Entered'}
												{participant.home_park !== undefined && ` · home park ${stadiumName(participant.home_park)}`}
											</p>
										)}
									</div>
									{row && (
										<span className="text-right text-xs tabular-nums text-fog-300">
											{row.total.w}–{row.total.l}
											{tier !== 'none' && <span className="ml-2 text-[10px] uppercase tracking-widest text-fog-500">#{row.rank}</span>}
										</span>
									)}
									{entrant?.status === 'pending' && <Badge color="gold">Pending</Badge>}
									{entrant?.status === 'withdrawn' && <Badge color="gray">Withdrawn</Badge>}
								</li>
							);
						})}
					</ul>
				)}
			</Panel>
			<RulesPanel competition={competition} />
		</div>
	);
}

function CompetitionPageInner({ slug }: { slug: string }) {
	const competition = competitionBySlug(slug);
	const searchParams = useSearchParams();
	const router = useRouter();
	const tabs = competition ? tabsFor(competition) : [];
	const requested = searchParams.get('tab') as TabId | null;
	const tab: TabId = requested && tabs.some((candidate) => candidate.id === requested) ? requested : 'overview';
	if (!competition) return <EmptyState title="No such competition" />;
	const crumbs = breadcrumbs(competition.collections[0]);
	const others = competition.collections.slice(1).map((member) => collectionBySlug(member)).filter(Boolean);

	function setTab(id: string) {
		const params = new URLSearchParams(searchParams.toString());
		if (id === 'overview') params.delete('tab');
		else params.set('tab', id);
		router.replace(`/competitions/${slug}${params.size ? `?${params}` : ''}`, { scroll: false });
	}

	return (
		<div>
			<p className="mb-2 flex flex-wrap items-center gap-1 text-xs text-fog-500">
				<Link href="/collections" className="hover:text-fog-100">
					Collections
				</Link>
				{crumbs.map((crumb) => (
					<span key={crumb.slug} className="flex items-center gap-1">
						<span>/</span>
						<Link href={`/collections/${crumb.slug}`} className="hover:text-fog-100">
							{crumb.name}
						</Link>
					</span>
				))}
				{others.map((collection) => (
					<span key={collection!.slug} className="ml-2 rounded border border-night-700 px-1.5 py-0.5 text-[10px] uppercase tracking-widest">
						also in{' '}
						<Link href={`/collections/${collection!.slug}`} className="text-fog-300 hover:text-fog-100">
							{collection!.name}
						</Link>
					</span>
				))}
			</p>
			<PageHeader kicker={`${crumbs[crumbs.length - 1]?.name ?? ''} · ${competition.season_label}`} title={competition.name}>
				<KindBadge kind={competition.kind} />
				<StateChip state={competition.state} />
				{competition.draft_league_id && (
					<Link href={`/leagues/${competition.draft_league_id}${competition.state === 'drafting' || competition.state === 'upcoming' ? '/draft' : ''}`} className="btn-primary !py-2 text-sm">
						{competition.state === 'drafting' ? 'Draft room' : competition.state === 'upcoming' || competition.state === 'signups' ? 'League setup' : 'League page'}
					</Link>
				)}
			</PageHeader>
			<p className="-mt-4 mb-6 max-w-3xl text-sm text-fog-500">
				{competition.description}
				{competition.starts_at && (
					<span className="ml-2 text-fog-500">
						{shortDate(competition.starts_at)}
						{competition.ends_at ? ` – ${shortDate(competition.ends_at)}` : ''} {new Date(competition.starts_at).getFullYear()}
					</span>
				)}
			</p>
			<Tabs tabs={tabs} active={tab} onChange={setTab} />
			{tab === 'overview' && (competition.kind === 'league' ? <LeagueOverview competition={competition} /> : competition.kind === 'tournament' ? <TournamentOverview competition={competition} /> : competition.kind === 'season' ? <SeasonOverview competition={competition} /> : <NightOverview competition={competition} />)}
			{tab === 'standings' && (
				<Panel>
					<StandingsTable competition={competition} />
				</Panel>
			)}
			{tab === 'schedule' && (
				<Panel>
					<Schedule competition={competition} />
				</Panel>
			)}
			{tab === 'playoffs' &&
				(competition.bracket ? (
					<div className="space-y-4">
						<BracketView competition={competition} bracket={competition.bracket} />
						{competition.playoffs && <p className="text-xs text-fog-500">{competition.playoffs.description}</p>}
					</div>
				) : (
					<Panel>
						<EmptyState title="Playoffs not set" detail={competition.playoffs?.description ?? 'The bracket generates from the final standings.'} />
					</Panel>
				))}
			{tab === 'stats' && (
				<Panel>
					<StatsTab competition={competition} />
				</Panel>
			)}
			{tab === 'rosters' && <RosterGrid competition={competition} />}
			{tab === 'entrants' && <EntrantsTab competition={competition} />}
		</div>
	);
}

export default function CompetitionPage({ params }: { params: Promise<{ slug: string }> }) {
	const { slug } = use(params);
	return (
		<Suspense fallback={<Spinner label="Loading competition…" />}>
			<CompetitionPageInner slug={slug} />
		</Suspense>
	);
}
