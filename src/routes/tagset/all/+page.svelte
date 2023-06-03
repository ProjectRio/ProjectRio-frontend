<script lang="ts">
  // Import components
  // Instantiate variables
  let tagsets: any = [];

  // Call on page load
  getAllTagSets();

  async function getAllTagSets() {
    try {
      const response = await fetch("https://api.projectrio.app/tag_set/list", {
        method: "POST"
      });
      const result = await response.json();
      tagsets = result['Tag Sets'];
      console.log(tagsets);
    } catch (error) {
      console.log(error);
    }
  }

</script>

<h1>Game Modes</h1>

<section>
  <table>
    <tr>
      <th>Community Id</th>
      <th>Game Mode ID</th>
      <th>Name</th>
      <th>Type</th>
      <th>Start Date</th>
      <th>End Date</th>
    </tr>
    {#if tagsets.length > 0}
      {#each tagsets as tagset}
        <tr>
          <td>{tagset.comm_id}</td>
          <td>{tagset.id}</td>
          <a class="link-text" href="{tagset.name}/ladder">
            <td class="link-cell">{tagset.name}</td>
          </a>
          <td>{tagset.comm_type}</td>
          <td>{new Date(tagset.start_date * 1000).toLocaleString("US", {year:"numeric", month:"numeric", day:"numeric"})}</td>
          <td>{new Date(tagset.end_date * 1000).toLocaleString("US", {year:"numeric", month:"numeric", day:"numeric"})}</td>
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

  a {
    text-decoration: none;
    color: inherit
  }

  /* .link-cell:hover {
    background-color:powderblue;
  } */

</style>

