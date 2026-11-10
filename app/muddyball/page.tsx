'use client';

import { Suspense, useEffect, useMemo, useState, type DragEvent } from 'react';
import { useSearchParams } from 'next/navigation';
import { characterImage } from '@/lib/data/characters';
import { PageHeader } from '@/components/ui';

const BUDGET = 40;
const MAX_PLAYERS = 9;
const STADIUM_PRICE = 3;
const EMPTY = '_';

const characterData: { name: string; price: number }[] = [
	{ name: 'Mario', price: 7 },
	{ name: 'Luigi', price: 6 },
	{ name: 'DK', price: 10 },
	{ name: 'Diddy', price: 4 },
	{ name: 'Peach', price: 5 },
	{ name: 'Daisy', price: 4 },
	{ name: 'Yoshi', price: 8 },
	{ name: 'Baby Mario', price: 2 },
	{ name: 'Baby Luigi', price: 2 },
	{ name: 'Bowser', price: 12 },
	{ name: 'Wario', price: 7 },
	{ name: 'Waluigi', price: 7 },
	{ name: 'Koopa(G)', price: 1 },
	{ name: 'Toad(R)', price: 4 },
	{ name: 'Boo', price: 6 },
	{ name: 'Toadette', price: 3 },
	{ name: 'Shy Guy(R)', price: 2 },
	{ name: 'Birdo', price: 8 },
	{ name: 'Monty', price: 1 },
	{ name: 'Bowser Jr', price: 3 },
	{ name: 'Paratroopa(R)', price: 1 },
	{ name: 'Pianta(B)', price: 4 },
	{ name: 'Pianta(R)', price: 5 },
	{ name: 'Pianta(Y)', price: 4 },
	{ name: 'Noki(B)', price: 3 },
	{ name: 'Noki(R)', price: 3 },
	{ name: 'Noki(G)', price: 6 },
	{ name: 'Bro(H)', price: 9 },
	{ name: 'Toadsworth', price: 5 },
	{ name: 'Toad(B)', price: 4 },
	{ name: 'Toad(Y)', price: 4 },
	{ name: 'Toad(G)', price: 4 },
	{ name: 'Toad(P)', price: 4 },
	{ name: 'Magikoopa(B)', price: 8 },
	{ name: 'Magikoopa(R)', price: 8 },
	{ name: 'Magikoopa(G)', price: 8 },
	{ name: 'Magikoopa(Y)', price: 8 },
	{ name: 'King Boo', price: 8 },
	{ name: 'Petey', price: 10 },
	{ name: 'Dixie', price: 4 },
	{ name: 'Goomba', price: 1 },
	{ name: 'Paragoomba', price: 1 },
	{ name: 'Koopa(R)', price: 2 },
	{ name: 'Paratroopa(G)', price: 5 },
	{ name: 'Shy Guy(B)', price: 2 },
	{ name: 'Shy Guy(Y)', price: 2 },
	{ name: 'Shy Guy(G)', price: 2 },
	{ name: 'Shy Guy(Bk)', price: 2 },
	{ name: 'Dry Bones(Gy)', price: 2 },
	{ name: 'Dry Bones(G)', price: 5 },
	{ name: 'Dry Bones(R)', price: 2 },
	{ name: 'Dry Bones(B)', price: 2 },
	{ name: 'Bro(F)', price: 9 },
	{ name: 'Bro(B)', price: 9 }
];

const priceMap: Record<string, number> = Object.fromEntries(characterData.map((c) => [c.name, c.price]));
const nameToId: Record<string, number> = Object.fromEntries(characterData.map((c, i) => [c.name, i]));
const idToName: Record<number, string> = Object.fromEntries(characterData.map((c, i) => [i, c.name]));

