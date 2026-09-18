'use client';

// A pull-over panel from the right edge (full width on phones). The room
// stays live underneath; Escape or the backdrop closes it.

import { useEffect, type ReactNode } from 'react';

export default function Drawer({ open, onClose, title, kicker, width = 'w-[min(100vw,30rem)]', children }: { open: boolean; onClose: () => void; title: string; kicker?: string; width?: string; children: ReactNode }) {
	useEffect(() => {
		if (!open) return;
		function onKey(event: KeyboardEvent) {
			if (event.key === 'Escape') onClose();
		}
		window.addEventListener('keydown', onKey);
		return () => window.removeEventListener('keydown', onKey);
	}, [open, onClose]);
	if (!open) return null;
	return (
		<div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label={title}>
			<button type="button" className="absolute inset-0 bg-night-950/60" aria-label="Close" onClick={onClose} />
			<aside className={`absolute inset-y-0 right-0 flex ${width} flex-col border-l border-night-700 bg-night-900 shadow-2xl`}>
				<header className="flex items-center gap-3 border-b border-night-700 bg-night-850 px-4 py-2.5">
					<div className="min-w-0 flex-1">
						{kicker && <p className="kicker">{kicker}</p>}
						<h2 className="text-lg uppercase leading-none">{title}</h2>
					</div>
					<button type="button" className="rounded border border-night-600 px-2 py-1 font-display text-[11px] font-bold uppercase tracking-widest text-fog-300 hover:border-fog-500 hover:text-fog-100" onClick={onClose}>
						Close
					</button>
				</header>
				<div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
			</aside>
		</div>
	);
}
