<script lang='ts'>
    /* Improvements:
        -Allow user to control interval between display changing to a new game
    */
	import { GET, STAT_ENDPOINTS, BACKEND } from "$lib/constants";
	import LiveScoreboard from "$lib/components/LiveScoreboard.svelte";
	import RecentScoreboard from "$lib/components/RecentScoreboard.svelte";
    import RecentScoreboard2 from "$lib/components/RecentScoreboard2.svelte";
    import { getAllTagSets } from '$lib/helpers/tagNames';
    import { tagsets } from '$lib/stores/tagsets';
	import { onMount } from "svelte";
    import { getLiveGames, getRecentGames } from "$lib/helpers/getGameLists";
    import { liveGameList, recentGameList } from "$lib/stores/gameLists";

    let loadingInd: boolean = true
    let recentGameOptions: object= {
        greenscreen: false,
        nGames: 2,
        displayInterval: 10
    };

    // Access the tagsets data in your component
    let tagsetsData: any[] = []
    $: {
        tagsetsData = $tagsets; // Get the current value of the tagsets store
    // console.log($tagsets)
    }

    let recentGames: any
    let liveGames: any 
    let shownGameIndex: number = 0
    let nRecentGames: number = 4
    let fetchingRecentGames: boolean = false
    $: shownRecentGame = $recentGameList[shownGameIndex]
    

    /*setTimeout(() => {
        console.log("Timeout expired")
        getRecentGames(recentGameOptions.nGames)
        shownGameIndex += 1;
    }, 1000*30)*/
    

    async function updateRecentGames() {
        setInterval(() => {
        console.log("recent games stored", $recentGameList.length)
        console.log("fetching result", fetchingRecentGames)
        if ($recentGameList.length > 0 && $recentGameList.length !== recentGameOptions.nGames && !fetchingRecentGames) {
            console.log("Refreshing recent games list since # games input changed")
            //fetchingRecentGames = true
            console.log("fetching should be true now", fetchingRecentGames)
            getRecentGames(recentGameOptions.nGames)
            //fetchingRecentGames = false
        }
        shownGameIndex = (shownGameIndex + 1 === $recentGameList.length || $recentGameList.length === 0) ? 0 : shownGameIndex + 1
        console.log("shown game index", shownGameIndex)
    }, recentGameOptions.displayInterval*1000)
    }
    
    
    onMount(async () => {
        console.log("on mount started")
        loadingInd = true;

        getAllTagSets();

        await getLiveGames();

        fetchingRecentGames = true
        await getRecentGames(recentGameOptions.nGames, );
        console.log("recent game call finished")
        fetchingRecentGames = false

        liveGames = $liveGameList
        recentGames = $recentGameList

        //shownRecentGame = recentGames[0]

        console.log("recent game list: ", recentGames)
        console.log("shown game: ", shownRecentGame)
        
        loadingInd = false;
        console.log("on mount ended")
    })

    $: console.log(recentGameOptions)
    // function to determine when to call api's

    //function to decide what to display
</script>


{#if !loadingInd}
        <RecentScoreboard recentGame = {shownRecentGame} 
            gameMode = {tagsetsData.find(tagset => tagset.id === shownRecentGame.game_mode)?.name || ''}
            bind:recentGameOptions/>
    <br>
    <RecentScoreboard2 />
    <LiveScoreboard /> <br>
{:else}
    <p>Loading</p>
{/if}

<style>

</style>