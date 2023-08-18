import type { PageServerLoad } from './$types';
import { GET, STAT_ENDPOINTS} from "$lib/constants"

export const load: PageServerLoad = async ({ params, fetch }) => {
  try {
    const { player } = params;

    const response = await GET(STAT_ENDPOINTS.GAMES, `?username=${player}`);

      return {
        games: response.games,
      }
  } catch (error) {
    console.error('Error fetching data from API:', error);
    return { error: 'Error fetching data from API' };
  }
};
