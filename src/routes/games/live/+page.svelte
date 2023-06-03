<script lang="ts">
    // import type { Readable } from 'svelte/store';
    import { DataHandler, Datatable, Th, ThFilter } from '@vincjo/datatables';
    import { onMount, afterUpdate, onDestroy} from 'svelte';
    // import { alertAction } from "svelte-legos";
    import { stadiums } from '../../../components/stadiumName';
    import {characters} from '../../../components/characterName';
    import { tagsets } from '$lib/tagsets';
    import { getAllTagSets } from '../../../components/tagNames';
    import { Body } from 'svelte-body';

   // init variables
    let games: any[] | undefined = [];
    let handler: DataHandler;
    let rows: any[];
    let basic;
    let detailed;
    let isVisible: boolean = false;
    let isLoading = true;
    let currentTime: Date;
    
// Access the tagsets data in your component
let tagsetsData: any[] = []
$: {
  tagsetsData = $tagsets; // Get the current value of the tagsets store
}

onMount(() => {
  fetchData(); // Fetch initial data
  getAllTagSets();
  setInterval(fetchData, 30000); // Schedule auto-update every 30 seconds
});

// Function to fetch data from the API
async function fetchData() {
  try {
    const response = await fetch('https://api.projectrio.app/populate_db/ongoing_game', {
      method: 'GET'
    });
    if (response.ok) {
      const result = await response.json();
      games = result.ongoing_games.sort((a: { start_time: number; }, b: { start_time: number; }) => b.start_time - a.start_time);
      // convert start time to filterable values
      games?.forEach(game => {
        game.new_start_time = new Date(game.start_time * 1000).toLocaleString();
        game.tag_set = tagsetsData.find(tagset => tagset.id === game.tag_set)?.name || '';
        // console.log(game.tag_set)
      })

      handler = new DataHandler(games, { rowsPerPage: 10 });
      rows = handler.getRows();

      console.log(`Table updated at ${currentTime}`)
      isLoading = false; // Update loading status after fetch
      currentTime = new Date().toLocaleTimeString();
    } else {
      console.error('Error fetching data from API:', response.status);
    }
  } catch (error) {
    console.error('Error fetching data from API:', error);
  }
}

afterUpdate(() => {
  if (rows) {
    // console.log(rows); // Log the rows when it becomes defined
  }
});

    // function to allow rows to be toggleable if clicked on for more details
    function toggleVisibility(index: number) {
      games[index].isVisible = !games[index].isVisible;
      isVisible = games[index].isVisible;

      rows = handler.getRows();
    }

  // Function to check if a key matches the provided keys
  function matchesKey(key: string, providedKeys: string[]): boolean {
    return providedKeys.includes(key);
  }

  function filterByConvertedDate(value, column) {
    const startDate = new Date(value * 1000).toLocaleString();
    return column === startDate;
  }
