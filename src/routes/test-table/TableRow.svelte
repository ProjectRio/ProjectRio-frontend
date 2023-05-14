<script>
  export let row;
  export let index;

  // Emit custom event to toggle visibility
  function toggleVisibility() {
    dispatch('toggleVisibility');
  }
</script>

<tr on:click={toggleVisibility}>
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

<style>
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

   
