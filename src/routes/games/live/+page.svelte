<script lang="ts">
    import { DataHandler, Datatable, Th, ThFilter } from '@vincjo/datatables';
    import { onMount, afterUpdate} from 'svelte';
    import { alertAction } from "svelte-legos";
    import { stadiums } from './StadiumName';
    import {characters} from './characterName';
    // init variables
    let games = [];
    let handler;
    let rows;
    let selected;
    let isAllSelected;
    let basic;
    let detailed;
    let isVisible: boolean = false;
    let unsubscribe;
    let isLoading = true;

    function onClose() {

    }

    function onOk() {
      
    }
// onMount(async () => {
//   try {
//     await fetchData(); // Fetch initial data
//     setInterval(fetchData, 30000); // Schedule auto-update every 30 seconds
//   } catch (error) {
//     console.error('Error initializing the table:', error);
//   }
// });

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
      games = result.ongoing_games.sort((a, b) => b.start_time - a.start_time);
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
    function toggleVisibility(index) {
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
  <button><a href="/games/recent">Recent Games</a></button>
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
          <ThFilter {handler} filterBy="start_time" />
        </tr>
      </thead>
  
      <tbody>
        {#each $rows as row, index}
          <!-- hide on click to display alternate information instead -->
          {#if !row.isVisible}
            <tr bind:this={basic} on:click={() => toggleVisibility(index)}>
              <td>{row.away_player}</td>
              <td>{row.home_player}</td>
              <td>{row.away_score}</td>
              <td>{row.home_score}</td>
              <td>{row.inning}</td>
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
          <tr bind:this={basic} on:click={() => toggleVisibility(index)}>
            <td>{row.away_player}</td>
            <td>{row.home_player}</td>
            <td>{row.away_score}</td>
            <td>{row.home_score}</td>
            <td>{row.inning}</td>
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
          <tr bind:this={detailed} on:click={() => toggleVisibility(index)}>
            <!-- {#each Object.keys(row) as key}
              {#if key === "away_captain"}
                <td>Away Captain</td>
              {/if}
              {#if key === "home_captain"}
              <td>Home Captain</td>
              {/if}
              {#if key === "away_stars"}
              <td>Away Stars</td>
              {/if}
              {#if key === "home_stars"}
              <td>Home Stars</td>
              {/if}
              {#if key === "pitcher"}
              <td>Pitcher</td>
              {/if}     
              {#if key === "batter"}
              <td>Batter</td>
              {/if}                  
              {#if key === "stadium"}
              <td>Stadium</td>
              {/if}        
            {/each} -->
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
          </tr>
          <tr bind:this={detailed} on:click={() => toggleVisibility(index)}>
            <td style="font-weight:bolder">{'*   '.repeat(row.away_stars)}</td>
            <td style="font-weight:bolder">{'*   '.repeat(row.home_stars)}</td>
            {#if row.half_inning === 0}
            <td>{characters[row.batter]}</td>
            <td>{characters[row.pitcher]}</td>
            <td>{row.outs} outs</td>
            <td><div>First: {Number(row.runner_on_first)}<div>Second: {Number(row.runner_on_second)}<div>Third: {Number(row.runner_on_third)}</div></div></div></td>
            <td>{stadiums[row.stadium_id]}</td>
          {:else if row.half_inning === 1}
            <td>{characters[row.pitcher]}</td>
            <td>{characters[row.batter]}</td>
            <td>{row.outs} outs</td>
            <td><div>First: {Number(row.runner_on_first)}<div>Second: {Number(row.runner_on_second)}<div>Third: {Number(row.runner_on_third)}</div></div></div></td>
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
  text-align: left; 
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
		padding-left: 50%; 
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
	
	/*
	Label the data
	*/
	td:nth-of-type(1):before { content: "Away Player"; }
	td:nth-of-type(2):before { content: "Home Player"; }
	td:nth-of-type(3):before { content: "Away Score"; }
	td:nth-of-type(4):before { content: "Home Score"; }
	td:nth-of-type(5):before { content: "Game Mode"; }
	td:nth-of-type(6):before { content: "Start Date"; }
	td:nth-of-type(7):before { content: "Date of Birth"; }
	td:nth-of-type(8):before { content: "Dream Vacation City"; }
	td:nth-of-type(9):before { content: "GPA"; }
	td:nth-of-type(10):before { content: "Arbitrary Data"; }
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
  /* thead {
    background: #222222;
    color: #f5f5f5;
  }

  tr {
    color: #f5f5f5
  }

  th {
    color: #f5f5f5
  }

  tbody td {
    border: 2px solid #222222;
    padding: 4px 20px;
    color: #222222;
    background: #e5e5e5
  }

  tbody tr {
    transition: all 0.2s;
  }

  tbody tr:hover {
    background: #f5f5f5;
  }


  /* CSS */
  /* .button-27 {
    appearance: none;
    background-color: #000000;
    border: 2px solid #1A1A1A;
    border-radius: 15px;
    box-sizing: border-box;
    color: #FFFFFF;
    cursor: pointer;
    display: inline-block;
    font-family: Roobert,-apple-system,BlinkMacSystemFont,"Segoe UI",Helvetica,Arial,sans-serif,"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol";
    font-size: 16px;
    font-weight: 600;
    line-height: normal;
    margin: 0;
    min-height: 60px;
    min-width: 0;
    outline: none;
    padding: 16px 24px;
    text-align: center;
    text-decoration: none;
    transition: all 300ms cubic-bezier(.23, 1, 0.32, 1);
    user-select: none;
    -webkit-user-select: none;
    touch-action: manipulation;
    width: 50%;
    will-change: transform;
  }

  .button-27:disabled {
    pointer-events: none;
  }

  .button-27:hover {
    box-shadow: rgba(0, 0, 0, 0.25) 0 8px 15px;
    transform: translateY(-2px);
  }

  .button-27:active {
    box-shadow: none;
    transform: translateY(0);
  } */ 
</style>
  