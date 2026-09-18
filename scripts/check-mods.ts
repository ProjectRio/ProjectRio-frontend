/**
 * Regression check for the mod editor: resolves every catalog table and asserts the cell addresses
 * against formulas and addresses that were verified against the game by the original
 * gecko-code-generator. Run after `npm run sync-mods` or after editing the catalog:
 *
 *   npm run check-mods
 */
import { getAllTables } from '../lib/mods/resolve';
import { geckoLine } from '../lib/mods/gecko';
import type { ResolvedTable } from '../lib/mods/types';

const failures: string[] = [];
let checked = 0;

function expect(condition: boolean, message: string) {
	checked++;
	if (!condition) failures.push(message);
}

function hex(n: number) {
	return `0x${n.toString(16).toUpperCase()}`;
}

/** Address of the cell at a displayed multi-index. */
function cellAt(table: ResolvedTable, index: number[]) {
	let flat = 0;
	let stride = 1;
	for (let k = table.shape.length - 1; k >= 0; k--) {
		flat += index[k] * stride;
		stride *= table.shape[k];
	}
	return table.cells[flat];
}

function forEachIndex(shape: number[], fn: (index: number[]) => void) {
	const total = shape.reduce((a, b) => a * b, 1);
	for (let n = 0; n < total; n++) {
		const index: number[] = [];
		let rest = n;
		for (let k = shape.length - 1; k >= 0; k--) {
			index.unshift(rest % shape[k]);
			rest = Math.floor(rest / shape[k]);
		}
		fn(index);
	}
}

/** Assert every cell of a table against an address formula over its displayed multi-index. */
function checkTable(id: string, shape: number[], formula: (index: number[]) => number) {
	const table = tables.find((t) => t.id === id);
	expect(Boolean(table), `${id}: table missing`);
	if (!table) return;
	expect(JSON.stringify(table.shape) === JSON.stringify(shape), `${id}: shape ${table.shape.join('×')} expected ${shape.join('×')}`);
	if (JSON.stringify(table.shape) !== JSON.stringify(shape)) return;
	forEachIndex(shape, (index) => {
		const cell = cellAt(table, index);
		const want = formula(index);
		if (cell.address !== want) failures.push(`${id}[${index.join('][')}]: ${hex(cell.address)} expected ${hex(want)}`);
		checked++;
	});
}

/** Assert the address of a constants-table entry found by label prefix. */
function checkConstant(id: string, labelPrefix: string, address: number, type?: string) {
	const table = tables.find((t) => t.id === id);
	const cell = table?.cells.find((c) => c.label.startsWith(labelPrefix));
	expect(Boolean(cell), `${id}: no constant labelled '${labelPrefix}…'`);
	if (!cell) return;
	expect(cell.address === address, `${id} '${labelPrefix}': ${hex(cell.address)} expected ${hex(address)}`);
	if (type) expect(cell.type === type, `${id} '${labelPrefix}': type ${cell.type} expected ${type}`);
}

const tables = getAllTables();

// --- Character tables (0x8034E9A0, 0xA0 bytes per character) -----------------
const STAT_OFFSETS: Record<string, number> = {
	'Curve Ball Speed': 0x0, 'Fast Ball Speed': 0x1, 'Cursed Ball': 0x2, Curve: 0x3, 'Curve Control': 0x4,
	'Fielding Abilities': 0x20, 'Fielding Arm': 0x26, 'Batting Stance': 0x27, 'Slap Contact Size': 0x28,
	'Charge Contact Size': 0x29, 'Slap Power': 0x2a, 'Charge Power': 0x2b, Bunting: 0x2c,
	'Hit Trajectory (Push/Pull)': 0x2d, 'Hit Trajectory (High/Low)': 0x2e, Speed: 0x2f, 'Throwing Arm': 0x30,
	Class: 0x31, Weight: 0x32, Captain: 0x33, 'Captain Star Skill': 0x34, 'Star Swing': 0x35, 'Star Pitch': 0x36,
	'Batting Stat Bar': 0x37, 'Pitching Stat Bar': 0x38, 'Running Stat Bar': 0x39, 'Fielding Stat Bar': 0x3a
};
const stats = tables.find((t) => t.id === 'character-stats')!;
const statColumns = stats.axes[1].labels;
expect(statColumns.length === Object.keys(STAT_OFFSETS).length, `character-stats: ${statColumns.length} columns expected ${Object.keys(STAT_OFFSETS).length}`);
checkTable('character-stats', [54, statColumns.length], ([i, j]) => 0x8034e9a0 + 0xa0 * i + STAT_OFFSETS[statColumns[j]]);
const fielding = cellAt(stats, [1, statColumns.indexOf('Fielding Abilities')]);
expect(fielding.type === 'word' && fielding.display === 'flags', 'character-stats: Fielding Abilities should be a 32-bit flags word');
expect(fielding.default === 66 && fielding.options?.some((o) => o.value === 2 && /wall jump/i.test(o.label)) === true, 'character-stats: Luigi fielding flags / Wall Jump = 2');
checkTable('chemistry', [54, 54], ([i, j]) => 0x8034e9a0 + 0xa0 * i + 0x3b + j);

