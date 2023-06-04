import type { PageServerLoad } from './$types';
// import { Actions } from './$types';
export const load: PageServerLoad = async ({ params, fetch, depends }) => {
  try {
    const [gamesResponse, liveDataResponse] = await Promise.all([
      fetch('https://api.projectrio.app/games/?tag=slice2023'),
      fetch('https://api.projectrio.app/populate_db/ongoing_game'),
    ]);

    depends('https://api.projectrio.app/games/?tag=slice2023');
    depends('https://api.projectrio.app/populate_db/ongoing_game');
    if (gamesResponse.ok && liveDataResponse.ok) {
      const gamesData = await gamesResponse.json();
      const liveData = await liveDataResponse.json();

      return {
        games: gamesData.games,
        live: liveData.ongoing_games,
      };
    } else {
      console.error('Error fetching data from API:', gamesResponse.status);
      return { error: 'Error fetching data from API' };
    }
  } catch (error) {
    console.error('Error fetching data from API:', error);
    return { error: 'Error fetching data from API' };
  }
};
