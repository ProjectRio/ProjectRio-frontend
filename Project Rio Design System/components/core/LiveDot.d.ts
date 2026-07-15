import type { ReactNode } from 'react';

export interface LiveDotProps {
	/** Diameter in px. Default 10. */
	size?: number;
	style?: React.CSSProperties;
}

export interface LiveLabelProps {
	children?: ReactNode;
	style?: React.CSSProperties;
}

/** Pulsing red dot signaling a live game. */
export function LiveDot(props: LiveDotProps): JSX.Element;
/** Uppercase "Live" label with a pulsing dot. */
export function LiveLabel(props: LiveLabelProps): JSX.Element;
