import React from 'react';

/**
 * Small uppercase status pill. Matches the app's Badge color set.
 */
export function Badge({ color = 'red', children, className = '', style = {}, ...props }) {
	const colors = {
		red: { bg: 'rgb(230 0 18 / 0.15)', fg: 'var(--rio-300)', bd: 'rgb(230 0 18 / 0.4)' },
		gold: { bg: 'rgb(245 187 0 / 0.15)', fg: 'var(--star-400)', bd: 'rgb(245 187 0 / 0.4)' },
		gray: { bg: 'rgb(43 43 64 / 0.5)', fg: 'var(--fog-300)', bd: 'var(--night-600)' },
		green: { bg: 'rgb(16 185 129 / 0.15)', fg: 'var(--emerald-300)', bd: 'rgb(16 185 129 / 0.4)' }
	};
	const c = colors[color] || colors.red;
	return (
		<span
			className={className}
			style={{
				display: 'inline-flex',
				alignItems: 'center',
				gap: '0.25rem',
				borderRadius: 'var(--radius-sm)',
				border: `1px solid ${c.bd}`,
				background: c.bg,
				color: c.fg,
				padding: '0.125rem 0.5rem',
				fontFamily: 'var(--font-display)',
				fontSize: 'var(--text-xs)',
				fontWeight: 600,
				textTransform: 'uppercase',
				letterSpacing: 'var(--tracking-wider)',
				...style
			}}
			{...props}
		>
			{children}
		</span>
	);
}
