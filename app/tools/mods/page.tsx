import Link from 'next/link';
import { PageHeader, Panel } from '@/components/ui';
import { GROUPS, GROUP_ORDER, MODDING_SOURCE } from '@/lib/mods/catalog';
import { MODDING_META, getAllTables } from '@/lib/mods/resolve';

export const metadata = { title: 'Game Mods' };

export default function ModsPage() {
	const tables = getAllTables();
	const repoUrl = `https://github.com/${MODDING_SOURCE.repo}/tree/${MODDING_META.ref}`;
	const decompUrl = `https://github.com/${MODDING_META.decomp.repo}/tree/${MODDING_META.decomp.ref}`;

	return (
		<div className="space-y-10">
			<PageHeader kicker="Tools" title="Game Mods" />

			<Panel className="p-6">
				<div className="max-w-prose space-y-3 text-sm text-fog-300">
					<p>
						Edit the game&apos;s internal tables and generate a Gecko code that applies your changes. Pick a table, change
						any values, then copy the code or download it as an <span className="font-mono text-fog-100">.ini</span> block
						and add it to your Gecko code list in Project Rio or Dolphin.
					</p>
					<p className="text-xs text-fog-500">
						Addresses and layouts come from the{' '}
						<a href={decompUrl} target="_blank" rel="noreferrer" className="text-star-400 hover:text-star-300">
							MSSB decompilation
						</a>{' '}
						pinned by{' '}
						<a href={repoUrl} target="_blank" rel="noreferrer" className="text-star-400 hover:text-star-300">
							ProjectRio-Modding
						</a>
						. Default values are the unmodified game&apos;s.
					</p>
				</div>
			</Panel>

			{GROUP_ORDER.map((group) => (
				<section key={group}>
					<h2 className="text-2xl">{GROUPS[group].title}</h2>
					<p className="mt-1 max-w-prose text-sm text-fog-500">{GROUPS[group].description}</p>
					<div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
						{tables
							.filter((table) => table.group === group)
							.map((table) => (
								<Link key={table.id} href={`/tools/mods/${table.id}`} className="panel panel-glow block p-5">
									<h3 className="font-display text-lg font-semibold text-fog-100">{table.title}</h3>
									<p className="mt-2 line-clamp-3 text-sm text-fog-300">{table.description}</p>
									<p className="mt-3 font-mono text-xs tabular-nums text-fog-500">{table.cells.length} values</p>
								</Link>
							))}
					</div>
				</section>
			))}
		</div>
	);
}
