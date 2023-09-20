
<script lang="ts">
    import type { PageData } from './$types';
    import type { Writable } from 'svelte/store';
    import { superForm } from 'sveltekit-superforms/client';
    import SuperDebug from 'sveltekit-superforms/client/SuperDebug.svelte';
  
    export let data: PageData;
  
    // Client API:
    const { form, errors, constraints, enhance } = superForm(data.form);
    
  </script>
  
  {#if data}
  <!-- <div>{data.username}</div> -->
  {/if}
  <SuperDebug data={$form} />
  <div class="flex items-center justify-center h-screen ">
    <div class="p-4 md:p-10 flex bg-gradient-to-br variant-gradient-primary-secondary w-[80%] h-[80%] rounded-container-token shadow-2xl space-y-10">
  <form method="POST" class="flex card flex-col justify-center items-center mx-auto transition-[width] duration-200 w-[80%] h-full shadow-2xl" use:enhance>
    <div class="card flex flex-col p-4 m-2 text-token space-y-4 shadow-2xl w-[80%] h-[20%]">

    <label for="community_name">community name</label>
    <input
    class="text-primary-50-900-token"
    type="text"
    name="community_name"

    aria-invalid={$errors.community_name ? 'true' : undefined}
    bind:value={$form.community_name}
    {...$constraints.community_name} />
    {#if $errors.community_name}<span class="invalid">{$errors.community_name}</span>{/if}
</div>
<div class="card flex flex-col p-4 m-2 text-token space-y-4 shadow-2xl w-[80%] h-[20%]">

    <label for="type">type</label>
    <select
      class="text-primary-50-900-token"
      name="type"
      aria-invalid={$errors.type ? 'true' : undefined}
      bind:value={$form.type}
      {...$constraints.type}>
      <!-- <option value="">Select type</option> -->
      <option value="Unofficial" selected>Unofficial</option>
      <option value="Official">Official</option>
      <!-- <option value="option3">Option 3</option> -->
    </select>
    {#if $errors.type}<span class="invalid">{$errors.type}</span>{/if}
</div>
    <div class="card flex flex-col p-4 m-2 text-token space-y-4 shadow-2xl w-[80%] h-[15%]">
    <label for="private">private</label>
    <input
      type="checkbox"
      name="private"
      aria-invalid={$errors.private ? 'true' : undefined}
      bind:checked={$form.private}
      {...$constraints.private} />
    {#if $errors.private}<span class="invalid">{$errors.private}</span>{/if}
  </div>
  <div class="card flex flex-col p-4 m-2 text-token space-y-4 shadow-2xl w-[80%] h-[15%]">

    <label for="global_link">global link</label>
    <input
      type="checkbox"
      name="global_link"
      aria-invalid={$errors.global_link ? 'true' : undefined}
      bind:checked={$form.global_link}
      {...$constraints.global_link} />
    {#if $errors.global_link}<span class="invalid">{$errors.global_link}</span>{/if}
</div>
<div class="card flex flex-col p-4 m-2 text-token space-y-4 shadow-2xl w-[80%] h-[20%]">

    <label for="desc">description</label>
    <textarea
    class="text-primary-50-900-token"
        name="desc"
        aria-invalid={$errors.desc ? 'true' : undefined}
        bind:value={$form.desc}
        {...$constraints.desc}></textarea>
    {#if $errors.desc}<span class="invalid">{$errors.desc}</span>{/if}
</div>
<div class="card flex flex-col p-4 m-2 text-token space-y-4 shadow-2xl w-[80%] h-[10%]">
    
<button>Submit</button></div>
  </form>
  </div>
  </div>
