import { PageHeader, Panel } from '@/components/ui';

export const metadata = { title: 'Version History' };

export default function VersionHistoryPage() {
	return (
		<div className="mx-auto max-w-3xl">
			<PageHeader kicker="Rio Online" title="Version History" />
			<Panel className="p-6">
				<p className="text-sm text-fog-300">
					See all releases and changelogs on{' '}
					<a
						href="https://github.com/ProjectRio/ProjectRio/releases"
						target="_blank"
						rel="noreferrer"
						className="text-star-400 hover:text-star-300"
					>
						GitHub
					</a>
					.
				</p>
			</Panel>
		</div>
	);
}
