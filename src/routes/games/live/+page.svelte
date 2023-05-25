<script lang="ts">
    import type { Readable } from 'svelte/store';
    import { DataHandler, Datatable, Th, ThFilter } from '@vincjo/datatables';
    import { onMount, afterUpdate, onDestroy} from 'svelte';
    import { alertAction } from "svelte-legos";
    import { stadiums } from '../../../components/stadiumName';
    import {characters} from '../../../components/characterName';
    import Bases from '../../../components/Bases.svelte';

   // init variables
    let games: any[] | undefined = [];
    let handler: DataHandler;
    let rows: any[];
    let selected;
    let isAllSelected;
    let basic;
    let detailed;
    let isVisible: boolean = false;
    let unsubscribe;
    let isLoading = true;
    let firstBase: Number;
    let secondBase: Number;
    let thirdBase: Number; 

    


onMount(() => {
  fetchData(); // Fetch initial data
  setInterval(fetchData, 30000); // Schedule auto-update every 30 seconds
});

// Function to fetch data from the API
async function fetchData() {
  try {
    const response = await fetch('https://api.projectrio.app/populate_db/ongoing_game');
    if (response.ok) {
      const result = await response.json();
      games = result.ongoing_games.sort((a: { start_time: number; }, b: { start_time: number; }) => b.start_time - a.start_time);
      handler = new DataHandler(games, { rowsPerPage: 10 });
      rows = handler.getRows();

      const currentTime = new Date().toLocaleTimeString();
      console.log(`Table updated at ${currentTime}`)
      isLoading = false; // Update loading status after fetch

    } else {
      console.error('Error fetching data from API:', response.status);
    }
  } catch (error) {
    console.error('Error fetching data from API:', error);
  }
}

