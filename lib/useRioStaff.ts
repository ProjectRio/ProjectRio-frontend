'use client';

import { useEffect, useState } from 'react';
import { useUsername } from './useUsername';
import { isUserInGroup } from './communityApi';

// Rio staff = Admin or TrustedUser user group. This only gates what the UI
// shows — the backend re-checks group membership on every action.
const cache = new Map<string, Promise<boolean>>();

function checkStaff(username: string): Promise<boolean> {
	let pending = cache.get(username);
	if (!pending) {
		pending = Promise.all([
			isUserInGroup(username, 'Admin').catch(() => false),
			isUserInGroup(username, 'TrustedUser').catch(() => false)
		]).then(([admin, trusted]) => admin || trusted);
		cache.set(username, pending);
	}
	return pending;
}

export function useRioStaff(): { isStaff: boolean; loading: boolean } {
	const username = useUsername();
	const [state, setState] = useState<{ isStaff: boolean; loading: boolean }>({ isStaff: false, loading: true });

	useEffect(() => {
		if (!username) {
			setState({ isStaff: false, loading: false });
			return;
		}
		let cancelled = false;
		checkStaff(username).then((isStaff) => {
			if (!cancelled) setState({ isStaff, loading: false });
		});
		return () => {
			cancelled = true;
		};
	}, [username]);

	return state;
}
