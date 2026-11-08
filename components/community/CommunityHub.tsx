'use client';

import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { PageHeader, Spinner, ErrorState, Badge } from '@/components/ui';
import { Tabs } from '@/components/overlay';
import { useCommunity } from './useCommunity';
import OverviewTab from './OverviewTab';
import MembersTab from './MembersTab';
import GameModesTab from './GameModesTab';
import TagsTab from './TagsTab';
import SettingsTab from './SettingsTab';

export type { CommunityContext } from './useCommunity';

const TAB_IDS = ['overview', 'modes', 'tags', 'members', 'settings'];

function CommunityHubInner({ name }: { name: string }) {
	const searchParams = useSearchParams();
	const inviteUrl = searchParams.get('invite');
	const requestedTab = searchParams.get('tab');

	const [tab, setTab] = useState(requestedTab && TAB_IDS.includes(requestedTab) ? requestedTab : 'overview');
	const { context, loading, error } = useCommunity(name, inviteUrl);

	if (loading) return <Spinner label="Loading community…" />;
	if (error || !context) return <ErrorState message={error ?? 'Could not load this community.'} />;

	const tabs = [
		{ id: 'overview', label: 'Overview' },
		{ id: 'modes', label: 'Game Modes' },
		{ id: 'tags', label: 'Tags' },
		{ id: 'members', label: 'Members' },
		...(context.isAdmin ? [{ id: 'settings', label: 'Settings' }] : [])
	];
	// ?tab=settings from a non-admin falls back to overview.
	const activeTab = tabs.some((candidate) => candidate.id === tab) ? tab : 'overview';

	return (
		<div>
			<PageHeader kicker="Community" title={context.community.name}>
				<div className="flex gap-1.5">
					{context.community.type === 'Official' && <Badge color="gold">Official</Badge>}
					{context.community.private && <Badge color="gray">Private</Badge>}
					{context.isAdmin && <Badge color="red">Admin</Badge>}
				</div>
			</PageHeader>
			<Tabs tabs={tabs} active={activeTab} onChange={setTab} />
			{activeTab === 'overview' && <OverviewTab context={context} />}
			{activeTab === 'modes' && <GameModesTab context={context} />}
			{activeTab === 'tags' && <TagsTab context={context} />}
			{activeTab === 'members' && <MembersTab context={context} />}
			{activeTab === 'settings' && context.isAdmin && <SettingsTab context={context} />}
		</div>
	);
}

export default function CommunityHub({ name }: { name: string }) {
	return (
		<Suspense fallback={<Spinner label="Loading community…" />}>
			<CommunityHubInner name={name} />
		</Suspense>
	);
}
