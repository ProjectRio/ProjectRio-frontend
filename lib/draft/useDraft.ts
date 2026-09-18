'use client';

// The client holds the latest snapshot and nothing else (§10d). Actions show
// pending until a snapshot with a version ≥ the returned one arrives; a 409
// becomes a one-line reason.

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { leagueById } from './fixtures';
import { getTransport } from './mock/transport';
import { ANONYMOUS_USER, COMMISSIONER_USER, SPECTATOR_USER, usePreview, type PreviewSettings } from './preview';
import { ERROR_MESSAGES, type ActionResult, type DraftAction, type DraftSnapshot, type ErrorCode, type Viewer } from './types';

export type Connection = 'connecting' | 'live' | 'offline';

export interface ActionError {
	code: ErrorCode;
	message: string;
	at: number;
	type: DraftAction['type'];
}

export function viewerFor(leagueId: number, preview: PreviewSettings): Viewer {
	const league = leagueById(leagueId);
	switch (preview.viewAs.kind) {
		case 'commissioner':
			return COMMISSIONER_USER;
		case 'spectator':
			return SPECTATOR_USER;
		case 'anonymous':
			return ANONYMOUS_USER;
		case 'team': {
			const teamId = preview.viewAs.team_id;
			const row = league?.teams.find((candidate) => candidate.id === teamId);
			const manager = row?.managers[0];
			return manager ? { user_id: manager.rio_user_id, username: manager.username } : SPECTATOR_USER;
		}
	}
}

export function useDraft(leagueId: number) {
	const preview = usePreview();
	const viewer = useMemo(() => viewerFor(leagueId, preview), [leagueId, preview]);
	const [snapshot, setSnapshot] = useState<DraftSnapshot | null>(null);
	const [connection, setConnection] = useState<Connection>('connecting');
	const [pending, setPending] = useState<Set<string>>(new Set());
	const [error, setError] = useState<ActionError | null>(null);
	const versionRef = useRef(0);
	const offsetRef = useRef(0);
	const previousRef = useRef<DraftSnapshot | null>(null);

	useEffect(() => {
		versionRef.current = 0;
		setSnapshot(null);
		setConnection(preview.offline ? 'offline' : 'connecting');
		if (preview.offline) return;
		const unsubscribe = getTransport().subscribe(leagueId, viewer, (next) => {
			if (next.draft.version < versionRef.current) return;
			versionRef.current = next.draft.version;
			offsetRef.current = next.draft.server_time - Date.now();
			setSnapshot((current) => {
				previousRef.current = current;
				return next;
			});
			setConnection('live');
			setPending(new Set());
		});
		return unsubscribe;
	}, [leagueId, viewer, preview.offline]);

	const act = useCallback(
		async (action: DraftAction): Promise<ActionResult> => {
			const clientActionId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
			setPending((current) => new Set(current).add(action.type));
			setError(null);
			const result = await getTransport().act(leagueId, viewer, action, clientActionId);
			if (!result.ok) {
				setPending((current) => {
					const next = new Set(current);
					next.delete(action.type);
					return next;
				});
				setError({ code: result.code, message: result.message || ERROR_MESSAGES[result.code], at: Date.now(), type: action.type });
			} else if (result.version <= versionRef.current) {
				setPending((current) => {
					const next = new Set(current);
					next.delete(action.type);
					return next;
				});
			}
			return result;
		},
		[leagueId, viewer]
	);

	const serverNow = useCallback(() => Date.now() + offsetRef.current, []);

	return { snapshot, previous: previousRef.current, connection, act, pending, error, clearError: () => setError(null), viewer, serverNow, preview };
}

export type DraftHandle = ReturnType<typeof useDraft>;

/** Countdown driven by requestAnimationFrame; tenths under five seconds. */
export function useCountdown(closesAt: number | null, serverNow: () => number): { seconds: number; label: string; urgent: boolean } {
	const [remaining, setRemaining] = useState(() => (closesAt ? Math.max(0, closesAt - serverNow()) : 0));
	useEffect(() => {
		if (!closesAt) {
			setRemaining(0);
			return;
		}
		let frame = 0;
		const loop = () => {
			setRemaining(Math.max(0, closesAt - serverNow()));
			frame = requestAnimationFrame(loop);
		};
		frame = requestAnimationFrame(loop);
		return () => cancelAnimationFrame(frame);
	}, [closesAt, serverNow]);
	const seconds = remaining / 1000;
	const urgent = seconds < 5;
	const label = closesAt === null ? '' : seconds < 5 ? seconds.toFixed(1) : seconds >= 60 ? `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, '0')}` : String(Math.ceil(seconds));
	return { seconds, label, urgent };
}
