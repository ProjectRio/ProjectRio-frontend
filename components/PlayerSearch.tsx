'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getAllUsers } from '@/lib/api';

let usersCache: string[] | null = null;

/**
 * Find a player from the header. The full player list loads the first time the
 * field takes focus; names that start with the query come first, then names
 * that contain it. Enter opens the top match.
 */
export default function PlayerSearch({ className = '' }: { className?: string }) {
	const router = useRouter();
	const [users, setUsers] = useState<string[] | null>(usersCache);
	const [query, setQuery] = useState('');
	const [open, setOpen] = useState(false);

	useEffect(() => {
		if (!open || usersCache) return;
		let cancelled = false;
		getAllUsers()
			.then((result) => {
				usersCache = result;
				if (!cancelled) setUsers(result);
			})
			.catch(() => {});
		return () => {
			cancelled = true;
		};
	}, [open]);

	const q = query.trim().toLowerCase();
	const matches = useMemo(() => {
		if (!q || !users) return [];
		const starts: string[] = [];
		const contains: string[] = [];
		for (const user of users) {
			const at = user.toLowerCase().indexOf(q);
			if (at === 0) starts.push(user);
			else if (at > 0) contains.push(user);
		}
		const byName = (a: string, b: string) => a.localeCompare(b);
		return [...starts.sort(byName), ...contains.sort(byName)].slice(0, 7);
	}, [q, users]);

	function go(user: string) {
		setOpen(false);
		setQuery('');
		router.push(`/users/${encodeURIComponent(user)}`);
	}

	return (
		<form
			role="search"
			className={`relative ${className}`}
			onSubmit={(event) => {
				event.preventDefault();
				const target = matches[0] ?? query.trim();
				if (target) go(target);
			}}
			onBlur={(event) => {
				if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
			}}
			onKeyDown={(event) => {
				if (event.key === 'Escape') setOpen(false);
			}}
		>
			<input
				type="search"
				className="input !py-1.5 !text-sm"
				aria-label="Find a player"
				placeholder="Find a player"
				value={query}
				onFocus={() => setOpen(true)}
				onChange={(event) => {
					setQuery(event.target.value);
					setOpen(true);
				}}
			/>
			{open && q && users && (
				<ul className="absolute inset-x-0 top-full z-50 mt-1.5 popover overflow-hidden py-1">
					{matches.length === 0 && <li className="px-3 py-1.5 text-sm text-fog-500">No player by that name.</li>}
					{matches.map((user) => (
						<li key={user}>
							<Link
								href={`/users/${encodeURIComponent(user)}`}
								onClick={() => go(user)}
								className="block truncate px-3 py-1.5 font-display text-lg font-semibold text-fog-300 transition-colors hover:bg-fog-100/10 hover:text-fog-100 focus-visible:bg-fog-100/10 focus-visible:text-fog-100"
							>
								{user}
							</Link>
						</li>
					))}
				</ul>
			)}
		</form>
	);
}
