import TabSection, { Placeholder } from '@/components/running/TabSection';

/** The "CPU" tab of the running analysis page. */
export default function CpuTab() {
	return (
		<div className="space-y-8">
			<TabSection title="CPU">
				<Placeholder />
			</TabSection>
		</div>
	);
}
