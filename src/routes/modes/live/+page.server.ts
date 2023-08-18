import type { PageServerLoad } from './$types';
import { STAT_ENDPOINTS, GET, BACKEND } from '$lib/constants';
// import { Actions } from './$types';
export const load: PageServerLoad = async ({ params, fetch, depends }) => {
  try {
    const liveDataResponse = await GET(STAT_ENDPOINTS.LIVE_GAMES)

    depends(BACKEND + STAT_ENDPOINTS.LIVE_GAMES);
      return {
        live: liveDataResponse.ongoing_games,
      };
  } catch (error) {
    console.error('Error fetching data from API:', error);
    return { error: 'Error fetching data from API' };
  }
};
