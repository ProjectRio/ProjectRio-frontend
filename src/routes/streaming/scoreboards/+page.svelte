<script lang='ts'>
	import { GET, STAT_ENDPOINTS, BACKEND } from "$lib/constants";
	import LiveScoreboard from "$lib/components/LiveScoreboard.svelte";
	import RecentScoreboard from "$lib/components/RecentScoreboard.svelte";
    import { getAllTagSets } from '$lib/helpers/tagNames';
    import { tagsets } from '$lib/stores/tagsets';
	import { onMount } from "svelte";

    let loadingInd: boolean = true

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

    // Access the tagsets data in your component
    let tagsetsData: any[] = []
    $: {
        tagsetsData = $tagsets; // Get the current value of the tagsets store
    // console.log($tagsets)
    }

    let recentGameList: any
    let liveGameList: any 
    let shownRecentGame: any

    onMount(async () => {
        loadingInd = true;
        getAllTagSets();
        console.log("on mount started")
        liveGameList = await getLiveGames();
        recentGameList = await getRecentGames(10, );
        shownRecentGame = recentGameList[0]
        console.log("recent game list: ", recentGameList)
        console.log("shown game: ", shownRecentGame)
        loadingInd = false;
    })

    

    //$: shownRecentGame = recentGameList[0]
    
    // function to determine when to call api's

    //function to decide what to display
</script>


{#if !loadingInd}
    <RecentScoreboard recentGame = {shownRecentGame} 
        gameMode = {tagsetsData.find(tagset => tagset.id === shownRecentGame.game_mode)?.name || ''}/><br>
    <LiveScoreboard /> <br>
{:else}
    <p>Loading</p>
{/if}