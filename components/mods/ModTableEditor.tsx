'use client';

import { useMemo, useState } from 'react';
import { characterImage } from '@/lib/data/characters';
import { formatIni, geckoLines } from '@/lib/mods/gecko';
import { PageHeader, Panel, PanelHeader } from '@/components/ui';
import type { ResolvedCell, ResolvedTable } from '@/lib/mods/types';

function strides(shape: number[]): number[] {
	const out = new Array<number>(shape.length).fill(1);
	for (let k = shape.length - 2; k >= 0; k--) out[k] = out[k + 1] * shape[k + 1];
	return out;
}

function parseValue(text: string): number | null {
	if (text.trim() === '') return null;
	const value = Number(text);
	return Number.isFinite(value) ? value : null;
}

function decimals(step: number): number {
	const text = String(step);
	const dot = text.indexOf('.');
	return dot < 0 ? 0 : text.length - dot - 1;
}

function hexAddress(address: number): string {
	return `0x${address.toString(16).toUpperCase()}`;
}

function randomValue(cell: ResolvedCell, fallback: { min: number; max: number }): number {
	if (cell.display === 'flags') return cell.default;
	if (cell.display === 'select' && cell.options?.length) {
		return cell.options[Math.floor(Math.random() * cell.options.length)].value;
	}
	const min = cell.min ?? fallback.min;
	const max = cell.max ?? fallback.max;
	const value = Math.random() * (max - min) + min;
	if (cell.step >= 1) return Math.round(value / cell.step) * cell.step;
	return Number(value.toFixed(decimals(cell.step)));
}

// Cells are compact wells. A changed cell takes the gold accent: gold figures
// and a gold left lip, the same mark on every kind of cell.
const inputClass = 'input !w-24 !px-2 !pb-1 !pt-1.5 text-center font-mono text-sm tabular-nums';
const changedClass = '!border-l-2 !border-l-star-400 !text-star-400';
const disabledClass = 'disabled:pointer-events-none disabled:opacity-40';
const keyClass = `key px-3 pb-1 pt-1.5 text-xs font-semibold ${disabledClass}`;
// The sticky first column is solid (the popover's slab), so cells scrolled
// under it do not show through; on row hover it darkens to match the bar.
const stickyCell = 'sticky left-0 z-10 bg-[#0b2219] [tr:hover>&]:bg-[#050f0b]';

function ResetButton({ onClick }: { onClick: () => void }) {
	return (
		<button
			type="button"
			onClick={onClick}
			title="Reset to default"
			aria-label="Reset to default"
			className="shrink-0 rounded px-1 text-sm text-fog-500 transition-colors hover:text-fog-100"
		>
			↺
		</button>
	);
}

function FlagsInput({ cell, value, onChange }: { cell: ResolvedCell; value: string; onChange: (value: string) => void }) {
	const current = (parseValue(value) ?? 0) >>> 0;
	const options = cell.options ?? [];
	const active = options.filter((o) => o.value !== 0 && (current & o.value) === o.value);
	return (
		<details className="min-w-32">
			<summary
				className={`${inputClass} cursor-pointer list-none ${current !== cell.default ? changedClass : ''}`}
				title={active.map((o) => o.label).join(', ') || 'None'}
			>
				{active.length} / {options.filter((o) => o.value !== 0).length}
			</summary>
			<div className="popover mb-2 mt-1.5 space-y-1.5 p-2.5 text-left">
				{options
					.filter((o) => o.value !== 0)
					.map((option) => (
						<label
							key={option.value}
							className="flex cursor-pointer items-center gap-2 text-xs text-fog-300 hover:text-fog-100"
						>
							<input
								type="checkbox"
								className="accent-[var(--color-star-400)]"
								checked={(current & option.value) === option.value}
								onChange={(event) =>
									onChange(String(event.target.checked ? (current | option.value) >>> 0 : (current & ~option.value) >>> 0))
								}
							/>
							{option.label}
						</label>
					))}
			</div>
		</details>
	);
}

