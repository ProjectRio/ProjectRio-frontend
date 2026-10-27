import type { Metadata } from 'next';
import MushroomField from '@/components/signup/MushroomField';
import SignupForm from '@/components/signup/SignupForm';

export const metadata: Metadata = {
	title: 'Sign Up',
	description:
		'Create your Project Rio account — online ranked Mario Superstar Baseball, live game tracking, and a stat line for every swing.'
};

// Division-I color for each ranked tier (see lib/ladder.ts).
const TIER_RAMP = [
	{ name: 'Shell', color: '#8bbf8c' },
	{ name: 'Mushroom', color: '#ff4949' },
	{ name: 'Flower', color: '#ff6700' },
	{ name: 'Star', color: '#fff25c' },
	{ name: 'Special', color: '#9d7bae' },
	{ name: 'Legend', color: '#dbb658' }
];

const FEATURES = [
	{
		title: 'Climb the ladder',
		body: 'Ranked ELO across six tiers. Everyone starts at Shell — the climb to Legend is on you.'
	},
	{
		title: 'Every pitch tracked',
		body: 'Batting, pitching, and fielding stats for you and all 54 characters, from AVG to ERA.'
	},
	{
		title: 'Games go live',
		body: 'Your games stream to the site as you play — live box scores the whole league can watch.'
	}
];

export default function SignupPage() {
	return (
		<div>
			<MushroomField />
			<div className="grid items-center gap-12 py-4 lg:grid-cols-[1.1fr_1fr] lg:gap-16 lg:py-12">
				<section>
					<p className="kicker">Join the league</p>
					<h1 className="mt-3 text-5xl uppercase leading-none sm:text-6xl">
						Step up
						<br />
						to the <span className="text-rio-500">plate.</span>
					</h1>
					<p className="mt-5 max-w-xl text-base leading-relaxed text-fog-300">
						Project Rio is competitive Mario Superstar Baseball — online ranked play, live game tracking, and deep
						stats for every player in the community. One free account puts you on the field.
					</p>

					<ul className="mt-10 space-y-7">
						{FEATURES.map((feature) => (
							<li key={feature.title} className="border-l-2 border-rio-500/60 pl-5">
								<div>
									<h3 className="text-lg uppercase tracking-wider">{feature.title}</h3>
									<p className="mt-1 max-w-md text-sm leading-relaxed text-fog-500">{feature.body}</p>
									{feature.title === 'Climb the ladder' && (
										<div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1">
											{TIER_RAMP.map((tier, i) => (
												<span key={tier.name} className="flex items-center gap-2">
													{i > 0 && <span className="text-xs text-fog-500">▸</span>}
													<span
														className="font-display text-xs font-semibold uppercase tracking-widest"
														style={{ color: tier.color }}
													>
														{tier.name}
													</span>
												</span>
											))}
										</div>
									)}
								</div>
							</li>
						))}
					</ul>
				</section>

				<SignupForm />
			</div>
		</div>
	);
}
