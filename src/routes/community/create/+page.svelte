<script lang="ts">
  // Import components
  // import Topbar from "../../../components/Topbar.svelte";
  // Instantiate variables
  let name: string = "";
  let type: string = "";
  let description: string = "";
  let priv: boolean = false;
  let createGlobalLink: boolean = false;

  // TEMPORARY
  let rioKey: string = "";


  async function handleSubmit() {
    if (!name 
        || !type
        || !description
        || !priv
        || !createGlobalLink
    ) {
      alert("Please completely fill out form");
      return;
    }

    const data = {
      "Community Name": name,
      "Type": type,
      "Description": description,
      "Private": priv,
      "Global Link": createGlobalLink,
      "Rio Key": rioKey
    }
    try {
      const response = await fetch(
        'https://api.projectrio.app/community/create', 
        {
          method: 'POST',
          body: JSON.stringify(data)
        }
      );
      console.log(response);
      const json = await response.json();
      const result = json.stringify()
      console.log(result);

    } catch (error){
      console.log(error);
    }
  }
</script>

<!--<Topbar></Topbar>-->
<h1>Create Community</h1>
<section class="input-container">
  <p>Community Name:</p>
  <input 
    placeholder="Community Name"
    bind:value={name}
  />

  <p>Community Type: </p>
  <input 
    placeholder="Community Type" 
    bind:value={type}
  />

  <p>Description:</p>
  <input 
    placeholder="Description" 
    bind:value={description}
    type="password"
  />

  <p>Private:</p>
  <input 
    bind:value={priv}
    type="checkbox"
  />

  <p>Create Global Link:</p>
  <input 
    bind:value={createGlobalLink}
    type="checkbox"
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

