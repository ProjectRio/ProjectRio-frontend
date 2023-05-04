<script lang="ts">
  // Import components
  import Topbar from "../../components/Topbar.svelte";
  import { apiFetch } from "../../fetch/apiFetch";
  

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
      const options: any = {
        method: 'POST',
        headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
        },
        body: data
      };

      const result = await apiFetch('/login/', options, true);

      localStorage.setItem("jwt", result.access_token);

    } catch (error){
      console.log(error);
    }
  }

  async function handleVerifyJWT() {
    try {
      const options: any = {
        method: 'get',
        headers: {}
      };
      
      const result = await apiFetch('/validate_JWT/', options, true);      
    } catch (error) {
      console.log(error);
    }
  }

  async function handleLogout(){
    try {
      const options: any = {
        method: 'get',
        headers: {}
      };
      
      const result = await apiFetch('/logout/', options, true);

      localStorage.removeItem("jwt");

      
    } catch (error) {
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

  <button on:click={handleVerifyJWT}>Verify</button>

  <button on:click={handleLogout}>Logout</button>
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

