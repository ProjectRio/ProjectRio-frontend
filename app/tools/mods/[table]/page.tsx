import Link from 'next/link';
import { notFound } from 'next/navigation';
import ModTableEditor from '@/components/mods/ModTableEditor';
import { GROUPS, catalog } from '@/lib/mods/catalog';
import { getAllTables, getTable } from '@/lib/mods/resolve';

export const dynamicParams = false;

export function generateStaticParams() {
	return catalog.map((def) => ({ table: def.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ table: string }> }) {
	const table = getTable((await params).table);
	return { title: table ? `${table.title} · Game Mods` : 'Game Mods' };
}

export default async function ModTablePage({ params }: { params: Promise<{ table: string }> }) {
	const table = getTable((await params).table);
	if (!table) notFound();
	const siblings = getAllTables().filter((other) => other.group === table.group);

	return (
		<div className="space-y-6">
			<nav className="space-y-3" aria-label="Mod tables">
				<Link href="/tools/mods" className="inline-block text-sm text-fog-500 transition-colors hover:text-fog-100">
					All mods
				</Link>
				<div className="tab-strip">
					{siblings.map((other) => (
						<Link
							key={other.id}
							href={`/tools/mods/${other.id}`}
							aria-current={other.id === table.id ? 'page' : undefined}
						>
							{other.title}
						</Link>
					))}
				</div>
			</nav>
			<ModTableEditor table={table} groupTitle={GROUPS[table.group].title} />
		</div>
	);
}
