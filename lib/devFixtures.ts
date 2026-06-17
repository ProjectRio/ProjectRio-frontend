// Dev-only fixtures so the live-game UI can be exercised when no real games are
// ongoing. Sourced from the committed example payload. Each game is tagged with
// `_devFixture` so the UI can flag it and never confuse it with a real game.
//
// This module is only ever imported from a `process.env.NODE_ENV === 'development'`
// branch (see getLiveGames), so the JSON is never bundled into a production build.
import exampleData from '@/app/games/live/example_ongoing_game.json';

export const exampleLiveGames: any[] = ((exampleData as { ongoing_games: any[] }).ongoing_games ?? []).map(
	(game) => ({ ...game, _devFixture: true })
);