// --- Batting ---------------------------------------------------------------
checkTable('batter-reaches', [54, 9], ([i, j]) => 0x807b84f8 + 0x24 * i + 4 * j);
expect(cellAt(tables.find((t) => t.id === 'batter-reaches')!, [0, 8]).type === 'word', 'batter-reaches: Trimmed Bat is written as a word');
checkTable('exit-velocity', [2, 5, 3], ([h, c, k]) => 0x807b6d74 + 2 * (h * 15 + c * 3 + k));
checkTable('horizontal-angles', [3, 2, 15, 2], ([i, s, f, u]) => 0x807b6394 + 2 * (i * 60 + s * 30 + f * 2 + u));
checkTable('horizontal-power-multipliers', [3, 5], ([t, z]) => 0x807b70f8 + 4 * (t * 5 + z));
checkTable('curve-effects', [2, 3], ([c, k]) => 0x807b72bc + 4 * (c * 3 + k));
checkTable('vertical-angles', [2, 5, 5, 2], ([h, c, r, u]) => 0x807b67cc + 2 * (h * 50 + c * 10 + r * 2 + u));
checkTable('vertical-probabilities', [3, 2, 2, 5, 5], ([t, h, e, c, r]) => 0x807b6b00 + t * 100 + h * 50 + e * 25 + c * 5 + r);
checkTable('captain-star-vertical-angles', [12, 5, 2], ([s, r, u]) => 0x807b695c + 2 * (s * 10 + r * 2 + u));
checkTable('star-swing-vertical-angles', [3, 5, 2], ([s, r, u]) => 0x807b695c + 2 * ((s + 12) * 10 + r * 2 + u));

const BATTING: [string, number, string?][] = [
	['On overcharge', 0x807b733c, 'float'], ['Box movement speed modifier', 0x807b7340], ['Box movement speed modifier when', 0x807b7344],
	['Moonshot', 0x807b7348], ['Frame fully overcharged', 0x807b734c, 'short'], ['Frames holding A', 0x807b734e],
	['Frames paused on contact: regular', 0x807b7366], ['Frames paused on contact: captain', 0x807b7368], ['Frames paused on contact: moonshot', 0x807b736a],
	['Air resistance', 0x807b5c00, 'byte'], ['Gravity', 0x807b5bfc, 'float'], ['% of final hit power', 0x807b70f0], ['Global power adjustment', 0x807adb20],
	['Chemistry power boost 1', 0x807b5c20], ['Chemistry power boost 2', 0x807b5c24], ['Chemistry power boost 3', 0x807b5c28],
	['Maximum team stars', 0x807b76f4, 'byte'], ['Stars spent: captain star swing/pitch with the captain', 0x807b76f5],
	['Stars spent: captain star swing/pitch with a non-captain', 0x807b76f6], ['Stars spent: non-captain', 0x807b76f7],
	['Fire star hit', 0x807b7354], ['Peach star hit', 0x807b735e], ['Daisy star hit', 0x807b7360],
	['Banana star hit: direction', 0x807b7320], ['Banana star hit: % of hangtime when the curve starts', 0x807b7324], ['Banana star hit: % of hangtime when the curve ends', 0x807b7328],
	['Garlic / Eggplant star hit: frames', 0x807b735c], ['Garlic / Eggplant star hit: spread angle lower', 0x807b7334], ['Garlic / Eggplant star hit: spread angle upper', 0x807b7338],
	['Bullet star hit', 0x807b7330], ['Egg star hit: velocity', 0x807b732c], ['Egg star hit: number', 0x807b7358, 'short']
];
for (const [label, address, type] of BATTING) checkConstant('batting-constants', label, address, type);

