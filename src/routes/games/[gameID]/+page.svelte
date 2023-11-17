<script lang="ts">
    import { gameBattingStats, gamePitchingStats, gameInformation } from '$lib/stores/gameStats';
    import { onMount, onDestroy} from 'svelte';
    import { page } from '$app/stores';
	import { getGameOstat, getGamePstat, getGameInfo } from '$lib/helpers/getGameStats';
	import { getAvg, getObp, getOps, getPa, getSlg } from '$lib/helpers/statCalcs';
    import BatterGameTableHeader from '$lib/components/batterGameTableHeader.svelte';
	//import { object } from 'zod';
	//import type { list } from 'postcss';

    console.log("test")
    let gameID: number = 40845664887 //Number($page.params.gameID) stopped working...
    let battingStats: any;
    let gameInfo: object;
    let allMatchups: any
    let user1: string;
    let user2: string;
    let userHome: string;
    let userAway: string;
    let scoreHome: number;
    let scoreAway: number;
    let inningsSelected: number;
    let inningsPlayed: number;

    //assign the info from the stores into variables.
    const unsubscribe1 = gameBattingStats.subscribe((value) => battingStats = value)
    onDestroy(unsubscribe1)
    const unsubscribe2 = gameInformation.subscribe((value) => allMatchups = value)
    onDestroy(unsubscribe2)
    
    // get users from batting stats.
    $: {
        user1 = Object.keys(battingStats)[0]
        user2 = Object.keys(battingStats)[1]
    }

    // search all games between the two users and pick out the one matching the game id of the page.
    // parse game information
    //This block is causing issues!
    /*$: {
        /*for (let game of allMatchups) {
            if (game.game_id === gameID) {
                gameInfo = game;
                break
            }
        }
        userHome = gameInfo.home_user;
        userAway = gameInfo.away_user;
        inningsSelected = gameInfo.innings_selected;
        inningsPlayed = gameInfo.innings_played;
        scoreHome = gameInfo.home_score;
        scoreAway = gameInfo.away_score;
        console.log("home ", userHome, " away ", userAway)
    }*/

    // When users get pulled from the batting stats, call API to find their game.
    $: getGameInfo(user1, user2)
    
    onMount(async () => {
        console.log('On mount')
        await getGameOstat(gameID);
        await getGamePstat(gameID);
    })
</script>

<!--h2>{userHome} {scoreHome} Final {scoreAway} {userAway}</h2-->
<!--BatterGameTableHeader /-->


<!--input type='string' bind:value={stat} on:change={stat}/-->

<!--
<h2 style="display:flex;justify-content:center;align-items:center;">{$page.params.user}</h2>
<br/>
<table class="table table-hover table-interactive">
    <OffensiveStatTableHeader title="Character" />
    <tbody>
        {#if statData}
            <OffensiveStatTableRow title="ALL" statData={statData} />
        {/if}
        {#if statDataByChar}
            { #each sortedChars(statDataByChar) as char } 
                <OffensiveStatTableRow title={char} statData={statDataByChar[char]?.Batting} />
            {/each}
        {/if}
    </tbody>
</table>
-->