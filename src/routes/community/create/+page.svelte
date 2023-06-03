<script lang="ts">
  // Instantiate variables
  let name: string = "";
  let type: string = "";
  let description: string = "";
  let priv: boolean = false;
  let createGlobalLink: boolean = false;

  async function handleSubmit() {
    if (!name || !type || !description || !priv || !createGlobalLink) {
      alert("Please completely fill out the form");
      return;
    }

    const formData = new FormData();
    formData.append("community_name", name);
    formData.append("type", type);
    formData.append("desc", description);
    formData.append("private", priv);
    formData.append("global_link", createGlobalLink);

    try {
      const response = await fetch("/community/create", {
        method: "POST",
        body: formData,
      });

      console.log(response);

      const jsonRes = await response.json();
      const result = jsonRes;

      console.log(result);
    } catch (error) {
      console.log(error);
    }
  }
</script>

<h1>Create Community</h1>
<form>
  <section class="input-container">
    <p>Community Name:</p>
    <input placeholder="Community Name" bind:value={name} />

    <p>Community Type:</p>
    <input placeholder="Community Type" bind:value={type} />

    <p>Description:</p>
    <input placeholder="Description" bind:value={description} type="password" />

    <p>Private:</p>
    <input bind:checked={priv} type="checkbox" />

    <p>Create Global Link:</p>
    <input bind:checked={createGlobalLink} type="checkbox" />

    <p></p>
    <button type="button" on:click={handleSubmit}>Submit</button>
  </section>
</form>

<style>
  h1 {
    text-align: center;
    margin: auto;
  }

  .input-container {
    margin: auto;
    max-width: 200px;
    display: grid;
  }
</style>
