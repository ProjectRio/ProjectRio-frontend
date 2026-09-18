'use client';

/* eslint-disable @next/next/no-img-element */

// Small shared pieces for the leagues section: sprites, money, team marks,
// presence, the countdown clock, and one-line reasons.

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { assetImage, CLASS_HUES, STADIUM_HUES, STADIUM_SHORT } from '@/lib/draft/assets';
import type { Asset, DraftSnapshot, DraftState, RestrictionIcon, SnapshotTeam } from '@/lib/draft/types';
import type { ActionError } from '@/lib/draft/useDraft';
import { useCountdown } from '@/lib/draft/useDraft';
import { teamImage } from '@/lib/data/teamNames';

// Character sprites are 52×60; `size` is the height and width follows.
export const SPRITE_RATIO = 52 / 60;

export function AssetSprite({ asset, size = 40, className = '', dim = false }: { asset: Asset; size?: number; className?: string; dim?: boolean }) {
	if (asset.kind === 'character') {
		const width = Math.round(size * SPRITE_RATIO);
		return (
			<img
				src={assetImage(asset)!}
				alt={asset.name}
				width={width}
				height={size}
				draggable={false}
				className={`shrink-0 select-none [image-rendering:pixelated] ${dim ? 'opacity-35 grayscale' : ''} ${className}`}
				style={{ width, height: size }}
			/>
		);
	}
	const hue = STADIUM_HUES[asset.stadium_id ?? 0];
	return (
		<span
			aria-label={asset.name}
			className={`inline-flex shrink-0 items-center justify-center rounded font-display font-bold uppercase leading-none text-night-950 ${dim ? 'opacity-35 grayscale' : ''} ${className}`}
			style={{ width: Math.round(size * SPRITE_RATIO), height: size, backgroundColor: hue, fontSize: Math.max(9, size * 0.3) }}
		>
			{STADIUM_SHORT[asset.stadium_id ?? 0]}
		</span>
	);
}

export function ClassDot({ asset, className = '' }: { asset: Asset; className?: string }) {
	const hue = asset.kind === 'stadium' ? STADIUM_HUES[asset.stadium_id ?? 0] : CLASS_HUES[asset.class ?? ''];
	return <span className={`inline-block h-1.5 w-1.5 rounded-full ${className}`} style={{ backgroundColor: hue }} />;
}

export function ClassTag({ asset }: { asset: Asset }) {
	const label = asset.kind === 'stadium' ? 'Stadium' : asset.class;
	return (
		<span className="inline-flex items-center gap-1.5 font-display text-xs font-semibold uppercase tracking-widest text-fog-500">
			<ClassDot asset={asset} />
			{label}
			{asset.captain && <span className="text-star-400" title="Captain-eligible">✪</span>}
		</span>
	);
}

export function Money({ amount, className = '' }: { amount: number; className?: string }) {
	return (
		<span className={`tabular-nums ${className}`}>
			<span className="opacity-60">$</span>
			{amount}
		</span>
	);
}

export function TeamLogo({ logo, name, size = 28, className = '' }: { logo: string | null; name: string; size?: number; className?: string }) {
	if (!logo) {
		return (
			<span
				className={`inline-flex shrink-0 items-center justify-center rounded-full bg-night-700 font-display text-[10px] font-bold uppercase text-fog-300 ${className}`}
				style={{ width: size, height: size }}
			>
				{name.slice(0, 2)}
			</span>
		);
	}
	return (
		<img
			src={teamImage(logo)}
			alt=""
			width={size}
			height={size}
			draggable={false}
			className={`shrink-0 rounded-full bg-night-800 object-contain [image-rendering:pixelated] ${className}`}
			style={{ width: size, height: size }}
		/>
	);
}

