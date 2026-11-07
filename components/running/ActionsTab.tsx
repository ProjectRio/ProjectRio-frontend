import TabSection, { Placeholder } from '@/components/running/TabSection';

/** The "Actions" tab of the running analysis page. */
export default function ActionsTab() {
	return (
		<div className="space-y-8">
			<TabSection title="Sliding">
				<Placeholder />
			</TabSection>

			<TabSection title="Body Check">
				<Placeholder />
			</TabSection>
		</div>
	);
}
