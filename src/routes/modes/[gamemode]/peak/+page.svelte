<script lang="ts">
    // Import store
    import { page } from '$app/stores';
    export let data;
    import { titleCase } from '$lib/utils.js';

    // right now this isn't working ...?
    import { sortableTableAction } from 'svelte-legos';

    // Instantiate variables

    let playerPeak: any = {};
    let sortedPlayerPeak: ArrayLike<unknown> | { [s: string]: unknown; };
    function assignWinnerLoser(game: {
        date_time_start: number;
        winner_in_elo: any;
        winner_incoming_elo: any;
        winner_out_elo: any;
        winner_result_elo: any;
        loser_in_elo: any;
        loser_incoming_elo: any;
        loser_out_elo: any;
        loser_result_elo: any;
        away_score: number;
        home_score: number;
        winner: any;
        away_user: any;
        loser: any;
        home_user: any;
        }) {
            if (game.away_score > game.home_score) {
                game.winner = game.away_user;
                game.loser = game.home_user;
            } else if (game.away_score < game.home_score) {
                game.winner = game.home_user;
                game.loser = game.away_user;
            }
            game.winner_in_elo = game.winner_incoming_elo;
            game.winner_out_elo = game.winner_result_elo;
            game.loser_in_elo = game.loser_incoming_elo;
            game.loser_out_elo = game.loser_result_elo;

            if (!playerPeak.hasOwnProperty(game.winner) || playerPeak[game.winner] === undefined) {
                playerPeak[game.winner] = {};
            }
            if (!playerPeak.hasOwnProperty(game.loser) || playerPeak[game.loser] === undefined) {
                playerPeak[game.loser] = {};
            }

            if (
                playerPeak[game.winner].score === undefined ||
                playerPeak[game.winner].score < Math.max(game.winner_incoming_elo, game.winner_result_elo)
            ) {
                playerPeak[game.winner].score = Math.max(game.winner_incoming_elo, game.winner_result_elo);
                playerPeak[game.winner].date = new Date(game.date_time_start * 1000).toLocaleString();
            }

            if (
                playerPeak[game.loser].score === undefined ||
                playerPeak[game.loser].score < Math.max(game.loser_incoming_elo, game.loser_result_elo)
            ) {
                playerPeak[game.loser].score = Math.max(game.loser_incoming_elo, game.loser_result_elo);
                playerPeak[game.loser].date = new Date(game.date_time_start * 1000).toLocaleString();
            }
    }

    async function getLadderPeak() {
        let games = data.data.games
        // console.log(games)
        games.forEach((game: any) => {
            assignWinnerLoser(game)
        });
        console.log(playerPeak)
        sortedPlayerPeak = Object.entries(playerPeak).sort((a, b) => b[1].score - a[1].score)
        console.log(sortedPlayerPeak)
    }

    getLadderPeak();

  </script>
<!--<button class="btn variant-ghost-error">-->
<!--    <a href="/modes" class="decoration-transparent"><button class="game-mode">Return to Games List</button></a>-->
<!--</button>-->
<div class="flex-auto">

    <a href={`/modes/` + $page.params.gamemode + `/ladder`} class="decoration-transparent"><input type="checkbox" class="checkbox" id="ladder" name="ladder">
        <label for="ladder">View ladder for this Game Mode.</label></a>
</div>
  
  <h1>{titleCase($page.params.gamemode)} - ELO Peaks</h1>
  {#if data}
  <section class="table-container">
    <table class="table table-hover table-interactive" use:sortableTableAction>
      <thead>
      <tr class="table-cell-fit">
        <th>#</th>
        <th>Peak Glicko Rating</th>
        <th>Username</th>
        <th>Date of Peak</th>
      </tr>
      </thead>
      <tbody>
      {#if sortedPlayerPeak}
        {#each sortedPlayerPeak as [player, stats], i}
            {#if stats.score > 1500}
                <tr class="table-cell-fit">
                    <td>{i + 1}</td>
                    <td>{stats.score}</td>
                    <td class="player-link"><a class="player decoration-transparent" href={`/modes/player/${player}`}>{player}</a></td>
                    <td>{stats.date}</td>
                </tr>
            {/if}
        {/each}
      {/if}
      <tr></tr>
    </tbody>
    </table>
  </section>
  {/if}

<style>
td a, a {
    color: rgba(var(--text-neutral-500) / 1) !important;
}
</style>