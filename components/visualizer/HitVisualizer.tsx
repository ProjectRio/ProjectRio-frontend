'use client';

// 3D hit visualizer — adapted from RioVisualizer's three.js front end
// (web/app.js), driven entirely in-browser by the TypeScript batting
// simulation. Replays a stored contact event exactly, then lets every input be
// modified in a "what-if" lab: swing type, contact spot, charge, swing frame,
// stick direction, chemistry, stars, pitch type, batter, and the RNG itself.
//
// The three.js core lives in ./scene (shared with TrajectoryLab); this modal
// composes its own camera presets and visual layers via the scene options.

import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { characterName } from '@/lib/data/characters';
import { stadiums } from '@/lib/data/characters';
import { atBatResultName } from '@/lib/mssb/constants';
import type { HitBallInputs } from '@/lib/mssb/BattingSimulation/calcBatting';
import { BATTING_STATS } from '@/lib/mssb/BattingSimulation/calcBatting';
import {
	eventToHitInputs,
	recoverBatterX,
	type GameEvent
} from '@/lib/mssb/BattingSimulation/eventToSim';
import {
	simulateExact,
	simulateVerticalSpread,
	simulateRandomLandings,
	type SimulationOutput
} from '@/lib/mssb/BattingSimulation/simulatePaths';
import { getTheme3D } from './stadiumThemes';
import {
	VisualizerScene,
	fetchStadium,
	type CameraPresetName,
	type VisualizerLook
} from './scene';

const METERS_TO_FEET = 3.28084;

// The modal's default look: full showcase.
const MODAL_LOOK: VisualizerLook = {
	bloom: true,
	trail: true,
	impact: true,
	distanceRings: false,
	apexMarker: true,
	fielderMarkers: true,
	skyDome: true,
	ground: true
};

const CAMERA_PRESETS: { value: CameraPresetName; label: string }[] = [
	{ value: 'broadcast', label: 'Broadcast' },
	{ value: 'chase', label: 'Chase' },
	{ value: 'catcher', label: 'Catcher' },
	{ value: 'blimp', label: 'Blimp' },
	{ value: 'landing', label: 'Landing' }
];

// ---------------------------------------------------------------------------
// UI
// ---------------------------------------------------------------------------

function Segmented<T extends string | number>({
	value,
	options,
	onChange
}: {
	value: T;
	options: { value: T; label: string }[];
	onChange: (v: T) => void;
}) {
	return (
		<div className="flex overflow-hidden rounded-lg border border-night-600 text-xs">
			{options.map((opt) => (
				<button
					key={String(opt.value)}
					className={`flex-1 px-2 py-1.5 font-display font-semibold uppercase tracking-wider transition-colors ${
						value === opt.value ? 'bg-rio-500 text-white' : 'text-fog-300 hover:bg-night-700'
					}`}
					onClick={() => onChange(opt.value)}
				>
					{opt.label}
				</button>
			))}
		</div>
	);
}

function Chip({
	active,
	label,
	onClick
}: {
	active: boolean;
	label: string;
	onClick: () => void;
}) {
	return (
		<button
			className={`rounded border px-2 py-1 font-display text-[10px] font-bold uppercase tracking-wider transition-colors ${
				active
					? 'border-rio-400 bg-night-950/70 text-rio-300'
					: 'border-night-600 bg-night-950/70 text-fog-500 hover:text-fog-300'
			}`}
			onClick={onClick}
		>
			{label}
		</button>
	);
}

function SliderRow({
	label,
	value,
	min,
	max,
	step,
	display,
	onChange
}: {
	label: string;
	value: number;
	min: number;
	max: number;
	step: number;
	display?: string;
	onChange: (v: number) => void;
}) {
	return (
		<div>
			<div className="mb-1 flex items-center justify-between">
				<span className="label !mb-0">{label}</span>
				<span className="font-display text-xs font-bold tabular-nums text-fog-100">
					{display ?? value}
				</span>
			</div>
			<input
				type="range"
				min={min}
				max={max}
				step={step}
				value={value}
				onChange={(e) => onChange(Number(e.target.value))}
				className="w-full accent-rio-500"
			/>
		</div>
	);
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
	return (
		<div className="rounded-lg bg-night-850 px-3 py-2">
			<p className="font-display text-[10px] font-semibold uppercase tracking-widest text-fog-500">
				{label}
			</p>
			<p
				className={`mt-0.5 font-display text-lg font-bold tabular-nums ${accent ? 'text-star-400' : 'text-fog-100'}`}
			>
				{value}
			</p>
		</div>
	);
}

