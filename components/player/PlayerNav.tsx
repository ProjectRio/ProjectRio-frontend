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
		<div className="tab-strip mb-6">
			{tabs.map((tab) => {
				const active = pathname === tab.href;
				return (
					<Link
						key={tab.href}
						href={tab.href}
						aria-current={active ? 'page' : undefined}
					>
						{tab.label}
					</Link>
				);
			})}
		</div>
	);
}