// --- Pitching --------------------------------------------------------------
const PITCHING: [string, number, string?][] = [
	['Pitcher movement speed', 0x807b5a7c, 'float'], ['Pitch speed scaler', 0x807b7590], ['Air resistance factor', 0x807b7594],
	['Charge windup', 0x807b9682, 'short'], ['Curve windup', 0x807b9684], ['Perfect pitch frame window', 0x807b7540], ['Perfect pitch speed scaler', 0x807b7530],
	['Slider speed', 0x807b752c], ['Cursed ball modifier', 0x807b7528], ['Curve control modifier', 0x807b751c], ['Curve modifier', 0x807b7510],
	['Tired pitcher curve reduction', 0x807b74e6], ['Tired pitcher speed reduction', 0x807b74e8], ['Tired pitcher curve control', 0x807b74ea], ['Tired pitcher cursed', 0x807b74ec],
	['Starting stamina', 0x807b74dc], ['Tired stamina threshold', 0x807b74e2],
	['Strike zone left', 0x807b7498], ['Strike zone right', 0x807b749c], ['Strike zone front', 0x807b74a0], ['Strike zone back', 0x807b74a4], ['Pitch peak height', 0x807b74a8],
	['Egg star pitch: bounce height', 0x807b755c], ['Egg star pitch: first bounce distance lower', 0x807b7560], ['Egg star pitch: first bounce distance upper', 0x807b7564],
	['Egg star pitch: first bounce side', 0x807b7568], ['Egg star pitch: second bounce distance lower', 0x807b756c], ['Egg star pitch: second bounce distance upper', 0x807b7570],
	['Egg star pitch: second bounce side', 0x807b7574], ['Egg star pitch: ending', 0x807b7578],
	['Egg star pitch: initial speed lower', 0x807b757c, 'short'], ['Egg star pitch: initial speed upper', 0x807b757e], ['Egg star pitch: parabolic constant lower', 0x807b7580], ['Egg star pitch: parabolic constant upper', 0x807b7582],
	['Bowser star pitch: loop duration lower', 0x807b7550, 'byte'], ['Bowser star pitch: loop duration upper', 0x807b7551], ['Bowser star pitch: loop starting frame lower', 0x807b7552], ['Bowser star pitch: loop starting frame upper', 0x807b7553],
	['Bowser Jr. star pitch: loop duration lower', 0x807b7554], ['Bowser Jr. star pitch: loop duration upper', 0x807b7555], ['Bowser Jr. star pitch: loop starting frame lower', 0x807b7556], ['Bowser Jr. star pitch: loop starting frame upper', 0x807b7557],
	['Peach star pitch: % of flight when the ball disappears', 0x807b75b0], ['Daisy star pitch: % of flight when the ball disappears', 0x807b75b4],
	['Peach star pitch: % of flight when the ball reappears', 0x807b75b8], ['Daisy star pitch: % of flight when the ball reappears', 0x807b75bc]
];
for (const [label, address, type] of PITCHING) checkConstant('pitching-constants', label, address, type);

// --- Fielding --------------------------------------------------------------
checkTable('fielder-hitboxes', [54, 8], ([i, j]) => 0x807b8fb4 + 0x10 * i + 2 * j);
checkTable('hitbox-scalers', [54, 1], ([i]) => 0x800e8300 + 8 * i);
checkTable('bobble-chances', [2, 4, 2, 3], ([m, c, h, t]) => 0x807b5d14 + m * 24 + c * 6 + h * 3 + t);
for (const [label, address] of [['Global hitbox scaler', 0x807ae638], ['Air / hard grounder radius minimum', 0x807b9314], ['Height minimum', 0x807b9316], ['Dive range minimum', 0x807b931c], ['Infield dive height minimum', 0x807b931e]] as const) {
	checkConstant('hitbox-constants', label, address);
}

// --- Gecko encoding, against lines the original generator produced ------------
expect(geckoLine(0x807b84fc, 'float', 0.55) === '047B84FC 3F0CCCCD', 'gecko float encoding');
expect(geckoLine(0x807b6d76, 'short', -110) === '027B6D76 0000FF92', 'gecko negative short encoding');
expect(geckoLine(0x8034e9a0, 'byte', 130) === '0034E9A0 00000082', 'gecko byte encoding');
expect(geckoLine(0x807b8518, 'word', 1) === '047B8518 00000001', 'gecko word encoding');

// --- Defaults sanity --------------------------------------------------------
for (const table of tables) {
	for (const cell of table.cells) {
		if (!Number.isFinite(cell.default)) failures.push(`${table.id} '${cell.label}': default is not a number`);
		if (cell.min !== undefined && cell.max !== undefined && (cell.default < cell.min || cell.default > cell.max)) {
			failures.push(`${table.id} '${cell.label}': default ${cell.default} outside ${cell.min}..${cell.max}`);
		}
		checked++;
	}
}

if (failures.length) {
	console.error(`${failures.length} check(s) failed:\n  ${failures.slice(0, 40).join('\n  ')}${failures.length > 40 ? `\n  … ${failures.length - 40} more` : ''}`);
	process.exit(1);
}
console.log(`All ${checked} checks passed across ${tables.length} tables (${tables.reduce((n, t) => n + t.cells.length, 0)} cells).`);
