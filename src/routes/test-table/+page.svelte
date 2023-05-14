<script>
    import DataTable from './DataTable.svelte';
  
    let games = []; // Initialize the games variable
  
    // Fetch the games data
    async function fetchGames() {
      try {
        const response = await fetch('https://api.projectrio.app/populate_db/ongoing_game');
        if (response.ok) {
          const result = await response.json();
          games = result.ongoing_games.sort((a, b) => b.start_time - a.start_time);
        } else {
          console.error('Error fetching data from API:', response.status);
        }
      } catch (error) {
        console.error('Error fetching data from API:', error);
      }
    }
  
    fetchGames(); // Call the fetchGames function to fetch the data
  </script>
  
  <DataTable {games} />
  