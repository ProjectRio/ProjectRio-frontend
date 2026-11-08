'use client';

import { useEffect, type ReactNode } from 'react';

export function Modal({
	title,
	onClose,
	children
}: {
	title: string;
	onClose: () => void;
	children: ReactNode;
}) {
	useEffect(() => {
		function onKey(event: KeyboardEvent) {
			if (event.key === 'Escape') onClose();
		}
		window.addEventListener('keydown', onKey);
		return () => window.removeEventListener('keydown', onKey);
	}, [onClose]);

	return (
		<div
			className="fixed inset-0 z-[60] flex items-center justify-center bg-night-950/80 p-4 backdrop-blur-sm"
			onClick={onClose}
			role="dialog"
			aria-modal="true"
			aria-label={title}
		>
			<div
				className="panel max-h-[85vh] w-full max-w-lg overflow-y-auto"
				onClick={(event) => event.stopPropagation()}
			>
				<div className="flex items-center justify-between border-b border-night-700 bg-night-850 px-4 py-3">
					<h2 className="font-display text-sm font-bold uppercase tracking-widest text-fog-300">{title}</h2>
					<button
						type="button"
						aria-label="Close"
						className="p-1 text-fog-500 transition-colors hover:text-fog-100"
						onClick={onClose}
					>
						<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
							<path d="M6 6l12 12M18 6L6 18" />
						</svg>
					</button>
				</div>
				<div className="p-5">{children}</div>
			</div>
		</div>
	);
}

export function Tabs({
	tabs,
	active,
	onChange
}: {
	tabs: { id: string; label: string }[];
	active: string;
	onChange: (id: string) => void;
}) {
	return (
		<div className="mb-6 flex flex-wrap gap-1 border-b border-night-700" role="tablist">
			{tabs.map((tab) => (
				<button
					key={tab.id}
					role="tab"
					aria-selected={active === tab.id}
					className={`-mb-px border-b-2 px-4 py-2.5 font-display text-sm font-semibold uppercase tracking-wider transition-colors ${
						active === tab.id
							? 'border-rio-500 text-fog-100'
							: 'border-transparent text-fog-500 hover:text-fog-300'
					}`}
					onClick={() => onChange(tab.id)}
				>
					{tab.label}
				</button>
			))}
		</div>
	);
}
