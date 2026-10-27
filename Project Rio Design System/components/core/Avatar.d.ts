export interface AvatarProps {
	/** Player name — first two alphanumerics become the fallback initials. */
	name?: string;
	/** Optional sprite/photo URL. Falls back to initials when absent. */
	src?: string | null;
	/** Diameter in px. Default 36. */
	size?: number;
	style?: React.CSSProperties;
}

/** Round player avatar: character sprite or initials on Rio red. */
export function Avatar(props: AvatarProps): JSX.Element;
