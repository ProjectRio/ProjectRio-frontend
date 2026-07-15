'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { listCommunities, getMyCommunities, type Community } from '@/lib/communityApi';
import { useUsername } from '@/lib/useUsername';
import { PageHeader, Panel, Spinner, ErrorState, EmptyState, Badge } from '@/components/ui';

function CommunityCard({ community, isMember }: { community: Community; isMember: boolean }) {
	return (
		<Link href={`/communities/${encodeURIComponent(community.name)}`} className="panel panel-glow block p-5">
			<div className="flex items-start justify-between gap-3">
				<h2 className="font-display text-lg font-bold uppercase tracking-wide">{community.name}</h2>
				<div className="flex shrink-0 gap-1.5">
					{community.type === 'Official' && <Badge color="gold">Official</Badge>}
					{community.private && <Badge color="gray">Private</Badge>}
					{isMember && <Badge color="green">Member</Badge>}
				</div>
			</div>
			<p className="mt-2 line-clamp-2 text-sm text-fog-500">{community.desc || 'No description yet.'}</p>
			<p className="mt-3 text-xs text-fog-500">
				Since{' '}
				{community.date_created ? new Date(community.date_created * 1000).toLocaleDateString() : '—'}
			</p>
		</Link>
	);
}

function CommunitiesDirectory() {
	const username = useUsername();
	const searchParams = useSearchParams();
	const [communities, setCommunities] = useState<Community[] | null>(null);
	const [mine, setMine] = useState<Community[]>([]);
	const [error, setError] = useState<string | null>(null);
	const [needsLogin, setNeedsLogin] = useState(false);
	const [search, setSearch] = useState('');
	const [mineOnly, setMineOnly] = useState(searchParams.get('filter') === 'mine');

	useEffect(() => {
		let cancelled = false;
		Promise.all([
			listCommunities(),
			username ? getMyCommunities(username).catch(() => []) : Promise.resolve([])
		])
			.then(([all, my]) => {
				if (cancelled) return;
				// Private communities the user belongs to aren't in the public list.
				const seen = new Set(all.map((community) => community.id));
				const merged = [...all, ...my.filter((community) => !seen.has(community.id))];
				merged.sort((a, b) => a.name.localeCompare(b.name));
				setCommunities(merged);
				setMine(my);
			})
			.catch((err) => {
				if (cancelled) return;
				// The backend requires a login to list communities.
				if (err?.status === 401 || err?.status === 409) setNeedsLogin(true);
				else setError('Could not load communities. Try again in a moment.');
			});
		return () => {
			cancelled = true;
		};
	}, [username]);

	const memberIds = useMemo(() => new Set(mine.map((community) => community.id)), [mine]);

	const visible = useMemo(() => {
		if (!communities) return [];
		const query = search.trim().toLowerCase();
		return communities.filter(
			(community) =>
				(!mineOnly || memberIds.has(community.id)) &&
				(!query || community.name.toLowerCase().includes(query) || community.desc?.toLowerCase().includes(query))
		);
	}, [communities, search, mineOnly, memberIds]);

	if (needsLogin) {
		return (
			<Panel className="p-8 text-center">
				<p className="font-display text-lg font-semibold uppercase tracking-wider text-fog-300">
					Log in to browse communities
				</p>
				<p className="mx-auto mt-2 max-w-md text-sm text-fog-500">
					Communities are leagues, regions, and friend groups with their own game modes and ladders.
				</p>
				<Link href="/login" className="btn-primary mt-6 inline-block">
					Log In
				</Link>
			</Panel>
		);
	}

	return (
		<>
			<div className="mb-6 flex flex-wrap items-center gap-3">
				<input
					className="input max-w-xs"
					placeholder="Search communities…"
					value={search}
					onChange={(event) => setSearch(event.target.value)}
				/>
				{username && (
					<label className="flex items-center gap-2 text-sm text-fog-300">
						<input
							type="checkbox"
							className="accent-rio-500"
							checked={mineOnly}
							onChange={(event) => setMineOnly(event.target.checked)}
						/>
						My communities only
					</label>
				)}
			</div>

			{error && <ErrorState message={error} />}
			{!communities && !error && <Spinner label="Loading communities…" />}
			{communities && visible.length === 0 && (
				<EmptyState
					title="No communities found"
					detail={mineOnly ? 'You have not joined any communities yet.' : 'Try a different search.'}
				/>
			)}
			<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
				{visible.map((community) => (
					<CommunityCard key={community.id} community={community} isMember={memberIds.has(community.id)} />
				))}
			</div>
		</>
	);
}

export default function CommunitiesPage() {
	return (
		<div>
			<PageHeader kicker="Play together" title="Communities">
				<Link href="/communities/create" className="btn-primary">
					Create Community
				</Link>
			</PageHeader>
			<Suspense fallback={<Spinner label="Loading communities…" />}>
				<CommunitiesDirectory />
			</Suspense>
		</div>
	);
}
