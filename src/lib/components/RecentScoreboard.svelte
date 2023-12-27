<script lang='ts'>
	import { date } from "zod";

    export let recentGame: any = undefined;
    export let gameMode: string = "";
    console.log("Game passed to scoreboard component: ", recentGame)
    console.log("Gamemode passed to scoreboard component: ", gameMode)

    let homeWon: boolean = (recentGame.home_score > recentGame.away_score) ? true : false;

    let homeEloOld: number = (homeWon) ? recentGame.winner_incoming_elo : recentGame.loser_incoming_elo;
    let homeEloNew: number = (homeWon) ? recentGame.winner_result_elo : recentGame.loser_result_elo;
    let awayEloOld: number = (homeWon) ? recentGame.loser_incoming_elo : recentGame.winner_incoming_elo;
    let awayEloNew: number = (homeWon) ? recentGame.loser_result_elo : recentGame.winner_result_elo;

    let inningDisplay: string = (recentGame.innings_played === recentGame.innings_selected) ? "" : `(${recentGame.innings_played}/${recentGame.innings_selected})`

    
        let timeSinceGame_s: number = Math.floor(Date.now() / 1000) - recentGame.date_time_end
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

</script>

<div class="game-container">
    <div class="header-row">
        <div class="header-gameStatus">Final {inningDisplay}</div>
        <div class="header-timestamp">{timeSinceGame}</div>
    </div>
    <div class="team-row">
        <div class="row-logo"><img src={`/src/lib/images/Teams/Birdo Fans.png`}></div>
        <div class="row-player-and-elo">
            <div class="row-player">{recentGame.away_user}</div>
            <div class="row-elo">ELO: {awayEloOld} → {awayEloNew}</div>
        </div>
        <div class="row-score">{recentGame.away_score}</div>
    </div>
    <div class="team-row">
        <div class="row-logo"><img src={`/src/lib/images/Teams/Yoshi Islanders.png`}></div>
        <div class="row-player-and-elo">
            <div class="row-player">{recentGame.home_user}</div>
            <div class="row-elo">ELO: {homeEloOld} → {homeEloNew}</div>
        </div>
        <div class="row-score">{recentGame.home_score}</div>
    </div>
    <div class="gameMode">{gameMode}</div>
</div>

<style>
    .game-container {
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
</style>