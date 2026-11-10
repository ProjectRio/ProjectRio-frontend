import { PageHeader, Panel } from '@/components/ui';

export const metadata = { title: 'Events' };

export default function EventsPage() {
	return (
		<div>
			<PageHeader kicker="Rio Online" title="Events" />
			<Panel className="p-6">
				<p className="text-sm text-fog-300">
					If you aren&apos;t already, it is highly recommended you join{' '}
					<a
						href="https://discord.com/invite/9ZZtpuEPCd"
						target="_blank"
						rel="noreferrer"
						className="text-star-400 hover:text-star-300"
					>
						the Discord
					</a>{' '}
					before entering any events. Upcoming community events will be listed here.
				</p>
			</Panel>
		</div>
	);
}