afterUpdate(() => {
  if (rows) {
    console.log(rows); // Log the rows when it becomes defined
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
</script> 


  <!-- <button type="button" class="games-toggle"><a href="/games/live"></a></button> -->
  {#if isLoading === false}
  <span><h1>Live Games</h1>

  <h4>Last Updated at {new Date().toLocaleTimeString()}</h4></span>
  {/if}
 <a href="/games/recent"><button>Recent Games</button></a>
  {#if handler}
  <div class="container">
    <Datatable {handler}>
      <thead>
        <!-- sortable table headers TODO figure out a way to automate this across other table implementations -->
        <tr>
          <Th {handler} orderBy="away_player">Away Player</Th>
          <Th {handler} orderBy="home_player">Home Player</Th>
          <Th {handler} orderBy="away_score">Away Score</Th>
          <Th {handler} orderBy="home_score">Home Score</Th>
          <Th {handler} orderBy="inning">Inning</Th>
          <Th {handler} orderBy="tag_set">Game Mode</Th>
          <Th {handler} orderBy="start_time">Start Date</Th>
        </tr>
        <!-- table filters-->
        <tr>
          <ThFilter {handler} filterBy="away_player" />
          <ThFilter {handler} filterBy="home_player" />
          <ThFilter {handler} filterBy="away_score" />
          <ThFilter {handler} filterBy="home_score" />
          <ThFilter {handler} filterBy="inning" />
          <ThFilter {handler} filterBy="tag_set" />
          <!-- <ThFilter {handler} filterBy="start_time" /> -->
        </tr>
      </thead>
  
      <tbody>
        {#each $rows as row, index}
          <!-- hide on click to display alternate information instead -->
          {#if !row.isVisible}
            <tr class="hover-row" bind:this={basic} on:click={() => toggleVisibility(index)}>
              <td>{row.away_player}</td>
              <td>{row.home_player}</td>
              <td>{row.away_score}</td>
              <td>{row.home_score}</td>
              {#if row.half_inning === 0}
                <td>&#11014;{row.inning}</td>
              {/if}
              {#if row.half_inning === 1}
                <td>⬇{row.inning}</td>
              {/if}
              <!-- filter by names TODO - have them pull from pregenerated names to automate process -->
              {#if row.tag_set === 10}
                <td>Stars On Season 5</td>
              {:else if row.tag_set === 11}
                <td>Stars Off Season 5</td>
              {:else if row.tag_set === 12}
                <td>Big Balla Season 5</td>
              {:else if row.tag_set === 15}
                <td>Legacy Mode: Stars Off</td>
              {:else}
                <td>{row.tag_set}</td>
              {/if}
              <td>{new Date(row.start_time * 1000).toLocaleString()}</td>
            </tr>

          <!-- display on click -->
          {:else if row.isVisible}
          <tr class="hover-row" bind:this={basic} on:click={() => toggleVisibility(index)}>
            <td>{row.away_player}</td>
            <td>{row.home_player}</td>
            <td>{row.away_score}</td>
            <td>{row.home_score}</td>
            {#if row.half_inning === 0}
              <td>&#11014;{row.inning}</td>
            {/if}
            {#if row.half_inning === 1}
              <td>⬇{row.inning}</td>
            {/if}
            <!-- filter by names TODO - have them pull from pregenerated names to automate process -->
            {#if row.tag_set === 10}
              <td>Stars On Season 5</td>
            {:else if row.tag_set === 11}
              <td>Stars Off Season 5</td>
            {:else if row.tag_set === 12}
              <td>Big Balla Season 5</td>
            {:else if row.tag_set === 15}
              <td>Legacy Mode: Stars Off</td>
            {:else}
              <td>{row.tag_set}</td>
            {/if}
            <td>{new Date(row.start_time * 1000).toLocaleString()}</td>
          </tr>
          <!-- <tr class="mobile-hide" bind:this={detailed} on:click={() => toggleVisibility(index)}>

            <td>Stars</td>
            <td>Stars</td>
            {#if row.half_inning === 0}
              <td>Batting</td>
              <td>Pitching</td>
              <td>Top</td>
              <td>Runners On</td>
              <td>Stadium</td>
            {:else if row.half_inning === 1}
              <td>Pitching</td>
              <td>Batting</td>
              <td>Bottom</td>
              <td>Runners On</td>
              <td>Stadium</td>
            {/if} 
          </tr> -->
          <tr  bind:this={detailed} on:click={() => toggleVisibility(index)}>
            <td style="font-weight:bolder">{'☆   '.repeat(row.away_stars)}</td>
            <td style="font-weight:bolder">{'☆   '.repeat(row.home_stars)}</td>
            {#if row.half_inning === 0}
            <td>🏓{characters[row.batter]}</td>
            <td>⚾{characters[row.pitcher]}</td>
            <td>{row.outs} outs</td>
            <td><div>Runners on:
              {#if Number(row.runner_on_first) === 1}
              <div>First</div>
              {/if}
              {#if Number(row.runner_on_second) === 1}
              <div>Second</div>
              {/if}
              {#if Number(row.runner_on_third) === 1}
              <div>Third</div>
              {/if}
              </div>
              <!-- <div>Second: {Number(row.runner_on_second)}<div>Third: {Number(row.runner_on_third)}</div></div></div></td> -->
            <!-- <td><Bases {firstBase} {secondBase} {thirdBase} /></td> -->

            <td>{stadiums[row.stadium_id]}</td>
          {:else if row.half_inning === 1}
            <td>⚾{characters[row[`away_roster_${row.pitcher}_char`]]}</td>
            <td>🏓{characters[row[`home_roster_${row.batter}_char`]]}</td>
            {#if row.outs === 1}
              <td>{row.outs} out</td>
            {:else}
              <td>{row.outs} outs</td>
            {/if}
            <td><div>Runners on:
              {#if Number(row.runner_on_first) === 0 && Number(row.runner_on_second) === 0 && Number(row.runner_on_third) === 0}
                <div>None</div>
              {/if}
              {#if Number(row.runner_on_first) === 1}
              <div>First</div>
              {/if}
              {#if Number(row.runner_on_second) === 1}
              <div>Second</div>
              {/if}
              {#if Number(row.runner_on_third) === 1}
              <div>Third</div>
              {/if}
              </div>
            <!-- <td><div>First: {Number(row.runner_on_first)}<div>Second: {Number(row.runner_on_second)}<div>Third: {Number(row.runner_on_third)}</div></div></div></td> -->
            <!-- <td><Bases {firstBase} {secondBase} {thirdBase} /></td> -->
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

  /* need to break up this page */
  table { 
  width: 100%; 
  border-collapse: collapse; 
}
/* Zebra striping */
tr:nth-of-type(odd) { 
  background: #eee; 
}
th { 
  background: #333; 
  color: white; 
  font-weight: bold; 
}
td, th { 
  padding: 6px; 
  border: 1px solid #ccc; 
  text-align: center; 
}

.hover-row:hover {
  background-color:lightblue;
}

@media 
only screen and (max-width: 760px),
(min-device-width: 768px) and (max-device-width: 1024px)  {

	/* Force table to not be like tables anymore */
	table, thead, tbody, th, td, tr { 
		display: block; 
	}
	
	/* Hide table headers (but not display: none;, for accessibility) */
	thead tr { 
		position: absolute;
		top: -9999px;
		left: -9999px;
	}
	
	tr { border: 1px solid #ccc; }
	
	td { 
		/* Behave  like a "row" */
		border: none;
		border-bottom: 1px solid #eee; 
		position: relative;
		/* padding-left: 50%;	 */
  }
	
	td:before { 
		/* Now like a table header */
		position: absolute;
		/* Top/left values mimic padding */
		top: 6px;
		left: 6px;
		width: 45%; 
		padding-right: 10px; 
		white-space: nowrap;
	}

  .mobile-hide {
  display: none;
}


	/*
	Label the data
	*/
	/* td:nth-of-type(1):before { content: "Away Player"; }
	td:nth-of-type(2):before { content: "Home Player"; }
	td:nth-of-type(3):before { content: "Away Score"; }
	td:nth-of-type(4):before { content: "Home Score"; }
	td:nth-of-type(5):before { content: "Inning"; }
	td:nth-of-type(6):before { content: "Game Mode"; }
	td:nth-of-type(7):before { content: "Start Date"; }
	td:nth-of-type(8):before { content: "Away Stars"; }
	td:nth-of-type(9):before { content: "Home Stars"; }
	td:nth-of-type(10):before { content: "Arbitrary Data"; }
} */

}
button a {
  text-decoration: none;
  color: #333;
  font-weight: bold;
}

button {
  width: 50%;
  justify-content: center;
}


</style>
  