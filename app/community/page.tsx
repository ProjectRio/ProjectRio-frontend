import { redirect } from 'next/navigation';

// Legacy route — communities now live at /communities.
export default function CommunityRedirect() {
	redirect('/communities');
}
