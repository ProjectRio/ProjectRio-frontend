'use client';

import { useMemo, useState } from 'react';
import PitchPlot from '@/components/PitchPlot';
import * as c from '@/lib/mssb/PitchSimulation/pitchingConstants';
import { PageHeader, Panel, PanelHeader } from '@/components/ui';

function OnOff({ id, value, onChange }: { id: string; value: boolean; onChange: (next: boolean) => void }) {
	return (
		<div className="seg" role="group" aria-labelledby={id}>
			<button type="button" aria-pressed={!value} onClick={() => onChange(false)}>
				Off
			</button>
			<button type="button" aria-pressed={value} onClick={() => onChange(true)}>
				On
			</button>
		</div>
	);
}

/*
 * The CPU pitcher is ported from the pitchSimulator branch as its author left
 * it: it runs, but the pitch-type constants are still zero and the curve
 * target is never updated, so it does not yet pitch the way the game does.
 * The switch is shown in development only until that is finished; set this
 * to true to publish it.
 */
const SHOW_CPU_PITCHER = process.env.NODE_ENV !== 'production';

export default function PitchCalculatorPage() {
	const [pitcherXOnMound, setPitcherXOnMound] = useState(0);
	const [pitcherId, setPitcherId] = useState(0);
	const [handedness, setHandedness] = useState(0);
	const [pitchType, setPitchType] = useState(0);
	const [pitchCharge, setPitchCharge] = useState(0);
	const [pitchCurve, setPitchCurve] = useState('2'); // 1=left, 2=straight, 3=right per frame
	const [stamina, setStamina] = useState(10);
	const [superstar, setSuperstar] = useState(false);
	const [cpuPitcher, setCpuPitcher] = useState(false);

	const pitchInputs = useMemo(() => {
		const constants: any = c;
		const release = constants.pitchBaseReleaseCoordinates[constants.charIDNoDupMapping[pitcherId]];
		const usesCharge = pitchType === 1 || pitchType === 2 || pitchType === 3;
		const base = usesCharge ? release.charge : release.curve;
		let startX = handedness === 1 ? -base.X : base.X;
		startX += pitcherXOnMound;

		const curveArray = String(pitchCurve)
			.split('')
			.map((value) => (value === '1' ? -1 : value === '3' ? 1 : 0));

		return {
			chargeUp: pitchCharge,
			curveInput: curveArray,
			pitchType,
			pitcher_id: pitcherId,
			pitcherStarsOn: superstar,
			cpuPitcher,
			pitcherHandedness: handedness,
			pitcherXOnMound,
			pitchStartingX: startX,
			pitchStartingY: base.Y,
			pitchStartingZ: base.Z,
			pitcherStamina: stamina,
			batter_id: 21,
			batZ: 1.7
		};
	}, [pitcherXOnMound, pitcherId, handedness, pitchType, pitchCharge, pitchCurve, stamina, superstar, cpuPitcher]);

	const charIDMapping: { [key: string]: string } = (c as any).charIDMapping;

	return (
		<div className="space-y-6">
			<PageHeader kicker="Tools" title="Pitch Calculator" />
			<div className="grid gap-6 lg:grid-cols-[auto_1fr]">
				<Panel className="p-4">
					<PitchPlot pitchInputs={pitchInputs} height={750} />
				</Panel>

				<Panel className="h-fit">
					<PanelHeader title="Pitch Inputs" />
					<div className="space-y-4 p-5">
						<div>
							<label className="label" htmlFor="pitcher">
								Pitcher
							</label>
							<select
								id="pitcher"
								className="input"
								value={pitcherId}
								onChange={(event) => setPitcherId(Number(event.target.value))}
							>
								{Object.entries(charIDMapping).map(([id, name]) => (
									<option key={id} value={id}>
										{name}
									</option>
								))}
							</select>
						</div>
						<div>
							<span className="label" id="superstar">
								Pitcher superstar
							</span>
							<OnOff id="superstar" value={superstar} onChange={setSuperstar} />
						</div>
						<div>
							<label className="label" htmlFor="handedness">
								Handedness
							</label>
							<select
								id="handedness"
								className="input"
								value={handedness}
								onChange={(event) => setHandedness(Number(event.target.value))}
							>
								<option value={0}>Righty</option>
								<option value={1}>Lefty</option>
							</select>
						</div>
						{SHOW_CPU_PITCHER && (
							<div>
								<span className="label" id="cpuPitcher">
									CPU pitcher
								</span>
								<OnOff id="cpuPitcher" value={cpuPitcher} onChange={setCpuPitcher} />
								{cpuPitcher && (
									<p className="mt-2 text-xs text-fog-500">
										Experimental: the CPU picks the pitch type, charge and curve, and rerolls on every input change.
									</p>
								)}
							</div>
						)}
						<div>
							<label className="label" htmlFor="pitchType">
								Pitch Type
							</label>
							<select
								id="pitchType"
								disabled={cpuPitcher}
								className="input disabled:opacity-50"
								value={pitchType}
								onChange={(event) => setPitchType(Number(event.target.value))}
							>
								<option value={0}>Curve</option>
								<option value={1}>Charge</option>
								<option value={2}>Perfect Charge</option>
								<option value={3}>Change Up</option>
								<option value={4}>Star</option>
							</select>
						</div>
						<div>
							<label className="label" htmlFor="targetX">
								Target X Coordinate
							</label>
							<input
								id="targetX"
								type="number"
								className="input"
								step={0.01}
								min={-0.4}
								max={0.4}
								value={pitcherXOnMound}
								onChange={(event) => setPitcherXOnMound(Number(event.target.value))}
							/>
						</div>
						<div>
							<label className="label" htmlFor="charge">
								Pitch Charge (0–1)
							</label>
							<input
								id="charge"
								disabled={cpuPitcher}
								type="number"
								className="input disabled:opacity-50"
								step={0.01}
								min={0}
								max={1}
								value={pitchCharge}
								onChange={(event) => setPitchCharge(Number(event.target.value))}
							/>
						</div>
						<div>
							<label className="label" htmlFor="curve">
								Pitch Curve (1=left, 2=straight, 3=right)
							</label>
							<input
								id="curve"
								disabled={cpuPitcher}
								className="input disabled:opacity-50"
								value={pitchCurve}
								onChange={(event) => setPitchCurve(event.target.value)}
							/>
						</div>
						<div>
							<label className="label" htmlFor="stamina">
								Pitcher Stamina (1–10)
							</label>
							<input
								id="stamina"
								type="number"
								className="input"
								step={1}
								min={1}
								max={10}
								value={stamina}
								onChange={(event) => setStamina(Number(event.target.value))}
							/>
						</div>
						<p className="text-xs text-fog-500">
							Hover any point on the trajectory to inspect per-frame coordinates, velocity, and curve input.
						</p>
					</div>
				</Panel>
			</div>
		</div>
	);
}
