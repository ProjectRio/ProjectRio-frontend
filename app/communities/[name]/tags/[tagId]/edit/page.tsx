'use client';

import { use } from 'react';
import { ErrorState } from '@/components/ui';
import TagEditor from '@/components/community/TagEditor';

export default function EditTagPage({ params }: { params: Promise<{ name: string; tagId: string }> }) {
	const resolved = use(params);
	const communityName = decodeURIComponent(resolved.name);
	const tagId = Number(resolved.tagId);
	if (!Number.isInteger(tagId)) return <ErrorState message="Invalid tag id." />;
	return <TagEditor communityName={communityName} tagId={tagId} />;
}
