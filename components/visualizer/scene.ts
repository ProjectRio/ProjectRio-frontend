// Rio Visualizer three.js scene — the imperative core shared by the game-page
// modal (HitVisualizer) and the character dashboards (TrajectoryLab).
//
// Every camera behavior and visual layer is an option the caller composes:
// pass initial choices to the constructor, then drive them at runtime with
// setLook / setCameraPreset / setPlaybackSpeed / setUnits. Nothing here reads
// React state; callers own the UI.

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import type { SimulationOutput } from '@/lib/mssb/BattingSimulation/simulatePaths';
import { FIELDER_STARTING_POSITIONS } from '@/lib/mssb/fielderPositions';
import { COLLISION_TYPE_KEYS, type StadiumTheme3D } from './stadiumThemes';

const METERS_TO_FEET = 3.28084;
export const PATH_COLORS = [0xffffff, 0xffd24d, 0x6ecbff, 0xff8fe1, 0x9dff8f];

const TRAIL_LEN = 22;
const SKY_RADIUS = 700;
const GROUND_RADIUS = 650;

// ---------------------------------------------------------------------------
// options
// ---------------------------------------------------------------------------

export type CameraPresetName = 'broadcast' | 'chase' | 'catcher' | 'blimp' | 'landing';

/** Toggleable visual layers. Every flag can change at runtime via setLook. */
export interface VisualizerLook {
	/** UnrealBloom + ACES tone mapping; emissives (lava, glows) actually glow. */
	bloom: boolean;
	/** Fading comet trail behind each animated ball. */
	trail: boolean;
	/** Shockwave ring + particle burst when a ball lands. */
	impact: boolean;
	/** Concentric distance rings from home plate, labeled in current units. */
	distanceRings: boolean;
	/** Dashed drop-line at the main path's highest point. */
	apexMarker: boolean;
	/** Rings + labels at the nine default fielder spots. */
	fielderMarkers: boolean;
	/** In-scene gradient sky dome (stars on night themes). */
	skyDome: boolean;
	/** Fog-faded ground plane so the stadium doesn't float in the void. */
	ground: boolean;
}

export interface SceneOptions extends Partial<VisualizerLook> {
	cameraPreset?: CameraPresetName;
	/** One-time cinematic sweep from above center field down to the preset. */
	introFlyIn?: boolean;
}

const DEFAULT_LOOK: VisualizerLook = {
	bloom: false,
	trail: true,
	impact: true,
	distanceRings: false,
	apexMarker: false,
	fielderMarkers: true,
	skyDome: true,
	ground: true
};

// ---------------------------------------------------------------------------
// stadium data + textures
// ---------------------------------------------------------------------------

const stadiumCache = new Map<number, Promise<any>>();

export function fetchStadium(stadiumId: number): Promise<any> {
	if (!stadiumCache.has(stadiumId)) {
		stadiumCache.set(
			stadiumId,
			fetch(`/stadiums/${stadiumId}.json`).then((r) => {
				if (!r.ok) throw new Error(`stadium ${stadiumId} fetch failed`);
				return r.json();
			})
		);
	}
	return stadiumCache.get(stadiumId)!;
}

function makeGlowTexture(): THREE.CanvasTexture {
	const c = document.createElement('canvas');
	c.width = c.height = 64;
	const ctx = c.getContext('2d')!;
	const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
	g.addColorStop(0, 'rgba(255,255,255,1)');
	g.addColorStop(0.35, 'rgba(255,255,255,0.55)');
	g.addColorStop(1, 'rgba(255,255,255,0)');
	ctx.fillStyle = g;
	ctx.fillRect(0, 0, 64, 64);
	return new THREE.CanvasTexture(c);
}

function makeRainbowTexture(): THREE.CanvasTexture {
	const c = document.createElement('canvas');
	c.width = c.height = 128;
	const ctx = c.getContext('2d')!;
	const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
	const stops = ['#7a2fd4', '#2f55d4', '#2fb8d4', '#2fd45a', '#e8e02f', '#e8862f', '#d42b2b'];
	stops.forEach((color, i) => g.addColorStop(i / (stops.length - 1), color));
	ctx.fillStyle = g;
	ctx.fillRect(0, 0, 128, 128);
	return new THREE.CanvasTexture(c);
}

