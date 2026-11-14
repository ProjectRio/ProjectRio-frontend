'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FOOTER_GROUPS, SOCIAL_LINKS } from '@/lib/siteMap';

/**
 * The dugout: below the field, on the dirt. The header opens one section at
 * a time; this is the whole map laid flat (lib/siteMap.ts).
 */
export default function Footer() {
	// The landing page runs wider than the reading column, and its footer lines up with it.
	const home = usePathname() === '/';
	return (
		<footer className="mt-20 bg-[var(--wall)] [box-shadow:0_-3px_0_var(--track-a),0_-6px_0_var(--track-b)]">
			<div className={`mx-auto py-10 ${home ? 'max-w-[1480px] px-5 sm:px-8 lg:px-12' : 'max-w-7xl px-4 sm:px-6 lg:px-8'}`}>
				<nav aria-label="Site map" className="grid grid-cols-2 gap-x-8 gap-y-8 sm:grid-cols-3 lg:grid-cols-6">
					{FOOTER_GROUPS.map((group) => (
						<div key={group.title}>
							<h3 className="text-base text-fog-500">{group.title}</h3>
							<ul className="mt-2.5 space-y-1.5 font-display text-[1.05rem] font-medium leading-tight text-fog-300">
								{group.links.map((link) => (
									<li key={link.href}>
										{link.href.startsWith('http') ? (
											<a href={link.href} target="_blank" rel="noreferrer" className="transition-colors hover:text-fog-100">
												{link.label}
											</a>
										) : (
											<Link href={link.href} className="transition-colors hover:text-fog-100">
												{link.label}
											</Link>
										)}
									</li>
								))}
							</ul>
						</div>
					))}
				</nav>

				<div className="mt-10 flex flex-wrap items-center justify-between gap-x-10 gap-y-4">
					<div className="flex flex-wrap items-center gap-x-5 gap-y-2">
						<Link href="/" className="flex w-fit items-center gap-2.5">
							{/* eslint-disable-next-line @next/next/no-img-element */}
							<img src="/images/RioMark.svg" alt="" width={32} height={32} />
							<span className="font-title text-xl leading-none">
								Project <span className="text-rio-400">Rio</span>
							</span>
						</Link>
						<p className="text-sm text-fog-500">A fan project, not affiliated with Nintendo.</p>
					</div>
					<ul className="flex gap-6 font-display text-[1.05rem] font-medium text-fog-300">
						{SOCIAL_LINKS.map((link) => (
							<li key={link.href}>
								<a href={link.href} target="_blank" rel="noreferrer" className="transition-colors hover:text-fog-100">
									{link.label}
								</a>
							</li>
						))}
					</ul>
				</div>
			</div>
		</footer>
	);
}
