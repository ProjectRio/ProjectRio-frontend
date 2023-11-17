import {GET, STAT_ENDPOINTS} from "$lib/constants";
import { gameBattingStats, gamePitchingStats, gameInformation } from "$lib/stores/gameStats";

export async function getGameOstat(gameID = -1) {
    const api_call = STAT_ENDPOINTS.STATS + `?exclude_pitching=1&exclude_fielding=1&exclude_misc=1&games=${gameID}&exclude_nonfair=1&by_char=1&by_user=1`
    //console.log(api_call)
    try {
        console.log(api_call)
        const response = await GET(api_call);
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
        gamePitchingStats.set(response['Stats']);
    } catch (error) {
        console.log(error);
    }
}

export async function getGameInfo(captain1: string, captain2: string) {
    const api_call = STAT_ENDPOINTS.GAMES + `?username=${captain1}&vs_username=${captain2}`
    try{
        console.log(api_call)
        const response = await GET(api_call);
        gameInformation.set(response['games']);
    } catch (error) {
        console.log(error);
    }
}