import type { PageServerLoad } from './$types';
import { STAT_ENDPOINTS, GET, BACKEND } from '$lib/constants';
// import { Actions } from './$types';
export const load: PageServerLoad = async ({ params, fetch, depends }) => {
  try {
    const gamesResponse = await GET(STAT_ENDPOINTS.GAMES)

    depends(BACKEND + STAT_ENDPOINTS.GAMES);
      return {
        games: gamesResponse.games,
      };
  } catch (error) {
    console.error('Error fetching data from API:', error);
    return { error: 'Error fetching data from API' };
  }
};
