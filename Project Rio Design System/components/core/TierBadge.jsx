import React from 'react';

const TIERS = ['Shell', 'Mushroom', 'Flower', 'Star', 'Special', 'Legend'];
const DIVISIONS = ['V', 'IV', 'III', 'II', 'I'];
const ROMAN = { I: 1, II: 2, III: 3, IV: 4, V: 5 };

const TIER_COLORS = {
	Shell: ['#8bbf8c', '#a4cca5', '#bbdfba', '#d7ecd1', '#e6f0e1'],
	Mushroom: ['#ff4949', '#ff5a5a', '#f97979', '#ff8989', '#ffa9a9'],
	Flower: ['#ff6700', '#fb7216', '#ff8532', '#fd8f45', '#ffa162'],
	Star: ['#fff25c', '#fff476', '#fff68f', '#fff8a9', '#fffac2'],
	Special: ['#775587', '#8c679c', '#9d7bae', '#bf9ece', '#e0c5f0'],
	Legend: ['#af9146', '#c5a34f', '#dbb658', '#debd68', '#e2c479']
};

/** Map an ELO rating to its tier label, e.g. 1240 -> "Flower III". */
export function ratingToTier(rating) {
	if (rating < 600) return 'Shell V';
	if (rating >= 2000) return 'Legend I';
	const step = Math.floor((rating - 600) / 50) + 1;
	return `${TIERS[Math.floor(step / 5)]} ${DIVISIONS[step % 5]}`;
}

function tierColor(label) {
	const [name, div] = label.split(' ');
	return (TIER_COLORS[name] || TIER_COLORS.Shell)[(ROMAN[div] ?? 1) - 1];
}

/**
 * Ranked-tier chip. Pass either a `tier` label ("Star II") or a numeric
 * `rating` (mapped via ratingToTier). Colored to the ladder palette.
 */
export function TierBadge({ tier, rating, className = '', style = {}, ...props }) {
	const label = tier ?? ratingToTier(rating ?? 0);
	const color = tierColor(label);
	return (
		<span
			className={className}
			style={{
				display: 'inline-block',
				borderRadius: 'var(--radius-sm)',
				padding: '0.125rem 0.5rem',
				fontFamily: 'var(--font-display)',
				fontSize: 'var(--text-xs)',
				fontWeight: 700,
				textTransform: 'uppercase',
				letterSpacing: 'var(--tracking-wider)',
				backgroundColor: `${color}22`,
				color,
				border: `1px solid ${color}55`,
				...style
			}}
			{...props}
		>
			{label}
		</span>
	);
}
