'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useTagsets } from '@/lib/useTagsets';
import { PageHeader, Spinner, Badge } from '@/components/ui';

export default function ModesPage() {
	const tagsets = useTagsets();
	const [showEnded, setShowEnded] = useState(false);
	const [showUnofficial, setShowUnofficial] = useState(false);

	const now = Math.floor(Date.now() / 1000);
	const visible = tagsets.filter(
		(tagset) =>
			(showEnded || (tagset.end_date ?? 0) >= now) &&
			(showUnofficial || tagset.comm_type === 'Official')
	);

	return (
		<div>
			<PageHeader kicker="Ranked play" title="Game Modes">
				<label className="flex items-center gap-2 text-sm text-fog-300">
					<input
						type="checkbox"
						className="accent-star-400"
						checked={showUnofficial}
						onChange={(event) => setShowUnofficial(event.target.checked)}
					/>
					Unofficial
				</label>
				<label className="flex items-center gap-2 text-sm text-fog-300">
					<input
						type="checkbox"
						className="accent-star-400"
						checked={showEnded}
						onChange={(event) => setShowEnded(event.target.checked)}
					/>
					Ended
				</label>
			</PageHeader>

			{tagsets.length === 0 ? (
				<Spinner label="Loading game modes…" />
			) : (
				<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
					{visible.map((tagset) => (
						<Link
							key={tagset.id}
							href={`/modes/${encodeURIComponent(tagset.name)}`}
							className="panel panel-glow block p-5"
						>
							<div className="flex items-start justify-between gap-2">
								<h2 className="text-lg">{tagset.name}</h2>
								<Badge color={tagset.comm_type === 'Official' ? 'gold' : 'gray'}>
									{tagset.comm_type ?? 'Mode'}
								</Badge>
							</div>
							<p className="mt-3 text-xs text-fog-500">
								{tagset.start_date ? new Date(tagset.start_date * 1000).toLocaleDateString() : '—'} —{' '}
								{tagset.end_date ? new Date(tagset.end_date * 1000).toLocaleDateString() : '—'}
							</p>
						</Link>
					))}
				</div>
			)}
		</div>
	);
}
