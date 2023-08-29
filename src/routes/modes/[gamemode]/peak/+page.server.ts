import { STAT_ENDPOINTS, GET } from '$lib/constants';
import { page } from '$app/stores';

export const load = async ({ params }) => {
    // console.log(params)
    // const { player } = params; // Get the value of the "player" parameter from the route
    
    const data = await GET(STAT_ENDPOINTS.GAMES + `?tag=${params.gamemode}&limit_games=false`);
    // console.log(data);
    
    return { data };
};
