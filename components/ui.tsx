import Link from 'next/link';
import type { ReactNode } from 'react';
import LoadingTip from './LoadingTip';

export function PageHeader({
	kicker,
	title,
	children
}: {
	kicker?: string;
	title: string;
	children?: ReactNode;
}) {
	return (
		<div className="mb-8">
			<div className="flex flex-wrap items-end justify-between gap-4">
				<div>
					{kicker && <p className="kicker">{kicker}</p>}
					<h1 className="mt-2 text-4xl sm:text-5xl">{title}</h1>
				</div>
				{children && <div className="flex items-center gap-3">{children}</div>}
			</div>
			{/* Foul line */}
			<div className="chalk mt-4" />
		</div>
	);
}

export function Panel({ className = '', children }: { className?: string; children: ReactNode }) {
	return <div className={`panel ${className}`}>{children}</div>;
}

export function PanelHeader({ title, action }: { title: string; action?: ReactNode }) {
	return (
		<div className="flex items-center justify-between border-b border-[var(--rim)] bg-black/30 px-4 py-2.5">
			<h2 className="font-display text-base font-semibold uppercase tracking-[0.12em] text-fog-300">{title}</h2>
			{action}
		</div>
	);
}

export function Spinner({ label = 'Loading…' }: { label?: string }) {
	return <LoadingTip label={label} />;
}

export function EmptyState({ title, detail }: { title: string; detail?: string }) {
	return (
		<div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
			<p className="font-display text-lg font-semibold uppercase tracking-wider text-fog-300">{title}</p>
			{detail && <p className="max-w-md text-sm text-fog-500">{detail}</p>}
		</div>
	);
}

export function ErrorState({ message }: { message: string }) {
	return (
		<div className="rounded-lg border border-rio-700 bg-rio-700/10 px-4 py-3 text-sm text-rio-300">{message}</div>
	);
}

export function Badge({
	color = 'red',
	children
}: {
	color?: 'red' | 'gold' | 'gray' | 'green';
	children: ReactNode;
}) {
	const colors = {
		red: 'bg-rio-500/15 text-rio-300 border-rio-500/40',
		gold: 'bg-star-500/15 text-star-400 border-star-500/40',
		gray: 'bg-black/40 text-fog-300 border-night-600',
		green: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40'
	};
	return (
		<span
			className={`inline-flex items-center gap-1 rounded border px-2 py-0.5 font-display text-xs font-semibold uppercase tracking-wider ${colors[color]}`}
		>
			{children}
		</span>
	);
}

export function PlayerLink({ username, className = '' }: { username: string; className?: string }) {
	return (
		<Link
			href={`/users/${encodeURIComponent(username)}`}
			className={`font-medium text-fog-100 underline decoration-transparent underline-offset-4 transition-colors hover:decoration-fog-300 ${className}`}
		>
			{username}
		</Link>
	);
}

export function LiveDot() {
	return (
		<span className="relative flex h-2.5 w-2.5">
			<span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rio-400 opacity-75" />
			<span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-rio-500" />
		</span>
	);
}
