<script>
    import Table from "../games/live/Table.svelte";
    import { DataHandler } from '@vincjo/datatables';
  
    let games = [];
    let handler;
    let rows;
    let isLoading = true;
  
    async function fetchData() {
      try {
        const response = await fetch('https://api.projectrio.app/games/?tag=starsoffseason5');
        if (response.ok) {
          const result = await response.json();
          games = result.games.sort((a, b) => b.start_time - a.start_time);

  
          handler = new DataHandler(games, { rowsPerPage: 10 });
          rows = handler.getRows();
  
          const currentTime = new Date().toLocaleTimeString();
          console.log(`Table updated at ${currentTime}`);
          console.log(rows);
          console.log(games)
          isLoading = false; // Update loading status after fetch
        } else {
          console.error('Error fetching data from API:', response.status);
        }
      } catch (error) {
        console.error('Error fetching data from API:', error);
      }
    }
  
    function handleDataChange(newData) {
      data = newData;
    }
  
    fetchData();
  </script>
  
  <main>
    <!-- Pass games as the "data" prop to the Table component -->
    {#if !isLoading}
      <Table data={games} on:dataChange={handleDataChange} />
    {:else}
      <p>Loading...</p>
    {/if}
  </main>
  