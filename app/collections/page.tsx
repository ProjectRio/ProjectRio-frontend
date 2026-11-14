'use client';

// Collections directory (scoping §3g): series, game modes and events, nested.
// Everything here runs against seeded fixtures until the Competition rework
// lands in Rio Web.

import Link from 'next/link';
import { COLLECTIONS, COMPETITIONS, childCollections, competitionsIn, sortCompetitions } from '@/lib/compete/fixtures';
import { CollectionCard, CompetitionCard, collectionNamesFor } from '@/components/compete/cards';
import { PreviewNotice } from '@/components/compete/shared';
import { PageHeader } from '@/components/ui';

export default function CollectionsPage() {
	const roots = COLLECTIONS.filter((collection) => !collection.parent);
	const live = sortCompetitions(COMPETITIONS.filter((competition) => ['live', 'playoffs', 'drafting', 'signups'].includes(competition.state)));
	return (
		<div className="space-y-10">
			<div>
				<PageHeader kicker="Leagues and events" title="Collections">
					<Link href="/leagues" className="btn-secondary !py-2 text-sm">
						Draft leagues
					</Link>
				</PageHeader>
				<div className="-mt-4 space-y-3">
					<PreviewNotice />
					<p className="max-w-prose text-sm text-fog-300">
						A collection is a place: a series like NPSS, a game mode like Stars Off, or a weekend event. Each one groups competitions — seasons, brackets, nights — and carries the history and ladders that run across them.
					</p>
				</div>
			</div>

			{live.length > 0 && (
				<section>
					<h2 className="mb-4 text-2xl text-fog-100">Happening now</h2>
					<div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
						{live.map((competition) => (
							<CompetitionCard key={competition.slug} competition={competition} collectionNames={collectionNamesFor(competition)} />
						))}
					</div>
				</section>
			)}

			<section>
				<h2 className="mb-4 text-2xl text-fog-100">All collections</h2>
				<div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
					{roots.map((collection) => (
						<CollectionCard key={collection.slug} collection={collection} count={competitionsIn(collection.slug).length} sections={childCollections(collection.slug)} />
					))}
				</div>
			</section>
		</div>
	);
}
