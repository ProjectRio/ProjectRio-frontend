'use client';

// Traditional box score tables (batting / fielding / pitching / misc), carried
// over from the original game page and wrapped in the tabbed TeamPanel.

import { useState } from 'react';
import { characterName } from '@/lib/data/characters';
import { getAvg, getOps, getOppAvg, getERA, getIpString } from '@/lib/statCalcs';
import { Panel, PanelHeader } from '@/components/ui';

export interface RosterEntry {
	name: string;
	batting: any;
	pitching: any;
	fielding: any;
	misc: any;
}

// Order roster entries by the in-game batting order (char IDs from the games
// endpoint). Any character with stats but missing from the order array is
// appended so nobody is dropped from the box score.
export function buildRoster(teamStats: any, order: number[] = []): RosterEntry[] {
	const stats = teamStats ?? {};
	const toEntry = (name: string): RosterEntry => ({
		name,
		batting: stats[name].Batting,
		pitching: stats[name].Pitching,
		fielding: stats[name].Fielding,
		misc: stats[name].Misc
	});

	const ordered: RosterEntry[] = [];
	const seen = new Set<string>();
	for (const id of order) {
		const name = characterName(id);
		if (stats[name] && !seen.has(name)) {
			ordered.push(toEntry(name));
			seen.add(name);
		}
	}
	for (const name of Object.keys(stats)) {
		if (!seen.has(name)) ordered.push(toEntry(name));
	}
	return ordered;
}

export function sum(
	roster: RosterEntry[],
	group: 'batting' | 'pitching' | 'fielding',
	stat: string
): number {
	return roster.reduce((total, entry) => total + (entry[group]?.[stat] ?? 0), 0);
}

function BattingTable({ roster, captain }: { roster: RosterEntry[]; captain: string }) {
	const ab = sum(roster, 'batting', 'summary_at_bats');
	const hits = sum(roster, 'batting', 'summary_hits');
	const bb = sum(roster, 'batting', 'summary_walks_bb') + sum(roster, 'batting', 'summary_walks_hbp');
	const pa = hits + bb + sum(roster, 'batting', 'summary_sac_flys');
	const slg =
		ab === 0
			? 0
			: (sum(roster, 'batting', 'singles') +
					2 * sum(roster, 'batting', 'doubles') +
					3 * sum(roster, 'batting', 'triples') +
					4 * sum(roster, 'batting', 'summary_homeruns')) /
				ab;
	const obp = pa === 0 ? 0 : (hits + bb) / pa;

	return (
		<table className="stat-table">
			<thead>
				<tr>
					<th>Batters</th>
					<th title="At Bats">AB</th>
					<th title="Hits">H</th>
					<th title="Runs Batted In">RBI</th>
					<th title="Home Runs">HR</th>
					<th title="Walks (BB + HBP)">BB</th>
					<th title="Batting Average">AVG</th>
					<th title="On-base Plus Slugging">OPS</th>
				</tr>
			</thead>
			<tbody>
				{roster.map(({ name, batting }) => (
					<tr key={name}>
						<td>
							{name}
							{captain === name && <span className="ml-1 text-star-400">✪</span>}
						</td>
						<td>{batting.summary_at_bats}</td>
						<td>{batting.summary_hits}</td>
						<td>{batting.summary_rbi}</td>
						<td>{batting.summary_homeruns}</td>
						<td>{batting.summary_walks_bb + batting.summary_walks_hbp}</td>
						<td>{getAvg(batting).toFixed(3)}</td>
						<td>{getOps(batting).toFixed(3)}</td>
					</tr>
				))}
				<tr className="font-bold text-fog-100">
					<td>Total</td>
					<td>{ab}</td>
					<td>{hits}</td>
					<td>{sum(roster, 'batting', 'summary_rbi')}</td>
					<td>{sum(roster, 'batting', 'summary_homeruns')}</td>
					<td>{bb}</td>
					<td>{(ab === 0 ? 0 : hits / ab).toFixed(3)}</td>
					<td>{(obp + slg).toFixed(3)}</td>
				</tr>
			</tbody>
		</table>
	);
}

