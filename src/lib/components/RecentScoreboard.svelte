<script lang='ts'>

</script>

<div class="game-container">
    <div class="header-row">
        <div class="header-gameMode">Stars Off Season 7</div>
        <div class="header-gameStatus">Final (5/9)</div>
    </div>
    <div class="team-row">
        <div class="row-logo"><img src={`/src/lib/images/Teams/Birdo Fans.png`}></div>
        <div class="row-player-and-hits">
            <div class="row-player">Nuche 17</div>
            <div class="row-hits">Hits: 7</div>
        </div>
        <div class="row-score">3</div>
    </div>
    <div class="team-row">
        <div class="row-logo"><img src={`/src/lib/images/Teams/Yoshi Islanders.png`}></div>
        <div class="row-player-and-hits">
            <div class="row-player">Amongusblaster</div>
            <div class="row-hits">Hits: 12</div>
        </div>
        <div class="row-score">23</div>
    </div>
</div>

<style>
    .game-container {
        display: grid;
        grid-template-rows: 1.5em 3em 3em;
        max-width: 20em;
    }
    .header-row {
        display: grid;
        grid-template-columns: auto auto;
    }
    .header-gameMode {
        text-align: left;
    }
    .header-gameStatus {
        text-align: right;
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
    .row-hits {
        color: gray;
        font-size: 95%;
    }
    .row-score {
        font-size: 2.75em;
        text-align: right;
        padding: .25em 0 
    }
</style>