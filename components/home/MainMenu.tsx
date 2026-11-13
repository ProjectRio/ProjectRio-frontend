'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import GCButton from '@/components/GCButton';
import { MENU_ITEMS } from './menu';

/**
 * The front door, built as the game's main menu: one selection bar that steps
 * between rows in 14 frames. The selection drives the board beside it, so the
 * page owns the index. Row size comes from --row on .title-screen, which
 * shortens on a short window.
 *
 * The arrow keys move the bar from anywhere on the page, as the stick would,
 * and Enter opens the lit row. Off either end of the list the keys are left
 * alone, so they still scroll the page.
 */
export default function MainMenu({
	index,
	onIndex,
	live
}: {
	index: number;
	onIndex: (index: number) => void;
	live: number | null;
}) {
	const router = useRouter();
	const navRef = useRef<HTMLElement>(null);

	useEffect(() => {
		function onKeyDown(event: KeyboardEvent) {
			const nav = navRef.current;
			if (!nav || event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
			const target = event.target instanceof Element ? event.target : null;
			// Typing, and controls that use these keys themselves, keep them.
			if (target?.closest('input, textarea, select, [contenteditable="true"], [role="menu"]')) return;
			// Scrolled past the menu, the keys go back to the page.
			const box = nav.getBoundingClientRect();
			if (box.bottom <= 0 || box.top >= window.innerHeight) return;

			if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
				const next = index + (event.key === 'ArrowDown' ? 1 : -1);
				if (next < 0 || next >= MENU_ITEMS.length) return;
				event.preventDefault();
				onIndex(next);
				// Keep keyboard focus on the bar when it is already in the menu.
				if (target && nav.contains(target)) nav.querySelectorAll<HTMLAnchorElement>('a')[next]?.focus();
			} else if (event.key === 'Enter' && !target?.closest('a, button, summary')) {
				event.preventDefault();
				router.push(MENU_ITEMS[index].href);
			}
		}
		window.addEventListener('keydown', onKeyDown);
		return () => window.removeEventListener('keydown', onKeyDown);
	}, [index, onIndex, router]);

	return (
		<nav ref={navRef} aria-label="Main menu" className="relative w-full">
			<span
				aria-hidden
				className="sel pointer-events-none absolute inset-x-0 top-0 transition-transform duration-[233ms] ease-[var(--ease-step)] motion-reduce:transition-none"
				style={{ height: 'var(--row)', transform: `translateY(calc(${index} * (var(--row) + var(--row-gap))))` }}
			/>
			{MENU_ITEMS.map((item, i) => (
				<Link
					key={item.href}
					href={item.href}
					onMouseEnter={() => onIndex(i)}
					onFocus={() => onIndex(i)}
					style={{ height: 'var(--row)', marginBottom: 'var(--row-gap)' }}
					className={`relative flex items-center gap-3 pl-5 pr-4 font-title text-[length:var(--row-text)] leading-none outline-none transition-colors [text-shadow:0_2px_0_rgb(0_0_0/0.5)] ${
						i === index ? 'text-fog-100' : 'text-fog-300'
					}`}
				>
					<span className="flex-1 truncate">{item.label}</span>
					{item.key === 'live' && live !== null && live > 0 && (
						<span className="flex items-center gap-2 font-mono text-base font-semibold text-fog-100 [text-shadow:none]">
							<span className="h-2.5 w-2.5 rounded-full bg-rio-500" />
							{live}
						</span>
					)}
					{/* The prompt rides on the cursor, the way the game shows A on the lit row. */}
					<GCButton
						button="a"
						size={26}
						pressed
						className={`transition-opacity duration-[120ms] max-lg:!hidden ${i === index ? 'opacity-100' : 'opacity-0'}`}
					/>
				</Link>
			))}
		</nav>
	);
}
