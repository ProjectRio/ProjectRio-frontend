'use client';

/* eslint-disable @next/next/no-img-element */

// The Collection landing page (scoping §3c/§3g): description, sections
// (child collections), lifetime ladder, its competitions, champions, all-time
// history and draft prices — in the order the collection's page_config asks.

import { use, useMemo, useState } from 'react';
import Link from 'next/link';
import { breadcrumbs, childCollections, collectionBySlug, competitionsIn, pricesFor, sortCompetitions } from '@/lib/compete/fixtures';
import type { CharacterLine, Collection, Competition } from '@/lib/compete/types';
import { characterTotals, derive, leagueContext, sumLines, teamLines, type DerivedLine } from '@/lib/compete/stats';
import { characterImage } from '@/lib/data/characters';
import { Badge, EmptyState, PageHeader, Panel, PanelHeader } from '@/components/ui';
import LadderTable from '@/components/LadderTable';
import { COLLECTION_KIND_LABELS, CollectionCard, CompetitionCard, Mark, ParticipantName, PreviewNotice, Section, participantByName } from '@/components/compete/shared';
import { collectionNamesFor } from '@/components/compete/cards';
import { standingsFor } from '@/components/compete/StandingsTable';
import StatTable from '@/components/compete/StatTable';
import { CharacterCell, Glossary } from '@/components/compete/StatsTab';

function CompetitionsSection({ collection, competitions }: { collection: Collection; competitions: Competition[] }) {
	const active = competitions.filter((competition) => competition.state !== 'completed');
	const past = competitions.filter((competition) => competition.state === 'completed');
	if (competitions.length === 0) return <EmptyState title="No competitions yet" detail={collection.membership === 'derived' ? `Competitions join automatically once a ruleset labelled “${collection.derived_label}” is used.` : 'The organizers have not added a competition yet.'} />;
	return (
		<div className="space-y-6">
			{active.length > 0 && (
				<div className="grid gap-4 md:grid-cols-2">
					{active.map((competition) => (
						<CompetitionCard key={competition.slug} competition={competition} collectionNames={competition.collections.length > 1 ? collectionNamesFor(competition).filter((name) => name !== collection.name) : undefined} />
					))}
				</div>
			)}
			{past.length > 0 && (
				<Panel>
					<PanelHeader title="Past" />
					<ul className="px-4 py-2">
						{past.map((competition) => (
							<li key={competition.slug}>
								<Link href={`/competitions/${competition.slug}`} className="pick flex items-center gap-3 text-sm">
									<span className="min-w-0 flex-1 truncate font-medium text-fog-100">{competition.name}</span>
									<span className="hidden font-mono text-xs text-fog-500 sm:inline">{competition.starts_at ? new Date(competition.starts_at).getFullYear() : ''}</span>
									{competition.champion ? (
										<span className="inline-flex items-center gap-2 text-sm text-star-400">
											<Mark participant={participantByName(competition, competition.champion)} size={20} />
											{competition.champion}
										</span>
									) : (
										<span className="text-xs text-fog-500">{competition.entrants.length} entrants</span>
									)}
								</Link>
							</li>
						))}
					</ul>
				</Panel>
			)}
		</div>
	);
}

interface LifetimeRow {
	name: string;
	seasons: number;
	w: number;
	l: number;
	rf: number;
	ra: number;
	hasRuns: boolean;
	titles: number;
	bestFinish: number | null;
	last: { competition: Competition; w: number; l: number; rank: number } | null;
	logo?: string;
}

