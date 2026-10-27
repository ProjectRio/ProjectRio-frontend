import CommunityHub from '@/components/community/CommunityHub';

export async function generateMetadata({ params }: { params: Promise<{ name: string }> }) {
	const { name } = await params;
	return { title: decodeURIComponent(name) };
}

export default async function CommunityPage({ params }: { params: Promise<{ name: string }> }) {
	const { name } = await params;
	return <CommunityHub name={decodeURIComponent(name)} />;
}
