<script lang="ts">
    import type { PageData, ActionData } from './$types';
    import { superForm } from 'sveltekit-superforms/client';
    import SuperDebug from 'sveltekit-superforms/client/SuperDebug.svelte';
    import { page } from '$app/stores';
    export let data: PageData;
    const { form: formData, errors, constraints, enhance, message } = superForm(data.form);
    export let form;
  </script>
{#if $message}
    <aside class="alert variant-filled-success mt-6">
        <!-- Message -->
        <div class="alert-message">
            <p>{$message}</p>
        </div>
    </aside>
{/if}

  <!-- <SuperDebug data={$form} /> -->
{#if form}
    <p>{form.sponsor} is the current sponsor of <strong>{$formData.community_name}</strong>.</p>
{/if}
  <div class="flex items-center justify-center h-screen ">
    <div class="p-4 md:p-10 flex bg-gradient-to-br variant-gradient-primary-secondary w-[80%] h-[80%] rounded-container-token shadow-2xl space-y-10">
  <form method="POST" class="flex card flex-col justify-center items-center mx-auto transition-[width] duration-200 w-[80%] h-full shadow-2xl" use:enhance>
    <div class="card flex flex-col p-4 m-2 text-token space-y-4 shadow-2xl w-[80%] h-[20%]">

    <label for="community_name">community name</label>
    <input
    class="text-primary-200-700-token"
    type="text"
    name="community_name"

    aria-invalid={$errors.community_name ? 'true' : undefined}
    bind:value={$formData.community_name}
    {...$constraints.community_name} />
    {#if $errors.community_name}<span class="invalid">{$errors.community_name}</span>{/if}
</div>
<div class="card flex flex-col p-4 m-2 text-token space-y-4 shadow-2xl w-[80%] h-[20%]">

    <label for="action">action</label>
    <select
      class="text-primary-200-700-token"
      name="action"
      aria-invalid={$errors.action ? 'true' : undefined}
      bind:value={$formData.action}
      {...$constraints.action}>
      <!-- <option value="">Select action</option> -->
      <option value="get" selected>Get sponsor of {$formData.community_name}</option>
      <option value="remove">Remove sponsorship of {$formData.community_name}</option>
      <option value="add">Sponsor {$formData.community_name}</option>

      <!-- <option value="option3">Option 3</option> -->
    </select>
    {#if $errors.action}<span class="invalid">{$errors.action}</span>{/if}
</div>

<div class="card flex flex-col p-4 m-2 text-token space-y-4 shadow-2xl w-[80%] h-[10%]">
    
<button>Submit</button></div>
  </form>
  </div>
  </div>