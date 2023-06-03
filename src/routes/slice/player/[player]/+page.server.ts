import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, fetch }) => {
  try {
    const { player } = params;
    console.log(player)
    const url = `https://api.projectrio.app/games/?tag=slice2023&username=${player}`;
    const response = await fetch(url);

    if (response.ok) {
      const data = await response.json();
      return {
        games: data.games,
        // Include other data you need to return
      };
    } else {
      console.error('Error fetching data from API:', response.status);
      return { error: 'Error fetching data from API' };
    }
  } catch (error) {
    console.error('Error fetching data from API:', error);
    return { error: 'Error fetching data from API' };
  }
};