</script> 


  <!-- <button type="button" class="games-toggle"><a href="/games/live"></a></button> -->
  {#if isLoading === false}
  <div class="header">
    <a href="/games/recent"><button class="button-54">Recent Games</button></a>

    <h1>Live Games</h1>

  <h4>Last Updated at {currentTime}</h4>

  </div>
  {/if}
  {#if handler}
  <div class="container">
    <Datatable {handler}>
      <thead>
        <!-- sortable table headers TODO figure out a way to automate this across other table implementations -->
        <tr>
          <Th {handler} orderBy="away_player">Away Player</Th>
          <Th {handler} orderBy="away_score">Away Score</Th>
          <Th {handler} orderBy="home_score">Home Score</Th>
          <Th {handler} orderBy="home_player">Home Player</Th>
          <Th {handler} orderBy="inning">Inning</Th>
          <Th {handler} orderBy="tag_set">Game Mode</Th>
          <Th {handler} orderBy="start_time">Start Date</Th>
        </tr>
        <!-- table filters-->
        <tr>
          <ThFilter {handler} filterBy="away_player" />
          <ThFilter {handler} filterBy="away_score" />
          <ThFilter {handler} filterBy="home_score" />
          <ThFilter {handler} filterBy="home_player" />

          <ThFilter {handler} filterBy="inning" />
          <ThFilter {handler} filterBy="tag_set" />
          <ThFilter {handler} filterBy="new_start_time" />

          <!-- <ThFilter {handler} filterBy="start_time" /> -->
        </tr>
      </thead>
  
      <tbody>
        {#each $rows as row, index}
          <!-- hide on click to display alternate information instead -->
          {#if !row.isVisible}
            <tr bind:this={basic} on:click={() => toggleVisibility(index)}>
              <td>{row.away_player}</td>
              <td>{row.away_score}</td>
              <td>{row.home_score}</td>
              <td>{row.home_player}</td>

              {#if row.half_inning === 0}
                <td>&#11014;{row.inning}</td>
              {/if}
              {#if row.half_inning === 1}
                <td>⬇{row.inning}</td>
              {/if}
              <td>{row.tag_set}</td>
              <td>{row.new_start_time}</td>
            </tr>

          <!-- display on click -->
          {:else if row.isVisible}
          <tr class="hover-row" bind:this={basic} on:click={() => toggleVisibility(index)}>
            <td>{row.away_player}</td>
            <td>{row.away_score}</td>
            <td>{row.home_score}</td>
            <td>{row.home_player}</td>

            {#if row.half_inning === 0}
              <td>&#11014;{row.inning}</td>
            {/if}
            {#if row.half_inning === 1}
              <td>⬇{row.inning}</td>
            {/if}
              <td>{row.tag_set}</td>
            <td>{row.new_start_time}</td>
          </tr>

          <tr  bind:this={detailed} on:click={() => toggleVisibility(index)}>
            <td class="mobile-hide" style="font-weight: bolder">
              {'★ '.repeat(row.away_stars) + '☆ '.repeat(5 - row.away_stars)}
            </td>

            
            {#if row.half_inning === 0}
              {#if characters[row.batter] === "DK"}
              
                <td>🥊{characters[row[`away_roster_${row.batter}_char`]]}</td>

              {:else}
                <td>🏓{characters[row[`away_roster_${row.batter}_char`]]}</td>
              {/if}
            <td>⚾{characters[row[`home_roster_${row.pitcher}_char`]]}</td>
            <!-- <td>{row.outs} outs<br></td> -->
            <td class="mobile-hide" style="font-weight: bolder">
              {'★ '.repeat(row.home_stars) + '☆ '.repeat(5 - row.home_stars)}
            </td>
            {#if row.outs === 0}
              
              <td><div>Outs</div>○○○</td>
            {:else if row.outs === 1}
              <td><div>Outs</div>●○○</td>
            {:else if row.outs === 2}
              <td><div>Outs</div>●●○</td>
            {:else if row.outs === 3}
              <td><div>Outs</div>●●●</td>
            {/if}
            <td>
              {#if Number(row.runner_on_second) === 1}
                <div style="display:flex; justify-content:center; align-items:top;">❷</div>
              {:else}
                <div style="display:flex; justify-content:center; align-items:top;">➁</div>
              {/if}

              {#if Number(row.runner_on_first) === 1 && Number(row.runner_on_third) === 1}
                <span style="display:flex; justify-content:space-around;"><div>❸</div><div>❶</div></span>
              {:else if Number(row.runner_on_first) === 0 && Number(row.runner_on_third) === 1}
                <span style="display:flex; justify-content:space-around;"><div>❸</div><div>➀</div></span>
              {:else if Number(row.runner_on_first) === 1 && Number(row.runner_on_third) === 0}
                <span style="display:flex; justify-content:space-around;"><div>➂</div><div>❶</div></span>
              {:else if Number(row.runner_on_first) === 0 && Number(row.runner_on_third) === 0}
                <span style="display:flex; justify-content:space-around;"><div>➂</div><div>➀</div></span>
              {/if}
            </td>
            <td>{stadiums[row.stadium_id]}</td>
          {:else if row.half_inning === 1}
            <td>⚾{characters[row[`away_roster_${row.pitcher}_char`]]}</td>
            <td>🏓{characters[row[`home_roster_${row.batter}_char`]]}</td>
            <td class="mobile-hide" style="font-weight: bolder">
              {'★ '.repeat(row.home_stars) + '☆ '.repeat(5 - row.home_stars)}
            </td>
            {#if row.outs === 1}
              <td>{row.outs} out</td>
            {:else}
              <td>{row.outs} outs</td>
            {/if}
            <td>
              {#if Number(row.runner_on_second) === 1}
                <div style="display:flex; justify-content:center; align-items:top;">❷</div>
              {:else}
                <div style="display:flex; justify-content:center; align-items:top;">➁</div>
              {/if}

              {#if Number(row.runner_on_first) === 1 && Number(row.runner_on_third) === 1}
                <span style="display:flex; justify-content:space-around;"><div>❸</div><div>❶</div></span>
              {:else if Number(row.runner_on_first) === 0 && Number(row.runner_on_third) === 1}
                <span style="display:flex; justify-content:space-around;"><div>❸</div><div>➀</div></span>
              {:else if Number(row.runner_on_first) === 1 && Number(row.runner_on_third) === 0}
                <span style="display:flex; justify-content:space-around;"><div>➂</div><div>❶</div></span>
              {:else if Number(row.runner_on_first) === 0 && Number(row.runner_on_third) === 0}
                <span style="display:flex; justify-content:space-around;"><div>➂</div><div>➀</div></span>
              {/if}
            </td>
            <td>{stadiums[row.stadium_id]}</td>
          {/if} 
            </tr>
          {/if}
        {/each}
      </tbody>
    </Datatable>
  </div>
  {:else}
    <p>Loading...</p>
  {/if}
  
<style>
@import "../table.css";
.button-54 {
  font-family: "Open Sans", sans-serif;
  font-size: 16px;
  letter-spacing: 2px;
  text-decoration: none;
  text-transform: uppercase;
  color: #000;
  cursor: pointer;
  border: 3px solid;
  padding: 0.25em 0.5em;
  box-shadow: 1px 1px 0px 0px, 2px 2px 0px 0px, 3px 3px 0px 0px, 4px 4px 0px 0px, 5px 5px 0px 0px;
  position: relative;
  user-select: none;
  -webkit-user-select: none;
  touch-action: manipulation;
}

.button-54:active {
  box-shadow: 0px 0px 0px 0px;
  top: 5px;
  left: 5px;
}

@media (min-width: 768px) {
  .button-54 {
    padding: 0.25em 0.75em;
  }
}

.header {
  display: flex;
  /* flex-direction: column; */
  justify-content: space-between;
  align-items: center;
}


</style>
  