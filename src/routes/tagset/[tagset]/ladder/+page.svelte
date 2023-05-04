<script lang="ts">
  // Import store
  import { page } from '$app/stores';

  // Import components
  import Topbar from "../../../../components/Topbar.svelte";

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
      players = Object.values(result).sort((a: any, b: any) => b.rating - a.rating);
    } catch (error) {
      console.log(error);
    }
  }

</script>

<Topbar></Topbar>
<h1>{$page.params.tagset}</h1>

<section>
  <table>
    <tr>
      <th>#</th>
      <th>Glicko Rating</th>
      <th>Username</th>
    </tr>
    {#if players}
      {#each players as player, i}
        <tr>
          <td>{i + 1}</td>
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