export function RestrictionMarks({ icons, size = 'sm' }: { icons: RestrictionIcon[]; size?: 'sm' | 'md' }) {
	if (icons.length === 0) return null;
	const sizing = size === 'sm' ? 'h-3.5 min-w-3.5 px-0.5 text-[9px]' : 'h-5 min-w-5 px-1 text-[11px]';
	return (
		<span className="inline-flex gap-0.5">
			{icons.map((icon) => (
				<span
					key={icon.code + icon.label}
					title={icon.label}
					className={`inline-flex items-center justify-center rounded-sm border border-star-500/50 bg-night-950/80 font-display font-bold leading-none text-star-400 ${sizing}`}
				>
					{icon.code}
				</span>
			))}
		</span>
	);
}

export function PresenceDot({ present, className = '' }: { present: boolean; className?: string }) {
	return (
		<span
			title={present ? 'Connected' : 'Away'}
			className={`inline-block h-2 w-2 shrink-0 rounded-full ${present ? 'bg-emerald-400 shadow-[0_0_6px_rgb(52_211_153_/_0.8)]' : 'bg-night-600'} ${className}`}
		/>
	);
}

export function SlotDots({ open, total, className = '' }: { open: number; total: number; className?: string }) {
	return (
		<span className={`inline-flex gap-0.5 ${className}`} title={`${total - open}/${total} slots filled`}>
			{Array.from({ length: total }, (_, index) => (
				<span key={index} className={`h-1.5 w-1.5 rounded-sm ${index < total - open ? 'bg-fog-300' : 'bg-night-600'}`} />
			))}
		</span>
	);
}

export function StateChip({ state, paused }: { state: DraftState; paused: boolean }) {
	if (paused) return <span className="inline-flex items-center gap-1.5 rounded border border-star-500/40 bg-star-500/15 px-2 py-0.5 font-display text-xs font-bold uppercase tracking-widest text-star-400">Paused</span>;
	const styles: Record<DraftState, string> = {
		setup: 'border-night-600 bg-night-700/50 text-fog-300',
		lobby: 'border-fog-500/40 bg-night-700/50 text-fog-100',
		live: 'border-rio-500/50 bg-rio-500/15 text-rio-300',
		completed: 'border-emerald-500/40 bg-emerald-500/15 text-emerald-300'
	};
	const labels: Record<DraftState, string> = { setup: 'Setup', lobby: 'Lobby', live: 'Live', completed: 'Completed' };
	return (
		<span className={`inline-flex items-center gap-1.5 rounded border px-2 py-0.5 font-display text-xs font-bold uppercase tracking-widest ${styles[state]}`}>
			{state === 'live' && (
				<span className="relative flex h-2 w-2">
					<span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rio-400 opacity-75" />
					<span className="relative inline-flex h-2 w-2 rounded-full bg-rio-500" />
				</span>
			)}
			{labels[state]}
		</span>
	);
}

export function Kbd({ children }: { children: ReactNode }) {
	return <kbd className="rounded border border-night-600 bg-night-850 px-1.5 py-0.5 font-mono text-[10px] text-fog-500">{children}</kbd>;
}

export function Reason({ error, types, className = '' }: { error: ActionError | null; types?: string[]; className?: string }) {
	if (!error) return null;
	if (types && !types.includes(error.type)) return null;
	return (
		<p role="alert" className={`text-sm text-rio-300 ${className}`}>
			{error.message}
		</p>
	);
}

export function SectionLabel({ children, action }: { children: ReactNode; action?: ReactNode }) {
	return (
		<div className="flex items-center justify-between border-b border-night-700 bg-night-850 px-3 py-2">
			<h3 className="font-display text-xs font-bold uppercase tracking-widest text-fog-300">{children}</h3>
			{action}
		</div>
	);
}

export function findTeam(snapshot: DraftSnapshot, teamId: number | null | undefined): SnapshotTeam | undefined {
	if (teamId === null || teamId === undefined) return undefined;
	return snapshot.teams.find((team) => team.id === teamId);
}

export function teamShort(name: string): string {
	const words = name.replace(/[^A-Za-z0-9 ]/g, '').split(' ').filter(Boolean);
	if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase();
	return name.slice(0, 3).toUpperCase();
}

