import Link from 'next/link';
import Image from 'next/image';
import LatestGames from '@/components/LatestGames';

const FEATURES = [
	{
		href: '/modes',
		title: 'Ranked Ladders',
		description: 'Climb from Shell to Legend in seasonal ranked play with full ELO tracking.'
	},
	{
		href: '/users',
		title: 'Player Stats',
		description: 'Every at-bat and every pitch recorded. Batting, pitching, and matchup history.'
	},
	{
		href: '/characters',
		title: 'Character Stats',
		description: 'Community-wide performance for all 54 characters — find your roster edge.'
	},
	{
		href: '/tools',
		title: 'Tools & Visualizers',
		description: 'Pitch trajectory calculator, stream overlays, and more for players and casters.'
	}
];

export default function HomePage() {
	return (
		<div className="space-y-16">
			{/* Hero */}
			<section className="relative overflow-hidden rounded-2xl border border-night-700 bg-night-900 px-6 py-16 text-center sm:py-24">
				<div
					className="pointer-events-none absolute inset-0"
					style={{
						backgroundImage:
							'radial-gradient(ellipse 60% 70% at 50% -10%, rgb(230 0 18 / 0.25), transparent), repeating-linear-gradient(135deg, transparent 0 40px, rgb(255 255 255 / 0.015) 40px 41px)'
					}}
				/>
				<div className="relative mx-auto max-w-3xl">
					<Image
						src="/images/RioLogo.png"
						alt=""
						width={96}
						height={96}
						className="mx-auto [image-rendering:pixelated]"
						priority
					/>
					<h1 className="mt-6 text-5xl uppercase leading-tight sm:text-6xl">
						Competitive <span className="text-rio-500">Mario Superstar Baseball</span>
					</h1>
					<p className="mx-auto mt-4 max-w-xl text-lg text-fog-300">
						Online ranked play, live game tracking, and deep stats for the Mario Superstar Baseball
						community — powered by Project Rio.
					</p>
					<div className="mt-8 flex flex-wrap justify-center gap-4">
						<a href="https://www.projectrio.online/" target="_blank" rel="noreferrer" className="btn-primary">
							Get Project Rio
						</a>
						<Link href="/modes" className="btn-secondary">
							View Ladders
						</Link>
						<Link href="/games/live" className="btn-secondary">
							Watch Live
						</Link>
					</div>
				</div>
			</section>

			{/* Recent games */}
			<section>
				<div className="mb-6 flex items-end justify-between">
					<div>
						<p className="kicker">Around the league</p>
						<h2 className="mt-1 text-3xl uppercase">Latest Games</h2>
					</div>
					<Link
						href="/games/recent"
						className="font-display text-sm font-semibold uppercase tracking-wider text-rio-400 hover:text-rio-300"
					>
						All Games →
					</Link>
				</div>
				<LatestGames count={6} />
			</section>

			{/* Feature links */}
			<section>
				<p className="kicker">Everything tracked</p>
				<h2 className="mb-6 mt-1 text-3xl uppercase">Explore Project Rio</h2>
				<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
					{FEATURES.map((feature) => (
						<Link key={feature.href} href={feature.href} className="panel panel-glow block p-5">
							<h3 className="font-display text-lg font-bold uppercase tracking-wide text-fog-100">
								{feature.title}
							</h3>
							<p className="mt-2 text-sm text-fog-500">{feature.description}</p>
							<span className="mt-4 inline-block font-display text-xs font-semibold uppercase tracking-wider text-rio-400">
								Open →
							</span>
						</Link>
					))}
				</div>
			</section>

			{/* Community CTA */}
			<section className="panel relative overflow-hidden p-8 text-center sm:p-12">
				<div
					className="pointer-events-none absolute inset-0"
					style={{ backgroundImage: 'radial-gradient(ellipse 50% 80% at 50% 120%, rgb(245 187 0 / 0.08), transparent)' }}
				/>
				<div className="relative">
					<p className="kicker">Join the community</p>
					<h2 className="mt-1 text-3xl uppercase">Leagues, tournaments, and pick-up games</h2>
					<p className="mx-auto mt-3 max-w-xl text-fog-300">
						Find opponents in the Discord, join a community league, or create your own game mode for your
						crew.
					</p>
					<div className="mt-6 flex flex-wrap justify-center gap-4">
						<a href="https://discord.gg/c3r9PabfRU" target="_blank" rel="noreferrer" className="btn-primary">
							Join the Discord
						</a>
						<Link href="/communities" className="btn-secondary">
							Browse Communities
						</Link>
					</div>
				</div>
			</section>
		</div>
	);
}
