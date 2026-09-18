// The stadium scene, shared by the 3D hit visualizer and the pre-rendered
// draft-room field (scripts/render-stadiums.mjs). Builds lit geometry from the
// collision triangles in public/stadiums/N.json, colored by the stream-view
// theme, plus the pieces that make each park read as itself: a sky, a horizon,
// glowing surfaces, stadium lamps, and mowing stripes on the grass.
//
// Anything added here shows up in both places: the visualizer immediately, and
// the draft room the next time the renders are regenerated.

import * as THREE from 'three';
import { mergeGeometries, mergeVertices } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { COLLISION_TYPE_KEYS, type StadiumTheme3D } from './stadiumThemes';

// ---------------------------------------------------------------------------
// Stadium data
// ---------------------------------------------------------------------------

export interface StadiumPoint {
	CollisionType: number;
	Point: { X: number; Y: number; Z: number };
}
export interface StadiumJson {
	'Triangle Collections': { Triangles: { CollectionType: number; Points: StadiumPoint[] }[] }[];
}

const stadiumCache = new Map<number, Promise<StadiumJson>>();

export function fetchStadium(stadiumId: number): Promise<StadiumJson> {
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

/** Walk every triangle (strips are unrolled). Stadium data is y-down. */
export function forEachTriangle(json: StadiumJson, visit: (a: StadiumPoint, b: StadiumPoint, c: StadiumPoint, collisionType: number) => void) {
	for (const box of json['Triangle Collections']) {
		for (const coll of box.Triangles) {
			const pts = coll.Points;
			if (coll.CollectionType === 0) {
				for (let i = 0; i + 2 < pts.length; i += 3) visit(pts[i], pts[i + 1], pts[i + 2], pts[i + 2].CollisionType);
			} else {
				for (let i = 0; i + 2 < pts.length; i++) visit(pts[i], pts[i + 1], pts[i + 2], pts[i + 2].CollisionType);
			}
		}
	}
}

// ---------------------------------------------------------------------------
// Textures
// ---------------------------------------------------------------------------

export function makeGlowTexture(): THREE.CanvasTexture {
	const c = document.createElement('canvas');
	c.width = c.height = 128;
	const ctx = c.getContext('2d')!;
	const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
	g.addColorStop(0, 'rgba(255,255,255,1)');
	g.addColorStop(0.2, 'rgba(255,255,255,0.7)');
	g.addColorStop(0.5, 'rgba(255,255,255,0.18)');
	g.addColorStop(1, 'rgba(255,255,255,0)');
	ctx.fillStyle = g;
	ctx.fillRect(0, 0, 128, 128);
	return new THREE.CanvasTexture(c);
}

export function makeRainbowTexture(): THREE.CanvasTexture {
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

/** A vertical sky gradient (with stars for night themes), usable as scene.background. */
export function makeSkyTexture(theme: StadiumTheme3D): THREE.CanvasTexture {
	const c = document.createElement('canvas');
	c.width = 512;
	c.height = 512;
	const ctx = c.getContext('2d')!;
	const g = ctx.createLinearGradient(0, 0, 0, 512);
	g.addColorStop(0, theme.skyTop);
	g.addColorStop(1, theme.skyBottom);
	ctx.fillStyle = g;
	ctx.fillRect(0, 0, 512, 512);
	if (theme.stars) {
		let state = 12345;
		const random = () => (state = (state * 1664525 + 1013904223) >>> 0) / 4294967296;
		for (let i = 0; i < 420; i++) {
			const x = random() * 512;
			const y = random() * 300 * random();
			const r = 0.4 + random() * 1.1;
			ctx.globalAlpha = 0.25 + random() * 0.7;
			ctx.fillStyle = random() > 0.85 ? '#cfe0ff' : '#ffffff';
			ctx.beginPath();
			ctx.arc(x, y, r, 0, Math.PI * 2);
			ctx.fill();
		}
		ctx.globalAlpha = 1;
	}
	const texture = new THREE.CanvasTexture(c);
	texture.colorSpace = THREE.SRGBColorSpace;
	return texture;
}

// ---------------------------------------------------------------------------
// Scene pieces
// ---------------------------------------------------------------------------

export interface StadiumBuild {
	/** Everything, parented under the caller's world group. */
	group: THREE.Group;
	/** Lit ground and walls. */
	base: THREE.Mesh;
	/** Objects that emit light: lava, bonus pads, lamp glows. Hidden for the base pass of a layered render. */
	glow: THREE.Object3D[];
	/** Emissive materials to pulse each frame (userData.baseColor holds the rest color). */
	pulsing: THREE.MeshBasicMaterial[];
	lights: THREE.Light[];
}

/** Adds world-space mowing stripes to the grass (attribute `mow` = 1) of a standard material. */
function withMowStripes(material: THREE.MeshStandardMaterial, strength: number, cell: number) {
	material.onBeforeCompile = (shader) => {
		shader.uniforms.uMow = { value: strength };
		shader.uniforms.uCell = { value: cell };
		shader.vertexShader = shader.vertexShader
			.replace('#include <common>', '#include <common>\nattribute float mow;\nvarying float vMow;\nvarying vec3 vWorldPos;')
			.replace('#include <worldpos_vertex>', '#include <worldpos_vertex>\nvMow = mow;\nvWorldPos = (modelMatrix * vec4(transformed, 1.0)).xyz;');
		shader.fragmentShader = shader.fragmentShader
			.replace('#include <common>', '#include <common>\nuniform float uMow;\nuniform float uCell;\nvarying float vMow;\nvarying vec3 vWorldPos;')
			.replace(
				'#include <color_fragment>',
				`#include <color_fragment>
				{
					float bandX = step(0.5, fract(vWorldPos.x / uCell));
					float bandZ = step(0.5, fract(vWorldPos.z / uCell));
					float check = abs(bandX - bandZ);
					diffuseColor.rgb *= 1.0 + uMow * vMow * (check - 0.5) * 2.0;
				}`
			);
	};
	material.customProgramCacheKey = () => `mow-${strength}-${cell}`;
}

export function buildStadium(json: StadiumJson, theme: StadiumTheme3D, options: { shadows?: boolean } = {}): StadiumBuild {
	const group = new THREE.Group();
	const glow: THREE.Object3D[] = [];
	const pulsing: THREE.MeshBasicMaterial[] = [];
	const lights: THREE.Light[] = [];

	// Ground and walls are collected separately: the collision mesh is a soup of
	// triangles, and shading each one by its own normal makes every panel of the
	// floor visible. Ground faces all get a straight-up normal so a surface
	// reads as one continuous surface; walls share vertices so they shade smoothly.
	const ground = { positions: [] as number[], colors: [] as number[], mow: [] as number[] };
	const walls = { positions: [] as number[], colors: [] as number[], mow: [] as number[] };
	const emissivePositions: Record<string, number[]> = {};
	const edge1 = new THREE.Vector3();
	const edge2 = new THREE.Vector3();

	const surfaceColor = (t: number) => {
		const key = COLLISION_TYPE_KEYS[t & 0x0f];
		const c = new THREE.Color(theme.palette[key] || '#ff00ff');
		if ((t & 0xf0) === 0x80) c.multiplyScalar(theme.foulMult);
		return c;
	};

	forEachTriangle(json, (pa, pb, pc, collisionType) => {
		// y-down data → y-up scene
		const tri = [pa, pb, pc].map((p) => [p.Point.X, -p.Point.Y, p.Point.Z]);
		const key = COLLISION_TYPE_KEYS[collisionType & 0x0f];
		const emissive = theme.emissive[key];
		if (emissive) {
			(emissivePositions[emissive] ||= []).push(...tri[0], ...tri[1], ...tri[2]);
			return;
		}
		edge1.set(tri[1][0] - tri[0][0], tri[1][1] - tri[0][1], tri[1][2] - tri[0][2]);
		edge2.set(tri[2][0] - tri[0][0], tri[2][1] - tri[0][1], tri[2][2] - tri[0][2]);
		const normal = edge1.cross(edge2).normalize();
		const isGround = Math.abs(normal.y) > 0.5;
		const bucket = isGround ? ground : walls;
		// The collision soup winds triangles both ways. Make the ground face up and
		// the walls face the field, so the (double-sided) material shades them alike.
		const facesIn = isGround ? normal.y > 0 : normal.x * (0 - (tri[0][0] + tri[1][0] + tri[2][0]) / 3) + normal.z * (50 - (tri[0][2] + tri[1][2] + tri[2][2]) / 3) > 0;
		if (!facesIn) tri.reverse();
		const c = surfaceColor(collisionType);
		const isGrass = key === 'grass' || key === 'rough';
		for (const v of tri) {
			bucket.positions.push(...v);
			bucket.colors.push(c.r, c.g, c.b);
			bucket.mow.push(isGrass ? 1 : 0);
		}
	});

	const toGeometry = (bucket: typeof ground) => {
		const g = new THREE.BufferGeometry();
		g.setAttribute('position', new THREE.Float32BufferAttribute(bucket.positions, 3));
		g.setAttribute('color', new THREE.Float32BufferAttribute(bucket.colors, 3));
		g.setAttribute('mow', new THREE.Float32BufferAttribute(bucket.mow, 1));
		return g;
	};
	const groundGeo = toGeometry(ground);
	const up = new Float32Array(ground.positions.length);
	for (let i = 1; i < up.length; i += 3) up[i] = 1;
	groundGeo.setAttribute('normal', new THREE.BufferAttribute(up, 3));
	const wallGeo = mergeVertices(toGeometry(walls), 1e-3);
	wallGeo.computeVertexNormals();
	const geo = mergeGeometries([groundGeo, wallGeo.toNonIndexed()], false) ?? groundGeo;
	const baseMaterial = new THREE.MeshStandardMaterial({ vertexColors: true, side: THREE.DoubleSide, roughness: 0.92, metalness: 0 });
	if (theme.mow) withMowStripes(baseMaterial, theme.mow, theme.mowCell ?? 14);
	const base = new THREE.Mesh(geo, baseMaterial);
	base.castShadow = !!options.shadows;
	base.receiveShadow = !!options.shadows;
	group.add(base);

	// The ground beyond the collision data, so the park does not float in the sky.
	const horizon = new THREE.Mesh(new THREE.CircleGeometry(900, 64), new THREE.MeshStandardMaterial({ color: theme.horizon ?? theme.palette.oob, roughness: 1, metalness: 0 }));
	horizon.rotation.x = -Math.PI / 2;
	horizon.position.y = theme.horizonY ?? -0.6;
	horizon.receiveShadow = !!options.shadows;
	group.add(horizon);

	for (const [hex, pos] of Object.entries(emissivePositions)) {
		const eg = new THREE.BufferGeometry();
		eg.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
		const mat = new THREE.MeshBasicMaterial({ color: hex, side: THREE.DoubleSide, toneMapped: false });
		mat.userData.baseColor = new THREE.Color(hex);
		pulsing.push(mat);
		const mesh = new THREE.Mesh(eg, mat);
		group.add(mesh);
		glow.push(mesh);
	}

	for (const d of theme.decals ?? []) {
		const mat = d.color === 'rainbow' ? new THREE.MeshBasicMaterial({ map: makeRainbowTexture(), side: THREE.DoubleSide }) : new THREE.MeshBasicMaterial({ color: d.color, side: THREE.DoubleSide });
		const pad = new THREE.Mesh(new THREE.CircleGeometry(d.r, 48), mat);
		pad.rotation.x = -Math.PI / 2;
		pad.position.set(d.x, 0.06, d.z);
		group.add(pad);
	}

	// Lamps: a point light plus a soft glow sprite where the fixture sits.
	if (theme.lamps?.length) {
		const glowTexture = makeGlowTexture();
		for (const lamp of theme.lamps) {
			const light = new THREE.PointLight(lamp.color, lamp.intensity, lamp.distance ?? 0, lamp.decay ?? 2);
			light.position.set(lamp.x, lamp.y, lamp.z);
			if (options.shadows) {
				light.castShadow = true;
				light.shadow.mapSize.set(1024, 1024);
				light.shadow.bias = -0.002;
				light.shadow.normalBias = 0.4;
				light.shadow.camera.far = 400;
			}
			group.add(light);
			lights.push(light);
			if (lamp.glow !== 0) {
				const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTexture, color: lamp.color, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0.7 }));
				const size = lamp.glow ?? 14;
				sprite.scale.set(size, size, 1);
				sprite.position.copy(light.position);
				group.add(sprite);
				glow.push(sprite);
			}
		}
	}

	return { group, base, glow, pulsing, lights };
}

