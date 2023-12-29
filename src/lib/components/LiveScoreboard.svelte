<script lang='ts'>

/*
Improvements
- hide confirmed crashed games
*/
	import { onMount } from "svelte";
    import { getAllTagSets } from '$lib/helpers/tagNames';
    import { tagsets } from '$lib/stores/tagsets';
	import { getLiveGames } from "$lib/helpers/getGameLists";
    import { liveGameList, recentGameList } from "$lib/stores/gameLists";
    import { Team_Name } from "$lib/helpers/teamNames";
    import { characters } from "$lib/helpers/characterName";

    // Access the tagsets data in your component
    let tagsetsData: any[] = []
    $: {
        tagsetsData = $tagsets; // Get the current value of the tagsets store
    // console.log($tagsets)
    }

    let loadingInd: boolean = true;
    let liveGame: any;
    let displayedGameIndex: number = 0;
    let display_s: number = 5;
    let lastAPICall: number;
    let currentLiveGame: boolean = false;
    let liveGameTimeframe: number = 24*60*60
    let currentLiveList: any
    let newLiveList: any
    let suspectedCrashedGameIndexes: number[] = []
    let confirmedCrashedGameIndexes: number[] = []

    onMount(async () => {
        console.log("Onmount started")
        
        getAllTagSets();

        const dataRefreshInterval = setInterval(async () => {
            console.log("Data interval ran")
            if ((currentLiveGame && Date.now() - 5*1000 > lastAPICall) || //if there is a current live game, refresh it periodically, or
                (!currentLiveGame && Date.now() - 10*60*1000 > lastAPICall)) { //if there isn't a live game, then check for new ones less frequently
                currentLiveList = $liveGameList
                await getLiveGames(liveGameTimeframe)
                lastAPICall = Date.now()
                newLiveList = $liveGameList
                currentLiveGame = $liveGameList.length > 0; //check if any live games were returned.

                function isCrash (oldImage: any, newImage: any) {
                    return (oldImage.inning === newImage.inning &&
                        oldImage.half_inning === newImage.half_inning &&
                        oldImage.batter === newImage.batter &&
                        oldImage.pitcher === newImage.pitcher)
                }

                //Check for possible crashes
                newLiveList.forEach((game: { start_time: number; inning: number; half_inning: number; batter: number; pitcher: number;}, newGameIndex: number) => {
                    // fund matching old game
                    var matchingOldGameIndex = currentLiveList.findIndex((oldGame: { start_time: any; }) => {
                        return game.start_time === oldGame.start_time
                    })
                    console.log("Match", matchingOldGameIndex)

                    if (isCrash(currentLiveList[matchingOldGameIndex], game)) {
                        //if index is already a suspected crash, then mark as confirmed crash
                        console.log("markec as crashed", suspectedCrashedGameIndexes,suspectedCrashedGameIndexes.includes(newGameIndex))
                        if (suspectedCrashedGameIndexes.includes(newGameIndex)) {
                            console.log("Went to confirmed crash logic")
                            confirmedCrashedGameIndexes.indexOf(newGameIndex) === -1 ? confirmedCrashedGameIndexes.push(newGameIndex) : void(0);
                        } else { //if not already suspected, then add to suspected list
                            console.log("Went to suspected crash logic")
                            suspectedCrashedGameIndexes.indexOf(newGameIndex) === -1 ? suspectedCrashedGameIndexes.push(newGameIndex) : void(0);
                        }
                    } else { // if not a crash, the remove index from crashed lists if found
                        var indexToRemove = suspectedCrashedGameIndexes.indexOf(newGameIndex);
                        if (indexToRemove > -1) {
                            suspectedCrashedGameIndexes.splice(indexToRemove, 1);
                        }
                        indexToRemove = confirmedCrashedGameIndexes.indexOf(newGameIndex);
                        if (indexToRemove > -1) {
                            suspectedCrashedGameIndexes.splice(indexToRemove, 1);
                        }
                    }
                }); 
                console.log(suspectedCrashedGameIndexes, confirmedCrashedGameIndexes)
            }
            console.log("Data interval finished")
        }, 10*1000);
        await getLiveGames(liveGameTimeframe); //initial API call
        lastAPICall = Date.now()
        console.log("Initial API request finished", $liveGameList)
        liveGame = $liveGameList[0]; // set initial game to display
        currentLiveGame = $liveGameList.length > 0; //check if any live games were returned.
        loadingInd = false

        const displayInterval = setInterval(() => {
            console.log("Display interval started")
            if ($liveGameList.length !== 0) {
                displayedGameIndex = (displayedGameIndex >= $liveGameList.length - 1) ? 0 : displayedGameIndex + 1
            }
            console.log("Live Index", displayedGameIndex)
            liveGame = $liveGameList[displayedGameIndex]
            console.log("live game displayed", liveGame)
        }, display_s*1000)

        return () => {
            clearInterval(dataRefreshInterval);
            clearInterval(displayInterval);
        }
    })

    function getTeamImage(game: any, homeAway: string) {
        let roster: any[] = []
        let i: number = 0;
        while (i < 9) {
            roster.push(game[`${homeAway}_roster_${i}_char`])
            i++;
        }
        
        let captain: string;
        captain = characters[liveGame[`${homeAway}_roster_${liveGame[`${homeAway}_captain`]}_char`]]
        let team = Team_Name(Array.from(roster, (charIndex:number) => characters[charIndex]), captain)
        return `/src/lib/images/Teams/${team}.png`
    } 

