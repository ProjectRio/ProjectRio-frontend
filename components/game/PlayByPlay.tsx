'use client';

/* eslint-disable @next/next/no-img-element */

// At-bat-by-at-bat timeline fed by /games/events/. Every plate appearance is a
// row: batter portrait, pitch sequence, result badge, bases/outs context, and
// a "visualize" action on any pitch that put a ball in the air.

import { useState } from 'react';
import { characterName, characterImage } from '@/lib/data/characters';
import { atBatResultName } from '@/lib/mssb/constants';
import { ordinal } from '@/lib/gameDisplay';
import type { GameEvent } from '@/lib/mssb/BattingSimulation/eventToSim';
import {
	groupAtBats,
	groupByHalfInning,
	pitchOutcome,
	resultCategory,
	hasBallFlight,
	RESULT_COLORS,
	type AtBat
} from '@/lib/gameEvents';

const AWAY_COLOR = '#4f9dff';
const HOME_COLOR = '#f43f5e';

const SWING_NAMES: Record<number, string> = {
	0: 'no swing',
	1: 'slap',
	2: 'charge',
	3: 'star swing',
	4: 'bunt'
};

const CONTACT_NAMES: Record<number, string> = {
	0: 'sour (left)',
	1: 'nice (left)',
	2: 'perfect',
	3: 'nice (right)',
	4: 'sour (right)'
};

function PitchChip({
	event,
	next,
	onVisualize
}: {
	event: GameEvent;
	next: GameEvent | null;
	onVisualize?: (event: GameEvent) => void;
}) {
	const outcome = pitchOutcome(event, next);
	const contact = event.pitch?.contact;
	const flight = hasBallFlight(event);

	const look: Record<string, { glyph: string; cls: string; label: string }> = {
		ball: { glyph: 'B', cls: 'border-sky-400/40 text-sky-300', label: 'Ball' },
		strike: { glyph: 'S', cls: 'border-fog-500/40 text-fog-300', label: 'Strike' },
		foul: { glyph: 'F', cls: 'border-fog-500/40 text-fog-500', label: 'Foul' },
		'in-play': { glyph: '●', cls: 'border-rio-400/60 text-rio-300', label: 'In play' },
		result: { glyph: '✦', cls: 'border-fog-500/40 text-fog-300', label: 'Result' },
		event: { glyph: '·', cls: 'border-night-600 text-fog-500', label: 'Event' }
	};
	const { glyph, cls, label } = look[outcome];

	const pitch = event.pitch;
	const bits: string[] = [];
	if (pitch) {
		bits.push(`${pitch.pitch_speed} mph ${['curve', 'charge', 'changeup'][pitch.pitch_type] ?? 'pitch'}`);
		if (pitch.star_pitch) bits.push('★ star pitch');
		if (pitch.type_of_swing) bits.push(SWING_NAMES[pitch.type_of_swing]);
		if (contact && contact.type_of_contact !== 255) bits.push(CONTACT_NAMES[contact.type_of_contact] ?? '');
	}
	const title = `${event.balls}-${event.strikes}: ${label}${bits.length ? ' — ' + bits.join(', ') : ''}`;

	const chip = (
		<span
			title={title}
			className={`inline-flex h-6 min-w-6 items-center justify-center rounded border bg-night-850 px-1 font-display text-[11px] font-bold ${cls} ${
				flight && onVisualize ? 'cursor-pointer transition-colors hover:border-star-400 hover:text-star-400' : ''
			}`}
			onClick={flight && onVisualize ? () => onVisualize(event) : undefined}
		>
			{pitch?.star_pitch ? '★' : glyph}
		</span>
	);
	return chip;
}

function BaseState({ event }: { event: GameEvent }) {
	const on = [event.runners.first, event.runners.second, event.runners.third];
	return (
		<span className="inline-grid rotate-45 grid-cols-2 gap-[2px]" title={`Outs: ${event.outs}`}>
			{/* second, third / first, home */}
			<span className={`h-2 w-2 rounded-[2px] ${on[1] ? 'bg-star-400' : 'bg-night-600'}`} />
			<span className={`h-2 w-2 rounded-[2px] ${on[0] ? 'bg-star-400' : 'bg-night-600'}`} />
			<span className={`h-2 w-2 rounded-[2px] ${on[2] ? 'bg-star-400' : 'bg-night-600'}`} />
			<span className="h-2 w-2 rounded-[2px] bg-night-800" />
		</span>
	);
}

