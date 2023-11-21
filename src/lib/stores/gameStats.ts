import { writable } from 'svelte/store';

export const gameBattingStats = writable({});
export const gamePitchingStats = writable({});
export const pastMatchups = writable([]);
export const gameInformation = writable({});