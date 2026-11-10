import { PageHeader, Panel } from '@/components/ui';

export const metadata = { title: 'Optimization Guide' };

export default function OptimizePage() {
	return (
		<div className="mx-auto max-w-3xl">
			<PageHeader kicker="Rio Online" title="Optimization Guide" />
			<Panel className="p-6">
				<p className="text-sm text-fog-300">
					The full optimization guide is coming soon. In the meantime,{' '}
					<a href="https://blippi.gg/optimize" target="_blank" rel="noreferrer" className="text-star-400 hover:text-star-300">
						blippi.gg/optimize
					</a>{' '}
					covers the essentials for low-latency netplay.
				</p>
			</Panel>
		</div>
	);
}
