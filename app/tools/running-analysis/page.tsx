import type { ReactNode } from 'react';
import { PageHeader, Panel, PanelHeader } from '@/components/ui';
import RunningCalculator from '@/components/running/RunningCalculator';
import FramesBySpeedChart, { type SpeedScenario } from '@/components/running/FramesBySpeedChart';
import { SERIES } from '@/components/running/chartUtils';
import { characters } from '@/lib/data/characters';
import {
	batterPosition,
	extremeSpots,
	framesToSeconds,
	legLength,
	simulateHomeToFirst,
	simulateRun,
	BASE_NAMES,
	speedConstants,
	type BoxSide,
	type BoxSpot,
	type MashMode,
	type PathMode
} from '@/lib/mssb/RunningSimulation/runningModel';
import {
	BASE_COORDS,
	BATTER_BOX,
	CHARACTER_SPEED,
	RUNNER_AUTO_START_FRAME,
	SPEED_STAT_CAP,
	SUPERSTAR_SPEED_BONUS
} from '@/lib/mssb/RunningSimulation/runningConstants';

export const metadata = { title: 'Running Analysis' };

const SPEEDS = Array.from({ length: SPEED_STAT_CAP / 10 + 1 }, (_, i) => i * 10);
const SPOT_NAMES: Record<BoxSpot, string> = {
	def: 'Default start',
	center: 'Middle',
	best: 'Closest corner',
	worst: 'Farthest corner',
	fi: 'Front-inside corner',
	fo: 'Front-outside corner',
	bi: 'Back-inside corner',
	bo: 'Back-outside corner'
};
const SPOT_ORDER: BoxSpot[] = ['def', 'center', 'best', 'worst'];
const SIDES: BoxSide[] = ['R', 'L'];
const sideName = (s: BoxSide) => (s === 'R' ? 'Right-handed' : 'Left-handed');
const sideAbbr = (s: BoxSide) => (s === 'R' ? 'RHB' : 'LHB');
const charName = (id: number) => characters[String(id)];

function C({ children }: { children: ReactNode }) {
	return <code className="rounded bg-night-800 px-1 py-0.5 font-mono text-[0.85em] text-fog-100">{children}</code>;
}

function Pre({ children }: { children: string }) {
	return (
		<pre className="my-3 overflow-x-auto rounded-lg border border-night-700 bg-night-850 p-4 font-mono text-xs leading-relaxed text-fog-300">
			{children}
		</pre>
	);
}

function Section({ num, title, refs, children }: { num: string; title: string; refs: string; children: ReactNode }) {
	return (
		<section className="space-y-3">
			<div>
				<p className="kicker">{num}</p>
				<h2 className="mt-1 text-2xl uppercase">{title}</h2>
			</div>
			<div className="max-w-3xl space-y-3 text-sm leading-relaxed text-fog-300">{children}</div>
			<p className="font-mono text-xs text-fog-500">{refs}</p>
		</section>
	);
}

