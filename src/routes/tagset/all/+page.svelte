<script lang="ts">
  // Import components
  import Topbar from "../../../components/Topbar.svelte";
  
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
    } catch (error) {
      console.log(error);
    }
  }

</script>

<Topbar></Topbar>
<h1>Tag Sets</h1>

<section>
  <table>
    <tr>
      <th>Community Id</th>
      <th>Tagset ID</th>
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
          <td>{tagset.name}</td>
          <td>{tagset.comm_type}</td>
          <td>{new Date(tagset.start_date * 1000).toLocaleString("US", { weekday:"long", year:"numeric", month:"short", day:"numeric"})}</td>
          <td>{new Date(tagset.end_date * 1000).toLocaleString("US", { weekday:"long", year:"numeric", month:"short", day:"numeric"})}</td>
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

