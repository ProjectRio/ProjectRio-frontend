'use client';

import { useEffect } from 'react';
import { PARKS, PARK_EVENT, PARK_STORAGE_KEY, PARK_THEMES_ENABLED } from './parks';

/**
 * A game page is played in its own stadium: while it is mounted the site takes
 * that park's ground and wall, then goes back to the visitor's home park.
 * `stadiumId` is the game's stadium ID, which is the index into PARKS.
 */
export function useGamePark(stadiumId: number | undefined | null) {
	useEffect(() => {
		const park = stadiumId === undefined || stadiumId === null ? undefined : PARKS[stadiumId];
		if (!park || !PARK_THEMES_ENABLED) return;
		const root = document.documentElement;
		root.dataset.park = park.key;
		window.dispatchEvent(new Event(PARK_EVENT));
		return () => {
			let home: string | null = null;
			try {
				home = localStorage.getItem(PARK_STORAGE_KEY);
			} catch {
				// Private mode: fall back to the default park.
			}
			if (home) root.dataset.park = home;
			else delete root.dataset.park;
			window.dispatchEvent(new Event(PARK_EVENT));
		};
	}, [stadiumId]);
}
