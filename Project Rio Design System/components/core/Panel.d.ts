import type { ReactNode } from 'react';

/**
 * The standard Rio card surface — night-900 on a night-700 border, 12px radius.
 */
export interface PanelProps {
	/** Enable the red panel-glow border + bloom on hover. */
	glow?: boolean;
	className?: string;
	style?: React.CSSProperties;
	children?: ReactNode;
}

export interface PanelHeaderProps {
	/** Header label (rendered uppercase Rajdhani). */
	title: string;
	/** Optional right-aligned node (link, badge, button). */
	action?: ReactNode;
	className?: string;
}

export function Panel(props: PanelProps): JSX.Element;
/** Uppercase header bar for a Panel. */
export function PanelHeader(props: PanelHeaderProps): JSX.Element;
