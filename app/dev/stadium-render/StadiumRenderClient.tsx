'use client';

// Renders a stadium from the shared scene (components/visualizer/stadiumScene)
// with the fixed draft-room camera, then publishes the result in the DOM for
// scripts/render-stadiums.mjs to collect:
//
//   <pre id="rio-render">{ id, width, height, matrix, scene, glow }</pre>
//
// `scene` is the finished park (webp). `glow` is only the light-emitting parts
// on a transparent background (png); the draft room pulses it over the scene.
// `matrix` maps stadium coordinates (x, 0, z) to clip space so fielders can be
// placed on the image.
//
// Query: id=0..6  w=1400 h=1050  live=1 (keep animating on screen, no output)
//        cx cy cz tx ty tz fov (camera overrides while tuning)  shadows=0 (compare)

import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { applyEnvironment, buildStadium, fetchStadium, makeSkyTexture, pulseGlow, RENDER_CAMERA, setupSunShadows } from '@/components/visualizer/stadiumScene';
import { getRenderTheme } from '@/components/visualizer/stadiumThemes';

function num(params: URLSearchParams, key: string, fallback: number) {
	const value = Number(params.get(key));
	return params.has(key) && Number.isFinite(value) ? value : fallback;
}

export default function StadiumRenderClient() {
	const host = useRef<HTMLDivElement>(null);
	const [output, setOutput] = useState<string | null>(null);
	const [status, setStatus] = useState('rendering…');

	useEffect(() => {
		const params = new URLSearchParams(window.location.search);
		const id = num(params, 'id', 0);
		const width = num(params, 'w', RENDER_CAMERA.width);
		const height = num(params, 'h', RENDER_CAMERA.height);
		const live = params.get('live') === '1';
		const shadows = params.get('shadows') !== '0';
		const theme = getRenderTheme(id);
		const [px, py, pz] = RENDER_CAMERA.position;
		const [tx, ty, tz] = RENDER_CAMERA.target;
		const position = new THREE.Vector3(num(params, 'cx', px), num(params, 'cy', py), num(params, 'cz', pz));
		const target = new THREE.Vector3(num(params, 'tx', tx), num(params, 'ty', ty), num(params, 'tz', tz));
		const fov = num(params, 'fov', RENDER_CAMERA.fov);

		const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
		renderer.setPixelRatio(1);
		renderer.setSize(width, height, false);
		renderer.toneMapping = THREE.ACESFilmicToneMapping;
		renderer.toneMappingExposure = theme.exposure ?? 1;
		renderer.shadowMap.enabled = shadows;
		renderer.shadowMap.type = THREE.PCFSoftShadowMap;
		const element = renderer.domElement;
		element.style.width = '100%';
		element.style.height = 'auto';
		host.current?.appendChild(element);

		const scene = new THREE.Scene();
		const camera = new THREE.PerspectiveCamera(fov, width / height, 1, 4000);
		camera.position.copy(position);
		camera.lookAt(target);
		camera.updateMatrixWorld();

		const hemi = new THREE.HemisphereLight(0xffffff, 0x404040, 1);
		const sun = new THREE.DirectionalLight(0xffffff, 1);
		setupSunShadows(sun, 4096);
		sun.castShadow = shadows;
		scene.add(hemi, sun, sun.target);
		applyEnvironment(scene, hemi, sun, theme);
		scene.background = makeSkyTexture(theme);

		// Same mirrored world as the visualizer (first base on the right).
		const world = new THREE.Group();
		world.scale.x = -1;
		scene.add(world);

		const composer = new EffectComposer(renderer);
		composer.setSize(width, height);
		composer.addPass(new RenderPass(scene, camera));
		const bloom = new UnrealBloomPass(new THREE.Vector2(width, height), 0.42, 0.55, 0.86);
		composer.addPass(bloom);
		composer.addPass(new OutputPass());

		let raf = 0;
		let cancelled = false;

		fetchStadium(id)
			.then((json) => {
				if (cancelled) return;
				const built = buildStadium(json, theme, { shadows });
				world.add(built.group);
				world.updateMatrixWorld(true);

				if (live) {
					const animate = () => {
						raf = requestAnimationFrame(animate);
						pulseGlow(built.pulsing, performance.now());
						composer.render();
					};
					animate();
					setStatus(`${theme.label} · live`);
					return;
				}

				// Base pass: the finished park.
				pulseGlow(built.pulsing, 0, 0);
				composer.render();
				const sceneUrl = element.toDataURL('image/webp', 0.92);

				// Glow pass: only what emits light, on a transparent background.
				built.base.visible = false;
				scene.background = null;
				for (const child of built.group.children) child.visible = built.glow.includes(child);
				renderer.setClearColor(0x000000, 0);
				renderer.render(scene, camera);
				const glowUrl = element.toDataURL('image/png');

				const matrix = new THREE.Matrix4().multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse).multiply(world.matrixWorld);
				setOutput(JSON.stringify({ id, width, height, matrix: matrix.elements, scene: sceneUrl, glow: glowUrl }));
				setStatus(`${theme.label} · ready`);
				document.title = 'rio-render-ready';
			})
			.catch((error: Error) => setStatus(`failed: ${error.message}`));

		return () => {
			cancelled = true;
			cancelAnimationFrame(raf);
			composer.dispose();
			renderer.dispose();
			element.remove();
		};
	}, []);

	return (
		<div className="min-h-screen bg-black p-2 text-xs text-white">
			<p className="mb-2 font-mono">{status}</p>
			<div ref={host} className="max-w-[1400px]" />
			{output && (
				<pre id="rio-render" hidden>
					{output}
				</pre>
			)}
		</div>
	);
}
