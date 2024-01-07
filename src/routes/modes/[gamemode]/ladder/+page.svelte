<script lang="ts">
    // Import store
    import { page } from '$app/stores';
	import { BACKEND, UNCATEGORIZED_ENDPOINTS } from '$lib/constants';
  import { titleCase } from '$lib/utils';
  // import {sortableTableAction} from "svelte-legos";
    // right now this isn't working ...?
    // Import components

    
    // Instantiate variables
    let players: any = [];
  
    // Call on page load
    // TODO: connect to the helper function directly
    getTagSetLadder();
    async function getTagSetLadder() {
      try {
        const response = await fetch(BACKEND + UNCATEGORIZED_ENDPOINTS.GET_TAG_SET, {
          method: "POST",
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            "TagSet": $page.params.gamemode
          })
        });
        const result = await response.json();
        console.log(result);
        // players = Object.values(result).sort((a: any, b: any) => b.rating - a.rating);
        players = Object.values(result);
        const ALPHA = 0.1
        const BETA = 0.85
        players.forEach(p => {
          p.player_games = p.num_wins + p.num_losses + 1;
          p.adjusted_rating = Math.round((BETA + ((1 - BETA) * (1 - (Math.exp(1 - (ALPHA * p.num_wins)))))) * (p.rating - (500 * Math.sqrt(Math.log10(p.player_games + 1) / p.player_games))));
        })
        // for (let p in players) {
        //   let player_games = p.num_wins + p.num_losses + 1
        //   p.adjusted_rating = (BETA + ((1 - BETA) * (1 - (Math.exp(1 - (ALPHA * p.num_wins)))))) * (p.rating - (500 * Math.sqrt(Math.log10(player_games + 1) / player_games)))
        // }

        players = players.sort((a: any, b: any) => b.adjusted_rating - a.adjusted_rating);
      } catch (error) {
        console.log(error);
      }
    }
  
  </script>

  <!-- <a href="/modes"><button class="game-mode">Return to Games List</button></a> -->
  <div class="flex-auto m-4">
  <a href={`/modes/` + $page.params.gamemode + `/peak`} class="decoration-transparent flex m-2 "><input type="checkbox" class="checkbox" id="peak" name="peak">
    <label for="peak" class="flex m-2">View player peaks for this Game Mode.</label></a>
  </div>
  <h1>{titleCase($page.params.gamemode)} Ladder</h1>
  <section class="table-container">
<!--    <table class="table table-hover table-interactive table-compact" use:sortableTableAction>-->
    <table class="table table-hover table-interactive table-compact">

      <thead>
      <tr>
        <th>#</th>
        <th>Rating</th>
        <th>Username</th>
        <th>W-L</th>
      </tr>
      </thead>
      <tbody>
      {#if players}
        {#each players as player, i}
          <tr class="">
            <td>{i + 1}</td>
            <td>{player.adjusted_rating}</td>
            <td class="player-link "><a class="player decoration-transparent" href={`/modes/player/${player.username}`}>{player.username}</a></td>
            <td>{player.num_wins}-{player.num_losses}</td>
          </tr>
        {/each}
      {/if}
    </tbody>
    </table>
  </section>

  <style>
    td a, a {
      color: rgba(var(--text-neutral-500) / 1) !important; 
    }
  </style>
