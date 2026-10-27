// Charts identify characters by their own icons — no class color coding.

// Diverging pair for above/below-expectation values (matches the site's
// win=emerald / loss=red convention) around a neutral night midpoint.
export const DIVERGING = { positive: '#0c9d6e', negative: '#ff3d4e', neutral: '#2b2b40' };

export function pct(value: number, digits = 1): string {
	return `${(value * 100).toFixed(digits)}%`;
}

export function signedPp(value: number, digits = 1): string {
	const pp = value * 100;
	return `${pp >= 0 ? '+' : ''}${pp.toFixed(digits)} pp`;
}

export function signedNum(value: number, digits = 1): string {
	return `${value >= 0 ? '+' : ''}${value.toFixed(digits)}`;
}