/** Point the scene's sky, fog, and key lights at a theme. */
export function applyEnvironment(scene: THREE.Scene, hemi: THREE.HemisphereLight, sun: THREE.DirectionalLight, theme: StadiumTheme3D) {
	scene.fog = new THREE.FogExp2(new THREE.Color(theme.fog), theme.fogDensity);
	hemi.color.set(theme.hemi.sky);
	hemi.groundColor.set(theme.hemi.ground);
	hemi.intensity = theme.hemi.intensity;
	sun.color.set(theme.sun.color);
	sun.intensity = theme.sun.intensity;
	// pushed out so the whole park sits inside the shadow frustum
	sun.position.set(...theme.sun.position).multiplyScalar(2);
}

/** Configure a directional light to throw shadows over the whole park. */
export function setupSunShadows(sun: THREE.DirectionalLight, mapSize = 2048) {
	sun.castShadow = true;
	sun.shadow.mapSize.set(mapSize, mapSize);
	Object.assign(sun.shadow.camera, { left: -190, right: 190, top: 190, bottom: -190, near: 10, far: 600 });
	sun.shadow.camera.updateProjectionMatrix(); // required after resizing the frustum
	sun.shadow.bias = -0.0004;
	sun.shadow.normalBias = 0.6;
	sun.target.position.set(0, 0, 50);
}

/** Advance the glow pulse (called once per frame). */
export function pulseGlow(pulsing: THREE.MeshBasicMaterial[], now: number, amount = 0.18) {
	const pulse = 1 - amount + amount * Math.sin(now / 280);
	for (const mat of pulsing) mat.color.copy(mat.userData.baseColor as THREE.Color).multiplyScalar(pulse);
}

// ---------------------------------------------------------------------------
// The draft-room render: one fixed camera for every park, behind home plate
// and up in the stands. Fielders are placed on the finished image with the
// same projection, so the camera is part of the manifest.
// ---------------------------------------------------------------------------

export const RENDER_CAMERA = {
	position: [0, 80, -100] as [number, number, number],
	target: [0, 0, 42] as [number, number, number],
	fov: 44,
	width: 1400,
	height: 1050
};
