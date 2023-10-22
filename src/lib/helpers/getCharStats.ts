import {GET, STAT_ENDPOINTS} from "$lib/constants";
import { charBattingStats, charBattingStatsByUser, charPitchingStats, charPitchingStatsByUser } from "$lib/stores/charStats";
import { characters } from "./characterName";

export async function getCharOstat(char: string, mode = "Stars Off, Season 7") {
    let api_call = STAT_ENDPOINTS.STATS + `?exclude_pitching=1&exclude_fielding=1&exclude_misc=1&tag=${mode}&exclude_nonfair=1`
    if (char != "all") {
        const char_id = Object.keys(characters).find(key => characters[key].toLowerCase() == char.toLowerCase()) ?? "all";
        api_call += `&char_id=${char_id}`;
    }
    try {
        const response = await GET(api_call);
        charBattingStats.set(response['Stats']);
        const by_user_response = await GET (api_call + '&by_user=1')
        charBattingStatsByUser.set(by_user_response['Stats']);
    } catch (error) {
        console.log(error);
    }
}

export async function getCharPstat(char: string, mode = "Stars Off, Season 7") {
    let api_call = STAT_ENDPOINTS.STATS + `?exclude_batting=1&exclude_fielding=1&exclude_misc=1&tag=${mode}`

    if (char != "all") {
        const char_id = Object.keys(characters).find(key => characters[key].toLowerCase() == char.toLowerCase()) ?? "all";
        api_call += `&char_id=${char_id}`;
    }

    try {
        const response = await GET(api_call);
        charPitchingStats.set(response['Stats']);
        const by_user_response = await GET (api_call + '&by_user=1')
        charPitchingStatsByUser.set(by_user_response['Stats']);
    } catch (error) {
        console.log(error);
    }
}
