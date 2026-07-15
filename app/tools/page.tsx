import Link from 'next/link';
import { PageHeader } from '@/components/ui';

export const metadata = { title: 'Tools' };

const TOOLS = [
	{
		href: '/codes',
		title: 'Gecko Code Library',
		description: 'Search every gecko code across all Project Rio communities and copy them straight into Dolphin.'
	},
	{
		href: '/tools/pitch-calculator',
		title: 'Pitch Calculator',
		description: 'Frame-accurate pitch trajectory simulation straight from the game engine decompilation.'
	},
	{
		href: '/muddyball',
		title: 'Muddyball Draft Board',
		description: 'Build a budget roster, arrange your lineup and field, and share it with a link.'
	},
	{
		href: '/streaming/scoreboard',
		title: 'Stream Scoreboards',
		description: 'Greenscreen-ready live and recent game overlays for OBS and broadcasts.'
	},
	{
		href: '/rio-online',
		title: 'Rio Online',
		description: 'Everything about playing Mario Superstar Baseball online with Project Rio.'
	}
];

export default function ToolsPage() {
	return (
		<div>
			<PageHeader kicker="For players and casters" title="Tools" />
			<div className="grid gap-4 sm:grid-cols-2">
				{TOOLS.map((tool) => (
					<Link key={tool.href} href={tool.href} className="panel panel-glow block p-6">
						<h2 className="font-display text-xl font-bold uppercase tracking-wide">{tool.title}</h2>
						<p className="mt-2 text-sm text-fog-500">{tool.description}</p>
					</Link>
				))}
			</div>
		</div>
	);
}
