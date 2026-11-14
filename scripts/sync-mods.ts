/**
 * Sync the mod catalog against the MSSB decompilation that ProjectRio-Modding pins as its `Decomp`
 * submodule.
 *
 *   npm run sync-mods                                # pinned ProjectRio-Modding commit → its decomp commit
 *   npm run sync-mods -- --ref LittleCoaks-Mods      # another ProjectRio-Modding ref
 *   npm run sync-mods -- --decomp ../mssb-dtk        # read a local decomp checkout instead of downloading
 *
 * For every entry in lib/mods/catalog.ts this resolves the referenced symbol — address from the
 * decomp's `config/GYQE01/** /symbols.txt` (REL sections rebased the same way the decomp's own
 * tools do), type and layout from the `extern` declaration and struct definitions under `include/` —
 * and writes lib/mods/generated/symbols.json. Commit that file: the site never reads the decomp.
 *
 * Set GITHUB_TOKEN to raise the GitHub API rate limit when syncing often.
 */
import { existsSync, readFileSync, readdirSync, statSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { gunzipSync } from 'node:zlib';
import { MODDING_SOURCE, catalog } from '../lib/mods/catalog';
import {
	isSymbolSource,
	type GeneratedAxis,
	type GeneratedConstant,
	type GeneratedElem,
	type GeneratedEnum,
	type GeneratedField,
	type GeneratedLayout,
	type GeneratedLeaf,
	type GeneratedSymbols,
	type Primitive,
	type Source,
	type SymbolSource
} from '../lib/mods/types';

// ---------------------------------------------------------------------------
// Decomp file access: a local checkout or a GitHub tarball
// ---------------------------------------------------------------------------

interface DecompFiles {
	ref: string;
	repo: string;
	read(path: string): string | undefined;
	list(prefix: string): string[];
}

function arg(name: string): string | undefined {
	const i = process.argv.indexOf(name);
	return i >= 0 ? process.argv[i + 1] : undefined;
}

function localDecomp(dir: string): DecompFiles {
	if (!existsSync(join(dir, 'include'))) throw new Error(`${dir} is not a decomp checkout (no include/ directory)`);
	let ref = 'local';
	try {
		const head = readFileSync(join(dir, '.git', 'HEAD'), 'utf8').trim();
		if (/^[0-9a-f]{40}$/.test(head)) ref = head;
	} catch {
		// Not a git checkout, or a submodule with a gitdir file; keep 'local'.
	}
	const walk = (sub: string): string[] => {
		const out: string[] = [];
		for (const entry of readdirSync(join(dir, sub))) {
			const path = sub ? `${sub}/${entry}` : entry;
			if (statSync(join(dir, path)).isDirectory()) out.push(...walk(path));
			else out.push(path);
		}
		return out;
	};
	return {
		ref,
		repo: `local:${relative(process.cwd(), dir) || '.'}`,
		read: (path) => (existsSync(join(dir, path)) ? readFileSync(join(dir, path), 'utf8') : undefined),
		list: (prefix) => (existsSync(join(dir, prefix)) ? walk(prefix) : [])
	};
}

async function github(url: string, accept = 'application/vnd.github+json'): Promise<Response> {
	const headers: Record<string, string> = { Accept: accept, 'User-Agent': 'projectrio-frontend-sync-mods' };
	if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
	const response = await fetch(url, { headers });
	if (!response.ok) throw new Error(`${url} → ${response.status} ${response.statusText}`);
	return response;
}

function cString(buffer: Buffer, start: number, length: number): string {
	const slice = buffer.subarray(start, start + length);
	const end = slice.indexOf(0);
	return slice.subarray(0, end < 0 ? length : end).toString('utf8');
}

/** Minimal ustar/pax reader, enough for GitHub's codeload tarballs. */
function* tarEntries(tar: Buffer): Generator<{ path: string; data: Buffer }> {
	let offset = 0;
	let paxPath: string | undefined;
	let longName: string | undefined;
	while (offset + 512 <= tar.length) {
		const header = tar.subarray(offset, offset + 512);
		if (header.every((byte) => byte === 0)) break;
		const size = parseInt(cString(header, 124, 12).trim() || '0', 8);
		const type = String.fromCharCode(header[156]);
		const data = tar.subarray(offset + 512, offset + 512 + size);
		offset += 512 + Math.ceil(size / 512) * 512;
		if (type === 'x') {
			for (const line of data.toString('utf8').split('\n')) {
				const m = /^\d+ path=(.*)$/.exec(line);
				if (m) paxPath = m[1];
			}
			continue;
		}
		if (type === 'L') {
			longName = data.toString('utf8').replace(/\0+$/, '');
			continue;
		}
		const prefix = cString(header, 345, 155);
		const name = cString(header, 0, 100);
		const path = paxPath ?? longName ?? (prefix ? `${prefix}/${name}` : name);
		paxPath = longName = undefined;
		if (type === '0' || type === '\0') yield { path, data };
	}
}

async function remoteDecomp(moddingRef: string): Promise<{ files: DecompFiles; moddingCommit: string }> {
	const { repo } = MODDING_SOURCE;
	const moddingCommit = await (await github(`https://api.github.com/repos/${repo}/commits/${moddingRef}`, 'application/vnd.github.sha')).text();
	const submodule = (await (await github(`https://api.github.com/repos/${repo}/contents/${MODDING_SOURCE.submodule}?ref=${moddingCommit}`)).json()) as {
		type: string;
		sha: string;
		submodule_git_url: string;
	};
	if (submodule.type !== 'submodule') throw new Error(`${MODDING_SOURCE.submodule} is not a submodule at ${repo}@${moddingRef}`);
	const decompRepo = /github\.com[/:]([^/]+\/[^/.]+)/.exec(submodule.submodule_git_url)?.[1];
	if (!decompRepo) throw new Error(`Cannot read a GitHub repo from submodule url ${submodule.submodule_git_url}`);

	const tarUrl = `https://codeload.github.com/${decompRepo}/tar.gz/${submodule.sha}`;
	console.log(`Downloading ${tarUrl}`);
	const gz = Buffer.from(await (await github(tarUrl, '*/*')).arrayBuffer());
	const files = new Map<string, Buffer>();
	for (const entry of tarEntries(gunzipSync(gz))) {
		const path = entry.path.split('/').slice(1).join('/'); // strip "<repo>-<sha>/"
		if (path.startsWith('config/') || path.startsWith('include/')) files.set(path, entry.data);
	}
	console.log(`Decomp ${decompRepo}@${submodule.sha.slice(0, 10)}: ${files.size} files under config/ and include/`);
	return {
		moddingCommit,
		files: {
			ref: submodule.sha,
			repo: decompRepo,
			read: (path) => files.get(path)?.toString('utf8'),
			list: (prefix) => [...files.keys()].filter((p) => p.startsWith(prefix + '/'))
		}
	};
}

// ---------------------------------------------------------------------------
// Symbol table (config/GYQE01/** /symbols.txt) with REL sections rebased to RAM
// ---------------------------------------------------------------------------

const BUILD = 'GYQE01';

/** The only measured numbers; everything else is derived exactly as tools/cvt_rel_addr_to_mapped_addr.py does. */
const REL_LOAD: Record<string, { text: number; bss?: number }> = {
	game: { text: 0x8063f094, bss: 0x808610e0 },
	menus: { text: 0x8063f094 }
};
const REL_EXPECTED: Record<string, Record<string, number>> = { game: { rodata: 0x807ad440, data: 0x807b1600 } };
const SECTION_ORDER = ['text', 'ctors', 'dtors', 'rodata', 'data'];

interface Sym {
	name: string;
	address: number;
	size?: number;
	module: string;
	section: string;
}

function sectionBases(rel: string, splits: string, symbols: string): Record<string, number> {
	const load = REL_LOAD[rel];
	const extents: Record<string, number> = { ctors: 4, dtors: 4 };
	for (const m of splits.matchAll(/\.(\w+)\s+start:0x([0-9A-Fa-f]+)\s+end:0x([0-9A-Fa-f]+)/g)) {
		extents[m[1]] = Math.max(extents[m[1]] ?? 0, parseInt(m[3], 16));
	}
	for (const m of symbols.matchAll(/^\s*\w+\s*=\s*\.(\w+):0x([0-9A-Fa-f]+);.*?size:0x([0-9A-Fa-f]+)/gm)) {
		extents[m[1]] = Math.max(extents[m[1]] ?? 0, parseInt(m[2], 16) + parseInt(m[3], 16));
	}
	const aligns: Record<string, number> = {};
	for (const m of splits.matchAll(/^\t\.(\w+)\s+type:\w+\s+align:(\d+)/gm)) aligns[m[1]] = Number(m[2]);

	const bases: Record<string, number> = { text: load.text };
	let cursor = load.text;
	for (let i = 0; i + 1 < SECTION_ORDER.length; i++) {
		cursor += extents[SECTION_ORDER[i]] ?? 0;
		const align = aligns[SECTION_ORDER[i + 1]] ?? 8;
		cursor = Math.ceil(cursor / align) * align;
		bases[SECTION_ORDER[i + 1]] = cursor;
	}
	if (load.bss !== undefined) bases.bss = load.bss;
	for (const [section, expected] of Object.entries(REL_EXPECTED[rel] ?? {})) {
		if (bases[section] !== expected) {
			throw new Error(`Derived ${rel} .${section} base ${hex(bases[section])} but expected ${hex(expected)}; the decomp's section layout changed`);
		}
	}
	return bases;
}

class SymbolTable {
	private byName = new Map<string, Sym>();
	private byModule = new Map<string, Sym[]>();

	constructor(files: DecompFiles) {
		const modules: [string, string][] = [['dol', `config/${BUILD}/symbols.txt`]];
		for (const rel of Object.keys(REL_LOAD)) modules.push([rel, `config/${BUILD}/${rel}/symbols.txt`]);
		for (const [module, path] of modules) {
			const text = files.read(path);
			if (!text) throw new Error(`Missing ${path} in the decomp`);
			let bases: Record<string, number> | null = null;
			if (module !== 'dol') {
				const splits = files.read(`config/${BUILD}/${module}/splits.txt`);
				if (!splits) throw new Error(`Missing splits.txt for REL ${module}`);
				bases = sectionBases(module, splits, text);
			}
			const list: Sym[] = [];
			for (const line of text.split(/\r?\n/)) {
				const m = /^\s*(\w+)\s*=\s*\.(\w+):0x([0-9A-Fa-f]+);(.*)$/.exec(line);
				if (!m) continue;
				let address = parseInt(m[3], 16);
				if (bases) {
					const base = bases[m[2]];
					if (base === undefined) continue; // section with no known RAM base
					address += base;
				}
				const size = /size:0x([0-9A-Fa-f]+)/.exec(m[4]);
				const sym: Sym = { name: m[1], address, module, section: m[2] };
				if (size) sym.size = parseInt(size[1], 16);
				list.push(sym);
				if (!this.byName.has(sym.name)) this.byName.set(sym.name, sym);
			}
			list.sort((a, b) => a.address - b.address);
			this.byModule.set(module, list);
		}
	}

	get size() {
		return this.byName.size;
	}

	get(name: string): Sym {
		const sym = this.byName.get(name);
		if (!sym) throw new Error(`'${name}' is not in the decomp's symbols.txt`);
		return sym;
	}

	/** The symbol whose extent contains `address`, preferring the match REL over the DOL. */
	container(address: number): string | undefined {
		for (const module of ['game', 'dol', 'menus']) {
			for (const sym of this.byModule.get(module) ?? []) {
				if (sym.address <= address && address < sym.address + (sym.size ?? 1)) {
					const offset = address - sym.address;
					return `${sym.name}${offset ? `+0x${offset.toString(16).toUpperCase()}` : ''} (${module} .${sym.section})`;
				}
			}
		}
		return undefined;
	}
}

// ---------------------------------------------------------------------------
// Header model (include/** /*.h)
// ---------------------------------------------------------------------------

type TypeRef =
	| { kind: 'prim'; name: string; size: number; signed: boolean; enumName?: string }
	| { kind: 'pointer' }
	| { kind: 'array'; count: number; elem: TypeRef; stride?: number }
	| { kind: 'struct'; name: string };

interface StructField {
	name: string;
	offset: number;
	type: TypeRef;
}

interface Block {
	kind: 'struct' | 'union' | 'enum';
	name: string;
	lines: string[];
	sizeComment?: number;
	file: string;
}

const PRIMITIVES: Record<string, [size: number, signed: boolean]> = {
	u8: [1, false], s8: [1, true], u16: [2, false], s16: [2, true], u32: [4, false], s32: [4, true],
	u64: [8, false], s64: [8, true], f32: [4, true], f64: [8, true], bool: [1, false], BOOL: [4, true],
	char: [1, true], 'unsigned char': [1, false], 'signed char': [1, true], short: [2, true], 'unsigned short': [2, false],
	int: [4, true], 'unsigned int': [4, false], unsigned: [4, false], uint: [4, false], long: [4, true],
	'unsigned long': [4, false], 'long long': [8, true], 'unsigned long long': [8, false], float: [4, true],
	double: [8, true], size_t: [4, false], unknown: [4, false]
};

const POINTER_SIZE = 4;

/** Tiny C constant-expression evaluator for array bounds and enum values. */
function evaluate(expression: string, lookup: (name: string) => number | undefined): number {
	const tokens = expression.match(/0[xX][0-9A-Fa-f]+|\d+\.?\d*|[A-Za-z_]\w*|<<|>>|[-+*/%&|^~()]/g) ?? [];
	let pos = 0;
	const peek = () => tokens[pos];
	const next = () => tokens[pos++];
	const primary = (): number => {
		const token = next();
		if (token === undefined) throw new Error(`Unexpected end of expression '${expression}'`);
		if (token === '(') {
			const value = binary(0);
			if (next() !== ')') throw new Error(`Missing ')' in '${expression}'`);
			return value;
		}
		if (token === '-') return -primary();
		if (token === '+') return primary();
		if (token === '~') return ~primary();
		if (/^0[xX]/.test(token)) return parseInt(token, 16);
		if (/^\d/.test(token)) return Number(token);
		const value = lookup(token);
		if (value === undefined) throw new Error(`Unknown identifier '${token}' in '${expression}'`);
		return value;
	};
	const PRECEDENCE: Record<string, number> = { '|': 1, '^': 2, '&': 3, '<<': 4, '>>': 4, '+': 5, '-': 5, '*': 6, '/': 6, '%': 6 };
	const binary = (min: number): number => {
		let left = primary();
		while (peek() !== undefined && PRECEDENCE[peek()] !== undefined && PRECEDENCE[peek()] >= min) {
			const op = next();
			const right = binary(PRECEDENCE[op] + 1);
			switch (op) {
				case '+': left += right; break;
				case '-': left -= right; break;
				case '*': left *= right; break;
				case '/': left = Math.trunc(left / right); break;
				case '%': left %= right; break;
				case '<<': left = left * 2 ** right; break;
				case '>>': left = Math.floor(left / 2 ** right); break;
				case '&': left &= right; break;
				case '|': left |= right; break;
				case '^': left ^= right; break;
			}
		}
		return left;
	};
	const value = binary(0);
	if (pos !== tokens.length) throw new Error(`Trailing tokens in '${expression}'`);
	return value;
}

class Headers {
	private blocks = new Map<string, Block>();
	private typedefs = new Map<string, string>();
	private macros = new Map<string, string>();
	private externs = new Map<string, { typeText: string; dims: string[]; file: string }>();
	private enumValues = new Map<string, number>();
	private enumMembers = new Map<string, { name: string; value: number }[]>();
	private fieldCache = new Map<string, { fields: StructField[]; size: number; union: boolean }>();
	private parsingEnums = new Set<string>();
	readonly warnings: string[] = [];

	constructor(files: DecompFiles) {
		for (const path of files.list('include').filter((p) => p.endsWith('.h')).sort()) {
			this.scan(path, files.read(path)!);
		}
	}

	get stats() {
		return `${this.blocks.size} types, ${this.externs.size} externs, ${this.typedefs.size} typedefs, ${this.macros.size} macros`;
	}

	private scan(file: string, raw: string) {
		// Drop block comments that span lines, keeping line structure; single-line ones carry offsets.
		const text = raw.replace(/\/\*[\s\S]*?\*\//g, (m) => (m.includes('\n') ? m.replace(/[^\n]/g, '') : m));
		const lines = text.split(/\r?\n/);
		let depth = 0;
		for (let i = 0; i < lines.length; i++) {
			const line = lines[i];
			const code = line.replace(/\/\/.*$/, '').replace(/\/\*.*?\*\//g, '').trim();
			if (depth > 0) {
				depth = Math.max(0, depth + count(code, '{') - count(code, '}'));
				continue;
			}
			let m: RegExpExecArray | null;
			if ((m = /^#\s*define\s+([A-Za-z_]\w*)\s+(.+)$/.exec(code)) && !/^#\s*define\s+\w+\(/.test(code)) {
				this.macros.set(m[1], m[2].trim());
				continue;
			}
			if (/^extern\s+"C"\s*\{/.test(code)) continue;
			if ((m = /^(typedef\s+)?(struct|union|enum)(?:\s+(\w+))?\s*\{/.exec(code)) || (m = /^extern\s+()(struct|union)(?:\s+(\w+))?\s*\{/.exec(code))) {
				const kind = m[2] as Block['kind'];
				const tag = m[3];
				const isExtern = code.startsWith('extern');
				const body: string[] = [];
				let level = count(code, '{') - count(code, '}');
				const rest = code.slice(code.indexOf('{') + 1);
				if (rest.trim() && level > 0) body.push(rest);
				let closer = level === 0 ? code : '';
				let j = i;
				while (level > 0 && ++j < lines.length) {
					const inner = lines[j].replace(/\/\/.*$/, '');
					level += count(inner, '{') - count(inner, '}');
					if (level > 0) body.push(lines[j]);
					else closer = lines[j];
				}
				i = j;
				const close = /\}\s*(\**)\s*(\w*)\s*((?:\[[^\]]*\])*)\s*;(.*)$/.exec(closer);
				const name = close?.[2] || '';
				const sizeComment = /size:?\s*(0x[0-9A-Fa-f]+|\d+)/.exec(close?.[4] ?? '');
				const block: Block = { kind, name: '', lines: body, file };
				if (sizeComment) block.sizeComment = Number(sizeComment[1]);
				if (isExtern) {
					block.name = `__anon_${name}`;
					this.register(block.name, block);
					this.externs.set(name, { typeText: block.name, dims: dims(close?.[3] ?? ''), file });
				} else {
					block.name = name || (tag ? `${kind} ${tag}` : `${kind}@${file}:${i}`);
					if (name) this.register(name, block);
					if (tag) this.register(`${kind} ${tag}`, block);
				}
				continue;
			}
			if ((m = /^typedef\s+(.+?)\s*\b(\w+)\s*;$/.exec(code)) && !code.includes('(')) {
				this.typedefs.set(m[2], m[1].trim());
				continue;
			}
			if ((m = /^extern\s+([A-Za-z_][\w\s*]*?)\s*(\**)\s*(\w+)\s*((?:\[[^\]]*\])*)\s*;$/.exec(code)) && !code.includes('(')) {
				if (!this.externs.has(m[3])) this.externs.set(m[3], { typeText: m[1].trim() + (m[2] ? ' *' : ''), dims: dims(m[4]), file });
				continue;
			}
			depth = Math.max(0, count(code, '{') - count(code, '}'));
		}
	}

	private register(name: string, block: Block) {
		if (!this.blocks.has(name)) this.blocks.set(name, block);
	}

	private lookupConstant = (name: string): number | undefined => {
		const macro = this.macros.get(name);
		if (macro !== undefined) return evaluate(macro, this.lookupConstant);
		if (this.enumValues.has(name)) return this.enumValues.get(name);
		for (const [enumName, block] of this.blocks) {
			if (block.kind !== 'enum' || this.enumMembers.has(enumName) || this.parsingEnums.has(enumName)) continue;
			if (block.lines.some((line) => new RegExp(`\\b${name}\\b`).test(line))) {
				this.enumOf(enumName);
				if (this.enumValues.has(name)) return this.enumValues.get(name);
			}
		}
		return undefined;
	};

	constant(expression: string): number {
		return evaluate(expression, this.lookupConstant);
	}

	enumOf(name: string): { name: string; value: number }[] {
		const cached = this.enumMembers.get(name);
		if (cached) return cached;
		const block = this.blocks.get(name);
		if (!block || block.kind !== 'enum') throw new Error(`Enum '${name}' is not defined in the decomp headers`);
		this.parsingEnums.add(name);
		const members: { name: string; value: number }[] = [];
		let next = 0;
		const body = block.lines.map((l) => l.replace(/\/\/.*$/, '').replace(/\/\*.*?\*\//g, '')).join('\n');
		for (const item of body.split(',')) {
			const m = /^\s*([A-Za-z_]\w*)\s*(?:=\s*(.+?))?\s*$/s.exec(item);
			if (!m) continue;
			const value = m[2] ? this.constant(m[2]) : next;
			members.push({ name: m[1], value });
			this.enumValues.set(m[1], value);
			next = value + 1;
		}
		this.parsingEnums.delete(name);
		this.enumMembers.set(name, members);
		return members;
	}

	hasEnum(name: string) {
		return this.blocks.get(name)?.kind === 'enum';
	}

	generatedEnum(name: string): GeneratedEnum {
		const prefix = `${name}_`;
		const members = this.enumOf(name).map((m) => ({ name: m.name.startsWith(prefix) ? m.name.slice(prefix.length) : m.name, value: m.value }));
		const nonZero = members.filter((m) => m.value !== 0);
		const flags = nonZero.length >= 3 && nonZero.every((m) => m.value > 0 && (m.value & (m.value - 1)) === 0);
		return { flags, members };
	}

	extern(name: string) {
		return this.externs.get(name);
	}

	resolveType(text: string, seen: string[] = []): TypeRef {
		text = text.replace(/\b(const|volatile)\b/g, ' ').replace(/\s+/g, ' ').trim();
		if (text.endsWith('*')) return { kind: 'pointer' };
		if (seen.includes(text)) throw new Error(`Circular typedef ${[...seen, text].join(' → ')}`);
		const enumMatch = /^E\(\s*([\w ]+?)\s*,\s*(\w+)\s*\)$/.exec(text);
		if (enumMatch) {
			const storage = this.resolveType(enumMatch[1], seen);
			if (storage.kind === 'prim') {
				if (this.hasEnum(enumMatch[2])) return { ...storage, enumName: enumMatch[2] };
				this.warnings.push(`E(${enumMatch[1]}, ${enumMatch[2]}): enum ${enumMatch[2]} is not defined in the decomp headers`);
			}
			return storage;
		}
		const primitive = PRIMITIVES[text];
		if (primitive) return { kind: 'prim', name: text, size: primitive[0], signed: primitive[1] };
		const block = this.blocks.get(text);
		if (block?.kind === 'enum') return { kind: 'prim', name: text, size: 4, signed: true, enumName: text };
		if (block) return { kind: 'struct', name: text };
		const alias = this.typedefs.get(text);
		if (alias !== undefined) return this.resolveType(alias, [...seen, text]);
		throw new Error(`Unknown type '${text}' (not a primitive, typedef, struct, or enum in the decomp headers)`);
	}

	sizeOf(type: TypeRef): number {
		switch (type.kind) {
			case 'prim':
				return type.size;
			case 'pointer':
				return POINTER_SIZE;
			case 'array':
				return type.count * this.strideOf(type);
			case 'struct':
				return this.layout(type.name).size;
		}
	}

	/** Bytes between consecutive elements of an array. */
	strideOf(type: { elem: TypeRef; stride?: number }): number {
		return type.stride ?? this.sizeOf(type.elem);
	}

	fields(structName: string): StructField[] {
		return this.layout(structName).fields;
	}

	field(structName: string, fieldName: string): StructField {
		const field = this.fields(structName).find((f) => f.name === fieldName);
		if (!field) throw new Error(`${structName} has no field '${fieldName}'. Fields: ${this.fields(structName).map((f) => f.name).join(', ')}`);
		return field;
	}

	/** Parse a struct body, honouring the decomp's hex offset comments where present. */
	private layout(structName: string): { fields: StructField[]; size: number; union: boolean } {
		const cached = this.fieldCache.get(structName);
		if (cached) return cached;
		const block = this.blocks.get(structName);
		if (!block || block.kind === 'enum') throw new Error(`Struct '${structName}' is not defined in the decomp headers`);
		const union = block.kind === 'union';
		const fields: StructField[] = [];
		let cursor = 0;
		let maxEnd = 0;
		const where = (line: string) => `${block.file}: ${structName} '${line.trim()}'`;

		for (const raw of block.lines) {
			let line = raw.replace(/\/\/.*$/, '');
			let commentOffset: number | undefined;
			const offsetComment = /^\s*\/\*\s*(0x[0-9A-Fa-f]+|\d+)\s*\*\/\s*/.exec(line);
			if (offsetComment) {
				commentOffset = Number(offsetComment[1]);
				line = line.slice(offsetComment[0].length);
			}
			line = line.replace(/\/\*.*?\*\//g, '').trim();
			if (line.endsWith(';')) line = line.slice(0, -1).trim();
			if (!line || line.startsWith('#')) continue;

			const padding = /^artificial_padding\(\s*(.+?)\s*,\s*(.+?)\s*,\s*(.+?)\s*\)$/.exec(line);
			if (padding) {
				cursor = Math.max(cursor, this.constant(padding[2]));
				continue;
			}
			if (/^(struct|union)\s*(\w+\s*)?\{/.test(line)) throw new Error(`${where(raw)}: nested struct definitions are not supported`);

			let type: TypeRef;
			const declarators: { name: string; type: TypeRef }[] = [];
			const fnPointer = /\(\s*\*+\s*(\w+)\s*\)\s*\(/.exec(line);
			const bitfield = /^(.+?)\s+(\w+)\s*:\s*\d+$/.exec(line);
			if (fnPointer) {
				declarators.push({ name: fnPointer[1], type: { kind: 'pointer' } });
			} else if (bitfield) {
				declarators.push({ name: bitfield[2], type: this.resolveType(bitfield[1]) });
			} else {
				let head = line;
				let enumName: string | undefined;
				const annotated = /^E\(\s*([\w ]+?)\s*,\s*(\w+)\s*\)\s*/.exec(head);
				if (annotated) {
					enumName = annotated[2];
					head = `${annotated[1]} ${head.slice(annotated[0].length)}`;
				}
				const parts = splitTopLevel(head, ',');
				const first = /^(.+?)\s*(\**)\s*(\w+)\s*((?:\[[^\]]*\])*)$/.exec(parts[0]);
				if (!first) throw new Error(`${where(raw)}: cannot parse member`);
				const baseText = first[1];
				let base: TypeRef | null = null;
				const typeFor = (stars: string, dimText: string): TypeRef => {
					if (stars) return { kind: 'pointer' };
					if (!base) {
						base = this.resolveType(baseText);
						if (enumName && base.kind === 'prim') base = this.hasEnum(enumName) ? { ...base, enumName } : base;
					}
					let t: TypeRef = base;
					const counts = dims(dimText).map((d) => this.constant(d));
					for (let k = counts.length - 1; k >= 0; k--) t = { kind: 'array', count: counts[k], elem: t };
					return t;
				};
				declarators.push({ name: first[3], type: typeFor(first[2], first[4]) });
				for (const part of parts.slice(1)) {
					const more = /^(\**)\s*(\w+)\s*((?:\[[^\]]*\])*)$/.exec(part.trim());
					if (!more) throw new Error(`${where(raw)}: cannot parse declarator '${part}'`);
					declarators.push({ name: more[2], type: typeFor(more[1], more[3]) });
				}
			}

			for (const [index, declarator] of declarators.entries()) {
				type = declarator.type;
				let offset = union ? 0 : cursor;
				if (index === 0 && commentOffset !== undefined && !union) {
					if (commentOffset < cursor) {
						this.warnings.push(`${where(raw)}: offset comment ${hex(commentOffset)} overlaps the previous member; using ${hex(cursor)}`);
					} else {
						offset = commentOffset;
					}
				}
				const size = this.sizeOf(type);
				fields.push({ name: declarator.name, offset, type });
				cursor = union ? cursor : offset + size;
				maxEnd = Math.max(maxEnd, offset + size);
			}
		}
		const size = block.sizeComment ?? maxEnd;
		if (block.sizeComment !== undefined && block.sizeComment < maxEnd) {
			this.warnings.push(`${block.file}: ${structName} members reach ${hex(maxEnd)} but the size comment says ${hex(block.sizeComment)}`);
		}
		const result = { fields, size, union };
		this.fieldCache.set(structName, result);
		return result;
	}

	leaf(type: TypeRef): GeneratedLeaf {
		if (type.kind !== 'prim') throw new Error(`Expected a primitive value but found ${describe(type)}`);
		const leaf: GeneratedLeaf = { type: primitiveOf(type), size: type.size, signed: type.signed };
		if (type.enumName) leaf.enum = type.enumName;
		return leaf;
	}

	/** Flatten a struct into editable primitive leaves (`inner.field`, `arr[2]`); pointers are skipped. */
	flatten(structName: string, prefix = ''): GeneratedField[] {
		const out: GeneratedField[] = [];
		const push = (name: string, offset: number, type: TypeRef) => {
			if (type.kind === 'prim') out.push({ name, offset, ...this.leaf(type) });
			else if (type.kind === 'struct') out.push(...this.flatten(type.name, `${name}.`).map((f) => ({ ...f, offset: offset + f.offset })));
			else if (type.kind === 'array') {
				const size = this.sizeOf(type.elem);
				for (let i = 0; i < type.count; i++) push(`${name}[${i}]`, offset + i * size, type.elem);
			}
		};
		for (const f of this.fields(structName)) push(`${prefix}${f.name}`, f.offset, f.type);
		return out;
	}
}

function count(text: string, char: string): number {
	return text.split(char).length - 1;
}

function dims(text: string): string[] {
	return [...text.matchAll(/\[([^\]]*)\]/g)].map((m) => m[1].trim());
}

function splitTopLevel(text: string, separator: string): string[] {
	const out: string[] = [];
	let depth = 0;
	let current = '';
	for (const ch of text) {
		if (ch === '(' || ch === '[') depth++;
		else if (ch === ')' || ch === ']') depth--;
		if (ch === separator && depth === 0) {
			out.push(current.trim());
			current = '';
		} else current += ch;
	}
	if (current.trim()) out.push(current.trim());
	return out;
}

function primitiveOf(type: { name: string; size: number }): Primitive {
	if (type.name === 'f32' || type.name === 'float') return 'float';
	if (type.size === 1) return 'byte';
	if (type.size === 2) return 'short';
	if (type.size === 4) return 'word';
	throw new Error(`${type.name} (${type.size} bytes) cannot be written with a Gecko code`);
}

function describe(type: TypeRef): string {
	switch (type.kind) {
		case 'prim':
			return type.name;
		case 'pointer':
			return 'a pointer';
		case 'array':
			return `${describe(type.elem)}[${type.count}]`;
		case 'struct':
			return `struct ${type.name}`;
	}
}

function hex(address: number): string {
	return `0x${address.toString(16).toUpperCase().padStart(8, '0')}`;
}

// ---------------------------------------------------------------------------
// Path walking
// ---------------------------------------------------------------------------

type PathToken = { kind: 'field'; name: string } | { kind: 'axis' } | { kind: 'index'; n: number } | { kind: 'fieldsAxis' };

function tokenize(path: string): PathToken[] {
	const tokens: PathToken[] = [];
	let consumed = 0;
	for (const m of path.matchAll(/\.?(\w+)|\[(\d*)\]|(\{\*\})/g)) {
		if (m.index !== consumed) break;
		consumed = m.index + m[0].length;
		if (m[1] !== undefined) tokens.push({ kind: 'field', name: m[1] });
		else if (m[3] !== undefined) tokens.push({ kind: 'fieldsAxis' });
		else if (m[2] === '') tokens.push({ kind: 'axis' });
		else tokens.push({ kind: 'index', n: Number(m[2]) });
	}
	if (consumed !== path.length) throw new Error(`Cannot parse path '${path}'`);
	return tokens;
}

class Resolver {
	readonly enums = new Set<string>();
	readonly notes: string[] = [];

	constructor(
		private headers: Headers,
		private symbols: SymbolTable
	) {}

	private symbolType(source: SymbolSource): { type: TypeRef; sym: Sym } {
		const sym = this.symbols.get(source.symbol);
		const extern = this.headers.extern(source.symbol);
		let type: TypeRef;
		let counts: number[];
		if (source.declare) {
			type = this.headers.resolveType(source.declare.type);
			counts = source.declare.dims ?? [];
			if (extern) this.notes.push(`${source.symbol}: using the catalog's declare (${source.declare.type}${counts.map((c) => `[${c}]`).join('')}) instead of the header's ${extern.typeText}${extern.dims.map((d) => `[${d}]`).join('')}`);
		} else if (extern) {
			type = this.headers.resolveType(extern.typeText);
			counts = extern.dims.map((d) => this.headers.constant(d));
		} else {
			throw new Error(`The decomp headers do not declare '${source.symbol}' (symbols.txt has it at ${hex(sym.address)}, size ${sym.size ?? '?'}); add declare: { type, dims } to the catalog entry`);
		}
		for (let k = counts.length - 1; k >= 0; k--) type = { kind: 'array', count: counts[k], elem: type };
		if (source.declare?.stride !== undefined) {
			if (type.kind !== 'array') throw new Error(`${source.symbol}: declare.stride needs at least one dimension`);
			const natural = this.headers.sizeOf(type.elem);
			if (natural > source.declare.stride) throw new Error(`${source.symbol}: declare.stride ${source.declare.stride} is smaller than the element's ${natural} bytes`);
			type = { ...type, stride: source.declare.stride };
			this.notes.push(`${source.symbol}: using a stride of ${source.declare.stride} bytes per ${describe(type.elem)} (the decomp's definition computes to ${natural})`);
		}
		const computed = this.headers.sizeOf(type);
		if (sym.size !== undefined && computed > sym.size) {
			throw new Error(`${source.symbol}: declared layout is ${computed} bytes but symbols.txt records only ${sym.size}`);
		}
		if (sym.size !== undefined && computed < sym.size) {
			this.notes.push(`${source.symbol}: layout covers ${computed} of the ${sym.size} bytes symbols.txt records`);
		}
		return { type, sym };
	}

	walk(source: SymbolSource) {
		const start = this.symbolType(source);
		let type = start.type;
		let address = start.sym.address;
		const axes: GeneratedAxis[] = [];
		const where = () => `${source.symbol}${source.path ? ' ' + source.path : ''}`;

		for (const token of tokenize(source.path ?? '')) {
			if (token.kind === 'axis' || token.kind === 'index') {
				if (type.kind !== 'array') throw new Error(`${where()}: expected an array but found ${describe(type)}`);
				const stride = this.headers.strideOf(type);
				if (token.kind === 'axis') axes.push({ count: type.count, stride });
				else {
					if (token.n >= type.count) throw new Error(`${where()}: index ${token.n} is out of range (${type.count})`);
					address += token.n * stride;
				}
				type = type.elem;
			} else if (token.kind === 'field') {
				if (type.kind !== 'struct') throw new Error(`${where()}: expected a struct but found ${describe(type)}`);
				const field = this.headers.field(type.name, token.name);
				address += field.offset;
				type = field.type;
			} else {
				if (type.kind !== 'struct') throw new Error(`${where()}: expected a struct but found ${describe(type)}`);
				const fields = this.headers.fields(type.name);
				const first = describe(fields[0].type);
				const odd = fields.find((f) => describe(f.type) !== first);
				if (odd) throw new Error(`${where()}: {*} needs uniform fields, but ${odd.name} is ${describe(odd.type)} not ${first}`);
				axes.push({ count: fields.length, offsets: fields.map((f) => f.offset), labels: fields.map((f) => f.name) });
				type = fields[0].type;
			}
		}
		while (type.kind === 'array') {
			axes.push({ count: type.count, stride: this.headers.strideOf(type) });
			type = type.elem;
		}

		let elem: GeneratedElem;
		if (type.kind === 'prim') {
			const leaf = this.headers.leaf(type);
			if (leaf.enum) this.enums.add(leaf.enum);
			elem = { kind: 'prim', ...leaf };
		} else if (type.kind === 'struct') {
			const fields = this.headers.flatten(type.name);
			for (const f of fields) if (f.enum) this.enums.add(f.enum);
			elem = { kind: 'struct', name: type.name, size: this.headers.sizeOf(type), fields };
		} else {
			throw new Error(`${where()}: resolved to ${describe(type)}, which cannot be edited`);
		}
		return { address, axes, elem };
	}

	layout(source: Source): GeneratedLayout {
		if (!isSymbolSource(source)) {
			const size = source.type === 'byte' ? 1 : source.type === 'short' ? 2 : 4;
			const counts = source.dims ?? [];
			const layout: GeneratedLayout = {
				address: hex(source.address),
				axes: counts.map((count, k) => ({ count, stride: counts.slice(k + 1).reduce((a, b) => a * b, 1) * size })),
				elem: { kind: 'prim', type: source.type, size, signed: source.type !== 'byte' }
			};
			const container = this.symbols.container(source.address);
			if (container) layout.container = container;
			return layout;
		}
		const walked = this.walk(source);
		const layout: GeneratedLayout = { symbol: source.symbol, address: hex(walked.address), axes: walked.axes, elem: walked.elem };
		if (source.path) layout.path = source.path;
		return layout;
	}

	constant(source: Source): GeneratedConstant {
		const layout = this.layout(source);
		if (layout.axes.length || layout.elem.kind !== 'prim') {
			const name = isSymbolSource(source) ? `${source.symbol} ${source.path ?? ''}` : hex(source.address);
			throw new Error(`Constant ${name} must resolve to a single value`);
		}
		const { kind: _kind, ...leaf } = layout.elem;
		const constant: GeneratedConstant = { address: layout.address, ...leaf };
		if (layout.symbol) constant.symbol = layout.symbol;
		if (layout.path) constant.path = layout.path;
		if (layout.container) constant.container = layout.container;
		return constant;
	}
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
	const local = arg('--decomp');
	let files: DecompFiles;
	let moddingRef: string;
	if (local) {
		files = localDecomp(local);
		moddingRef = arg('--ref') ?? MODDING_SOURCE.ref;
		console.log(`Reading decomp from ${local} (${files.ref})`);
	} else {
		const remote = await remoteDecomp(arg('--ref') ?? MODDING_SOURCE.ref);
		files = remote.files;
		moddingRef = remote.moddingCommit;
	}

	const symbols = new SymbolTable(files);
	const headers = new Headers(files);
	console.log(`Symbol table: ${symbols.size} names. Headers: ${headers.stats}.`);
	const resolver = new Resolver(headers, symbols);

	const tables: GeneratedSymbols['tables'] = {};
	const failures: string[] = [];
	const raw: string[] = [];
	console.log('');
	for (const def of catalog) {
		try {
			if (def.kind === 'table') {
				const layout = resolver.layout(def.source);
				if (layout.axes.length !== def.axes.length) {
					throw new Error(`catalog declares ${def.axes.length} axes but the layout has ${layout.axes.length} (${layout.axes.map((a) => a.count).join('×') || 'scalar'})`);
				}
				for (const column of Object.values(def.columns ?? {})) if (column.enum) resolver.enums.add(column.enum);
				tables[def.id] = layout;
				const shape = layout.axes.map((a) => a.count).join('×') || 'scalar';
				const elem = layout.elem.kind === 'prim' ? layout.elem.type : `${layout.elem.name} (${layout.elem.fields.length} fields)`;
				console.log(`  ${def.id.padEnd(32)} ${layout.address}  ${shape.padEnd(12)} ${elem}${layout.symbol ? '' : '  [raw]'}`);
				if (!layout.symbol) raw.push(`${def.id}: ${layout.address} → ${layout.container ?? 'no decomp symbol covers this address'}`);
			} else {
				const entries = def.entries.map((entry) => resolver.constant(entry.source));
				tables[def.id] = { entries };
				entries.forEach((entry, i) => {
					if (!entry.symbol) raw.push(`${def.id} · ${def.entries[i].label}: ${entry.address} → ${entry.container ?? 'no decomp symbol covers this address'}`);
				});
				const rawCount = entries.filter((e) => !e.symbol).length;
				console.log(`  ${def.id.padEnd(32)} ${entries.length} constants${rawCount ? ` (${rawCount} raw)` : ''}`);
			}
		} catch (error) {
			failures.push(`${def.id}: ${(error as Error).message}`);
		}
	}
	if (failures.length) {
		console.error('\nSync failed:\n  ' + failures.join('\n  '));
		process.exit(1);
	}

	const output: GeneratedSymbols = {
		meta: {
			repo: MODDING_SOURCE.repo,
			ref: moddingRef,
			decomp: { repo: files.repo, ref: files.ref },
			generatedAt: new Date().toISOString()
		},
		tables,
		enums: Object.fromEntries([...resolver.enums].sort().map((name) => [name, headers.generatedEnum(name)]))
	};
	const outFile = join(dirname(fileURLToPath(import.meta.url)), '..', 'lib', 'mods', 'generated', 'symbols.json');
	mkdirSync(dirname(outFile), { recursive: true });
	writeFileSync(outFile, JSON.stringify(output, null, '\t') + '\n');

	const notes = [...new Set(resolver.notes)];
	if (notes.length) console.log('\nNotes:\n  ' + notes.join('\n  '));
	const relevantWarnings = headers.warnings.filter((w) => !w.startsWith('E('));
	if (relevantWarnings.length) console.log('\nHeader warnings:\n  ' + relevantWarnings.join('\n  '));
	if (raw.length) {
		console.log('\nRaw addresses (label these in the decomp to make them symbol-backed):\n  ' + raw.join('\n  '));
	}
	console.log(`\nWrote ${relative(process.cwd(), outFile)}`);
}

main().catch((error) => {
	console.error(error);
	process.exit(1);
});
