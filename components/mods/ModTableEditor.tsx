'use client';

import { useMemo, useState } from 'react';
import { characterImage } from '@/lib/data/characters';
import { formatIni, geckoLines } from '@/lib/mods/gecko';
import { Panel, PanelHeader } from '@/components/ui';
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

const inputClass = 'input !w-24 !px-2 !py-1 text-center text-sm';
const changedClass = '!border-rio-400 text-rio-300';

function ResetButton({ onClick }: { onClick: () => void }) {
	return (
		<button
			type="button"
			onClick={onClick}
			title="Reset to default"
			aria-label="Reset to default"
			className="shrink-0 text-sm text-fog-500 transition-colors hover:text-rio-300"
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
			<div className="mt-1 space-y-1 rounded border border-night-600 bg-night-850 p-2 text-left">
				{options
					.filter((o) => o.value !== 0)
					.map((option) => (
						<label key={option.value} className="flex items-center gap-2 text-xs text-fog-300">
							<input
								type="checkbox"
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
			<div className="flex items-start gap-1">
				<FlagsInput cell={cell} value={value} onChange={onChange} />
				{changed && <ResetButton onClick={onReset} />}
			</div>
		);
	}
	if (cell.display === 'select' && cell.options) {
		return (
			<div className="flex items-center gap-1">
				<select
					className={`${inputClass} !w-32 ${changed ? changedClass : ''}`}
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
		<div className="flex items-center gap-1">
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

	return (
		<div className="space-y-6">
			<div>
				<p className="kicker">{groupTitle}</p>
				<h1 className="mt-1 text-4xl uppercase">{table.title}</h1>
				<p className="mt-3 max-w-3xl text-sm text-fog-300">{table.description}</p>
				{table.notes.length > 0 && (
					<ul className="mt-2 max-w-3xl list-disc space-y-1 pl-5 text-xs text-fog-500">
						{table.notes.map((note) => (
							<li key={note}>{note}</li>
						))}
					</ul>
				)}
				<p className="mt-2 font-mono text-xs text-fog-500">
					{table.symbol ? `GameData.h · ${table.symbol}` : rawCount === table.cells.length ? 'Raw addresses (not labeled in GameData.h)' : ''}
					{table.kind === 'constants' && rawCount > 0 && rawCount < table.cells.length && `${rawCount} raw address${rawCount === 1 ? '' : 'es'} (marked *)`}
				</p>
			</div>

			<div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
				<Panel>
					<div className="flex flex-wrap items-center justify-between gap-3 border-b border-night-700 bg-night-850 px-4 py-3">
						<div className="flex flex-wrap items-center gap-2">
							<button type="button" className="btn-secondary !px-4 !py-1.5 text-xs" onClick={resetAll} disabled={!changedCount}>
								Reset all
							</button>
							{table.randomize && (
								<button type="button" className="btn-secondary !px-4 !py-1.5 text-xs" onClick={randomize}>
									Randomize
								</button>
							)}
						</div>
						<span className="text-xs text-fog-500">
							{changedCount} of {table.cells.length} values changed
						</span>
					</div>

					{tabAxes.length > 0 && (
						<div className="space-y-2 border-b border-night-700 px-4 py-3">
							{tabAxes.map((axis, k) => (
								<div key={axis.name} className="flex flex-wrap items-center gap-1.5">
									<span className="label !mb-0 mr-2">{axis.name}</span>
									{axis.labels.map((label, i) => (
										<button
											key={label}
											type="button"
											onClick={() =>
												setTabs((previous) => {
													const next = previous.slice();
													next[k] = i;
													return next;
												})
											}
											className={`rounded px-3 py-1 font-display text-xs font-semibold uppercase tracking-wider transition-colors ${
												tabs[k] === i ? 'bg-rio-500 text-white' : 'bg-night-800 text-fog-300 hover:text-fog-100'
											}`}
										>
											{label}
										</button>
									))}
								</div>
							))}
						</div>
					)}

					<div className="overflow-x-auto">
						<table className="stat-table">
							<thead>
								<tr>
									<th className="sticky left-0 z-10 bg-night-850">{rowAxis.name}</th>
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
										<td className="sticky left-0 z-10 bg-night-900 font-medium text-fog-100">
											{colAxis ? (
												<AxisLabel label={label} kind={rowAxis.kind} />
											) : (
												<div className="whitespace-normal">
													<span>
														{label}
														{!table.cells[cellIndex(r, 0)].fromHeader && <span title="Raw address (not labeled in GameData.h)"> *</span>}
													</span>
													{table.cells[cellIndex(r, 0)].description && (
														<p className="mt-0.5 max-w-md text-xs text-fog-500">{table.cells[cellIndex(r, 0)].description}</p>
													)}
													<p className="mt-0.5 font-mono text-[10px] text-fog-500">{hexAddress(table.cells[cellIndex(r, 0)].address)}</p>
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
						<dl className="grid gap-x-6 gap-y-1 border-t border-night-700 px-4 py-3 text-xs sm:grid-cols-2">
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
					<PanelHeader title="Gecko Code" action={<span className="text-xs text-fog-500">{lines.length} lines</span>} />
					<div className="space-y-3 p-4">
						<div className="flex gap-2">
							<button
								type="button"
								onClick={() => setFormat('raw')}
								className={`${format === 'raw' ? 'btn-primary' : 'btn-secondary'} !px-4 !py-1.5 text-xs`}
							>
								Raw lines
							</button>
							<button
								type="button"
								onClick={() => setFormat('ini')}
								className={`${format === 'ini' ? 'btn-primary' : 'btn-secondary'} !px-4 !py-1.5 text-xs`}
							>
								.ini block
							</button>
						</div>
						{format === 'ini' && (
							<div className="space-y-2">
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
							className="input font-mono text-xs"
							value={output}
							placeholder="Change a value to generate code."
							onFocus={(event) => event.target.select()}
						/>
						<div className="flex flex-wrap gap-2">
							<button type="button" className="btn-primary !px-4 !py-1.5 text-xs" onClick={copy} disabled={!lines.length}>
								{copied ? 'Copied!' : 'Copy'}
							</button>
							<button type="button" className="btn-secondary !px-4 !py-1.5 text-xs" onClick={download} disabled={!lines.length}>
								Download {format === 'ini' ? '.ini' : '.txt'}
							</button>
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
			<td className="text-center text-fog-500">{cell.default}</td>
			<td className="text-center">{children}</td>
		</>
	);
}
