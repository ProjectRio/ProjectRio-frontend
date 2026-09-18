'use client';

// One-line room header: league, format, state, lot/round, connection, role,
// sound and focus toggles. The paused banner sits beneath when needed.

import Link from 'next/link';
import { setPreview } from '@/lib/draft/preview';
import { FORMAT_LABELS, type DraftSnapshot } from '@/lib/draft/types';
import type { Connection } from '@/lib/draft/useDraft';
import { findTeam, StateChip } from './primitives';

const toggleClass = 'flex items-center gap-1 font-display text-[11px] font-semibold uppercase tracking-widest text-fog-500 hover:text-fog-300';

export default function RoomHeader({ snapshot, connection, sound, focus, onLineup, onPricing }: { snapshot: DraftSnapshot; connection: Connection; sound: boolean; focus: boolean; onLineup?: () => void; onPricing?: () => void }) {
	const { draft, you, spectators, teams } = snapshot;
	const yourTeam = findTeam(snapshot, you.team_id);
	const roundLabel =
		draft.state === 'live' && draft.format !== 'fixed_price'
			? draft.format === 'snake' || draft.format === 'round_pool'
				? `Round ${Math.max(1, draft.round)}/${draft.total_rounds}`
				: `Lot ${Math.max(1, draft.round)}`
			: null;
	const present = teams.filter((team) => team.present).length;

	return (
		<header className="mb-2">
			<div className="flex flex-wrap items-center gap-x-3 gap-y-1">
				<Link href={`/leagues/${draft.league_id}`} className="kicker hover:text-rio-300">
					{draft.league_name}
				</Link>
				<h1 className="text-xl uppercase leading-none">{FORMAT_LABELS[draft.format]} Draft</h1>
				<StateChip state={draft.state} paused={draft.paused} />
				{roundLabel && <span className="font-display text-xs font-semibold uppercase tracking-widest text-fog-500">{roundLabel}</span>}
				<span className="font-display text-xs font-semibold uppercase tracking-widest text-fog-500">
					{present}/{teams.length} here · {spectators.length} watching
				</span>
				<div className="ml-auto flex flex-wrap items-center gap-3">
					{onLineup && you.team_id !== null && (
						<button type="button" className="rounded border border-night-600 px-2 py-0.5 font-display text-[11px] font-bold uppercase tracking-widest text-fog-300 hover:border-star-500/70 hover:text-star-400" onClick={onLineup} title="Plan your batting order and positions">
							Lineup
						</button>
					)}
					{onPricing && (
						<button type="button" className="rounded border border-night-600 px-2 py-0.5 font-display text-[11px] font-bold uppercase tracking-widest text-fog-300 hover:border-fog-500 hover:text-fog-100" onClick={onPricing} title="Past prices across the Collection">
							Pricing
						</button>
					)}
					<span className="flex items-center gap-1.5 font-display text-[11px] font-semibold uppercase tracking-widest text-fog-500">
						<span className={`h-2 w-2 rounded-full ${connection === 'live' ? 'bg-emerald-400' : connection === 'connecting' ? 'animate-pulse bg-star-400' : 'bg-rio-500'}`} />
						{connection === 'live' ? 'Connected' : connection === 'connecting' ? 'Connecting' : 'Unreachable'}
					</span>
					<span className="rounded border border-night-600 px-1.5 py-0.5 font-display text-[11px] font-semibold uppercase tracking-widest text-fog-300">
						{you.role === 'commissioner' ? 'Commissioner' : you.role === 'manager' ? yourTeam?.name : you.role === 'spectator' ? 'Spectating' : 'Signed out'}
					</span>
					<label className={toggleClass}>
						<input type="checkbox" className="accent-rio-500" checked={sound} onChange={(event) => setPreview({ sound: event.target.checked })} />
						Sound
					</label>
					<label className={toggleClass} title="Hide the site chrome — for streams">
						<input type="checkbox" className="accent-rio-500" checked={focus} onChange={(event) => setPreview({ focus: event.target.checked })} />
						Focus
					</label>
					<Link href={`/leagues/${draft.league_id}/draft/board`} className={toggleClass}>
						Stream board ↗
					</Link>
				</div>
			</div>
			{draft.paused && (
				<div className="mt-2 flex flex-wrap items-center gap-x-3 rounded border border-star-500/50 bg-star-500/10 px-3 py-1.5 text-sm">
					<span className="font-display text-xs font-bold uppercase tracking-widest text-star-400">Paused</span>
					<span className="text-fog-300">{draft.pause_reason ?? 'Waiting for the commissioner to resume.'}</span>
					<span className="ml-auto text-xs text-fog-500">Clocks frozen · the commissioner resumes</span>
				</div>
			)}
		</header>
	);
}
