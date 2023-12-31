import { writable } from 'svelte/store';

export const gameStats = writable({});
export const pastMatchups = writable([]);
export const gameInformation = writable({});