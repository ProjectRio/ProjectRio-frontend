import React from 'react';

/**
 * Generic Rio stat table. `columns` describe headers + cell accessors;
 * `rows` are arbitrary records. First column is left-aligned (the label),
 * the rest render tabular-nums. Use `highlightKey` to flag a featured row.
 */
export function StatTable({ columns, rows, highlightKey, rowKey = 'id' }) {
	return (
		<div style={{ overflowX: 'auto' }}>
			<table className="stat-table">
				<thead>
					<tr>
						{columns.map((col) => (
							<th key={col.key} style={col.align === 'right' ? { textAlign: 'right' } : undefined}>
								{col.label}
							</th>
						))}
					</tr>
				</thead>
				<tbody>
					{rows.map((row, i) => {
						const highlighted = highlightKey != null && row[rowKey] === highlightKey;
						return (
							<tr key={row[rowKey] ?? i} style={highlighted ? { background: 'var(--surface-raised)' } : undefined}>
								{columns.map((col, c) => {
									const raw = col.render ? col.render(row, i) : row[col.key];
									const numeric = c > 0 && col.align !== 'left';
									return (
										<td
											key={col.key}
											style={{
												textAlign: col.align === 'right' || numeric ? 'right' : 'left',
												fontVariantNumeric: numeric ? 'tabular-nums' : undefined,
												color: highlighted && c === 0 ? 'var(--star-400)' : undefined,
												fontWeight: c === 0 ? 600 : undefined
											}}
										>
											{raw}
										</td>
									);
								})}
							</tr>
						);
					})}
				</tbody>
			</table>
		</div>
	);
}
