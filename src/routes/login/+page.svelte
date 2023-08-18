<script lang="ts">
    import type { PageData, ActionData } from './$types'
    import { superForm } from 'sveltekit-superforms/client';
    import SuperDebug from 'sveltekit-superforms/client/SuperDebug.svelte';
    import { ConicGradient } from '@skeletonlabs/skeleton';
    import type { ConicStop } from '@skeletonlabs/skeleton';
    export let data: PageData;
    // Client API:
    const { form: formData, errors, constraints, enhance } = superForm(data.form);
    export let form
    const conicStops: ConicStop[] = [
		{ color: 'transparent', start: 0, end: 25 },
		{ color: 'rgb(var(--color-primary-900))', start: 75, end: 100 }
	];
  import { username } from "$lib/stores/user";

  $: if (form) {
    $username = form.username;
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('username', form.username);
      console.log(localStorage.getItem('username'))
    }
  }
</script>


{#if form}
  <div>Welcome back, {$username}!</div>
  <!-- <SuperDebug data={$form} /> -->
  <!-- <h2 class="h2">Header</h2> -->
{:else}
<div class="flex items-center justify-center h-screen ">
  <div class="p-4 md:p-10 flex bg-gradient-to-br variant-gradient-primary-secondary w-[60%] h-[70%] rounded-container-token shadow-2xl space-y-10">
    <form class="flex card flex-col justify-center items-center mx-auto transition-[width] duration-200 w-[90%] h-full shadow-2xl" method="POST" use:enhance>
      <div class="card flex flex-col p-4 m-2 text-token space-y-4 shadow-2xl w-[70%] h-[20%]">
        <label class="label" for="Email">Email</label>
        <input
            class="input "
            type="email"
            name="Email"
            aria-invalid={$errors.Email ? 'true' : undefined}
            bind:value={$formData.Email}
            {...$constraints.Email} />
            {#if $errors.Email}<span class="invalid">{$errors.Email}</span>{/if}
      </div>

      <div class="card flex flex-col p-4 m-2 text-token space-y-4 shadow-2xl w-[70%] h-[20%]">
        <label class="label" for="Password">Password</label>
        <input
            class="input"
            type="password"
            name="Password"
            aria-invalid={$errors.Password ? 'true' : undefined}
            bind:value={$formData.Password}
            {...$constraints.Password} />

        {#if $errors.Password}<span class="invalid">{$errors.Password}</span>{/if}
      </div>

      <div class="flex flex-col p-4 m-2 text-token space-y-4  w-[70%] h-[20%]">
        <button class="flex  btn variant-filled-warning shadow-2xl ">Submit</button>
      </div>
    </form>
  </div>
</div>
<!-- </div> -->
{/if}