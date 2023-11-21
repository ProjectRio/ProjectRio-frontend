<script lang="ts">
    import { gameStats, gameInformation } from '$lib/stores/gameStats';
    import { onMount } from 'svelte';
    import { page } from '$app/stores';
	import { getGameStats, getMatchups } from '$lib/helpers/getGameStats';
	import { getAvg, getObp, getOps, getPa, getSlg } from '$lib/helpers/statCalcs';
    import BatterGameTableHeader from '$lib/components/batterGameTableHeader.svelte';
    import BatterGameTableRow from '$lib/components/batterGameTableRow.svelte';
    import PitcherGameTableHeader from '$lib/components/pitcherGameTableHeader.svelte';
    import PitcherGameTableRow from '$lib/components/pitcherGameTableRow.svelte';
	//import PitchingStatTableHeader from '$lib/components/PitchingStatTableHeader.svelte';
	//import { object } from 'zod';
	//import type { list } from 'postcss';

    console.log("Started script")

    let gameID: number = Number($page.params.gameID)
    let gameAllStats: any = $gameStats
    let gameInfo: any = $gameInformation;
    let user1: string;
    let user2: string;
    let inningsSelected: number;
    let inningsPlayed: number;
    let homeRoster: any[] = [];
    let awayRoster: any[] = [];

    
    onMount(async () => {
        console.log("on mount started")
        console.log("Game ID sent to stat APIs: ", gameID)
        await getGameStats(gameID);
        console.log("game stats returned to main page: ", $gameStats)
        gameAllStats = $gameStats;
        console.log("game stats set as:", gameAllStats)
        user1 = Object.keys(gameAllStats)[0]
        user2 = Object.keys(gameAllStats)[1]
        console.log("Calling matchup API. user 1: ",user1,' user 2: ',user2)
        await getMatchups(user1, user2, gameID)
        gameInfo = $gameInformation
        console.log("game info returned to main page: ", gameInfo)
        console.log("On mount finished")
    })

    class player {
        name: string = "Unknown";
        battingStats: any = undefined;
        pitchingStats: any = undefined;

        constructor (player_name: string, player_battingStats: any, player_pitchingStats: any) {
            this.name = player_name;
            this.battingStats = player_battingStats;
            this.pitchingStats = player_pitchingStats;
        }
    }
    
    //Set top line score values
    $: userHome = gameInfo.home_user;
    $: userAway = gameInfo.away_user;
    $: scoreHome = gameInfo.home_score;
    $: scoreAway = gameInfo.away_score;
    $: console.log("home user", userHome)
    $: homeGameStats = gameAllStats[userHome]
    $: awayGameStats = gameAllStats[userAway]
    $: console.log("home game stats: ", homeGameStats)

    $: {
        homeRoster = [];
        awayRoster = [];
        for (const character in homeGameStats) {
            const batterStats = homeGameStats[character].Batting;
            const pitcherStats = homeGameStats[character].Pitching;
            console.log(character)
            console.log(batterStats)
            homeRoster.push(new player(character, batterStats, pitcherStats))
        }
        console.log("home roster: ", homeRoster)

        for (const character in awayGameStats) {
            const batterStats = awayGameStats[character].Batting;
            const pitcherStats = awayGameStats[character].Pitching;
            console.log(character)
            console.log(batterStats)
            awayRoster.push(new player(character, batterStats, pitcherStats))
        }
        console.log("away roster: ", awayRoster)
    }


</script>


{#if homeGameStats !== undefined}
    <div class="scoreBox">
        <span class="scoreBox-home-alignment">{userHome} <span class="score">{scoreHome}</span> </span>
        <span class="scoreBox-Final-alignment">Final</span>
        <span class="scoreBox-away-alignment"><span class="score">{scoreAway}</span> {userAway}</span>
    </div>

    <div class="row">
        <div class="column">
            <BatterGameTableHeader />

            {#each homeRoster as { name, battingStats}, i}
                <BatterGameTableRow batterName = {name} batterInfo={battingStats} />
            {/each}
        </div>
        <div class="column">
            <BatterGameTableHeader />
            {#each awayRoster as { name, battingStats}, i}
                <BatterGameTableRow batterName = {name} batterInfo={battingStats} />
            {/each}
        </div>
    </div>

    <br>

    <div class="row">
        <div class="column">
            <PitcherGameTableHeader />
            {#each homeRoster as { name, pitchingStats}, i}
                {#if pitchingStats.batters_faced !== 0}
                    <PitcherGameTableRow pitcherName = {name} pitcherInfo={pitchingStats} />
                {/if}
            {/each}
        </div>
        <div class="column">
            <PitcherGameTableHeader />
            {#each awayRoster as { name, pitchingStats}, i}
                {#if pitchingStats.batters_faced !== 0}
                    <PitcherGameTableRow pitcherName = {name} pitcherInfo={pitchingStats} />
                {/if}
            {/each}
        </div>
    </div>
{:else}
    <p>Loading</p>
{/if}


<style>
    .column {
        float: left;
        width: 50%;
    }

    .row:after {
        content: "";
        display: table;
        clear: both;
    }

    .scoreBox {
        border-radius: 30px;
        background: purple;
        margin-inline: 1% auto;
        margin-bottom: 1%;
        width: 100%;
        display: flex;
        text-transform:uppercase;
        font-size: 2em;
        padding-block: 1em;
        padding-inline: 1em;
    }

    .scoreBox-Final-alignment {
        text-align: center;
        justify-content: center;
        align-items: center;
        padding-inline: 20%;
    }
    .scoreBox-home-alignment {
        float:left;
    }
    .scoreBox-away-alignment {
        float:right;
        text-align: right;
    }



</style>