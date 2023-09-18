<script lang="ts">
    import type { PageData, ActionData } from './$types'
    import { superForm } from 'sveltekit-superforms/client';
    import SuperDebug from 'sveltekit-superforms/client/SuperDebug.svelte';

    export let data: PageData;
    // Client API:
    const { form: formData, errors, constraints, enhance } = superForm(data.form);
    export let form
  </script>

{#if form?.success}
  <div>Reset link sent. Check your email for the link.</div>
  <!-- <h2 class="h2">Header</h2> -->
{:else}
    <SuperDebug data={$formData} />

    <h1 class="h1 flex items-center justify-center">Password Reset</h1>
  <div class="flex items-center justify-center h-screen ">
    <div class="p-4 md:p-10 flex bg-gradient-to-br variant-gradient-primary-secondary w-[60%] h-[70%] rounded-container-token shadow-2xl space-y-10">
      <form class="flex card flex-col justify-center items-center mx-auto transition-[width] duration-200 w-[90%] h-full shadow-2xl" method="POST" use:enhance>
        <div class="card flex flex-col p-4 m-2 text-token space-y-4 shadow-2xl w-[70%] h-[20%]">
<!--          need to add functionality to accept username, for now just email-->
          <label class="label" for="username_or_email">Enter email to reset password.</label>
          <input
                  class="input "
                  type="email"
                  name="username_or_email"
                  aria-invalid={$errors.username_or_email ? 'true' : undefined}
                  bind:value={$formData.username_or_email}
                  {...$constraints.username_or_email} />
          {#if $errors.username_or_email}<span class="invalid">{$errors.username_or_email}</span>{/if}
        </div>

        <div class="flex flex-col p-4 m-2 text-token space-y-4  w-[70%] h-[20%]">
          <button class="flex  btn variant-filled-warning shadow-2xl ">Submit</button>
        </div>
      </form>
    </div>
  </div>
  <!-- </div> -->
{/if}