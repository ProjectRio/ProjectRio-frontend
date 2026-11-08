import { redirect } from 'next/navigation';

// Legacy route — game modes are created from a community's Game Modes tab.
export default function TagSetCreateRedirect() {
	redirect('/communities');
}
