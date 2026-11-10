// Lead tracker: who was ahead, by how much, after every half-inning.
// One column per half; columns rise above the tie line for the away side and
// drop below it for the home side, so lead changes and big innings read at a
// glance. Built from the linescore. Pure SVG — no chart library.

import { Panel, PanelHeader } from '@/components/ui';

const AWAY_COLOR = 'var(--color-series-1)';
const HOME_COLOR = 'var(--color-series-2)';

interface Half {
	inning: number;
	/** 0 = top (away bats), 1 = bottom (home bats). */
	side: 0 | 1;
	scored: number;
	/** Away minus home once this half is over. */
	diff: number;
}

function halves(away: (number | 'X')[], home: (number | 'X')[]): Half[] {
	const out: Half[] = [];
	let diff = 0;
	const innings = Math.max(away.length, home.length);
	for (let i = 0; i < innings; i++) {
		const top = away[i];
		if (typeof top === 'number') {
			diff += top;
			out.push({ inning: i + 1, side: 0, scored: top, diff });
		}
		const bottom = home[i];
		if (typeof bottom === 'number') {
			diff -= bottom;
			out.push({ inning: i + 1, side: 1, scored: bottom, diff });
		}
	}
	return out;
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
	const data = halves(linescore[0], linescore[1]);
	if (data.length === 0) return null;
	const innings = data[data.length - 1].inning;

	const W = 560;
	const H = 230;
	const PAD = { l: 30, r: 10, t: 30, b: 30 };
	const plotW = W - PAD.l - PAD.r;
	const mid = PAD.t + (H - PAD.t - PAD.b) / 2;
	const reach = Math.max(2, ...data.map((d) => Math.abs(d.diff)));
	// One run of headroom either side keeps the +N labels clear of the axis.
	const unit = (H - PAD.t - PAD.b) / 2 / (reach + 1);
	const colW = plotW / (innings * 2);
	const x = (d: Half) => PAD.l + ((d.inning - 1) * 2 + d.side) * colW;

	const step = reach <= 4 ? 1 : reach <= 8 ? 2 : Math.ceil(reach / 4);
	const ticks: number[] = [];
	for (let v = step; v <= reach; v += step) ticks.push(v);

	return (
		<Panel>
			<PanelHeader title="Lead by half-inning" />
			<div className="px-2 py-3">
				<svg viewBox={`0 0 ${W} ${H}`} className="chart w-full" role="img" aria-label="Run lead after each half-inning">
					{/* Inning bands */}
					{Array.from({ length: innings }, (_, i) => (
						<g key={i}>
							{i % 2 === 1 && (
								<rect
									x={PAD.l + i * 2 * colW}
									y={PAD.t}
									width={colW * 2}
									height={H - PAD.t - PAD.b}
									fill="rgb(247 243 232 / 0.035)"
								/>
							)}
							<text x={PAD.l + (i * 2 + 1) * colW} y={H - 10} textAnchor="middle">
								{i + 1}
							</text>
						</g>
					))}

					{/* Lead gridlines, mirrored either side of the tie line */}
					{ticks.map((v) => (
						<g key={v}>
							<line className="grid" x1={PAD.l} x2={W - PAD.r} y1={mid - v * unit} y2={mid - v * unit} />
							<line className="grid" x1={PAD.l} x2={W - PAD.r} y1={mid + v * unit} y2={mid + v * unit} />
							<text x={PAD.l - 6} y={mid - v * unit + 4} textAnchor="end">
								{v}
							</text>
							<text x={PAD.l - 6} y={mid + v * unit + 4} textAnchor="end">
								{v}
							</text>
						</g>
					))}

					{/* Lead columns */}
					{data.map((d, i) => {
						if (d.diff === 0) return null;
						const h = Math.abs(d.diff) * unit;
						return (
							<rect
								key={i}
								x={x(d)}
								y={d.diff > 0 ? mid - h : mid}
								width={colW + 0.5}
								height={h}
								fill={d.diff > 0 ? AWAY_COLOR : HOME_COLOR}
							>
								<title>
									{`${d.side === 0 ? 'Top' : 'Bottom'} ${d.inning}: ${
										d.diff > 0 ? awayUser : homeUser
									} by ${Math.abs(d.diff)}`}
								</title>
							</rect>
						);
					})}

					{/* Runs scored in the half, on the scoring side of the line */}
					{data.map((d, i) => {
						if (d.scored === 0) return null;
						const towardAway = d.side === 0;
						const edge = d.diff > 0 === towardAway ? Math.abs(d.diff) * unit : 0;
						return (
							<text
								key={i}
								x={x(d) + colW / 2}
								y={towardAway ? mid - edge - 5 : mid + edge + 13}
								textAnchor="middle"
								style={{ fill: towardAway ? AWAY_COLOR : HOME_COLOR, fontWeight: 600, fontSize: 12 }}
							>
								+{d.scored}
							</text>
						);
					})}

					{/* Tie line — chalk */}
					<line x1={PAD.l} x2={W - PAD.r} y1={mid} y2={mid} stroke="rgb(247 243 232 / 0.82)" strokeWidth="2" />

					{/* Sides */}
					<text x={PAD.l} y={14} style={{ fill: AWAY_COLOR, fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 13 }}>
						{awayUser} ahead ↑
					</text>
					<text
						x={W - PAD.r}
						y={14}
						textAnchor="end"
						style={{ fill: HOME_COLOR, fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 13 }}
					>
						↓ {homeUser} ahead
					</text>
				</svg>
			</div>
		</Panel>
	);
}
