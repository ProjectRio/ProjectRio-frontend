'use client';

import Link from 'next/link';
import { Spinner, ErrorState } from '@/components/ui';
import type { UseCommunityResult } from './useCommunity';

/**
 * Standard gate for community management pages. Returns the element to render
 * while loading / errored / unauthorized, or null when the caller may render
 * its management UI (context is guaranteed non-null then). The backend
 * re-checks permissions on every write — this only shapes the UI.
 */
export function adminGuard({ context, loading, error }: UseCommunityResult) {
	if (loading) return <Spinner label="Loading community…" />;
	if (error || !context) return <ErrorState message={error ?? 'Could not load this community.'} />;
	if (!context.isAdmin) {
		return (
			<div className="mx-auto max-w-lg">
				<div className="panel p-8 text-center">
					<h1 className="text-2xl uppercase">Admins Only</h1>
					<p className="mt-3 text-sm text-fog-300">
						{context.username
							? `Only ${context.community.name} admins can manage its game modes and tags.`
							: 'Log in with a community admin account to manage game modes and tags.'}
					</p>
					{context.username ? (
						<Link
							href={`/communities/${encodeURIComponent(context.community.name)}`}
							className="btn-secondary mt-6 inline-block"
						>
							Back to Community
						</Link>
					) : (
						<Link href="/login" className="btn-primary mt-6 inline-block">
							Log In
						</Link>
					)}
				</div>
			</div>
		);
	}
	return null;
}
