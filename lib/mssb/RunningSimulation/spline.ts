// Port of the 2D spline helpers in src/game/math/spline.c (mssb-dtk), single precision.
// spline2D_build parameterises the points by normalised chord length and solves a natural cubic spline;
// spline_evaluate reads a value back; spline2D_evaluatePoints ties them together.

const F = Math.fround;

/** spline_computeSecondDerivatives */
function secondDerivatives(t: number[], v: number[], n: number): number[] {
	const c = new Array<number>(n).fill(0);
	const h: number[] = [];
	const s: number[] = [];
	for (let i = 0; i < n - 1; i++) {
		h[i] = F(t[i + 1] - t[i]);
		s[i + 1] = F(F(v[i + 1] - v[i]) / h[i]);
	}
	c[1] = F(F(s[2] - s[1]) - F(h[0] * c[0]));
	s[1] = F(2 * F(t[2] - t[0]));
	for (let i = 1; i < n - 2; i++) {
		const f = F(h[i] / s[i]);
		c[i + 1] = F(F(s[i + 2] - s[i + 1]) - F(f * c[i]));
		s[i + 1] = F(F(2 * F(t[i + 2] - t[i])) - F(f * h[i]));
	}
	c[n - 2] = F(c[n - 2] - F(h[n - 2] * c[n - 1]));
	for (let i = n - 2; i > 0; i--) c[i] = F(F(c[i] - F(h[i] * c[i + 1])) / s[i]);
	return c;
}

/** spline_evaluate */
function evaluateAxis(d: number, t: number[], v: number[], c: number[], n: number): number {
	let seg = 0;
	let end = n - 1;
	while (seg < end) {
		const half = (seg + end) >> 1;
		if (t[half] < d) seg = half + 1;
		else end = half;
	}
	if (seg > 0) seg--;
	const lt = F(d - t[seg]);
	const L = F(t[seg + 1] - t[seg]);
	return F(
		v[seg] +
			lt * (lt * (3 * c[seg] + (lt * (c[seg + 1] - c[seg])) / L) + ((v[seg + 1] - v[seg]) / L - L * (2 * c[seg] + c[seg + 1])))
	);
}

/** spline2D_build: returns an evaluator for the spline through points, taking t in 0..1 (by chord length). */
export function makeSpline(points: [number, number][]): (t: number) => [number, number] {
	const n = points.length;
	const xs = points.map((p) => F(p[0]));
	const zs = points.map((p) => F(p[1]));
	const ts = [0];
	for (let i = 1; i < n; i++) ts[i] = F(ts[i - 1] + F(Math.hypot(xs[i] - xs[i - 1], zs[i] - zs[i - 1])));
	for (let i = 1; i < n; i++) ts[i] = F(ts[i] / ts[n - 1]);
	const cx = secondDerivatives(ts, xs, n);
	const cz = secondDerivatives(ts, zs, n);
	return (t) => [evaluateAxis(t, ts, xs, cx, n), evaluateAxis(t, ts, zs, cz, n)];
}

/** spline2D_evaluatePoints: position at parameter t along a spline through points. */
export function splinePoint(t: number, points: [number, number][]): [number, number] {
	return makeSpline(points)(t);
}
