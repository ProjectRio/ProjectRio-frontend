<script lang="ts">
    /* Improvements to do
    Add season record beside player names
    Add links where it makes sense - player stat pages, mode page.
    Improve styling
    Get season stats for average, OPS, ERA
    When events get added back to the API:
    -Add event-by-event breakdown
    -Add box score
    -Add win probability
    -Order by batting order
    */
    import { gameStats, gameInformation } from '$lib/stores/gameStats';
    import { onMount } from 'svelte';
    import { page } from '$app/stores';
	import { getGameStats, getMatchups } from '$lib/helpers/getGameStats';
	import { getAvg, getObp, getOps, getPa, getSlg } from '$lib/helpers/statCalcs';
    import BatterGameTableHeader from '$lib/components/batterGameTableHeader.svelte';
    import BatterGameTableRow from '$lib/components/batterGameTableRow.svelte';
    import BatterGameTableTotalRow from '$lib/components/batterGameTableTotalRow.svelte';
    import PitcherGameTableHeader from '$lib/components/pitcherGameTableHeader.svelte';
    import PitcherGameTableRow from '$lib/components/pitcherGameTableRow.svelte';
    import PitcherGameTableTotalRow from '$lib/components/pitcherGameTableTotalRow.svelte';
    import GameMiscStats from '$lib/components/gameMiscStats.svelte';
    import { tagsets } from '$lib/stores/tagsets';
    import { getAllTagSets } from '$lib/helpers/tagNames';
    import { msToTime } from '$lib/helpers/convertTime';
    import { stadiums } from '$lib/helpers/stadiumName';
    import { Team_Name } from '$lib/helpers/teamNames';

    console.log("Started script")

    let gameID: number = Number($page.params.gameID)
    let gameAllStats: any = $gameStats
    let gameInfo: any = $gameInformation;
    let user1: string;
    let user2: string;
    let homeRoster: any[] = [];
    let awayRoster: any[] = [];
    let tagsetsData: any[] = []
    let loadingInd: boolean = true;
    let homeElo: number = 0;
    let awayElo: number = 0;
    let homeLogo: string = "";
    let awayLogo: string = "";

    
    onMount(async () => {
        loadingInd = true;
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
        console.log("Calling tagset API")
        getAllTagSets();
        console.log("On mount finished")
        loadingInd = false;
    })

    // Access the tagsets data in your component
    $: {
        tagsetsData = $tagsets; 
    }

    class player {
        name: string = "Unknown";
        battingStats: any = undefined;
        pitchingStats: any = undefined;
        fieldingStats: any = undefined;
        miscStats: any = undefined;

        constructor (player_name: string, player_battingStats: any, player_pitchingStats: any, player_fieldingStats: any, player_miscStats: any) {
            this.name = player_name;
            this.battingStats = player_battingStats;
            this.pitchingStats = player_pitchingStats;
            this.fieldingStats = player_fieldingStats;
            this.miscStats = player_miscStats;
        }
    }
    
    //Set top line score values
    $: userHome = gameInfo.home_user;
    $: userAway = gameInfo.away_user;
    $: scoreHome = gameInfo.home_score;
    $: scoreAway = gameInfo.away_score;
    $: gameLength = msToTime((gameInfo.date_time_end - gameInfo.date_time_start)*1000);
    $: inningsPlayed = gameInfo.innings_played;
    $: inningsSelected = gameInfo.innings_selected;
    $: homeGameStats = gameAllStats[userHome]
    $: awayGameStats = gameAllStats[userAway]
    $: homeCaptain = gameInfo.home_captain;
    $: awayCaptain = gameInfo.away_captain;


    //create roster structures
    $: {
        homeRoster = [];
        awayRoster = [];
        for (const character in homeGameStats) {
            const batterStats = homeGameStats[character].Batting;
            const pitcherStats = homeGameStats[character].Pitching;
            const fielderStats = homeGameStats[character].Fielding;
            const miscStats = homeGameStats[character].Misc;
            homeRoster.push(new player(character, batterStats, pitcherStats, fielderStats, miscStats))
        }
        console.log("home roster: ", homeRoster[0])

        for (const character in awayGameStats) {
            const batterStats = awayGameStats[character].Batting;
            const pitcherStats = awayGameStats[character].Pitching;
            const fielderStats = awayGameStats[character].Fielding;
            const miscStats = awayGameStats[character].Misc;
            awayRoster.push(new player(character, batterStats, pitcherStats, fielderStats, miscStats))
        }
        console.log("away roster: ", awayRoster[0])
    }

    $: homeLogo = Team_Name(Array.from(homeRoster, (charInfo) => charInfo.name), homeCaptain)
    $: awayLogo = Team_Name(Array.from(awayRoster, (charInfo) => charInfo.name), awayCaptain)

    //determine Elo's
    $: {
        if (scoreHome > scoreAway) {
            homeElo = gameInfo.winner_result_elo;
            awayElo = gameInfo.loser_result_elo;
        } else {
            homeElo = gameInfo.loser_result_elo;
            awayElo = gameInfo.winner_result_elo;
        }
    }


