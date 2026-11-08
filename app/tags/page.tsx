'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getAllTags } from '@/lib/api';
import { PageHeader, Panel, Spinner, ErrorState } from '@/components/ui';

export default function TagsPage() {
	const [tags, setTags] = useState<any[] | null>(null);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		getAllTags()
			.then(setTags)
			.catch(() => setError('Could not load tags.'));
	}, []);

	return (
		<div>
			<PageHeader kicker="Rulebook" title="Game Tags">
				<Link href="/codes" className="btn-secondary !px-4 !py-2 text-sm">
					Browse Gecko Codes
				</Link>
			</PageHeader>
			{error && <ErrorState message={error} />}
			{!tags && !error && <Spinner label="Loading tags…" />}
			{tags && (
				<Panel>
					<div className="overflow-x-auto">
						<table className="stat-table">
							<thead>
								<tr>
									<th>Name</th>
									<th>Type</th>
									<th>Description</th>
									<th>Gecko Code</th>
								</tr>
							</thead>
							<tbody>
								{tags.map((tag) => (
									<tr key={tag.id ?? tag.name}>
										<td className="font-semibold text-fog-100">{tag.name}</td>
										<td>{tag.type ?? '—'}</td>
										<td className="max-w-md whitespace-normal text-fog-500">{tag.desc ?? ''}</td>
										<td>
											{tag.gecko_code ? (
												<details>
													<summary className="cursor-pointer text-rio-400 hover:text-rio-300">View code</summary>
													<pre className="mt-2 max-w-md overflow-x-auto whitespace-pre-wrap rounded bg-night-950 p-3 text-xs text-fog-300">
														{tag.gecko_code}
													</pre>
												</details>
											) : (
												'—'
											)}
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</Panel>
			)}
		</div>
	);
}
