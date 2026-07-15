import { redirect } from 'next/navigation';

// Legacy route — creation now lives at /communities/create.
export default function CommunityCreateRedirect() {
	redirect('/communities/create');
}
