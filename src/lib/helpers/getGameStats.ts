import {GET, STAT_ENDPOINTS} from "$lib/constants";
import { get } from 'svelte/store';
import { gameBattingStats, gamePitchingStats, pastMatchups, gameInformation } from "$lib/stores/gameStats";

export async function getGameOstat(gameID = -1) {
    const api_call = STAT_ENDPOINTS.STATS + `?exclude_pitching=1&exclude_fielding=1&exclude_misc=1&games=${gameID}&exclude_nonfair=1&by_char=1&by_user=1`
    try {
        console.log(api_call)
        const response = await GET(api_call);
        console.log("batting response", response)
        gameBattingStats.set(response['Stats']);
    } catch (error) {
        console.log(error);
    }
}

export async function getGamePstat(gameID = -1) {
    const api_call = STAT_ENDPOINTS.STATS + `?exclude_batting=1&exclude_fielding=1&exclude_misc=1&games=${gameID}&exclude_nonfair=1&by_char=1&by_user=1`
    try {
        console.log(api_call)
        const response = await GET(api_call);
        console.log("pitching response", response)
        gamePitchingStats.set(response['Stats']);
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
            let selectedGame = get(pastMatchups).filter((game) => game.game_id === game_idNumber)[0]
            console.log("Selected game", selectedGame)
            gameInformation.set(selectedGame)
        }
    } catch (error) {
        console.log(error);
    }
    console.log("Get matchups function complete")
}