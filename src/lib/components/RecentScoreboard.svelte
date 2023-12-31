<script lang='ts'>
    /* to do
    -somehow add connnection to live games so this refreshes once a live game finishes
    */
	import { onDestroy, onMount } from "svelte";
	import { getRecentGames } from "$lib/helpers/getGameLists";
    import { recentGameList } from "$lib/stores/gameLists";
	import RecentSingleGame from "./recentSingleGame.svelte";

    let recentGameOptions: any = {
        greenscreen: false,
        nGames: 5,
        displayInterval: 10,
        includeLogo: false
    }

    let loadingInd: boolean = true;
    let recentGame: any;
    let displayedGameIndex: number = 0;
    var dataRefreshInterval: any;
    var displayInterval: any

    async function startIntervals () {
        dataRefreshInterval = setInterval(async () => {
            console.log("Data interval ran")
            await getRecentGames(recentGameOptions.nGames, ...[,], recentGameOptions.includeLogo)
        }, 2*60*1000);
        await getRecentGames(recentGameOptions.nGames, ...[,], recentGameOptions.includeLogo);
        console.log("Initial got recent games finished", $recentGameList)
        recentGame = $recentGameList[0]
        loadingInd = false
        
        displayInterval = setInterval(() => {
            if ($recentGameList.length !== 0) {
                displayedGameIndex = (displayedGameIndex >= $recentGameList.length - 1) ? 0 : displayedGameIndex + 1
            }
            console.log("Recent Index", displayedGameIndex)
            recentGame = $recentGameList[displayedGameIndex]
        }, recentGameOptions.displayInterval*1000)
    }

    onMount(async () => {
        console.log("Recent OnMount started")
        startIntervals()
    })

    onDestroy(() => {
        console.log("Recent OnDestroy ran")
        clearInterval(dataRefreshInterval)
        clearInterval(displayInterval)
    })


    function toggleGreenScreen() {
        recentGameOptions.greenscreen = !recentGameOptions.greenscreen
        if (recentGameOptions.greenscreen) {
            document.getElementById('game-container')?.style.setProperty("background-color", '#00b140')
        } else {
            document.getElementById('game-container')?.style.setProperty("background-color", "")        
        }
    }

    function toggleTeamLogos() {
        recentGameOptions.includeLogo = !recentGameOptions.includeLogo
    }

    async function manualRefresh() {
        //destroy intervals to avoid data leaks
        clearInterval(dataRefreshInterval)
        clearInterval(displayInterval)

        loadingInd = true;
        await getRecentGames(recentGameOptions.nGames, ...[,], recentGameOptions.includeLogo)
        displayedGameIndex = 0
        loadingInd = false

        //start intervals again
        startIntervals()
    }


</script>


{#if !loadingInd}
    <div class="main-container">
        <RecentSingleGame displayedGame={recentGame} />
        <div class='recent-options'>
            Recent Game Options <br>
            (Press 'Refresh Games' after changing)<br>
            <input class="checkbox" type="checkbox" checked={recentGameOptions.includeLogo} on:change={toggleTeamLogos}/> Include Team Logo (Long Loading Time)<br>
            <input class="numberbox" type="number" bind:value={recentGameOptions.displayInterval} min="1" max="20"/> Change Frequency (s)<br>
            <input class="numberbox" type="number" bind:value={recentGameOptions.nGames} min="1" max="20"/> # Games<br>
            <button on:click={manualRefresh}>Refresh Games </button><br>
            <input class="checkbox" type="checkbox" checked={recentGameOptions.greenscreen} on:change={toggleGreenScreen}/> Greenscreen Mode <br>
        </div>
    </div>
{:else}
    <p>Loading</p>
{/if}

<style>
    .main-container {
        display: grid;
        grid-template-columns: 21em auto;
    }
    .numberbox{
        color: black;
    }
</style>