'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useUsername } from '@/lib/useUsername';
import { useRioStaff } from '@/lib/useRioStaff';
import { SECTIONS, sectionFor } from '@/lib/siteMap';

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
 * The site's sections (lib/siteMap.ts), the same list the landing page stands
 * up as its title menu, laid down with the same cursor: one selection bar
 * that rests on the section you are in and steps to whatever is hovered or
 * focused. A step takes 14 frames, as it does on the disc.
 */
function PrimaryLinks({ pathname }: { pathname: string }) {
	const navRef = useRef<HTMLElement>(null);
	const [hovered, setHovered] = useState<string | null>(null);
	const [bar, setBar] = useState<{ left: number; width: number } | null>(null);
	const active = sectionFor(pathname)?.key;
	const target = hovered ?? active ?? null;

	useLayoutEffect(() => {
		const nav = navRef.current;
		if (!nav) return;
		function measure() {
			const el = target ? nav!.querySelector<HTMLElement>(`[data-section="${target}"]`) : null;
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
			className="relative hidden flex-1 items-center xl:flex"
			aria-label="Primary"
			onMouseLeave={() => setHovered(null)}
			onBlur={() => setHovered(null)}
		>
			<span
				aria-hidden
				className="sel pointer-events-none absolute top-1/2 h-9 -translate-y-1/2 transition-[left,width,opacity] duration-[233ms] ease-[var(--ease-step)] motion-reduce:transition-none"
				style={bar ? { left: bar.left, width: bar.width, opacity: 1 } : { left: 0, width: 0, opacity: 0 }}
			/>
			{SECTIONS.map((section) => (
				<Link
					key={section.key}
					href={section.href}
					data-section={section.key}
					aria-current={section.key === active ? 'page' : undefined}
					onMouseEnter={() => setHovered(section.key)}
					onFocus={() => setHovered(section.key)}
					className={`relative whitespace-nowrap px-3 py-2 font-display text-[1.05rem] font-semibold uppercase tracking-wider outline-none transition-colors ${
						section.key === target ? 'text-fog-100' : 'text-fog-300'
					}`}
				>
					{section.label}
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
				{/* The landing page carries the mark in its own masthead, beside the title. */}
				{!home && (
					<Link href="/" className="flex shrink-0 items-center gap-2.5" onClick={() => setOpen(false)}>
						{/* A 16 by 16 pixel mark, drawn as vectors and shown at a whole multiple of 16. */}
						{/* eslint-disable-next-line @next/next/no-img-element */}
						<img src="/images/RioMark.svg" alt="" width={32} height={32} />
						<span className="font-title text-2xl leading-none [text-shadow:0_2px_0_rgb(0_0_0/0.5)]">
							Project <span className="text-rio-400">Rio</span>
						</span>
					</Link>
				)}

				{/* The title screen is the menu, so its header carries no section links. */}
				{home ? <div className="flex-1" /> : <PrimaryLinks pathname={pathname} />}

				{/* Eight section links need the xl width; without them the account buttons fit from lg. */}
				<div className={`hidden items-center gap-3 ${home ? 'lg:flex' : 'xl:flex'}`}>
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
					className={`ml-auto p-2 text-fog-100 ${home ? 'lg:hidden' : 'xl:hidden'}`}
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
				<nav className={`border-t border-night-700 bg-[var(--wall)] px-4 py-4 ${home ? 'lg:hidden' : 'xl:hidden'}`} aria-label="Mobile">
					<ul className="space-y-1">
						{SECTIONS.map((link) => (
							<li key={link.key}>
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
