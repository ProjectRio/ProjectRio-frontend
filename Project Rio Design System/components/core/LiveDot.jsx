import React from 'react';

/** Pulsing red "live" indicator dot. */
export function LiveDot({ size = 10, style = {}, ...props }) {
	return (
		<span style={{ position: 'relative', display: 'inline-flex', width: size, height: size, ...style }} {...props}>
			<span
				style={{
					position: 'absolute',
					display: 'inline-flex',
					width: '100%',
					height: '100%',
					borderRadius: '50%',
					backgroundColor: 'var(--rio-400)',
					opacity: 0.75,
					animation: 'rio-ping 1s cubic-bezier(0,0,0.2,1) infinite'
				}}
			/>
			<span
				style={{
					position: 'relative',
					display: 'inline-flex',
					width: size,
					height: size,
					borderRadius: '50%',
					backgroundColor: 'var(--rio-500)'
				}}
			/>
		</span>
	);
}

/** Inline "LIVE — Top 5" style label with a pulsing dot. */
export function LiveLabel({ children = 'Live', style = {}, ...props }) {
	return (
		<span
			style={{
				display: 'inline-flex',
				alignItems: 'center',
				gap: '0.5rem',
				fontFamily: 'var(--font-display)',
				fontSize: 'var(--text-xs)',
				fontWeight: 600,
				textTransform: 'uppercase',
				letterSpacing: 'var(--tracking-wider)',
				color: 'var(--rio-400)',
				...style
			}}
			{...props}
		>
			<LiveDot />
			{children}
		</span>
	);
}
