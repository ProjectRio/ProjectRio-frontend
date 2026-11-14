'use client';

import { useEffect, useMemo, useState, type ReactNode } from 'react';

/**
 * A draft tab is only shown in development, marked "Draft", so it can be written locally without
 * appearing on the live site. To publish a tab, remove its `draft` flag.
 */
export type TabDef = { id: string; label: string; content: ReactNode; draft?: boolean };

const SHOW_DRAFTS = process.env.NODE_ENV !== 'production';

/**
 * Simple tab strip. The active tab is mirrored to the URL hash (#basics) so tabs can be linked to.
 * All panels are rendered and inactive ones hidden, so server-rendered content and component state survive switching.
 */
export default function Tabs({ tabs: allTabs }: { tabs: TabDef[] }) {
	const tabs = useMemo(() => allTabs.filter((t) => SHOW_DRAFTS || !t.draft), [allTabs]);
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
			<div role="tablist" className="tab-strip">
				{tabs.map((t) => (
					<button
						key={t.id}
						type="button"
						role="tab"
						id={`tab-${t.id}`}
						aria-selected={active === t.id}
						aria-controls={`panel-${t.id}`}
						onClick={() => select(t.id)}
						className="inline-flex items-center gap-2 whitespace-nowrap"
					>
						{t.label}
						{t.draft && <span className="plate text-fog-100">Draft</span>}
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
