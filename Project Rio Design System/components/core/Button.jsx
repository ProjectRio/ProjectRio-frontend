import React from 'react';

/**
 * Project Rio button — angled clip-path, uppercase Rajdhani.
 * Primary = solid Rio red; secondary = outlined ghost.
 */
export function Button({
	variant = 'primary',
	size = 'md',
	icon = null,
	as = 'button',
	className = '',
	children,
	...props
}) {
	const sizes = {
		sm: { padding: '0.4rem 1rem', fontSize: '0.8125rem' },
		md: { padding: '0.625rem 1.5rem', fontSize: '0.875rem' },
		lg: { padding: '0.8rem 2rem', fontSize: '1rem' }
	};
	const Tag = as;
	return (
		<Tag
			className={`${variant === 'secondary' ? 'btn-secondary' : 'btn-primary'} ${className}`}
			style={sizes[size] || sizes.md}
			{...props}
		>
			{icon && (
				<img
					src={icon}
					alt=""
					aria-hidden="true"
					style={{ width: '1.1em', height: '1.1em', objectFit: 'contain', imageRendering: 'pixelated' }}
				/>
			)}
			{children}
		</Tag>
	);
}