function CellInput({
	cell,
	value,
	changed,
	onChange,
	onReset
}: {
	cell: ResolvedCell;
	value: string;
	changed: boolean;
	onChange: (value: string) => void;
	onReset: () => void;
}) {
	const title = `${cell.label} · ${hexAddress(cell.address)} · default ${cell.default}`;
	if (cell.display === 'flags' && cell.options) {
		return (
			<div className="flex items-start justify-center gap-1">
				<FlagsInput cell={cell} value={value} onChange={onChange} />
				{changed && <ResetButton onClick={onReset} />}
			</div>
		);
	}
	if (cell.display === 'select' && cell.options) {
		return (
			<div className="flex items-center justify-center gap-1">
				<select
					className={`${inputClass} !w-32 !font-body ${changed ? changedClass : ''}`}
					value={value}
					title={title}
					onChange={(event) => onChange(event.target.value)}
				>
					{cell.options.map((option) => (
						<option key={option.value} value={String(option.value)}>
							{option.label}
						</option>
					))}
				</select>
				{changed && <ResetButton onClick={onReset} />}
			</div>
		);
	}
	return (
		<div className="flex items-center justify-center gap-1">
			<input
				type="number"
				className={`${inputClass} ${changed ? changedClass : ''}`}
				value={value}
				min={cell.min}
				max={cell.max}
				step={cell.step}
				title={title}
				onChange={(event) => onChange(event.target.value)}
			/>
			{changed && <ResetButton onClick={onReset} />}
		</div>
	);
}

function AxisLabel({ label, kind }: { label: string; kind?: 'character' }) {
	if (kind !== 'character') return <>{label}</>;
	return (
		<span className="flex items-center gap-2">
			{/* eslint-disable-next-line @next/next/no-img-element */}
			<img src={characterImage(label)} alt="" className="h-7 w-7 shrink-0 object-contain" />
			{label}
		</span>
	);
}

