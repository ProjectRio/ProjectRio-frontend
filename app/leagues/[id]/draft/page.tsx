'use client';

import { use } from 'react';
import { leagueById } from '@/lib/draft/fixtures';
import DraftRoom from '@/components/draft/DraftRoom';
import FixedPriceBuilder from '@/components/draft/FixedPriceBuilder';
import { EmptyState } from '@/components/ui';

export default function DraftRoomPage({ params }: { params: Promise<{ id: string }> }) {
	const { id } = use(params);
	const leagueId = Number(id);
	const league = leagueById(leagueId);
	if (!league) return <EmptyState title="No such league" detail="This league is not in the preview fixtures." />;
	if (league.format === 'fixed_price') return <FixedPriceBuilder leagueId={leagueId} />;
	return <DraftRoom leagueId={leagueId} />;
}
