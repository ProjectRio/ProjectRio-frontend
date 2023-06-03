// import type { PageServerLoad } from './$types';

// export const load: PageServerLoad = (async ({ params, fetch }) => {
//     try {
//               const response = await fetch('https://api.projectrio.app/games/?tag=starsoffseason5');
//               if (response.ok) {
//                 const data = await response.json();
//                 return { games: data.games,  };
//               } else {
//                 console.error('Error fetching data from API:', response.status);
//                 return { error: 'Error fetching data from API' };
//               }
//             } catch (error) {
//               console.error('Error fetching data from API:', error);
//               return { error: 'Error fetching data from API' };
//             }
// }) satisfies PageServerLoad;

import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, fetch }) => {
  try {
    const [gamesResponse, liveDataResponse] = await Promise.all([
      fetch('https://api.projectrio.app/games/?tag=slice2023'),
      fetch('https://api.projectrio.app/populate_db/ongoing_game'),
    ]);

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
