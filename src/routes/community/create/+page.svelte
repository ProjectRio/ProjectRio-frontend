
<script lang="ts">
    import type { PageData } from './$types';
    import type { Writable } from 'svelte/store';
    import { superForm } from 'sveltekit-superforms/client';
    import SuperDebug from 'sveltekit-superforms/client/SuperDebug.svelte';

    export let data: PageData;
    // Client API:
    const { form: formData, errors, constraints, enhance } = superForm(data.form);
    export let form
    
  </script>
{#if form?.success}
    <p>Game Mode created.</p>
    {#each Object.entries(form.form.data) as [k, v]}
        <!--{#each Object.values(k) as key, val}-->
        <p>
            {k}: {v}
        </p>
        <!--{/each}-->
    {/each}
    <button class="variant-ghost-secondary"><a class="btn btn-primary" href="/tag_set/list">Click here to view a current list of game modes.</a></button>
{:else if form?.failed}
    <p>There was an error creating your game mode. Make sure that you are creating it in a community that meets the requirements and let us know if you continue to have problems.</p>
{:else}
      <SuperDebug data={$formData} />
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
    bind:value={$formData.community_name}
    {...$constraints.community_name} />
    {#if $errors.community_name}<span class="invalid">{$errors.community_name}</span>{/if}
</div>
<div class="card flex flex-col p-4 m-2 text-token space-y-4 shadow-2xl w-[80%] h-[20%]">

    <label for="type">type</label>
    <select
      class="text-primary-50-900-token"
      name="type"
      aria-invalid={$errors.type ? 'true' : undefined}
      bind:value={$formData.type}
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
      bind:checked={$formData.private}
      {...$constraints.private} />
    {#if $errors.private}<span class="invalid">{$errors.private}</span>{/if}
  </div>
  <div class="card flex flex-col p-4 m-2 text-token space-y-4 shadow-2xl w-[80%] h-[15%]">

    <label for="global_link">global link</label>
    <input
      type="checkbox"
      name="global_link"
      aria-invalid={$errors.global_link ? 'true' : undefined}
      bind:checked={$formData.global_link}
      {...$constraints.global_link} />
    {#if $errors.global_link}<span class="invalid">{$errors.global_link}</span>{/if}
</div>
<div class="card flex flex-col p-4 m-2 text-token space-y-4 shadow-2xl w-[80%] h-[20%]">

    <label for="desc">description</label>
    <textarea
    class="text-primary-50-900-token"
        name="desc"
        aria-invalid={$errors.desc ? 'true' : undefined}
        bind:value={$formData.desc}
        {...$constraints.desc}></textarea>
    {#if $errors.desc}<span class="invalid">{$errors.desc}</span>{/if}
</div>
<div class="card flex flex-col p-4 m-2 text-token space-y-4 shadow-2xl w-[80%] h-[10%]">
    
<button>Submit</button></div>
  </form>
  </div>
  </div>
      {/if}