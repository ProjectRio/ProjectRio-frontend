'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
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
	// '/characters' is intentionally unlisted while we rethink that page;
	// it (and /characters/analytics) stay reachable by URL.
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
				className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-[var(--rim-strong)] bg-black/60 font-display font-bold uppercase transition-colors hover:border-fog-100"
				onClick={() => setOpen(!open)}
			>
				{username.slice(0, 2)}
			</button>
			{open && (
				<div
					role="menu"
					className="absolute right-0 top-11 w-48 overflow-hidden rounded-lg border border-[var(--rim-strong)] bg-night-950"
				>
					<p className="border-b border-night-700 px-4 py-2 text-xs font-medium text-fog-500">
						Signed in as <span className="text-fog-100">{username}</span>
					</p>
					{items.map((item) => (
						<Link
							key={item.href}
							href={item.href}
							role="menuitem"
							className="block px-4 py-2 font-display text-sm font-semibold uppercase tracking-wider text-fog-300 transition-colors hover:bg-fog-100/10 hover:text-fog-100"
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

/**
 * Primary links with the game's menu cursor: one selection bar that rests on
 * the current section and steps to whatever is hovered or focused. A step
 * takes 14 frames, as it does on the disc.
 */
function PrimaryLinks({ pathname }: { pathname: string }) {
	const navRef = useRef<HTMLElement>(null);
	const [hovered, setHovered] = useState<string | null>(null);
	const [bar, setBar] = useState<{ left: number; width: number } | null>(null);
	const active = NAV_LINKS.find((link) => pathname === link.href || pathname.startsWith(link.href + '/'))?.href;
	const target = hovered ?? active ?? null;

	useLayoutEffect(() => {
		const nav = navRef.current;
		if (!nav) return;
		function measure() {
			const el = target ? nav!.querySelector<HTMLElement>(`[data-href="${target}"]`) : null;
			setBar(el ? { left: el.offsetLeft, width: el.offsetWidth } : null);
		}
		measure();
		// Web fonts change the link widths after first layout.
		document.fonts?.ready.then(measure);
		window.addEventListener('resize', measure);
		return () => window.removeEventListener('resize', measure);
	}, [target]);

	return (
		<nav
			ref={navRef}
			className="relative hidden flex-1 items-center gap-1 lg:flex"
			aria-label="Primary"
			onMouseLeave={() => setHovered(null)}
			onBlur={() => setHovered(null)}
		>
			<span
				aria-hidden
				className="sel pointer-events-none absolute top-1/2 h-9 -translate-y-1/2 transition-[left,width,opacity] duration-[233ms] ease-[var(--ease-step)] motion-reduce:transition-none"
				style={bar ? { left: bar.left, width: bar.width, opacity: 1 } : { left: 0, width: 0, opacity: 0 }}
			/>
			{NAV_LINKS.map((link) => (
				<Link
					key={link.href}
					href={link.href}
					data-href={link.href}
					aria-current={link.href === active ? 'page' : undefined}
					onMouseEnter={() => setHovered(link.href)}
					onFocus={() => setHovered(link.href)}
					className={`relative flex items-center gap-1.5 px-3.5 py-2 font-display text-[1.05rem] font-semibold uppercase tracking-wider outline-none transition-colors ${
						link.href === target ? 'text-fog-100' : 'text-fog-300'
					}`}
				>
					{link.href === '/games/live' && <span className="h-2 w-2 rounded-full bg-rio-500" />}
					{link.label}
				</Link>
			))}
		</nav>
	);
}

export default function Nav() {
	const [open, setOpen] = useState(false);
	const pathname = usePathname();
	const username = useUsername();
	const { isStaff } = useRioStaff();
	// The landing page is the menu: its header drops the wall, the wordmark and
	// the section links, which the title screen already carries at full size.
	const home = pathname === '/';

	return (
		<header
			className={`top-0 z-50 border-t-[3px] border-[var(--wall-line)] ${
				home && !open ? 'relative' : 'sticky bg-[var(--wall)]'
			}`}
		>
			<div
				className={`mx-auto flex h-16 items-center gap-6 ${
					home ? 'max-w-[1480px] px-5 sm:px-8 lg:px-12' : 'max-w-7xl px-4 sm:px-6 lg:px-8'
				}`}
			>
				<Link href="/" className="flex shrink-0 items-center gap-2.5" onClick={() => setOpen(false)}>
					<Image src="/images/RioLogo.png" alt="Project Rio logo" width={36} height={36} className="[image-rendering:pixelated]" />
					{!home && (
						<span className="font-title text-2xl leading-none [text-shadow:0_2px_0_rgb(0_0_0/0.5)]">
							Project <span className="text-rio-400">Rio</span>
						</span>
					)}
				</Link>

				{home ? <div className="hidden flex-1 lg:block" /> : <PrimaryLinks pathname={pathname} />}

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
						<>
							<Link
								href="/login"
								className="px-1 font-display text-sm font-semibold uppercase tracking-wider text-fog-300 transition-colors hover:text-fog-100"
							>
								Log In
							</Link>
							<Link href="/signup" className="btn-primary !px-4 !py-1.5 !text-sm">
								Sign Up
							</Link>
						</>
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
				<nav className="border-t border-night-700 bg-[var(--wall)] px-4 py-4 lg:hidden" aria-label="Mobile">
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
						{!username && (
							<li>
								<Link
									href="/signup"
									className="block px-3 py-2 font-display font-semibold uppercase tracking-wider text-star-400"
									onClick={() => setOpen(false)}
								>
									Sign Up
								</Link>
							</li>
						)}
						<li>
							<Link
								href={username ? '/logout' : '/login'}
								className={`block px-3 py-2 font-display font-semibold uppercase tracking-wider ${
									'text-fog-300 hover:text-fog-100'
								}`}
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
