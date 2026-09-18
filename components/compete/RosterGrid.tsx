'use client';

/* eslint-disable @next/next/no-img-element */

// Rosters per manager with the price each slot cost, plus the drafted park.

import { characterClasses, characterImage } from '@/lib/data/characters';
import { CLASS_HUES } from '@/lib/draft/assets';
import type { Competition } from '@/lib/compete/types';
import { Mark, ParticipantName, participantByName, participantsOf } from './shared';
import { EmptyState, Panel } from '@/components/ui';

export default function RosterGrid({ competition, highlight }: { competition: Competition; highlight?: string }) {
	const rosters = competition.rosters;
	if (!rosters || Object.keys(rosters).length === 0) {
		return <EmptyState title="No rosters yet" detail={competition.draft_league_id ? 'Rosters commit to the ledger when the draft completes.' : 'This competition has no drafted rosters.'} />;
	}
	const order = participantsOf(competition)
		.map((participant) => participant.name)
		.filter((name) => rosters[name]);
	for (const name of Object.keys(rosters)) if (!order.includes(name)) order.push(name);
	const averaged = !competition.draft_league_id;
	return (
		<div className="space-y-3">
			{averaged && <p className="text-xs text-fog-500">Prices shown are the season’s average price per copy from the league sheet. Per-manager paid prices arrive with the draft ledger.</p>}
		<div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
			{order.map((owner) => {
				const roster = rosters[owner];
				const total = roster.reduce((sum, slot) => sum + (slot.price ?? 0), 0);
				const participant = participantByName(competition, owner);
				return (
					<Panel key={owner} className={owner === highlight ? 'border-rio-500/50' : ''}>
						<div className="flex items-center gap-2 border-b border-night-700 bg-night-850 px-3 py-2">
							<Mark participant={participant} size={24} />
							<ParticipantName participant={participant} name={owner} className="font-display text-sm font-bold uppercase tracking-wide" />
							{participant?.seed && <span className="text-[10px] text-fog-500">#{participant.seed}</span>}
							{total > 0 && (
								<span className="ml-auto font-display text-xs font-bold tabular-nums text-fog-300" title="Sum of the season's average price per copy — paid prices arrive with the draft ledger">
									≈${Math.round(total)}
								</span>
							)}
						</div>
						<ul className="divide-y divide-night-800">
							{roster.map((slot) => {
								const isStadium = slot.slot === 0;
								const cls = characterClasses[slot.character]?.Class;
								return (
									<li key={`${slot.character}#${slot.slot}`} className="flex items-center gap-2 px-3 py-1.5 text-sm">
										{isStadium ? (
											<span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded bg-night-800 text-[10px] font-bold text-fog-300">P</span>
										) : (
											<img src={characterImage(slot.character)} alt="" width={22} height={26} className="shrink-0 [image-rendering:pixelated]" style={{ width: 22, height: 26 }} />
										)}
										<span className="min-w-0 flex-1 truncate text-fog-100">
											{slot.character}
											{slot.slot > 1 && <span className="ml-1 text-[10px] text-fog-500">#{slot.slot}</span>}
										</span>
										{cls && <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: CLASS_HUES[cls] }} title={cls} />}
										{slot.price !== undefined && <span className="font-display text-xs font-bold tabular-nums text-fog-300">${Number.isInteger(slot.price) ? slot.price : slot.price.toFixed(1)}</span>}
									</li>
								);
							})}
						</ul>
					</Panel>
				);
			})}
		</div>
		</div>
	);
}
