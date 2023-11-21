<script lang="ts">
    import { gameBattingStats, gamePitchingStats, gameInformation } from '$lib/stores/gameStats';
    import { onMount, beforeUpdate} from 'svelte';
    import { page } from '$app/stores';
	import { getGameOstat, getGamePstat, getMatchups } from '$lib/helpers/getGameStats';
	import { getAvg, getObp, getOps, getPa, getSlg } from '$lib/helpers/statCalcs';
    import BatterGameTableHeader from '$lib/components/batterGameTableHeader.svelte';
    import BatterGameTableRow from '$lib/components/batterGameTableRow.svelte';
	//import { object } from 'zod';
	//import type { list } from 'postcss';

    console.log("Started script")

    let gameID: number = Number($page.params.gameID)
    let battingStats = $gameBattingStats
    let gameInfo = $gameInformation;
    let user1: string;
    let user2: string;
    let inningsSelected: number;
    let inningsPlayed: number;
    let homeBatters: any[] = [];

    
    onMount(async () => {
        console.log("on mount started")
        console.log("Game ID sent to stat APIs: ", gameID)
        await getGameOstat(gameID);
        await getGamePstat(gameID);
        console.log("batting stats returned to main page: ", $gameBattingStats)
        battingStats = $gameBattingStats
        console.log("batting stats set as:", battingStats)
        user1 = Object.keys($gameBattingStats)[0]
        user2 = Object.keys($gameBattingStats)[1]
        console.log("Calling matchup API. user 1: ",user1,' user 2: ',user2)
        await getMatchups(user1, user2, gameID)
        gameInfo = $gameInformation
        console.log("game info returned to main page: ", gameInfo)
        console.log("On mount finished")
    })

    class player {
        name: string = "Unknown";
        battingStats: any = undefined;

        constructor (player_name: string, player_battingStats: any) {
            this.name = player_name;
            this.battingStats = player_battingStats;
            //this.pitchingStats = player_pitchingStats;
        }
    }
    
    //Set top line score values
    $: userHome = gameInfo.home_user;
    $: userAway = gameInfo.away_user;
    $: scoreHome = gameInfo.home_score;
    $: scoreAway = gameInfo.away_score;
    $: console.log("home user", userHome)
    $: homeBattingStats = battingStats[userHome]
    $: awayBattingStats = battingStats[userAway]
    $: console.log("home batting stats: ", homeBattingStats)
    $: {
        for (const character in homeBattingStats) {
            const batterStats = homeBattingStats[character].Batting;
            console.log(character)
            console.log(batterStats)
            homeBatters.push(new player(character, batterStats))
        }
        console.log(homeBatters)
    }



</script>


{#if homeBattingStats !== undefined}
    <h2>{userHome} {scoreHome} Final {scoreAway} {userAway}</h2>

    <BatterGameTableHeader />

    {#each homeBatters as { name, battingStats}, i}
        <BatterGameTableRow batterName = {name} batterInfo={battingStats} />
    {/each}
{:else}
    <p>Loading</p>
{/if}
