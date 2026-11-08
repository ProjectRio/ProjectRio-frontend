export interface GameTeam {
	/** Player username. */
	user: string;
	/** Runs scored. */
	score: number;
	/** Team/captain sprite URL (pixelated). */
	sprite?: string;
	/** ELO change for the game. */
	elo?: { before: number; after: number };
}

/**
 * Completed-game score card — two team rows, winner emphasis, mode + box-score footer.
 */
export interface GameScoreCardProps {
	away: GameTeam;
	home: GameTeam;
	/** Status line, e.g. "Final" or "Final / 7". */
	status?: string;
	/** Relative time, e.g. "12m ago". */
	timeAgo?: string;
	/** Game mode label (gray badge). */
	mode?: string;
	/** Stadium name. */
	stadium?: string;
	/** Click handler for the Box Score link. */
	onBoxScore?: () => void;
}

export function GameScoreCard(props: GameScoreCardProps): JSX.Element;
