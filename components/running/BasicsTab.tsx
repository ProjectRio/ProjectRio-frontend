import TabSection from '@/components/running/TabSection';
import TopSpeedChart from '@/components/running/TopSpeedChart';
import { characters } from '@/lib/data/characters';
import { batterPosition, simulateHomeToFirst, speedConstants } from '@/lib/mssb/RunningSimulation/runningModel';
import { BATTER_RUN_DELAY_FRAMES, CHARACTER_SPEED, SPEED_STAT_CAP } from '@/lib/mssb/RunningSimulation/runningConstants';


const FPS = 60;
const SPEED_ROWS = Array.from({ length: SPEED_STAT_CAP / 10 + 1 }, (_, i) => i * 10);
/** Notes shown after the list of characters with that regular speed stat (alone when no character has it). */
const ROW_NOTES: Record<number, string> = {
	0: 'Faster than the slowest MLB players (~7.3 m/s)',
	20: 'MLB average',
	90: 'Fastest MLB players',
	140: 'Superstarred Yoshi, Toadette',
	[SPEED_STAT_CAP]: "The game's speed cap"
};

/**
 * Frames of movement until the runner first hits the velocity cap (the frame mashing starts to count), from a standing
 * start. Uses the full batter model, so stamina is included: it lowers the cap slightly and saves a frame at a few stats.
 * The batter's first moving frame is frame BATTER_RUN_DELAY_FRAMES after contact.
 */
function framesToTopSpeed(speed: number) {
	const top = simulateHomeToFirst(speed, batterPosition(0, 'R', 'center'), 'none').topFrame ?? 0;
	return top - BATTER_RUN_DELAY_FRAMES + 1;
}

function charactersWithSpeed(speed: number) {
	return CHARACTER_SPEED.flatMap((s, id) => (s === speed ? [characters[String(id)]] : [])).join(', ');
}

/** Top speed and acceleration for every speed stat the game accepts, converted from per-frame units at 60 fps. */
function SpeedTable() {
	return (
		<div className="overflow-x-auto rounded-lg border border-night-700">
			<table className="stat-table">
				<thead>
					<tr>
						<th>Speed stat</th>
						<th>Top speed (m/s)</th>
						<th>Acceleration (m/s²)</th>
						<th>Time to top speed</th>
						<th>Characters</th>
					</tr>
				</thead>
				<tbody>
					{SPEED_ROWS.map((speed) => {
						const k = speedConstants(speed);
						return (
							<tr key={speed}>
								<td className="font-mono tabular-nums">{speed}</td>
								<td className="font-mono tabular-nums">{(k.maxV * FPS).toFixed(2)}</td>
								<td className="font-mono tabular-nums">{(k.accel * FPS * FPS).toFixed(1)}</td>
								<td className="font-mono tabular-nums">
									{framesToTopSpeed(speed)} frames <span className="text-fog-500">({(framesToTopSpeed(speed) / FPS).toFixed(2)} s)</span>
								</td>
								<td className="whitespace-normal">
									{charactersWithSpeed(speed)}
									{charactersWithSpeed(speed) && ROW_NOTES[speed] ? ' · ' : ''}
									{ROW_NOTES[speed] && <span className="text-fog-500">{ROW_NOTES[speed]}</span>}
								</td>
							</tr>
						);
					})}
				</tbody>
			</table>
		</div>
	);
}

/** The "Basics" tab of the running analysis page. Write each section's text inside its <TabSection>. */
export default function BasicsTab() {
	return (
		<div className="space-y-8">
			<TabSection title="Running Speed">
				<p>Each character has a running speed stat that determines their top speed.
					Characters are assigned stats in multiples of 10, but the game accepts values in between and uses linear interpolation when mapping to the top speed.
					When a character is superstarred, they get 50 added to their regular speed stat. 
				</p>
				<p>The mapping between the stat and the top speed is not linear, and generally gets faster in the higher ranges.
					Within the 10 to 60 stat range, speed only increases by 0.12m/s for every 10 points, while
					it increases by 0.18m/s in the 60 to 110 range, 0.24m/s for 120 and 130, and finally 0.30m/s
					to get to the 140 speed-stat, which is the highest value used in the game for superstarred Yoshi and Toadette.
				</p>
				<p>The speed stat also affects the character's acceleration. Counterintuitively, faster characters accelerate slower than slower ones.
					Therefore, it takes longer for faster characters to reach their top speed (see the table below. Note, time to top speed also accounts for stamina).  However, their top speed more than makes up for the initial slowness off the line.
				</p>
				<SpeedTable />
				<TopSpeedChart />
			</TabSection>

			<TabSection title="Sprinting">
				<p>Mashing A, B, X, or Y on the controller increases the character's top speed by up to 1.2m/s.
					It takes 5 mashes to reach the maximum bonus, so each mash adds 20% of that bonus.
					The game holds the current sprint bonus for 6 frames before decreasing by 5% per frame, so one press every 7 frames is enough to keep the bonus at 100%.
					Therefore, filling the meter quickly is more important than maintaining the meter, since a late maintenance press can quickly get back to 100%.
					</p>
				<p>Mash inputs only count when the control stick is neutral, and only after the character has reached their top speed, which takes longer for higher-speed characters.
					The game counts any new input each frame, so the last button pressed does not need to be released before pressing a new one.
					This means that it only takes 5 frames to achieve the maximum bonus if you use different buttons for each mash.
				</p>
				<p>The maximum sprint bonus (1.2m/s) is worth more than the gap between 10 and 90 speed (1.14m/s).</p>
			</TabSection>

			<TabSection title="Stamina">
				<p>Each baserunner tracks their stamina, and as they get tired, decreases their top speed and accelerations.
					The stamina value starts at 4000 for each play. For every frame running faster than 6m/s (roughly after 10-20 frames of movement), the character loses 1 point of stamina.
					This minimum means faster players tire out a little less since they take longer to reach 6m/s due to their worse acceleration.
					Interestingly, this only applies in the forwards direction, so running backwards doesn't tire out the character.
					While changing direction, stamina is reduced by an extra 3 points per frame.
				</p>
				<p>The penalties for low stamina are up to 30% for top speed, and 50% for acceleration.
					These penalties are applied linearly by multiplying top speed/acceleration by this factor: 1 - [max penalty] * (1 - stamina / 4000).
				</p>
				<p>The sprint bonus is not impacted by stamina since it is applied after the stamina reduces the top speed.</p>
			</TabSection>

			<TabSection title="Running Calculation">
				<p>Very generally, the baserunner velocity is generally calculated as follows.
				</p>
				<p>New Velocity = min(Old Velocity + Acceleration * Acceleration Stamina Penalty, Top Speed * Speed Stamina Penalty + Sprint Bonus)</p>
				<p>When getting up to speed, the acceleration is directly added to the current velocity.</p>
				<p>At top speed, the sprint bonus can start to kick in.</p>
				<p>Stamina penalties apply to the acceleration and top speed only.</p>
			</TabSection>
		</div>
	);
}
