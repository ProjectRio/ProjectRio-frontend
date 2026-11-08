'use client';

import { useState } from 'react';
import type { RunResult } from '@/lib/mssb/RunningSimulation/runningModel';
import { BASE_REACH_MARGIN } from '@/lib/mssb/RunningSimulation/runningConstants';
import { AXIS_LABEL, AXIS_TEXT, GRID, makeScales, niceTicks, pointerToViewX } from './chartUtils';

const W = 640;
const M = { l: 52, r: 84, t: 14, b: 40 };
const H_TOP = 260;
/** Lower panel (only with two runners): the gap between them in distance still to cover. */
const LEAD_GAP = 30;
const LEAD_H = 130;

export interface Racer {
	run: RunResult;
	label: string;
	color: string;
	dashed?: boolean;
}

/** Distance covered along the line to 1B on each frame, up to the frame the runner reaches it. */
function racePoints(run: RunResult) {
	const end = run.bases[0]?.frame ?? run.frame;
	return run.trace.filter((t) => t.f <= end).map((t) => ({ f: t.f, d: t.pct * t.L, held: t.held }));
}

export interface RaceEvent {
	f: number;
	kind: 'top' | 'drop';
	/** Progress kept per frame, in ten-thousandths of the run to 1B, before and after a drop. */
	from?: number;
	to?: number;
}

/**
 * When the runner first hits their velocity cap, and every later frame where the progress kept per frame (rounded
 * down to 1/10,000 of the baseline) steps down. Stamina only ever lowers speed, so each step down is stamina pushing
 * the unrounded value below a whole number; steps up just after top speed are the mash bonus filling.
 */
function raceEvents(run: RunResult): RaceEvent[] {
	const top = run.topFrame;
	if (top === null) return [];
	const end = run.bases[0]?.frame ?? run.frame;
	const out: RaceEvent[] = [{ f: top, kind: 'top' }];
	const kept = (i: number) => Math.round((run.trace[i].fbr - run.trace[i - 1].fbr) * 10000);
	for (let i = 2; i < run.trace.length && run.trace[i].f <= end; i++) {
		if (run.trace[i].f <= top) continue;
		const from = kept(i - 1);
		const to = kept(i);
		if (to < from) out.push({ f: run.trace[i].f, kind: 'drop', from, to });
	}
	return out;
}

const shortName = (label: string) => label.replace(/ \(.*\)$/, '');

function eventText(name: string, e: RaceEvent) {
	return e.kind === 'top' ? `${name} reaches top speed` : `${name}: stamina drops progress from ${e.from} to ${e.to} ten-thousandths per frame`;
}

/**
 * Batter-to-1B race: distance covered by frame for each runner, with a finish line at the distance each one has to
 * cover (the game counts the runner as on 1B at 97% of their own start-to-1B distance). With two runners, a lower
 * panel shows the lead: the difference in distance each still has to cover, so different starting spots count.
 */
