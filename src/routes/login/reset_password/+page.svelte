<script lang="ts">

    // Import components
    // import Topbar from "../../../components/Topbar.svelte";
    import { apiFetch } from "../../../fetch/apiFetch";

    let username_or_email = "";
  
    async function handleSubmit() {
      if (!username_or_email
      ) {
        alert("Please enter username or email");
        return;
      }
  
      const data = {
        "username_or_email": username_or_email,
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
  
        await apiFetch('/request_password_change/', options, true);
        window.location.href = "/login/reset_password/confirmation";

      } catch (error){
        console.log(error);
      }

    }
  </script>
  
  <!-- <Topbar></Topbar> -->
  <h1>Request Password Reset</h1>
  <section class="input-container">
    <p>Username or Email:</p>
    <input 
      placeholder="Username or Email"
      bind:value={username_or_email}
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
  
  