/** Lifetime win–loss across every competition in the collection (membership rolls up from child collections). */
function lifetimeStandings(competitions: Competition[]): LifetimeRow[] {
	const rows = new Map<string, LifetimeRow>();
	const ordered = [...competitions].sort((a, b) => (a.starts_at ?? 0) - (b.starts_at ?? 0));
	for (const competition of ordered) {
		const table = standingsFor(competition);
		if (table.length === 0) continue;
		for (const standing of table) {
			const row = rows.get(standing.name) ?? { name: standing.name, seasons: 0, w: 0, l: 0, rf: 0, ra: 0, hasRuns: false, titles: 0, bestFinish: null, last: null };
			row.seasons += 1;
			row.w += standing.total.w;
			row.l += standing.total.l;
			if (Number.isFinite(standing.diff)) {
				row.rf += standing.total.rf;
				row.ra += standing.total.ra;
				row.hasRuns = true;
			}
			if (competition.champion === standing.name) row.titles += 1;
			if (competition.state === 'completed' && (row.bestFinish === null || standing.rank < row.bestFinish)) row.bestFinish = standing.rank;
			row.last = { competition, w: standing.total.w, l: standing.total.l, rank: standing.rank };
			row.logo = participantByName(competition, standing.name)?.logo ?? row.logo;
			rows.set(standing.name, row);
		}
	}
	return [...rows.values()].sort((a, b) => {
		const pa = a.w + a.l ? a.w / (a.w + a.l) : 0;
		const pb = b.w + b.l ? b.w / (b.w + b.l) : 0;
		return pb - pa || b.w - a.w || b.titles - a.titles;
	});
}

type LifetimeSort = 'pct' | 'wins' | 'titles';

function LifetimeStandingsSection({ competitions }: { competitions: Competition[] }) {
	const [showAll, setShowAll] = useState(false);
	const [sort, setSort] = useState<LifetimeSort>('pct');
	const rows = useMemo(() => {
		const base = lifetimeStandings(competitions);
		if (sort === 'wins') return [...base].sort((a, b) => b.w - a.w || a.l - b.l);
		if (sort === 'titles') return [...base].sort((a, b) => b.titles - a.titles || b.w - a.w);
		return base;
	}, [competitions, sort]);
	if (rows.length === 0) return <p className="text-sm text-fog-500">No games recorded yet.</p>;
	const hasRuns = rows.some((row) => row.hasRuns);
	const withGames = competitions.filter((competition) => standingsFor(competition).length > 0);
	const visible = showAll ? rows : rows.slice(0, 12);
	const teams = competitions.some((competition) => competition.teams?.length);
	return (
		<Panel>
			<div className="flex flex-wrap items-center justify-between gap-3 px-4 pb-3 pt-4 text-sm text-fog-500">
				<p className="flex flex-wrap gap-x-3 gap-y-1">
					<span>
						Regular-season record across {withGames.length} {withGames.length === 1 ? 'season' : 'seasons'}
					</span>
					<span>playoff games not included</span>
				</p>
				<div className="seg" role="group" aria-label="Sort by">
					{(
						[
							['pct', 'Win %'],
							['wins', 'Wins'],
							['titles', 'Titles']
						] as const
					).map(([value, label]) => (
						<button key={value} type="button" aria-pressed={sort === value} onClick={() => setSort(value)}>
							{label}
						</button>
					))}
				</div>
			</div>
			<div className="overflow-x-auto">
				<table className="stat-table">
					<thead>
						<tr>
							<th>#</th>
							<th>{teams ? 'Team' : 'Manager'}</th>
							<th className="text-right">Seasons</th>
							<th className="text-right">W</th>
							<th className="text-right">L</th>
							<th className="text-right">%</th>
							{hasRuns && (
								<>
									<th className="text-right">RF</th>
									<th className="text-right">RA</th>
									<th className="text-right">Diff</th>
								</>
							)}
							<th className="text-right">Titles</th>
							<th className="text-right" title="Best regular-season finish">
								Best seed
							</th>
							<th>Last season</th>
						</tr>
					</thead>
					<tbody>
						{visible.map((row, index) => {
							const gp = row.w + row.l;
							const diff = row.rf - row.ra;
							return (
								<tr key={row.name}>
									<td className="font-mono font-bold text-fog-500">{index + 1}</td>
									<td>
										<span className="inline-flex items-center gap-2">
											<Mark participant={{ name: row.name, logo: row.logo, members: [row.name] }} size={24} />
											{teams ? <span className="font-medium text-fog-100">{row.name}</span> : <ParticipantName participant={{ name: row.name, members: [row.name] }} name={row.name} />}
										</span>
									</td>
									<td className="num text-fog-300">{row.seasons}</td>
									<td className="num font-bold text-fog-100">{row.w}</td>
									<td className="num text-fog-300">{row.l}</td>
									<td className="num">{gp ? (row.w / gp).toFixed(3).replace(/^0/, '') : '—'}</td>
									{hasRuns && (
										<>
											<td className="num text-fog-300">{row.hasRuns ? row.rf : '—'}</td>
											<td className="num text-fog-300">{row.hasRuns ? row.ra : '—'}</td>
											<td className={`num ${row.hasRuns ? 'text-fog-300' : 'text-fog-500'}`}>{row.hasRuns ? (diff > 0 ? `+${diff}` : diff) : '—'}</td>
										</>
									)}
									<td className="num text-star-400">{row.titles ? `★${row.titles > 1 ? row.titles : ''}` : ''}</td>
									<td className="num text-fog-300">{row.bestFinish ? `#${row.bestFinish}` : '—'}</td>
									<td className="text-sm text-fog-500">
										{row.last && (
											<Link href={`/competitions/${row.last.competition.slug}`} className="inline-flex gap-2 hover:text-fog-100">
												<span>{row.last.competition.season_label}</span>
												<span className="font-mono">
													{row.last.w}–{row.last.l}
												</span>
												<span className="font-mono">#{row.last.rank}</span>
											</Link>
										)}
									</td>
								</tr>
							);
						})}
					</tbody>
				</table>
			</div>
			{rows.length > 12 && (
				<div className="px-4 pb-4 pt-2">
					<button type="button" className="key px-3 py-1.5 text-sm" onClick={() => setShowAll(!showAll)}>
						{showAll ? 'Show fewer' : `Show all ${rows.length}`}
					</button>
				</div>
			)}
		</Panel>
	);
}