</script>

{#if !loadingInd}
    {#if currentLiveGame}
        <div class='live-container'>
            <div class='row-username'>
                <div class='username-home'>{liveGame.home_player}</div>
                <div class='username-away'>{liveGame.away_player}</div>
            </div>
            <div class='row-score-logos'>
                <div class="logo"><img src={getTeamImage(liveGame, "home")} alt="Home logo"></div>
                <div class="score">{liveGame.home_score}</div>
                <div class="inning">{(liveGame.half_inning === 0) ? "Top" : "Bottom"} {liveGame.inning}</div>
                <div class="score">{liveGame.away_score}</div>
                <div class="logo"><img src={getTeamImage(liveGame, "away")} alt="Away logo"></div>
            </div>
            <div class='row-situation'>
                <div class="offDef"><img src={`/src/lib/images/${(liveGame.half_inning === 0) ? "Baseball" : "Baseball_bat"}.png`} alt="Offense or defence"></div>
                <div class="character"><img src={`/src/lib/images/Characters/${(liveGame.half_inning === 0) ? characters[liveGame[`home_roster_${liveGame.pitcher}_char`]] : characters[liveGame[`home_roster_${liveGame.batter}_char`]]}.png`} alt="current batter/pitcher"></div>
                <div class="bases-count">
                    <div class="bases"><img src={`/src/lib/images/Bases/R${((liveGame.runner_on_first) ? "1" : "") + ((liveGame.runner_on_second) ? "2" : "") + ((liveGame.runner_on_third) ? "3" : "")}.png`} alt="current runners on base"></div>
                    <div class="count">{(displayedGameIndex in suspectedCrashedGameIndexes) ? "(Crashed?)" : (liveGame.outs===0) ? "○○○" : (liveGame.outs===1) ? "●○○" : "●●○"}</div>
                </div>
                <div class="character"><img src={`/src/lib/images/Characters/${(liveGame.half_inning === 1) ? characters[liveGame[`away_roster_${liveGame.pitcher}_char`]] : characters[liveGame[`away_roster_${liveGame.batter}_char`]]}.png`} alt="current batter/pitcher"></div>
                <div class="offDef"><img src={`/src/lib/images/${(liveGame.half_inning === 1) ? "Baseball" : "Baseball_bat"}.png`} alt="offence or defence"></div>
            </div>
            <div class="game-mode">{tagsetsData.find(tagset => tagset.id === liveGame.tag_set)?.name || ''}</div>
        </div>
    {:else}
        <p>No current live games</p>
    {/if}
{:else}
    <p>Loading</p>
{/if}

<style>
    .live-container {
        display: grid;
        grid-template-rows: 2em 3em 3em 2em;
        row-gap: .1em;
        max-width: 20em;
    }
    .row-username {
        display: grid;
        grid-template-columns: 50% 50%;
        font-size: 120%;
    }
    .username-away {
        text-align: right;
    }
    .row-score-logos {
        display: grid;
        grid-template-columns: 3em 3em 8em 3em 3em;
        padding: 0.2em 0;
    }
    .logo {
        width: 95%;
    }
    .score {
        font-size: 2.75em;
        text-align: center;
        padding: .25em 0 
    }
    .inning {
        text-align: center;
        font-size: 120%;
        padding: 0.5em 0;
    }
    .row-situation {
        display: grid;
        grid-template-columns: 3em 3em 8em 3em 3em;
        max-height: 3em;
    }
    .offDef {
        padding: 20% 0;
        width: 1.5em;
        margin-left: auto;
        margin-right: auto;
    }
    .character {
        width: 2em;
        padding: 10% 0;
        margin-left: auto;
        margin-right: auto;
    }
    .bases-count {
        max-height: 3em;
    }
    .bases {
        width: 2em;
        margin-left: auto;
        margin-right: auto;
    }
    .count {
        text-align: center;
    }
    .game-mode {
        text-align: center;
    }
</style>