export default function ModTableEditor({ table, groupTitle }: { table: ResolvedTable; groupTitle: string }) {
	const axisCount = table.axes.length;
	const tabAxes = table.axes.slice(0, Math.max(0, axisCount - 2));
	const rowAxis = table.axes[Math.max(0, axisCount - 2)];
	const colAxis = axisCount >= 2 ? table.axes[axisCount - 1] : null;
	const stride = useMemo(() => strides(table.shape), [table.shape]);

	const [tabs, setTabs] = useState<number[]>(() => tabAxes.map(() => 0));
	const [values, setValues] = useState<string[]>(() => table.cells.map((cell) => String(cell.default)));
	const [format, setFormat] = useState<'raw' | 'ini'>('raw');
	const [codeName, setCodeName] = useState(table.title);
	const [author, setAuthor] = useState('');
	const [codeDescription, setCodeDescription] = useState('');
	const [copied, setCopied] = useState(false);

	const changed = useMemo(
		() =>
			table.cells.map((cell, i) => {
				const value = parseValue(values[i]);
				return value !== null && value !== cell.default;
			}),
		[table.cells, values]
	);
	const lines = useMemo(
		() =>
			geckoLines(
				table.cells.flatMap((cell, i) => (changed[i] ? [{ address: cell.address, type: cell.type, value: Number(values[i]) }] : []))
			),
		[table.cells, changed, values]
	);
	const changedCount = changed.filter(Boolean).length;
	const output = !lines.length
		? ''
		: format === 'ini'
			? formatIni({ name: codeName, author, description: codeDescription, lines })
			: lines.join('\n');

	const setValue = (index: number, value: string) =>
		setValues((previous) => {
			const next = previous.slice();
			next[index] = value;
			return next;
		});
	const resetCell = (index: number) => setValue(index, String(table.cells[index].default));
	const resetAll = () => setValues(table.cells.map((cell) => String(cell.default)));
	const randomize = () => {
		const fallback = table.randomize;
		if (fallback) setValues(table.cells.map((cell) => String(randomValue(cell, fallback))));
	};
	const copy = async () => {
		try {
			await navigator.clipboard.writeText(output);
			setCopied(true);
			setTimeout(() => setCopied(false), 1500);
		} catch {
			// Clipboard access can be denied; the textarea is still selectable.
		}
	};
	const download = () => {
		const blob = new Blob([output + '\n'], { type: 'text/plain' });
		const url = URL.createObjectURL(blob);
		const link = document.createElement('a');
		link.href = url;
		link.download = `${table.id}.${format === 'ini' ? 'ini' : 'txt'}`;
		link.click();
		URL.revokeObjectURL(url);
	};

	const cellIndex = (row: number, col: number) => {
		let index = 0;
		tabs.forEach((tab, k) => {
			index += tab * stride[k];
		});
		index += row * stride[tabs.length];
		if (colAxis) index += col * stride[tabs.length + 1];
		return index;
	};

	const rawCount = table.cells.filter((cell) => !cell.fromHeader).length;
	const legend = table.columns.filter((column) => column.description);
	const selectTab = (k: number, i: number) =>
		setTabs((previous) => {
			const next = previous.slice();
			next[k] = i;
			return next;
		});

	return (
		<div className="space-y-6">
			<div>
				<PageHeader kicker={groupTitle} title={table.title} />
				<div className="-mt-3 max-w-prose space-y-2">
					<p className="text-sm text-fog-300">{table.description}</p>
					{table.notes.length > 0 && (
						<ul className="list-disc space-y-1 pl-5 text-xs text-fog-500">
							{table.notes.map((note) => (
								<li key={note}>{note}</li>
							))}
						</ul>
					)}
					<p className="font-mono text-xs text-fog-500">
						{table.symbol ? `GameData.h · ${table.symbol}` : rawCount === table.cells.length ? 'Raw addresses (not labeled in GameData.h)' : ''}
						{table.kind === 'constants' && rawCount > 0 && rawCount < table.cells.length && `${rawCount} raw address${rawCount === 1 ? '' : 'es'} (marked *)`}
					</p>
				</div>
			</div>

			<div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
				<Panel className="min-w-0">
					{tabAxes.length > 0 && (
						<div className="space-y-3 px-4 pb-1 pt-4">
							{tabAxes.map((axis, k) => (
								<div key={axis.name} className="flex flex-wrap items-center gap-x-3 gap-y-2">
									<span className="label !mb-0">{axis.name}</span>
									{axis.labels.length <= 6 ? (
										<div className="seg max-w-full flex-wrap" role="group" aria-label={axis.name}>
											{axis.labels.map((label, i) => (
												<button key={label} type="button" aria-pressed={tabs[k] === i} onClick={() => selectTab(k, i)}>
													{label}
												</button>
											))}
										</div>
									) : (
										<div className="flex flex-wrap gap-1.5" role="group" aria-label={axis.name}>
											{axis.labels.map((label, i) => (
												<button
													key={label}
													type="button"
													aria-pressed={tabs[k] === i}
													onClick={() => selectTab(k, i)}
													className={`rounded-[5px] border px-2.5 pb-1 pt-1.5 text-xs font-semibold transition-colors ${
														tabs[k] === i ? 'key-on' : 'key-off'
													}`}
												>
													{label}
												</button>
											))}
										</div>
									)}
								</div>
							))}
						</div>
					)}

					<div className={`overflow-x-auto ${tabAxes.length > 0 ? 'pt-3' : ''}`}>
						<table className="stat-table">
							<thead>
								<tr>
									<th className="sticky left-0 z-10 !bg-[#081811]">{rowAxis.name}</th>
									{colAxis ? (
										colAxis.labels.map((label, c) => (
											<th key={label} className="text-center" title={table.columns[c]?.description}>
												<AxisLabel label={label} kind={colAxis.kind} />
											</th>
										))
									) : (
										<>
											<th className="text-center">Default</th>
											<th className="text-center">Value</th>
										</>
									)}
								</tr>
							</thead>
							<tbody>
								{rowAxis.labels.map((label, r) => (
									<tr key={label}>
										<td className={`${stickyCell} font-medium text-fog-100`}>
											{colAxis ? (
												<AxisLabel label={label} kind={rowAxis.kind} />
											) : (
												<div className="whitespace-normal">
													<span>
														{label}
														{!table.cells[cellIndex(r, 0)].fromHeader && <span title="Raw address (not labeled in GameData.h)"> *</span>}
													</span>
													{table.cells[cellIndex(r, 0)].description && (
														<p className="mt-0.5 max-w-md text-xs font-normal text-fog-500">{table.cells[cellIndex(r, 0)].description}</p>
													)}
													<p className="mt-0.5 font-mono text-[10px] font-normal text-fog-500">{hexAddress(table.cells[cellIndex(r, 0)].address)}</p>
												</div>
											)}
										</td>
										{(colAxis ? colAxis.labels : ['']).map((_, c) => {
											const index = cellIndex(r, c);
											const cell = table.cells[index];
											return (
												<CellRow key={c} single={!colAxis} cell={cell}>
													<CellInput
														cell={cell}
														value={values[index]}
														changed={changed[index]}
														onChange={(value) => setValue(index, value)}
														onReset={() => resetCell(index)}
													/>
												</CellRow>
											);
										})}
									</tr>
								))}
							</tbody>
						</table>
					</div>

					{legend.length > 0 && (
						<dl className="grid max-w-[110ch] gap-x-6 gap-y-1 px-4 pb-4 pt-2 text-xs sm:grid-cols-2">
							{legend.map((column) => (
								<div key={column.label}>
									<dt className="inline font-semibold text-fog-300">{column.label}: </dt>
									<dd className="inline text-fog-500">{column.description}</dd>
								</div>
							))}
						</dl>
					)}
				</Panel>

				<Panel className="h-fit xl:sticky xl:top-20">
					<PanelHeader
						title="Gecko Code"
						action={
							<span className="font-mono text-xs tabular-nums text-fog-500">
								<span className={changedCount ? 'text-star-400' : undefined}>{changedCount}</span> of {table.cells.length} values
								changed
							</span>
						}
					/>
					<div className="space-y-4 p-4">
						<div className="flex flex-wrap items-center justify-between gap-2">
							<div className="seg" role="group" aria-label="Output format">
								<button type="button" aria-pressed={format === 'raw'} onClick={() => setFormat('raw')}>
									Raw lines
								</button>
								<button type="button" aria-pressed={format === 'ini'} onClick={() => setFormat('ini')}>
									.ini block
								</button>
							</div>
							<span className="font-mono text-xs tabular-nums text-fog-500">{lines.length} lines</span>
						</div>
						{format === 'ini' && (
							<div className="space-y-3">
								<div>
									<label className="label" htmlFor="code-name">
										Code name
									</label>
									<input id="code-name" className="input" value={codeName} onChange={(event) => setCodeName(event.target.value)} />
								</div>
								<div>
									<label className="label" htmlFor="code-author">
										Author
									</label>
									<input id="code-author" className="input" value={author} onChange={(event) => setAuthor(event.target.value)} />
								</div>
								<div>
									<label className="label" htmlFor="code-description">
										Description
									</label>
									<textarea
										id="code-description"
										className="input"
										rows={2}
										value={codeDescription}
										onChange={(event) => setCodeDescription(event.target.value)}
									/>
								</div>
							</div>
						)}
						<textarea
							readOnly
							rows={10}
							aria-label="Generated Gecko code"
							className="well block w-full resize-y px-3 pb-2.5 pt-3 font-mono text-xs leading-relaxed text-fog-100 placeholder:font-body placeholder:text-fog-500"
							value={output}
							placeholder="Change a value to generate code."
							onFocus={(event) => event.target.select()}
						/>
						<div className="flex flex-wrap gap-2">
							<button type="button" className={`btn-primary ${disabledClass}`} onClick={copy} disabled={!lines.length}>
								{copied ? 'Copied!' : 'Copy'}
							</button>
							<button type="button" className={`btn-secondary ${disabledClass}`} onClick={download} disabled={!lines.length}>
								Download {format === 'ini' ? '.ini' : '.txt'}
							</button>
						</div>
						<div className="flex flex-wrap gap-2">
							<button type="button" className={keyClass} onClick={resetAll} disabled={!changedCount}>
								Reset all
							</button>
							{table.randomize && (
								<button type="button" className={keyClass} onClick={randomize}>
									Randomize
								</button>
							)}
						</div>
						<p className="text-xs text-fog-500">
							Add the code to your Gecko code list in Project Rio or Dolphin. Values are written directly to memory when the
							code is active.
						</p>
					</div>
				</Panel>
			</div>
		</div>
	);
}

function CellRow({ single, cell, children }: { single: boolean; cell: ResolvedCell; children: React.ReactNode }) {
	if (!single) return <td className="text-center">{children}</td>;
	return (
		<>
			<td className="text-center font-mono text-fog-500">{cell.default}</td>
			<td className="text-center">{children}</td>
		</>
	);
}