function ChampionsSection({ competitions }: { competitions: Competition[] }) {
	const winners = competitions.filter((competition) => competition.champion);
	if (winners.length === 0) return <p className="text-sm text-fog-500">No titles decided yet.</p>;
	const counts = new Map<string, number>();
	for (const competition of winners) counts.set(competition.champion!, (counts.get(competition.champion!) ?? 0) + 1);
	return (
		<div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_18rem]">
			<Panel>
				<ul className="space-y-1 px-4 py-3">
					{winners.map((competition) => (
						<li key={competition.slug} className="flex items-center gap-3 py-1">
							<span className="text-star-400">★</span>
							<Mark participant={participantByName(competition, competition.champion!)} size={28} />
							<ParticipantName participant={participantByName(competition, competition.champion!)} name={competition.champion!} className="font-display text-base" />
							<Link href={`/competitions/${competition.slug}`} className="ml-auto truncate text-sm text-fog-500 hover:text-fog-100">
								{competition.name}
							</Link>
						</li>
					))}
				</ul>
			</Panel>
			<Panel>
				<PanelHeader title="Most titles" />
				<ul className="space-y-1 px-4 py-3">
					{[...counts.entries()]
						.sort((a, b) => b[1] - a[1])
						.map(([name, count]) => (
							<li key={name} className="flex items-center justify-between py-1 text-sm">
								<span className="text-fog-100">{name}</span>
								<span className="font-mono font-semibold tabular-nums text-star-400">{count}</span>
							</li>
						))}
				</ul>
			</Panel>
		</div>
	);
}

