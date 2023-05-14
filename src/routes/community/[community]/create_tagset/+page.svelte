<script lang="ts">
  // Import store
  import { page } from '$app/stores';
  
  // Import components
  import Topbar from "../../../../components/Topbar.svelte";

  // Instantiate variables
  let tagName: string = "";
  let type: string = "";
  let description: string = "";
  let communityName: string = "";
  let geckoCodeDesc: string = "";

  // Called on load
  getTags();


  /*
    Used to get a list of available tags on page load
  */
  async function getTags() {
    try {
      const response = await fetch('https://api.projectrio.app/tag/list');
      console.log(response);
      const json = await response.json();
      const result = json.stringify()
      console.log(result);

    } catch (error){
      console.log(error);
    }
  }

  /*
    Used to submit request to create a new tag
  */
  async function handleSubmit() {

  }
</script>

<Topbar></Topbar>
<h1>Create Tag for {$page.params.community}</h1>
<section class="input-container">
  <p>Community Name:</p>
  <input 
    placeholder="Community Name"
    bind:value={communityName}
  />

  <p>Tag Name:</p>
  <input 
    placeholder="Tag Name"
    bind:value={tagName}
  />

  <p>Tag Type: </p>
  <input 
    placeholder="Community Type" 
    bind:value={type}
  />

  {#if type == "gecko"}
    <p>Gecko Code Description: </p>
    <input 
      placeholder="Gecko Code Description" 
      bind:value={geckoCodeDesc}
    />
  {/if}

  <p>Tag Description:</p>
  <input 
    placeholder="Description" 
    bind:value={description}
    type="password"
  />

  <p></p>
  <button on:click={handleSubmit}>Submit</button>
</section>

<style>
  h1{
    text-align: center;
    margin: auto;
  }

  .input-container{
    margin: auto;
    max-width: 200px;
    display: grid;
  }
</style>

