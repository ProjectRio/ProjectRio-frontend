import {GET, STAT_ENDPOINTS} from "$lib/constants";
import { userStats, userStatsByChar } from "$lib/stores/userStats";

export async function getUserOstat(user: string, mode = "Stars Off, Season 7") {
    const api_call = STAT_ENDPOINTS.STATS + `?exclude_pitching=1&exclude_fielding=1&exclude_misc=1&tag=${mode}&exclude_nonfair=1&username=${user}`
    try {
        const response = await GET(api_call);
        userStats.set(response['Stats']);
        const by_char_response = await GET (api_call + '&by_char=1')
        userStatsByChar.set(by_char_response['Stats']);
    } catch (error) {
        console.log(error);
    }
}