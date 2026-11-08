import React from 'react';

/** Standard dark card surface. Use `glow` for the red hover bloom. */
export function Panel({ glow = false, className = '', style = {}, children, ...props }) {
	return (
		<div className={`panel ${glow ? 'panel-glow' : ''} ${className}`} style={style} {...props}>
			{children}
		</div>
	);
}

/** Uppercase header bar for a Panel, with an optional right-aligned action. */
export function PanelHeader({ title, action = null, className = '', ...props }) {
	return (
		<div className={`panel-header ${className}`} {...props}>
			<span>{title}</span>
			{action}
		</div>
	);
}
