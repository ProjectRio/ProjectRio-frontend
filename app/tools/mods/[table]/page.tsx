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
			<nav className="flex flex-wrap items-center gap-2 text-sm" aria-label="Mod tables">
				<Link href="/tools/mods" className="text-fog-500 hover:text-fog-100">
					All mods
				</Link>
				<span className="text-fog-500">/</span>
				{siblings.map((other) => (
					<Link
						key={other.id}
						href={`/tools/mods/${other.id}`}
						className={`rounded px-3 py-1 font-display text-xs font-semibold uppercase tracking-wider ${
							other.id === table.id ? 'bg-rio-500/15 text-rio-300' : 'text-fog-300 hover:text-fog-100'
						}`}
					>
						{other.title}
					</Link>
				))}
			</nav>
			<ModTableEditor table={table} groupTitle={GROUPS[table.group].title} />
		</div>
	);
}
