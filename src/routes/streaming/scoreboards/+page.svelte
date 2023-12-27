<script lang='ts'>
	import { GET, STAT_ENDPOINTS, BACKEND } from "$lib/constants";
	import LiveScoreboard from "$lib/components/LiveScoreboard.svelte";
	import RecentScoreboard from "$lib/components/RecentScoreboard.svelte";

    

    // functions for calling live games and recent games
    async function getLiveGames() {
        try {
            console.log("Called live games at " + new Date())
            const liveGamesResponse = await GET(STAT_ENDPOINTS.LIVE_GAMES)
            console.log("Live games: ", liveGamesResponse)
            return liveGamesResponse.ongoing_games
        } catch (error) {
            console.error('Error fetching live game data from API:', error);
            return { error: 'Error fetching live game data from API' };
        }
    }

    async function getRecentGames(nGames: number, mode?: string) {
        try {
            const gameFilters = "?&limit_games=" + nGames + 
                            ((mode !== undefined) ? "&gamemode=" + mode : "")

            console.log("Called recent games at " + new Date(), STAT_ENDPOINTS.GAMES, gameFilters)
            const recentGamesResponse = await GET(STAT_ENDPOINTS.GAMES, gameFilters)

            console.log("Recent games", recentGamesResponse)
            return recentGamesResponse.games
        } catch (error) {
            console.error('Error fetching recent game data from API:', error);
            return { error: 'Error fetching recent game data from API' };
        }
    }
    getLiveGames()
    console.log("recent games: ", getRecentGames(10,))
    
    // function to determine when to call api's

    //function to decide what to display
</script>

<div>
    Testing
</div>
<RecentScoreboard /><br>
<LiveScoreboard /> <br>