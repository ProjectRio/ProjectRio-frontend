<script lang='ts'>

</script>

<div class='live-container'>
    <div class='row-username'>
        <div class='username-home'>Nuche17</div>
        <div class='username-away'>Amongusblaster</div>
    </div>
    <div class='row-score-logos'>
        <div class="logo"><img src={`/src/lib/images/Teams/Daisy Queen Bees.png`}></div>
        <div class="score">5</div>
        <div class="inning">Top 3</div>
        <div class="score">9</div>
        <div class="logo"><img src={`/src/lib/images/Teams/Luigi Leapers.png`}></div>
    </div>
    <div class='row-situation'>
        <div class="offDef"><img src={`/src/lib/images/Baseball.png`}></div>
        <div class="character"><img src={`/src/lib/images/Characters/Luigi.png`}></div>
        <div class="bases-count">
            <div class="bases"><img src={`/src/lib/images/Bases/R12.png`}></div>
            <div class="count">2-0   ooo</div>
        </div>
        <div class="character"><img src={`/src/lib/images/Characters/Bowser.png`}></div>
        <div class="offDef"><img src={`/src/lib/images/Baseball_bat.png`}></div>
    </div>
    <div class="game-mode">Stars Off Season 7</div>
</div>

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