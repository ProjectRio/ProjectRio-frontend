import React from 'react';

/** Page title block — uppercase Rajdhani title with optional kicker + actions. */
export function PageHeader({ kicker, title, children }) {
	return (
		<div
			style={{
				marginBottom: 'var(--space-8)',
				display: 'flex',
				flexWrap: 'wrap',
				alignItems: 'flex-end',
				justifyContent: 'space-between',
				gap: 'var(--space-4)'
			}}
		>
			<div>
				{kicker && <p className="kicker">{kicker}</p>}
				<h1 style={{ marginTop: '0.25rem', fontSize: 'var(--text-4xl)', textTransform: 'uppercase' }}>{title}</h1>
			</div>
			{children && <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>{children}</div>}
		</div>
	);
}
