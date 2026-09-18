/**
 * Shared types for the game-mod (Gecko code) editor.
 *
 * Three layers:
 *  - Catalog (hand-written, `catalog.ts`): which game tables to expose and the human-facing
 *    metadata the header cannot provide (descriptions, axis labels, min/max/step, defaults).
 *  - Generated (`generated/symbols.json`, written by `scripts/sync-mods.ts`): facts derived
 *    from ProjectRio-Modding's GameData.h for every catalog entry — addresses, element types,
 *    array dimensions, struct field offsets, enum members.
 *  - Resolved (`resolve.ts`): catalog + generated merged into flat per-cell data for the UI.
 */

/** Width of the Gecko RAM write: byte → 8-bit (00), short → 16-bit (02), word/float → 32-bit (04). */
export type Primitive = 'byte' | 'short' | 'word' | 'float';

export type ModGroup = 'characters' | 'batting' | 'pitching' | 'fielding';

export type CellDisplay = 'number' | 'select' | 'flags';

// ---------------------------------------------------------------------------
// Catalog
// ---------------------------------------------------------------------------

/** One array dimension of a table. `null` labels hide that index from the editor. */
export interface AxisDef {
	name: string;
	labels: (string | null)[];
	/** Render character portraits next to the labels. */
	kind?: 'character';
}

export interface ColumnMeta {
	label: string;
	description?: string;
	min?: number;
	max?: number;
	step?: number;
	/** Override the header's type for the Gecko write (e.g. write a float slot as an integer word). */
	type?: Primitive;
	/** Defaults to `select`/`flags` when the header field is an enum, otherwise `number`. */
	display?: CellDisplay;
	/** Name of a decomp enum to render this column with, when the header does not annotate the field. */
	enum?: string;
}

/**
 * Reference into the decomp's symbol table. `symbol` is a name from `config/GYQE01/** /symbols.txt`;
 * its type comes from the `extern` declaration in the decomp headers, or from `declare` when the
 * headers do not declare it (a primitive such as `s16`, or a struct/typedef name from the headers).
 *
 * `path` walks from the symbol:
 *  - `.field`  step into a struct field (leading dot optional for the first step)
 *  - `[]`      treat this array dimension as a table axis
 *  - `[n]`     step into a fixed array index
 *  - `{*}`     treat a struct's fields as a table axis (fields must share one type)
 * Array dimensions left after the path automatically become trailing axes.
 */
export interface SymbolSource {
	symbol: string;
	path?: string;
	/**
	 * Type to use when the headers do not declare the symbol (or declare it too loosely).
	 * `stride` overrides the byte size of one element of the outermost dimension, for the rare
	 * struct whose decomp definition disagrees with the game's real element size.
	 */
	declare?: { type: string; dims?: number[]; stride?: number };
}

/** Fallback for addresses the decomp has not labeled yet. Prefer `SymbolSource`. */
export interface RawSource {
	address: number;
	type: Primitive;
	/** Array dimensions, outermost first (omit for a scalar). */
	dims?: number[];
}

export type Source = SymbolSource | RawSource;

export function isSymbolSource(source: Source): source is SymbolSource {
	return 'symbol' in source;
}

export type NestedNumbers = number | NestedNumbers[];

export interface TableDef {
	kind: 'table';
	id: string;
	group: ModGroup;
	title: string;
	description: string;
	notes?: string[];
	source: Source;
	/** One entry per array axis, outermost first (struct fields are not an axis here). */
	axes: AxisDef[];
	/** Struct elements: the fields to show, in this order, keyed by GameData.h field name. */
	columns?: Record<string, ColumnMeta>;
	/** Struct elements: show every field; labels are aligned with the header's field order. */
	allColumns?: { labels?: (string | null)[]; kind?: 'character' } & Partial<Omit<ColumnMeta, 'label'>>;
	/** Primitive elements: metadata per displayed column (aligned with the last axis after hiding). */
	columnMeta?: ColumnMeta[];
	/**
	 * Default values, nested to match the displayed axes (outermost first). Struct-element tables may
	 * instead give one `Record<fieldName, number>` per row of the last array axis.
	 */
	defaults: NestedNumbers | Record<string, number>[];
	/** Fallback min/max/step for every cell. */
	valueMeta?: Pick<ColumnMeta, 'min' | 'max' | 'step'>;
	/** Enable the Randomize button; range used for cells without their own min/max. */
	randomize?: { min: number; max: number };
}

