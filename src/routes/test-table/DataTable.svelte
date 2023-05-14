<script lang="ts">
    import { DataHandler } from '@vincjo/datatables';
    import { onMount } from 'svelte';
    import TableHeader from './TableHeader.svelte';
    import TableRow from './TableRow.svelte';
    import { toggleVisibility } from './utils';
  
    export let games = [];
  
    let handler;
    let rows;
  
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
  </script>
  
  {#if handler}
    <table>
      <TableHeader />
  
      <tbody>
        {#each $rows as row, index}
          {#if !row.isVisible}
            <TableRow {row} {index} on:toggleVisibility={() => toggleVisibility(games, index)} />
          {/if}
        {/each}
      </tbody>
    </table>
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
  </style>