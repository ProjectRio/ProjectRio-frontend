import type { DraftAction } from '../types';
import type { DraftRow } from './state';

export interface Actor {
	user_id: number | null;
	username: string;
	team_id: number | null;
	is_commissioner: boolean;
}

export interface FormatModule {
	start(draft: DraftRow): void;
	handle(draft: DraftRow, actor: Actor, action: DraftAction): void;
	/** Timers. Returns true when something changed. */
	tick(draft: DraftRow, now: number): boolean;
	/** Commissioner: open the next lot (manual advance) — no-op for formats without lots. */
	openNext?(draft: DraftRow): void;
	/** Commissioner: close the current lot / bidding now. */
	closeCurrent?(draft: DraftRow): void;
	/** Freeze / thaw every running clock (pause, resume, restart). */
	freeze(draft: DraftRow, now: number): void;
	thaw(draft: DraftRow, now: number, minSeconds: number): void;
}

interface Timed {
	closes_at: number | null;
	paused_remaining_s: number | null;
}

export function freezeClock(row: Timed, now: number) {
	if (row.closes_at === null) return;
	row.paused_remaining_s = Math.max(0, (row.closes_at - now) / 1000);
	row.closes_at = null;
}

export function thawClock(row: Timed, now: number, minSeconds: number) {
	if (row.paused_remaining_s === null) return;
	row.closes_at = now + Math.max(row.paused_remaining_s, minSeconds) * 1000;
	row.paused_remaining_s = null;
}
