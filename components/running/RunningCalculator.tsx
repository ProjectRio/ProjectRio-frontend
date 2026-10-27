'use client';

import { useMemo, useState } from 'react';
import { characters } from '@/lib/data/characters';
import {
	BASE_NAMES,
	batterPosition,
	boxPosition,
	framesToSeconds,
	simulateRun,
	type BoxSide,
	type BoxSpot,
	type MashMode,
	type PathMode,
	type RunResult
} from '@/lib/mssb/RunningSimulation/runningModel';
import {
	BASE_COORDS,
	BATTER_BOX,
	BATTER_RUN_DELAY_FRAMES,
	CHARACTER_SPEED,
	LEADOFF_PERCENT,
	MAX_STAMINA,
	RUNNER_AUTO_START_FRAME,
	SLIDE_RECOVERY_FRAMES,
	SPEED_STAT_CAP
} from '@/lib/mssb/RunningSimulation/runningConstants';
import { AXIS_LABEL, AXIS_TEXT, GRID, SERIES, makeScales, niceTicks, pointerToViewX } from './chartUtils';
import RunPathChart from './RunPathChart';

const SPOTS: { value: BoxSpot; label: string }[] = [
	{ value: 'def', label: 'Default start (no movement)' },
	{ value: 'center', label: 'Middle of the box' },
	{ value: 'fi', label: 'Front-inside corner' },
	{ value: 'fo', label: 'Front-outside corner' },
	{ value: 'bi', label: 'Back-inside corner' },
	{ value: 'bo', label: 'Back-outside corner' }
];
/** Front = toward the pitcher, inside = next to the plate. The closest corner to 1B depends on the side. */
const CLOSEST: Record<BoxSide, BoxSpot> = { R: 'fi', L: 'fo' };
const FARTHEST: Record<BoxSide, BoxSpot> = { R: 'bo', L: 'bi' };
const spotLabel = (spot: BoxSpot, side: BoxSide) =>
	SPOTS.find((s) => s.value === spot)!.label +
	(spot === CLOSEST[side] ? ' (closest to 1B)' : spot === FARTHEST[side] ? ' (farthest from 1B)' : '');

const MASH_MODES: { value: MashMode; label: string; name: string; color: string }[] = [
	{ value: 'tas', label: 'TAS', name: 'TAS (every frame)', color: SERIES.orange },
	{ value: 'human', label: 'Human viable', name: 'Human viable (every 3 frames)', color: SERIES.aqua },
	{ value: 'none', label: 'None', name: 'No mashing', color: SERIES.blue }
];

const START_OPTIONS = [
	{ value: 0, label: 'Batter (home)' },
	{ value: 1, label: 'Runner on 1B' },
	{ value: 2, label: 'Runner on 2B' },
	{ value: 3, label: 'Runner on 3B' }
];

function Toggle<T extends string>({
	value,
	options,
	onChange,
	label,
	disabled = false
}: {
	value: T;
	options: { value: T; label: string }[];
	onChange: (v: T) => void;
	label: string;
	disabled?: boolean;
}) {
	return (
		<div
			role="group"
			aria-label={label}
			className={`flex divide-x divide-night-600 overflow-hidden rounded-lg border border-night-600 ${disabled ? 'opacity-40' : ''}`}
		>
			{options.map((o) => (
				<button
					key={o.value}
					type="button"
					disabled={disabled}
					aria-pressed={value === o.value}
					onClick={() => onChange(o.value)}
					className={`flex-1 px-3 py-2 text-sm transition-colors ${
						value === o.value ? 'bg-night-700 font-semibold text-fog-100' : 'text-fog-500 hover:text-fog-300'
					}`}
				>
					{o.label}
				</button>
			))}
		</div>
	);
}

const W = 640;
const H = 250;
const M = { l: 52, r: 14, t: 22, b: 40 };

