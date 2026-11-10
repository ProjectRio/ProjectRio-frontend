'use client';

import Link from 'next/link';
import GCButton from '@/components/GCButton';

export const MENU_ITEMS = [
	{ key: 'live', href: '/games/live', label: 'Live games' },
	{ key: 'ranked', href: '/modes', label: 'Ranked ladders' },
	{ key: 'recent', href: '/games/recent', label: 'Recent games' },
	{ key: 'players', href: '/users', label: 'Players' },
	{ key: 'communities', href: '/communities', label: 'Communities' },
	{ key: 'tools', href: '/tools', label: 'Tools' }
] as const;

export type MenuKey = (typeof MENU_ITEMS)[number]['key'];


/**
 * The front door, built as the game's main menu: one selection bar that steps
 * between rows in 14 frames. Arrow keys move it, as the stick would. The
 * selection drives the board beside it, so the page owns the index. Row size
 * comes from --row on .title-screen, which shortens on a short window.
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
	function onKeyDown(event: React.KeyboardEvent<HTMLElement>) {
		const delta = event.key === 'ArrowDown' ? 1 : event.key === 'ArrowUp' ? -1 : 0;
		if (!delta) return;
		event.preventDefault();
		const next = (index + delta + MENU_ITEMS.length) % MENU_ITEMS.length;
		onIndex(next);
		event.currentTarget.querySelectorAll<HTMLAnchorElement>('a')[next]?.focus();
	}

	return (
		<nav aria-label="Main menu" className="relative w-full" onKeyDown={onKeyDown}>
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
						size={24}
						pressed
						className={`transition-opacity duration-[120ms] max-lg:!hidden ${i === index ? 'opacity-100' : 'opacity-0'}`}
					/>
				</Link>
			))}
		</nav>
	);
}