export default function RaceChart({ racers }: { racers: Racer[] }) {
	const [hover, setHover] = useState<{ f: number; left: number; top: number } | null>(null);
	const data = racers.map((r) => {
		const pts = racePoints(r.run);
		const L = r.run.trace[0]?.L ?? 0;
		return { ...r, pts, L, finish: L * (1 - BASE_REACH_MARGIN), reach: pts[pts.length - 1], events: raceEvents(r.run) };
	});
	const fMax = Math.max(...data.map((r) => r.reach.f)) + 4;
	const dMax = Math.max(...data.map((r) => r.finish)) * 1.06;
	const { X, Y } = makeScales(W, H_TOP, M, 0, fMax, 0, dMax);

	// Lead: how much less the first runner still has to cover than the second, frame by frame, until either finishes.
	const pair = data.length === 2 ? data : null;
	const lead = pair
		? pair[0].pts
				.filter((p) => p.f <= Math.min(pair[0].reach.f, pair[1].reach.f))
				.map((p) => {
					const q = pair[1].pts.find((t) => t.f === p.f) ?? pair[1].reach;
					return { f: p.f, v: pair[1].finish - q.d - (pair[0].finish - p.d) };
				})
		: [];
	const leadAbs = Math.max(0.05, ...lead.map((p) => Math.abs(p.v))) * 1.15;
	const leadTop = H_TOP + LEAD_GAP;
	const H = pair ? leadTop + LEAD_H + M.b : H_TOP;
	const YL = (v: number) => leadTop + ((leadAbs - v) / (2 * leadAbs)) * LEAD_H;
	const plotBottom = pair ? leadTop + LEAD_H : H_TOP - M.b;
	const firstMove = Math.min(...data.map((r) => r.pts.find((p) => !p.held)?.f ?? 0));
	// Events drawn on the lead line, only while it is plotted.
	const leadEvents = pair
		? pair.flatMap((r, runner) =>
				r.events.flatMap((e) => {
					const p = lead.find((t) => t.f === e.f);
					return p ? [{ ...e, v: p.v, color: r.color, name: shortName(r.label), key: `${runner}-${e.kind}-${e.f}` }] : [];
				})
			)
		: [];

	// Finish-line labels, nudged apart when the distances are nearly equal.
	const labelY = data.map((r) => Y(r.finish));
	if (labelY.length === 2 && Math.abs(labelY[0] - labelY[1]) < 16) {
		const mid = (labelY[0] + labelY[1]) / 2;
		const up = data[0].finish >= data[1].finish ? 0 : 1;
		labelY[up] = mid - 8;
		labelY[1 - up] = mid + 8;
	}

	function onMove(event: React.PointerEvent<SVGRectElement>) {
		const px = pointerToViewX(event, W);
		const f = Math.max(0, Math.min(fMax, Math.round(((px - M.l) / (W - M.l - M.r)) * fMax)));
		const wrap = (event.currentTarget.ownerSVGElement!.parentElement as HTMLElement).getBoundingClientRect();
		setHover({ f, left: event.clientX - wrap.left, top: event.clientY - wrap.top });
	}

	const at = (r: (typeof data)[number], f: number) => r.pts.find((p) => p.f === f) ?? (f > r.reach.f ? r.reach : r.pts[0]);

	return (
		<div className="relative space-y-2">
			<svg viewBox={`0 0 ${W} ${H}`} className="block h-auto w-full" role="img" aria-label="Distance covered toward 1st base by frame, with each runner's finish line">
				<rect x={X(0)} y={M.t} width={X(firstMove) - X(0)} height={H_TOP - M.t - M.b} fill="var(--color-night-800)" />
				{niceTicks(0, dMax, 5).map((v) => (
					<g key={v}>
						<line x1={M.l} x2={W - M.r} y1={Y(v)} y2={Y(v)} stroke={GRID} />
						<text x={M.l - 8} y={Y(v) + 4} textAnchor="end" fontSize={11} fill={AXIS_TEXT} className="font-mono">
							{v}
						</text>
					</g>
				))}
				{niceTicks(0, fMax, 8)
					.filter((v) => Number.isInteger(v))
					.map((v) => (
						<text key={v} x={X(v)} y={plotBottom + 16} textAnchor="middle" fontSize={11} fill={AXIS_TEXT} className="font-mono">
							{v}
						</text>
					))}
				<line x1={M.l} x2={W - M.r} y1={H_TOP - M.b} y2={H_TOP - M.b} stroke={AXIS_TEXT} />
				<text x={(M.l + W - M.r) / 2} y={H - 6} textAnchor="middle" fontSize={12} fill={AXIS_LABEL}>
					Frames since contact
				</text>
				<text x={14} y={(M.t + H_TOP - M.b) / 2} textAnchor="middle" fontSize={12} fill={AXIS_LABEL} transform={`rotate(-90 14 ${(M.t + H_TOP - M.b) / 2})`}>
					Metres covered
				</text>

				{/* Finish lines: the distance each runner needs to cover to count as on 1B. */}
				{data.map((r, i) => (
					<g key={`finish-${i}`}>
						<line x1={M.l} x2={W - M.r} y1={Y(r.finish)} y2={Y(r.finish)} stroke={r.color} strokeDasharray="2 4" opacity={0.9} />
						<text x={W - M.r + 6} y={labelY[i] + 4} fontSize={11} fill={r.color} className="font-mono">
							{r.finish.toFixed(2)} m
						</text>
					</g>
				))}

				{[...data].reverse().map((r, i) => (
					<polyline
						key={`line-${i}`}
						points={r.pts.map((p) => `${X(p.f).toFixed(1)},${Y(p.d).toFixed(1)}`).join(' ')}
						fill="none"
						stroke={r.color}
						strokeWidth={2.5}
						strokeDasharray={r.dashed ? '6 4' : undefined}
					/>
				))}
				{data.map((r, i) => (
					<circle key={`reach-${i}`} cx={X(r.reach.f)} cy={Y(r.reach.d)} r={4} fill={r.color} stroke="var(--color-night-850)" strokeWidth={2} />
				))}

				{pair && (
					<g>
						<rect x={X(0)} y={leadTop} width={X(firstMove) - X(0)} height={LEAD_H} fill="var(--color-night-800)" />
						<text x={14} y={leadTop + LEAD_H / 2} textAnchor="middle" fontSize={12} fill={AXIS_LABEL} transform={`rotate(-90 14 ${leadTop + LEAD_H / 2})`}>
							Lead (m)
						</text>
						{niceTicks(-leadAbs, leadAbs, 4).map((v) => (
							<g key={v}>
								<line x1={M.l} x2={W - M.r} y1={YL(v)} y2={YL(v)} stroke={v === 0 ? AXIS_TEXT : GRID} />
								<text x={M.l - 8} y={YL(v) + 4} textAnchor="end" fontSize={11} fill={AXIS_TEXT} className="font-mono">
									{Math.abs(v)}
								</text>
							</g>
						))}
						<text x={W - M.r + 6} y={leadTop + 12} fontSize={11} fill={pair[0].color}>
							{shortName(pair[0].label)}
						</text>
						<text x={W - M.r + 6} y={leadTop + 24} fontSize={11} fill={AXIS_TEXT}>
							ahead
						</text>
						<text x={W - M.r + 6} y={leadTop + LEAD_H - 16} fontSize={11} fill={pair[1].color}>
							{shortName(pair[1].label)}
						</text>
						<text x={W - M.r + 6} y={leadTop + LEAD_H - 4} fontSize={11} fill={AXIS_TEXT}>
							ahead
						</text>
						<polyline
							points={lead.map((p) => `${X(p.f).toFixed(1)},${YL(p.v).toFixed(1)}`).join(' ')}
							fill="none"
							stroke="var(--color-fog-100)"
							strokeWidth={2}
						/>
						{leadEvents.map((e) => (
							<circle
								key={e.key}
								cx={X(e.f)}
								cy={YL(e.v)}
								r={4.5}
								fill={e.kind === 'top' ? e.color : 'var(--color-night-900)'}
								stroke={e.kind === 'top' ? 'var(--color-night-900)' : e.color}
								strokeWidth={2}
							/>
						))}
						<line x1={M.l} x2={W - M.r} y1={plotBottom} y2={plotBottom} stroke={AXIS_TEXT} />
					</g>
				)}

				{hover && <line x1={X(hover.f)} x2={X(hover.f)} y1={M.t} y2={plotBottom} stroke={AXIS_LABEL} opacity={0.5} />}
				<rect
					x={M.l}
					y={M.t}
					width={W - M.l - M.r}
					height={plotBottom - M.t}
					fill="transparent"
					onPointerMove={onMove}
					onPointerLeave={() => setHover(null)}
				/>
			</svg>
			{pair && (
				<div className="flex flex-wrap gap-x-5 gap-y-1 text-xs text-fog-500">
					<span className="flex items-center gap-2">
						<span className="inline-block h-2.5 w-2.5 rounded-full bg-fog-300" />
						Reaches top speed
					</span>
					<span className="flex items-center gap-2">
						<span className="inline-block h-2.5 w-2.5 rounded-full border-2 border-fog-300" />
						Stamina drops progress per frame by one ten-thousandth of the run due to rounding
					</span>
				</div>
			)}
			{hover && (
				<div
					className="pointer-events-none absolute z-10 whitespace-nowrap rounded-md border border-night-600 bg-night-850 px-3 py-2 text-xs shadow-xl"
					style={{ left: hover.left + 14, top: hover.top, transform: hover.left > 360 ? 'translate(calc(-100% - 28px), -50%)' : 'translateY(-50%)' }}
				>
					<div className="mb-1 font-semibold text-fog-100">Frame {hover.f}</div>
					{data.map((r, i) => {
						const p = at(r, hover.f);
						const left = Math.max(0, r.finish - p.d);
						return (
							<div key={i} className="flex items-center justify-between gap-4 text-fog-300">
								<span className="flex items-center gap-1.5">
									<span className="inline-block h-2 w-2 rounded-full" style={{ background: r.color }} />
									{r.label}
								</span>
								<span className="font-mono tabular-nums text-fog-100">
									{p.d.toFixed(2)} m · {left > 0 ? `${left.toFixed(2)} m to go` : `on 1B (frame ${r.reach.f})`}
								</span>
							</div>
						);
					})}
					{pair &&
						(() => {
							const p = lead.find((t) => t.f === hover.f) ?? lead[lead.length - 1];
							if (!p) return null;
							const who = p.v >= 0 ? pair[0] : pair[1];
							return (
								<div className="mt-1 border-t border-night-600 pt-1 text-fog-300">
									{Math.abs(p.v) < 0.005 ? 'Dead even' : `${shortName(who.label)} ahead by ${Math.abs(p.v).toFixed(2)} m`}
									{p.f !== hover.f ? ` (frame ${p.f})` : ''}
								</div>
							);
						})()}
					{leadEvents
						.filter((e) => Math.abs(e.f - hover.f) <= 2)
						.map((e) => (
							<div key={e.key} className="flex items-center gap-1.5 text-fog-300">
								<span
									className="inline-block h-2 w-2 rounded-full border-2"
									style={{ borderColor: e.color, background: e.kind === 'top' ? e.color : 'transparent' }}
								/>
								Frame {e.f}: {eventText(e.name, e)}
							</div>
						))}
				</div>
			)}
		</div>
	);
}
