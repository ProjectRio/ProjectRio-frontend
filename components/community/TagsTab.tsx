'use client';

import Link from 'next/link';
import type { RioTag } from '@/lib/communityApi';
import { Panel, PanelHeader, Badge, EmptyState } from '@/components/ui';
import type { CommunityContext } from './CommunityHub';

export default function TagsTab({ context }: { context: CommunityContext }) {
	const { community, tags, isAdmin } = context;

	if (!tags) {
		return <EmptyState title="Tags are private" detail="Join this community to see its tags." />;
	}

	// Community/Competition tags are system-managed; list them but only allow
	// editing the rule tags.
	const editable = (tag: RioTag) => tag.type !== 'Community' && tag.type !== 'Competition';
	const communityPath = `/communities/${encodeURIComponent(community.name)}`;

	return (
		<div className="space-y-4">
			{isAdmin && (
				<div className="flex justify-end">
					<Link href={`${communityPath}/tags/create`} className="btn-primary !py-2 text-sm">
						Create Tag
					</Link>
				</div>
			)}
			<Panel>
				<PanelHeader title={`Tags (${tags.length})`} />
				{tags.length === 0 ? (
					<EmptyState title="No tags yet" detail="Tags label rulesets and gecko codes for this community's game modes." />
				) : (
					<div className="overflow-x-auto">
						<table className="stat-table">
							<thead>
								<tr>
									<th>Name</th>
									<th>Type</th>
									<th>Description</th>
									<th>Code</th>
									{isAdmin && <th className="text-right">Actions</th>}
								</tr>
							</thead>
							<tbody>
								{tags.map((tag) => (
									<tr key={tag.id}>
										<td className="font-semibold text-fog-100">{tag.name}</td>
										<td>
											<Badge color={tag.type === 'Gecko Code' ? 'red' : 'gray'}>{tag.type}</Badge>
										</td>
										<td className="max-w-md whitespace-normal text-fog-500">{tag.desc}</td>
										<td>
											{tag.gecko_code ? (
												<details>
													<summary className="cursor-pointer text-rio-400 hover:text-rio-300">View</summary>
													<pre className="mt-2 max-w-md overflow-x-auto whitespace-pre-wrap rounded bg-night-950 p-3 text-xs text-fog-300">
														{tag.gecko_code}
													</pre>
												</details>
											) : (
												'—'
											)}
										</td>
										{isAdmin && (
											<td className="text-right">
												{editable(tag) && (
													<Link
														href={`${communityPath}/tags/${tag.id}/edit`}
														className="text-xs font-semibold uppercase tracking-wider text-fog-500 hover:text-fog-100"
													>
														Edit
													</Link>
												)}
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
