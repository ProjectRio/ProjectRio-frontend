import {GET, STAT_ENDPOINTS} from "$lib/constants";
import { liveGameList, recentGameList } from "$lib/stores/gameLists";

export async function getLiveGames() {
    const api_call = STAT_ENDPOINTS.LIVE_GAMES
    try {
        console.log("Called live games at " + new Date(), api_call)
        const response = await GET(api_call)
        console.log("Live games: ", response)
        liveGameList.set(response.ongoing_games);
    } catch (error) {
        console.error('Error fetching live game data from API:', error);
    }
}

export async function getRecentGames(nGames: number, mode?: string) {
    const api_call = STAT_ENDPOINTS.GAMES
    const gameFilters = "?&limit_games=" + nGames + "&include_teams=1" +
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

/*export async function getMatchups(captain1: string, captain2: string, game_idNumber?: number) {
    const api_call = STAT_ENDPOINTS.GAMES + `?username=${captain1}&vs_username=${captain2}`
    try{
        console.log(api_call)
        const response = await GET(api_call);
        console.log("game response", response)
        pastMatchups.set(response['games']);
        console.log("past matchups", get(pastMatchups))
        if (game_idNumber !== undefined) {
            console.log("game ID number parameter exists.")
            let selectedGame = get(pastMatchups).filter((game:any) => game.game_id === game_idNumber)[0]
            console.log("Selected game", selectedGame)
            gameInformation.set(selectedGame)
        }
    } catch (error) {
        console.log(error);
    }
}*/