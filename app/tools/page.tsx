import Link from 'next/link';
import { PageHeader } from '@/components/ui';
import { TOOLS } from '@/lib/data/tools';

export const metadata = { title: 'Tools' };

export default function ToolsPage() {
	return (
		<div>
			<PageHeader kicker="For players and casters" title="Tools" />
			<div className="grid gap-4 sm:grid-cols-2">
				{TOOLS.map((tool) => (
					<Link key={tool.href} href={tool.href} className="panel panel-glow block p-6">
						<h2 className="text-xl">{tool.title}</h2>
						<p className="mt-2 text-sm text-fog-500">{tool.description}</p>
					</Link>
				))}
			</div>
		</div>
	);
}
