// Cumulative run "worm" across innings, built from the linescore.
// Pure SVG — no chart library.

import { Panel, PanelHeader } from '@/components/ui';

const AWAY_COLOR = '#4f9dff';
const HOME_COLOR = '#f43f5e';

function cumulative(runs: (number | 'X')[]): number[] {
	const totals: number[] = [0];
	let sum = 0;
	for (const r of runs) {
		sum += typeof r === 'number' ? r : 0;
		totals.push(sum);
	}
	return totals;
}

export default function RunFlow({
	linescore,
	awayUser,
	homeUser
}: {
	linescore: [(number | 'X')[], (number | 'X')[]];
	awayUser: string;
	homeUser: string;
}) {
	const [awayRuns, homeRuns] = linescore;
	const away = cumulative(awayRuns);
	const home = cumulative(homeRuns);
	const innings = Math.max(away.length, home.length) - 1;
	if (innings <= 0) return null;

	const W = 560;
	const H = 180;
	const PAD = { l: 28, r: 14, t: 14, b: 24 };
	const maxRuns = Math.max(1, away[away.length - 1], home[home.length - 1]);

	const x = (i: number) => PAD.l + (i / innings) * (W - PAD.l - PAD.r);
	const y = (runs: number) => H - PAD.b - (runs / maxRuns) * (H - PAD.t - PAD.b);

	const stepPath = (totals: number[]) => {
		let d = `M ${x(0)} ${y(totals[0])}`;
		for (let i = 1; i < totals.length; i++) {
			d += ` L ${x(i)} ${y(totals[i - 1])} L ${x(i)} ${y(totals[i])}`;
		}
		return d;
	};

	const gridRuns: number[] = [];
	const step = maxRuns <= 6 ? 1 : Math.ceil(maxRuns / 5);
	for (let r = 0; r <= maxRuns; r += step) gridRuns.push(r);

	return (
		<Panel>
			<PanelHeader
				title="Run Flow"
				action={
					<span className="flex items-center gap-3 text-xs text-fog-300">
						<span className="flex items-center gap-1.5">
							<span className="h-0.5 w-4" style={{ backgroundColor: AWAY_COLOR }} /> {awayUser}
						</span>
						<span className="flex items-center gap-1.5">
							<span className="h-0.5 w-4" style={{ backgroundColor: HOME_COLOR }} /> {homeUser}
						</span>
					</span>
				}
			/>
			<div className="px-2 py-3">
				<svg viewBox={`0 0 ${W} ${H}`} className="w-full">
					{gridRuns.map((r) => (
						<g key={r}>
							<line x1={PAD.l} x2={W - PAD.r} y1={y(r)} y2={y(r)} stroke="#1f1f30" strokeWidth="1" />
							<text x={PAD.l - 6} y={y(r) + 3} textAnchor="end" fontSize="9" fill="#8f8fa3">
								{r}
							</text>
						</g>
					))}
					{Array.from({ length: innings }, (_, i) => i + 1).map((i) => (
						<text key={i} x={x(i)} y={H - 8} textAnchor="middle" fontSize="9" fill="#8f8fa3">
							{i}
						</text>
					))}

					<path d={stepPath(away)} fill="none" stroke={AWAY_COLOR} strokeWidth="2.5" strokeLinejoin="round" />
					<path d={stepPath(home)} fill="none" stroke={HOME_COLOR} strokeWidth="2.5" strokeLinejoin="round" />

					{away.map((r, i) =>
						i > 0 && typeof awayRuns[i - 1] === 'number' && (awayRuns[i - 1] as number) > 0 ? (
							<circle key={`a${i}`} cx={x(i)} cy={y(r)} r="3" fill={AWAY_COLOR} />
						) : null
					)}
					{home.map((r, i) =>
						i > 0 && typeof homeRuns[i - 1] === 'number' && (homeRuns[i - 1] as number) > 0 ? (
							<circle key={`h${i}`} cx={x(i)} cy={y(r)} r="3" fill={HOME_COLOR} />
						) : null
					)}
				</svg>
			</div>
		</Panel>
	);
}
