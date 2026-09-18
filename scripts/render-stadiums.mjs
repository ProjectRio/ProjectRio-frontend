#!/usr/bin/env node
// Regenerates the draft room's pre-rendered stadium fields from the shared
// three.js scene, using headless Chrome against a running dev server:
//
//   npm run dev:plain            (in another terminal)
//   npm run render:stadiums      (all parks)
//   npm run render:stadiums -- 0 6   (just Mario Stadium and Toy Field)
//
// Writes public/stadiums/renders/{id}.webp (the park), {id}-glow.png (its
// light-emitting parts, pulsed over the top), and manifest.json (image size
// plus the projection matrix used to place fielders). Re-run it whenever
// components/visualizer/stadiumScene.ts or stadiumThemes.ts changes.
//
// Env: RENDER_BASE (default http://localhost:3000), CHROME (path to the binary).

import { spawn } from 'node:child_process';
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outDir = path.join(root, 'public', 'stadiums', 'renders');
const base = process.env.RENDER_BASE ?? 'http://localhost:3000';
const chrome =
	process.env.CHROME ??
	{
		darwin: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
		win32: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
		linux: 'google-chrome'
	}[process.platform];

const ids = process.argv.slice(2).length ? process.argv.slice(2).map(Number) : [0, 1, 2, 3, 4, 5, 6];

function unescapeHtml(text) {
	return text.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, '&');
}

/** Load the render page in headless Chrome and return the DOM dump. */
function dumpDom(url, width, height) {
	return new Promise(async (resolve, reject) => {
		const profile = await mkdtemp(path.join(tmpdir(), 'rio-render-'));
		const args = [
			'--headless=new',
			'--no-first-run',
			'--no-default-browser-check',
			'--hide-scrollbars',
			`--user-data-dir=${profile}`,
			`--window-size=${width + 40},${height + 80}`,
			'--virtual-time-budget=60000',
			'--dump-dom',
			url
		];
		const child = spawn(chrome, args, { stdio: ['ignore', 'pipe', 'pipe'] });
		let out = '';
		let settled = false;
		const finish = (error) => {
			if (settled) return;
			settled = true;
			// Chrome does not always exit after the dump; it has said all it will say.
			child.kill('SIGKILL');
			rm(profile, { recursive: true, force: true }).catch(() => {});
			if (error) reject(error);
			else resolve(out);
		};
		child.stdout.on('data', (chunk) => {
			out += chunk;
			if (out.includes('</html>')) finish();
		});
		child.stderr.on('data', () => {});
		child.on('error', finish);
		child.on('exit', () => finish(out.includes('</html>') ? undefined : new Error('Chrome exited before the page rendered')));
		setTimeout(() => finish(new Error('timed out waiting for the render')), 180_000);
	});
}

async function renderOne(id) {
	const url = `${base}/dev/stadium-render?id=${id}`;
	const html = await dumpDom(url, 1400, 1050);
	const match = html.match(/<pre id="rio-render"[^>]*>([\s\S]*?)<\/pre>/);
	if (!match) {
		const status = html.match(/<p class="[^"]*">([^<]*)<\/p>/)?.[1] ?? 'no status';
		throw new Error(`stadium ${id}: no render output (${status})`);
	}
	const result = JSON.parse(unescapeHtml(match[1]).trim());
	const decode = (dataUrl) => Buffer.from(dataUrl.slice(dataUrl.indexOf(',') + 1), 'base64');
	await writeFile(path.join(outDir, `${id}.webp`), decode(result.scene));
	await writeFile(path.join(outDir, `${id}-glow.png`), decode(result.glow));
	return { width: result.width, height: result.height, matrix: result.matrix, scene: `${id}.webp`, glow: `${id}-glow.png` };
}

await mkdir(outDir, { recursive: true });
const manifestPath = path.join(outDir, 'manifest.json');
let manifest = { version: 1, stadiums: {} };
try {
	manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
} catch {
	/* first run */
}

for (const id of ids) {
	const started = Date.now();
	process.stdout.write(`stadium ${id}… `);
	try {
		manifest.stadiums[id] = await renderOne(id);
		manifest.rendered_at = new Date().toISOString();
		await writeFile(manifestPath, JSON.stringify(manifest, null, '\t') + '\n');
		console.log(`done in ${((Date.now() - started) / 1000).toFixed(1)}s`);
	} catch (error) {
		console.log(`FAILED — ${error.message}`);
		process.exitCode = 1;
	}
}
