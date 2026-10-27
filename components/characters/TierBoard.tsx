'use client';

// The community tier board: tier bands as angled banner rows, each character a
// clickable card that opens its dashboard. Hovering (or keyboard-focusing) a
// card raises a floating scouting card with the character's shape at a glance.

import { useCallback, useRef, useState } from 'react';
import Link from 'next/link';
import { characterImage, characterClasses } from '@/lib/data/characters';
import {
	tierLists,
	tierHue,
	canonicalVariant,
	characterWriteups,
	type CommunityTierList,
	type TierEntry,
	type TierName
} from '@/lib/data/characterContent';
import { attributesFor } from '@/lib/data/characterAttributes';
import { StatBars } from './StatBars';
import { Badge } from '@/components/ui';

const CLASS_BADGE: { [key: string]: 'red' | 'gold' | 'gray' | 'green' } = {
	Power: 'red',
	Technique: 'gold',
	Speed: 'green',
	Balance: 'gray'
};

interface HoverCard {
	entry: TierEntry;
	tier: TierName;
	// Viewport coords of the hovered cell, for pinning the scouting card.
	left: number;
	top: number;
	bottom: number;
}

const CARD_WIDTH = 300;

export function TierBoard() {
	const [listId, setListId] = useState<CommunityTierList['id']>('stars-off');
	const [hover, setHover] = useState<HoverCard | null>(null);
	const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

	const list = tierLists.find((l) => l.id === listId)!;

	const show = useCallback((entry: TierEntry, tier: TierName, target: HTMLElement) => {
		if (hideTimer.current) clearTimeout(hideTimer.current);
		const rect = target.getBoundingClientRect();
		setHover({ entry, tier, left: rect.left + rect.width / 2, top: rect.top, bottom: rect.bottom });
	}, []);

	const hide = useCallback(() => {
		if (hideTimer.current) clearTimeout(hideTimer.current);
		hideTimer.current = setTimeout(() => setHover(null), 80);
	}, []);

	return (
		<div className="space-y-4">
			{/* Stars Off / Stars On switch */}
			<div className="flex flex-wrap items-end justify-between gap-3">
				<div className="flex" role="tablist" aria-label="Tier list mode">
					{tierLists.map((l) => (
						<button
							key={l.id}
							role="tab"
							aria-selected={listId === l.id}
							onClick={() => {
								setListId(l.id);
								setHover(null);
							}}
							className={`px-5 py-2 font-display text-sm font-bold uppercase tracking-widest transition-colors first:[clip-path:polygon(0_0,100%_0,calc(100%-10px)_100%,0_100%)] last:-ml-[10px] last:[clip-path:polygon(10px_0,100%_0,100%_100%,0_100%)] ${
								listId === l.id
									? 'bg-rio-500 text-white'
									: 'bg-night-800 text-fog-500 hover:text-fog-300'
							}`}
						>
							{l.title}
						</button>
					))}
				</div>
				<p className="text-xs text-fog-500">
					{list.edition} · community average placement, lower is better
				</p>
			</div>

			{list.tiers.length === 0 ? (
				<div className="panel flex flex-col items-center gap-3 border-star-500/30 px-6 py-16 text-center">
					<span className="font-display text-3xl font-bold text-star-400">★</span>
					<p className="font-display text-lg font-bold uppercase tracking-wider text-fog-100">
						The council is still in session
					</p>
					<p className="max-w-md text-sm text-fog-500">
						The Superstars On tier list hasn&apos;t been ratified yet. The community vote lands
						here the moment it is.
					</p>
				</div>
			) : (
				<div className="space-y-2" onMouseLeave={hide}>
					{list.tiers.map((row) => {
						const hue = tierHue(row.tier);
						return (
							<div
								key={row.tier}
								className="grid grid-cols-[3.5rem_1fr] items-stretch gap-2 sm:grid-cols-[4.5rem_1fr]"
							>
								{/* Angled tier tab */}
								<div
									className="flex items-center justify-center [clip-path:polygon(0_0,100%_0,calc(100%-10px)_100%,0_100%)]"
									style={{ backgroundColor: `${hue}24`, color: hue }}
								>
									<span className="font-display text-2xl font-bold sm:text-3xl">{row.tier}</span>
								</div>
								<div className="flex flex-wrap gap-2">
									{row.entries.map((entry) => (
										<Link
											key={entry.character}
											href={`/characters/${encodeURIComponent(canonicalVariant(entry.character))}`}
											onMouseEnter={(e) => show(entry, row.tier, e.currentTarget)}
											onFocus={(e) => show(entry, row.tier, e.currentTarget)}
											onMouseLeave={hide}
											onBlur={hide}
											className="group flex w-[4.6rem] flex-col items-center rounded-lg border bg-night-900 px-1 py-2 outline-none transition-all focus-visible:ring-2 focus-visible:ring-rio-400 sm:w-20"
											style={{ borderColor: `${hue}40` }}
											onMouseOver={(e) => {
												e.currentTarget.style.borderColor = hue;
												e.currentTarget.style.boxShadow = `0 0 16px ${hue}30`;
											}}
											onMouseOut={(e) => {
												e.currentTarget.style.borderColor = `${hue}40`;
												e.currentTarget.style.boxShadow = 'none';
											}}
										>
											<span
												className="font-display text-[11px] font-bold tabular-nums"
												style={{ color: hue }}
											>
												{entry.rank}
											</span>
											{/* eslint-disable-next-line @next/next/no-img-element */}
											<img
												src={characterImage(canonicalVariant(entry.character))}
												alt={entry.character}
												className="h-11 w-11 object-contain transition-transform group-hover:scale-110"
											/>
											<span className="mt-1 text-[10px] tabular-nums text-fog-500">
												{entry.score.toFixed(2)}
											</span>
										</Link>
									))}
								</div>
							</div>
						);
					})}
				</div>
			)}

			{hover && <ScoutCard hover={hover} />}
		</div>
	);
}

