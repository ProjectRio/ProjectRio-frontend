import type { ReactNode } from 'react';
import { Panel } from '@/components/ui';

/**
 * A titled panel of prose, used for each section of the running analysis tabs.
 * Text (paragraphs, lists) is held to a reading measure; charts and tables placed in it use the full width.
 */
export default function TabSection({ title, children }: { title: string; children: ReactNode }) {
	return (
		<Panel className="p-5 sm:p-6">
			<h2 className="text-2xl">{title}</h2>
			<div className="mt-3 space-y-3 text-[15px] leading-relaxed text-fog-300 [&>:is(p,ul,ol)]:max-w-[70ch]">{children}</div>
		</Panel>
	);
}

/** A table set straight into a TabSection's panel, running edge to edge and scrolling sideways on its own when narrow. */
export function SectionTable({ children }: { children: ReactNode }) {
	return <div className="-mx-5 overflow-x-auto py-1 sm:-mx-6">{children}</div>;
}

/** Placeholder text for a section that hasn't been written yet. */
export function Placeholder() {
	return <p className="italic text-fog-500">Text goes here.</p>;
}
