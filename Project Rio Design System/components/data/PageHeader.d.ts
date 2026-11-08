import type { ReactNode } from 'react';

export interface PageHeaderProps {
	/** Uppercase rio-400 eyebrow above the title. */
	kicker?: string;
	/** Page title (uppercase Rajdhani). */
	title: string;
	/** Trailing actions — buttons, filters, links. */
	children?: ReactNode;
}

/** Standard page title block used at the top of every Rio view. */
export function PageHeader(props: PageHeaderProps): JSX.Element;
