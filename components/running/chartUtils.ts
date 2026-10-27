// Shared helpers for the running-analysis SVG charts.

/** Series colors, validated for colorblind separation and contrast on the night-900 surface. */
export const SERIES = {
	blue: '#3987e5',
	orange: '#d95926',
	aqua: '#199e70',
	gold: '#c98500'
} as const;

export const AXIS_TEXT = 'var(--color-fog-500)';
export const AXIS_LABEL = 'var(--color-fog-300)';
export const GRID = 'var(--color-night-700)';

/** Round tick values covering [a, b] in about n steps. */
export function niceTicks(a: number, b: number, n: number): number[] {
	const step0 = (b - a) / n;
	const mag = Math.pow(10, Math.floor(Math.log10(step0)));
	const step = [1, 2, 2.5, 5, 10].map((x) => x * mag).find((x) => x >= step0) ?? step0;
	const out: number[] = [];
	for (let v = Math.ceil(a / step) * step; v <= b + 1e-9; v += step) out.push(Number(v.toFixed(6)));
	return out;
}

export interface Margins {
	l: number;
	r: number;
	t: number;
	b: number;
}

export function makeScales(W: number, H: number, m: Margins, x0: number, x1: number, y0: number, y1: number) {
	return {
		X: (v: number) => m.l + ((v - x0) / (x1 - x0)) * (W - m.l - m.r),
		Y: (v: number) => H - m.b - ((v - y0) / (y1 - y0)) * (H - m.t - m.b)
	};
}

/** Converts a pointer event to SVG viewBox x. */
export function pointerToViewX(event: React.PointerEvent<SVGElement>, W: number): number {
	const svg = (event.currentTarget as SVGElement).ownerSVGElement ?? (event.currentTarget as SVGSVGElement);
	const r = svg.getBoundingClientRect();
	return ((event.clientX - r.left) * W) / r.width;
}