function PitchingTable({ roster, captain }: { roster: RosterEntry[]; captain: string }) {
	const pitchers = roster.filter((entry) => entry.pitching?.batters_faced !== 0);
	const outs = sum(pitchers, 'pitching', 'outs_pitched');
	const hits = sum(pitchers, 'pitching', 'hits_allowed');
	const runs = sum(pitchers, 'pitching', 'runs_allowed');
	const bb = sum(pitchers, 'pitching', 'walks_bb') + sum(pitchers, 'pitching', 'walks_hbp');
	const oppAb = sum(pitchers, 'pitching', 'batters_faced') - bb;

	return (
		<table className="stat-table">
			<thead>
				<tr>
					<th>Pitchers</th>
					<th title="Innings Pitched">IP</th>
					<th title="Hits Allowed">H</th>
					<th title="Runs Allowed">R</th>
					<th title="Strikeouts">K</th>
					<th title="Walks (BB + HBP)">BB</th>
					<th title="Total Pitches">P</th>
					<th title="Star Pitches Thrown">★P</th>
					<th title="Opponent Batting Average">OppAVG</th>
					<th title="Earned Run Average">ERA</th>
				</tr>
			</thead>
			<tbody>
				{pitchers.map(({ name, pitching }) => (
					<tr key={name}>
						<td>
							{name}
							{captain === name && <span className="ml-1 text-star-400">✪</span>}
						</td>
						<td>{getIpString(pitching)}</td>
						<td>{pitching.hits_allowed}</td>
						<td>{pitching.runs_allowed}</td>
						<td>{pitching.strikeouts_pitched}</td>
						<td>{pitching.walks_bb + pitching.walks_hbp}</td>
						<td>{pitching.total_pitches}</td>
						<td>{pitching.star_pitches_thrown}</td>
						<td>{getOppAvg(pitching)}</td>
						<td>{getERA(pitching)}</td>
					</tr>
				))}
				<tr className="font-bold text-fog-100">
					<td>Total</td>
					<td>{Math.floor(outs / 3) + '.' + (outs % 3)}</td>
					<td>{hits}</td>
					<td>{runs}</td>
					<td>{sum(pitchers, 'pitching', 'strikeouts_pitched')}</td>
					<td>{bb}</td>
					<td>{sum(pitchers, 'pitching', 'total_pitches')}</td>
					<td>{sum(pitchers, 'pitching', 'star_pitches_thrown')}</td>
					<td>{(oppAb === 0 ? 0 : hits / oppAb).toFixed(3)}</td>
					<td>{(outs === 0 ? (runs === 0 ? 0 : 99.99) : runs / (outs / 27)).toFixed(2)}</td>
				</tr>
			</tbody>
		</table>
	);
}

// Position keys as they appear in the fielding stats (outs_per_* / pitches_per_*).
const POSITIONS: { key: string; label: string }[] = [
	{ key: 'p', label: 'P' },
	{ key: 'c', label: 'C' },
	{ key: '1b', label: '1B' },
	{ key: '2b', label: '2B' },
	{ key: '3b', label: '3B' },
	{ key: 'ss', label: 'SS' },
	{ key: 'lf', label: 'LF' },
	{ key: 'cf', label: 'CF' },
	{ key: 'rf', label: 'RF' }
];

// Derive the positions a player fielded, ordered by how much they played there
// (pitches + outs), so a player's primary position shows first.
function playerPositions(fielding: any): string {
	if (!fielding) return '—';
	const played = POSITIONS.map((p) => ({
		label: p.label,
		weight: (fielding[`pitches_per_${p.key}`] ?? 0) + (fielding[`outs_per_${p.key}`] ?? 0)
	}))
		.filter((p) => p.weight > 0)
		.sort((a, b) => b.weight - a.weight);
	return played.length > 0 ? played.map((p) => p.label).join(', ') : '—';
}

