'use client';

/* eslint-disable @next/next/no-img-element */

// The scorebook. One card per side: a row for each spot in the batting order,
// a column for each inning, and in every cell what that batter did — a diamond
// with the base path they travelled before the half ended, the scoring code,
// the out number, and a dot per run driven in. The whole game on one sheet.

import { characterName, characterImage } from '@/lib/data/characters';
import { atBatResultName } from '@/lib/mssb/constants';
import type { GameEvent } from '@/lib/mssb/BattingSimulation/eventToSim';
import { groupAtBats, hasBallFlight, type AtBat } from '@/lib/gameEvents';

export interface Plate {
	atBat: AtBat;
	/** Index among all the game's at-bats, for selection. */
	index: number;
	code: string;
	/** Furthest base reached before the half ended: 0 none … 4 scored. */
	reach: number;
	/** Put out on the bases after reaching. */
	outOnBases: boolean;
	/** Which out of the inning this batter made, if they made one. */
	outNumber: number | null;
	rbi: number;
	starSwing: boolean;
}

const RESULT = {
	strikeout: 0x1,
	walk: 0x2,
	hbp: 0x3,
	out: 0x4,
	caught: 0x5,
	liner: 0x6,
	single: 0x7,
	double: 0x8,
	triple: 0x9,
	homer: 0xa,
	errorInput: 0xb,
	errorChem: 0xc,
	bunt: 0xd,
	sacFly: 0xe,
	doublePlay: 0xf,
	foulCatch: 0x10
};

/** Scorekeeping shorthand. Fielded outs carry the fielder's position number. */
function scoringCode(final: GameEvent): string {
	const position = final.pitch?.contact?.fielding?.position;
	const fielder = position === undefined || position === null || position > 8 ? '' : String(position + 1);
	switch (final.result_of_ab) {
		case RESULT.strikeout:
			return 'K';
		case RESULT.walk:
			return 'BB';
		case RESULT.hbp:
			return 'HP';
		case RESULT.out:
			return `G${fielder}`;
		case RESULT.caught:
			return `F${fielder}`;
		case RESULT.liner:
			return `L${fielder}`;
		case RESULT.single:
			return '1B';
		case RESULT.double:
			return '2B';
		case RESULT.triple:
			return '3B';
		case RESULT.homer:
			return 'HR';
		case RESULT.errorInput:
		case RESULT.errorChem:
			return `E${fielder}`;
		case RESULT.bunt:
			return 'BU';
		case RESULT.sacFly:
			return 'SF';
		case RESULT.doublePlay:
			return 'DP';
		case RESULT.foulCatch:
			return `FF${fielder}`;
		default:
			return '·';
	}
}

/**
 * Follow each batter round the bases. The stream stores, on every pitch, where
 * each runner started and ended; a batter's path is the furthest base any
 * later event in the same half records for their roster slot.
 */
export function buildPlates(events: GameEvent[]): Plate[] {
	const atBats = groupAtBats(events);
	const plates: Plate[] = atBats.map((atBat, index) => {
		const final = atBat.final;
		const self = final.runners.batter;
		const homer = final.result_of_ab === RESULT.homer;
		const out = !!self && self.out_type > 0;
		const reach = homer ? 4 : !self || out || self.result_base > 4 ? 0 : self.result_base;
		return {
			atBat,
			index,
			code: scoringCode(final),
			reach,
			outOnBases: false,
			outNumber: out ? final.outs + 1 : null,
			rbi: final.result_rbi,
			starSwing: final.pitch?.type_of_swing === 3
		};
	});

	// Who is on which base, by roster slot, within the current half.
	let live = new Map<number, Plate>();
	let half = '';
	let cursor = 0;
	for (const event of events) {
		const key = `${event.inning}-${event.half_inning}`;
		if (key !== half) {
			half = key;
			live = new Map();
		}
		for (const base of ['first', 'second', 'third'] as const) {
			const runner = event.runners[base];
			if (!runner) continue;
			const plate = live.get(runner.roster_loc);
			if (!plate) continue;
			if (runner.out_type > 0) {
				plate.outOnBases = true;
				plate.outNumber = event.outs + 1;
			} else if (event.result_of_ab === RESULT.homer) {
				plate.reach = 4;
			} else if (runner.result_base <= 4) {
				plate.reach = Math.max(plate.reach, runner.result_base);
			}
		}
		if (event.result_of_ab > 0) {
			const plate = plates[cursor++];
			if (plate && plate.reach > 0 && plate.reach < 4) live.set(event.batter.roster_loc, plate);
		}
	}
	return plates;
}

