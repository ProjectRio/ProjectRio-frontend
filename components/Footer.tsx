'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FOOTER_GROUPS } from '@/lib/siteMap';

/**
 * The dugout: below the field, on the dirt. The header says where the
 * sections are; this lists what sits a level below them (lib/siteMap.ts).
 */
export default function Footer() {
	// The landing page runs wider than the reading column, and its footer lines up with it.
	const home = usePathname() === '/';
	return (
		<footer className="mt-20 bg-[var(--wall)] [box-shadow:0_-3px_0_var(--track-a),0_-6px_0_var(--track-b)]">
			<div
				className={`mx-auto grid gap-x-10 gap-y-8 py-10 sm:grid-cols-3 lg:grid-cols-[1.5fr_repeat(3,1fr)] ${
					home ? 'max-w-[1480px] px-5 sm:px-8 lg:px-12' : 'max-w-7xl px-4 sm:px-6 lg:px-8'
				}`}
			>
				<div className="sm:col-span-3 lg:col-span-1">
					<Link href="/" className="flex w-fit items-center gap-2.5">
						{/* eslint-disable-next-line @next/next/no-img-element */}
						<img src="/images/RioMark.svg" alt="" width={32} height={32} />
						<span className="font-title text-xl leading-none">
							Project <span className="text-rio-400">Rio</span>
						</span>
					</Link>
					<p className="mt-4 max-w-[16rem] text-sm leading-snug text-fog-500">
						A fan project, not affiliated with Nintendo.
					</p>
				</div>
				{FOOTER_GROUPS.map((group) => (
					<div key={group.title}>
						<h3 className="font-display text-sm font-semibold uppercase tracking-[0.16em] text-fog-500">{group.title}</h3>
						<ul className="mt-3 space-y-1.5 font-display text-lg font-medium text-fog-300">
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
			</div>
		</footer>
	);
}