function VelocityChart({ runs, selected }: { runs: Record<MashMode, RunResult>; selected: MashMode }) {
	const [hover, setHover] = useState<{ f: number; left: number; top: number } | null>(null);
	const fMax = Math.max(...MASH_MODES.map((m) => runs[m.value].frame));
	const vMax = Math.max(...runs.tas.trace.map((t) => t.v)) * 1.08;
	const { X, Y } = makeScales(W, H, M, 0, fMax, 0, vMax);
	const line = (r: RunResult) => r.trace.map((t) => `${X(t.f).toFixed(1)},${Y(t.v).toFixed(1)}`).join(' ');
	const at = (r: RunResult, f: number) => r.trace.find((t) => t.f === f) ?? r.trace[r.trace.length - 1];
	const sel = runs[selected];
	const selColor = MASH_MODES.find((m) => m.value === selected)!.color;
	const firstMove = sel.trace.find((t) => !t.held)?.f ?? 0;

	function onMove(event: React.PointerEvent<SVGRectElement>) {
		const px = pointerToViewX(event, W);
		const f = Math.max(1, Math.min(fMax, Math.round(((px - M.l) / (W - M.l - M.r)) * fMax)));
		const wrap = (event.currentTarget.ownerSVGElement!.parentElement as HTMLElement).getBoundingClientRect();
		setHover({ f, left: event.clientX - wrap.left, top: event.clientY - wrap.top });
	}

	return (
		<div className="relative">
			<svg viewBox={`0 0 ${W} ${H}`} className="block h-auto w-full" role="img" aria-label="Ground velocity by frame, with base markers">
				<rect x={X(0)} y={M.t} width={X(firstMove) - X(0)} height={H - M.t - M.b} fill="var(--color-night-800)" />
				{niceTicks(0, vMax, 4).map((v) => (
					<g key={v}>
						<line x1={M.l} x2={W - M.r} y1={Y(v)} y2={Y(v)} stroke={GRID} />
						<text x={M.l - 8} y={Y(v) + 4} textAnchor="end" fontSize={11} fill={AXIS_TEXT} className="font-mono">
							{v.toFixed(2)}
						</text>
					</g>
				))}
				{niceTicks(0, fMax, 8)
					.filter((v) => Number.isInteger(v))
					.map((v) => (
						<text key={v} x={X(v)} y={H - M.b + 16} textAnchor="middle" fontSize={11} fill={AXIS_TEXT} className="font-mono">
							{v}
						</text>
					))}
				<line x1={M.l} x2={W - M.r} y1={H - M.b} y2={H - M.b} stroke={AXIS_TEXT} />
				<text x={(M.l + W - M.r) / 2} y={H - 6} textAnchor="middle" fontSize={12} fill={AXIS_LABEL}>
					Frames since contact
				</text>
				<text x={14} y={(M.t + H - M.b) / 2} textAnchor="middle" fontSize={12} fill={AXIS_LABEL} transform={`rotate(-90 14 ${(M.t + H - M.b) / 2})`}>
					Metres / frame
				</text>
				{/* base markers for the selected mashing mode */}
				{sel.bases.map((b) => (
					<g key={b.base}>
						<line x1={X(b.frame)} x2={X(b.frame)} y1={M.t} y2={H - M.b} stroke={selColor} strokeDasharray="3 3" opacity={0.8} />
						<text x={X(b.frame)} y={M.t - 6} textAnchor="middle" fontSize={11} fontWeight={600} fill="var(--color-fog-100)">
							{BASE_NAMES[b.base]}
						</text>
					</g>
				))}
				{[...MASH_MODES].reverse().map((m) => (
					<polyline
						key={m.value}
						points={line(runs[m.value])}
						fill="none"
						stroke={m.color}
						strokeWidth={m.value === selected ? 2.5 : 1.5}
						opacity={m.value === selected ? 1 : 0.55}
					/>
				))}
				{hover && <line x1={X(hover.f)} x2={X(hover.f)} y1={M.t} y2={H - M.b} stroke={AXIS_LABEL} opacity={0.5} />}
				<rect
					x={M.l}
					y={M.t}
					width={W - M.l - M.r}
					height={H - M.t - M.b}
					fill="transparent"
					onPointerMove={onMove}
					onPointerLeave={() => setHover(null)}
				/>
			</svg>
			{hover && (
				<div
					className="pointer-events-none absolute z-10 whitespace-nowrap rounded-md border border-night-600 bg-night-850 px-3 py-2 text-xs shadow-xl"
					style={{ left: hover.left + 14, top: hover.top, transform: hover.left > 360 ? 'translate(calc(-100% - 28px), -50%)' : 'translateY(-50%)' }}
				>
					<div className="mb-1 font-semibold text-fog-100">Frame {hover.f}</div>
					{MASH_MODES.map((m) => {
						const t = at(runs[m.value], hover.f);
						return (
							<div key={m.value} className="flex items-center justify-between gap-4 text-fog-300">
								<span className="flex items-center gap-1.5">
									<span className="inline-block h-2 w-2 rounded-full" style={{ background: m.color }} />
									{m.label}
								</span>
								<span className="font-mono tabular-nums text-fog-100">
									{t.v.toFixed(4)} m/frame · {t.fbr.toFixed(2)} bases
									{t.action !== 'none' ? ` · ${t.action === 'slide' ? 'sliding' : 'recovering'}` : ''}
								</span>
							</div>
						);
					})}
				</div>
			)}
		</div>
	);
}

