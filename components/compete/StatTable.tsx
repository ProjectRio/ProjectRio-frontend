'use client';

// A sortable stat table driven by the column spec in lib/compete/stats.ts.
// Rows carry a derived line plus whatever leading cells the caller renders.

import { useMemo, useState, type ReactNode } from 'react';
import { COLUMN_BY_KEY, formatStat, type DerivedLine } from '@/lib/compete/stats';

export interface StatTableRow {
	key: string;
	lead: ReactNode;
	line: DerivedLine;
	muted?: boolean;
	highlight?: boolean;
}

export default function StatTable({ rows, columns, leadLabel, defaultSort, leagueLine }: { rows: StatTableRow[]; columns: (keyof DerivedLine)[]; leadLabel: string; defaultSort?: keyof DerivedLine; leagueLine?: DerivedLine }) {
	const [sort, setSort] = useState<{ key: keyof DerivedLine; desc: boolean }>(() => {
		const key = defaultSort ?? columns[0];
		return { key, desc: !!COLUMN_BY_KEY[key]?.desc };
	});
	const sorted = useMemo(() => {
		const list = [...rows];
		list.sort((a, b) => {
			const x = a.line[sort.key] as number;
			const y = b.line[sort.key] as number;
			const xNan = Number.isNaN(x) || !Number.isFinite(x);
			const yNan = Number.isNaN(y) || !Number.isFinite(y);
			if (xNan && yNan) return 0;
			if (xNan) return 1;
			if (yNan) return -1;
			return sort.desc ? y - x : x - y;
		});
		return list;
	}, [rows, sort]);

	function toggle(key: keyof DerivedLine) {
		setSort((current) => (current.key === key ? { key, desc: !current.desc } : { key, desc: !!COLUMN_BY_KEY[key]?.desc }));
	}

	return (
		<div className="overflow-x-auto">
			<table className="stat-table">
				<thead>
					<tr>
						<th className="sticky left-0 z-10 bg-night-850">{leadLabel}</th>
						{columns.map((key) => {
							const column = COLUMN_BY_KEY[key];
							const active = sort.key === key;
							return (
								<th key={key} className="text-right">
									<button type="button" className={`inline-flex items-center gap-1 uppercase ${active ? 'text-fog-100' : 'hover:text-fog-300'}`} title={`${column.label} — ${column.description}`} onClick={() => toggle(key)}>
										{column.abbr}
										{active && <span className="text-[9px]">{sort.desc ? '▼' : '▲'}</span>}
									</button>
								</th>
							);
						})}
					</tr>
				</thead>
				<tbody>
					{leagueLine && (
						<tr className="bg-night-850/60">
							<td className="sticky left-0 z-10 bg-night-900 font-display text-xs font-bold uppercase tracking-widest text-fog-500">League</td>
							{columns.map((key) => (
								<td key={key} className="text-right tabular-nums text-fog-500">
									{formatStat(leagueLine[key], COLUMN_BY_KEY[key].format)}
								</td>
							))}
						</tr>
					)}
					{sorted.map((row) => (
						<tr key={row.key} className={`${row.muted ? 'opacity-50' : ''} ${row.highlight ? 'bg-rio-500/[0.06]' : ''}`}>
							<td className="sticky left-0 z-10 bg-night-900">{row.lead}</td>
							{columns.map((key) => {
								const column = COLUMN_BY_KEY[key];
								const value = row.line[key];
								const emphasis = key === sort.key ? 'font-bold text-fog-100' : 'text-fog-300';
								return (
									<td key={key} className={`text-right tabular-nums ${emphasis}`}>
										{formatStat(value, column.format)}
									</td>
								);
							})}
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
}