const FIELDING_COLS: { key: string; label: string; full: string }[] = [
	{ key: 'big_plays', label: 'BP', full: 'Big Plays' },
	{ key: 'diving_catches', label: 'DC', full: 'Diving Catches' },
	{ key: 'jump_catches', label: 'JC', full: 'Jump Catches' },
	{ key: 'wall_jumps', label: 'WJ', full: 'Wall Jumps' },
	{ key: 'bobbles', label: 'BOB', full: 'Bobbles' }
];

function FieldingTable({ roster, captain }: { roster: RosterEntry[]; captain: string }) {
	return (
		<table className="stat-table">
			<thead>
				<tr>
					<th>Fielders</th>
					<th title="Positions">POS</th>
					{FIELDING_COLS.map((col) => (
						<th key={col.key} title={col.full}>
							{col.label}
						</th>
					))}
				</tr>
			</thead>
			<tbody>
				{roster.map(({ name, fielding }) => (
					<tr key={name}>
						<td>
							{name}
							{captain === name && <span className="ml-1 text-star-400">✪</span>}
						</td>
						<td>{playerPositions(fielding)}</td>
						{FIELDING_COLS.map((col) => (
							<td key={col.key}>{fielding?.[col.key] ?? 0}</td>
						))}
					</tr>
				))}
				<tr className="font-bold text-fog-100">
					<td>Total</td>
					<td>—</td>
					{FIELDING_COLS.map((col) => (
						<td key={col.key}>{sum(roster, 'fielding', col.key)}</td>
					))}
				</tr>
			</tbody>
		</table>
	);
}

const MISC_STATS: { group: 'batting' | 'fielding'; stat: string; label: string }[] = [
	{ group: 'batting', stat: 'doubles', label: 'Doubles' },
	{ group: 'batting', stat: 'triples', label: 'Triples' },
	{ group: 'batting', stat: 'perfect_hits', label: 'Perfect Contacts' }
];

function MiscStats({ roster }: { roster: RosterEntry[] }) {
	const lines = MISC_STATS.map(({ group, stat, label }) => {
		const entries = roster
			.filter((entry) => (entry[group]?.[stat] ?? 0) > 0)
			.map((entry) => `${entry.name} ${entry[group][stat]}`);
		return entries.length > 0 ? { label, text: entries.join(', ') } : null;
	}).filter(Boolean) as { label: string; text: string }[];

	if (lines.length === 0) return null;
	return (
		<dl className="space-y-1 px-4 py-3 text-sm text-fog-300">
			{lines.map(({ label, text }) => (
				<div key={label}>
					<dt className="inline font-semibold text-fog-100">{label}: </dt>
					<dd className="inline">{text}</dd>
				</div>
			))}
		</dl>
	);
}

export function TeamPanel({
	title,
	roster,
	captain
}: {
	title: string;
	roster: RosterEntry[];
	captain: string;
}) {
	const [tab, setTab] = useState<'batting' | 'fielding'>('batting');

	const toggle = (
		<div className="flex overflow-hidden rounded-lg border border-night-600 text-xs">
			{(['batting', 'fielding'] as const).map((view) => (
				<button
					key={view}
					className={`px-3 py-1 font-display font-semibold uppercase tracking-wider transition-colors ${
						tab === view ? 'bg-rio-500 text-white' : 'hover:bg-night-700'
					}`}
					onClick={() => setTab(view)}
				>
					{view}
				</button>
			))}
		</div>
	);

	return (
		<Panel>
			<PanelHeader title={title} action={toggle} />
			<div className="overflow-x-auto">
				{tab === 'batting' ? (
					<BattingTable roster={roster} captain={captain} />
				) : (
					<FieldingTable roster={roster} captain={captain} />
				)}
			</div>
			<div className="overflow-x-auto border-t border-night-700">
				<PitchingTable roster={roster} captain={captain} />
			</div>
			<div className="border-t border-night-700">
				<MiscStats roster={roster} />
			</div>
		</Panel>
	);
}
