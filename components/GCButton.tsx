/**
 * GameCube controller glyphs. Shapes and colours are lifted from the gc-overlay
 * controller drawing (A circle, B circle, X/Y beans, Z pill, octagon gate), so
 * a prompt on the site matches the overlay on stream.
 */
type Button = 'a' | 'b' | 'x' | 'y' | 'z' | 'start' | 'stick' | 'c';

const COLORS: Record<Button, { ink: string; idle: string }> = {
	a: { ink: '#00E196', idle: '#0D2B22' },
	b: { ink: '#E63E3E', idle: '#2E1414' },
	x: { ink: '#C8C8C8', idle: '#1E1E24' },
	y: { ink: '#C8C8C8', idle: '#1E1E24' },
	z: { ink: '#B36CD6', idle: '#241436' },
	start: { ink: '#C8C8C8', idle: '#1E1E24' },
	stick: { ink: '#C8C8C8', idle: '#1E1E24' },
	c: { ink: '#D4A017', idle: '#2B2209' }
};

const OCTAGON = '94,50 81.1,81.1 50,94 18.9,81.1 6,50 18.9,18.9 50,6 81.1,18.9';

export default function GCButton({
	button,
	size = 22,
	pressed = false,
	className = ''
}: {
	button: Button;
	size?: number;
	/** Filled, as the overlay draws a held button. */
	pressed?: boolean;
	className?: string;
}) {
	const { ink, idle } = COLORS[button];
	const fill = pressed ? ink : idle;
	const label = pressed ? '#101010' : ink;
	const shape = { fill, stroke: ink, strokeWidth: 7, strokeLinejoin: 'round' as const };
	const text = {
		fill: label,
		fontFamily: 'var(--font-display)',
		fontWeight: 700,
		textAnchor: 'middle' as const,
		dominantBaseline: 'central' as const
	};

	let body;
	let viewBox = '0 0 100 100';
	switch (button) {
		case 'a':
		case 'b':
			body = (
				<>
					<circle cx="50" cy="50" r="44" {...shape} />
					<text x="50" y="52" fontSize="58" {...text}>
						{button.toUpperCase()}
					</text>
				</>
			);
			break;
		case 'start':
			body = (
				<>
					<circle cx="50" cy="50" r="34" {...shape} />
					<text x="50" y="52" fontSize="30" {...text}>
						ST
					</text>
				</>
			);
			break;
		case 'z':
			viewBox = '0 0 180 100';
			body = (
				<>
					<rect x="6" y="6" width="168" height="88" rx="44" {...shape} />
					<text x="90" y="52" fontSize="58" {...text}>
						Z
					</text>
				</>
			);
			break;
		case 'y':
			viewBox = '336 40 86 60';
			body = (
				<>
					<path
						d="M 349.98 64.54 A 78 78 0 0 1 400.72 48.05 A 16 16 0 0 1 399.61 80.03 A 46 46 0 0 0 369.68 89.75 A 16 16 0 0 1 349.98 64.54 Z"
						{...shape}
						strokeWidth={4}
					/>
					<text x="378.8" y="68" fontSize="22" {...text}>
						Y
					</text>
				</>
			);
			break;
		case 'x':
			viewBox = '428 76 54 84';
			body = (
				<>
					<path
						d="M 465.55 87.0 A 78 78 0 0 1 474.82 139.54 A 16 16 0 0 1 443.3 133.99 A 46 46 0 0 0 437.84 103.0 A 16 16 0 0 1 465.55 87.0 Z"
						{...shape}
						strokeWidth={4}
					/>
					<text x="458" y="116" fontSize="22" {...text}>
						X
					</text>
				</>
			);
			break;
		case 'stick':
		case 'c':
			body = (
				<>
					<polygon points={OCTAGON} {...shape} strokeWidth={6} />
					<circle cx="50" cy="50" r="24" fill={button === 'c' ? '#FFD43B' : '#FFFFFF'} stroke="#000" strokeWidth="4" />
				</>
			);
			break;
	}

	const [, , w, h] = viewBox.split(' ').map(Number);
	return (
		<svg
			viewBox={viewBox}
			height={size}
			width={(size * w) / h}
			className={`inline-block flex-none align-[-0.25em] ${className}`}
			role="img"
			aria-label={`${button === 'c' ? 'C-stick' : button === 'stick' ? 'Control stick' : button.toUpperCase()} button`}
		>
			{body}
		</svg>
	);
}
