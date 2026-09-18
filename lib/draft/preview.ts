'use client';

// Preview-only controls for the mock server: who you are looking at the room
// as, and the failure toggles from §10b. Persisted per tab in sessionStorage.

import { useSyncExternalStore } from 'react';
import type { Viewer } from './types';

export type ViewAs = { kind: 'commissioner' } | { kind: 'team'; team_id: number } | { kind: 'spectator' } | { kind: 'anonymous' };

export interface PreviewSettings {
	viewAs: ViewAs;
	slowNetwork: boolean;
	offline: boolean;
	sound: boolean;
	/** Hide the site chrome around the room (streams, OBS). */
	focus: boolean;
	/** Team ids whose managers are simulated as disconnected. */
	disconnectedTeams: number[];
}

const KEY = 'rio:draft-preview';
const EVENT = 'rio:draft-preview';

const DEFAULTS: PreviewSettings = {
	viewAs: { kind: 'commissioner' },
	slowNetwork: false,
	offline: false,
	sound: false,
	focus: false,
	disconnectedTeams: []
};

let cached: PreviewSettings | null = null;

/** `?as=commissioner|spectator|anonymous|team:<id>` picks the identity for this tab. */
function fromQuery(): ViewAs | null {
	const value = new URLSearchParams(window.location.search).get('as');
	if (!value) return null;
	if (value.startsWith('team:')) return { kind: 'team', team_id: Number(value.slice(5)) };
	if (value === 'commissioner' || value === 'spectator' || value === 'anonymous') return { kind: value };
	return null;
}

function read(): PreviewSettings {
	if (cached) return cached;
	if (typeof window === 'undefined') return DEFAULTS;
	try {
		const raw = sessionStorage.getItem(KEY);
		cached = raw ? { ...DEFAULTS, ...JSON.parse(raw) } : DEFAULTS;
	} catch {
		cached = DEFAULTS;
	}
	const override = fromQuery();
	if (override) {
		cached = { ...cached!, viewAs: override };
		try {
			sessionStorage.setItem(KEY, JSON.stringify(cached));
		} catch {
			/* private mode */
		}
	}
	return cached!;
}

export function getPreview(): PreviewSettings {
	return read();
}

export function setPreview(patch: Partial<PreviewSettings>) {
	cached = { ...read(), ...patch };
	try {
		sessionStorage.setItem(KEY, JSON.stringify(cached));
	} catch {
		/* private mode */
	}
	window.dispatchEvent(new Event(EVENT));
}

function subscribe(callback: () => void) {
	window.addEventListener(EVENT, callback);
	return () => window.removeEventListener(EVENT, callback);
}

export function usePreview(): PreviewSettings {
	return useSyncExternalStore(subscribe, read, () => DEFAULTS);
}

/** Stable identities the mock server recognises. */
export const COMMISSIONER_USER: Viewer = { user_id: 1, username: 'MattGree' };
export const SPECTATOR_USER: Viewer = { user_id: 999, username: 'Spectator' };
export const ANONYMOUS_USER: Viewer = { user_id: null, username: null };
