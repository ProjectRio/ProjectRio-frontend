import generatedJson from './generated/symbols.json';
import { catalog } from './catalog';
import {
	isSymbolSource,
	type CellDisplay,
	type ColumnMeta,
	type ConstantsDef,
	type EnumOption,
	type GeneratedAxis,
	type GeneratedConstant,
	type GeneratedEnum,
	type GeneratedLayout,
	type GeneratedLeaf,
	type GeneratedSymbols,
	type ModDef,
	type Primitive,
	type ResolvedAxis,
	type ResolvedCell,
	type ResolvedTable,
	type TableDef
} from './types';

const generated = generatedJson as GeneratedSymbols;

export const MODDING_META = generated.meta;

const SYNC_HINT = "Run 'npm run sync-mods' after editing the catalog.";

const TYPE_RANGE: Record<Primitive, { signed: [number, number]; unsigned: [number, number]; step: number }> = {
	byte: { signed: [-128, 127], unsigned: [0, 255], step: 1 },
	short: { signed: [-32768, 32767], unsigned: [0, 65535], step: 1 },
	word: { signed: [-2147483648, 2147483647], unsigned: [0, 4294967295], step: 1 },
	float: { signed: [-Infinity, Infinity], unsigned: [-Infinity, Infinity], step: 0.01 }
};

function axisOffset(axis: GeneratedAxis, index: number): number {
	if (axis.offsets) return axis.offsets[index];
	return index * (axis.stride ?? 0);
}

function enumLabel(name: string): string {
	const words = name.toLowerCase().replace(/_/g, ' ').trim();
	return words.charAt(0).toUpperCase() + words.slice(1);
}

function enumOptions(name: string | undefined, display: CellDisplay): EnumOption[] | undefined {
	if (!name || display === 'number') return undefined;
	const info: GeneratedEnum | undefined = generated.enums[name];
	if (!info) throw new Error(`Enum '${name}' is missing from generated symbols. ${SYNC_HINT}`);
	return info.members.filter((m) => m.value >= 0).map((m) => ({ label: enumLabel(m.name), value: m.value }));
}

function defaultDisplay(enumName: string | undefined, meta?: Pick<ColumnMeta, 'display'>): CellDisplay {
	if (meta?.display) return meta.display;
	if (!enumName) return 'number';
	return generated.enums[enumName]?.flags ? 'flags' : 'select';
}

function buildCell(
	leaf: GeneratedLeaf,
	address: number,
	defaultValue: number,
	label: string,
	meta: Partial<ColumnMeta> | undefined,
	fallback: Pick<ColumnMeta, 'min' | 'max' | 'step'> | undefined,
	fromHeader: boolean
): ResolvedCell {
	const type = meta?.type ?? leaf.type;
	const range = TYPE_RANGE[type][leaf.signed ? 'signed' : 'unsigned'];
	const enumName = meta?.enum ?? leaf.enum;
	const display = defaultDisplay(enumName, meta);
	const min = meta?.min ?? fallback?.min ?? (Number.isFinite(range[0]) ? range[0] : undefined);
	const max = meta?.max ?? fallback?.max ?? (Number.isFinite(range[1]) ? range[1] : undefined);
	const cell: ResolvedCell = {
		address,
		type,
		signed: leaf.signed,
		default: defaultValue,
		step: meta?.step ?? fallback?.step ?? TYPE_RANGE[type].step,
		display,
		label,
		fromHeader
	};
	if (min !== undefined) cell.min = min;
	if (max !== undefined) cell.max = max;
	if (meta?.description) cell.description = meta.description;
	const options = enumOptions(enumName, display);
	if (options) cell.options = options;
	return cell;
}

function visibleIndices(labels: (string | null)[]): number[] {
	return labels.flatMap((label, i) => (label === null ? [] : [i]));
}

