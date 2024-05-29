<script lang='ts'>

/*
Improvements
- hide confirmed crashed games
- change crash handling to look at starttimes as an ID instead of using indicies that change when new games start
*/
	import { onDestroy, onMount } from "svelte";
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
    }

    let liveGameOptions: any = {
        greenscreenOn: false,
        display_s: 10,
        liveGameTimeframe_m: 60
    }

    let loadingInd: boolean = true;
    let liveGame: any;
    let displayedGameIndex: number = 0;
    let lastAPICall: number;
    let currentLiveGame: boolean = false;
    let currentLiveList: any
    let newLiveList: any
    let suspectedCrashedGameIndexes: number[] = []
    let confirmedCrashedGameIndexes: number[] = []
    var dataRefreshInterval: any;
    var displayInterval: any;

    
    //Check for possible crashes
    function isCrash (oldImage: any, newImage: any) {
        return (oldImage.inning === newImage.inning &&
            oldImage.half_inning === newImage.half_inning &&
            oldImage.batter === newImage.batter &&
            oldImage.pitcher === newImage.pitcher)
    }

    function crashHandling() {
        newLiveList.forEach((game: { start_time: number; inning: number; half_inning: number; batter: number; pitcher: number;}, newGameIndex: number) => {
            // if a game just started or ended, the indicies won't match, so reset crash handling and skip this time.
            if (currentLiveList.length !== newLiveList.length) {
                suspectedCrashedGameIndexes = []
                confirmedCrashedGameIndexes = []
                return
            }

            // find matching old game
            var matchingOldGameIndex = currentLiveList.findIndex((oldGame: { start_time: any; }) => {
                return game.start_time === oldGame.start_time
            })

            if (isCrash(currentLiveList[matchingOldGameIndex], game)) {
                //if index is already a suspected crash, then mark as confirmed crash
                if (suspectedCrashedGameIndexes.includes(newGameIndex)) {
                    confirmedCrashedGameIndexes.indexOf(newGameIndex) === -1 ? confirmedCrashedGameIndexes.push(newGameIndex) : void(0);
                } else { //if not already suspected, then add to suspected list
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
    }

    async function startIntervals () {
        //Periodically refresh API call.
        dataRefreshInterval = setInterval(async () => {
            if ((currentLiveGame && Date.now() - 20*1000 > lastAPICall) || //if there is a current live game, refresh it periodically, or
                (!currentLiveGame && Date.now() - 5*60*1000 > lastAPICall)) { //if there isn't a live game, then check for new ones less frequently
                currentLiveList = $liveGameList // store current games list before API is called for crash checking reasons.
                await getLiveGames(liveGameOptions.liveGameTimeframe_m*60)
                lastAPICall = Date.now()
                newLiveList = $liveGameList
                console.log("current live game check", $liveGameList)
                if ((<any>$liveGameList).length > 0) {
                    if (!currentLiveGame) {liveGame = (<any>$liveGameList)[0]} // if live game ind was false, then it means a new game just appeared and that needs to be set as the game to display
                    currentLiveGame = true
                } else {
                    currentLiveGame = false
                }
                // add check if first list game just appeared, then set live game
                //currentLiveGame = (<any>$liveGameList).length > 0; //check if any live games were returned.

                crashHandling()
            }
        }, 1*1000); //refresh rate is high since the logic above is what controls the API call frequency.
        
        //initial API call
        await getLiveGames(liveGameOptions.liveGameTimeframe_m*60); 
        lastAPICall = Date.now()
        console.log("Initial API request finished", $liveGameList)
        liveGame = (<any>$liveGameList)[0]; // set initial game to display
        currentLiveGame = (<any>$liveGameList).length > 0; //check if any live games were returned.
        loadingInd = false

        // Decides when to switch which game is displayed.
        displayInterval = setInterval(() => {
            if ((<any>$liveGameList).length !== 0) {
                displayedGameIndex = (displayedGameIndex >= (<any>$liveGameList).length - 1) ? 0 : displayedGameIndex + 1
            }
            liveGame = (<any>$liveGameList)[displayedGameIndex]
            console.log("live game displayed", displayedGameIndex, liveGame)
        }, liveGameOptions.display_s*1000)
    }

    onMount(async () => {
        console.log("Live OnMount started")
        
        getAllTagSets();

        startIntervals()
    })

    onDestroy(() => {
        console.log("Live OnDestroy ran")
        clearInterval(dataRefreshInterval)
        clearInterval(displayInterval)
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
        return `../../lib/images/Teams/${team}.png`
    } 

    function toggleGreenScreen() {
        liveGameOptions.greenscreenOn = !liveGameOptions.greenscreenOn
        if (liveGameOptions.greenscreenOn) {
            document.getElementById('live-container')?.style.setProperty("background-color", '#00b140')
        } else {
            document.getElementById('live-container')?.style.setProperty("background-color", "")        
        }
    }

    async function manualRefresh() {
        //destroy intervals to avoid data leaks
        clearInterval(dataRefreshInterval)
        clearInterval(displayInterval)
        console.log(liveGameOptions)

        //start intervals again
        startIntervals()
    }

</script>

{#if !loadingInd}
        <div class="main-container">
            {#if currentLiveGame}
            <div id='live-container'>
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
                    <div class="offDef"><img src={`../../lib/images/${(liveGame.half_inning === 0) ? "Baseball" : "Baseball_bat"}.png`} alt="Offense or defence"></div>
                    <div class="character"><img src={`../../lib/images/Characters/${(liveGame.half_inning === 0) ? characters[liveGame[`home_roster_${liveGame.pitcher}_char`]] : characters[liveGame[`home_roster_${liveGame.batter}_char`]]}.png`} alt="current batter/pitcher"></div>
                    <div class="bases-count">
                        <div class="bases"><img src={`../../lib/images/Bases/R${((liveGame.runner_on_first) ? "1" : "") + ((liveGame.runner_on_second) ? "2" : "") + ((liveGame.runner_on_third) ? "3" : "")}.png`} alt="current runners on base"></div>
                        <div class="count">{(displayedGameIndex in confirmedCrashedGameIndexes) ? "(Crashed?)" : (liveGame.outs===0) ? "○○○" : (liveGame.outs===1) ? "●○○" : "●●○"}</div>
                    </div>
                    <div class="character"><img src={`../../lib/images/Characters/${(liveGame.half_inning === 1) ? characters[liveGame[`away_roster_${liveGame.pitcher}_char`]] : characters[liveGame[`away_roster_${liveGame.batter}_char`]]}.png`} alt="current batter/pitcher"></div>
                    <div class="offDef"><img src={`../../lib/images/${(liveGame.half_inning === 1) ? "Baseball" : "Baseball_bat"}.png`} alt="offence or defence"></div>
                </div>
                <div class="game-mode">{tagsetsData.find(tagset => tagset.id === liveGame.tag_set)?.name || ''}</div>
            </div>
            {:else}
                <p>No current live games</p>
            {/if}
            <div class='live-options'>
                Live Game Options <br>
                <input class="numberbox" type="number" bind:value={liveGameOptions.display_s} min="1" max="20"/> Change Frequency (s)<br>
                <input class="numberbox" type="number" bind:value={liveGameOptions.liveGameTimeframe_m} min="20" max="1440"/> Minutes ago live games started<br>
                <button on:click={manualRefresh}>Update Display Options </button><br>
                <input class="checkbox" type="checkbox" checked={liveGameOptions.greenscreenOn} on:change={toggleGreenScreen}/> Greenscreen Mode <br>
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
    #live-container {
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
    .numberbox{
        color: black;
    }
</style>