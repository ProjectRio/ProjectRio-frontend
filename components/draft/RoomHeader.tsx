'use client';

// One-line room header: league, format, state, lot/round, connection, role,
// sound and focus toggles. The paused banner sits beneath when needed.

import Link from 'next/link';
import { setPreview } from '@/lib/draft/preview';
import { FORMAT_LABELS, type DraftSnapshot } from '@/lib/draft/types';
import type { Connection } from '@/lib/draft/useDraft';
import { findTeam, StateChip } from './primitives';

const keyClass = 'px-2 pb-0.5 pt-1 font-display text-xs font-semibold text-fog-100';
const toggleClass = (on: boolean) => `${on ? 'key-on' : 'key-off'} rounded-[5px] px-2 pb-0.5 pt-1 font-display text-xs font-semibold`;

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
				<Link href={`/leagues/${draft.league_id}`} className="font-display text-sm font-semibold text-star-400 underline decoration-transparent underline-offset-4 hover:decoration-star-400">
					{draft.league_name}
				</Link>
				<h1 className="text-xl leading-none">{FORMAT_LABELS[draft.format]} Draft</h1>
				<StateChip state={draft.state} paused={draft.paused} />
				{roundLabel && <span className="font-mono text-xs tabular-nums text-fog-300">{roundLabel}</span>}
				<span className="text-xs text-fog-500">
					<span className="font-mono tabular-nums text-fog-300">{present}/{teams.length}</span> here
				</span>
				<span className="text-xs text-fog-500">
					<span className="font-mono tabular-nums text-fog-300">{spectators.length}</span> watching
				</span>
				<div className="ml-auto flex flex-wrap items-center gap-3">
					{onLineup && you.team_id !== null && (
						<button type="button" className={`key ${keyClass}`} onClick={onLineup} title="Plan your batting order and positions">
							Lineup
						</button>
					)}
					{onPricing && (
						<button type="button" className={`key ${keyClass}`} onClick={onPricing} title="Past prices across the Collection">
							Pricing
						</button>
					)}
					<span className="flex items-center gap-1.5 text-xs text-fog-500">
						<span className={`h-2 w-2 rounded-full ${connection === 'live' ? 'bg-emerald-400' : connection === 'connecting' ? 'animate-pulse bg-star-400' : 'bg-rio-500'}`} />
						{connection === 'live' ? 'Connected' : connection === 'connecting' ? 'Connecting' : 'Unreachable'}
					</span>
					<span className="plate text-fog-300">
						{you.role === 'commissioner' ? 'Commissioner' : you.role === 'manager' ? yourTeam?.name : you.role === 'spectator' ? 'Spectating' : 'Signed out'}
					</span>
					<button type="button" aria-pressed={sound} className={toggleClass(sound)} onClick={() => setPreview({ sound: !sound })}>
						Sound
					</button>
					<button type="button" aria-pressed={focus} className={toggleClass(focus)} title="Hide the site chrome — for streams" onClick={() => setPreview({ focus: !focus })}>
						Focus
					</button>
					<Link href={`/leagues/${draft.league_id}/draft/board`} className="font-display text-xs font-semibold text-fog-300 underline decoration-transparent underline-offset-4 hover:text-fog-100 hover:decoration-fog-300">
						Stream board
					</Link>
				</div>
			</div>
			{draft.paused && (
				<div className="well mt-2 flex flex-wrap items-center gap-x-3 px-3 py-1.5 text-sm">
					<span className="plate text-star-300 [--plate:#5a4a12]">Paused</span>
					<span className="text-fog-100">{draft.pause_reason ?? 'Waiting for the commissioner to resume.'}</span>
					<span className="ml-auto flex gap-3 text-xs text-fog-500">
						<span>Clocks frozen</span>
						<span>The commissioner resumes</span>
					</span>
				</div>
			)}
		</header>
	);
}
