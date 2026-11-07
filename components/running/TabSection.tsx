import type { ReactNode } from 'react';
import { Panel, PanelHeader } from '@/components/ui';

/** A titled panel of prose, used for each section of the running analysis tabs. */
export default function TabSection({ title, children }: { title: string; children: ReactNode }) {
	return (
		<Panel>
			<PanelHeader title={title} />
			<div className="max-w-3xl space-y-3 p-5 text-sm leading-relaxed text-fog-300">{children}</div>
		</Panel>
	);
}

/** Placeholder text for a section that hasn't been written yet. */
export function Placeholder() {
	return <p className="italic text-fog-500">Text goes here.</p>;
}
