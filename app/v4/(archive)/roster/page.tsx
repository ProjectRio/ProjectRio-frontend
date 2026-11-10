import RosterExplorer from '@/components/v4/RosterExplorer';

export const metadata = { title: 'The roster' };

export default async function Page({ searchParams }: { searchParams: Promise<{ character?: string }> }) {
  const id = Number((await searchParams).character ?? 0);
  return <RosterExplorer initialId={Number.isInteger(id) && id >= 0 && id < 54 ? id : 0} />;
}
