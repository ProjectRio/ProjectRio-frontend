'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { useTagsets } from '@/lib/useTagsets';
import type { TagSet } from '@/lib/api';
import { Panel, PanelHeader, Badge, EmptyState } from '@/components/ui';
import type { CommunityContext } from './CommunityHub';

function isActive(mode: TagSet): boolean {
	const now = Math.floor(Date.now() / 1000);
	return (mode.start_date ?? 0) <= now && now <= (mode.end_date ?? 0);
}

export default function GameModesTab({ context }: { context: CommunityContext }) {
	const { community, isAdmin } = context;
	const tagsets = useTagsets();

	const modes = useMemo(
		() =>
			tagsets
				.filter((mode) => mode.comm_id === community.id)
				.sort((a, b) => (b.end_date ?? 0) - (a.end_date ?? 0)),
		[tagsets, community.id]
	);

	const communityPath = `/communities/${encodeURIComponent(community.name)}`;

	return (
		<div className="space-y-4">
			{isAdmin && (
				<div className="flex justify-end">
					<Link href={`${communityPath}/modes/create`} className="btn-primary !py-2 text-sm">
						Create Game Mode
					</Link>
				</div>
			)}
			<Panel>
				<PanelHeader title={`Game Modes (${modes.length})`} />
				{modes.length === 0 ? (
					<EmptyState
						title="No game modes yet"
						detail="Game modes bundle rule tags into a ranked ladder with a start and end date."
					/>
				) : (
					<div className="overflow-x-auto">
						<table className="stat-table">
							<thead>
								<tr>
									<th>Name</th>
									<th>Type</th>
									<th>Status</th>
									<th>Runs</th>
									<th>Ladder</th>
									{isAdmin && <th className="text-right">Actions</th>}
								</tr>
							</thead>
							<tbody>
								{modes.map((mode) => (
									<tr key={mode.id}>
										<td className="font-semibold text-fog-100">{mode.name}</td>
										<td className="text-fog-500">{mode.type ?? '—'}</td>
										<td>
											{isActive(mode) ? <Badge color="green">Active</Badge> : <Badge color="gray">Ended</Badge>}
										</td>
										<td className="text-fog-500" style={{ fontVariantNumeric: 'tabular-nums' }}>
											{mode.start_date ? new Date(mode.start_date * 1000).toLocaleDateString() : '—'} –{' '}
											{mode.end_date ? new Date(mode.end_date * 1000).toLocaleDateString() : '—'}
										</td>
										<td>
											<Link
												href={`/modes/${encodeURIComponent(mode.name)}/ladder`}
												className="text-rio-400 hover:text-rio-300"
											>
												View
											</Link>
										</td>
										{isAdmin && (
											<td className="text-right">
												<Link
													href={`${communityPath}/modes/${encodeURIComponent(mode.name)}/edit`}
													className="text-xs font-semibold uppercase tracking-wider text-fog-500 hover:text-fog-100"
												>
													Manage
												</Link>
											</td>
										)}
									</tr>
								))}
							</tbody>
						</table>
					</div>
				)}
			</Panel>
		</div>
	);
}