export default function HitVisualizer({
	stadiumId,
	event,
	batterUser,
	onClose
}: {
	stadiumId: number;
	event: GameEvent;
	batterUser: string;
	onClose: () => void;
}) {
	const baseInputs = useMemo(() => eventToHitInputs(event), [event]);
	const baseContact = event.pitch?.contact ?? null;

	const [inputs, setInputs] = useState<HitBallInputs | null>(baseInputs);
	const [contactAbsolute, setContactAbsolute] = useState<number>(
		baseContact?.contact_absolute ?? 100
	);
	const [showSpread, setShowSpread] = useState(false);
	const [showCloud, setShowCloud] = useState(false);
	const [useFeet, setUseFeet] = useState(false);
	const [cloudSeed, setCloudSeed] = useState(0);

	// Camera + looks (scene owns the behavior; this state mirrors it for the UI).
	const [preset, setPreset] = useState<CameraPresetName>('broadcast');
	const [look, setLook] = useState<VisualizerLook>(MODAL_LOOK);
	const [slowMo, setSlowMo] = useState(false);

	const containerRef = useRef<HTMLDivElement>(null);
	const sceneRef = useRef<VisualizerScene | null>(null);
	const [stadiumReady, setStadiumReady] = useState(false);

	// Reset the lab when a different event is selected.
	useEffect(() => {
		setInputs(baseInputs);
		setContactAbsolute(baseContact?.contact_absolute ?? 100);
		setShowSpread(false);
		setShowCloud(false);
	}, [baseInputs, baseContact]);

	// Effective inputs: the contact-spot slider re-derives the batter's plate
	// position through the same inversion used to replay the stored event.
	const effectiveInputs = useMemo<HitBallInputs | null>(() => {
		if (!inputs) return null;
		return {
			...inputs,
			batter_x: recoverBatterX(
				inputs.batter_id ?? 0,
				inputs.handedness === 1,
				inputs.ball_x ?? 0,
				contactAbsolute
			)
		};
	}, [inputs, contactAbsolute]);

	const sim = useMemo<SimulationOutput>(() => {
		if (!effectiveInputs) return { paths: [], details: null, errors: ['no contact data'] };
		return showSpread ? simulateVerticalSpread(effectiveInputs) : simulateExact(effectiveInputs);
	}, [effectiveInputs, showSpread]);

	const cloud = useMemo<[number, number, number][]>(() => {
		void cloudSeed;
		if (!effectiveInputs || !showCloud) return [];
		return simulateRandomLandings(effectiveInputs, 150);
	}, [effectiveInputs, showCloud, cloudSeed]);

	const isModified =
		JSON.stringify(inputs) !== JSON.stringify(baseInputs) ||
		contactAbsolute !== (baseContact?.contact_absolute ?? 100);

	// --- scene lifecycle ---
	useEffect(() => {
		if (!containerRef.current) return;
		const scene = new VisualizerScene(containerRef.current, {
			...MODAL_LOOK,
			cameraPreset: 'broadcast',
			introFlyIn: true
		});
		sceneRef.current = scene;
		return () => {
			scene.dispose();
			sceneRef.current = null;
		};
	}, []);

	useEffect(() => {
		let cancelled = false;
		setStadiumReady(false);
		fetchStadium(stadiumId)
			.then((json) => {
				if (cancelled || !sceneRef.current) return;
				sceneRef.current.buildStadium(json, getTheme3D(stadiumId));
				sceneRef.current.buildFielderMarkers();
				setStadiumReady(true);
			})
			.catch(() => setStadiumReady(false));
		return () => {
			cancelled = true;
		};
	}, [stadiumId]);

	useEffect(() => {
		if (!sceneRef.current) return;
		const actual: [number, number] | null = baseContact
			? [baseContact.ball_x_landing_pos, baseContact.ball_z_landing_pos]
			: null;
		sceneRef.current.buildHit(sim, getTheme3D(stadiumId), actual, cloud);
	}, [sim, cloud, stadiumId, baseContact, stadiumReady]);

	useEffect(() => {
		sceneRef.current?.setUnits(useFeet);
	}, [useFeet]);

	if (!baseInputs || !effectiveInputs || !baseContact) return null;

	const fmt = (m: number) => (useFeet ? `${(m * METERS_TO_FEET).toFixed(1)} ft` : `${m.toFixed(1)} m`);
	const details = sim.details;
	const mainPath = sim.paths[0];
	const distance = mainPath ? Math.hypot(mainPath.final[0], mainPath.final[2]) : 0;
	const apex = mainPath ? mainPath.maxHeightPoint[1] : 0;
	const actualDistance = Math.hypot(baseContact.ball_x_landing_pos, baseContact.ball_z_landing_pos);
	const resultName = atBatResultName(event.result_of_ab);

	const set = (patch: Partial<HitBallInputs>) => setInputs((prev) => ({ ...prev!, ...patch }));

	const pickPreset = (p: CameraPresetName) => {
		setPreset(p);
		sceneRef.current?.setCameraPreset(p);
	};
	const toggleLook = (key: keyof VisualizerLook) => {
		setLook((prev) => {
			const next = { ...prev, [key]: !prev[key] };
			sceneRef.current?.setLook({ [key]: next[key] });
			return next;
		});
	};
	const toggleSlowMo = () => {
		setSlowMo((v) => {
			sceneRef.current?.setPlaybackSpeed(v ? 1 : 0.25);
			return !v;
		});
	};

	// Portal to <body>: an ancestor with transform/filter would otherwise
	// capture this fixed-position overlay and offset it.
	return createPortal(
		<div className="fixed inset-0 z-[90] flex flex-col bg-night-950/95 backdrop-blur-sm">
			{/* Header */}
			<div className="flex items-center justify-between border-b border-night-700 bg-night-900 px-4 py-2.5">
				<div className="flex items-center gap-3">
					<p className="kicker !text-xs">Rio Visualizer</p>
					<h2 className="font-display text-lg font-bold uppercase">
						{characterName(event.batter.char_id)}
						<span className="text-fog-500"> · {batterUser} · </span>
						{resultName || 'Contact'}
						<span className="text-fog-500">
							{' '}
							· {event.half_inning === 0 ? 'Top' : 'Bot'} {event.inning}
						</span>
					</h2>
					{isModified && (
						<span className="rounded border border-star-500/40 bg-star-500/15 px-2 py-0.5 font-display text-xs font-bold uppercase tracking-wider text-star-400">
							What-if
						</span>
					)}
				</div>
				<div className="flex items-center gap-2">
					<span className="hidden text-xs text-fog-500 sm:block">
						{stadiums[String(stadiumId)]} — {getTheme3D(stadiumId).label}
					</span>
					<button
						className="rounded-lg border border-night-600 px-3 py-1.5 font-display text-xs font-bold uppercase tracking-wider text-fog-300 transition-colors hover:border-rio-400 hover:text-rio-300"
						onClick={onClose}
					>
						✕ Close
					</button>
				</div>
			</div>

			<div className="flex min-h-0 flex-1 flex-col lg:flex-row">
				{/* 3D viewport */}
				<div className="relative min-h-[40vh] flex-1">
					<div ref={containerRef} className="absolute inset-0" />
					{!stadiumReady && (
						<div className="absolute inset-0 flex items-center justify-center text-sm text-fog-300">
							Loading stadium…
						</div>
					)}
					{/* Camera + looks controls */}
					<div className="absolute right-3 top-3 flex flex-col items-end gap-1.5">
						<div className="flex flex-wrap justify-end gap-1">
							{CAMERA_PRESETS.map((p) => (
								<Chip
									key={p.value}
									active={preset === p.value}
									label={p.label}
									onClick={() => pickPreset(p.value)}
								/>
							))}
							<Chip active={slowMo} label="¼×" onClick={toggleSlowMo} />
						</div>
						<div className="flex flex-wrap justify-end gap-1">
							<Chip active={look.bloom} label="Bloom" onClick={() => toggleLook('bloom')} />
							<Chip active={look.trail} label="Trail" onClick={() => toggleLook('trail')} />
							<Chip active={look.impact} label="FX" onClick={() => toggleLook('impact')} />
							<Chip
								active={look.distanceRings}
								label="Rings"
								onClick={() => toggleLook('distanceRings')}
							/>
							<Chip active={look.apexMarker} label="Apex" onClick={() => toggleLook('apexMarker')} />
							<Chip
								active={look.fielderMarkers}
								label="Fielders"
								onClick={() => toggleLook('fielderMarkers')}
							/>
						</div>
					</div>
					{/* Readout strip */}
					<div className="pointer-events-none absolute inset-x-0 bottom-0 flex flex-wrap gap-2 p-3">
						<Stat label="Distance" value={fmt(distance)} accent={isModified} />
						<Stat label="Apex" value={fmt(apex)} />
						<Stat label="Hang" value={`${mainPath?.points.length ?? 0}f`} />
						<Stat label="Power" value={`${details?.BallDetails?.Power ?? '—'}`} />
						<Stat
							label="Contact"
							value={`${details?.Contact?.ContactZone ?? '—'} ${
								details?.Contact ? Math.round(details.Contact.ContactQuality * 100) + '%' : ''
							}`}
						/>
						<Stat label="Actual" value={`${fmt(actualDistance)} · ${resultName || '—'}`} />
					</div>
					{sim.errors.length > 0 && (
						<div className="absolute left-3 top-3 rounded-lg border border-rio-700 bg-night-950/80 px-3 py-2 text-xs text-rio-300">
							{sim.errors.join(' · ')}
						</div>
					)}
				</div>

				{/* What-if controls */}
				<div className="w-full shrink-0 space-y-4 overflow-y-auto border-t border-night-700 bg-night-900 p-4 lg:w-80 lg:border-l lg:border-t-0">
					<div className="flex items-center justify-between">
						<p className="kicker">What-if lab</p>
						<button
							className="rounded border border-night-600 px-2 py-1 font-display text-[10px] font-bold uppercase tracking-wider text-fog-300 transition-colors hover:border-rio-400 hover:text-rio-300 disabled:opacity-40"
							disabled={!isModified}
							onClick={() => {
								setInputs(baseInputs);
								setContactAbsolute(baseContact.contact_absolute);
							}}
						>
							↺ Reset to actual
						</button>
					</div>

					<div>
						<span className="label">Swing</span>
						<Segmented
							value={inputs!.hit_type ?? 0}
							options={[
								{ value: 0, label: 'Slap' },
								{ value: 1, label: 'Charge' },
								{ value: 2, label: 'Star' },
								{ value: 3, label: 'Bunt' }
							]}
							onChange={(hit_type) =>
								set({ hit_type, is_star_hit: hit_type === 2 ? true : inputs!.is_star_hit })
							}
						/>
					</div>

					<SliderRow
						label="Contact spot"
						value={contactAbsolute}
						min={0}
						max={200}
						step={0.5}
						display={`${contactAbsolute.toFixed(1)} / 200`}
						onChange={setContactAbsolute}
					/>

					<div className="grid grid-cols-2 gap-3">
						<SliderRow
							label="Charge up"
							value={inputs!.charge_up ?? 0}
							min={0}
							max={1}
							step={0.01}
							display={`${Math.round((inputs!.charge_up ?? 0) * 100)}%`}
							onChange={(charge_up) => set({ charge_up })}
						/>
						<SliderRow
							label="Charge down"
							value={inputs!.charge_down ?? 0}
							min={0}
							max={1}
							step={0.01}
							display={`${Math.round((inputs!.charge_down ?? 0) * 100)}%`}
							onChange={(charge_down) => set({ charge_down })}
						/>
					</div>

					<SliderRow
						label="Frame of swing"
						value={inputs!.frame ?? 0}
						min={0}
						max={14}
						step={1}
						onChange={(frame) => set({ frame })}
					/>

					<div>
						<span className="label">Stick input</span>
						<div className="grid grid-cols-4 gap-1.5">
							{(
								[
									['stick_left', '◀'],
									['stick_up', '▲'],
									['stick_down', '▼'],
									['stick_right', '▶']
								] as const
							).map(([key, glyph]) => (
								<button
									key={key}
									className={`rounded-lg border px-2 py-1.5 font-display text-sm font-bold transition-colors ${
										inputs![key]
											? 'border-rio-400 bg-rio-500/20 text-rio-300'
											: 'border-night-600 text-fog-500 hover:border-night-600 hover:text-fog-300'
									}`}
									onClick={() => set({ [key]: !inputs![key] } as Partial<HitBallInputs>)}
								>
									{glyph}
								</button>
							))}
						</div>
					</div>

					<div className="grid grid-cols-2 gap-3">
						<SliderRow
							label="Chem on base"
							value={inputs!.chem ?? 0}
							min={0}
							max={5}
							step={1}
							onChange={(chem) => set({ chem })}
						/>
						<SliderRow
							label="Team stars"
							value={inputs!.num_stars ?? 0}
							min={0}
							max={5}
							step={1}
							onChange={(num_stars) => set({ num_stars })}
						/>
					</div>

					<div>
						<span className="label">Pitch</span>
						<Segmented
							value={inputs!.pitch_type ?? 0}
							options={[
								{ value: 0, label: 'Curve' },
								{ value: 1, label: 'Charge' },
								{ value: 2, label: 'Perfect' },
								{ value: 3, label: 'Change' }
							]}
							onChange={(pitch_type) => set({ pitch_type })}
						/>
					</div>

					<div>
						<span className="label">Batter</span>
						<select
							className="input"
							value={inputs!.batter_id ?? 0}
							onChange={(e) => set({ batter_id: Number(e.target.value) })}
						>
							{BATTING_STATS.map((s, id) => (
								<option key={id} value={id}>
									{s.Name}
								</option>
							))}
						</select>
					</div>

					<label className="flex items-center justify-between">
						<span className="label !mb-0">Starred (+50 stats)</span>
						<input
							type="checkbox"
							checked={inputs!.is_starred ?? false}
							onChange={(e) => set({ is_starred: e.target.checked })}
							className="h-4 w-4 accent-rio-500"
						/>
					</label>

					<div className="border-t border-night-700 pt-3">
						<p className="kicker mb-2 !text-[10px]">Fate (RNG)</p>
						<div className="flex flex-wrap gap-2">
							<button
								className="btn-secondary !px-3 !py-1.5 !text-xs"
								onClick={() =>
									set({
										rand_1: Math.trunc(Math.random() * 2 ** 15),
										rand_2: Math.trunc(Math.random() * 2 ** 15),
										rand_3: Math.trunc(Math.random() * 2 ** 15)
									})
								}
							>
								🎲 Reroll fate
							</button>
							<button
								className={`btn-secondary !px-3 !py-1.5 !text-xs ${showSpread ? '!border-rio-400 !text-rio-300' : ''}`}
								onClick={() => setShowSpread((v) => !v)}
							>
								5 launch zones
							</button>
							<button
								className={`btn-secondary !px-3 !py-1.5 !text-xs ${showCloud ? '!border-rio-400 !text-rio-300' : ''}`}
								onClick={() => {
									setShowCloud((v) => !v);
									setCloudSeed((s) => s + 1);
								}}
							>
								Outcome cloud
							</button>
						</div>
						<p className="mt-2 text-[11px] leading-snug text-fog-500">
							Same swing, different luck: reroll the game&apos;s RNG, fan the five possible launch
							zones, or scatter 150 random outcomes.
						</p>
					</div>

					<div className="flex items-center justify-between border-t border-night-700 pt-3">
						<span className="label !mb-0">Units</span>
						<Segmented
							value={useFeet ? 1 : 0}
							options={[
								{ value: 0, label: 'Meters' },
								{ value: 1, label: 'Feet' }
							]}
							onChange={(v) => setUseFeet(v === 1)}
						/>
					</div>
				</div>
			</div>
		</div>,
		document.body
	);
}
