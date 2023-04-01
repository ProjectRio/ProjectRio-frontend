<script lang="ts">
  // Import components
  import Topbar from "../../../components/Topbar.svelte";
  
  // Instantiate variables
  let games: any = [];

  // Call on page load
  getOngoingGames();

  async function getOngoingGames() {
    try {
      const response = await fetch("https://api.projectrio.app//populate_db/ongoing_game/", {
        method: "GET"
      });
      const result = await response.json();
      games = result.ongoing_games.sort((a: any, b: any) => a.start_time - b.start_time)
      console.log(games);
    } catch (error) {
      console.log(error);
    }
  }

</script>

<Topbar></Topbar>
<h1>Ongoing Games</h1>

<section>
  <table>
    <tr>
      <th>Away Player</th>
      <th>Home Player</th>
      <th>Away Score</th>
      <th>Home Score</th>
      <th>Start Date</th>
    </tr>
    {#if games}
      {#each games as game}
        <tr>
          <td>{game.away_player}</td>
          <td>{game.home_player}</td>
          <td>{game.away_score}</td>
          <td>{game.home_score}</td>
          <td>{new Date(game.start_time * 1000).toLocaleString()}</td>
        </tr>
      {/each}
    {/if}
    <tr></tr>
  </table>
</section>


<style>
  h1{
    text-align: center;
    margin: auto;
  }

  table {
    width: 90vw;
    text-align: center;
  }

</style>