function AllTimeSection({ competitions }: { competitions: Competition[] }) {
	const [view, setView] = useState<'managers' | 'characters'>('managers');
	const data = useMemo(() => {
		const withLines = competitions.filter((competition) => competition.lines.length > 0);
		const allLines: CharacterLine[] = withLines.flatMap((competition) => competition.lines);
		const innings = withLines[0]?.innings ?? 9;
		const ctx = leagueContext(allLines, innings, 30);
		const league = derive(sumLines(allLines), ctx);
		// Per manager: seasons, record, titles, aggregate line.
		const managers = new Map<string, { seasons: Set<string>; w: number; l: number; titles: number; lines: CharacterLine[] }>();
		const entryFor = (name: string) => {
			const entry = managers.get(name) ?? { seasons: new Set<string>(), w: 0, l: 0, titles: 0, lines: [] };
			managers.set(name, entry);
			return entry;
		};
		for (const competition of competitions) {
			for (const row of standingsFor(competition)) {
				const entry = entryFor(row.name);
				entry.seasons.add(competition.slug);
				entry.w += row.total.w;
				entry.l += row.total.l;
				if (competition.champion === row.name) entry.titles += 1;
			}
			for (const [owner, line] of teamLines(competition.lines)) {
				const entry = entryFor(owner);
				entry.seasons.add(competition.slug);
				entry.lines.push({ ...line, character: '', slot: 1, owner });
			}
		}
		const managerRows = [...managers.entries()].map(([name, entry]) => ({ name, ...entry, seasons: entry.seasons.size, line: derive(sumLines(entry.lines), ctx) }));
		const characterRows = characterTotals(allLines).map((line) => ({ line, derived: derive(line, ctx) }));
		return { league, managerRows, characterRows, hasLines: allLines.length > 0 };
	}, [competitions]);

	if (data.managerRows.length === 0) return <p className="text-sm text-fog-500">Nothing recorded yet.</p>;
	const characterColumns: (keyof DerivedLine)[] = ['gp', 'pa', 'h', 'hr', 'rbi', 'r', 'avg', 'obp', 'slg', 'ops_plus', 'ip', 'k', 'era', 'whip'];
	return (
		<Panel>
			<div className="flex flex-wrap items-center gap-3 px-4 pb-3 pt-4 text-sm text-fog-500">
				<div className="seg">
					{(['managers', 'characters'] as const).map((option) => (
						<button key={option} type="button" aria-pressed={view === option} onClick={() => setView(option)}>
							{option}
						</button>
					))}
				</div>
				<span className="flex flex-wrap gap-x-3 lg:ml-auto">
					<span>Across {competitions.length} competitions</span>
					<span>rates against the all-time line</span>
				</span>
			</div>
			{view === 'managers' ? (
				<StatTable
					key="managers"
					leadLabel="Manager"
					columns={data.hasLines ? ['gp', 'r', 'hr', 'avg', 'obp', 'slg', 'ops_plus', 'era', 'era_minus', 'whip'] : ['gp']}
					defaultSort="gp"
					leagueLine={data.hasLines ? data.league : undefined}
					rows={data.managerRows.map((row) => ({
						key: row.name,
						lead: (
							<span className="inline-flex items-center gap-2">
								<Link href={`/users/${encodeURIComponent(row.name)}`} className="font-medium text-fog-100 underline decoration-transparent underline-offset-4 hover:decoration-fog-300">
									{row.name}
								</Link>
								<span className="text-xs text-fog-500">

									{row.seasons} season{row.seasons === 1 ? '' : 's'}
									{row.titles > 0 && <span className="ml-1 text-star-400">★{row.titles > 1 ? row.titles : ''}</span>}
								</span>
							</span>
						),
						line: { ...row.line, gp: row.w + row.l }
					}))}
				/>
			) : (
				<StatTable key="characters" leadLabel="Character" columns={characterColumns} defaultSort="ops_plus" leagueLine={data.league} rows={data.characterRows.filter(({ derived }) => derived.qualified_batter || derived.qualified_pitcher).map(({ line, derived }) => ({ key: line.character, lead: <CharacterCell line={line} showOwner={false} />, line: derived }))} />
			)}
			<div className="px-4 py-3">
				<Glossary />
			</div>
		</Panel>
	);
}