function AtBatRow({
	atBat,
	onVisualize
}: {
	atBat: AtBat;
	onVisualize: (event: GameEvent) => void;
}) {
	const final = atBat.final;
	const batterName = characterName(final.batter.char_id);
	const category = resultCategory(final.result_of_ab);
	const color = RESULT_COLORS[category];
	const first = atBat.events[0];
	const flight = hasBallFlight(final);

	return (
		<div
			className={`flex flex-wrap items-center gap-x-3 gap-y-2 px-4 py-2.5 ${
				category === 'hr' ? 'bg-star-500/5' : ''
			}`}
		>
			{/* Situation before the AB */}
			<div className="flex w-14 shrink-0 items-center gap-2 text-fog-500">
				<BaseState event={first} />
				<span className="font-display text-[10px] font-semibold uppercase">{first.outs} out</span>
			</div>

			{/* Batter */}
			<div className="flex min-w-0 flex-1 items-center gap-2">
				<img
					src={characterImage(batterName)}
					alt=""
					className="h-8 w-8 shrink-0 rounded-full border border-night-600 bg-night-850 object-contain p-0.5"
				/>
				<div className="min-w-0">
					<p className="truncate text-sm font-semibold text-fog-100">
						{batterName}
						{final.batter.captain && <span className="ml-1 text-star-400">✪</span>}
						{atBat.starChance && (
							<span className="ml-2 rounded border border-star-500/40 bg-star-500/10 px-1 py-px font-display text-[9px] font-bold uppercase tracking-wider text-star-400">
								★ Star chance
							</span>
						)}
					</p>
					<p className="truncate text-[11px] text-fog-500">
						vs {characterName(final.pitcher.char_id)} · stamina {final.pitcher_stamina}
					</p>
				</div>
			</div>

			{/* Pitch sequence */}
			<div className="flex flex-wrap items-center gap-1">
				{atBat.events.map((event, i) => (
					<PitchChip
						key={event.event_num}
						event={event}
						next={atBat.events[i + 1] ?? null}
						onVisualize={onVisualize}
					/>
				))}
			</div>

			{/* Result */}
			<div className="flex shrink-0 items-center gap-2">
				{final.result_rbi > 0 && (
					<span className="font-display text-xs font-bold text-fog-300">
						{final.result_rbi} RBI
					</span>
				)}
				<span
					className="inline-flex items-center rounded border px-2 py-0.5 font-display text-xs font-bold uppercase tracking-wide"
					style={{ color, borderColor: `${color}66`, backgroundColor: `${color}14` }}
				>
					{atBatResultName(final.result_of_ab) || '—'}
				</span>
				{flight && (
					<button
						className="rounded border border-night-600 px-2 py-0.5 font-display text-[10px] font-bold uppercase tracking-wider text-fog-300 transition-colors hover:border-star-400 hover:text-star-400"
						onClick={() => onVisualize(final)}
						title="Open in the 3D visualizer"
					>
						⬈ 3D
					</button>
				)}
			</div>
		</div>
	);
}

export default function PlayByPlay({
	events,
	awayUser,
	homeUser,
	onVisualize
}: {
	events: GameEvent[];
	awayUser: string;
	homeUser: string;
	onVisualize: (event: GameEvent) => void;
}) {
	const groups = groupByHalfInning(groupAtBats(events));
	const [collapsed, setCollapsed] = useState<Set<number>>(new Set());

	const toggle = (idx: number) =>
		setCollapsed((prev) => {
			const nextSet = new Set(prev);
			if (nextSet.has(idx)) nextSet.delete(idx);
			else nextSet.add(idx);
			return nextSet;
		});

	return (
		<div className="panel">
			<div className="divide-y divide-night-800">
				{groups.map((group, gi) => {
					const isAway = group.halfInning === 0;
					const last = group.atBats[group.atBats.length - 1];
					const runsBefore = isAway ? group.atBats[0].final.away_score : group.atBats[0].final.home_score;
					const runsAfter = isAway ? last.awayScoreAfter : last.homeScoreAfter;
					const runs = runsAfter - runsBefore;
					const isCollapsed = collapsed.has(gi);
					return (
						<div key={gi}>
							<button
								className="flex w-full items-center justify-between bg-night-850 px-4 py-2 text-left transition-colors hover:bg-night-800"
								onClick={() => toggle(gi)}
							>
								<span className="font-display text-xs font-bold uppercase tracking-widest">
									<span style={{ color: isAway ? AWAY_COLOR : HOME_COLOR }}>
										{isAway ? 'Top' : 'Bottom'} {ordinal(group.inning)}
									</span>
									<span className="ml-2 text-fog-500">— {isAway ? awayUser : homeUser} batting</span>
								</span>
								<span className="flex items-center gap-3">
									{runs > 0 && (
										<span className="font-display text-xs font-bold text-star-400">
											{runs} run{runs > 1 ? 's' : ''}
										</span>
									)}
									<span className="font-display text-[10px] text-fog-500">
										{last.awayScoreAfter}–{last.homeScoreAfter}
									</span>
									<span className="text-fog-500">{isCollapsed ? '▸' : '▾'}</span>
								</span>
							</button>
							{!isCollapsed && (
								<div className="divide-y divide-night-800/60">
									{group.atBats.map((atBat) => (
										<AtBatRow key={atBat.final.event_num} atBat={atBat} onVisualize={onVisualize} />
									))}
								</div>
							)}
						</div>
					);
				})}
			</div>
			<div className="flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-night-700 px-4 py-2 text-[11px] text-fog-500">
				<span className="font-display font-semibold uppercase tracking-wider">Legend</span>
				<span><span className="text-sky-300">B</span> ball</span>
				<span><span className="text-fog-300">S</span> strike</span>
				<span><span className="text-fog-500">F</span> foul</span>
				<span><span className="text-rio-300">●</span> in play</span>
				<span><span className="text-star-400">★</span> star pitch</span>
				<span>click any in-play pitch to open it in 3D</span>
			</div>
		</div>
	);
}