function Table({ head, rows, highlight }: { head: ReactNode[]; rows: ReactNode[][]; highlight?: (i: number) => boolean }) {
	return (
		<div className="overflow-x-auto">
			<table className="stat-table">
				<thead>
					<tr>
						{head.map((h, i) => (
							<th key={i}>{h}</th>
						))}
					</tr>
				</thead>
				<tbody>
					{rows.map((r, i) => (
						<tr key={i} className={highlight?.(i) ? 'bg-night-800' : undefined}>
							{r.map((cell, j) => (
								<td key={j} className={j === 0 ? '' : 'font-mono tabular-nums'}>
									{cell}
								</td>
							))}
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
}

export default function RunningAnalysisPage() {
	const { best, worst } = extremeSpots();
	const scenarioDefs = [
		{ key: 'best', label: `Closest spot (${charName(best.charId)}, left)`, shortLabel: 'Closest spot', color: SERIES.blue, pos: best.pos },
		{ key: 'lc', label: 'Middle of box, left (Mario)', shortLabel: 'Middle, left', color: SERIES.aqua, pos: batterPosition(0, 'L', 'center') },
		{ key: 'rc', label: 'Middle of box, right (Mario)', shortLabel: 'Middle, right', color: SERIES.gold, pos: batterPosition(0, 'R', 'center') },
		{ key: 'worst', label: `Farthest spot (${charName(worst.charId)}, right)`, shortLabel: 'Farthest spot', color: SERIES.orange, pos: worst.pos }
	].map((d) => ({ ...d, L: legLength(d.pos) }));
	const scenarios: (SpeedScenario & { L: number; human: number[]; pos: [number, number] })[] = scenarioDefs.map((s) => ({
		...s,
		tas: SPEEDS.map((sp) => simulateHomeToFirst(sp, s.pos, 'tas').frame),
		human: SPEEDS.map((sp) => simulateHomeToFirst(sp, s.pos, 'human').frame),
		none: SPEEDS.map((sp) => simulateHomeToFirst(sp, s.pos, 'none').frame)
	}));

	// Fastest real runner: starred Yoshi (90 + 50) from the closest corner of Yoshi's own box.
	const YOSHI = 6;
	const yoshiSpeed = CHARACTER_SPEED[YOSHI] + SUPERSTAR_SPEED_BONUS;
	const yoshiPos = SIDES.map((sd) => batterPosition(YOSHI, sd, 'best')).sort((a, b) => legLength(a) - legLength(b))[0];
	const fastest = simulateHomeToFirst(yoshiSpeed, yoshiPos, 'tas');
	const atCap = simulateHomeToFirst(SPEED_STAT_CAP, best.pos, 'tas');
	const typical = simulateHomeToFirst(100, scenarios[2].pos, 'tas');
	const typicalHuman = simulateHomeToFirst(100, scenarios[2].pos, 'human');
	const typicalNone = simulateHomeToFirst(100, scenarios[2].pos, 'none');

	const slowest = Math.min(...CHARACTER_SPEED);
	const fastestBase = Math.max(...CHARACTER_SPEED);
	const namesAt = (sp: number) => CHARACTER_SPEED.flatMap((v, id) => (v === sp ? [charName(id)] : [])).join(', ');
	const speedNotes: Record<number, string> = {
		[slowest]: `Slowest characters: ${namesAt(slowest)}`,
		[slowest + SUPERSTAR_SPEED_BONUS]: 'The slowest characters when starred',
		[fastestBase]: `Fastest unstarred: ${namesAt(fastestBase)}`,
		100: 'Acceleration stops falling here',
		[fastestBase + SUPERSTAR_SPEED_BONUS]: 'Starred Yoshi, Toadette: the fastest in the game',
		[SPEED_STAT_CAP]: 'The most the game will calculate without mods (initializeInMemRunner caps the stat at 200)'
	};

	const range = (side: BoxSide, spot: BoxSpot) => {
		let lo = { id: 0, L: Infinity };
		let hi = { id: 0, L: -Infinity };
		BATTER_BOX.forEach((_, id) => {
			const L = legLength(batterPosition(id, side, spot));
			if (L < lo.L) lo = { id, L };
			if (L > hi.L) hi = { id, L };
		});
		return { lo, hi };
	};

	// Executive summary figures, computed across the whole roster at each character's own speed.
	const ids = BATTER_BOX.map((_, id) => id);
	const runAt = (id: number, sd: BoxSide, sp: BoxSpot, mode: MashMode = 'tas', speed = CHARACTER_SPEED[id]) =>
		simulateHomeToFirst(speed, batterPosition(id, sd, sp), mode);
	const span = (xs: number[]) => {
		const lo = Math.min(...xs);
		const hi = Math.max(...xs);
		return lo === hi ? `${lo}` : `${lo}–${hi}`;
	};
	const leftyGain = span(ids.map((id) => runAt(id, 'R', 'center').frame - runAt(id, 'L', 'center').frame));
	const cornerGain = span(ids.flatMap((id) => SIDES.map((sd) => runAt(id, sd, 'def').frame - runAt(id, sd, 'best').frame)));
	const mashGain = span(ids.map((id) => runAt(id, 'R', 'center', 'none').frame - runAt(id, 'R', 'center').frame));
	const humanGap = Math.max(...ids.flatMap((id) => SIDES.map((sd) => runAt(id, sd, 'center', 'human').frame - runAt(id, sd, 'center').frame)));
	const topSpeedFrame = span(ids.map((id) => runAt(id, 'R', 'center').topFrame ?? 0));
	const marioMid = (speed: number) => runAt(0, 'R', 'center', 'tas', speed).frame;
	const perTenSpeed = ((marioMid(slowest) - marioMid(fastestBase)) / ((fastestBase - slowest) / 10)).toFixed(1);
	const starGain = runAt(YOSHI, 'R', 'center', 'tas', CHARACTER_SPEED[YOSHI]).frame - runAt(YOSHI, 'R', 'center', 'tas', yoshiSpeed).frame;
	const accelFrames = (speed: number) => {
		const k = speedConstants(speed);
		return Math.ceil(k.maxV / k.accel - 1e-6);
	};

	// Running the bases: Mario (speed 50) from the middle of the right-handed box, TAS mashing.
	const marioPos = batterPosition(0, 'R', 'center');
	const route = (startBase: number, endBase: number, path: PathMode, speed = CHARACTER_SPEED[0]) =>
		simulateRun({ speed, mash: 'tas', path, startBase, endBase, batterPos: marioPos });
	const trotRound = route(0, 4, 'round');
	const trotStraight = route(0, 4, 'straight');
	const firstToThirdRound = route(1, 3, 'round');
	const firstToThirdStraight = route(1, 3, 'straight');
	const thirdHome = route(3, 4, 'round');
	const firstToSecondRound = route(1, 2, 'round');
	const firstToSecondStraight = route(1, 2, 'straight');
	const legStraight = Math.hypot(BASE_COORDS[2][0] - BASE_COORDS[1][0], BASE_COORDS[2][1] - BASE_COORDS[1][1]);
	const legRoundMax = Math.max(...trotRound.trace.filter((t) => Math.trunc(t.fbr) === 1).map((t) => t.L));
	const roundingExtra = Math.round((legRoundMax / legStraight - 1) * 100);
	// Every route a runner can take: the batter to any base, and each runner on base to any later base.
	const ROUTES = [0, 1, 2, 3].flatMap((s) => [1, 2, 3, 4].filter((e) => e > s).map((e) => ({ s, e })));
	const straightOnly = (r: { s: number; e: number }) => r.s === 0 && r.e === 1; // the 1B overrun logic blocks rounding
	const routeResults = ROUTES.map((r) => ({
		...r,
		round: SPEEDS.map((sp) => route(r.s, r.e, 'round', sp).frame),
		straight: SPEEDS.map((sp) => route(r.s, r.e, 'straight', sp).frame)
	}));
	const routeLabel = (r: { s: number; e: number }) => `${r.s === 0 ? 'Batter' : BASE_NAMES[r.s]} → ${BASE_NAMES[r.e]}`;

	const tiles = [
		{
			label: `Fastest in the game (starred Yoshi, speed ${yoshiSpeed}, TAS)`,
			value: `${fastest.frame}`,
			unit: 'frames',
			sub: `${framesToSeconds(fastest.frame)} s from contact, from the closest corner of Yoshi's box. At the ${SPEED_STAT_CAP} cap from the closest spot any box allows: ${atCap.frame} frames.`
		},
		{
			label: 'Speed 100, right-handed, middle of box',
			value: `${typical.frame}`,
			unit: `/ ${typicalNone.frame} frames`,
			sub: `TAS mashing / no mashing (${framesToSeconds(typical.frame)} s / ${framesToSeconds(typicalNone.frame)} s)`
		},
		{
			label: 'What mashing saves (speed 100, right-handed, middle)',
			value: `${typicalNone.frame - typical.frame}`,
			unit: `/ ${typicalNone.frame - typicalHuman.frame} frames`,
			sub: 'TAS / human viable, compared with no mashing. The saving grows with the distance, because the bonus applies for longer.'
		},
		{ label: 'Fixed start delay', value: '30', unit: 'frames', sub: 'The batter is held for half a second after contact, whatever their speed.' }
	];

	return (
		<div className="space-y-12">
			<div>
				<PageHeader kicker="Tools" title="Running Analysis" />
				<p className="-mt-4 max-w-3xl text-fog-300">
					How many frames a runner needs to reach each base after contact, from the batter&apos;s box or from a base. The figures come
					from a frame-by-frame model that copies the game&apos;s runner update in single-precision floats. Every rule is traced to the
					mssb-dtk decompilation, and the model runs live in the calculator below. The runner always goes forward and is sent to the next
					base on the earliest possible frame.
				</p>
			</div>

			<Panel>
				<PanelHeader title="Summary" />
				<div className="grid gap-8 p-5 lg:grid-cols-2">
					<div className="space-y-3">
						<h2 className="text-lg uppercase text-fog-100">Advice for players</h2>
						<ul className="space-y-2.5 text-sm leading-relaxed text-fog-300">
							<li>
								<b className="text-fog-100">Left-handed batters get to 1B sooner.</b> The left-handed box is about 3 m closer, worth{' '}
								{leftyGain} frames from the middle of the box at each character&apos;s own speed.
							</li>
							<li>
								<b className="text-fog-100">Move toward 1B in the box if you need the run.</b> Standing in the corner nearest 1B
								instead of the default spot saves {cornerGain} frames. Moving in the box also moves where you hit the ball, so it
								is a trade-off.
							</li>
							<li>
								<b className="text-fog-100">Mash once the runner is at full speed.</b> Presses only count from top speed, which a
								batter reaches {topSpeedFrame} frames after contact. Presses before then do nothing. A full mash meter is worth{' '}
								{mashGain} frames on the way to 1B.
							</li>
							<li>
								<b className="text-fog-100">About 20 presses a second is enough.</b> A press every 3 frames lands within{' '}
								{humanGap} frame{humanGap === 1 ? '' : 's'} of a perfect TAS in every case here. Any A, B, X or Y press counts, so
								alternating two buttons makes it easier.
							</li>
							<li>
								<b className="text-fog-100">Keep the control stick neutral while mashing.</b> Presses made while holding a
								direction aren&apos;t counted.
							</li>
							<li>
								<b className="text-fog-100">Starring is a big speed boost.</b> It adds 50 to the speed stat: starred Yoshi reaches
								1B {starGain} frames sooner than unstarred Yoshi.
							</li>
							<li>
								<b className="text-fog-100">Rounding pays off over two or more bases.</b> A runner who rounds keeps their speed
								through each base; one who doesn&apos;t stops on 1B or slides into the next base, then starts again from zero. Mario goes
								1B to 3B in {firstToThirdRound.frame} frames rounding and {firstToThirdStraight.frame} without, and an inside-the-park
								home run takes {trotRound.frame} against {trotStraight.frame}. For a single base it barely matters: 1B to 2B takes{' '}
								{firstToSecondRound.frame} rounding and {firstToSecondStraight.frame} straight, because the wider rounding path costs
								about as much as the slide.
							</li>
						</ul>
					</div>
					<div className="space-y-3">
						<h2 className="text-lg uppercase text-fog-100">How running works</h2>
						<ul className="space-y-2.5 text-sm leading-relaxed text-fog-300">
							<li>
								<b className="text-fog-100">Every batter waits 30 frames.</b> Half a second after contact before moving,
								whatever their speed or the type of hit.
							</li>
							<li>
								<b className="text-fog-100">The run starts where the batter stands,</b> not at home plate, so the distance to 1B
								depends on the character&apos;s box and where they moved in it.
							</li>
							<li>
								<b className="text-fog-100">Faster characters accelerate more slowly.</b> A speed-{slowest} runner reaches top
								speed in {accelFrames(slowest)} frames; a speed-{fastestBase} runner takes {accelFrames(fastestBase)}. Top speed
								still wins: each 10 points of speed is worth about {perTenSpeed} frames to 1B.
							</li>
							<li>
								<b className="text-fog-100">You are safe at 97% of the way.</b> The game counts the runner as on 1B about 0.8 m
								before the base.
							</li>
							<li>
								<b className="text-fog-100">Ties go to the fielder.</b> The force-out check runs before the runner moves each
								frame, so the runner has to arrive at least one frame before the fielder touches the base.
							</li>
							<li>
								<b className="text-fog-100">Running to 1B is simple.</b> The batter never slides into 1B, overrunning only starts
								after the base, and stamina costs about 1% of top speed by the time the runner arrives.
							</li>
							<li>
								<b className="text-fog-100">Runners on base start with a lead.</b> Every runner leads off 13% of the way to the next
								base during each pitch, and the game sends them all forward automatically on frame {RUNNER_AUTO_START_FRAME}, long
								before the batter can move.
							</li>
							<li>
								<b className="text-fog-100">Rounding takes a wider path.</b> Rounding starts halfway along a baseline and swings the runner
								wide, so the game measures each baseline as up to {roundingExtra}% longer. It still wins, because the runner never stops.
							</li>
							<li>
								<b className="text-fog-100">Runners slide when they aren&apos;t rounding.</b> Into 2B, 3B or home the slide starts 16–22
								frames out and costs a 25-frame recovery. A runner starting on 3rd never rounds, so they always slide home (
								{thirdHome.frame} frames for Mario).
							</li>
						</ul>
					</div>
				</div>
			</Panel>

			<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
				{tiles.map((t) => (
					<Panel key={t.label} className="p-5">
						<p className="text-xs text-fog-500">{t.label}</p>
						<p className="mt-1 font-display text-3xl font-bold tabular-nums">
							{t.value} <span className="text-base font-medium text-fog-300">{t.unit}</span>
						</p>
						<p className="mt-1 text-xs text-fog-300">{t.sub}</p>
					</Panel>
				))}
			</div>

			<Panel>
				<PanelHeader title="Calculator" />
				<RunningCalculator />
			</Panel>

			<Panel>
				<PanelHeader title="Frames to 1st by speed stat" />
				<div className="space-y-3 p-5">
					<p className="text-sm text-fog-300">
						Four starting spots. Solid lines are TAS mashing, dashed lines are no mashing. The extremes are the closest and farthest spots
						any character&apos;s box allows. The middle-of-box lines use Mario&apos;s box.
					</p>
					<FramesBySpeedChart speeds={SPEEDS} scenarios={scenarios} />
					<div className="flex flex-wrap gap-x-5 gap-y-1 text-xs text-fog-300">
						{scenarios.map((s) => (
							<span key={s.key} className="flex items-center gap-2">
								<span className="inline-block w-5 border-t-2" style={{ borderColor: s.color }} />
								{s.label}
							</span>
						))}
						<span className="flex items-center gap-2">
							<span className="inline-block w-5 border-t-2 border-dashed border-fog-500" />
							No mashing
						</span>
					</div>
				</div>
			</Panel>

			<Section
				num="1 · Timeline"
				title="When the clock starts and when the runner moves"
				refs="ball_physics.c:441, :1154 · match_flow.c (atBatScreen / live-ball order) · runner.c:2750 (delay check), :3730 (forced-batter override) · roster_init.c:478 · character_constants.c:189 (batterRunDelayFrames) · runner.c:126 (liveBallInputDelayFrames), :3740 (runners go on frame 5)"
			>
				<p>
					All times are counted from the contact frame. On that frame <C>setLiveBallVariablesAfterContact</C> sets{' '}
					<C>g_Ball.framesSinceHit = 0</C>. On every later live-ball frame, <C>ballPhysics()</C> increments it before{' '}
					<C>running_main()</C> runs, so during a frame&apos;s runner update <C>framesSinceHit</C> equals the number of frames since contact.
				</p>
				<ol className="list-decimal space-y-1 pl-5">
					<li>
						<b className="text-fog-100">Frame 0 (contact):</b> <C>running_initRunnersOnContact</C> asks the batter to advance. The runner
						doesn&apos;t move yet.
					</li>
					<li>
						<b className="text-fog-100">Frames 1–29:</b> from frame 1, <C>running_getDirectionOverride</C> returns{' '}
						<C>RUNNER_MOVEMENT_FORWARDS</C> for the batter, because the batter is always forced to advance. But{' '}
						<C>running_calcSpeedVariables</C> returns straight away while <C>delayBeforeStartingToRun (30) &gt; framesSinceHit</C>, so
						velocity stays 0. Runner input isn&apos;t read yet either: <C>running_liveBall</C> skips the input pass until{' '}
						<C>framesInGameStatus ≥ liveBallInputDelayFrames</C> (20 frames, or 10 for a high fly to the outfield).
					</li>
					<li>
						<b className="text-fog-100">Frame 30:</b> the batter&apos;s first frame with movement. Velocity becomes one frame of
						acceleration.
					</li>
					<li>
						<b className="text-fog-100">Runners already on base</b> go earlier: on frame 5 <C>running_getDirectionOverride</C> sends every
						runner forward (<C>framesSinceHit == 5</C>), and only the batter has the 30-frame hold (section 7).
					</li>
					<li>
						<b className="text-fog-100">Arrival frame:</b> the first frame whose update leaves the runner at least 97% of the way to the
						base (section 6).
					</li>
				</ol>
				<p>
					The 30-frame hold is the same for every character. <C>batterRunDelayFrames = 30</C> is copied into each runner, and nothing changes
					it per character or per hit type.
				</p>
			</Section>

			<Section
				num="2 · Start position"
				title="Where in the batter's box the run begins"
				refs="runner.c:2662 (run starts at batterPos), :2680 (distance to 1B) · batter.c:199–238 (at-bat start clamp), :520–595 (box movement) · character_constants.c:63 (BatterHitbox) · gameplay_tables.c:355 (baseCoordsForRunning), :440 (initialBoxPosition)"
			>
				<p>
					For the batter, the run starts at the batter, not at home plate (runners already on base start from their lead; see section 7). <C>running_updateDistAndFramesToClosestBases</C>{' '}
					sets <C>currentBaseCoordinates = g_Batter.batterPos</C> while <C>fractionalBasesRan &lt; 1</C>, and it ends at{' '}
					<C>baseCoordsForRunning[1] = (18.8, 19.4)</C>. Positions are in metres, so the distance to 1B is:
				</p>
				<Pre>{`L = |(18.8, 19.4) − batterPos|          // distance to 1B in metres (calculatedLengthOfCurrentBaseline)`}</Pre>
				<p>
					The batter&apos;s position comes from their position in the box, <C>boxPosition</C>, plus a per-character body offset, both read from{' '}
					<C>BatterHitbox[charID]</C>:
				</p>
				<Pre>{`batterPos.x = boxPosition.x + batOffsetFromBatterX
batterPos.z = boxPosition.z + batOffsetFromBatterZ
if (left-handed) batterPos.x = −batterPos.x       // mirror to the 1st-base side

boxPosition.x ∈ [HorizontalRangeNear, HorizontalRangeFar]
boxPosition.z ∈ [VerticalRangeFront,  VerticalRangeBack]
start of each at-bat: boxPosition = initialBoxPosition = (0, ·, 0.4), clamped`}</Pre>
				<p>
					The batter can move freely within those ranges until the swing starts. Once <C>framesSinceStartOfSwing &gt; 0</C> the movement
					multiplier is 0, so the position is fixed at contact. The four spots used here are:
				</p>
				<ul className="list-disc space-y-1 pl-5">
					<li>
						<b className="text-fog-100">Default start:</b> <C>(0, 0.4)</C> clamped. This is where the batter stands without touching the
						stick.
					</li>
					<li>
						<b className="text-fog-100">Middle of the box:</b> the midpoint of both ranges.
					</li>
					<li>
						<b className="text-fog-100">Closest corner:</b> both coordinates pushed toward 1st (+x, +z after mirroring). For a
						right-handed batter that&apos;s <C>Far</C>, <C>Back</C>; for a left-handed batter it&apos;s <C>Near</C>, <C>Back</C>.
					</li>
					<li>
						<b className="text-fog-100">Farthest corner:</b> the opposite corner.
					</li>
				</ul>
			</Section>

			<div className="grid gap-6 lg:grid-cols-2">
				<Panel>
					<PanelHeader title="Mario's box, worked" />
					<p className="px-4 pt-3 font-mono text-xs text-fog-500">Near −0.65 · Far 0.55 · Front −0.2 · Back 1.5 · offX −2.1 · offZ −1.0</p>
					<Table
						head={['Spot', 'Handedness', 'batterPos (x, z) m', 'Distance to 1B (m)']}
						rows={SPOT_ORDER.flatMap((sp) =>
							SIDES.map((sd) => {
								const p = batterPosition(0, sd, sp);
								return [SPOT_NAMES[sp], sideName(sd), `(${p[0].toFixed(2)}, ${p[1].toFixed(2)})`, legLength(p).toFixed(3)];
							})
						)}
					/>
				</Panel>
				<Panel>
					<PanelHeader title="Across all 54 characters" />
					<Table
						head={['Spot', 'Handedness', 'Shortest distance (m)', 'Longest distance (m)']}
						rows={SPOT_ORDER.flatMap((sp) =>
							SIDES.map((sd) => {
								const r = range(sd, sp);
								return [
									SPOT_NAMES[sp],
									sideName(sd),
									<>
										{r.lo.L.toFixed(2)} <span className="font-sans text-fog-500">{charName(r.lo.id)}</span>
									</>,
									<>
										{r.hi.L.toFixed(2)} <span className="font-sans text-fog-500">{charName(r.hi.id)}</span>
									</>
								];
							})
						)}
					/>
					<p className="border-t border-night-700 px-4 py-3 text-xs text-fog-300">
						A left-handed batter stands about 3 m closer to 1st than a right-handed one, which is roughly 11% of the distance. That&apos;s
						the biggest single factor in the starting position.
					</p>
				</Panel>
			</div>

			<Section
				num="3 · Speed stat"
				title="How the speed stat becomes movement constants"
				refs="roster_init.c:476–483 (stat read, cap 200), :508 setRunnerSpeedConstants · sub.c:284 LinearInterpolateToNewRange · gameplay_tables.c:418 (runnerSpeedScaling), :427 (runnerVelocityLookup) · orderchange.c:145, minigame_framework.c:1902 (+50) · superstarStatBonus @ 0x800E86F0"
			>
				<p>
					<C>setRunnerSpeedConstants</C> turns the stat into per-runner constants using <C>LinearInterpolateToNewRange</C>, which clamps
					its input fraction to 0–1:
				</p>
				<Pre>{`lower = speed / 10 * 10;  upper = lower + 10
maximumBaseVelocity   = lerp(speed, lower..upper → runnerVelocityLookup[lower/10]..[upper/10])
baseAcceleration      = lerp(speed, runnerSpeedScaling.accel)                 // 0.01 → 0.005, clamped above 100
maxMashVeloAdjustment = lerp(speed, runnerSpeedScaling.maxMashBonus)          // 0.02 for everyone
percentAddedPerMash   = 1 / lerp(speed, runnerSpeedScaling.pressesToFillMash) // 1/5 = 0.2 per press
mashDecayPerFrame     = 1 / lerp(speed, runnerSpeedScaling.mashDecayFrames)   // 1/20 = 0.05
mashHoldFrames        = runnerTimingConsts.mashHoldFrames                     // 6

// each runnerSpeedScaling entry is { atSpeed0, atSpeed100 }, interpolated over speed 0..100`}</Pre>
				<p>
					<b className="text-fog-100">Acceleration drops as speed rises.</b> A speed-0 runner gains 0.01 m/frame every frame. A
					speed-100 runner gains only 0.005, and anything above 100 stays at 0.005. Fast runners have a higher top speed but take longer
					to reach it: about 13 frames at speed 0, about 31 at speed 100 and about 35 at speed 150.
				</p>
				<p>
					<b className="text-fog-100">Superstar:</b> starring a character adds <C>superstarStatBonus.Speed</C> to the stat.
					That&apos;s the 6th byte of the table <C>32 32 32 32 32 32 32 14 14 32 32 32</C>, so <b className="text-fog-100">+50</b>. The
					stat is a <C>u8</C>, and <C>initializeInMemRunner</C> caps the runner&apos;s copy at <b className="text-fog-100">200</b>. The
					velocity table has 22 entries (speed 0 to 210) and is flat from 200 (0.19). So a 150 superstar keeps improving on 100, and the
					scale could go up to 200.
				</p>
			</Section>

			<Panel>
				<PanelHeader title="Speed constants" />
				<Table
					head={['Speed', 'Top speed (m/frame)', 'Accel (m/frame²)', 'Frames to top speed', 'Top speed + full mash', 'Mash gain']}
					highlight={(i) => SPEEDS[i] === 100}
					rows={SPEEDS.map((s) => {
						const k = speedConstants(s);
						return [
							s,
							k.maxV.toFixed(4),
							k.accel.toFixed(5),
							Math.ceil(k.maxV / k.accel - 1e-6),
							(k.maxV + 0.02).toFixed(4),
							`+${((0.02 / k.maxV) * 100).toFixed(1)}%`
						];
					})}
				/>
			</Panel>

			<Section
				num="4 · Mashing"
				title="Getting up to speed, and the mash bonus on top"
				refs="runner.c:2739 running_calcSpeedVariables, :2834 (cap), :2851 (mash) · :1087 (flag cleared each frame), :4244 (human mash input) · :1117 running_updateStamina, :408 (stamina reset) · match_flow.c:444"
			>
				<p>
					Each frame, <C>running_calcSpeedVariables</C> does this for a runner heading forward:
				</p>
				<Pre>{`acceleration = baseAcceleration * accelerationStaminaEffect
veloCap      = 1.0 * maximumBaseVelocity * staminaMult           // runnerSpeedCapMult.normal
v = v + acceleration
if (v > veloCap) { v = veloCap; maxedOut = 1 }
if (maxedOut) {
    if (mashPressedThisFrame) { mashHoldFramesLeft = mashHoldFrames; mashPercent = min(1, mashPercent + 0.2) }
    else if (mashHoldFramesLeft) mashHoldFramesLeft--
    else mashPercent = max(0, mashPercent − 0.05)
    v += mashPercent * 0.02                                       // mashVeloAdjustment
} else { mashPercent = 0 }`}</Pre>
				<ol className="list-decimal space-y-1 pl-5">
					<li>
						<b className="text-fog-100">Mashing only counts at top speed.</b> Until <C>v</C> reaches the cap, <C>mashPercent</C> is
						reset to 0 every frame, so presses during acceleration are wasted.
					</li>
					<li>
						<b className="text-fog-100">The cap reapplies every frame.</b> The previous frame&apos;s mash bonus is added back, the speed
						is clamped to the cap, and then the bonus is applied again. So the bonus sits on top of the cap and doesn&apos;t build up.
					</li>
					<li>
						<b className="text-fog-100">TAS-perfect</b> means a new press on every frame, for example alternating A and B. The flag{' '}
						<C>mashPressedThisFrame</C> is cleared at the start of each frame and set by any new A/B/X/Y press. After 5
						presses <C>mashPercent</C> is 1.0, worth <b className="text-fog-100">+0.02 m/frame</b>: about 12.7% on top of a
						speed-100 cap of 0.157.
					</li>
					<li>
						<b className="text-fog-100">The stick must be neutral.</b> In <C>running_liveBall_human</C> the mash check is inside the{' '}
						<C>controlStickAngle &lt; 0</C> branch, so presses made while holding a direction don&apos;t count.
					</li>
					<li>
						<b className="text-fog-100">Human viable</b> assumes a press every 3 frames. The fastest known mashing is Ludwig&apos;s 20.1
						presses per second, about one every 3 frames. A press holds the bonus for 6 frames, so a 3-frame gap never lets the meter
						decay; it just fills in 13 frames instead of 5. Over those frames the slower fill adds up to about 0.08 m of lost travel, less
						than half a frame of running, so it rarely changes the arrival frame. At speed 100 from the middle of the right-handed box,
						human viable reaches 1B{' '}
						{typicalHuman.frame === typical.frame
							? 'on the same frame as TAS'
							: `${typicalHuman.frame - typical.frame} frame${typicalHuman.frame - typical.frame === 1 ? '' : 's'} after TAS`}{' '}
						and {typicalNone.frame - typicalHuman.frame} frames before no mashing. The model gives the human the best timing: a press on
						the first frame at top speed.
					</li>
				</ol>
				<h3 className="pt-2 text-lg uppercase text-fog-100">Stamina</h3>
				<p>
					At the start of every frame, <C>running_updateStamina</C> drains 1 point from 4000 if the previous frame&apos;s velocity was
					at least 0.1. Then <C>staminaMult = 1 − 0.3·(1 − stamina/4000)</C> and <C>accelerationStaminaEffect = 1 − 0.5·(…)</C>. The
					batter starts each at-bat at 4000, because <C>running_setDefaultRunners</C> runs for every new batter. Over a run to 1st that
					loses roughly 150 points, which is about 1.1% off top speed by the end. It&apos;s small, but the model includes it.
				</p>
			</Section>

			<Section num="5 · Progress" title="How velocity becomes progress along a baseline" refs="runner.c:2938–2950 · :2680 (distance) · :3965 running_roundBaseDecision">
				<p>
					Velocity is in metres per frame. It becomes a fraction of the current baseline and is added to <C>fractionalBasesRan</C> (bases run,
					so 1.5 is halfway from 1B to 2B), truncated to 1/10000:
				</p>
				<Pre>{`percentRanPerFrame = v * (1 / L)
scaled = (int)(10000 * (fractionalBasesRan + percentRanPerFrame))
fractionalBasesRan     = scaled / 10000
percentTowardsNextBase = (scaled % 10000) / 10000`}</Pre>
				<p>
					<C>L</C> is measured every frame from the runner&apos;s actual position: the distance back to the base behind plus the distance
					on to the base ahead. On a straight run that is just the length of the baseline. The batter&apos;s run to 1st is always straight,
					because the 1st-base overrun logic blocks rounding, so <C>L</C> stays at the distance from <C>batterPos</C> to 1st. A runner
					who is rounding is off the straight line, so <C>L</C> grows and each frame covers a slightly smaller fraction of the baseline
					(section 7).
				</p>
			</Section>

			<Section
				num="6 · Arrival"
				title="When a runner counts as on a base"
				refs="runner.c:3263 (arrival), :428 (baseReachMargin 0.03), :3319 (scoring), :649 running_updateForceStatus, :813 running_beginFrame_checkForceOut, :1061 frame order, :3835 (no slide into 1st)"
			>
				<p>
					<C>running_updateBaseArrival</C> marks the runner as standing on the next base once <C>fractionalBasesRan &gt; 0.5</C> and:
				</p>
				<Pre>{`percentTowardsNextBase >= 1 − baseReachMargin_forwards      // baseReachMargin = 0.03 → 0.97`}</Pre>
				<p>
					That applies to every base, and a runner scores at home by the same check (<C>baseStandingOn == 0</C>). So the runner is safe 3%
					of the baseline early, about 0.8 m, which is roughly 4–5 frames of running. On a force play at 1st,{' '}
					<C>running_updateForceStatus</C> (in <C>running_endFrame</C>) clears <C>FORCE_OUT_TYPE_FORCED_TO_ADVANCE</C> once{' '}
					<C>baseStandingOn</C> is 1st.
				</p>
				<p>
					<b className="text-fog-100">Ties go to the fielder.</b> <C>running_beginFrame_checkForceOut</C> records the force out at the
					start of the runner update when a fielder with the ball is on the base and the runner is still forced. If the fielder&apos;s
					touch is registered on the same frame the runner arrives, the force check runs first and the runner is out. To be safe, the
					runner&apos;s arrival frame must come before the fielder&apos;s touch frame.
				</p>
				<p>
					The batter never slides into 1st: <C>running_triggerSlideOrBodyCheck</C> returns early when <C>nextBase == 1</C>. The
					1st-base overrun is flagged at 80% of the distance, but its control code does nothing until <C>fractionalBasesRan ≥ 1</C>, so it
					doesn&apos;t affect the run. Runners heading for the other bases can slide, which section 7 covers.
				</p>
			</Section>

			<Section
				num="7 · Running the bases"
				title="Runners on base, rounding, sliding and scoring"
				refs="runner.c:470 (45-frame lead), :3147 running_updateLeadoff, :3740 (go on frame 5) · :3965 running_roundBaseDecision · :3547 (rounding blend), :3619 running_basePathPosition · :3196 (crossing a base) · :3172 running_stopRunner, :3355 running_placeRunnerOnBase · :3806 running_triggerSlideOrBodyCheck, :3865 (slide window), :2962 running_updateActionAndVelocity · :3319 (scoring)"
			>
				<p>
					<b className="text-fog-100">Runners on base.</b> Every pitch, <C>running_setDefaultRunners</C> starts each runner on a 45-frame
					lead to <C>leadoffDistancePercent + baseReachMargin</C> = 13% of the way to the next base. Contact cancels the lead but leaves the
					runner where they are, and on frame 5 the game sends every runner forward. The model starts them from a full lead.
				</p>
				<p>
					<b className="text-fog-100">Rounding.</b> <C>running_roundBaseDecision</C> lets a runner start rounding once they are halfway
					along a baseline. In the game this also depends on the ball: it doesn&apos;t round near the ball, on infield grounders, during a throw
					to the base and so on. The &quot;Round the bases&quot; option assumes none of those apply, as on a ball hit to the outfield. Once
					rounding, the drawn position blends from the straight line onto the rounding spline by 1.2% a frame:
				</p>
				<Pre>{`straight  = currentBase + (nextBase − currentBase) · percentTowardsNextBase
spline    = running_basePathPosition(fractionalBasesRan, percentTowardsNextBase)   // baseRoundingPathPoints
position  = straight + (spline − straight) · roundingStrengthPercent              // +0.012 per frame, up to 1
L         = |position − currentBase| + |nextBase − position|                     // longer while off the line`}</Pre>
				<p>
					While the runner is on a base, the blend is set straight to 1, so after the first base a rounding runner stays fully on the
					spline. Crossing a base while rounding keeps the runner&apos;s speed, but progress snaps back to exactly the base, so any overshoot
					that frame is lost. The game never starts rounding on the 3B-to-home baseline (<C>fractionalBasesRan ≥ 3</C>); a runner already
					rounding carries on, but a runner starting on 3rd runs it straight. The batter starts rounding a frame later than other runners,
					because the 1st-base overrun check holds them until they are halfway.
				</p>
				<p>
					<b className="text-fog-100">Not rounding.</b> A runner who isn&apos;t rounding stops on the base when they cross it:{' '}
					<C>running_stopRunner</C> zeroes their speed and <C>running_placeRunnerOnBase</C> puts them 3% along the next baseline. Sent on, they
					accelerate again from zero the next frame. Heading for 2B, 3B or home, they slide first: once the base is 16–22 frames away (the
					same for every character), <C>running_triggerSlideOrBodyCheck</C> starts a slide that covers the rest of the baseline in equal steps,
					then a 25-frame recovery with no movement. The &quot;Straight&quot; option models a ball in the infield this way. For the batter at
					1B it treats the overrun logic as a plain stop, which is within a frame or so.
				</p>
				<p>
					<b className="text-fog-100">Scoring.</b> A runner scores on the frame they count as standing on home, at 97% of the last baseline,
					the same rule as every other base.
				</p>
			</Section>

			<section className="space-y-3">
				<div>
					<p className="kicker">8 · Full results</p>
					<h2 className="mt-1 text-2xl uppercase">Batter to 1B by speed stat</h2>
					<p className="mt-2 max-w-3xl text-sm text-fog-300">Each cell is TAS / human viable / no mashing, with the TAS time in seconds.</p>
				</div>
				<Panel>
					<Table
						head={[
							'Speed',
							...scenarios.map((s) => (
								<span key={s.key}>
									{s.label.replace(' (Mario)', '')}
									<br />
									<span className="font-sans normal-case tracking-normal text-fog-500">{s.L.toFixed(2)} m to 1B</span>
								</span>
							)),
							'Notes'
						]}
						highlight={(i) => speedNotes[SPEEDS[i]] !== undefined}
						rows={SPEEDS.map((sp, i) => [
							sp,
							...scenarios.map((s) => (
								<span key={s.key}>
									{s.tas[i]} / {s.human[i]} / {s.none[i]} <span className="text-fog-500">({framesToSeconds(s.tas[i])} s)</span>
								</span>
							)),
							<span key="note" className="whitespace-normal font-sans text-fog-300">
								{speedNotes[sp] ?? ''}
							</span>
						])}
					/>
				</Panel>
			</section>

			<section className="space-y-3">
				<div>
					<h2 className="text-2xl uppercase">Every base run by speed stat</h2>
					<p className="mt-2 max-w-3xl text-sm text-fog-300">
						Each cell is the frame the runner reaches the base, rounding / straight, with TAS mashing. Batter runs start from the middle of
						Mario&apos;s right-handed box; runners on base start from a full lead. Batter to 1B has one number because it always runs
						straight, and 3B to home is the same both ways because a runner starting on 3rd never starts rounding.{' '}
						<span className="font-semibold text-star-400">Gold</span> marks a straight run that beats rounding, by a frame or a few. It
						happens at many speeds on single-base runs (1B to 2B, 2B to 3B), and for the batter going to 2B at low speeds, because one stop
						or slide costs less than rounding&apos;s wider path. Every other run is faster rounding.
					</p>
				</div>
				<Panel>
					<Table
						head={['Speed', ...routeResults.map((r) => routeLabel(r)), 'Notes']}
						highlight={(i) => speedNotes[SPEEDS[i]] !== undefined}
						rows={SPEEDS.map((sp, i) => [
							sp,
							...routeResults.map((r) =>
								straightOnly(r) ? (
									<span key={`${r.s}${r.e}`}>{r.straight[i]}</span>
								) : (
									<span key={`${r.s}${r.e}`}>
										{r.round[i]} /{' '}
										<span className={r.straight[i] < r.round[i] ? 'font-semibold text-star-400' : undefined}>{r.straight[i]}</span>
									</span>
								)
							),
							<span key="note" className="whitespace-normal font-sans text-fog-300">
								{speedNotes[sp] ?? ''}
							</span>
						])}
					/>
				</Panel>
			</section>

			<details className="panel">
				<summary className="cursor-pointer px-4 py-3 font-display text-sm font-bold uppercase tracking-widest text-fog-300">
					Character reference: speed stat and distance to 1B
				</summary>
				<p className="border-t border-night-700 px-4 py-3 text-xs text-fog-300">
					Speed is the unstarred stat (starring adds 50). Frames to 1B use that speed from the middle of the box with TAS mashing. Distances
					are in metres; RHB and LHB are right- and left-handed batters.
				</p>
				<div className="max-h-[520px] overflow-auto border-t border-night-700">
					<Table
						head={[
							'Character',
							'Speed',
							...SIDES.map((sd) => `Frames to 1B · ${sideAbbr(sd)}`),
							...SPOT_ORDER.flatMap((sp) => SIDES.map((sd) => `${SPOT_NAMES[sp]} · ${sideAbbr(sd)}`))
						]}
						rows={BATTER_BOX.map((_, id) => [
							charName(id),
							CHARACTER_SPEED[id],
							...SIDES.map((sd) => simulateHomeToFirst(CHARACTER_SPEED[id], batterPosition(id, sd, 'center'), 'tas').frame),
							...SPOT_ORDER.flatMap((sp) => SIDES.map((sd) => legLength(batterPosition(id, sd, sp)).toFixed(2)))
						])}
					/>
				</div>
			</details>

			<Section num="Assumptions" title="What the model takes as given" refs="Model: lib/mssb/RunningSimulation/runningModel.ts">
				<ul className="list-disc space-y-1 pl-5">
					<li>
						The runner starts with full stamina, only ever runs forward, and is sent on to the next base on the earliest possible frame.
						Nobody is thrown out, tagged or forced back.
					</li>
					<li>
						&quot;Round the bases&quot; assumes the ball is far away (hit to the outfield), so only the halfway rule decides when rounding
						starts. &quot;Straight&quot; assumes the runner never rounds (ball in the infield).
					</li>
					<li>Runners on base start from a full lead. During a slide&apos;s recovery the runner is held on the base.</li>
					<li>
						Runner input, including mashing, is ignored for the first 20 frames of the live ball (10 for a high fly to the outfield):{' '}
						<C>running_liveBall</C> needs <C>framesInGameStatus ≥ liveBallInputDelayFrames</C>, and <C>SetGameStatus</C> resets that
						counter at contact. Presses only count from top speed (frame 43 at the earliest), so this never changes the results.
					</li>
					<li>
						&quot;Middle of the box&quot; is the midpoint of the character&apos;s movement ranges. The default start is the clamped{' '}
						<C>(0, 0.4)</C>.
					</li>
					<li>
						The model copies the decompiled code in single precision. The functions involved are matched, but the result is still a model.
						A frame-perfect TAS in Dolphin is the final check.
					</li>
				</ul>
			</Section>
		</div>
	);
}
