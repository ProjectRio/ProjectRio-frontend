<script lang="ts">
    import { DataHandler, Datatable, Th, ThFilter } from '@vincjo/datatables';
    import { onMount, afterUpdate} from 'svelte';
    import { tagsets } from '$lib/tagsets';
    import { getAllTagSets } from '../../../components/tagNames';
    import { stadiums } from '../../../components/stadiumName';

    // init variables
    let games: any[] | undefined = [];
    let handler: DataHandler;
    let rows: [];
    let detailed;
    let isVisible: boolean = false;
    let currentTime: Date;


    // Access the tagsets data in your component
let tagsetsData: any[] = []
$: {
  tagsetsData = $tagsets; // Get the current value of the tagsets store
}

onMount(async () => {
  try {

    await fetchData(); // Fetch initial data
    getAllTagSets();
    setInterval(fetchData, 60000); // Schedule auto-update every minute
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
      games = result.games.sort((a: { start_time: number; }, b: { start_time: number; }) => b.start_time - a.start_time);
      handler = new DataHandler(games, { rowsPerPage: 10 });
      rows = handler.getRows();

      currentTime = new Date().toLocaleTimeString();
      console.log(`Table updated at ${currentTime}`)
      games?.forEach(game => {
        game.new_start_time = new Date(game.date_time_start * 1000).toLocaleString();
        game.new_game_mode = tagsetsData.find(tagset => tagset.id === game.game_mode)?.name || '';
        game.new_stadium = stadiums[game.stadium]
        console.log(game.new_game_mode)
      })
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
  <div class="header">
    <a href="/games/live"><button class="button-54">Live Games</button></a>

  <h1>Recent Games</h1>
  <h4>Last Updated at {currentTime}</h4>

  </div>
    {#if handler}
    <Datatable {handler}>
      <thead>
        <!-- sortable table headers TODO figure out a way to automate this across other table implementations -->
        <tr>
          <Th {handler} orderBy="away_user">Away Player</Th>
          <Th {handler} orderBy="away_score">Away Score</Th>
          <Th {handler} orderBy="home_score">Home Score</Th>
          <Th {handler} orderBy="home_user">Home Player</Th>
          <Th {handler} orderBy="new_game_mode">Game Mode</Th>
          <Th {handler} orderBy="new_stadium">Stadium</Th>

          <Th {handler} orderBy="date_time_start">Start Date</Th>
        </tr>
        <!-- table filters-->
        <tr>
          <ThFilter {handler} filterBy="away_user" />
          <ThFilter {handler} filterBy="away_score" />
          <ThFilter {handler} filterBy="home_score" />
          <ThFilter {handler} filterBy="home_user" />
          <ThFilter {handler} filterBy="new_game_mode" />
          <ThFilter {handler} filterBy="new_stadium" />

          <ThFilter {handler} filterBy="date_time_start" />
        </tr>
      </thead>
  
      <tbody>
        {#each $rows as row, index}
          <!-- hide on click to display alternate information instead -->
          <!-- {#if !row.isVisible} -->
            <!-- <tr bind:this={basic} on:click={() => toggleVisibility(index)}> -->
            <tr>

                {#if row.away_score > row.home_score}
                  <td><strong>{row.away_user}</strong></td>

                  <td><strong>{row.away_score}</strong></td>
                  <td>{row.home_score}</td>
                  <td>{row.home_user}</td>
                {:else if row.home_score > row.away_score}
                  <td>{row.away_user}</td>
                    
                  <td>{row.away_score}</td>

                <td><strong>{row.home_score}</strong></td>
                <td><strong>{row.home_user}</strong></td>

                {/if}
                
              <td><a href="/tagset/{row.new_game_mode}/ladder">{row.new_game_mode}</a></td>
              <td>{row.new_stadium}</td>
              <td>{new Date(row.date_time_start * 1000).toLocaleString()}</td>
            </tr>

        {/each}
      </tbody>
    </Datatable>
  {:else}
    <p>Loading...</p>
  {/if}
  
  <style>
@import "../table.css";

/* CSS */
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

a {
  text-decoration: none;
  color: inherit
}
  </style>
    