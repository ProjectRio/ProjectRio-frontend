'use client';

import { use } from 'react';
import TagEditor from '@/components/community/TagEditor';

export default function CreateTagPage({ params }: { params: Promise<{ name: string }> }) {
	const communityName = decodeURIComponent(use(params).name);
	return <TagEditor communityName={communityName} />;
}
