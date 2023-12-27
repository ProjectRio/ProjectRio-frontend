<script lang='ts'>
	import { GET, STAT_ENDPOINTS, BACKEND } from "$lib/constants";
	import LiveScoreboard from "$lib/components/LiveScoreboard.svelte";
	import RecentScoreboard from "$lib/components/RecentScoreboard.svelte";
    import { getAllTagSets } from '$lib/helpers/tagNames';
    import { tagsets } from '$lib/stores/tagsets';
	import { onMount } from "svelte";
    import { getLiveGames, getRecentGames } from "$lib/helpers/getGameLists";
    import { liveGameList, recentGameList } from "$lib/stores/gameLists";

    let loadingInd: boolean = true

    // Access the tagsets data in your component
    let tagsetsData: any[] = []
    $: {
        tagsetsData = $tagsets; // Get the current value of the tagsets store
    // console.log($tagsets)
    }

    let recentGames: any
    let liveGames: any 
    let shownGameIndex: number = 0
    let nRecentGames: number = 5
    $: shownRecentGame = $recentGameList[shownGameIndex]
    
    setTimeout(() => {
        console.log("Timeout expired")
        getRecentGames(nRecentGames)
        shownGameIndex += 1;
    }, 1000*60);

    setInterval(() => {
        shownGameIndex = (shownGameIndex + 1 === nRecentGames) ? 0 : shownGameIndex + 1
        console.log("shown game index", shownGameIndex)
    }, 5*1000)

    onMount(async () => {
        console.log("on mount started")
        loadingInd = true;

        getAllTagSets();

        await getLiveGames();
        await getRecentGames(nRecentGames, );

        liveGames = $liveGameList
        recentGames = $recentGameList

        //shownRecentGame = recentGames[0]

        console.log("recent game list: ", recentGames)
        console.log("shown game: ", shownRecentGame)
        
        loadingInd = false;
        console.log("on mount ended")
    })

    
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