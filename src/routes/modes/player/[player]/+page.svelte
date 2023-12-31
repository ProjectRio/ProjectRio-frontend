<script lang="ts">
    import { stadiums } from '$lib/helpers/stadiumName';
    import { getAllTagSets } from '$lib/helpers/tagNames';
    // import { sortableTableAction} from "svelte-legos";

    export let data;
    import { tagsets } from '$lib/stores/tagsets';
    import { onMount } from 'svelte';
    import { page } from '$app/stores';
    // Access the tagsets data in your component
let tagsetsData: any[] = []
$: {
tagsetsData = $tagsets; // Get the current value of the tagsets store
}

onMount(() => {
    getAllTagSets();
})
</script>


<!-- recent games table (diff page..?) -->
{#if data.games}
<h2 style="display:flex;justify-content:center;align-items:center;"><a  href="/users/{$page.params.player}">{$page.params.player}</a></h2><br>
<div class="table-container">
<table  class="table table-hover table-interactive">
  <thead>
      <tr>
          <th>Away Player</th>
          <th>Away Score</th>
          <th>Home Score</th>
          <th>Home Player</th>
          <th>Stadium</th>
          <th>Game Mode</th>
          <th>Time</th>
      </tr>
  </thead>
  <tbody>
      {#each data.games as games}
              <tr>
                <td class="player-link hover:variant-ghost-error"><a class="player decoration-transparent" href={`/modes/player/${games.away_user}`}>{games.away_user}</a></td>
                  {#if games.away_score > games.home_score}
                      <td><strong>{games.away_score}</strong></td>
                      {:else}
                      <td>{games.away_score}</td>
                  {/if}
                  {#if games.away_score < games.home_score}
                      <td><strong>{games.home_score}</strong></td>
                  {:else}
                      <td>{games.home_score}</td>
                  {/if}
                  <td class="player-link hover:variant-ghost-error"><a class="player decoration-transparent" href={`/modes/player/${games.home_user}`}>{games.home_user}</a></td>
                  <td>{stadiums[games.stadium]}</td>
                  <td class="modes hover:variant-ghost-error"><a  class="decoration-transparent" href={`/modes/${tagsetsData.find(tagset => tagset.id === games.game_mode)?.name}`}/ladder>{tagsetsData.find(tagset => tagset.id === games.game_mode)?.name || ''}</a></td>

                  <td>{new Date(games.date_time_start * 1000).toLocaleString()}</td>
              </tr>
      {/each}
  </tbody>
</table>
</div>
{/if}

<style>
    td a, a {
        color: rgba(var(--text-neutral-500) / 1) !important;
    }
</style>