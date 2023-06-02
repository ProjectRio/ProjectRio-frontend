<script lang="ts">
  // Import store
  import { page } from '$app/stores';
  // Import components

  // Import apiFetch function
  import { apiFetch } from "../../../../fetch/apiFetch";
  
  // Instantiate variables
  let players: any = [];

  // Call on page load
  getTagSetLadder();

  async function getTagSetLadder() {
    try {
      const response = await fetch("https://api.projectrio.app/tag_set/ladder/", {
        method: "POST",
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          "TagSet": $page.params.tagset
        })
      });
      const result = await response.json();
      console.log(result);
      players = Object.values(result).sort((a: any, b: any) => b.rating - a.rating);
    } catch (error) {
      console.log(error);
    }
  }

</script>
<button class="game-mode"><a href="/games/recent">Go to Game Modes List</a></button>
<button class="recent-game"><a href="/tagset/all">Go to Recent Games List</a></button>

<h1>{$page.params.tagset}</h1>

<section>
  <table>
    <tr>
      <th>#</th>
      <th>Glicko Rating</th>
      <th>Username</th>
      <th>W/L/T</th>
    </tr>
    {#if players}
      {#each players as player, i}
        <tr>
          <td>{i + 1}</td>
          <td>{player.rating}</td>
          <td>{player.username}</td>
          <td>{player.num_wins}/{player.num_losses}/{player.num_ties}</td>
        </tr>
      {/each}
    {/if}
    <tr></tr>
  </table>
</section>


<style>
  @import "../../../games/table.css";

  h1{
    text-align: center;
    margin: auto;
  }

  table {
    margin: auto;
    width: 40vw;
    text-align: center;
  }

  a {
    text-decoration: none;
    color: inherit
  }

  .game-mode {
    width: 20%;
    /* align-self: left; */
    justify-content: center;
    position: sticky;
    top: 50%;
    left: 10%;
  }

  .recent-game {
    width: 20%;
    /* align-self: left; */
    justify-content: center;
    position: sticky;
    top: 40%;
    left: 10%;
  }
  

</style>

