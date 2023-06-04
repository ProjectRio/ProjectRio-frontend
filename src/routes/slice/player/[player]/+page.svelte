<script lang="ts">
    import { stadiums } from '../../../../components/stadiumName';
    import { getAllTagSets } from '../../../../components/tagNames';
    export let data;
    import { tagsets } from '$lib/tagsets';
    import { onMount } from 'svelte';
    import { Body } from 'svelte-body';
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

<Body style="background-color:#333;color:#f5f5f5;display:flex;justify-content:center;align-items:center;margin:0;" />
<a href="/slice"><button class="game-mode">Return to Games List</button></a>

<!-- recent games table (diff page..?) -->
{#if data.games}
<h2 style="display:flex;justify-content:center;align-items:center;">{$page.params.player}</h2>
<table>
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
                <td class="player-link"><a class="player" href={`/slice/player/${games.away_user}`}>{games.away_user}</a></td>
                <td>{games.away_score}</td>
                  <td>{games.home_score}</td>
                  <td class="player-link"><a class="player" href={`/slice/player/${games.home_user}`}>{games.home_user}</a></td>
                  <td>{stadiums[games.stadium]}</td>
                  <td class="mode"><a href={`/slice/${tagsetsData.find(tagset => tagset.id === games.game_mode)?.name}`}/ladder>{tagsetsData.find(tagset => tagset.id === games.game_mode)?.name || ''}</a></td>

                  <td>{new Date(games.date_time_start * 1000).toLocaleString()}</td>
              </tr>
      {/each}
  </tbody>
</table>
{/if}

  
<style>
    h1 {
      justify-content: center;
      align-self: center;
    }
    /* @import "./slice.css"; */
    * {
        font-size: 0.85rem  ;
    }
    

  /* need to break up this page */
  table { 
    height: auto;
    width: 100%; 
    min-width: 400px;
    border-collapse: collapse; 
  }

  /* Zebra striping */
  /* tr:nth-of-type(odd) { 
    background: #eee; 
  } */
  /* th { 
    background: #ccc; 
    color: black; 
    font-weight: bold; 
  } */
  td, th { 
    padding: 6px; 
    border: 1px solid #ccc; 
    text-align: center; 
    color: #f5f5f5
  }

  /* .hover-row:hover {
    background-color:lightblue;
  } */
  thead{
    background:#222;
}

thead tr {
  background: #222;
}
thead th, tbody td {
    border: 2px solid #f5f5f5;
    padding: 4px 20px;
}
tbody tr{
    transition:all, 0.2s;
}
tbody tr:hover{
    background:#00A4E8ff;
}

tbody tr a:hover td:hover{
  background: #F367D0ff;
}

.game-mode {
  text-decoration: none;
  color: inherit;
  width: fit-content;
  align-self:auto;
  /* align-self: center; */
  /* position: fixed; */
  /* left: 10%;
  top: 20%; */
}

.game-mode {
  background: #333;
  border-color: #00A4E8ff;
  border-style:double 4px;
  border-radius: 4px;
  color: #f5f5f5;
  font-weight: bolder;
  box-shadow: #F367D0ff 0   2px;
}
button:hover {
  color: #F367D0ff;

}
.mode:hover {
  background: #F367D0ff;
}

a {
    text-decoration: none;
}

.player, .mode a {
  text-decoration: none;
  color: inherit;
  justify-content: center;
}

.player-link:hover, .game-mode:hover {
  background-color: #F367D0ff;
}

a {
  color: inherit;
}

th {
  background-color: #222;
}

table {
  box-shadow: rgba(0, 164, 232, 0.4) 5px 5px, rgba(0, 164, 232, 0.3) 10px 10px, rgba(0, 164, 232, 0.2) 15px 15px, rgba(0, 164, 232, 0.1) 20px 20px, rgba(0, 164, 232, 0.05) 25px 25px;
}

.head {
  display: flex;
  justify-content: space-around;
}

td {
  position: relative;
}

.data-label {
  display: none;
}

/* Media query for mobile */
@media screen and (max-width: 600px) {
  .data-label {
    display: inline-block;
    position: absolute;
    top: 0;
    right: 0;
    background-color: #00A4E8ff;
    color: #fff;
    padding: 2px 6px;
  }
}
  </style>
  