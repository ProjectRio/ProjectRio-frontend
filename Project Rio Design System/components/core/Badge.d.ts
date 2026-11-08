import type { ReactNode } from 'react';

export interface BadgeProps {
	/** Semantic color. red = mode/brand, gold = highlight, gray = neutral, green = win/positive. */
	color?: 'red' | 'gold' | 'gray' | 'green';
	className?: string;
	style?: React.CSSProperties;
	children?: ReactNode;
}

/** Compact uppercase status pill for game modes, tags, and states. */
export function Badge(props: BadgeProps): JSX.Element;