// Diamond geometry inside a 56-unit cell.
const HOME: [number, number] = [28, 50];
const BASES: [number, number][] = [
	[47, 31],
	[28, 12],
	[9, 31],
	HOME
];

function Cell({
	plate,
	color,
	selected,
	onSelect
}: {
	plate: Plate;
	color: string;
	selected: boolean;
	onSelect: () => void;
}) {
	const scored = plate.reach === 4;
	const reached = plate.reach > 0;
	const path = [HOME, ...BASES.slice(0, plate.reach)].map((p) => p.join(',')).join(' ');
	const final = plate.atBat.final;
	const label = `${characterName(final.batter.char_id)}, ${plate.atBat.halfInning === 0 ? 'top' : 'bottom'} ${
		plate.atBat.inning
	}: ${atBatResultName(final.result_of_ab)}${scored ? ', scored' : ''}`;

	return (
		<button
			type="button"
			onClick={onSelect}
			aria-pressed={selected}
			aria-label={label}
			title={label}
			className={`relative block h-[4.5rem] w-[4.5rem] flex-none rounded-md border transition-colors ${
				selected
					? 'border-rim bg-black/60 [box-shadow:inset_0_0_0_1px_rgb(136_119_119/0.86)]'
					: 'border-transparent hover:border-[var(--rim-strong)]'
			}`}
		>
			<svg viewBox="0 0 56 62" className="h-full w-full" aria-hidden>
				{/* The diamond, faint */}
				<polygon
					points={[HOME, ...BASES.slice(0, 3)].map((p) => p.join(',')).join(' ')}
					fill={scored ? color : 'none'}
					fillOpacity={scored ? 0.9 : 0}
					stroke="rgb(181 173 165 / 0.28)"
					strokeWidth="1"
				/>
				{/* How far they got */}
				{reached && !scored && (
					<polyline points={path} fill="none" stroke={color} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
				)}
				{plate.outOnBases && !scored && (
					<text
						x={BASES[Math.max(plate.reach - 1, 0)][0]}
						y={BASES[Math.max(plate.reach - 1, 0)][1] + 4}
						textAnchor="middle"
						fontSize="11"
						fontWeight="700"
						fill="var(--color-fog-100)"
					>
						×
					</text>
				)}
				<text
					x="28"
					y="35.5"
					textAnchor="middle"
					fontFamily="var(--font-mono)"
					fontSize={plate.code.length > 2 ? 11 : 13}
					fontWeight="600"
					fill={scored ? '#101410' : reached ? 'var(--color-fog-100)' : 'var(--color-fog-500)'}
				>
					{plate.code}
				</text>
				{/* Out number, top right */}
				{plate.outNumber !== null && (
					<>
						<circle cx="49" cy="8" r="6" fill="none" stroke="var(--color-fog-500)" strokeWidth="1" />
						<text x="49" y="11.2" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="9" fill="var(--color-fog-300)">
							{Math.min(plate.outNumber, 3)}
						</text>
					</>
				)}
				{/* Runs batted in, bottom left */}
				{Array.from({ length: plate.rbi }, (_, i) => (
					<circle key={i} cx={5 + i * 6} cy="57" r="2.2" fill="var(--color-star-400)" />
				))}
				{plate.starSwing && (
					<text x="6" y="12" textAnchor="middle" fontSize="10" fill="var(--color-star-400)">
						★
					</text>
				)}
			</svg>
		</button>
	);
}

export interface ScorecardTotals {
	ab: number;
	r?: number;
	h: number;
	rbi: number;
}

