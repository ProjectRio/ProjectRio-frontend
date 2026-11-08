import React from 'react';

/**
 * Player avatar — initials on Rio red, or a character sprite image.
 */
export function Avatar({ name = '', src = null, size = 36, style = {}, ...props }) {
	const initials = name.replace(/[^a-zA-Z0-9]/g, '').slice(0, 2).toUpperCase();
	return (
		<span
			style={{
				display: 'inline-flex',
				alignItems: 'center',
				justifyContent: 'center',
				width: size,
				height: size,
				borderRadius: '50%',
				overflow: 'hidden',
				backgroundColor: 'var(--rio-500)',
				color: '#fff',
				fontFamily: 'var(--font-display)',
				fontWeight: 700,
				fontSize: size * 0.4,
				textTransform: 'uppercase',
				flexShrink: 0,
				...style
			}}
			{...props}
		>
			{src ? (
				<img
					src={src}
					alt={name}
					style={{ width: '100%', height: '100%', objectFit: 'cover', imageRendering: 'pixelated' }}
				/>
			) : (
				initials
			)}
		</span>
	);
}