const fieldPositions = [
	{ label: 'P', name: 'Pitcher', x: 50, y: 63 },
	{ label: 'C', name: 'Catcher', x: 50, y: 86 },
	{ label: '1B', name: 'First Base', x: 74, y: 58 },
	{ label: '2B', name: 'Second Base', x: 62, y: 42 },
	{ label: '3B', name: 'Third Base', x: 26, y: 58 },
	{ label: 'SS', name: 'Shortstop', x: 38, y: 42 },
	{ label: 'LF', name: 'Left Field', x: 18, y: 26 },
	{ label: 'CF', name: 'Center Field', x: 50, y: 18 },
	{ label: 'RF', name: 'Right Field', x: 82, y: 26 }
];

type Roster = (string | null)[];

function MuddyballDraft() {
	const searchParams = useSearchParams();
	const [roster, setRoster] = useState<Roster>(Array(MAX_PLAYERS).fill(null));
	const [lineupOrder, setLineupOrder] = useState<number[]>([0, 1, 2, 3, 4, 5, 6, 7, 8]);
	const [stadiumPicked, setStadiumPicked] = useState(false);
	const [search, setSearch] = useState('');
	const [sortBy, setSortBy] = useState<'price-desc' | 'price-asc' | 'name' | 'tier'>('tier');
	const [copied, setCopied] = useState(false);
	const [rosterView, setRosterView] = useState<'lineup' | 'field'>('lineup');

	const [dragFrom, setDragFrom] = useState<number | null>(null);
	const [dragOver, setDragOver] = useState<number | null>(null);
	const [selectedFieldSlot, setSelectedFieldSlot] = useState<number | null>(null);
	const [lineupDragFrom, setLineupDragFrom] = useState<number | null>(null);
	const [lineupDragOver, setLineupDragOver] = useState<number | null>(null);

	// Restore a shared draft from the URL once on load.
	useEffect(() => {
		const r = searchParams.get('r');
		const hasStadium = searchParams.get('s') === '1';
		if (r) {
			const slots = r
				.split(',')
				.slice(0, MAX_PLAYERS)
				.map((s) => (s === EMPTY ? null : (idToName[Number(s)] ?? null)));
			let total = hasStadium ? STADIUM_PRICE : 0;
			setRoster(
				slots.map((name) => {
					if (!name) return null;
					if (total + priceMap[name] <= BUDGET) {
						total += priceMap[name];
						return name;
					}
					return null;
				})
			);
		}
		const lo = searchParams.get('lo');
		if (lo) {
			const parsed = lo.split(',').map(Number);
			if (parsed.length === MAX_PLAYERS && parsed.every((n) => n >= 0 && n < MAX_PLAYERS)) {
				setLineupOrder(parsed);
			}
		}
		if (hasStadium) setStadiumPicked(true);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const filledCount = roster.filter(Boolean).length;
	const spent =
		roster.reduce((sum, name) => sum + (name ? priceMap[name] : 0), 0) + (stadiumPicked ? STADIUM_PRICE : 0);
	const remaining = BUDGET - spent;
	const rosterFull = filledCount >= MAX_PLAYERS;
	const budgetPct = Math.min(100, (spent / BUDGET) * 100);

	const filtered = useMemo(
		() =>
			characterData
				.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()))
				.sort((a, b) => {
					if (sortBy === 'price-desc' || sortBy === 'tier') return b.price - a.price;
					if (sortBy === 'price-asc') return a.price - b.price;
					return a.name.localeCompare(b.name);
				}),
		[search, sortBy]
	);

	const tiers = sortBy === 'tier' ? [...new Set(filtered.map((c) => c.price))].sort((a, b) => b - a) : [];

	function addCharacter(name: string) {
		if (rosterFull || spent + priceMap[name] > BUDGET) return;
		const idx = roster.findIndex((s) => s === null);
		if (idx === -1) return;
		setRoster(roster.map((s, i) => (i === idx ? name : s)));
	}

	function removeAt(i: number) {
		setRoster(roster.map((s, idx) => (idx === i ? null : s)));
	}

	function swapFieldSlots(a: number, b: number) {
		const next = [...roster];
		[next[a], next[b]] = [next[b], next[a]];
		setLineupOrder(lineupOrder.map((idx) => (idx === a ? b : idx === b ? a : idx)));
		setRoster(next);
	}

	function handleFieldTap(i: number) {
		if (selectedFieldSlot === null) {
			if (roster[i]) setSelectedFieldSlot(i);
		} else if (selectedFieldSlot === i) {
			setSelectedFieldSlot(null);
		} else {
			swapFieldSlots(selectedFieldSlot, i);
			setSelectedFieldSlot(null);
		}
	}

	function onDragStart(i: number, event: DragEvent) {
		if (!roster[i]) {
			event.preventDefault();
			return;
		}
		setSelectedFieldSlot(null);
		setDragFrom(i);
		event.dataTransfer.effectAllowed = 'move';
	}

	function onDrop(i: number, event: DragEvent) {
		event.preventDefault();
		if (dragFrom !== null && dragFrom !== i) swapFieldSlots(dragFrom, i);
		setDragFrom(null);
		setDragOver(null);
	}

	function onLineupDrop(li: number, event: DragEvent) {
		event.preventDefault();
		if (lineupDragFrom !== null && lineupDragFrom !== li) {
			const next = [...lineupOrder];
			[next[lineupDragFrom], next[li]] = [next[li], next[lineupDragFrom]];
			setLineupOrder(next);
		}
		setLineupDragFrom(null);
		setLineupDragOver(null);
	}

	function reset() {
		setRoster(Array(MAX_PLAYERS).fill(null));
		setLineupOrder([0, 1, 2, 3, 4, 5, 6, 7, 8]);
		setStadiumPicked(false);
		setCopied(false);
	}

	function shareDraft() {
		const encoded = roster.map((s) => (s != null ? nameToId[s] : EMPTY)).join(',');
		const params = new URLSearchParams({ r: encoded, lo: lineupOrder.join(',') });
		if (stadiumPicked) params.set('s', '1');
		const url = `${window.location.origin}/muddyball?${params.toString()}`;
		navigator.clipboard.writeText(url).then(() => {
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		});
	}

	const budgetColor = remaining > 5 ? 'text-emerald-400' : remaining >= 0 ? 'text-star-400' : 'text-rio-400';
	const budgetBarColor = remaining > 5 ? 'bg-emerald-500' : remaining >= 0 ? 'bg-star-500' : 'bg-rio-500';

	return (
		<div>
			<PageHeader kicker="Draft mode" title="Muddyball" />
			<div className="flex flex-col gap-6 lg:flex-row">
				{/* Draft board */}
				<div className={`shrink-0 transition-all duration-300 ${rosterView === 'field' ? 'lg:w-md' : 'lg:w-72'}`}>
					<div className="panel space-y-4 p-4 lg:sticky lg:top-20">
						<h2 className="font-display text-lg font-bold uppercase tracking-wide">Draft Board</h2>

						{/* Budget */}
						<div>
							<div className="mb-1 flex justify-between text-sm">
								<span className="font-medium">Budget</span>
								<span className={`font-mono font-bold ${budgetColor}`}>${remaining} left</span>
							</div>
							<div className="h-2 w-full rounded-full bg-night-700">
								<div
									className={`h-2 rounded-full transition-all duration-300 ${budgetBarColor}`}
									style={{ width: `${budgetPct}%` }}
								/>
							</div>
							<div className="mt-1 text-xs text-fog-500">
								${spent} / ${BUDGET} · {filledCount}/{MAX_PLAYERS} players
							</div>
						</div>

						{/* View tabs */}
						<div className="flex gap-1 text-sm">
							{(['lineup', 'field'] as const).map((view) => (
								<button
									key={view}
									className={`flex-1 rounded-md border py-1.5 font-display font-semibold uppercase tracking-wider transition-colors ${
										rosterView === view ? 'sel text-fog-100' : 'border-transparent text-fog-300 hover:text-fog-100'
									}`}
									onClick={() => setRosterView(view)}
								>
									{view}
								</button>
							))}
						</div>

						{rosterView === 'lineup' ? (
							<div className="space-y-1">
								{lineupOrder.map((rosterIdx, li) => {
									const name = roster[rosterIdx];
									const isDragSource = lineupDragFrom === li;
									const isDragTarget = lineupDragOver === li && lineupDragFrom !== null && lineupDragFrom !== li;
									return (
										<div
											key={li}
											draggable
											role="listitem"
											className={`flex cursor-grab select-none items-center gap-2 rounded-lg p-1.5 transition-all active:cursor-grabbing ${
												name ? 'bg-night-800' : 'border border-dashed border-night-600 opacity-50'
											} ${isDragSource ? 'scale-95 opacity-40' : ''} ${isDragTarget ? 'scale-[1.02] ring-2 ring-star-400' : ''}`}
											onDragStart={(event) => {
												setLineupDragFrom(li);
												event.dataTransfer.effectAllowed = 'move';
											}}
											onDragOver={(event) => {
												event.preventDefault();
												event.dataTransfer.dropEffect = 'move';
												setLineupDragOver(li);
											}}
											onDragLeave={() => {
												if (lineupDragOver === li) setLineupDragOver(null);
											}}
											onDrop={(event) => onLineupDrop(li, event)}
											onDragEnd={() => {
												setLineupDragFrom(null);
												setLineupDragOver(null);
											}}
										>
											<span className="shrink-0 text-sm leading-none text-fog-500">⠿</span>
											<span className="w-4 shrink-0 font-mono text-xs tabular-nums text-fog-500">{li + 1}</span>
											{name ? (
												<>
													{/* eslint-disable-next-line @next/next/no-img-element */}
													<img src={characterImage(name)} alt={name} className="h-7 w-7 shrink-0 object-contain" />
													<span className="flex-1 truncate text-xs">{name}</span>
													<span className="font-mono text-xs tabular-nums text-star-400">${priceMap[name]}</span>
													<button
														className="h-5 w-5 rounded text-xs leading-none text-rio-400 hover:bg-rio-500/20"
														onClick={() => removeAt(rosterIdx)}
														aria-label={`Remove ${name}`}
													>
														✕
													</button>
												</>
											) : (
												<>
													<div className="h-7 w-7 rounded bg-night-700" />
													<span className="text-xs text-fog-500">empty</span>
												</>
											)}
										</div>
									);
								})}
							</div>
						) : (
							<>
								<div className="relative w-full select-none overflow-hidden rounded-lg" style={{ aspectRatio: '1 / 1' }}>
									<svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice">
										<rect width="100" height="100" fill="#2d6a4f" />
										<polygon points="50,36 74,60 50,84 26,60" fill="#c8a97e" />
										<circle cx="50" cy="60" r="3" fill="#b8956e" />
										<polygon points="50,36 74,60 50,84 26,60" fill="none" stroke="#a07850" strokeWidth="0.5" />
										<rect x="48" y="34" width="4" height="4" fill="white" rx="0.5" />
										<rect x="72" y="58" width="4" height="4" fill="white" rx="0.5" />
										<polygon points="48,82 52,82 52,85 50,87 48,85" fill="white" />
										<rect x="24" y="58" width="4" height="4" fill="white" rx="0.5" />
									</svg>

									{fieldPositions.map((pos, i) => {
										const name = roster[i];
										const isDragSource = dragFrom === i;
										const isDragTarget = dragOver === i && dragFrom !== null && dragFrom !== i;
										const isSelected = selectedFieldSlot === i;
										const isSwapTarget = selectedFieldSlot !== null && selectedFieldSlot !== i;
										return (
											<div
												key={pos.label}
												className="absolute z-10 -translate-x-1/2 -translate-y-1/2 transform"
												style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
												draggable={!!name}
												role="button"
												tabIndex={0}
												aria-label={`${pos.label}: ${name ?? 'empty'}`}
												onDragStart={(event) => onDragStart(i, event)}
												onDragOver={(event) => {
													event.preventDefault();
													event.dataTransfer.dropEffect = 'move';
													setDragOver(i);
												}}
												onDragLeave={() => {
													if (dragOver === i) setDragOver(null);
												}}
												onDrop={(event) => onDrop(i, event)}
												onDragEnd={() => {
													setDragFrom(null);
													setDragOver(null);
												}}
												onKeyDown={(event) => {
													if ((event.key === 'Delete' || event.key === 'Backspace') && name) removeAt(i);
												}}
											>
												{name ? (
													<div
														className={`flex flex-col items-center gap-0.5 transition-all ${
															isDragSource ? 'scale-90 opacity-40' : ''
														} ${isDragTarget ? 'scale-110' : ''}`}
													>
														<div className="relative">
															<button
																className={`block rounded-full p-0.5 transition-all ${
																	isSelected ? 'scale-110 ring-2 ring-white' : ''
																} ${isDragTarget ? 'ring-2 ring-white' : ''}`}
																onClick={() => handleFieldTap(i)}
																title={`${isSelected ? 'Tap another slot to swap' : 'Tap to select · Drag to move'} (${pos.name})`}
															>
																{/* eslint-disable-next-line @next/next/no-img-element */}
																<img
																	src={characterImage(name)}
																	alt={name}
																	className={`h-9 w-9 object-contain drop-shadow-lg transition-opacity ${
																		isSelected ? '' : 'hover:opacity-70'
																	}`}
																/>
															</button>
															{isSelected && (
																<button
																	className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-rio-500 text-[9px] leading-none text-white"
																	onClick={(event) => {
																		event.stopPropagation();
																		removeAt(i);
																		setSelectedFieldSlot(null);
																	}}
																	title={`Remove ${name}`}
																>
																	✕
																</button>
															)}
														</div>
														<span className="rounded bg-black/60 px-1 text-[9px] font-bold leading-tight text-white">
															{pos.label}
														</span>
													</div>
												) : (
													<button
														className={`flex flex-col items-center gap-0.5 transition-all ${
															isDragTarget || isSwapTarget ? 'scale-110 opacity-100' : 'opacity-60'
														}`}
														onClick={() => handleFieldTap(i)}
													>
														<div
															className={`flex h-9 w-9 items-center justify-center rounded-full border-2 transition-all ${
																isDragTarget || isSwapTarget
																	? 'border-white bg-white/20'
																	: 'border-dashed border-white/40'
															}`}
														>
															<span className="text-xs text-white/70">{isDragTarget || isSwapTarget ? '↓' : '+'}</span>
														</div>
														<span className="text-[9px] font-bold text-white/70">{pos.label}</span>
													</button>
												)}
											</div>
										);
									})}
								</div>
								<p className="text-center text-xs text-fog-500">
									Tap to select &amp; swap · Drag to rearrange · Tap ✕ to remove
								</p>
							</>
						)}

						{/* Stadium */}
						<div
							className={`flex cursor-pointer items-center justify-between rounded-lg border p-2 transition-colors ${
								stadiumPicked
									? 'sel'
									: remaining >= STADIUM_PRICE
										? 'border-night-600 hover:bg-night-800'
										: 'cursor-not-allowed border-night-600 opacity-40'
							}`}
							role="checkbox"
							aria-checked={stadiumPicked}
							tabIndex={0}
							onClick={() => {
								if (stadiumPicked || remaining >= STADIUM_PRICE) setStadiumPicked(!stadiumPicked);
							}}
							onKeyDown={(event) => {
								if (event.key === ' ' || event.key === 'Enter') {
									event.preventDefault();
									if (stadiumPicked || remaining >= STADIUM_PRICE) setStadiumPicked(!stadiumPicked);
								}
							}}
						>
							<div>
								<div className="text-sm font-medium">Stadium Choice</div>
								<div className="text-xs text-fog-500">optional add-on</div>
							</div>
							<div className="flex items-center gap-2">
								<span className="rounded bg-star-400 px-1.5 font-mono text-xs text-night-950">$3</span>
								<div
									className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 ${
										stadiumPicked ? 'border-star-400 bg-star-400' : 'border-night-600'
									}`}
								>
									{stadiumPicked && <span className="text-xs text-night-950">✓</span>}
								</div>
							</div>
						</div>

						{/* Actions */}
						<div className="flex gap-2">
							<button className="btn-primary flex-1 !px-3 !py-2 text-xs" onClick={shareDraft} disabled={filledCount === 0}>
								{copied ? '✓ Copied!' : 'Share Link'}
							</button>
							<button className="btn-secondary flex-1 !px-3 !py-2 text-xs" onClick={reset} disabled={filledCount === 0}>
								Reset
							</button>
						</div>
					</div>
				</div>

				{/* Character browser */}
				<div className="min-w-0 flex-1">
					<div className="mb-3 flex flex-wrap items-center gap-2">
						<h2 className="mr-2 font-display text-lg font-bold uppercase tracking-wide">Characters</h2>
						<input
							className="input !w-40"
							type="search"
							placeholder="Search…"
							value={search}
							onChange={(event) => setSearch(event.target.value)}
						/>
						<select className="input !w-36 text-xs" value={sortBy} onChange={(event) => setSortBy(event.target.value as any)}>
							<option value="price-desc">$ High → Low</option>
							<option value="price-asc">$ Low → High</option>
							<option value="name">Name A–Z</option>
							<option value="tier">$ Tiers</option>
						</select>
					</div>

					{sortBy === 'tier' ? (
						<div className="flex flex-wrap items-start gap-x-6 gap-y-4">
							{tiers.map((tier) => (
								<div key={tier} className="flex flex-col gap-1">
									<span className="self-start rounded bg-star-400 px-1.5 font-mono text-xs text-night-950">${tier}</span>
									<div className="flex flex-wrap gap-1.5">
										{filtered
											.filter((c) => c.price === tier)
											.map((char) => (
												<CharButton
													key={char.name}
													char={char}
													affordable={!rosterFull && spent + char.price <= BUDGET}
													rosterFull={rosterFull}
													onAdd={addCharacter}
													showPrice={false}
												/>
											))}
									</div>
								</div>
							))}
						</div>
					) : (
						<div className="grid grid-cols-4 gap-2 sm:grid-cols-5 md:grid-cols-6 xl:grid-cols-8">
							{filtered.map((char) => (
								<CharButton
									key={char.name}
									char={char}
									affordable={!rosterFull && spent + char.price <= BUDGET}
									rosterFull={rosterFull}
									onAdd={addCharacter}
									showPrice
								/>
							))}
						</div>
					)}
				</div>
			</div>
		</div>
	);
}

function CharButton({
	char,
	affordable,
	rosterFull,
	onAdd,
	showPrice
}: {
	char: { name: string; price: number };
	affordable: boolean;
	rosterFull: boolean;
	onAdd: (name: string) => void;
	showPrice: boolean;
}) {
	return (
		<button
			className={`panel flex flex-col items-center gap-0.5 p-1.5 text-center transition-all ${
				affordable ? 'panel-glow cursor-pointer hover:scale-105' : 'cursor-not-allowed'
			}`}
			style={affordable ? undefined : { opacity: 0.3, filter: 'grayscale(1)' }}
			onClick={() => onAdd(char.name)}
			disabled={!affordable}
			title={rosterFull ? 'Roster full' : !affordable ? 'Over budget' : `Add ${char.name}`}
		>
			{/* eslint-disable-next-line @next/next/no-img-element */}
			<img src={characterImage(char.name)} alt={char.name} className="h-10 w-10 object-contain" />
			<span className="text-[10px] leading-tight">{char.name}</span>
			{showPrice && <span className="rounded bg-star-400 px-1 font-mono text-[10px] text-night-950">${char.price}</span>}
		</button>
	);
}

export default function MuddyballPage() {
	return (
		<Suspense>
			<MuddyballDraft />
		</Suspense>
	);
}
