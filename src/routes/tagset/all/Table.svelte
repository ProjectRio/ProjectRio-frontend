<script lang="ts">
    import { onMount } from "svelte";
    
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
