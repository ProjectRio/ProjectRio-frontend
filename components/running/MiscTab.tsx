import TabSection, { Placeholder } from '@/components/running/TabSection';

/** The "Misc" tab of the running analysis page. */
export default function MiscTab() {
	return (
		<div className="space-y-8">
			<TabSection title="Prohibited Movements">
				<Placeholder />
			</TabSection>

			<TabSection title="Scoring Runs">
				<Placeholder />
			</TabSection>

			<TabSection title="Tagging Up">
				<Placeholder />
			</TabSection>
		</div>
	);
}
