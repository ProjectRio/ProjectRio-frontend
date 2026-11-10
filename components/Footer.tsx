import Link from 'next/link';
import Image from 'next/image';
import ParkPicker from './ParkPicker';
import { PARK_THEMES_ENABLED } from '@/lib/parks';

const COLUMNS = [
	{
		title: 'Compete',
		links: [
			{ href: '/modes', label: 'Ranked ladders' },
			{ href: '/games/live', label: 'Live games' },
			{ href: '/games/recent', label: 'Recent games' }
		]
	},
	{
		title: 'Stats',
		links: [
			{ href: '/users', label: 'Players' },
			{ href: '/characters', label: 'Characters' },
			{ href: '/tools', label: 'Tools' }
		]
	},
	{
		title: 'Community',
		links: [
			{ href: 'https://discord.gg/c3r9PabfRU', label: 'Discord' },
			{ href: 'https://www.patreon.com/projectrio/posts', label: 'Patreon' },
			{ href: 'https://github.com/ProjectRio?tab=repositories', label: 'GitHub' }
		]
	}
];

/** The dugout: below the foul line, on the dirt. */
export default function Footer() {
	return (
		<footer className="mt-20 bg-[var(--wall)] [box-shadow:0_-3px_0_var(--track-a),0_-6px_0_var(--track-b)]">
			<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
				<div className="grid gap-10 py-10 sm:grid-cols-2 lg:grid-cols-[1.4fr_repeat(3,1fr)]">
					<div>
						<div className="flex items-center gap-2.5">
							<Image src="/images/RioLogo.png" alt="" width={28} height={28} className="[image-rendering:pixelated]" />
							<span className="font-title text-xl leading-none">
								Project <span className="text-rio-400">Rio</span>
							</span>
						</div>
						{PARK_THEMES_ENABLED && <ParkPicker />}
					</div>
					{COLUMNS.map((column) => (
						<div key={column.title}>
							<h3 className="font-display text-sm font-semibold uppercase tracking-[0.16em] text-fog-500">
								{column.title}
							</h3>
							<ul className="mt-3 space-y-1.5 font-display text-lg font-medium text-fog-300">
								{column.links.map((link) => (
									<li key={link.href}>
										{link.href.startsWith('http') ? (
											<a href={link.href} target="_blank" rel="noreferrer" className="hover:text-fog-100">
												{link.label}
											</a>
										) : (
											<Link href={link.href} className="hover:text-fog-100">
												{link.label}
											</Link>
										)}
									</li>
								))}
							</ul>
						</div>
					))}
				</div>
				<div className="chalk" />
				<p className="py-4 text-xs text-fog-500">Project Rio is a fan project and is not affiliated with Nintendo.</p>
			</div>
		</footer>
	);
}
