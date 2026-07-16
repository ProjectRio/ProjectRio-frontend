// Compares the TypeScript batting simulation against golden vectors produced
// by the reference Python implementation. See scripts/gen-batting-golden.py.
import { readFileSync } from 'node:fs';
import { hitBall } from '../lib/mssb/BattingSimulation/calcBatting';

const goldenPath = process.argv[2] ?? '/tmp/batting-golden.json';
const cases: { inputs: any; output: any }[] = JSON.parse(readFileSync(goldenPath, 'utf8'));

const REL_TOL = 1e-9;
const ABS_TOL = 1e-9;

function numbersClose(a: number, b: number): boolean {
	if (Number.isNaN(a) && Number.isNaN(b)) return true;
	const diff = Math.abs(a - b);
	return diff <= ABS_TOL || diff <= REL_TOL * Math.max(Math.abs(a), Math.abs(b));
}

function diff(a: any, b: any, path: string): string | null {
	if (typeof a === 'number' && typeof b === 'number') {
		return numbersClose(a, b) ? null : `${path}: ${a} != ${b}`;
	}
	if (Array.isArray(a) && Array.isArray(b)) {
		if (a.length !== b.length) return `${path}: length ${a.length} != ${b.length}`;
		for (let i = 0; i < a.length; i++) {
			const d = diff(a[i], b[i], `${path}[${i}]`);
			if (d) return d;
		}
		return null;
	}
	if (a && b && typeof a === 'object' && typeof b === 'object') {
		const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
		for (const key of keys) {
			const d = diff(a[key], b[key], `${path}.${key}`);
			if (d) return d;
		}
		return null;
	}
	if (a !== b && !(a == null && b == null)) return `${path}: ${JSON.stringify(a)} != ${JSON.stringify(b)}`;
	return null;
}

let failures = 0;
let errAgreements = 0;
cases.forEach((testCase, index) => {
	const expected = testCase.output;
	const actual = hitBall(testCase.inputs);

	// Error paths only need to agree that they errored — messages differ by language.
	if (expected.err) {
		if (!actual.err) {
			failures++;
			console.log(`case ${index}: python errored (${expected.err}) but TS returned a result`);
		} else {
			errAgreements++;
		}
		return;
	}
	if (actual.err) {
		failures++;
		console.log(`case ${index}: TS errored (${actual.err}) but python returned a result`);
		return;
	}

	const d = diff(expected, actual, '$');
	if (d) {
		failures++;
		if (failures <= 20) {
			console.log(`case ${index}: ${d}`);
			if (failures === 1) {
				console.log('  inputs:', JSON.stringify(testCase.inputs));
			}
		}
	}
});

console.log(
	`${cases.length} cases: ${cases.length - failures} passed, ${failures} failed (${errAgreements} agreed error paths)`
);
process.exit(failures === 0 ? 0 : 1);
