import {GET, STAT_ENDPOINTS} from "$lib/constants";
import { liveGameList, recentGameList } from "$lib/stores/gameLists";

export async function getLiveGames(timeFilter: number) {
    const api_call = STAT_ENDPOINTS.LIVE_GAMES
    try {
        console.log("Called live games at " + new Date(), api_call)
        const response = await GET(api_call)
        console.log("Live games: ", response)
        console.log("Now", Math.floor(Date.now() / 1000))
        console.log("Hour ago", Math.floor(Date.now() / 1000) - 60*60)
        console.log("Game time", response.ongoing_games[0].start_time)
        liveGameList.set(response.ongoing_games.filter((game) => game.start_time > Math.floor(Date.now() / 1000) - timeFilter));
    } catch (error) {
        console.error('Error fetching live game data from API:', error);
    }
}

export async function getRecentGames(nGames: number, mode?: string, rosters?: boolean) {
    const api_call = STAT_ENDPOINTS.GAMES
    const gameFilters = "?&limit_games=" + nGames + 
                    ((rosters) ? "&include_teams=1" : "") +
                    ((mode !== undefined) ? "&gamemode=" + mode : "")
    try {
        console.log("Called recent games at " + new Date(), api_call, gameFilters)
        const response = await GET(api_call, gameFilters)
        console.log("Recent games: ", response)
        recentGameList.set(response.games);
    } catch (error) {
        console.error('Error fetching recent game data from API:', error);
    }
}
