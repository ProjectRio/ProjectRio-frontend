'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useUsername } from '@/lib/useUsername';
import { useRioStaff } from '@/lib/useRioStaff';

const NAV_LINKS = [
	{ href: '/games/recent', label: 'Games' },
	{ href: '/games/live', label: 'Live' },
	{ href: '/modes', label: 'Ranked' },
	{ href: '/users', label: 'Players' },
	{ href: '/characters', label: 'Characters' },
	{ href: '/communities', label: 'Communities' },
	{ href: '/tools', label: 'Tools' }
];

const SOCIAL_LINKS = [
	{ href: 'https://discord.gg/c3r9PabfRU', label: 'Discord' },
	{ href: 'https://www.patreon.com/projectrio/posts', label: 'Patreon' },
	{ href: 'https://github.com/ProjectRio?tab=repositories', label: 'GitHub' }
];

function AccountMenu({ username }: { username: string }) {
	const [open, setOpen] = useState(false);
	const menuRef = useRef<HTMLDivElement>(null);
	const { isStaff } = useRioStaff();

	useEffect(() => {
		if (!open) return;
		function onClick(event: MouseEvent) {
			if (menuRef.current && !menuRef.current.contains(event.target as Node)) setOpen(false);
		}
		window.addEventListener('mousedown', onClick);
		return () => window.removeEventListener('mousedown', onClick);
	}, [open]);

	const items = [
		{ href: `/users/${encodeURIComponent(username)}`, label: 'My Profile' },
		{ href: '/communities?filter=mine', label: 'My Communities' },
		...(isStaff ? [{ href: '/admin', label: 'Rio Admin' }] : []),
		{ href: '/logout', label: 'Log Out' }
	];

	return (
		<div className="relative" ref={menuRef}>
			<button
				type="button"
				aria-haspopup="menu"
				aria-expanded={open}
				title={username}
				className="flex h-9 w-9 items-center justify-center rounded-full bg-rio-500 font-display font-bold uppercase transition-colors hover:bg-rio-400"
				onClick={() => setOpen(!open)}
			>
				{username.slice(0, 2)}
			</button>
			{open && (
				<div
					role="menu"
					className="absolute right-0 top-11 w-48 overflow-hidden rounded-lg border border-night-700 bg-night-900 shadow-lg"
				>
					<p className="border-b border-night-700 bg-night-850 px-4 py-2 text-xs font-medium text-fog-500">
						Signed in as <span className="text-fog-100">{username}</span>
					</p>
					{items.map((item) => (
						<Link
							key={item.href}
							href={item.href}
							role="menuitem"
							className="block px-4 py-2 font-display text-sm font-semibold uppercase tracking-wider text-fog-300 transition-colors hover:bg-night-800 hover:text-fog-100"
							onClick={() => setOpen(false)}
						>
							{item.label}
						</Link>
					))}
				</div>
			)}
		</div>
	);
}

export default function Nav() {
	const [open, setOpen] = useState(false);
	const pathname = usePathname();
	const username = useUsername();
	const { isStaff } = useRioStaff();

	return (
		<header className="sticky top-0 z-50 border-b border-night-700 bg-night-950/90 backdrop-blur">
			<div className="mx-auto flex h-16 max-w-7xl items-center gap-6 px-4 sm:px-6 lg:px-8">
				<Link href="/" className="flex shrink-0 items-center gap-3" onClick={() => setOpen(false)}>
					<Image src="/images/RioLogo.png" alt="Project Rio logo" width={36} height={36} className="[image-rendering:pixelated]" />
					<span className="font-display text-xl font-bold uppercase tracking-widest">
						Project<span className="text-rio-500">Rio</span>
					</span>
				</Link>

				<nav className="hidden flex-1 items-center gap-1 lg:flex" aria-label="Primary">
					{NAV_LINKS.map((link) => {
						const active = pathname === link.href || pathname.startsWith(link.href + '/');
						return (
							<Link
								key={link.href}
								href={link.href}
								className={`px-3 py-2 font-display text-sm font-semibold uppercase tracking-wider transition-colors ${
									active ? 'text-rio-400' : 'text-fog-300 hover:text-fog-100'
								}`}
							>
								{link.label}
							</Link>
						);
					})}
				</nav>

				<div className="hidden items-center gap-3 lg:flex">
					{SOCIAL_LINKS.map((link) => (
						<a
							key={link.href}
							href={link.href}
							target="_blank"
							rel="noreferrer"
							className="text-xs font-medium text-fog-500 transition-colors hover:text-fog-100"
						>
							{link.label}
						</a>
					))}
					{username ? (
						<AccountMenu username={username} />
					) : (
						<Link href="/login" className="btn-primary !px-4 !py-2 text-sm">
							Log In
						</Link>
					)}
				</div>

				<button
					className="ml-auto p-2 text-fog-100 lg:hidden"
					aria-label="Toggle menu"
					aria-expanded={open}
					onClick={() => setOpen(!open)}
				>
					<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
						{open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
					</svg>
				</button>
			</div>

			{open && (
				<nav className="border-t border-night-700 bg-night-900 px-4 py-4 lg:hidden" aria-label="Mobile">
					<ul className="space-y-1">
						{NAV_LINKS.map((link) => (
							<li key={link.href}>
								<Link
									href={link.href}
									className="block px-3 py-2 font-display font-semibold uppercase tracking-wider text-fog-300 hover:text-fog-100"
									onClick={() => setOpen(false)}
								>
									{link.label}
								</Link>
							</li>
						))}
						{username && isStaff && (
							<li>
								<Link
									href="/admin"
									className="block px-3 py-2 font-display font-semibold uppercase tracking-wider text-fog-300 hover:text-fog-100"
									onClick={() => setOpen(false)}
								>
									Rio Admin
								</Link>
							</li>
						)}
						{username && (
							<li>
								<Link
									href={`/users/${encodeURIComponent(username)}`}
									className="block px-3 py-2 font-display font-semibold uppercase tracking-wider text-fog-300 hover:text-fog-100"
									onClick={() => setOpen(false)}
								>
									My Profile
								</Link>
							</li>
						)}
						<li>
							<Link
								href={username ? '/logout' : '/login'}
								className="block px-3 py-2 font-display font-semibold uppercase tracking-wider text-rio-400"
								onClick={() => setOpen(false)}
							>
								{username ? 'Log Out' : 'Log In'}
							</Link>
						</li>
					</ul>
				</nav>
			)}
		</header>
	);
}
