import { PanelHeader } from '@/components/ui';
import { characterAttributes, type CharacterAttributes } from '@/lib/data/characterAttributes';
import { StatBars } from './StatBars';

// Meters are scaled against the roster-wide max for each attribute, so a full
// bar always means "best in the game", not an arbitrary cap.
type NumericKey = {
	[K in keyof CharacterAttributes]: CharacterAttributes[K] extends number ? K : never;
}[keyof CharacterAttributes];

const rosterMax = new Map<NumericKey, number>();
function maxOf(key: NumericKey): number {
	let max = rosterMax.get(key);
	if (max === undefined) {
		max = Math.max(...characterAttributes.map((c) => c[key]));
		rosterMax.set(key, max);
	}
	return max;
}

const GROUPS: { title: string; rows: { label: string; key: NumericKey }[] }[] = [
	{
		title: 'Batting',
		rows: [
			{ label: 'Slap hit power', key: 'Slap Hit Power' },
			{ label: 'Charge hit power', key: 'Charge Hit Power' },
			{ label: 'Slap contact zone', key: 'Slap Contact Spot Size' },
			{ label: 'Charge contact zone', key: 'Charge Contact Spot Size' },
			{ label: 'Bunting', key: 'Bunting' }
		]
	},
	{
		title: 'Pitching',
		rows: [
			{ label: 'Fastball speed', key: 'Fast Ball Speed' },
			{ label: 'Curveball speed', key: 'Curve Ball Speed' },
			{ label: 'Curve', key: 'Curve' },
			{ label: 'Curve control', key: 'Curve Control' },
			{ label: 'Charge pitch', key: 'Cursed Ball' }
		]
	},
	{
		title: 'Speed & defense',
		rows: [
			{ label: 'Speed', key: 'Speed' },
			{ label: 'Throwing arm', key: 'Throwing Arm' },
			{ label: 'Fielding', key: 'Fielding Ability' },
			{ label: 'Weight', key: 'Weight' }
		]
	}
];

function Meter({ label, value, max }: { label: string; value: number; max: number }) {
	const width = max > 0 ? Math.max((value / max) * 100, 2) : 0;
	return (
		<div className="flex items-center gap-3 text-sm">
			<span className="w-36 shrink-0 text-fog-500">{label}</span>
			<div className="h-2 flex-1 overflow-hidden rounded-full bg-night-700">
				<div className="h-full rounded-full bg-rio-400" style={{ width: `${width}%` }} />
			</div>
			<span className="w-8 shrink-0 text-right font-display font-bold tabular-nums text-fog-100">
				{value}
			</span>
		</div>
	);
}

export function AttributeCard({ attrs }: { attrs: CharacterAttributes }) {
	return (
		<div className="panel">
			<PanelHeader title="Baseball card" />
			<div className="grid gap-x-10 gap-y-6 p-5 lg:grid-cols-2">
				<div className="space-y-2">
					<h3 className="font-display text-xs font-bold uppercase tracking-widest text-fog-500">
						Stat bars
					</h3>
					<StatBars attrs={attrs} />
					<p className="pt-1 text-xs text-fog-500">
						Meters are scaled to the best value on the roster — a full bar is best in the game.
					</p>
				</div>
				{GROUPS.map((group) => (
					<div key={group.title} className="space-y-2">
						<h3 className="font-display text-xs font-bold uppercase tracking-widest text-fog-500">
							{group.title}
						</h3>
						{group.rows.map((row) => (
							<Meter key={row.key} label={row.label} value={attrs[row.key]} max={maxOf(row.key)} />
						))}
					</div>
				))}
			</div>
		</div>
	);
}
