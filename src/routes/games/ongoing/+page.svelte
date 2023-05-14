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
        // fetch api call
        const response = await fetch('https://api.projectrio.app/populate_db/ongoing_game');
        if (response.ok) {
          const result = await response.json();
          games = result.ongoing_games.sort((a, b) => b.start_time - a.start_time);

          // put api data into DataHandler / rows variables for Datatable module
          handler = new DataHandler(games, { rowsPerPage: 10 });
          rows = handler.getRows();
        } else {
          console.error('Error fetching data from API:', response.status);
        }
      } catch (error) {
        console.error('Error fetching data from API:', error);
      }
    });

    // function to allow rows to be toggleable if clicked on for more details
    function toggleVisibility(index) {
      games[index].isVisible = isVisible;
    }

    afterUpdate(() => {
  if (rows) {
    console.log($rows); // Log the rows when it becomes defined
  }
});
  </script>
  <!-- <button type="button" class="games-toggle"><a href="/games/live"></a></button> -->
  
  {#if handler}
    <Datatable {handler}>
      <thead>
        <!-- sortable table headers TODO figure out a way to automate this across other table implementations -->
        <tr>
          <Th {handler} orderBy="away_player">Away Player</Th>
          <Th {handler} orderBy="home_player">Home Player</Th>
          <Th {handler} orderBy="away_score">Away Score</Th>
          <Th {handler} orderBy="home_score">Home Score</Th>
          <Th {handler} orderBy="tag_set">Game Mode</Th>
          <Th {handler} orderBy="start_time">Start Date</Th>
        </tr>
        <!-- table filters-->
        <tr>
          <ThFilter {handler} filterBy="away_player" />
          <ThFilter {handler} filterBy="home_player" />
          <ThFilter {handler} filterBy="away_score" />
          <ThFilter {handler} filterBy="home_score" />
          <ThFilter {handler} filterBy="tag_set" />
          <ThFilter {handler} filterBy="start_time" />
        </tr>
      </thead>
  
      <tbody>
        {#each $rows as row, index}
          {#if !row.isVisible}
            <tr bind:this={basic} on:click={() => toggleVisibility(index)}>
              <td>{row.away_player}</td>
              <td>{row.home_player}</td>
              <td>{row.away_score}</td>
              <td>{row.home_score}</td>
              <!-- filter by names TODO - have them pull from pregenerated names to automate process -->
              {#if row.tag_set === 10}
                <td>Stars On Season 5</td>
              {:else if row.tag_set === 11}
                <td>Stars Off Season 5</td>
              {:else if row.tag_set === 12}
                <td>Big Balla Season 5</td>
              {:else}
              <td></td>
              {/if}
              <td>{new Date(row.start_time * 1000).toLocaleString()}</td>
            </tr>
          {:else if row.isVisible}
          <tr bind:this={detailed} on:click={() => toggleVisibility(index)}>
            {#each Object.keys(row) as key}
            <td>{key}</td>
            {/each}
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
  