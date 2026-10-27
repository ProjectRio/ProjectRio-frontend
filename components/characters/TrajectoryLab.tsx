'use client';

// Trajectory lab: demystifies how contact frame and the character's vertical
// trajectory shape where the ball can go. Drives the batting simulation with
// synthetic inputs for this character (no stored event needed) and renders the
// five vertical-zone paths plus a random-reroll landing cloud in the Rio
// Visualizer's 3D scene.

import { useEffect, useMemo, useRef, useState } from 'react';
import tables from '@/lib/mssb/BattingSimulation/battingConstants.json';
import { characterIdFromName } from '@/lib/data/characters';
import { attributesFor } from '@/lib/data/characterAttributes';
import type { HitBallInputs } from '@/lib/mssb/BattingSimulation/calcBatting';
import { recoverBatterX } from '@/lib/mssb/BattingSimulation/eventToSim';
import {
	simulateVerticalSpread,
	simulateRandomLandings,
	type SimulationOutput
} from '@/lib/mssb/BattingSimulation/simulatePaths';
import { VisualizerScene, fetchStadium, PATH_COLORS } from '@/components/visualizer/scene';
import { getTheme3D } from '@/components/visualizer/stadiumThemes';
import { PanelHeader, Spinner } from '@/components/ui';
import { HorizontalFan, StickShiftBars, VerticalFan } from './TrajectoryDiagrams';

// [inputDirection][isCharge][frame] -> [lo, hi] horizontal window in game
// angle units (4096 = 360°). [0, 0] rows are frames where contact can't happen.
const BATTING_ANGLE_RANGES = (tables as any).BATTING_ANGLE_RANGES as number[][][][];

const UNITS_TO_DEG = 360 / 4096;
const MARIO_STADIUM = 0;

// Empirically verified against the sim: for a righty, positive angle units
// land toward 3B (pull side), so bearing toward 1B = -units. Lefties mirror.
function bearingDeg(units: number, lefty: boolean): number {
	return (lefty ? 1 : -1) * units * UNITS_TO_DEG;
}

function fmtBearing(deg: number): string {
	if (Math.abs(deg) < 1) return 'CF';
	return `${Math.abs(deg).toFixed(0)}° ${deg < 0 ? '3B' : '1B'}`;
}

function validFrames(isCharge: 0 | 1): number[] {
	const rows = BATTING_ANGLE_RANGES[0][isCharge];
	return rows.map((r, i) => (r[0] !== 0 || r[1] !== 0 ? i : -1)).filter((i) => i >= 0);
}

function SegButtons<T extends string | number>({
	options,
	value,
	onChange
}: {
	options: { label: string; value: T }[];
	value: T;
	onChange: (value: T) => void;
}) {
	return (
		<div className="flex flex-wrap gap-1">
			{options.map((opt) => (
				<button
					key={String(opt.value)}
					onClick={() => onChange(opt.value)}
					className={`rounded border px-2.5 py-1 font-display text-xs font-semibold uppercase tracking-wider transition-colors ${
						value === opt.value
							? 'border-rio-500/60 bg-rio-500/20 text-rio-300'
							: 'border-night-600 bg-night-850 text-fog-500 hover:text-fog-300'
					}`}
				>
					{opt.label}
				</button>
			))}
		</div>
	);
}