export default function Scorecard({
	plates,
	side,
	user,
	color,
	innings,
	totals,
	selected,
	onSelect
}: {
	plates: Plate[];
	/** 0 = away (bats in the top half), 1 = home. */
	side: 0 | 1;
	user: string;
	color: string;
	innings: number;
	/** Per-character box-score totals, keyed by character name. */
	totals?: Record<string, ScorecardTotals>;
	selected: number | null;
	onSelect: (index: number) => void;
}) {
	const mine = plates.filter((plate) => plate.atBat.halfInning === side);
	if (mine.length === 0) return null;

	// Batting order is the roster slot; the character in a slot never changes.
	const slots = Array.from(new Set(mine.map((plate) => plate.atBat.final.batter.roster_loc))).sort((a, b) => a - b);
	const cols = Array.from({ length: innings }, (_, i) => i + 1);

	return (
		<div className="panel">
			<div className="flex items-center gap-2.5 border-b border-[var(--rim)] bg-black/30 px-4 py-2.5">
				<span className="h-4 w-1 rounded-full" style={{ backgroundColor: color }} />
				<h2 className="font-display text-base font-semibold uppercase tracking-[0.12em] text-fog-100">{user}</h2>
				<span className="font-display text-sm font-medium uppercase tracking-[0.1em] text-fog-500">
					{side === 0 ? 'Away' : 'Home'}
				</span>
			</div>
			<div className="overflow-x-auto">
				<table className="w-full border-collapse">
					<thead>
						<tr className="font-display text-xs font-semibold uppercase tracking-[0.12em] text-fog-500">
							<th className="sticky left-0 z-10 bg-night-950 px-4 py-1.5 text-left sm:bg-transparent">Batter</th>
							{cols.map((inning) => (
								<th key={inning} className="px-0.5 py-1.5 text-center">
									{inning}
								</th>
							))}
							{totals && (
								<>
									<th className="border-l border-[var(--rim)] px-2.5 py-1.5 text-right">AB</th>
									<th className="px-2.5 py-1.5 text-right">R</th>
									<th className="px-2.5 py-1.5 text-right">H</th>
									<th className="px-2.5 py-1.5 pr-4 text-right">RBI</th>
								</>
							)}
						</tr>
					</thead>
					<tbody>
						{slots.map((slot) => {
							const row = mine.filter((plate) => plate.atBat.final.batter.roster_loc === slot);
							const batter = row[0].atBat.final.batter;
							const name = characterName(batter.char_id);
							const line = totals?.[name];
							const runs = row.filter((plate) => plate.reach === 4).length;
							return (
								<tr key={slot} className="border-t border-[rgb(181_173_165/0.12)]">
									<th scope="row" className="sticky left-0 z-10 bg-night-950 py-1 pl-4 pr-3 text-left font-normal sm:bg-transparent">
										<span className="flex items-center gap-2.5 whitespace-nowrap">
											<span className="w-3 font-mono text-xs tabular-nums text-fog-500">{slot + 1}</span>
											<img src={characterImage(name)} alt="" className="h-7 w-7 object-contain" />
											<span className="font-display text-base font-semibold text-fog-100">{name}</span>
											{batter.captain && (
												<span
													title="Captain"
													className="inline-flex h-4 w-4 items-center justify-center rounded-full border border-[#7a5a00] bg-star-400 font-display text-[10px] font-bold leading-none text-[#14140c]"
												>
													C
												</span>
											)}
										</span>
									</th>
									{cols.map((inning) => {
										const cells = row.filter((plate) => plate.atBat.inning === inning);
										return (
											<td key={inning} className="px-0.5 py-0.5 align-middle">
												<div className="flex justify-center gap-0.5">
													{cells.map((plate) => (
														<Cell
															key={plate.index}
															plate={plate}
															color={color}
															selected={selected === plate.index}
															onSelect={() => onSelect(plate.index)}
														/>
													))}
												</div>
											</td>
										);
									})}
									{totals && (
										<>
											<td className="border-l border-[var(--rim)] px-2.5 text-right font-mono tabular-nums text-fog-300">
												{line?.ab ?? '–'}
											</td>
											<td className="px-2.5 text-right font-mono tabular-nums text-fog-300">{runs}</td>
											<td className="px-2.5 text-right font-mono tabular-nums text-fog-100">{line?.h ?? '–'}</td>
											<td className="px-2.5 pr-4 text-right font-mono tabular-nums text-fog-300">{line?.rbi ?? '–'}</td>
										</>
									)}
								</tr>
							);
						})}
					</tbody>
				</table>
			</div>
		</div>
	);
}

/** Whether the selected plate appearance has a ball flight to replay in 3D. */
export function plateHasFlight(plate: Plate): boolean {
	return hasBallFlight(plate.atBat.final);
}
