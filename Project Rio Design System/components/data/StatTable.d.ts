import type { ReactNode } from 'react';

export interface StatColumn {
	/** Field key on each row (also the React key). */
	key: string;
	/** Header label. */
	label: string;
	/** Force alignment. First column defaults left; others right. */
	align?: 'left' | 'right';
	/** Custom cell renderer. */
	render?: (row: Record<string, unknown>, index: number) => ReactNode;
}

/**
 * The shared box-score / leaderboard table — uppercase heads, hover wash, tabular numerals.
 */
export interface StatTableProps {
	columns: StatColumn[];
	rows: Array<Record<string, unknown>>;
	/** rowKey value of a row to highlight (gold label + raised bg). */
	highlightKey?: string | number;
	/** Field used as the unique row key. Default 'id'. */
	rowKey?: string;
}

export function StatTable(props: StatTableProps): JSX.Element;
