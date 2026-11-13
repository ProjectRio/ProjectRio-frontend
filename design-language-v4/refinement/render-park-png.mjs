/*
 * Renders a park's field art, public/images/parks/<park>.svg, to a PNG beside it.
 *
 *   node design-language-v4/refinement/render-park-png.mjs mario
 *
 * Why the PNG exists: draw-fields.py builds each surface (underlay, grass,
 * dirt, ...) as one path of hundreds of abutting triangles. A browser
 * anti-aliases every triangle edge on its own, so two triangles that meet
 * each cover their shared pixels only partly and the dark underlay shows
 * through as a hairline. The thin same-paint stroke on each path hides most
 * of that, but not all of it once the park is tilted in 3D and the page is
 * zoomed out. A raster drawn once, here, has no edges left for the browser to
 * anti-alias.
 *
 * How: the triangle layers are drawn with anti-aliasing off, so every pixel
 * belongs wholly to one triangle or its neighbour and nothing shows between
 * them. That is done at several times the final size and scaled down, which
 * gives the park's outline and the pattern edges their smoothing back. The
 * line work (foul lines, bases, wall rim, motifs) keeps normal anti-aliasing.
 *
 * The PNG covers exactly the SVG's viewBox, so anything positioned over the
 * SVG in field metres sits in the same place over the PNG.
 */
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

/* Final pixels per metre, and how many times larger the first render is. */
const PX_PER_UNIT = 16;
const SUPERSAMPLE = 4;

const park = process.argv[2];
if (!park || !/^[a-z0-9-]+$/.test(park)) {
	console.error('usage: node render-park-png.mjs <park>   (for example: mario)');
	process.exit(1);
}

const parks = new URL('../../public/images/parks/', import.meta.url);
const source = await readFile(new URL(`${park}.svg`, parks), 'utf8');

const viewBox = source.match(/<svg[^>]*\bviewBox="([^"]+)"/)?.[1].trim().split(/[\s,]+/).map(Number);
if (!viewBox || viewBox.length !== 4 || viewBox.some(Number.isNaN)) throw new Error(`${park}.svg has no usable viewBox`);
const width = Math.round(viewBox[2] * PX_PER_UNIT);
const height = Math.round(viewBox[3] * PX_PER_UNIT);

/* A triangle layer is a path filled and stroked with the same paint. */
const MESH = /<path d="[^"]*" fill="([^"]+)" stroke="\1"/g;
const meshes = source.match(MESH)?.length ?? 0;
if (!meshes) throw new Error(`${park}.svg has no triangle layers; has draw-fields.py changed its output?`);

const svg = source
	.replace(MESH, (path) => `${path} shape-rendering="crispEdges"`)
	// The SVG carries no size of its own; this sets how large librsvg draws it.
	.replace('<svg ', `<svg width="${width * SUPERSAMPLE}" height="${height * SUPERSAMPLE}" `);

const large = await sharp(Buffer.from(svg), { limitInputPixels: false }).png({ compressionLevel: 1 }).toBuffer();
const target = fileURLToPath(new URL(`${park}.png`, parks));
const info = await sharp(large, { limitInputPixels: false })
	.resize(width, height, { kernel: 'lanczos3', fit: 'fill' })
	.png({ compressionLevel: 9 })
	.toFile(target);

console.log(`${park}.png  ${info.width} x ${info.height}  ${(info.size / 1024).toFixed(0)} KB  (${meshes} triangle layers)`);
