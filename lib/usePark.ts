'use client';

import { useSyncExternalStore } from 'react';
import { PARK_EVENT, currentPark, type ParkKey } from './parks';

function subscribe(onChange: () => void) {
	window.addEventListener(PARK_EVENT, onChange);
	return () => window.removeEventListener(PARK_EVENT, onChange);
}

export function usePark(): ParkKey {
	return useSyncExternalStore(subscribe, currentPark, () => 'mario' as ParkKey);
}
