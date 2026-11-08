'use client';

import { useEffect, useState, type ReactNode } from 'react';

export type TabDef = { id: string; label: string; content: ReactNode };

/**
 * Simple tab strip. The active tab is mirrored to the URL hash (#basics) so tabs can be linked to.
 * All panels are rendered and inactive ones hidden, so server-rendered content and component state survive switching.
 */
export default function Tabs({ tabs }: { tabs: TabDef[] }) {
	const [active, setActive] = useState(tabs[0]?.id);

	useEffect(() => {
		const fromHash = () => {
			const id = window.location.hash.slice(1);
			if (tabs.some((t) => t.id === id)) setActive(id);
		};
		fromHash();
		window.addEventListener('hashchange', fromHash);
		return () => window.removeEventListener('hashchange', fromHash);
	}, [tabs]);

	const select = (id: string) => {
		setActive(id);
		history.replaceState(null, '', `#${id}`);
	};

	return (
		<div className="space-y-8">
			<div role="tablist" className="flex flex-wrap gap-x-1 border-b border-night-700">
				{tabs.map((t) => (
					<button
						key={t.id}
						type="button"
						role="tab"
						id={`tab-${t.id}`}
						aria-selected={active === t.id}
						aria-controls={`panel-${t.id}`}
						onClick={() => select(t.id)}
						className={`-mb-px shrink-0 whitespace-nowrap border-b-2 px-4 py-2 font-display text-sm font-bold uppercase tracking-widest transition-colors ${
							active === t.id ? 'border-star-400 text-fog-100' : 'border-transparent text-fog-500 hover:text-fog-300'
						}`}
					>
						{t.label}
					</button>
				))}
			</div>
			{tabs.map((t) => (
				<div key={t.id} role="tabpanel" id={`panel-${t.id}`} aria-labelledby={`tab-${t.id}`} hidden={active !== t.id}>
					{t.content}
				</div>
			))}
		</div>
	);
}