export function TrajectoryLab({ characterName }: { characterName: string }) {
	const charId = characterIdFromName(characterName);
	const attrs = attributesFor(characterName);

	const [isCharge, setIsCharge] = useState<0 | 1>(0);
	const frames = useMemo(() => validFrames(isCharge), [isCharge]);
	const [frame, setFrame] = useState(6);
	const [stickX, setStickX] = useState<'none' | 'left' | 'right'>('none');
	const [stickY, setStickY] = useState<'none' | 'up' | 'down'>('none');
	const [contactAbs, setContactAbs] = useState(100);
	const [lefty, setLefty] = useState(false);
	const [cloudSeed, setCloudSeed] = useState(0);

	// Keep the frame inside the valid window when the swing type changes.
	useEffect(() => {
		setFrame((f) => Math.min(Math.max(f, frames[0]), frames[frames.length - 1]));
	}, [frames]);

	const inputs = useMemo<HitBallInputs | null>(() => {
		if (charId === null) return null;
		const id = Number(charId);
		return {
			batter_id: id,
			pitcher_id: 0,
			handedness: lefty ? 1 : 0,
			ball_x: 0,
			ball_z: 0,
			batter_x: recoverBatterX(id, lefty, 0, contactAbs),
			hit_type: isCharge,
			charge_up: isCharge ? 100 : 0,
			charge_down: 0,
			frame,
			stick_left: stickX === 'left',
			stick_right: stickX === 'right',
			stick_up: stickY === 'up',
			stick_down: stickY === 'down'
		};
	}, [charId, lefty, contactAbs, isCharge, frame, stickX, stickY]);

	const spread = useMemo<SimulationOutput>(
		() => (inputs ? simulateVerticalSpread(inputs) : { paths: [], details: null, errors: [] }),
		[inputs]
	);
	const cloud = useMemo<[number, number, number][]>(() => {
		void cloudSeed;
		return inputs ? simulateRandomLandings(inputs, 200) : [];
	}, [inputs, cloudSeed]);

	// --- 3D scene ---
	const containerRef = useRef<HTMLDivElement>(null);
	const sceneRef = useRef<VisualizerScene | null>(null);
	const [stadiumReady, setStadiumReady] = useState(false);

	useEffect(() => {
		if (!containerRef.current) return;
		const scene = new VisualizerScene(containerRef.current);
		sceneRef.current = scene;
		let cancelled = false;
		fetchStadium(MARIO_STADIUM)
			.then((json) => {
				if (cancelled) return;
				scene.buildStadium(json, getTheme3D(MARIO_STADIUM));
				scene.buildFielderMarkers();
				setStadiumReady(true);
			})
			.catch(() => setStadiumReady(false));
		return () => {
			cancelled = true;
			scene.dispose();
			sceneRef.current = null;
		};
	}, []);

	useEffect(() => {
		if (!sceneRef.current || !stadiumReady) return;
		sceneRef.current.buildHit(spread, getTheme3D(MARIO_STADIUM), null, cloud);
	}, [spread, cloud, stadiumReady]);

	if (charId === null || !attrs) return null;

	// Mirror calculateHorizontalAngle's stick -> pull/push mapping (hand-relative):
	// right stick = push for a righty, pull for a lefty; left stick the reverse.
	let inputDirection = 0; // PUSHPULL_NONE
	if (stickX === 'right') inputDirection = lefty ? 1 : 2;
	else if (stickX === 'left') inputDirection = lefty ? 2 : 1;
	const horizWindow = BATTING_ANGLE_RANGES[inputDirection][isCharge][frame] ?? [0, 0];
	const bearings = [bearingDeg(horizWindow[0], lefty), bearingDeg(horizWindow[1], lefty)].sort(
		(a, b) => a - b
	);
	const vertical = spread.details?.['Vertical Details'];
	const contact = spread.details?.Contact;

	return (
		<div className="panel">
			<PanelHeader title="Trajectory lab" />
			<div className="grid lg:grid-cols-[1fr_20rem]">
				<div ref={containerRef} className="relative min-h-[22rem] lg:min-h-[26rem]">
					{!stadiumReady && (
						<div className="absolute inset-0 flex items-center justify-center">
							<Spinner label="Loading stadium…" />
						</div>
					)}
				</div>

				<div className="space-y-4 border-t border-night-700 p-4 lg:border-t-0 lg:border-l">
					<p className="text-xs leading-relaxed text-fog-500">
						The frame of the swing when the ball is met sets the horizontal window; the
						character&apos;s vertical trajectory (type {attrs['Vertical Hit Trajectory']}) tilts
						the odds across five launch zones. Colored arcs are the five zones; dots are 200
						random rerolls of the same swing.
					</p>

					<div className="space-y-1">
						<span className="font-display text-[11px] font-bold uppercase tracking-widest text-fog-500">
							Swing
						</span>
						<SegButtons
							options={[
								{ label: 'Slap', value: 0 as const },
								{ label: 'Charge', value: 1 as const }
							]}
							value={isCharge}
							onChange={setIsCharge}
						/>
					</div>

					<div className="space-y-1">
						<div className="flex items-center justify-between">
							<span className="font-display text-[11px] font-bold uppercase tracking-widest text-fog-500">
								Contact frame
							</span>
							<span className="font-display text-xs font-bold tabular-nums text-fog-100">
								{frame}
							</span>
						</div>
						<input
							type="range"
							min={frames[0]}
							max={frames[frames.length - 1]}
							value={frame}
							onChange={(e) => setFrame(Number(e.target.value))}
							className="w-full accent-rio-500"
						/>
						<div className="flex justify-between text-[10px] text-fog-500">
							<span>{frames[0]} · early (opposite field)</span>
							<span>{frames[frames.length - 1]} · late (pulled)</span>
						</div>
						<p className="text-xs text-fog-300">
							Horizontal window: <span className="tabular-nums">{fmtBearing(bearings[0])}</span> →{' '}
							<span className="tabular-nums">{fmtBearing(bearings[1])}</span>
						</p>
					</div>

					<div className="grid grid-cols-2 gap-3">
						<div className="space-y-1">
							<span className="font-display text-[11px] font-bold uppercase tracking-widest text-fog-500">
								Stick L/R
							</span>
							<SegButtons
								options={[
									{ label: '—', value: 'none' as const },
									{ label: 'L', value: 'left' as const },
									{ label: 'R', value: 'right' as const }
								]}
								value={stickX}
								onChange={setStickX}
							/>
						</div>
						<div className="space-y-1">
							<span className="font-display text-[11px] font-bold uppercase tracking-widest text-fog-500">
								Stick U/D
							</span>
							<SegButtons
								options={[
									{ label: '—', value: 'none' as const },
									{ label: 'Up', value: 'up' as const },
									{ label: 'Dn', value: 'down' as const }
								]}
								value={stickY}
								onChange={setStickY}
							/>
						</div>
					</div>

					<div className="space-y-1">
						<div className="flex items-center justify-between">
							<span className="font-display text-[11px] font-bold uppercase tracking-widest text-fog-500">
								Contact spot
							</span>
							<span className="text-xs text-fog-300">
								{contact ? contact.ContactZone : '—'}
							</span>
						</div>
						<input
							type="range"
							min={0}
							max={200}
							value={contactAbs}
							onChange={(e) => setContactAbs(Number(e.target.value))}
							className="w-full accent-rio-500"
						/>
					</div>

					<div className="flex items-center gap-2">
						<SegButtons
							options={[
								{ label: 'Righty', value: 'R' },
								{ label: 'Lefty', value: 'L' }
							]}
							value={lefty ? 'L' : 'R'}
							onChange={(v) => setLefty(v === 'L')}
						/>
						<button
							onClick={() => setCloudSeed((s) => s + 1)}
							className="rounded border border-night-600 bg-night-850 px-2.5 py-1 font-display text-xs font-semibold uppercase tracking-wider text-fog-500 transition-colors hover:text-fog-300"
						>
							Reroll cloud
						</button>
					</div>

					{vertical && (
						<div>
							<span className="font-display text-[11px] font-bold uppercase tracking-widest text-fog-500">
								Launch zones · weight
							</span>
							<div className="mt-1 space-y-1">
								{vertical.Zones.map((zone, i) => (
									<div key={i} className="flex items-center gap-2 text-xs">
										<span
											className="h-2.5 w-2.5 shrink-0 rounded-full"
											style={{ backgroundColor: `#${PATH_COLORS[i % PATH_COLORS.length].toString(16).padStart(6, '0')}` }}
										/>
										<span className="w-24 tabular-nums text-fog-300">
											{(zone[0] * UNITS_TO_DEG).toFixed(0)}°–{(zone[1] * UNITS_TO_DEG).toFixed(0)}°
										</span>
										<div className="h-1.5 flex-1 overflow-hidden rounded-full bg-night-700">
											<div
												className="h-full rounded-full bg-fog-300/70"
												style={{ width: `${vertical.Weights[i]}%` }}
											/>
										</div>
										<span className="w-8 text-right tabular-nums text-fog-500">
											{vertical.Weights[i]}%
										</span>
									</div>
								))}
							</div>
						</div>
					)}
				</div>
			</div>

			{/* 2D companions: every frame's horizontal window and the launch-zone
			    weights under each vertical stick input. */}
			<div className="grid gap-6 border-t border-night-700 p-4 lg:grid-cols-2">
				<div>
					<h3 className="mb-1 font-display text-xs font-bold uppercase tracking-widest text-fog-500">
						Horizontal windows by frame
					</h3>
					<p className="mb-2 text-xs text-fog-500">
						Each band is one contact frame&apos;s spray window under the current stick hold —
						holding left or right shifts the whole fan. Selected frame in red; the bars below
						compare frame {frame}&apos;s window across stick holds.
					</p>
					<HorizontalFan isCharge={isCharge} frame={frame} lefty={lefty} stickX={stickX} frames={frames} />
					<div className="mt-2">
						<StickShiftBars isCharge={isCharge} frame={frame} lefty={lefty} stickX={stickX} />
					</div>
				</div>
				<div>
					<h3 className="mb-1 font-display text-xs font-bold uppercase tracking-widest text-fog-500">
						Launch zones
					</h3>
					<p className="mb-2 text-xs text-fog-500">
						The five launch-angle zones for this contact, shaded by this character&apos;s odds of
						rolling each one. This fan tracks the live controls — hold stick up to empty the high
						zones into the lowest, down for the reverse.
					</p>
					{inputs && <VerticalFan inputs={inputs} />}
				</div>
			</div>
		</div>
	);
}
