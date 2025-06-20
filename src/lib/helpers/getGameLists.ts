import {GET, STAT_ENDPOINTS} from "$lib/constants";
import { liveGameList, recentGameList } from "$lib/stores/gameLists";

export async function getLiveGames(timeFilter: number) {
    const api_call = STAT_ENDPOINTS.LIVE_GAMES
    try {
        console.log("Called live games at " + new Date(), api_call)
        const response = await GET(api_call)
        console.log(response)
        const slice_tagSets = [142, 143, 144]
        var sliceGames = response.ongoing_games.filter((game:any) =>slice_tagSets.includes(game.tag_set));
        console.log(sliceGames)
        liveGameList.set(sliceGames.filter((game:any) => game.start_time > Math.floor(Date.now() / 1000) - timeFilter));
    } catch (error) {
        console.error('Error fetching live game data from API:', error);
    }
}

export async function getRecentGames(nGames: number, mode?: string, rosters?: boolean, username?: string) {
    const api_call = STAT_ENDPOINTS.GAMES
    const gameFilters = "?&limit_games=" + nGames + 
                    ((rosters) ? "&include_teams=1" : "") +
                    ((mode !== undefined) ? "&tag=" + mode : "&tag=SLICE2025SuperstarsOff&tag=SLICE2025SuperstarsOn&tag=SLICE2025BigBalla") +
                    ((username !== undefined) ? "&username=" + username : "")
    try {
        console.log("Called recent games at " + new Date(), api_call, gameFilters)
        const response = await GET(api_call, gameFilters)
        recentGameList.set(response.games);
    } catch (error) {
        console.error('Error fetching recent game data from API:', error);
    }
}