export interface ConstantEntry {
	source: Source;
	label: string;
	description?: string;
	default: number;
	min?: number;
	max?: number;
	step?: number;
	type?: Primitive;
}

export interface ConstantsDef {
	kind: 'constants';
	id: string;
	group: ModGroup;
	title: string;
	description: string;
	notes?: string[];
	entries: ConstantEntry[];
}

export type ModDef = TableDef | ConstantsDef;

// ---------------------------------------------------------------------------
// Generated (output of scripts/sync-mods.ts)
// ---------------------------------------------------------------------------

export interface GeneratedLeaf {
	type: Primitive;
	size: number;
	signed: boolean;
	/** Name of an enum typedef in GameData.h, when the header types this value as one. */
	enum?: string;
}

export interface GeneratedField extends GeneratedLeaf {
	name: string;
	offset: number;
}

export type GeneratedElem =
	| ({ kind: 'prim' } & GeneratedLeaf)
	| { kind: 'struct'; name: string; size: number; fields: GeneratedField[] };

/** One axis of a table: uniform `stride` for arrays, explicit `offsets` for struct-field axes. */
export interface GeneratedAxis {
	count: number;
	stride?: number;
	offsets?: number[];
	labels?: string[];
}

export interface GeneratedLayout {
	symbol?: string;
	path?: string;
	/** For raw addresses: the decomp symbol whose extent contains the address, e.g. `lbl_3_data_5EDC+0x6`. */
	container?: string;
	/** Base address as `0x` hex. */
	address: string;
	axes: GeneratedAxis[];
	elem: GeneratedElem;
}

export interface GeneratedConstant extends GeneratedLeaf {
	symbol?: string;
	path?: string;
	container?: string;
	address: string;
}

export interface GeneratedEnum {
	/** True when the members look like bit flags (all powers of two). */
	flags: boolean;
	members: { name: string; value: number }[];
}

export interface GeneratedSymbols {
	meta: {
		/** The ProjectRio-Modding commit the sync was pinned to. */
		repo: string;
		ref: string;
		/** The decomp commit that commit's `Decomp` submodule pointed at. */
		decomp: { repo: string; ref: string };
		generatedAt: string;
	};
	tables: Record<string, GeneratedLayout | { entries: GeneratedConstant[] }>;
	enums: Record<string, GeneratedEnum>;
}

// ---------------------------------------------------------------------------
// Resolved (what the editor renders)
// ---------------------------------------------------------------------------

export interface EnumOption {
	label: string;
	value: number;
}

export interface ResolvedCell {
	address: number;
	type: Primitive;
	signed: boolean;
	default: number;
	min?: number;
	max?: number;
	step: number;
	display: CellDisplay;
	options?: EnumOption[];
	label: string;
	description?: string;
	/** False when the address came from a `RawSource` rather than GameData.h. */
	fromHeader: boolean;
}

export interface ResolvedAxis {
	name: string;
	labels: string[];
	kind?: 'character';
}

export interface ResolvedTable {
	kind: 'table' | 'constants';
	id: string;
	group: ModGroup;
	title: string;
	description: string;
	notes: string[];
	symbol?: string;
	/** Displayed axes, outermost first. The last axis is the column axis; earlier ones become tabs. */
	axes: ResolvedAxis[];
	shape: number[];
	/** Row-major over `shape`. */
	cells: ResolvedCell[];
	/** Legend for the column axis. */
	columns: { label: string; description?: string }[];
	randomize?: { min: number; max: number };
}
