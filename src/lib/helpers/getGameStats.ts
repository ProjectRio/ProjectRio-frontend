import {GET, STAT_ENDPOINTS} from "$lib/constants";
import { get } from 'svelte/store';
import { gameStats, pastMatchups, gameInformation } from "$lib/stores/gameStats";

export async function getGameStats(gameID = -1) {
    const api_call = STAT_ENDPOINTS.STATS + `?games=${gameID}&exclude_nonfair=1&by_char=1&by_user=1`
    try {
        console.log(api_call)
        const response = await GET(api_call);
        console.log("stats response", response)
        gameStats.set(response['Stats']);
    } catch (error) {
        console.log(error);
    }
}

export async function getMatchups(captain1: string, captain2: string, game_idNumber?: number) {
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
    console.log("Get matchups function complete")
}