export function timeAgo(ms: number, now = Date.now()): string {
	const seconds = Math.max(0, Math.round((now - ms) / 1000));
	if (seconds < 5) return 'now';
	if (seconds < 60) return `${seconds}s`;
	const minutes = Math.floor(seconds / 60);
	if (minutes < 60) return `${minutes}m`;
	const hours = Math.floor(minutes / 60);
	if (hours < 24) return `${hours}h`;
	return `${Math.floor(hours / 24)}d`;
}

export function formatDuration(ms: number): string {
	if (ms <= 0) return '0:00';
	const total = Math.floor(ms / 1000);
	const days = Math.floor(total / 86400);
	const hours = Math.floor((total % 86400) / 3600);
	const minutes = Math.floor((total % 3600) / 60);
	const seconds = total % 60;
	if (days > 0) return `${days}d ${hours}h`;
	if (hours > 0) return `${hours}h ${String(minutes).padStart(2, '0')}m`;
	return `${minutes}:${String(seconds).padStart(2, '0')}`;
}

/** The lot clock: a ring with numerals, tenths under five seconds. */
export function Clock({
	closesAt,
	pausedRemaining,
	paused,
	untimedLabel = 'Untimed',
	serverNow,
	size = 96,
	total
}: {
	closesAt: number | null;
	pausedRemaining?: number | null;
	paused?: boolean;
	untimedLabel?: string;
	serverNow: () => number;
	size?: number;
	total?: number;
}) {
	const { seconds, label, urgent } = useCountdown(closesAt, serverNow);
	const radius = size / 2 - 5;
	const circumference = 2 * Math.PI * radius;
	const full = total ?? Math.max(seconds, 1);
	const fraction = closesAt ? Math.min(1, seconds / full) : 1;
	const frozen = paused || (closesAt === null && pausedRemaining != null);
	const text = frozen ? (pausedRemaining != null ? Math.ceil(pausedRemaining).toString() : '—') : closesAt === null ? untimedLabel : label;
	const isTiny = text.length > 4;
	return (
		<div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }} aria-hidden={closesAt !== null}>
			<svg width={size} height={size} className="absolute inset-0 -rotate-90">
				<circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="var(--color-night-700)" strokeWidth={4} />
				{closesAt !== null && !frozen && (
					<circle
						cx={size / 2}
						cy={size / 2}
						r={radius}
						fill="none"
						stroke={urgent ? 'var(--color-rio-400)' : 'var(--color-fog-100)'}
						strokeWidth={4}
						strokeLinecap="round"
						strokeDasharray={circumference}
						strokeDashoffset={circumference * (1 - fraction)}
					/>
				)}
				{frozen && <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="var(--color-star-500)" strokeWidth={4} strokeDasharray="6 6" />}
			</svg>
			<span
				className={`relative font-display font-bold tabular-nums leading-none ${urgent && !frozen && closesAt ? 'animate-pulse text-rio-400' : frozen ? 'text-star-400' : 'text-fog-100'} ${
					isTiny ? 'text-xs uppercase tracking-widest' : ''
				}`}
				style={{ fontSize: isTiny ? undefined : size * 0.32 }}
			>
				{text}
			</span>
		</div>
	);
}

/** Flash a value's container briefly whenever it changes. */
export function useFlash<T>(value: T, duration = 900): boolean {
	const [flash, setFlash] = useState(false);
	const first = useRef(true);
	useEffect(() => {
		if (first.current) {
			first.current = false;
			return;
		}
		setFlash(true);
		const timer = setTimeout(() => setFlash(false), duration);
		return () => clearTimeout(timer);
	}, [value, duration]);
	return flash;
}

/** aria-live text that updates at most every `interval` ms (§10e). */
export function useThrottled(value: string, interval = 2000): string {
	const [shown, setShown] = useState(value);
	const last = useRef(0);
	useEffect(() => {
		const elapsed = Date.now() - last.current;
		if (elapsed >= interval) {
			last.current = Date.now();
			setShown(value);
			return;
		}
		const timer = setTimeout(() => {
			last.current = Date.now();
			setShown(value);
		}, interval - elapsed);
		return () => clearTimeout(timer);
	}, [value, interval]);
	return shown;
}