const f2 = (n: number) => n.toFixed(2);

function Code({ children }: { children: React.ReactNode }) {
	return <code className="rounded bg-night-800 px-1 py-0.5 font-mono text-[0.85em] text-fog-100">{children}</code>;
}

function WorkedExample({
	charId,
	side,
	spot,
	speed,
	mash,
	path,
	startBase,
	endBase,
	run
}: {
	charId: number;
	side: BoxSide;
	spot: BoxSpot;
	speed: number;
	mash: MashMode;
	path: PathMode;
	startBase: number;
	endBase: number;
	run: RunResult;
}) {
	const trace = run.trace;
	const top = run.topFrame ?? 0;
	const firstMove = trace.find((t) => !t.held)?.f ?? 0;
	const firstDrain = trace.find((t) => t.stamina < MAX_STAMINA)?.f;
	const firstFull = trace.find((t) => t.mash >= 1)?.f;
	const roundStart = trace.find((t) => t.strength > 0)?.f;
	const reachAt = new Map(run.bases.map((b) => [b.frame, b.base]));
	const crossings = new Map<number, number>();
	const slideStarts = new Set<number>();
	const recoverEnds = new Set<number>();
	trace.forEach((t, i) => {
		if (i === 0) return;
		const p = trace[i - 1];
		if (Math.trunc(t.fbr) > Math.trunc(p.fbr)) crossings.set(t.f, Math.trunc(t.fbr));
		if (t.action === 'slide' && p.action !== 'slide') slideStarts.add(t.f);
		if (t.action === 'none' && p.action === 'recover') recoverEnds.add(t.f);
	});

	const pick = new Set<number>([firstMove - 1, firstMove, firstMove + 1, run.frame]);
	const around = (f: number | undefined, before = 1, after = 1) => {
		if (f === undefined) return;
		for (let x = f - before; x <= f + after; x++) pick.add(x);
	};
	around(firstDrain, 1, 0);
	around(top, 1, mash === 'human' ? 13 : 5);
	around(roundStart, 1, 1);
	run.bases.forEach((b) => around(b.frame, 1, 0));
	crossings.forEach((_, f) => around(f, 0, 1));
	slideStarts.forEach((f) => around(f, 1, 0));
	recoverEnds.forEach((f) => around(f, 0, 1));

	const pressed = (i: number) => i > 0 && trace[i].mash > trace[i - 1].mash;
	const note = (i: number) => {
		const t = trace[i];
		if (t.held) return t.f === firstMove - 1 ? `held until frame ${firstMove}` : 'held';
		const parts: string[] = [];
		if (t.f === firstMove) parts.push('first movement');
		if (t.f === firstDrain) parts.push('stamina starts draining');
		if (t.f === top) parts.push(mash === 'none' ? 'hits the cap' : 'hits the cap; first counted press');
		else if (pressed(i)) parts.push('press: meter +0.2');
		if (t.f === firstFull && t.f !== top) parts.push('meter full: +0.02 m/frame');
		if (t.f === roundStart) parts.push('rounding starts');
		if (slideStarts.has(t.f)) parts.push('slide starts');
		if (reachAt.has(t.f)) parts.push(`on ${BASE_NAMES[reachAt.get(t.f)!]}`);
		if (crossings.has(t.f)) {
			const b = BASE_NAMES[crossings.get(t.f)!];
			if (t.action === 'recover') parts.push(`slide ends on ${b}; ${SLIDE_RECOVERY_FRAMES}-frame recovery`);
			else if (t.v === 0) parts.push(`stops on ${b}; placed 3% along the next baseline`);
			else parts.push(`crosses ${b} at full speed`);
		}
		if (recoverEnds.has(t.f)) parts.push('recovery over; placed 3% along the next baseline');
		return parts.join('; ');
	};
	const rows = trace.map((t, i) => ({ t, i })).filter(({ t }) => pick.has(t.f));

	const route = `${BASE_NAMES[startBase]} to ${BASE_NAMES[endBase]}`;
	let startText: React.ReactNode;
	if (startBase === 0) {
		const [p, q] = boxPosition(charId, side, spot);
		const [, , , , offX, offZ] = BATTER_BOX[charId];
		const [x, z] = batterPosition(charId, side, spot);
		startText = (
			<>
				{characters[String(charId)]}&apos;s box at the {spotLabel(spot, side).toLowerCase()} gives{' '}
				<Code>
					boxPosition = ({f2(p)}, {f2(q)})
				</Code>
				. Adding the body offset ({f2(offX)}, {f2(offZ)}){side === 'L' ? ' and mirroring x for a left-handed batter' : ''} gives{' '}
				<Code>
					batterPos = ({f2(x)}, {f2(z)})
				</Code>
				, {run.L.toFixed(3)} m from 1B. The batter is held until frame {BATTER_RUN_DELAY_FRAMES}.
			</>
		);
	} else {
		const b = BASE_COORDS[startBase];
		startText = (
			<>
				The runner on {BASE_NAMES[startBase]} has taken the automatic lead of {Math.round((LEADOFF_PERCENT + 0.03) * 100)}% of the
				baseline, so they start at ({f2(run.start[0])}, {f2(run.start[1])}), {run.L.toFixed(3)} m from{' '}
				{BASE_NAMES[startBase + 1]} (the base is at ({f2(b[0])}, {f2(b[1])})). Every runner on base is sent forward automatically on
				frame {RUNNER_AUTO_START_FRAME}.
			</>
		);
	}
	const pathText =
		path === 'round'
			? `Rounding starts once the runner is halfway along a baseline${startBase === 0 ? ' (a frame later for the batter, after the 1B overrun check)' : ''}, and from then on the runner blends onto the rounding spline by 1.2% a frame. The game measures distance from that wider position, so each frame covers a little less of the leg, but speed carries through every base.${startBase === 3 && endBase === 4 ? ' A runner starting on 3B never starts rounding, so they slide into home.' : ''}`
			: `With no rounding the runner stops on 1B, and slides into 2B, 3B and home, then waits ${SLIDE_RECOVERY_FRAMES} frames. After each stop they are placed 3% along the next baseline and accelerate again from zero.`;

	return (
		<details className="rounded-lg border border-night-700 bg-night-850 lg:col-span-2">
			<summary className="cursor-pointer px-4 py-3 font-display text-sm font-bold uppercase tracking-widest text-fog-300">
				Worked example: how this result is calculated
			</summary>
			<div className="space-y-3 border-t border-night-700 p-4 text-sm leading-relaxed text-fog-300">
				<p>
					<b className="text-fog-100">Start ({route}).</b> {startText}
				</p>
				<p>
					<b className="text-fog-100">Speed.</b> At speed {speed}, top speed is <Code>{run.k.maxV.toFixed(4)} m/frame</Code> and
					acceleration is <Code>{run.k.accel.toFixed(4)} m/frame²</Code>. The runner first reaches the cap on frame {top}, which is when
					mashing starts to count.{' '}
					{mash === 'tas'
						? 'With a press every frame the meter fills in 5 presses, adding 0.02 m/frame on top of the cap.'
						: mash === 'human'
							? 'With a press every 3 frames the meter fills in 13 frames and never decays, because each press holds it for 6.'
							: 'No presses are made, so the cap is the top speed.'}
				</p>
				<p>
					<b className="text-fog-100">Path.</b> {pathText}
				</p>
				<p>
					<b className="text-fog-100">Arrival.</b> Each frame adds <Code>v ÷ L</Code> to the progress along the current baseline, truncated
					to 1/10000, where L is the distance from the runner&apos;s position to the bases either side. A base counts as reached at 97%
					of the baseline. The runner is on {BASE_NAMES[endBase]} on <b className="text-fog-100">frame {run.frame}</b> (
					{framesToSeconds(run.frame)} s).
				</p>
				<div className="overflow-x-auto rounded-md border border-night-700">
					<table className="stat-table">
						<thead>
							<tr>
								{['Frame', 'Stamina', 'Cap (m/frame)', 'mashPercent', 'v (m/frame)', 'Bases run', 'Rounding', 'What happens'].map((h) => (
									<th key={h}>{h}</th>
								))}
							</tr>
						</thead>
						<tbody>
							{rows.map(({ t, i }, k) => {
								const gap = k > 0 && rows[k - 1].t.f !== t.f - 1;
								return (
									<tr key={t.f} className={t.f === run.frame ? 'bg-night-800' : gap ? 'border-t-2 border-night-600' : undefined}>
										<td className="font-mono tabular-nums">{t.f}</td>
										<td className="font-mono tabular-nums">{t.stamina}</td>
										<td className="font-mono tabular-nums">{t.cap ? t.cap.toFixed(4) : '–'}</td>
										<td className="font-mono tabular-nums">{t.mash.toFixed(2)}</td>
										<td className="font-mono tabular-nums">{t.v.toFixed(4)}</td>
										<td className="font-mono tabular-nums">{t.fbr.toFixed(4)}</td>
										<td className="font-mono tabular-nums">{Math.round(t.strength * 100)}%</td>
										<td className="whitespace-normal">{note(i)}</td>
									</tr>
								);
							})}
						</tbody>
					</table>
				</div>
				<p className="text-xs text-fog-500">A thicker line marks skipped frames. Change any calculator setting and this example follows it.</p>
			</div>
		</details>
	);
}

