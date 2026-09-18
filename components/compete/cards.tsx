'use client';

// Re-exports the cards with a helper that resolves a competition's
// collection names, so pages don't each import the fixtures registry.

import { collectionBySlug } from '@/lib/compete/fixtures';
import type { Competition } from '@/lib/compete/types';

export { CollectionCard, CompetitionCard } from './shared';

export function collectionNamesFor(competition: Competition): string[] {
	return competition.collections.map((slug) => collectionBySlug(slug)?.name ?? slug);
}
