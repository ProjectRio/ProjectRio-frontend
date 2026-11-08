import type { ReactNode } from 'react';

/**
 * The primary call-to-action in Project Rio — angled clip-path, uppercase Rajdhani.
 */
export interface ButtonProps {
	/** Solid Rio red (primary) or outlined ghost (secondary). */
	variant?: 'primary' | 'secondary';
	/** Padding/size preset. */
	size?: 'sm' | 'md' | 'lg';
	/** Optional leading icon image URL (rendered pixelated). */
	icon?: string | null;
	/** Render as a different element, e.g. 'a' for links. */
	as?: 'button' | 'a';
	className?: string;
	children?: ReactNode;
	[key: string]: unknown;
}

export function Button(props: ButtonProps): JSX.Element;
