<script lang='ts'>
    import { Team_Name } from "$lib/helpers/teamNames";
    import { characters } from "$lib/helpers/characterName";
	import { onMount } from "svelte";
	import { getRecentGames } from "$lib/helpers/getGameLists";
    import { recentGameList } from "$lib/stores/gameLists";
    import { getAllTagSets } from '$lib/helpers/tagNames';
    import { tagsets } from '$lib/stores/tagsets';

    // Access the tagsets data in your component
    let tagsetsData: any[] = []
    $: {
        tagsetsData = $tagsets; // Get the current value of the tagsets store
    // console.log($tagsets)
    }

    let recentGameOptions: object = {
        greenscreen: false,
        nGames: 5,
        displayInterval: 5,
        includeLogo: false
    }

    console.log("Scoreboard script started")

    let loadingInd: boolean = true;
    let recentGame: object;
    let gameMode: string = "TestMode";
    let displayedGameIndex: number = 0;

    onMount(async () => {
        console.log("Onmount started")
        
        getAllTagSets();

        const dataRefreshInterval = setInterval(async () => {
            console.log("Data interval ran")
            await getRecentGames(recentGameOptions.nGames, ...[,], false)
            console.log("Data interval finished")
        }, 2*60*1000);
        await getRecentGames(recentGameOptions.nGames, ...[,], false);
        console.log("Initial got recent games finished", $recentGameList)
        recentGame = $recentGameList[0]
        loadingInd = false
        
        const displayInterval = setInterval(() => {
            console.log("Display interval ran")
            if ($recentGameList.length !== 0) {
                displayedGameIndex = (displayedGameIndex >= $recentGameList.length - 1) ? 0 : displayedGameIndex + 1
            }
            console.log("Index", displayedGameIndex)
            recentGame = $recentGameList[displayedGameIndex]
        }, recentGameOptions.displayInterval*1000)

        return () => {
            clearInterval(dataRefreshInterval)
            clearInterval(displayInterval)
        }
    })


    function didHomeWin(game: any) {return game.home_score > game.away_score};

    function getHomeEloOld(game:any) {return (didHomeWin(game)) ? game.winner_incoming_elo : game.loser_incoming_elo}
    function getHomeEloNew(game:any) {return (didHomeWin(game)) ? game.winner_result_elo : game.loser_result_elo};
    function getAwayEloOld(game:any) {return (didHomeWin(game)) ? game.loser_incoming_elo : game.winner_incoming_elo};
    function getAwayEloNew(game:any) {return (didHomeWin(game)) ? game.loser_result_elo : game.winner_result_elo};

    function getInningDisplay(game:any) {
        console.log(game)
        return (game.innings_played === game.innings_selected) ? "" : `(${game.innings_played}/${game.innings_selected})`}

    function getTimeSinceGame(game: any) {
        let timeSinceGame_s: number = Math.floor(Date.now() / 1000) - game.date_time_end
        let timeSinceGame_m: number = Math.floor(timeSinceGame_s/60)
        let timeSinceGame_h: number = Math.floor(timeSinceGame_m/60)
        let timeSinceGame: string = ""
        if (timeSinceGame_h <= 0) {
            timeSinceGame = timeSinceGame_m + " Mins Ago"
        } else if (timeSinceGame_h == 1) {
            timeSinceGame = timeSinceGame_h + " Hr Ago"
        } else {
            timeSinceGame = timeSinceGame_h + " Hrs Ago"
        }
        return timeSinceGame
    }

    function getTeamImage(game: any, homeAway: string) {
        if (`${homeAway}_roster` in game) {
            let team = Team_Name(Array.from(Object.values(game[`${homeAway}_roster`]), (charIndex) => characters[charIndex]), game[`${homeAway}_captain`])
            return `/src/lib/images/Teams/${team}.png`
        } else {
            return `/src/lib/images/Characters/${game[`${homeAway}_captain`]}.png`
        }
    } 

    function toggleGreenScreen() {
        recentGameOptions.greenscreen = !recentGameOptions.greenscreen
        console.log("toggle greenscreen called", recentGameOptions)
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
        loadingInd = true;
        await getRecentGames(recentGameOptions.nGames, ...[,], recentGameOptions.includeLogo)
        displayedGameIndex = 0
        loadingInd = false
    }


</script>


{#if !loadingInd}
    <div class="main-container">
        <div id="game-container">
            <div class="header-row">
                <div class="header-gameStatus">Final {getInningDisplay(recentGame)}</div>
                <div class="header-timestamp">{getTimeSinceGame(recentGame)}</div>
            </div>
            <div class="team-row">
                <div class="row-logo"><img src={getTeamImage(recentGame, "away")} alt="away logo"></div>
                <div class="row-player-and-elo">
                    <div class="row-player">{recentGame.away_user}</div>
                    <div class="row-elo">ELO: {getAwayEloOld(recentGame)} → {getAwayEloNew(recentGame)}</div>
                </div>
                <div class="row-score">{recentGame.away_score}</div>
            </div>
            <div class="team-row">
                <div class="row-logo"><img src={getTeamImage(recentGame, "home")} alt="home logo"></div>
                <div class="row-player-and-elo">
                    <div class="row-player">{recentGame.home_user}</div>
                    <div class="row-elo">ELO: {getHomeEloOld(recentGame)} → {getHomeEloNew(recentGame)}</div>
                </div>
                <div class="row-score">{recentGame.home_score}</div>
            </div>
            <div class="gameMode">{tagsetsData.find(tagset => tagset.id === recentGame.game_mode)?.name || ''}</div>
        </div>
        <div class='recent-options'>
            Recent Game Options <br>
            (Press 'Refresh Games' after changing)<br>
            <input class="checkbox" type="checkbox" checked={recentGameOptions.includeLogo} on:change={toggleTeamLogos}/> Include Team Logo <br>
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
        grid-template-columns: auto auto;
    }
    #game-container {
        display: grid;
        grid-template-rows: 1.5em 3.25em 3.25em 1.5em;
        max-width: 20em;
    }
    .header-row {
        display: grid;
        grid-template-columns: auto auto;
    }
    .header-timestamp {
        text-align: right;
    }
    .header-gameStatus {
        text-align: left;
    }
    .team-row {
        display: grid;
        grid-template-columns: 3.1em auto 3em;
    }
    .row-logo {
        padding: 0.2em 0.3em
    }
    .row-player {
        font-size: 110%;
    }
    .row-elo {
        color: gray;
        font-size: 95%;
    }
    .row-score {
        font-size: 2.75em;
        text-align: right;
        padding: .25em 0 
    }
    .gameMode {
        text-align: center;
    }
    .numberbox{
        color: black;
    }
</style>