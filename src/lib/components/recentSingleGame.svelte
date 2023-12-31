<script lang="ts">

    import { Team_Name } from "$lib/helpers/teamNames";
    import { characters } from "$lib/helpers/characterName";
    import { getAllTagSets } from '$lib/helpers/tagNames';
    import { tagsets } from '$lib/stores/tagsets';
	import { getTimeSince } from "$lib/helpers/timeSince";
	import { onMount } from "svelte";
	import { CornerDownLeft } from "lucide-svelte";
    
    export let displayedGame: any;
    export let tagsetName: string = ""; //optional prop to pass tagset - if not passed, this component will call the API itself.

    let loadingInd: boolean = true

    function determineTagset(game:any) {
        //console.log("determinetagset fn called")
        //if tagset prop not passed get it from tagset store
        if (tagsetName === "") {
            //console.log("No tagset prop")
            tagsetName = (<any>$tagsets).find((tagset: { id: number; }) => tagset.id === game.game_mode)?.name || ""
        }
        //console.log("tagset returned", tagsetName, "tagset store", $tagsets)
        return tagsetName
    }
    
    function didHomeWin(game: any) {return game.home_score > game.away_score};

    function getHomeEloOld(game:any) {return (didHomeWin(game)) ? game.winner_incoming_elo : game.loser_incoming_elo}
    function getHomeEloNew(game:any) {return (didHomeWin(game)) ? game.winner_result_elo : game.loser_result_elo};
    function getAwayEloOld(game:any) {return (didHomeWin(game)) ? game.loser_incoming_elo : game.winner_incoming_elo};
    function getAwayEloNew(game:any) {return (didHomeWin(game)) ? game.loser_result_elo : game.winner_result_elo};
    
    function getTeamImage(game: any, homeAway: string) {
        if (`${homeAway}_roster` in game) {
            let team = Team_Name(Array.from(Object.values(game[`${homeAway}_roster`]), (charIndex: any) => characters[charIndex]), game[`${homeAway}_captain`])
            return `/src/lib/images/Teams/${team}.png`
        } else {
            return `/src/lib/images/Characters/${game[`${homeAway}_captain`]}.png`
        }
    } 

    function getInningDisplay(game:any) {
        return (game.innings_played === game.innings_selected) ? "" : `(${game.innings_played}/${game.innings_selected})`}

    onMount(async () => {
        //console.log("Onmount started")
        if ($tagsets.length === 0) {
            console.log("No tagsets in store, calling API")
            await getAllTagSets();
        }
        //console.log("game on mount finished")
        loadingInd = false
    })

</script>

{#if !loadingInd}
    <div id="game-container">
        <div class="header-row">
            <div class="header-gameStatus"><a href="/games/{displayedGame.game_id}">Final</a> {getInningDisplay(displayedGame)}</div>
            <div class="header-timestamp">{getTimeSince(displayedGame.date_time_end)}</div>
        </div>
        <div class="team-row">
            <div class="row-logo"><img src={getTeamImage(displayedGame, "away")} alt="away logo"></div>
            <div class="row-player-and-elo">
                <div class="row-player">{displayedGame.away_user}</div>
                <div class="row-elo">ELO: {getAwayEloOld(displayedGame)} → {getAwayEloNew(displayedGame)}</div>
            </div>
            <div class="row-score">{displayedGame.away_score}</div>
        </div>
        <div class="team-row">
            <div class="row-logo"><img src={getTeamImage(displayedGame, "home")} alt="home logo"></div>
            <div class="row-player-and-elo">
                <div class="row-player">{displayedGame.home_user}</div>
                <div class="row-elo">ELO: {getHomeEloOld(displayedGame)} → {getHomeEloNew(displayedGame)}</div>
            </div>
            <div class="row-score">{displayedGame.home_score}</div>
        </div>
        <div class="gameMode">{determineTagset(displayedGame)}</div>
    </div>
{:else}
    <p>Loading</p>
{/if}

<style>

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

</style>