import TabSection, { Placeholder } from '@/components/running/TabSection';
import BatterBoxDiagram from '@/components/running/BatterBoxDiagram';
import AccelerationChart from '@/components/running/AccelerationChart';
import RunningCalculator from '@/components/running/RunningCalculator';
import { Panel, PanelHeader } from '@/components/ui';
import { CHARACTER_SPEED, SUPERSTAR_SPEED_BONUS } from '@/lib/mssb/RunningSimulation/runningConstants';

const YOSHI = 6;
/** Same comparison as the Full Analysis tab: slowest stat, Mario, fastest unstarred, and starred Yoshi. */
const ACCEL_SERIES = [
	Math.min(...CHARACTER_SPEED),
	CHARACTER_SPEED[0],
	Math.max(...CHARACTER_SPEED),
	CHARACTER_SPEED[YOSHI] + SUPERSTAR_SPEED_BONUS
].map((speed) => ({ speed, label: `Speed ${speed}` }));

/** The "Running to 1B" tab of the running analysis page. */
export default function RunningToFirstTab() {
	return (
		<div className="space-y-8">
			<TabSection title="Starting Position">
				<p>For the batter, baserunning starts from where the batter was standing when they made contact with the ball.
					The batter's range in the box depends on the character's individual hitboxes, but at the most extremes, King Boo has the theoretical shortest path to first at 24.44m from the front corner of the left-handed batter's box, 
					while Bowser has the longest distance when in the back corner of the right-handed batters box at 30.64m.
				</p>
				<BatterBoxDiagram />
			</TabSection>

			<TabSection title="Getting Up to Speed">
				<p>After making contact, players remain in the batters box for 30 frames, or 0.5s </p>
				<p>Once running, the character will accelerate until they reach top speed. Faster characters have worse acceleration than slower characters, which means slower characters move faster initially before the faster ones catch up.</p>
				<AccelerationChart series={ACCEL_SERIES} />
			</TabSection>

			<TabSection title="Reaching 1B">
				<p>Once top speed is reached, both the mashing bonus and the stamina penalty on the top speed can be started.</p>
				<p>A TAS-perfect mash can enable the boost after 5 frames using different buttons for each mash, since the game doesn't require a non-mash frame between recognizing a new input.
					A more human-viable mash rate can be once every 3 frames, which is comparable to the world-record mash rate of 20.1 presses per second sustained over 1 minute. This would get the character the maximum bonus after [x] frames.
					The difference is about 0.08m, which is less than half a frame of movement, so it rarely changes the actual time to first base.
				</p>
				<p>Stamina starts decaying after reaching a speed of [y]m/s, but only applies to top speed once the character finishes accelerating.
					Over the distance to 1B, the stamina penalty is negligible at about 1% off of top speed by the time they reach first base.
				</p>
				<p>The game considers a runner to have reached 1B once they get to 97% of way to 1B. This seems like it is to account for the witdh of the base.</p>
			</TabSection>

			<Panel>
				<PanelHeader title="Time to 1B Calculator" />
				<RunningCalculator firstBaseOnly />
			</Panel>

			<TabSection title="Overrunning 1B">
				<Placeholder />
			</TabSection>
		</div>
	);
}
