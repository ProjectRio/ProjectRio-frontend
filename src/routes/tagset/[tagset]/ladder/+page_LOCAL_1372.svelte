<script lang="ts">
  // Import store
  import { page } from '$app/stores';

  // Import components
  import Header from "../../../../components/Header.svelte";
  
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
      // inverted to display top to bottom
      players = Object.values(result).sort((a: any, b: any) => b.rating - a.rating);
    } catch (error) {
      console.log(error);
    }
  }

</script>

<Header></Header>
<h1>{$page.params.tagset}</h1>

<section>
  <table>
    <tr>
      <th>Glicko Rating</th>
      <th>Username</th>
    </tr>
    {#if players}
      {#each players as player}
        <tr>
          <td>{player.rating}</td>
          <td>{player.username}</td>
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
    margin: auto;
    width: 40vw;
    text-align: center;
  }

</style>

