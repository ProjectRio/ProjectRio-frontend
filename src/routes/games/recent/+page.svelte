<script lang="ts">
    import { DataHandler, Datatable, Th, ThFilter } from '@vincjo/datatables';
    import { onMount, afterUpdate} from 'svelte';
  
    // init variables
    let games = [];
    let handler;
    let rows;
    let selected;
    let isAllSelected;
    let basic;
    let detailed;
    let isVisible: boolean = false;


onMount(async () => {
  try {

    await fetchData(); // Fetch initial data
    setInterval(fetchData, 30000); // Schedule auto-update every 30 seconds
  } catch (error) {
    console.error('Error initializing the table:', error);
  }
});

// Function to fetch data from the API
async function fetchData() {
  try {
    const response = await fetch('https://api.projectrio.app/games');
    if (response.ok) {
      const result = await response.json();
      games = result.games.sort((a, b) => b.start_time - a.start_time);
      handler = new DataHandler(games, { rowsPerPage: 10 });
      rows = handler.getRows();

      const currentTime = new Date().toLocaleTimeString();
      console.log(`Table updated at ${currentTime}`)
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


  </script>
  <!-- <button type="button" class="games-toggle"><a href="/games/live"></a></button> -->
  <h1>Recent Games</h1>
  <button><a href="/games/ongoing">Live</a></button>

  {#if handler}
    <Datatable {handler}>
      <thead>
        <!-- sortable table headers TODO figure out a way to automate this across other table implementations -->
        <tr>
          <Th {handler} orderBy="away_user">Away Player</Th>
          <Th {handler} orderBy="home_user">Home Player</Th>
          <Th {handler} orderBy="away_score">Away Score</Th>
          <Th {handler} orderBy="home_score">Home Score</Th>
          <Th {handler} orderBy="game_mode">Game Mode</Th>
          <Th {handler} orderBy="date_time_start">Start Date</Th>
        </tr>
        <!-- table filters-->
        <tr>
          <ThFilter {handler} filterBy="away_user" />
          <ThFilter {handler} filterBy="home_user" />
          <ThFilter {handler} filterBy="away_score" />
          <ThFilter {handler} filterBy="home_score" />
          <ThFilter {handler} filterBy="game_mode" />
          <ThFilter {handler} filterBy="date_time_start" />
        </tr>
      </thead>
  
      <tbody>
        {#each $rows as row, index}
          <!-- hide on click to display alternate information instead -->
          {#if !row.isVisible}
            <tr bind:this={basic} on:click={() => toggleVisibility(index)}>
              <td>{row.away_user}</td>
              <td>{row.home_user}</td>
              <td>{row.away_score}</td>
              <td>{row.home_score}</td>
              <!-- filter by names TODO - have them pull from pregenerated names to automate process -->
              {#if row.game_mode === 10}
                <td>Stars On Season 5</td>
              {:else if row.game_mode === 11}
                <td>Stars Off Season 5</td>
              {:else if row.game_mode === 12}
                <td>Big Balla Season 5</td>
              {:else}
              <td>{row.game_mode}</td>
              {/if}
              <td>{new Date(row.date_time_start * 1000).toLocaleString()}</td>
            </tr>

          <!-- display on click -->
          {:else if row.isVisible}
          <tr bind:this={detailed} on:click={() => toggleVisibility(index)}>
            {#each Object.keys(row) as key}
            <td>{key}</td>
            {/each}
          </tr>
          <tr bind:this={detailed} on:click={() => toggleVisibility(index)}>

            {#each Object.values(row) as values}
            <td>{values}</td>
            {/each}
            </tr>
          {/if}
        {/each}
      </tbody>
    </Datatable>
  {:else}
    <p>Loading...</p>
  {/if}
  
  <style>
    thead {
      background: #222222;
      color: #f5f5f5;
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

    .ThFilter {
      color: #f5f5f5;
    }
  </style>
  