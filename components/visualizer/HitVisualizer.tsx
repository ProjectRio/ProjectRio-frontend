'use client';

// 3D hit visualizer — adapted from RioVisualizer's three.js front end
// (web/app.js), driven entirely in-browser by the TypeScript batting
// simulation. Replays a stored contact event exactly, then lets every input be
// modified in a "what-if" lab: swing type, contact spot, charge, swing frame,
// stick direction, chemistry, stars, pitch type, batter, and the RNG itself.

import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
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
import { getTheme3D, type StadiumTheme3D } from './stadiumThemes';
import { applyEnvironment, buildStadium, fetchStadium, makeGlowTexture, makeSkyTexture, pulseGlow, setupSunShadows } from './stadiumScene';

const METERS_TO_FEET = 3.28084;
const PATH_COLORS = [0xffffff, 0xffd24d, 0x6ecbff, 0xff8fe1, 0x9dff8f];

// ---------------------------------------------------------------------------
// three.js scene manager (imperative core, owned by the React component)
// ---------------------------------------------------------------------------

class VisualizerScene {
	private renderer: THREE.WebGLRenderer;
	private scene = new THREE.Scene();
	private camera: THREE.PerspectiveCamera;
	private controls: OrbitControls;
	private hemiLight = new THREE.HemisphereLight(0xffffff, 0x404040, 1);
	private sunLight = new THREE.DirectionalLight(0xffffff, 1);
	private world = new THREE.Group();
	private stadiumGroup = new THREE.Group();
	private hitGroup = new THREE.Group();
	private pulsingMaterials: THREE.MeshBasicMaterial[] = [];
	private animatedBalls: { mesh: THREE.Mesh; points: [number, number, number][] }[] = [];
	private glowTexture = makeGlowTexture();
	private raf = 0;
	private startTime = performance.now();
	private container: HTMLElement;
	private resizeObserver: ResizeObserver;

	constructor(container: HTMLElement) {
		this.container = container;
		this.camera = new THREE.PerspectiveCamera(70, 1, 0.1, 2000);
		this.camera.position.set(0, 55, -70);

		this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
		this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
		this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
		this.renderer.shadowMap.enabled = true;
		this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
		container.appendChild(this.renderer.domElement);

		this.controls = new OrbitControls(this.camera, this.renderer.domElement);
		this.controls.target.set(0, 0, 40);
		this.controls.enableDamping = true;
		this.controls.update();

		setupSunShadows(this.sunLight);
		this.scene.add(this.hemiLight, this.sunLight, this.sunLight.target);

		// The game's coordinate system is mirrored relative to three.js (1B is +X
		// but should appear on the right from behind home plate), so everything
		// renders inside a group with X flipped. Materials are DoubleSide.
		this.world.scale.x = -1;
		this.scene.add(this.world);
		this.world.add(this.stadiumGroup, this.hitGroup);

		this.resizeObserver = new ResizeObserver(() => this.resize());
		this.resizeObserver.observe(container);
		this.resize();

		const animate = () => {
			this.raf = requestAnimationFrame(animate);
			const now = performance.now();
			const frame = Math.floor(((now - this.startTime) * 60) / 1000);
			for (const { mesh, points } of this.animatedBalls) {
				const p = points[frame % points.length];
				mesh.position.set(p[0], p[1], p[2]);
			}
			pulseGlow(this.pulsingMaterials, now);
			this.controls.update();
			this.renderer.render(this.scene, this.camera);
		};
		animate();
	}

	private resize() {
		const w = this.container.clientWidth;
		const h = this.container.clientHeight;
		if (w === 0 || h === 0) return;
		this.camera.aspect = w / h;
		this.camera.updateProjectionMatrix();
		this.renderer.setSize(w, h);
	}

	private disposeGroup(group: THREE.Group) {
		group.traverse((obj: any) => {
			if (obj.geometry) obj.geometry.dispose();
			if (obj.material) {
				if (Array.isArray(obj.material)) obj.material.forEach((m: any) => m.dispose());
				else obj.material.dispose();
			}
		});
		group.clear();
	}

	applyEnvironment(theme: StadiumTheme3D) {
		this.container.style.background = `linear-gradient(${theme.skyTop}, ${theme.skyBottom})`;
		applyEnvironment(this.scene, this.hemiLight, this.sunLight, theme);
		if (this.scene.background instanceof THREE.Texture) this.scene.background.dispose();
		this.scene.background = makeSkyTexture(theme);
		this.renderer.toneMappingExposure = theme.exposure ?? 1;
	}

