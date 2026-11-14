#!/usr/bin/env node
// Copies the Rio Visualizer's stadium stills into the draft room:
//
//   npm run sync:stadiums                      (finds ../RioVisualizer or ~/GitHub/RioVisualizer)
//   RIO_VISUALIZER=/path/to/RioVisualizer npm run sync:stadiums
//
// RioVisualizer's render_stadiums.py renders every park through its HitRenderer
// (so the stills carry the mound, bases, plate and foul lines) into
// web/renders/<stem>.webp, <stem>-glow.png and manifest.json keyed by stadium
// name. This rewrites them as public/stadiums/renders/{id}.webp, {id}-glow.png
// and a manifest keyed by stadium_id, which lib/draft/stadiumRender.ts reads.
// Both sides build the matrix the same way (projection × matrixWorldInverse ×
// world.matrixWorld with world.scale.x = -1), so it is copied unchanged.

import { access, copyFile, mkdir, readFile, writeFile } from 'node:fs/promises';
import { homedir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outDir = path.join(root, 'public', 'stadiums', 'renders');

// Matches lib/data/characters.ts `stadiums`.
const STADIUMS = ['Mario Stadium', 'Bowser Castle', 'Wario Palace', 'Yoshi Park', 'Peach Garden', 'DK Jungle', 'Toy Field'];

const exists = (file) => access(file).then(() => true, () => false);

async function findSource() {
	const candidates = [process.env.RIO_VISUALIZER, path.resolve(root, '..', 'RioVisualizer'), path.join(homedir(), 'GitHub', 'RioVisualizer')].filter(Boolean);
	for (const dir of candidates) {
		const renders = path.join(dir, 'web', 'renders');
		if (await exists(path.join(renders, 'manifest.json'))) return renders;
	}
	throw new Error(`no RioVisualizer renders found (tried ${candidates.join(', ')}) — set RIO_VISUALIZER or run render_stadiums.py there`);
}

const srcDir = await findSource();
const source = JSON.parse(await readFile(path.join(srcDir, 'manifest.json'), 'utf8'));
await mkdir(outDir, { recursive: true });

const stadiums = {};
for (const [id, name] of STADIUMS.entries()) {
	const entry = source.stadiums?.[name];
	if (!entry) throw new Error(`RioVisualizer manifest has no "${name}"`);
	if (!Array.isArray(entry.matrix) || entry.matrix.length !== 16) throw new Error(`"${name}" has no 4×4 matrix`);
	const scene = `${id}.webp`;
	const glow = `${id}-glow.png`;
	await copyFile(path.join(srcDir, entry.scene), path.join(outDir, scene));
	await copyFile(path.join(srcDir, entry.glow), path.join(outDir, glow));
	stadiums[id] = { width: entry.width, height: entry.height, matrix: entry.matrix, scene, glow };
	console.log(`${id} ${name} ← ${entry.scene}`);
}

await writeFile(path.join(outDir, 'manifest.json'), JSON.stringify({ version: source.version ?? 1, stadiums, rendered_at: source.rendered_at, synced_from: 'RioVisualizer web/renders' }, null, '\t') + '\n');
console.log(`wrote ${path.relative(root, outDir)}/manifest.json from ${srcDir}`);
