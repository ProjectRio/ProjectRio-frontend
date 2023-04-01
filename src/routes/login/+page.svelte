<script lang="ts">
  // Import components
  import Topbar from "../../components/Topbar.svelte";

  // Instantiate variables
  let email: string = "";
  let password: string = "";
  let username: string = "";

  async function handleSubmit() {
    if (!email 
        || !password
        || !username
    ) {
      alert("Please enter username, email, and password");
      return;
    }

    const data = {
      "Username": username,
      "Email": email,
      "Password": password
    }
    try {
      const response = await fetch(
        'https://api.projectrio.app/login/', 
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

<Topbar></Topbar>
<h1>Log in</h1>
<section class="input-container">
  <p>Username:</p>
  <input 
    placeholder="Username"
    bind:value={username}
  />

  <p>Email: </p>
  <input 
    placeholder="Email" 
    bind:value={email}
  />

  <p>Password:</p>
  <input 
    placeholder="Password" 
    bind:value={password}
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

