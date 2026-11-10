'use client';

import Link from 'next/link';
import { getAvg, getObp, getSlg, getOps, getPa, getIpString, getOppAvg, getKPct, getERA } from '@/lib/statCalcs';
import { useTagsets } from '@/lib/useTagsets';
import { DEFAULT_MODE } from '@/lib/api';

export interface StatRow {
	title: string;
	href?: string;
	stats: any;
	highlight?: boolean;
}

function RowTitle({ row }: { row: StatRow }) {
	const className = `font-semibold ${row.highlight ? 'text-star-400' : 'text-fog-100'}`;
	return row.href ? (
		<Link href={row.href} className={`${className} hover:text-fog-100 hover:underline`}>
			{row.title}
		</Link>
	) : (
		<span className={className}>{row.title}</span>
	);
}

export function BattingStatsTable({ label, rows }: { label: string; rows: StatRow[] }) {
	return (
		<div className="overflow-x-auto">
			<table className="stat-table">
				<thead>
					<tr>
						<th>{label}</th>
						<th>PA</th>
						<th>H</th>
						<th>2B</th>
						<th>3B</th>
						<th>HR</th>
						<th>RBI</th>
						<th>BB</th>
						<th>SO</th>
						<th>Perfect</th>
						<th>Nice</th>
						<th>Sour</th>
						<th>AVG</th>
						<th>OBP</th>
						<th>SLG</th>
						<th>OPS</th>
					</tr>
				</thead>
				<tbody>
					{rows.map((row) => (
						<tr key={row.title} className={row.highlight ? 'bg-black/40' : undefined}>
							<td>
								<RowTitle row={row} />
							</td>
							<td>{getPa(row.stats)}</td>
							<td>{row.stats?.summary_hits}</td>
							<td>{row.stats?.summary_doubles}</td>
							<td>{row.stats?.summary_triples}</td>
							<td>{row.stats?.summary_homeruns}</td>
							<td>{row.stats?.summary_rbi}</td>
							<td>{row.stats?.summary_walks_bb + row.stats?.summary_walks_hbp}</td>
							<td>{row.stats?.summary_strikeouts}</td>
							<td>{row.stats?.perfect_hits}</td>
							<td>{row.stats?.nice_hits}</td>
							<td>{row.stats?.sour_hits}</td>
							<td>{getAvg(row.stats)?.toFixed(3)}</td>
							<td>{getObp(row.stats)?.toFixed(3)}</td>
							<td>{getSlg(row.stats)?.toFixed(3)}</td>
							<td>{getOps(row.stats)?.toFixed(3)}</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
}

export function PitchingStatsTable({ label, rows }: { label: string; rows: StatRow[] }) {
	return (
		<div className="overflow-x-auto">
			<table className="stat-table">
				<thead>
					<tr>
						<th>{label}</th>
						<th>IP</th>
						<th>H</th>
						<th>R</th>
						<th>K</th>
						<th>BB</th>
						<th>Opp. AVG</th>
						<th>K%</th>
						<th>ERA</th>
					</tr>
				</thead>
				<tbody>
					{rows.map((row) => (
						<tr key={row.title} className={row.highlight ? 'bg-black/40' : undefined}>
							<td>
								<RowTitle row={row} />
							</td>
							<td>{getIpString(row.stats)}</td>
							<td>{row.stats?.hits_allowed}</td>
							<td>{row.stats?.runs_allowed}</td>
							<td>{row.stats?.strikeouts_pitched}</td>
							<td>{row.stats?.walks_bb + row.stats?.walks_hbp}</td>
							<td>{getOppAvg(row.stats)}</td>
							<td>{getKPct(row.stats)}</td>
							<td>{getERA(row.stats)}</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
}

export function ModeSelect({ value, onChange }: { value: string; onChange: (mode: string) => void }) {
	const tagsets = useTagsets();
	const modes = tagsets
		.filter((tagset) => tagset.type !== 'Test')
		.sort((a, b) => (b.start_date ?? 0) - (a.start_date ?? 0));

	return (
		<label className="flex items-center gap-2 text-sm text-fog-300">
			Mode
			<select className="input !w-auto" value={value} onChange={(event) => onChange(event.target.value)}>
				{modes.length === 0 && <option value={DEFAULT_MODE}>{DEFAULT_MODE}</option>}
				{modes.map((mode) => (
					<option key={mode.id} value={mode.name}>
						{mode.name}
					</option>
				))}
			</select>
		</label>
	);
}
