import type { ReactNode } from 'react';

export interface InputProps {
	/** Uppercase field label above the control. */
	label?: string;
	id?: string;
	className?: string;
	style?: React.CSSProperties;
	[key: string]: unknown;
}

export interface SelectProps extends InputProps {
	children?: ReactNode;
}

/** Labeled text input with the Rio focus ring (rio border + soft red glow). */
export function Input(props: InputProps): JSX.Element;
/** Native select styled to match Input. */
export function Select(props: SelectProps): JSX.Element;
