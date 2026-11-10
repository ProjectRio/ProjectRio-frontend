'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

// Tab-style subnav shared by the player Overview / Batting / Pitching pages.
export default function PlayerNav({ user }: { user: string }) {
	const pathname = usePathname();
	const base = `/users/${encodeURIComponent(user)}`;
	const tabs = [
		{ href: base, label: 'Overview' },
		{ href: `${base}/batting`, label: 'Batting' },
		{ href: `${base}/pitching`, label: 'Pitching' }
	];

	return (
		<div className="mb-6 flex flex-wrap gap-1 border-b border-night-700 pb-2">
			{tabs.map((tab) => {
				const active = pathname === tab.href;
				return (
					<Link
						key={tab.href}
						href={tab.href}
						aria-current={active ? 'page' : undefined}
						className={`rounded-md border px-4 py-2 font-display text-sm font-semibold uppercase tracking-wider transition-colors ${
							active ? 'sel text-fog-100' : 'border-transparent text-fog-300 hover:text-fog-100'
						}`}
					>
						{tab.label}
					</Link>
				);
			})}
		</div>
	);
}
