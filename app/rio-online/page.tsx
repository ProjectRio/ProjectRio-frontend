import Link from 'next/link';
import Image from 'next/image';
import { PageHeader, Panel, PanelHeader } from '@/components/ui';

export const metadata = { title: 'Rio Online' };
export const revalidate = 3600;

async function getLatestVersion(): Promise<string | null> {
	try {
		const response = await fetch('https://github.com/ProjectRio/ProjectRio/releases/latest', {
			redirect: 'follow',
			next: { revalidate: 3600 }
		});
		const url = response.url;
		return url.substring(url.lastIndexOf('/') + 1) || null;
	} catch {
		return null;
	}
}

const FEATURES = [
	'Optimized online play',
	'Game stat files',
	'Ranked online ladders',
	'Public stat database',
	'Gameplay mods'
];

const RESOURCES = [
	{ href: 'https://roeming.github.io/MSSB_Batting_Calculator/', label: "Roeming's Batting Calculator" },
	{
		href: 'https://docs.google.com/spreadsheets/d/16cEcCq-Gkudx5ESfqzS0MJlQI7WTvSIWsHVZS8jv750/edit?usp=sharing',
		label: 'Datamined Stats & Info'
	},
	{
		href: 'https://www.reddit.com/r/MarioBaseball/comments/rohg6j/competitive_mario_superstar_baseball_the_master/',
		label: 'Competitive Guide'
	},
	{
		href: 'https://docs.google.com/spreadsheets/d/13zijF8WoYxB3Z4GQRI7wFH6GMEkEqY_CaUQhd-WJQ2M/edit#gid=1510496567',
		label: "Neil's Stat Cards"
	},
	{ href: 'https://pastebin.com/cPBAFkKf', label: 'Gecko Codes' },
	{ href: 'https://www.youtube.com/c/DingerCity', label: 'Dinger City YouTube' },
	{
		href: 'https://www.youtube.com/playlist?list=PL8i4ehYol9H0TNb9NrSSP_agA9_OJfe7Y',
		label: "Joe Baseball's Basics Series"
	}
];

export default async function RioOnlinePage() {
	const latest = await getLatestVersion();

	return (
		<div className="space-y-10">
			<section className="panel relative overflow-hidden p-10 text-center">
				<div className="relative">
					<Image src="/images/RioLogo.png" alt="" width={72} height={72} className="mx-auto [image-rendering:pixelated]" />
					<h1 className="mt-4 text-4xl">Play Online with Project Rio</h1>
					<p className="mx-auto mt-3 max-w-xl text-fog-300">
						Project Rio is a custom Dolphin build tuned for competitive Mario Superstar Baseball — netplay
						optimizations, ranked play, and automatic stat tracking.
					</p>
					<div className="mt-6 flex flex-wrap justify-center gap-4">
						<a
							href="https://github.com/ProjectRio/ProjectRio/releases/latest"
							target="_blank"
							rel="noreferrer"
							className="btn-primary"
						>
							Download {latest ?? 'Project Rio'}
						</a>
						<a href="https://api.projectrio.app/signup/" target="_blank" rel="noreferrer" className="btn-secondary">
							Create an Account
						</a>
						<Link href="/rio-online/tutorial" className="btn-secondary">
							Setup Tutorial
						</Link>
					</div>
				</div>
			</section>

			<div className="grid gap-6 md:grid-cols-2">
				<Panel>
					<PanelHeader title="What you get" />
					<ul className="space-y-2 px-5 py-4 text-sm text-fog-300">
						{FEATURES.map((feature) => (
							<li key={feature} className="flex items-center gap-2">
								<span className="text-star-400">▸</span> {feature}
							</li>
						))}
					</ul>
				</Panel>
				<Panel>
					<PanelHeader title="Other resources" />
					<ul className="space-y-2 px-5 py-4 text-sm">
						{RESOURCES.map((resource) => (
							<li key={resource.href}>
								<a
									href={resource.href}
									target="_blank"
									rel="noreferrer"
									className="text-fog-300 hover:text-fog-100"
								>
									{resource.label} ↗
								</a>
							</li>
						))}
					</ul>
				</Panel>
			</div>
		</div>
	);
}