</script>



{#if !loadingInd}
    <div class="headerBox">
        <div>
            <img src={`/src/lib/images/Teams/${homeLogo}.png`}>
            <div class="elo">Elo {homeElo}</div>
        </div>
        <div class="userAndScoreHome">
            {userHome} <br>
            {scoreHome}
        </div>
        <div class="finalAndMode"> 
            Final
            {#if inningsPlayed!==inningsSelected} <span class="inningInfo">({inningsPlayed}/{inningsSelected})</span> {/if} <br>
            <span class=gameTag>{tagsetsData.find(tagset => tagset.id === gameInfo.game_mode)?.name || ''}</span>
        </div>
        <div class="userAndScoreAway">
            {userAway} <br> 
            <span class="score">{scoreAway}</span>
        </div>
        <div>
            <img src={`/src/lib/images/Teams/${awayLogo}.png`}>
            <div class="elo">Elo {awayElo}</div>
        </div>
    </div>

    <div class="statColumn">
        <div class="statTable">
            <BatterGameTableHeader />

            {#each homeRoster as { name, battingStats}, i}
                <BatterGameTableRow batterName = {name} batterInfo={battingStats} isCaptain={homeCaptain===name}/>
            {/each}

            <BatterGameTableTotalRow teamStats={homeRoster} />

            <br>

            <PitcherGameTableHeader />
            {#each homeRoster as { name, pitchingStats}, i}
                {#if pitchingStats.batters_faced !== 0}
                    <PitcherGameTableRow pitcherName = {name} pitcherInfo={pitchingStats} isCaptain={homeCaptain===name}/>
                {/if}
            {/each}

            <PitcherGameTableTotalRow teamStats={homeRoster} />

            <GameMiscStats roster={homeRoster} />
        </div>

        <div class="statTable">
            <BatterGameTableHeader />
            {#each awayRoster as { name, battingStats}, i}
                <BatterGameTableRow batterName = {name} batterInfo={battingStats} isCaptain={awayCaptain===name} />
            {/each}

            <BatterGameTableTotalRow teamStats={awayRoster} />

            <br>

            <PitcherGameTableHeader />
            {#each awayRoster as { name, pitchingStats}, i}
                {#if pitchingStats.batters_faced !== 0}
                    <PitcherGameTableRow pitcherName = {name} pitcherInfo={pitchingStats} isCaptain={awayCaptain===name} />
                {/if}
            {/each}

            <PitcherGameTableTotalRow teamStats={awayRoster} />
            
            <GameMiscStats roster={awayRoster} />
        </div>
    </div>
    <br>
    <div class="miscInfo">
        <strong>First pitch:</strong> {new Date(gameInfo.date_time_start * 1000).toLocaleString()} <br>
        <strong>Game Time:</strong> {gameLength} <br>
        <strong>Stadium:</strong> {stadiums[gameInfo.stadium]}
    </div>
{:else}
    <p>Loading</p>
{/if}


<style>
    .headerBox {
        display: grid;
        grid-template-columns: repeat(21, 1fr);
        border-radius: 30px;
        background: red;
        text-align: center;
        font-size: 2em;
        padding: 1%;
    }
    
    .userAndScoreHome {
        grid-column: 2/9;
        font-size: 1.5em;
        padding-block: 5%;
    }    

    .userAndScoreAway {
        grid-column: 14/21;
        font-size: 1.5em;
        padding-block: 5%;
    }

    .gameTag {
        font-size: 0.5em;
        font-style: italic;
    }

    .finalAndMode {
        grid-column: 9/14;
        padding-block: 5%;
    }

    .score {
        font-size: 1.25;
    }

    .elo {
        padding-block: 40%;
        font-size: 0.5em;
    }

    .inningInfo {
        font-size: 0.5em;
    }

    .statColumn {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
    }

    .statTable {
        margin: 0 auto;
    }

    .headerBox br {
        content: "";
        margin: 2em;
        display: block;
        font-size: 24%;
        outline: red;
    }


</style>