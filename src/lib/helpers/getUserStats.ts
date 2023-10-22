import {GET, STAT_ENDPOINTS} from "$lib/constants";
import { userBattingStats, userBattingStatsByChar, userPitchingStats, userPitchingStatsByChar } from "$lib/stores/userStats";

export async function getUserOstat(user: string, mode = "Stars Off, Season 7") {
    const api_call = STAT_ENDPOINTS.STATS + `?exclude_pitching=1&exclude_fielding=1&exclude_misc=1&tag=${mode}&username=${user}&exclude_nonfair=1`
    try {
        const response = await GET(api_call);
        userBattingStats.set(response['Stats']);
        const by_char_response = await GET (api_call + '&by_char=1')
        userBattingStatsByChar.set(by_char_response['Stats']);
    } catch (error) {
        console.log(error);
    }
}

export async function getUserPstat(user: string, mode = "Stars Off, Season 7") {
    const api_call = STAT_ENDPOINTS.STATS + `?exclude_batting=1&exclude_fielding=1&exclude_misc=1&tag=${mode}&username=${user}`
    try {
        const response = await GET(api_call);
        userPitchingStats.set(response['Stats']);
        const by_char_response = await GET (api_call + '&by_char=1')
        userPitchingStatsByChar.set(by_char_response['Stats']);
    } catch (error) {
        console.log(error);
    }
}