	buildStadium(stadiumJson: any, theme: StadiumTheme3D) {
		this.disposeGroup(this.stadiumGroup);
		this.applyEnvironment(theme);
		const built = buildStadium(stadiumJson, theme, { shadows: true });
		this.pulsingMaterials = built.pulsing;
		this.stadiumGroup.add(built.group);
	}

	buildHit(
		sim: SimulationOutput,
		theme: StadiumTheme3D,
		actualLanding: [number, number] | null,
		randomLandings: [number, number, number][]
	) {
		this.disposeGroup(this.hitGroup);
		this.animatedBalls = [];

		sim.paths.forEach((path, idx) => {
			const color = PATH_COLORS[idx % PATH_COLORS.length];
			const lineGeo = new THREE.BufferGeometry().setFromPoints(
				path.points.map((p) => new THREE.Vector3(p[0], p[1], p[2]))
			);
			this.hitGroup.add(
				new THREE.Line(
					lineGeo,
					new THREE.LineBasicMaterial({ color: sim.paths.length > 1 ? color : theme.lineGlow })
				)
			);

			const ball = new THREE.Mesh(
				new THREE.SphereGeometry(0.18, 12, 12),
				new THREE.MeshBasicMaterial({ color: 0xffffff })
			);
			const glow = new THREE.Sprite(
				new THREE.SpriteMaterial({
					map: this.glowTexture,
					color,
					transparent: true,
					depthWrite: false,
					blending: THREE.AdditiveBlending
				})
			);
			glow.scale.set(2.2, 2.2, 1);
			ball.add(glow);
			this.hitGroup.add(ball);
			this.animatedBalls.push({ mesh: ball, points: path.points });

			const [fx, , fz] = path.final;
			const ring = new THREE.Mesh(
				new THREE.RingGeometry(0.35, 0.55, 32),
				new THREE.MeshBasicMaterial({
					color,
					side: THREE.DoubleSide,
					transparent: true,
					opacity: 0.9
				})
			);
			ring.rotation.x = -Math.PI / 2;
			ring.position.set(fx, 0.03, fz);
			this.hitGroup.add(ring);
		});

		// Actual landing spot from the stored event, for comparison with what-ifs.
		if (actualLanding) {
			const [ax, az] = actualLanding;
			const ring = new THREE.Mesh(
				new THREE.RingGeometry(0.55, 0.8, 4),
				new THREE.MeshBasicMaterial({
					color: 0xe60012,
					side: THREE.DoubleSide,
					transparent: true,
					opacity: 0.95
				})
			);
			ring.rotation.x = -Math.PI / 2;
			ring.rotation.z = Math.PI / 4;
			ring.position.set(ax, 0.05, az);
			this.hitGroup.add(ring);
		}

		if (randomLandings.length > 0) {
			const geo = new THREE.BufferGeometry().setFromPoints(
				randomLandings.map((p) => new THREE.Vector3(p[0], Math.max(p[1], 0.05), p[2]))
			);
			this.hitGroup.add(
				new THREE.Points(geo, new THREE.PointsMaterial({ color: 0xfff4c8, size: 0.35 }))
			);
		}
	}

	dispose() {
		cancelAnimationFrame(this.raf);
		this.resizeObserver.disconnect();
		this.disposeGroup(this.hitGroup);
		this.disposeGroup(this.stadiumGroup);
		this.controls.dispose();
		this.renderer.dispose();
		this.renderer.domElement.remove();
	}
}

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
		const scene = new VisualizerScene(containerRef.current);
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

	if (!baseInputs || !effectiveInputs || !baseContact) return null;

	const fmt = (m: number) => (useFeet ? `${(m * METERS_TO_FEET).toFixed(1)} ft` : `${m.toFixed(1)} m`);
	const details = sim.details;
	const mainPath = sim.paths[0];
	const distance = mainPath ? Math.hypot(mainPath.final[0], mainPath.final[2]) : 0;
	const apex = mainPath ? mainPath.maxHeightPoint[1] : 0;
	const actualDistance = Math.hypot(baseContact.ball_x_landing_pos, baseContact.ball_z_landing_pos);
	const resultName = atBatResultName(event.result_of_ab);

	const set = (patch: Partial<HitBallInputs>) => setInputs((prev) => ({ ...prev!, ...patch }));

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
