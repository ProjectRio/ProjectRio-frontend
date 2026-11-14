import type { Primitive } from './types';

/** Gecko code type for a direct RAM write of each width. */
const TYPE_CODE: Record<Primitive, number> = { byte: 0x00, short: 0x02, word: 0x04, float: 0x04 };

const BASE_ADDRESS = 0x80000000;

function hex32(value: number): string {
	return (value >>> 0).toString(16).padStart(8, '0').toUpperCase();
}

/** Encode a value as the second word of a Gecko write code. */
export function encodeValue(value: number, type: Primitive): string {
	switch (type) {
		case 'float': {
			const view = new DataView(new ArrayBuffer(4));
			view.setFloat32(0, value, false);
			return hex32(view.getUint32(0, false));
		}
		case 'word':
			return hex32(Math.trunc(value) & 0xffffffff);
		case 'short':
			// Two's complement: -110 → 0xFF92, which is how the game reads signed shorts.
			return hex32(Math.trunc(value) & 0xffff);
		case 'byte':
			return hex32(Math.trunc(value) & 0xff);
	}
}

/** Encode the first word of a Gecko write code: type in the top byte, 25-bit offset from 0x80000000. */
export function encodeAddress(address: number, type: Primitive): string {
	if (address < BASE_ADDRESS || address >= BASE_ADDRESS + 0x02000000) {
		throw new RangeError(`Address 0x${address.toString(16)} is outside the Gecko-writable range`);
	}
	return hex32((TYPE_CODE[type] << 24) | (address - BASE_ADDRESS));
}

export function geckoLine(address: number, type: Primitive, value: number): string {
	return `${encodeAddress(address, type)} ${encodeValue(value, type)}`;
}

export interface CodeWrite {
	address: number;
	type: Primitive;
	value: number;
}

/** One Gecko line per write, ordered by address. */
export function geckoLines(writes: CodeWrite[]): string[] {
	return [...writes].sort((a, b) => a.address - b.address).map((w) => geckoLine(w.address, w.type, w.value));
}

/**
 * Wrap lines in the `.ini` block format used by Dolphin and the ProjectRio-Modding repo:
 *
 *   $Code Name [Author]
 *   0034E9A0 00000082
 *   *Optional description line
 */
export function formatIni(opts: { name: string; author?: string; description?: string; lines: string[] }): string {
	const name = opts.name.trim() || 'Untitled Code';
	const author = opts.author?.trim();
	const out = [author ? `$${name} [${author}]` : `$${name}`, ...opts.lines];
	for (const line of (opts.description ?? '').split(/\r?\n/)) {
		if (line.trim()) out.push(`*${line.trim()}`);
	}
	return out.join('\n');
}
