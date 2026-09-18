'use client';

/* eslint-disable @next/next/no-img-element */

// The stats tab of a competition: team lines, batting, pitching and
// per-character rollups, every rate measured against the competition's own
// league line. The glossary explains each derived column.

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { characterImage } from '@/lib/data/characters';
import type { CharacterLine, Competition } from '@/lib/compete/types';
import { BATTING_TABLE, PITCHING_TABLE, STAT_COLUMNS, TEAM_TABLE, characterTotals, derive, leagueContext, qualifyingGames, sumLines, teamLines, type DerivedLine } from '@/lib/compete/stats';
import { standingsFor } from './StandingsTable';
import StatTable, { type StatTableRow } from './StatTable';
import { Mark, ParticipantName, participantByName } from './shared';
import { EmptyState } from '@/components/ui';

type View = 'team' | 'batting' | 'pitching' | 'characters';

const VIEWS: { id: View; label: string }[] = [
	{ id: 'team', label: 'Teams' },
	{ id: 'batting', label: 'Batting' },
	{ id: 'pitching', label: 'Pitching' },
	{ id: 'characters', label: 'By character' }
];

export function CharacterCell({ line, showOwner = true, competition }: { line: CharacterLine & { owners?: string[] }; showOwner?: boolean; competition?: Competition }) {
	return (
		<span className="inline-flex items-center gap-2">
			<img src={characterImage(line.character)} alt="" width={22} height={26} className="shrink-0 [image-rendering:pixelated]" style={{ width: 22, height: 26 }} />
			<span className="min-w-0">
				<span className="block truncate text-sm font-medium text-fog-100">
					<Link href={`/characters/${encodeURIComponent(line.character)}/batting`} className="hover:text-rio-300">
						{line.character}
					</Link>
					{line.slot > 1 && <span className="ml-1 text-[10px] text-fog-500">#{line.slot}</span>}
				</span>
				{showOwner && (
					<span className="block truncate text-[11px] text-fog-500">
						{line.owners && line.owners.length > 1 ? `${line.owners.length} managers` : competition ? <ParticipantName participant={participantByName(competition, line.owner)} name={line.owner} className="!font-normal !text-fog-500" /> : line.owner}
					</span>
				)}
			</span>
		</span>
	);
}

export function useCompetitionStats(competition: Competition) {
	return useMemo(() => {
		const parkRows = standingsFor(competition);
		const parks = Object.fromEntries(parkRows.map((row) => [row.name, row.park_factor]).filter(([, factor]) => Number.isFinite(factor as number)));
		const gamesPerEntrant = competition.games_per_entrant ?? Math.max(1, ...competition.lines.map((line) => line.gp));
		const ctx = leagueContext(competition.lines, competition.innings, gamesPerEntrant, parks);
		const total = sumLines(competition.lines);
		total.gp = Math.round(total.gp / 9); // character-games → team-games
		const league = derive(total, ctx);
		const teams = [...teamLines(competition.lines).entries()].map(([owner, line]) => ({ owner, line: derive(line, ctx, owner) }));
		const characters = competition.lines.map((line) => ({ line, derived: derive(line, ctx, line.owner) }));
		const rolled = characterTotals(competition.lines).map((line) => ({ line, derived: derive(line, ctx) }));
		return { ctx, league, teams, characters, rolled, bar: qualifyingGames(gamesPerEntrant) };
	}, [competition]);
}

export function Glossary() {
	const [open, setOpen] = useState(false);
	return (
		<div className="text-xs text-fog-500">
			<button type="button" className="underline decoration-dotted underline-offset-2 hover:text-fog-100" onClick={() => setOpen(!open)}>
				{open ? 'Hide glossary' : 'Glossary'}
			</button>
			{open && (
				<dl className="mt-3 grid gap-x-6 gap-y-1.5 sm:grid-cols-2 lg:grid-cols-3">
					{STAT_COLUMNS.map((column) => (
						<div key={column.key} className="flex gap-2">
							<dt className="w-12 shrink-0 font-display font-bold uppercase text-fog-300">{column.abbr}</dt>
							<dd>
								<span className="text-fog-300">{column.label}.</span> {column.description}
							</dd>
						</div>
					))}
				</dl>
			)}
		</div>
	);
}

export default function StatsTab({ competition, highlightOwner }: { competition: Competition; highlightOwner?: string }) {
	const [view, setView] = useState<View>('team');
	const [qualifiedOnly, setQualifiedOnly] = useState(true);
	const [owner, setOwner] = useState('');
	const stats = useCompetitionStats(competition);

	if (competition.lines.length === 0) {
		return <EmptyState title="No stat lines yet" detail={competition.kind === 'season' ? 'Ranked seasons keep their stats on player and character pages.' : 'Character lines appear here as stat files for this competition are processed by Rio Web.'} />;
	}

	const owners = [...new Set(competition.lines.map((line) => line.owner))].sort();
	const leadFor = (line: CharacterLine & { owners?: string[] }) => <CharacterCell line={line} competition={competition} showOwner={view !== 'characters'} />;

	let rows: StatTableRow[] = [];
	let columns: (keyof DerivedLine)[] = TEAM_TABLE;
	let leadLabel = 'Team';
	let defaultSort: keyof DerivedLine = 'ops_plus';

	if (view === 'team') {
		rows = stats.teams.map(({ owner: name, line }) => ({
			key: name,
			lead: (
				<span className="inline-flex items-center gap-2">
					<Mark participant={participantByName(competition, name)} size={22} />
					<ParticipantName participant={participantByName(competition, name)} name={name} />
				</span>
			),
			line,
			highlight: name === highlightOwner
		}));
	} else {
		const source = view === 'characters' ? stats.rolled : stats.characters;
		const filtered = source.filter(({ line }) => (owner ? line.owner === owner || (line as { owners?: string[] }).owners?.includes(owner) : true));
		columns = view === 'pitching' ? PITCHING_TABLE : BATTING_TABLE;
		leadLabel = 'Character';
		defaultSort = view === 'pitching' ? 'era' : 'ops_plus';
		rows = filtered
			.filter(({ derived }) => (view === 'pitching' ? derived.outs > 0 : derived.pa > 0))
			.map(({ line, derived }) => {
				const qualified = view === 'pitching' ? derived.qualified_pitcher : derived.qualified_batter;
				return { key: `${line.character}#${line.slot}@${line.owner}`, lead: leadFor(line), line: derived, muted: !qualified, highlight: line.owner === highlightOwner };
			})
			.filter((row) => !qualifiedOnly || !row.muted);
		if (view === 'characters') columns = ['gp', 'pa', 'h', 'hr', 'rbi', 'avg', 'obp', 'slg', 'ops_plus', 'ip', 'k', 'era', 'whip', 'k_ip'];
	}

	return (
		<div className="space-y-3">
			<div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-night-700 bg-night-850 px-3 py-2 text-xs text-fog-500">
				<div className="flex gap-1">
					{VIEWS.map((option) => (
						<button key={option.id} type="button" className={`rounded px-2.5 py-1 font-display text-[11px] font-bold uppercase tracking-widest ${view === option.id ? 'bg-rio-500/15 text-rio-300' : 'text-fog-500 hover:text-fog-300'}`} onClick={() => setView(option.id)}>
							{option.label}
						</button>
					))}
				</div>
				{view !== 'team' && (
					<>
						<label className="flex items-center gap-1.5">
							<input type="checkbox" className="accent-rio-500" checked={qualifiedOnly} onChange={(event) => setQualifiedOnly(event.target.checked)} />
							Qualified only <span className="text-fog-500">({stats.bar}+ {view === 'pitching' ? 'IP' : 'games'})</span>
						</label>
						<label className="flex items-center gap-1.5">
							Manager
							<select className="rounded border border-night-600 bg-night-900 px-2 py-1 text-xs text-fog-100" value={owner} onChange={(event) => setOwner(event.target.value)}>
								<option value="">All</option>
								{owners.map((name) => (
									<option key={name} value={name}>
										{name}
									</option>
								))}
							</select>
						</label>
					</>
				)}
				<span className="ml-auto">
					{rows.length} rows · {competition.innings}-inning ERA · OPS+ and ERA− against this competition
				</span>
			</div>
			<StatTable key={view} rows={rows} columns={columns} leadLabel={leadLabel} defaultSort={defaultSort} leagueLine={stats.league} />
			<div className="px-3 pb-3">
				<Glossary />
			</div>
		</div>
	);
}

/** Leaders strip for the overview: top qualified line in a few categories. */
export function Leaders({ competition }: { competition: Competition }) {
	const stats = useCompetitionStats(competition);
	if (competition.lines.length === 0) return null;
	const batters = stats.characters.filter(({ derived }) => derived.qualified_batter);
	const pitchers = stats.characters.filter(({ derived }) => derived.qualified_pitcher);
	const pick = (pool: typeof batters, key: keyof DerivedLine, lowest = false) =>
		[...pool].sort((a, b) => (lowest ? (a.derived[key] as number) - (b.derived[key] as number) : (b.derived[key] as number) - (a.derived[key] as number)))[0];
	const entries: { label: string; item: (typeof batters)[number] | undefined; value: (line: DerivedLine) => string }[] = [
		{ label: 'OPS+', item: pick(batters, 'ops_plus'), value: (line) => String(Math.round(line.ops_plus)) },
		{ label: 'Home runs', item: pick(batters, 'hr'), value: (line) => String(line.hr) },
		{ label: 'RBI', item: pick(batters, 'rbi'), value: (line) => String(line.rbi) },
		{ label: 'ERA', item: pick(pitchers, 'era', true), value: (line) => line.era.toFixed(2) },
		{ label: 'Strikeouts', item: pick(pitchers, 'k'), value: (line) => String(line.k) },
		{ label: 'WHIP', item: pick(pitchers, 'whip', true), value: (line) => line.whip.toFixed(2) }
	];
	return (
		<ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
			{entries
				.filter((entry) => entry.item)
				.map((entry) => (
					<li key={entry.label} className="panel flex items-center gap-3 px-3 py-2">
						<img src={characterImage(entry.item!.line.character)} alt="" width={30} height={35} className="[image-rendering:pixelated]" style={{ width: 30, height: 35 }} />
						<div className="min-w-0 flex-1">
							<p className="text-[10px] font-semibold uppercase tracking-widest text-fog-500">{entry.label}</p>
							<p className="truncate text-sm text-fog-100">
								{entry.item!.line.character}
								{entry.item!.line.slot > 1 ? ` #${entry.item!.line.slot}` : ''} <span className="text-xs text-fog-500">· {entry.item!.line.owner}</span>
							</p>
						</div>
						<span className="font-display text-xl font-bold tabular-nums text-fog-100">{entry.value(entry.item!.derived)}</span>
					</li>
				))}
		</ul>
	);
}

