export interface TierBadgeProps {
	/** Explicit tier label, e.g. "Star II". Takes priority over rating. */
	tier?: string;
	/** ELO rating; mapped to a tier label when `tier` is omitted. */
	rating?: number;
	className?: string;
	style?: React.CSSProperties;
}

/** Ranked-ladder tier chip (Shell → Legend) colored to the Rio tier palette. */
export function TierBadge(props: TierBadgeProps): JSX.Element;
/** Convert a numeric ELO rating to its tier label. */
export function ratingToTier(rating: number): string;