// Only ever rendered after a client-side hover/focus event, so window is safe.
function ScoutCard({ hover }: { hover: HoverCard }) {
	const { entry, tier } = hover;
	const hue = tierHue(tier);
	const canonical = canonicalVariant(entry.character);
	const attrs = attributesFor(canonical);
	const writeup = characterWriteups[entry.character];
	const charClass = characterClasses[canonical]?.Class;

	// Pin below the cell, flipping above when there's no room; clamp into view.
	const below = hover.bottom + 260 < window.innerHeight;
	const left = Math.min(Math.max(hover.left - CARD_WIDTH / 2, 8), window.innerWidth - CARD_WIDTH - 8);

	return (
		<div
			className="pointer-events-none fixed z-50 hidden sm:block"
			style={{
				left,
				width: CARD_WIDTH,
				...(below ? { top: hover.bottom + 8 } : { bottom: window.innerHeight - hover.top + 8 })
			}}
		>
			<div
				className="rounded-xl border bg-night-850/95 p-4 shadow-2xl backdrop-blur"
				style={{ borderColor: `${hue}55`, boxShadow: `0 8px 40px rgba(0,0,0,.6), 0 0 24px ${hue}22` }}
			>
				<div className="flex items-center gap-3">
					{/* eslint-disable-next-line @next/next/no-img-element */}
					<img src={characterImage(canonical)} alt="" className="h-12 w-12 object-contain" />
					<div className="min-w-0">
						<p className="truncate font-display text-lg font-bold uppercase tracking-wide text-fog-100">
							{entry.character}
						</p>
						<div className="flex items-center gap-2">
							{charClass && <Badge color={CLASS_BADGE[charClass]}>{charClass}</Badge>}
							<span className="font-display text-xs font-bold uppercase tracking-wider" style={{ color: hue }}>
								{tier} · #{entry.rank} · {entry.score.toFixed(2)}
							</span>
						</div>
					</div>
				</div>
				{attrs && (
					<div className="mt-3">
						<StatBars attrs={attrs} compact />
					</div>
				)}
				{writeup && <p className="mt-3 line-clamp-3 text-xs leading-relaxed text-fog-300">{writeup.text}</p>}
				<p className="mt-3 font-display text-[11px] font-bold uppercase tracking-widest text-rio-300">
					Open dashboard →
				</p>
			</div>
		</div>
	);
}
