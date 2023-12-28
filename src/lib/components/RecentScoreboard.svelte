<script lang='ts'>
    import { Team_Name } from "$lib/helpers/teamNames";
    import { characters } from "$lib/helpers/characterName";
	import { boolean } from "zod";

    export let recentGame: any = undefined;
    export let gameMode: string = "";
    console.log("Game passed to scoreboard component: ", recentGame)
    console.log("Gamemode passed to scoreboard component: ", gameMode)

    export let recentGameOptions: object = {
        greenscreen: false,
        nGames: 5,
        displayInterval: 5
    }


    function didHomeWin(game: any) {return game.home_score > game.away_score};

    function getHomeEloOld(game:any) {return (didHomeWin(game)) ? game.winner_incoming_elo : game.loser_incoming_elo}
    function getHomeEloNew(game:any) {return (didHomeWin(game)) ? game.winner_result_elo : game.loser_result_elo};
    function getAwayEloOld(game:any) {return (didHomeWin(game)) ? game.loser_incoming_elo : game.winner_incoming_elo};
    function getAwayEloNew(game:any) {return (didHomeWin(game)) ? game.loser_result_elo : game.winner_result_elo};

    function getInningDisplay(game:any) {return (game.innings_played === game.innings_selected) ? "" : `(${game.innings_played}/${game.innings_selected})`}

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

    function getHomeTeamName(game: any) {
        return Team_Name(Array.from(Object.values(game.home_roster), (charIndex) => characters[charIndex]), game.home_captain)
    } 
    function getAwayTeamName(game: any) {
        return Team_Name(Array.from(Object.values(game.away_roster), (charIndex) => characters[charIndex]), game.away_captain)
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
</script>

<div class="main-container">
    <div id="game-container">
        <div class="header-row">
            <div class="header-gameStatus">Final {getInningDisplay(recentGame)}</div>
            <div class="header-timestamp">{getTimeSinceGame(recentGame)}</div>
        </div>
        <div class="team-row">
            <div class="row-logo"><!--img src={`/src/lib/images/Teams/${getAwayTeamName(recentGame)}.png`}--></div>
            <div class="row-player-and-elo">
                <div class="row-player">{recentGame.away_user}</div>
                <div class="row-elo">ELO: {getAwayEloOld(recentGame)} → {getAwayEloNew(recentGame)}</div>
            </div>
            <div class="row-score">{recentGame.away_score}</div>
        </div>
        <div class="team-row">
            <div class="row-logo"><!--img src={`/src/lib/images/Teams/${getHomeTeamName(recentGame)}.png`}--></div>
            <div class="row-player-and-elo">
                <div class="row-player">{recentGame.home_user}</div>
                <div class="row-elo">ELO: {getHomeEloOld(recentGame)} → {getHomeEloNew(recentGame)}</div>
            </div>
            <div class="row-score">{recentGame.home_score}</div>
        </div>
        <div class="gameMode">{gameMode}</div>
    </div>
    <div class='recent-options'>
        Recent Game Options<br>
        <input class="checkbox" type="checkbox" checked={recentGameOptions.greenscreen} on:change={toggleGreenScreen}/> Greenscreen Mode <br>
        <input class="numberbox" type="number" bind:value={recentGameOptions.nGames} min="1" max="20"/> # Games <br>
    </div>
</div>

<style>
    .main-container {
        display: grid;
        grid-template-columns: auto auto;
    }
    #game-container {
        display: grid;
        grid-template-rows: 1.5em 3em 3em 1.5em;
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
        grid-template-columns: 3em auto 3em;
    }
    .row-logo {
        padding: 0.2em 0.2em
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