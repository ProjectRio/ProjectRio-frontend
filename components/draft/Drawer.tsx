'use client';

// A pull-over panel from the right edge (full width on phones). The room
// stays live underneath; Escape or the backdrop closes it.

import { useEffect, type ReactNode } from 'react';

export default function Drawer({ open, onClose, title, kicker, width = 'w-[min(100vw,30rem)]', children }: { open: boolean; onClose: () => void; title: string; kicker?: ReactNode; width?: string; children: ReactNode }) {
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
			<button type="button" className="absolute inset-0 bg-black/60" aria-label="Close" onClick={onClose} />
			<aside className={`popover absolute inset-y-0 right-0 flex ${width} flex-col !rounded-none`}>
				<header className="flex items-center gap-3 px-4 pb-2 pt-3">
					<div className="min-w-0 flex-1">
						<h2 className="text-xl leading-none">{title}</h2>
						{kicker && <p className="mt-1 flex flex-wrap gap-x-3 text-xs text-fog-500">{kicker}</p>}
					</div>
					<button type="button" className="key px-2.5 pb-0.5 pt-1 font-display text-xs font-semibold" onClick={onClose}>
						Close
					</button>
				</header>
				<div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
			</aside>
		</div>
	);
}
