export interface LadderRow {
	username: string;
	/** ELO rating — drives the tier chip. */
	rating: number;
	wins: number;
	losses: number;
}

/**
 * Ranked ladder leaderboard: rank, tier chip, player, rating, record, win %.
 */
export interface LadderTableProps {
	rows: LadderRow[];
	/** Username to highlight (gold) — e.g. the signed-in player. */
	highlightUser?: string;
}

export function LadderTable(props: LadderTableProps): JSX.Element;
