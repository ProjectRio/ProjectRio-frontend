'use client';

import { use } from 'react';
import PlayerStatsPage from '@/components/player/PlayerStatsPage';

export default function UserPitchingPage({ params }: { params: Promise<{ user: string }> }) {
	const user = decodeURIComponent(use(params).user);
	return <PlayerStatsPage user={user} kind="pitching" />;
}