export default function RunningCalculator() {
	const [charId, setCharId] = useState(0);
	const [speed, setSpeed] = useState(CHARACTER_SPEED[0]);
	const [side, setSide] = useState<BoxSide>('R');
	const [spot, setSpot] = useState<BoxSpot>('center');
	const [mash, setMash] = useState<MashMode>('tas');
	const [startBase, setStartBase] = useState(0);
	const [endBase, setEndBase] = useState(1);
	const [path, setPath] = useState<PathMode>('round');

	// Batter to 1B never rounds: the 1B overrun logic handles that baseline.
	const pathMatters = !(startBase === 0 && endBase === 1);
	const effectivePath: PathMode = pathMatters ? path : 'straight';
	const runs = useMemo(() => {
		const batterPos = batterPosition(charId, side, spot);
		const base = { speed, path: effectivePath, startBase, endBase, batterPos };
		return {
			tas: simulateRun({ ...base, mash: 'tas' }),
			human: simulateRun({ ...base, mash: 'human' }),
			none: simulateRun({ ...base, mash: 'none' })
		};
	}, [speed, charId, side, spot, effectivePath, startBase, endBase]);
	const run = runs[mash];
	const baseSpeed = CHARACTER_SPEED[charId];
	const isBatter = startBase === 0;
	const selColor = MASH_MODES.find((m) => m.value === mash)!.color;
	const endOptions = [1, 2, 3, 4].filter((b) => b > startBase);

	return (
		<div className="grid gap-6 p-5 lg:grid-cols-[300px_1fr]">
			<div className="space-y-4">
				<div>
					<label className="label" htmlFor="ra-char">
						Character
					</label>
					<select
						id="ra-char"
						className="input"
						value={charId}
						onChange={(e) => {
							const id = Number(e.target.value);
							setCharId(id);
							setSpeed(CHARACTER_SPEED[id]);
						}}
					>
						{BATTER_BOX.map((_, id) => (
							<option key={id} value={id}>
								{characters[String(id)]} · speed {CHARACTER_SPEED[id]}
							</option>
						))}
					</select>
					<p className="mt-1 text-xs text-fog-500">Sets the speed stat, and the batter&apos;s box when starting at home.</p>
				</div>
				<div>
					<label className="label" htmlFor="ra-speed">
						Speed stat: <span className="font-mono text-fog-100">{speed}</span>
					</label>
					<input
						id="ra-speed"
						type="range"
						min={0}
						max={SPEED_STAT_CAP}
						step={1}
						value={speed}
						onChange={(e) => setSpeed(Number(e.target.value))}
						className="w-full accent-rio-500"
					/>
					<div className="mt-1 flex flex-wrap gap-2 text-xs">
						<button type="button" className="text-fog-500 underline-offset-2 hover:text-fog-100 hover:underline" onClick={() => setSpeed(baseSpeed)}>
							Base ({baseSpeed})
						</button>
						<button type="button" className="text-fog-500 underline-offset-2 hover:text-fog-100 hover:underline" onClick={() => setSpeed(baseSpeed + 50)}>
							Starred ({baseSpeed + 50})
						</button>
					</div>
				</div>
				<div className="grid grid-cols-2 gap-3">
					<div>
						<label className="label" htmlFor="ra-start">
							Start
						</label>
						<select
							id="ra-start"
							className="input"
							value={startBase}
							onChange={(e) => {
								const s = Number(e.target.value);
								setStartBase(s);
								if (endBase <= s) setEndBase(s + 1);
							}}
						>
							{START_OPTIONS.map((o) => (
								<option key={o.value} value={o.value}>
									{o.label}
								</option>
							))}
						</select>
					</div>
					<div>
						<label className="label" htmlFor="ra-end">
							Run to
						</label>
						<select id="ra-end" className="input" value={endBase} onChange={(e) => setEndBase(Number(e.target.value))}>
							{endOptions.map((b) => (
								<option key={b} value={b}>
									{BASE_NAMES[b]}
								</option>
							))}
						</select>
					</div>
				</div>
				<div>
					<span className="label">Path</span>
					<Toggle
						label="Path"
						value={path}
						onChange={setPath}
						disabled={!pathMatters}
						options={[
							{ value: 'round', label: 'Round the bases' },
							{ value: 'straight', label: 'Straight' }
						]}
					/>
					<p className="mt-1 text-xs text-fog-500">
						{pathMatters
							? 'Round: ball in the outfield, speed carries through each base. Straight: ball in the infield, stop on 1B and slide into the rest.'
							: 'Home to 1B always runs straight; the 1B overrun logic handles that baseline.'}
					</p>
				</div>
				<div className={isBatter ? '' : 'opacity-40'}>
					<span className="label">Batter&apos;s box side</span>
					<Toggle
						label="Batter's box side"
						value={side}
						onChange={setSide}
						disabled={!isBatter}
						options={[
							{ value: 'R', label: 'Left (Right-Handed Batter)' },
							{ value: 'L', label: 'Right (Left-Handed Batter)' }
						]}
					/>
				</div>
				<div className={isBatter ? '' : 'opacity-40'}>
					<label className="label" htmlFor="ra-spot">
						Spot in the box
					</label>
					<select id="ra-spot" className="input" value={spot} disabled={!isBatter} onChange={(e) => setSpot(e.target.value as BoxSpot)}>
						{SPOTS.map((s) => (
							<option key={s.value} value={s.value}>
								{spotLabel(s.value, side)}
							</option>
						))}
					</select>
					<p className="mt-1 text-xs text-fog-500">
						{isBatter ? 'Front is toward the pitcher; inside is next to the plate.' : 'Only used when the batter is running.'}
					</p>
				</div>
				<div>
					<span className="label">Mashing</span>
					<Toggle label="Mashing" value={mash} onChange={setMash} options={MASH_MODES} />
					<p className="mt-1 text-xs text-fog-500">Human viable is a press every 3 frames, about 20 per second.</p>
				</div>
			</div>

			<div className="min-w-0 space-y-4">
				<div className="rounded-lg border border-night-700 bg-night-850 p-4">
					<p className="text-xs uppercase tracking-widest text-fog-500">
						Safe at {BASE_NAMES[endBase]} on frame
					</p>
					<p className="font-display text-4xl font-bold tabular-nums">
						{run.frame} <span className="text-lg font-medium text-fog-300">({framesToSeconds(run.frame)} s)</span>
					</p>
					<dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
						<dt className="text-fog-500">Start</dt>
						<dd className="text-right font-mono tabular-nums">
							({run.start[0].toFixed(2)}, {run.start[1].toFixed(2)}) m
						</dd>
						<dt className="text-fog-500">Each base</dt>
						<dd className="text-right font-mono tabular-nums">
							{run.bases.map((b) => `${BASE_NAMES[b.base]} ${b.frame}`).join(' · ')}
						</dd>
						<dt className="text-fog-500">Top speed / accel</dt>
						<dd className="text-right font-mono tabular-nums">
							{run.k.maxV.toFixed(4)} m/frame / {run.k.accel.toFixed(4)} m/frame²
						</dd>
						{MASH_MODES.filter((m) => m.value !== mash).map((m) => {
							const d = runs[m.value].frame - run.frame;
							return (
								<div key={m.value} className="contents">
									<dt className="text-fog-500">{m.name}</dt>
									<dd className="text-right font-mono tabular-nums">
										{runs[m.value].frame} ({d > 0 ? '+' : ''}
										{d})
									</dd>
								</div>
							);
						})}
					</dl>
				</div>
				<VelocityChart runs={runs} selected={mash} />
				<div className="flex flex-wrap gap-x-5 gap-y-1 text-xs text-fog-500">
					{MASH_MODES.map((m) => (
						<span key={m.value} className="flex items-center gap-2">
							<span className="inline-block w-5 border-t-2" style={{ borderColor: m.color }} />
							{m.name}
						</span>
					))}
					<span>Dashed lines: when the selected run reaches each base. Hover for the frame.</span>
				</div>
			</div>

			<div className="space-y-2 lg:col-span-2">
				<h3 className="font-display text-sm font-bold uppercase tracking-widest text-fog-300">The runner&apos;s path</h3>
				<div className="rounded-lg border border-night-700 bg-night-850 p-3">
					<RunPathChart run={run} color={selColor} charId={charId} side={side} startBase={startBase} />
				</div>
				<p className="text-xs text-fog-500">
					Top-down, from behind home plate. The thick line is the simulated path for the selected mashing mode. Numbered circles mark each
					second since contact, and the time under each base is when the runner reaches it. Callouts show the lead, where rounding starts,
					any slide (drawn dashed) and, on a run to 1B, the overrun past the base. The dotted curve and small circles are the full rounding spline and its control points; dashed
					lines are the straight baselines. Home plate is drawn at the game&apos;s size with its back point at the origin, where the foul lines meet; the small dot
					beside it is the point runners actually run to and from (0.4, 0.3), which the game places slightly toward 1st, so the
					baselines start there. The inset at the bottom right zooms in on the selected character&apos;s batter&apos;s boxes.
				</p>
			</div>

			<WorkedExample
				charId={charId}
				side={side}
				spot={spot}
				speed={speed}
				mash={mash}
				path={effectivePath}
				startBase={startBase}
				endBase={endBase}
				run={run}
			/>
		</div>
	);
}