function lookupDefault(def: TableDef, index: number[], fieldName: string | undefined): number {
	let node: unknown = def.defaults;
	for (let k = 0; k < index.length; k++) {
		const last = k === index.length - 1;
		if (Array.isArray(node)) node = node[index[k]];
		else if (last && fieldName && node && typeof node === 'object') node = (node as Record<string, number>)[fieldName];
		else node = undefined;
		if (node === undefined) break;
	}
	if (typeof node !== 'number') {
		throw new Error(`${def.id}: no default value at [${index.join('][')}]${fieldName ? ` (${fieldName})` : ''}`);
	}
	return node;
}

function resolveTableDef(def: TableDef): ResolvedTable {
	const layout = generated.tables[def.id] as GeneratedLayout | undefined;
	if (!layout || !('axes' in layout)) throw new Error(`No generated layout for '${def.id}'. ${SYNC_HINT}`);
	const source = def.source;
	if (isSymbolSource(source) ? layout.symbol !== source.symbol || (layout.path ?? '') !== (source.path ?? '') : layout.symbol) {
		throw new Error(`Generated layout for '${def.id}' is stale. ${SYNC_HINT}`);
	}
	if (layout.axes.length !== def.axes.length) {
		throw new Error(`${def.id}: catalog declares ${def.axes.length} axes but the generated layout has ${layout.axes.length}. ${SYNC_HINT}`);
	}
	const base = parseInt(layout.address, 16);
	const fromHeader = Boolean(layout.symbol);

	// Array axes.
	const axes: ResolvedAxis[] = [];
	const indexMaps: number[][] = [];
	def.axes.forEach((axisDef, k) => {
		const count = layout.axes[k].count;
		if (axisDef.labels.length !== count) {
			throw new Error(`${def.id}: axis '${axisDef.name}' has ${axisDef.labels.length} labels but the header dimension is ${count}`);
		}
		const indices = visibleIndices(axisDef.labels);
		indexMaps.push(indices);
		const axis: ResolvedAxis = { name: axisDef.name, labels: indices.map((i) => axisDef.labels[i] as string) };
		if (axisDef.kind) axis.kind = axisDef.kind;
		axes.push(axis);
	});

	// Column axis: struct fields, or the last array axis for primitive elements.
	type Column = { leaf: GeneratedLeaf; offset: number; meta?: ColumnMeta; fieldName?: string };
	let columns: Column[];
	if (layout.elem.kind === 'struct') {
		const fields = layout.elem.fields;
		let selected: Column[];
		let labels: string[];
		if (def.columns) {
			selected = Object.entries(def.columns).map(([name, meta]) => {
				const field = fields.find((f) => f.name === name);
				if (!field) throw new Error(`${def.id}: struct ${(layout.elem as { name: string }).name} has no field '${name}'. Fields: ${fields.map((f) => f.name).join(', ')}`);
				return { leaf: field, offset: field.offset, meta, fieldName: name };
			});
			labels = selected.map((c) => c.meta!.label);
		} else if (def.allColumns) {
			const all = def.allColumns;
			if (all.labels && all.labels.length !== fields.length) {
				throw new Error(`${def.id}: allColumns.labels has ${all.labels.length} entries but struct has ${fields.length} fields`);
			}
			const visible = all.labels ? visibleIndices(all.labels) : fields.map((_, i) => i);
			selected = visible.map((i) => ({
				leaf: fields[i],
				offset: fields[i].offset,
				meta: { ...all, label: all.labels?.[i] ?? fields[i].name },
				fieldName: fields[i].name
			}));
			labels = selected.map((c) => c.meta!.label);
		} else {
			throw new Error(`${def.id}: struct tables need 'columns' or 'allColumns'`);
		}
		columns = selected;
		const axis: ResolvedAxis = { name: 'Field', labels };
		if (def.allColumns?.kind) axis.kind = def.allColumns.kind;
		axes.push(axis);
	} else {
		if (!axes.length) throw new Error(`${def.id}: a primitive table needs at least one axis`);
		const lastAxis = layout.axes[layout.axes.length - 1];
		const leaf = layout.elem;
		columns = indexMaps[indexMaps.length - 1].map((i, displayed) => ({
			leaf,
			offset: axisOffset(lastAxis, i),
			meta: def.columnMeta?.[displayed]
		}));
		indexMaps.pop();
	}
	if (!columns.length) throw new Error(`${def.id}: no visible columns`);

	// Cells, row-major over the displayed shape.
	const shape = axes.map((a) => a.labels.length);
	const cells: ResolvedCell[] = [];
	const rowAxes = indexMaps.length;
	const index = new Array<number>(rowAxes).fill(0);
	const total = shape.slice(0, rowAxes).reduce((a, b) => a * b, 1);
	for (let n = 0; n < total; n++) {
		let rest = n;
		for (let k = rowAxes - 1; k >= 0; k--) {
			index[k] = rest % shape[k];
			rest = Math.floor(rest / shape[k]);
		}
		let rowAddress = base;
		for (let k = 0; k < rowAxes; k++) rowAddress += axisOffset(layout.axes[k], indexMaps[k][index[k]]);
		columns.forEach((column, c) => {
			const label = [...index.map((i, k) => axes[k].labels[i]), axes[axes.length - 1].labels[c]].join(' · ');
			const defaultValue = lookupDefault(def, [...index, c], column.fieldName);
			cells.push(buildCell(column.leaf, rowAddress + column.offset, defaultValue, label, column.meta, def.valueMeta, fromHeader));
		});
	}

	const table: ResolvedTable = {
		kind: 'table',
		id: def.id,
		group: def.group,
		title: def.title,
		description: def.description,
		notes: def.notes ?? [],
		axes,
		shape,
		cells,
		columns: columns.map((c, i) => {
			const column: { label: string; description?: string } = { label: axes[axes.length - 1].labels[i] };
			if (c.meta?.description) column.description = c.meta.description;
			return column;
		})
	};
	if (layout.symbol) table.symbol = layout.symbol + (layout.path ? ` ${layout.path}` : '');
	if (def.randomize) table.randomize = def.randomize;
	return table;
}