function PricesSection({ slug }: { slug: string }) {
	const { seasons, rows } = pricesFor(slug);
	const [sort, setSort] = useState<'latest' | 'trend' | 'name'>('latest');
	const [showAll, setShowAll] = useState(false);
	if (rows.length === 0) return <p className="text-sm text-fog-500">No drafts priced yet.</p>;
	const latest = seasons[seasons.length - 1];
	const first = seasons[0];
	const sorted = [...rows].sort((a, b) => {
		if (sort === 'name') return a.asset.localeCompare(b.asset);
		if (sort === 'trend') return (b.prices[latest] ?? 0) - (b.prices[first] ?? 0) - ((a.prices[latest] ?? 0) - (a.prices[first] ?? 0));
		return (b.prices[latest] ?? 0) - (a.prices[latest] ?? 0);
	});
	const visible = showAll ? sorted : sorted.slice(0, 15);
	const max = Math.max(1, ...rows.map((row) => row.prices[latest] ?? 0));
	return (
		<Panel>
			<div className="flex flex-wrap items-center justify-between gap-3 px-4 pb-3 pt-4 text-sm text-fog-500">
				<span className="max-w-prose">Average price paid per copy, by season. Last-slot top-ups and keepers excluded.</span>
				<div className="seg" role="group" aria-label="Sort by">
					{(
						[
							['latest', 'Highest now'],
							['trend', 'Biggest rise'],
							['name', 'Name']
						] as const
					).map(([value, label]) => (
						<button key={value} type="button" aria-pressed={sort === value} onClick={() => setSort(value)}>
							{label}
						</button>
					))}
				</div>
			</div>
			<div className="overflow-x-auto">
				<table className="stat-table">
					<thead>
						<tr>
							<th>Asset</th>
							{seasons.map((season) => (
								<th key={season} className="text-right">
									{season}
								</th>
							))}
							<th className="text-right">Trend</th>
							<th className="w-40" />
						</tr>
					</thead>
					<tbody>
						{visible.map((row) => {
							const trend = (row.prices[latest] ?? 0) - (row.prices[first] ?? 0);
							return (
								<tr key={`${row.asset}#${row.slot}`}>
									<td>
										<span className="inline-flex items-center gap-2">
											{row.asset.includes('Stadium') || row.asset.includes('Castle') || row.asset.includes('Palace') || row.asset.includes('Park') || row.asset.includes('Garden') || row.asset.includes('Jungle') || row.asset.includes('Field') ? (
												<span className="well inline-flex h-6 w-[22px] items-center justify-center font-display text-xs font-bold text-fog-300" title="Park">P</span>
											) : (
												<img src={characterImage(row.asset)} alt="" width={22} height={26} className="[image-rendering:pixelated]" style={{ width: 22, height: 26 }} />
											)}
											<span className="text-fog-100">
												{row.asset}
												{row.slot && row.slot > 1 && <span className="ml-1 text-xs text-fog-500">#{row.slot}</span>}
											</span>
										</span>
									</td>
									{seasons.map((season) => (
										<td key={season} className={`num ${season === latest ? 'font-bold text-fog-100' : 'text-fog-300'}`}>
											{row.prices[season] !== undefined ? `$${Number(row.prices[season]).toFixed(row.prices[season] % 1 ? 1 : 0)}` : '—'}
										</td>
									))}
									<td className={`num ${trend === 0 ? 'text-fog-500' : 'text-fog-300'}`}>{trend > 0 ? `+${trend.toFixed(1)}` : trend.toFixed(1)}</td>
									<td>
										<div className="well h-1.5 w-full !rounded-full">
											<div className="h-full rounded-full bg-fog-300" style={{ width: `${((row.prices[latest] ?? 0) / max) * 100}%` }} />
										</div>
									</td>
								</tr>
							);
						})}
					</tbody>
				</table>
			</div>
			{rows.length > 15 && (
				<div className="px-4 pb-4 pt-2">
					<button type="button" className="key px-3 py-1.5 text-sm" onClick={() => setShowAll(!showAll)}>
						{showAll ? 'Show fewer' : `Show all ${rows.length}`}
					</button>
				</div>
			)}
		</Panel>
	);
}

export default function CollectionPage({ params }: { params: Promise<{ slug: string }> }) {
	const { slug } = use(params);
	const collection = collectionBySlug(slug);
	const children = childCollections(slug);
	const competitions = useMemo(() => sortCompetitions(competitionsIn(slug)), [slug]);
	if (!collection) return <EmptyState title="No such collection" />;
	const crumbs = breadcrumbs(slug).slice(0, -1);
	const sections = collection.page_config?.sections ?? ['competitions'];
	const direct = competitions.filter((competition) => competition.collections.includes(slug));
	const rolledUp = competitions.length - direct.length;

	return (
		<div className="space-y-10">
			<div>
				<nav aria-label="Breadcrumb" className="mb-2 flex flex-wrap items-center gap-x-1.5 gap-y-1 text-sm text-fog-500">
					<Link href="/collections" className="hover:text-fog-100">
						Collections
					</Link>
					{crumbs.map((crumb) => (
						<span key={crumb.slug} className="flex items-center gap-1.5">
							<span aria-hidden>/</span>
							<Link href={`/collections/${crumb.slug}`} className="hover:text-fog-100">
								{crumb.name}
							</Link>
						</span>
					))}
				</nav>
				<PageHeader kicker={COLLECTION_KIND_LABELS[collection.kind]} title={collection.name}>
					{collection.membership === 'derived' && <Badge color="gray">Derived: {collection.derived_label}</Badge>}
					{collection.sponsor && <Badge color="gold">Sponsored</Badge>}
					{!collection.approved && <Badge color="gold">Awaiting approval</Badge>}
				</PageHeader>
				<div className="-mt-4 mb-5">
					<PreviewNotice />
				</div>
				<div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
					<p className="max-w-prose text-sm leading-relaxed text-fog-300">{collection.description}</p>
					<dl className="space-y-1.5 text-sm text-fog-500">
						<div className="flex justify-between gap-3">
							<dt>Organizers</dt>
							<dd className="text-right text-fog-300">
								{collection.organizers.map((name, index) => (
									<span key={name}>
										{index > 0 && ', '}
										<Link href={`/users/${encodeURIComponent(name)}`} className="underline decoration-transparent underline-offset-4 hover:text-fog-100 hover:decoration-fog-300">
											{name}
										</Link>
									</span>
								))}
							</dd>
						</div>
						{collection.founded && (
							<div className="flex justify-between gap-3">
								<dt>Since</dt>
								<dd className="text-fog-300">{collection.founded}</dd>
							</div>
						)}
						<div className="flex justify-between gap-3">
							<dt>Competitions</dt>
							<dd className="text-fog-300">
								{direct.length}
								{rolledUp > 0 && <span className="text-fog-500"> + {rolledUp} in sections</span>}
							</dd>
						</div>
						{collection.sponsor && (
							<div className="flex justify-between gap-3">
								<dt>Sponsor</dt>
								<dd className="text-fog-300">
									{collection.sponsor.url ? (
										<a href={collection.sponsor.url} target="_blank" rel="noreferrer" className="underline decoration-transparent underline-offset-4 hover:text-fog-100 hover:decoration-fog-300">
											{collection.sponsor.name}
										</a>
									) : (
										collection.sponsor.name
									)}
								</dd>
							</div>
						)}
						{collection.template && (
							<div>
								<dt>Template</dt>
								<dd className="mt-0.5 text-fog-300">{collection.template}</dd>
							</div>
						)}
					</dl>
				</div>
			</div>

			{sections.map((section) => {
				switch (section) {
					case 'standings':
						return (
							<Section key={section} title="Lifetime standings">
								<LifetimeStandingsSection competitions={competitions} />
							</Section>
						);
					case 'children':
						return children.length ? (
							<Section key={section} title="Sections">
								<div className="grid gap-4 md:grid-cols-2">
									{children.map((child) => (
										<CollectionCard key={child.slug} collection={child} count={competitionsIn(child.slug).length} sections={childCollections(child.slug)} />
									))}
								</div>
							</Section>
						) : null;
					case 'ladder':
						return collection.ladder ? (
							<Section key={section} title={collection.ladder.name} action={collection.ladder.tag_set ? <span className="text-sm text-fog-500">Live from {collection.ladder.tag_set} until collection ladders ship</span> : undefined}>
								<Panel>{collection.ladder.tag_set ? <LadderTable gameMode={collection.ladder.tag_set} limit={10} /> : <EmptyState title="Ladder not started" />}</Panel>
							</Section>
						) : null;
					case 'competitions':
						return (
							<Section key={section} title="Competitions">
								<CompetitionsSection collection={collection} competitions={competitions} />
							</Section>
						);
					case 'champions':
						return (
							<Section key={section} title="Champions">
								<ChampionsSection competitions={competitions} />
							</Section>
						);
					case 'all_time':
						return (
							<Section key={section} title="All-time stats">
								<AllTimeSection competitions={competitions.filter((competition) => competition.state === 'completed')} />
							</Section>
						);
					case 'prices':
						return (
							<Section key={section} title="Draft prices">
								<PricesSection slug={slug} />
							</Section>
						);
					default:
						return null;
				}
			})}
		</div>
	);
}
