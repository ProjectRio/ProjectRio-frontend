/**
 * Home park. The site's ground, wall and accent follow one of the game's seven
 * stadiums; the choice lives in localStorage and on <html data-park>.
 * Colours are in app/globals.css. Order is the game's stadium ID order.
 */
export const PARKS = [
	{ key: 'mario', name: 'Mario Stadium' },
	{ key: 'bowser', name: 'Bowser Castle' },
	{ key: 'wario', name: 'Wario Palace' },
	{ key: 'yoshi', name: 'Yoshi Park' },
	{ key: 'peach', name: 'Peach Garden' },
	{ key: 'dk', name: 'DK Jungle' },
	{ key: 'toy', name: 'Toy Field' }
] as const;

export type ParkKey = (typeof PARKS)[number]['key'];

export const PARK_STORAGE_KEY = 'rio-park';
export const PARK_EVENT = 'rio-park-change';

/**
 * Park theming is parked while the design settles on Mario Stadium: with this
 * off, every page uses the default park, a saved choice is ignored and the
 * picker is hidden. Flip it to bring the other six back.
 */
export const PARK_THEMES_ENABLED = false;

export const PARK_BOOT_SCRIPT = !PARK_THEMES_ENABLED
	? ''
	: `try{var p=localStorage.getItem('${PARK_STORAGE_KEY}');if(p)document.documentElement.dataset.park=p}catch(e){}`;

export function currentPark(): ParkKey {
	if (!PARK_THEMES_ENABLED || typeof document === 'undefined') return 'mario';
	const value = document.documentElement.dataset.park;
	return PARKS.some((park) => park.key === value) ? (value as ParkKey) : 'mario';
}

export function setPark(key: ParkKey) {
	if (!PARK_THEMES_ENABLED) return;
	document.documentElement.dataset.park = key;
	try {
		localStorage.setItem(PARK_STORAGE_KEY, key);
	} catch {
		// Private mode: the park still applies for this visit.
	}
	window.dispatchEvent(new Event(PARK_EVENT));
}