function resolveConstantsDef(def: ConstantsDef): ResolvedTable {
	const layout = generated.tables[def.id] as { entries: GeneratedConstant[] } | undefined;
	if (!layout || !('entries' in layout)) throw new Error(`No generated layout for '${def.id}'. ${SYNC_HINT}`);
	if (layout.entries.length !== def.entries.length) throw new Error(`Generated constants for '${def.id}' are stale. ${SYNC_HINT}`);

	const cells = def.entries.map((entry, i) => {
		const gen = layout.entries[i];
		const source = entry.source;
		if (isSymbolSource(source) ? gen.symbol !== source.symbol || (gen.path ?? '') !== (source.path ?? '') : gen.symbol) {
			throw new Error(`Generated constants for '${def.id}' are stale at '${entry.label}'. ${SYNC_HINT}`);
		}
		const meta: Partial<ColumnMeta> = { min: entry.min, max: entry.max, step: entry.step, type: entry.type, description: entry.description };
		return buildCell(gen, parseInt(gen.address, 16), entry.default, entry.label, meta, undefined, Boolean(gen.symbol));
	});

	return {
		kind: 'constants',
		id: def.id,
		group: def.group,
		title: def.title,
		description: def.description,
		notes: def.notes ?? [],
		axes: [{ name: 'Constant', labels: def.entries.map((e) => e.label) }],
		shape: [cells.length],
		cells,
		columns: []
	};
}

export function resolveTable(def: ModDef): ResolvedTable {
	return def.kind === 'table' ? resolveTableDef(def) : resolveConstantsDef(def);
}

let cache: ResolvedTable[] | null = null;

export function getAllTables(): ResolvedTable[] {
	if (!cache) {
		const ids = new Set<string>();
		for (const def of catalog) {
			if (ids.has(def.id)) throw new Error(`Duplicate mod table id '${def.id}'`);
			ids.add(def.id);
		}
		cache = catalog.map(resolveTable);
	}
	return cache;
}

export function getTable(id: string): ResolvedTable | undefined {
	return getAllTables().find((t) => t.id === id);
}