// Text label sprite. The material owns its texture (ownsMap) so disposeGroup
// frees it — canvas textures otherwise leak on every rebuild.
function makeLabelSprite(text: string, scale: number): THREE.Sprite {
	const canvas = document.createElement('canvas');
	canvas.width = 128;
	canvas.height = 48;
	const ctx = canvas.getContext('2d')!;
	ctx.font = 'bold 30px sans-serif';
	ctx.textAlign = 'center';
	ctx.textBaseline = 'middle';
	ctx.lineWidth = 6;
	ctx.strokeStyle = 'rgba(0,0,0,0.75)';
	ctx.strokeText(text, 64, 24);
	ctx.fillStyle = '#ffffff';
	ctx.fillText(text, 64, 24);
	const mat = new THREE.SpriteMaterial({
		map: new THREE.CanvasTexture(canvas),
		transparent: true,
		opacity: 0.85,
		depthWrite: false
	});
	mat.userData.ownsMap = true;
	const sprite = new THREE.Sprite(mat);
	sprite.scale.set(scale * (128 / 48), scale, 1);
	return sprite;
}

function easeInOutCubic(t: number): number {
	return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

// ---------------------------------------------------------------------------
// scene
// ---------------------------------------------------------------------------

interface AnimatedBall {
	mesh: THREE.Mesh;
	points: [number, number, number][];
	lastIdx: number;
	color: number;
	trail: THREE.Line;
	trailPositions: Float32Array;
}

interface ImpactEffect {
	ring: THREE.Mesh;
	particles: THREE.Points;
	velocities: Float32Array;
	born: number;
}

interface CameraTween {
	fromPos: THREE.Vector3;
	toPos: THREE.Vector3;
	fromTarget: THREE.Vector3;
	toTarget: THREE.Vector3;
	start: number;
	duration: number;
}

export class VisualizerScene {
	private renderer: THREE.WebGLRenderer;
	private scene = new THREE.Scene();
	private camera: THREE.PerspectiveCamera;
	private controls: OrbitControls;
	private composer: EffectComposer | null = null;
	private bloomPass: UnrealBloomPass | null = null;
	private hemiLight = new THREE.HemisphereLight(0xffffff, 0x404040, 1);
	private sunLight = new THREE.DirectionalLight(0xffffff, 1);
	private world = new THREE.Group();
	private stadiumGroup = new THREE.Group();
	private hitGroup = new THREE.Group();
	private bundleGroup = new THREE.Group();
	private fielderGroup = new THREE.Group();
	private envGroup = new THREE.Group();
	private overlayGroup = new THREE.Group();
	private pulsingMaterials: THREE.MeshBasicMaterial[] = [];
	private animatedBalls: AnimatedBall[] = [];
	private impacts: ImpactEffect[] = [];
	private apexLine: THREE.Line | null = null;
	private glowTexture = makeGlowTexture();
	private raf = 0;
	private lastNow = performance.now();
	private virtualMs = 0;
	private speed = 1;
	private container: HTMLElement;
	private resizeObserver: ResizeObserver;

	private look: VisualizerLook;
	private preset: CameraPresetName;
	private tween: CameraTween | null = null;
	private chasePrevBall: THREE.Vector3 | null = null;
	private lastLanding: THREE.Vector3 | null = null; // scene coords
	private useFeet = false;
	private theme: StadiumTheme3D | null = null;

	constructor(container: HTMLElement, options: SceneOptions = {}) {
		this.container = container;
		this.look = { ...DEFAULT_LOOK, ...options };
		this.preset = options.cameraPreset ?? 'broadcast';

		this.camera = new THREE.PerspectiveCamera(70, 1, 0.1, 2000);

		this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
		this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
		container.appendChild(this.renderer.domElement);

		this.controls = new OrbitControls(this.camera, this.renderer.domElement);
		this.controls.enableDamping = true;
		// Keep the camera out of the floor and from tunneling through geometry:
		// no orbiting below the horizon, no zooming inside the infield or out
		// past the sky dome.
		this.controls.maxPolarAngle = Math.PI / 2 - 0.05;
		this.controls.minDistance = 6;
		this.controls.maxDistance = 340;

		this.scene.add(this.hemiLight, this.sunLight);

		// The game's coordinate system is mirrored relative to three.js (1B is +X
		// but should appear on the right from behind home plate), so everything
		// renders inside a group with X flipped. Materials are DoubleSide.
		this.world.scale.x = -1;
		this.scene.add(this.world);
		this.world.add(this.stadiumGroup, this.hitGroup, this.bundleGroup);
		// Groups with sprite labels live OUTSIDE the mirrored world (text would
		// render mirrored inside it); game X is negated when positioning instead.
		// env/overlay content is symmetric so mirroring is moot.
		this.scene.add(this.fielderGroup, this.envGroup, this.overlayGroup);

		const initial = this.presetPose(this.preset === 'chase' ? 'broadcast' : this.preset);
		if (options.introFlyIn) {
			this.camera.position.set(0, 130, 230);
			this.controls.target.set(0, 0, 40);
			this.startTween(initial.pos, initial.target, 2200);
		} else {
			this.camera.position.copy(initial.pos);
			this.controls.target.copy(initial.target);
		}
		if (this.preset === 'chase') this.controls.enabled = false;
		this.controls.update();

		if (this.look.bloom) this.enableBloom();

		this.resizeObserver = new ResizeObserver(() => this.resize());
		this.resizeObserver.observe(container);
		this.resize();

		const animate = () => {
			this.raf = requestAnimationFrame(animate);
			this.tick();
		};
		animate();
	}

	// --- public option surface -----------------------------------------------

	setLook(patch: Partial<VisualizerLook>) {
		const prev = this.look;
		this.look = { ...prev, ...patch };
		if (this.look.bloom !== prev.bloom) {
			if (this.look.bloom) this.enableBloom();
			else this.disableBloom();
		}
		this.fielderGroup.visible = this.look.fielderMarkers;
		if (this.apexLine) this.apexLine.visible = this.look.apexMarker;
		for (const ball of this.animatedBalls) ball.trail.visible = this.look.trail;
		if (this.look.distanceRings !== prev.distanceRings) this.buildDistanceRings();
		if (
			this.theme &&
			(this.look.skyDome !== prev.skyDome || this.look.ground !== prev.ground)
		) {
			this.buildEnvironment(this.theme);
		}
	}

	getLook(): VisualizerLook {
		return { ...this.look };
	}

	setCameraPreset(name: CameraPresetName, animate = true) {
		this.preset = name;
		this.tween = null;
		if (name === 'chase') {
			this.controls.enabled = false;
			this.chasePrevBall = null;
			return;
		}
		const { pos, target } = this.presetPose(name);
		if (animate) {
			this.startTween(pos, target, 1200);
		} else {
			this.controls.enabled = true;
			this.camera.position.copy(pos);
			this.controls.target.copy(target);
			this.controls.update();
		}
	}

	/** 1 = realtime, 0.25 = slow-mo, etc. */
	setPlaybackSpeed(speed: number) {
		this.speed = speed;
	}

	setUnits(useFeet: boolean) {
		if (this.useFeet === useFeet) return;
		this.useFeet = useFeet;
		if (this.look.distanceRings) this.buildDistanceRings();
	}

	// --- camera --------------------------------------------------------------

	private presetPose(name: Exclude<CameraPresetName, 'chase'>): {
		pos: THREE.Vector3;
		target: THREE.Vector3;
	} {
		switch (name) {
			case 'catcher':
				return { pos: new THREE.Vector3(0, 4.5, -12), target: new THREE.Vector3(0, 3, 45) };
			case 'blimp':
				return { pos: new THREE.Vector3(0, 175, 30), target: new THREE.Vector3(0, 0, 42) };
			case 'landing': {
				const L = this.lastLanding;
				if (!L) return this.presetPose('broadcast');
				const out = L.clone().setY(0);
				const dir = out.lengthSq() > 1 ? out.clone().normalize() : new THREE.Vector3(0, 0, 1);
				return {
					pos: out.clone().addScaledVector(dir, 22).add(new THREE.Vector3(0, 13, 0)),
					target: out.clone().add(new THREE.Vector3(0, 3, 0))
				};
			}
			case 'broadcast':
			default:
				return { pos: new THREE.Vector3(0, 55, -70), target: new THREE.Vector3(0, 0, 40) };
		}
	}

	private startTween(toPos: THREE.Vector3, toTarget: THREE.Vector3, duration: number) {
		this.controls.enabled = false;
		this.tween = {
			fromPos: this.camera.position.clone(),
			toPos: toPos.clone(),
			fromTarget: this.controls.target.clone(),
			toTarget: toTarget.clone(),
			start: performance.now(),
			duration
		};
	}

	private updateCamera(now: number, dt: number) {
		if (this.tween) {
			const t = Math.min((now - this.tween.start) / this.tween.duration, 1);
			const e = easeInOutCubic(t);
			this.camera.position.lerpVectors(this.tween.fromPos, this.tween.toPos, e);
			this.controls.target.lerpVectors(this.tween.fromTarget, this.tween.toTarget, e);
			if (t >= 1) {
				this.tween = null;
				if (this.preset !== 'chase') this.controls.enabled = true;
			}
		} else if (this.preset === 'chase' && this.animatedBalls.length > 0) {
			const ball = new THREE.Vector3();
			this.animatedBalls[0].mesh.getWorldPosition(ball);
			const vel = this.chasePrevBall ? ball.clone().sub(this.chasePrevBall) : null;
			this.chasePrevBall = ball.clone();
			let dir: THREE.Vector3;
			if (vel && vel.setY(0).lengthSq() > 1e-6) {
				dir = vel.normalize();
			} else {
				const flat = ball.clone().setY(0);
				dir = flat.lengthSq() > 1 ? flat.normalize() : new THREE.Vector3(0, 0, 1);
			}
			const desired = ball
				.clone()
				.addScaledVector(dir, -11)
				.add(new THREE.Vector3(0, 5.5, 0));
			desired.y = Math.max(desired.y, 2.5);
			this.camera.position.lerp(desired, 1 - Math.exp(-dt * 3.5));
			this.controls.target.lerp(ball, 1 - Math.exp(-dt * 6));
		}
		this.controls.update();
		// Last-resort floor clamp (damping can briefly overshoot the polar limit).
		if (this.camera.position.y < 1.2) this.camera.position.y = 1.2;
	}

	// --- render loop ---------------------------------------------------------

	private tick() {
		const now = performance.now();
		const dt = Math.min((now - this.lastNow) / 1000, 0.1);
		this.lastNow = now;
		this.virtualMs += dt * 1000 * this.speed;
		const frame = Math.floor((this.virtualMs * 60) / 1000);

		for (const ball of this.animatedBalls) {
			const idx = frame % ball.points.length;
			const p = ball.points[idx];
			ball.mesh.position.set(p[0], p[1], p[2]);
			if (this.look.trail) this.updateTrail(ball, idx);
			// Wrapped past the end of the path: the ball just "landed".
			if (idx < ball.lastIdx && this.look.impact && ball.points.length > 5) {
				this.spawnImpact(ball.points[ball.points.length - 1], ball.color, now);
			}
			ball.lastIdx = idx;
		}
		this.updateImpacts(now);

		const pulse = 0.82 + 0.18 * Math.sin(now / 280);
		for (const mat of this.pulsingMaterials) {
			mat.color.copy(mat.userData.baseColor as THREE.Color).multiplyScalar(pulse);
		}

		this.updateCamera(now, dt);

		if (this.look.bloom && this.composer) this.composer.render();
		else this.renderer.render(this.scene, this.camera);
	}

	private resize() {
		const w = this.container.clientWidth;
		const h = this.container.clientHeight;
		if (w === 0 || h === 0) return;
		this.camera.aspect = w / h;
		this.camera.updateProjectionMatrix();
		this.renderer.setSize(w, h);
		this.composer?.setSize(w, h);
	}

	// --- bloom ---------------------------------------------------------------

	private enableBloom() {
		this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
		if (!this.composer) {
			const size = new THREE.Vector2();
			this.renderer.getSize(size);
			this.composer = new EffectComposer(this.renderer);
			this.composer.addPass(new RenderPass(this.scene, this.camera));
			this.bloomPass = new UnrealBloomPass(size, 0.45, 0.5, 0.7);
			this.composer.addPass(this.bloomPass);
			this.composer.addPass(new OutputPass());
		}
	}

	private disableBloom() {
		this.renderer.toneMapping = THREE.NoToneMapping;
	}

	// --- environment (sky dome + ground) -------------------------------------

	applyEnvironment(theme: StadiumTheme3D) {
		this.theme = theme;
		// CSS gradient stays as the backdrop when the sky dome is off.
		this.container.style.background = `linear-gradient(${theme.skyTop}, ${theme.skyBottom})`;
		this.scene.fog = new THREE.FogExp2(new THREE.Color(theme.fog), theme.fogDensity);
		this.hemiLight.color.set(theme.hemi.sky);
		this.hemiLight.groundColor.set(theme.hemi.ground);
		this.hemiLight.intensity = theme.hemi.intensity;
		this.sunLight.color.set(theme.sun.color);
		this.sunLight.intensity = theme.sun.intensity;
		this.sunLight.position.set(...theme.sun.position);
		this.buildEnvironment(theme);
	}

	private buildEnvironment(theme: StadiumTheme3D) {
		this.disposeGroup(this.envGroup);

		if (this.look.skyDome) {
			const skyMat = new THREE.ShaderMaterial({
				uniforms: {
					top: { value: new THREE.Color(theme.skyTop) },
					bottom: { value: new THREE.Color(theme.skyBottom) }
				},
				vertexShader: `
					varying float vY;
					void main() {
						vY = (modelMatrix * vec4(position, 1.0)).y;
						gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
					}`,
				fragmentShader: `
					uniform vec3 top;
					uniform vec3 bottom;
					varying float vY;
					void main() {
						float h = clamp(vY / 240.0, 0.0, 1.0);
						gl_FragColor = vec4(mix(bottom, top, pow(h, 0.75)), 1.0);
					}`,
				side: THREE.BackSide,
				depthWrite: false,
				fog: false
			});
			const sky = new THREE.Mesh(new THREE.SphereGeometry(SKY_RADIUS, 24, 16), skyMat);
			sky.renderOrder = -10;
			this.envGroup.add(sky);

			if (theme.night) {
				const starPos: number[] = [];
				for (let i = 0; i < 350; i++) {
					// Random points on the upper dome, kept above the horizon haze.
					const az = Math.random() * Math.PI * 2;
					const alt = Math.asin(0.12 + Math.random() * 0.88);
					const r = SKY_RADIUS * 0.97;
					starPos.push(
						r * Math.cos(alt) * Math.cos(az),
						r * Math.sin(alt),
						r * Math.cos(alt) * Math.sin(az)
					);
				}
				const starGeo = new THREE.BufferGeometry();
				starGeo.setAttribute('position', new THREE.Float32BufferAttribute(starPos, 3));
				const stars = new THREE.Points(
					starGeo,
					new THREE.PointsMaterial({
						color: 0xffffff,
						size: 1.6,
						sizeAttenuation: false,
						transparent: true,
						opacity: 0.8,
						depthWrite: false,
						fog: false
					})
				);
				stars.renderOrder = -9;
				this.envGroup.add(stars);
			}
		}

		if (this.look.ground) {
			const ground = new THREE.Mesh(
				new THREE.CircleGeometry(GROUND_RADIUS, 64),
				new THREE.MeshLambertMaterial({
					color: theme.ground ?? '#55645a',
					side: THREE.DoubleSide
				})
			);
			ground.rotation.x = -Math.PI / 2;
			ground.position.y = -0.06;
			this.envGroup.add(ground);
		}
	}

	// --- stadium -------------------------------------------------------------

	buildStadium(stadiumJson: any, theme: StadiumTheme3D) {
		this.disposeGroup(this.stadiumGroup);
		this.pulsingMaterials = [];
		this.applyEnvironment(theme);

		const positions: number[] = [];
		const colors: number[] = [];
		const emissivePositions: Record<string, number[]> = {};

		const streamColor = (t: number) => {
			const key = COLLISION_TYPE_KEYS[t & 0x0f];
			const hex = theme.palette[key] || '#ff00ff';
			const c = new THREE.Color(hex);
			if ((t & 0xf0) === 0x80) c.multiplyScalar(theme.foulMult);
			return [c.r, c.g, c.b];
		};

		const pushTri = (pa: any, pb: any, pc: any, collisionType: number) => {
			// stadium data is y-down; flip to y-up
			const tri = [pa, pb, pc].map((p) => [p.X, -p.Y, p.Z]);
			const key = COLLISION_TYPE_KEYS[collisionType & 0x0f];
			const glow = theme.emissive[key];
			if (glow) {
				(emissivePositions[glow] ||= []).push(...tri[0], ...tri[1], ...tri[2]);
				return;
			}
			const c = streamColor(collisionType);
			for (const v of tri) {
				positions.push(...v);
				colors.push(...c);
			}
		};

		for (const box of stadiumJson['Triangle Collections']) {
			for (const coll of box['Triangles']) {
				const pts = coll['Points'];
				if (coll['CollectionType'] === 0) {
					for (let i = 0; i + 2 < pts.length; i += 3) {
						pushTri(pts[i].Point, pts[i + 1].Point, pts[i + 2].Point, pts[i + 2].CollisionType);
					}
				} else {
					for (let i = 0; i + 2 < pts.length; i++) {
						pushTri(pts[i].Point, pts[i + 1].Point, pts[i + 2].Point, pts[i + 2].CollisionType);
					}
				}
			}
		}

		const geo = new THREE.BufferGeometry();
		geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
		geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
		geo.computeVertexNormals();
		this.stadiumGroup.add(
			new THREE.Mesh(
				geo,
				new THREE.MeshLambertMaterial({ vertexColors: true, side: THREE.DoubleSide })
			)
		);

		for (const [hex, pos] of Object.entries(emissivePositions)) {
			const eg = new THREE.BufferGeometry();
			eg.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
			const mat = new THREE.MeshBasicMaterial({ color: hex, side: THREE.DoubleSide });
			mat.userData.baseColor = new THREE.Color(hex);
			this.pulsingMaterials.push(mat);
			this.stadiumGroup.add(new THREE.Mesh(eg, mat));
		}

		for (const d of theme.decals ?? []) {
			const mat =
				d.color === 'rainbow'
					? new THREE.MeshBasicMaterial({ map: makeRainbowTexture(), side: THREE.DoubleSide })
					: new THREE.MeshBasicMaterial({ color: d.color, side: THREE.DoubleSide });
			if (d.color === 'rainbow') mat.userData.ownsMap = true;
			const pad = new THREE.Mesh(new THREE.CircleGeometry(d.r, 48), mat);
			pad.rotation.x = -Math.PI / 2;
			pad.position.set(d.x, 0.06, d.z);
			this.stadiumGroup.add(pad);
		}

		this.buildDistanceRings();
	}

	// --- hit paths -----------------------------------------------------------

	buildHit(
		sim: SimulationOutput,
		theme: StadiumTheme3D,
		actualLanding: [number, number] | null,
		randomLandings: [number, number, number][]
	) {
		this.disposeGroup(this.hitGroup);
		this.animatedBalls = [];
		this.impacts = [];
		this.apexLine = null;
		this.lastLanding = null;

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

			// Comet trail: preallocated line strip, head at the ball, vertex colors
			// fading to black under additive blending.
			const trailPositions = new Float32Array(TRAIL_LEN * 3);
			const trailColors = new Float32Array(TRAIL_LEN * 3);
			const c = new THREE.Color(color);
			for (let i = 0; i < TRAIL_LEN; i++) {
				const f = Math.pow(1 - i / TRAIL_LEN, 1.5);
				trailColors[i * 3] = c.r * f;
				trailColors[i * 3 + 1] = c.g * f;
				trailColors[i * 3 + 2] = c.b * f;
			}
			const trailGeo = new THREE.BufferGeometry();
			trailGeo.setAttribute('position', new THREE.BufferAttribute(trailPositions, 3));
			trailGeo.setAttribute('color', new THREE.BufferAttribute(trailColors, 3));
			trailGeo.setDrawRange(0, 0);
			const trail = new THREE.Line(
				trailGeo,
				new THREE.LineBasicMaterial({
					vertexColors: true,
					transparent: true,
					blending: THREE.AdditiveBlending,
					depthWrite: false
				})
			);
			trail.frustumCulled = false;
			trail.visible = this.look.trail;
			this.hitGroup.add(trail);

			this.animatedBalls.push({
				mesh: ball,
				points: path.points,
				lastIdx: 0,
				color,
				trail,
				trailPositions
			});

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

		const main = sim.paths[0];
		if (main) {
			// Scene coords: the hit group lives in the X-mirrored world.
			this.lastLanding = new THREE.Vector3(-main.final[0], 0, main.final[2]);
			// If the user is on the landing cam, glide to the new landing spot.
			if (this.preset === 'landing') this.setCameraPreset('landing');

			// Apex drop-line for the main path.
			const [mx, my, mz] = main.maxHeightPoint;
			if (my > 2) {
				const apexGeo = new THREE.BufferGeometry().setFromPoints([
					new THREE.Vector3(mx, my, mz),
					new THREE.Vector3(mx, 0.05, mz)
				]);
				this.apexLine = new THREE.Line(
					apexGeo,
					new THREE.LineDashedMaterial({
						color: 0xffffff,
						transparent: true,
						opacity: 0.55,
						dashSize: 0.9,
						gapSize: 0.7
					})
				);
				this.apexLine.computeLineDistances();
				this.apexLine.visible = this.look.apexMarker;
				this.hitGroup.add(this.apexLine);
			}
		}

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

	private updateTrail(ball: AnimatedBall, idx: number) {
		const n = Math.min(idx + 1, TRAIL_LEN);
		for (let i = 0; i < n; i++) {
			const p = ball.points[idx - i];
			ball.trailPositions[i * 3] = p[0];
			ball.trailPositions[i * 3 + 1] = p[1];
			ball.trailPositions[i * 3 + 2] = p[2];
		}
		const geo = ball.trail.geometry;
		geo.setDrawRange(0, n);
		(geo.getAttribute('position') as THREE.BufferAttribute).needsUpdate = true;
	}

	// --- impact effects ------------------------------------------------------

	private spawnImpact(at: [number, number, number], color: number, now: number) {
		const [x, , z] = at;
		const ring = new THREE.Mesh(
			new THREE.RingGeometry(0.6, 0.85, 32),
			new THREE.MeshBasicMaterial({
				color,
				transparent: true,
				opacity: 0.9,
				side: THREE.DoubleSide,
				depthWrite: false
			})
		);
		ring.rotation.x = -Math.PI / 2;
		ring.position.set(x, 0.08, z);

		const count = 20;
		const pos = new Float32Array(count * 3);
		const vel = new Float32Array(count * 3);
		for (let i = 0; i < count; i++) {
			pos[i * 3] = x;
			pos[i * 3 + 1] = 0.3;
			pos[i * 3 + 2] = z;
			const az = Math.random() * Math.PI * 2;
			const sp = 1 + Math.random() * 3.5;
			vel[i * 3] = Math.cos(az) * sp;
			vel[i * 3 + 1] = 4 + Math.random() * 6;
			vel[i * 3 + 2] = Math.sin(az) * sp;
		}
		const geo = new THREE.BufferGeometry();
		geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
		const particles = new THREE.Points(
			geo,
			new THREE.PointsMaterial({
				color,
				size: 0.3,
				transparent: true,
				opacity: 1,
				depthWrite: false,
				blending: THREE.AdditiveBlending
			})
		);
		particles.frustumCulled = false;

		this.hitGroup.add(ring, particles);
		this.impacts.push({ ring, particles, velocities: vel, born: now });
	}

	private updateImpacts(now: number) {
		const RING_LIFE = 600;
		const PART_LIFE = 800;
		for (let i = this.impacts.length - 1; i >= 0; i--) {
			const fx = this.impacts[i];
			const age = now - fx.born;
			if (age > Math.max(RING_LIFE, PART_LIFE)) {
				this.hitGroup.remove(fx.ring, fx.particles);
				fx.ring.geometry.dispose();
				(fx.ring.material as THREE.Material).dispose();
				fx.particles.geometry.dispose();
				(fx.particles.material as THREE.Material).dispose();
				this.impacts.splice(i, 1);
				continue;
			}
			const rt = Math.min(age / RING_LIFE, 1);
			const s = 1 + 6 * rt;
			fx.ring.scale.set(s, s, 1);
			(fx.ring.material as THREE.MeshBasicMaterial).opacity = 0.9 * (1 - rt);

			const pt = Math.min(age / PART_LIFE, 1);
			const posAttr = fx.particles.geometry.getAttribute('position') as THREE.BufferAttribute;
			const dt = 1 / 60;
			for (let j = 0; j < posAttr.count; j++) {
				fx.velocities[j * 3 + 1] -= 20 * dt;
				posAttr.setXYZ(
					j,
					posAttr.getX(j) + fx.velocities[j * 3] * dt,
					Math.max(posAttr.getY(j) + fx.velocities[j * 3 + 1] * dt, 0.05),
					posAttr.getZ(j) + fx.velocities[j * 3 + 2] * dt
				);
			}
			posAttr.needsUpdate = true;
			(fx.particles.material as THREE.PointsMaterial).opacity = 1 - pt;
		}
	}

	// --- trajectory bundles --------------------------------------------------

	// Many arcs at once, for comparing a whole population of contacts rather
	// than replaying one. buildHit() gives every path its own ball, comet trail
	// and landing ring, which is right for a single hit and ruinous for a
	// thousand — this packs the lot into one LineSegments and one Points object,
	// so the cost is two draw calls no matter how many contacts are shown.
	buildTrajectoryBundle(
		arcs: { points: [number, number, number][]; color: number }[],
		opts: { opacity?: number; landingMarkers?: boolean } = {}
	) {
		this.disposeGroup(this.bundleGroup);
		if (arcs.length === 0) return;

		let segments = 0;
		for (const arc of arcs) segments += Math.max(0, arc.points.length - 1);
		if (segments === 0) return;

		const positions = new Float32Array(segments * 6);
		const colors = new Float32Array(segments * 6);
		const landings = new Float32Array(arcs.length * 3);
		const landingColors = new Float32Array(arcs.length * 3);
		const scratch = new THREE.Color();

		let s = 0;
		arcs.forEach((arc, arcIndex) => {
			scratch.set(arc.color);
			for (let i = 0; i < arc.points.length - 1; i++) {
				const a = arc.points[i];
				const b = arc.points[i + 1];
				positions.set(a, s * 6);
				positions.set(b, s * 6 + 3);
				// Fade each arc toward its landing so overlapping paths still read
				// as individual flights rather than a solid mat of colour.
				const fade = 0.45 + 0.55 * (i / Math.max(1, arc.points.length - 2));
				colors[s * 6] = scratch.r * fade;
				colors[s * 6 + 1] = scratch.g * fade;
				colors[s * 6 + 2] = scratch.b * fade;
				colors[s * 6 + 3] = scratch.r * fade;
				colors[s * 6 + 4] = scratch.g * fade;
				colors[s * 6 + 5] = scratch.b * fade;
				s += 1;
			}
			const last = arc.points[arc.points.length - 1];
			landings.set(last, arcIndex * 3);
			landingColors[arcIndex * 3] = scratch.r;
			landingColors[arcIndex * 3 + 1] = scratch.g;
			landingColors[arcIndex * 3 + 2] = scratch.b;
		});

		const lineGeo = new THREE.BufferGeometry();
		lineGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
		lineGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
		this.bundleGroup.add(
			new THREE.LineSegments(
				lineGeo,
				new THREE.LineBasicMaterial({
					vertexColors: true,
					transparent: true,
					opacity: opts.opacity ?? 0.55,
					depthWrite: false,
					blending: THREE.AdditiveBlending
				})
			)
		);

		if (opts.landingMarkers !== false) {
			const pointGeo = new THREE.BufferGeometry();
			pointGeo.setAttribute('position', new THREE.BufferAttribute(landings, 3));
			pointGeo.setAttribute('color', new THREE.BufferAttribute(landingColors, 3));
			this.bundleGroup.add(
				new THREE.Points(
					pointGeo,
					new THREE.PointsMaterial({
						size: 1.1,
						vertexColors: true,
						transparent: true,
						opacity: 0.9,
						depthWrite: false,
						sizeAttenuation: true
					})
				)
			);
		}
	}

	clearTrajectoryBundle() {
		this.disposeGroup(this.bundleGroup);
	}

	// --- overlays ------------------------------------------------------------

	// Concentric distance rings from home plate, labeled in the current units.
	private buildDistanceRings() {
		this.disposeGroup(this.overlayGroup);
		if (!this.look.distanceRings) return;
		const rings = this.useFeet
			? [100, 200, 300].map((ft) => ({ r: ft / METERS_TO_FEET, label: `${ft} ft` }))
			: [30, 60, 90].map((m) => ({ r: m, label: `${m} m` }));
		for (const { r, label } of rings) {
			const pts: THREE.Vector3[] = [];
			for (let i = 0; i <= 96; i++) {
				const a = (i / 96) * Math.PI * 2;
				pts.push(new THREE.Vector3(Math.cos(a) * r, 0.1, Math.sin(a) * r));
			}
			const line = new THREE.Line(
				new THREE.BufferGeometry().setFromPoints(pts),
				new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.22 })
			);
			this.overlayGroup.add(line);

			const sprite = makeLabelSprite(label, 1.8);
			sprite.material.opacity = 0.55;
			sprite.position.set(0, 0.8, r + 2);
			this.overlayGroup.add(sprite);
		}
	}

	// Markers at the nine default fielder starting spots (source: pyRio).
	buildFielderMarkers() {
		this.disposeGroup(this.fielderGroup);
		for (const [label, [gx, gy, gz]] of Object.entries(FIELDER_STARTING_POSITIONS)) {
			const x = -gx; // mirror to match the flipped world group
			const ring = new THREE.Mesh(
				new THREE.RingGeometry(1.1, 1.6, 28),
				new THREE.MeshBasicMaterial({
					color: 0xffffff,
					transparent: true,
					opacity: 0.55,
					side: THREE.DoubleSide,
					depthWrite: false
				})
			);
			ring.rotation.x = -Math.PI / 2;
			ring.position.set(x, gy + 0.12, gz);
			this.fielderGroup.add(ring);

			const sprite = makeLabelSprite(label, 2.3);
			sprite.position.set(x, gy + 2.2, gz);
			this.fielderGroup.add(sprite);
		}
		this.fielderGroup.visible = this.look.fielderMarkers;
	}

	// --- teardown ------------------------------------------------------------

	private disposeGroup(group: THREE.Group) {
		group.traverse((obj: any) => {
			if (obj.geometry) obj.geometry.dispose();
			if (obj.material) {
				const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
				for (const m of mats) {
					// Only textures the material owns; the ball-glow texture is shared.
					if (m.userData?.ownsMap && m.map) m.map.dispose();
					m.dispose();
				}
			}
		});
		group.clear();
	}

	dispose() {
		cancelAnimationFrame(this.raf);
		this.resizeObserver.disconnect();
		this.disposeGroup(this.hitGroup);
		this.disposeGroup(this.bundleGroup);
		this.disposeGroup(this.stadiumGroup);
		this.disposeGroup(this.fielderGroup);
		this.disposeGroup(this.envGroup);
		this.disposeGroup(this.overlayGroup);
		this.glowTexture.dispose();
		this.bloomPass?.dispose();
		this.composer?.dispose();
		this.controls.dispose();
		this.renderer.dispose();
		this.renderer.domElement.remove();
	}
}
