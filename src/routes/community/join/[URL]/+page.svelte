<script lang="ts">
    import type { ActionData, PageData } from './$types';
    import type { Writable } from 'svelte/store';
    import { superForm } from 'sveltekit-superforms/client';
    import SuperDebug from 'sveltekit-superforms/client/SuperDebug.svelte';
    import {onMount} from "svelte";
    export let form;
    export let data: PageData;
    // export let actionDat: ActionData
    // Client API:
    const { form:formData, errors, constraints, enhance } = superForm(data.form);

    onMount(() => {
        $formData.URL = data.params.URL;
    })

</script>

{#if form?.success}
    <p>You have been added to the community.</p>
{:else if form}
    <p>There was an error adding you to the community.</p>
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

                <label for="URL">Global link URL (optional)</label>
                <input
                        class="text-primary-50-900-token"
                        type="text"
                        name="URL"

                        aria-invalid={$errors.URL ? 'true' : undefined}
                        bind:value={$formData.URL}
                        {...$constraints.URL} />
                {#if $errors.URL}<span class="invalid">{$errors.URL}</span>{/if}
            </div>
            <div class="card flex flex-col p-4 m-2 text-token space-y-4 shadow-2xl w-[80%] h-[10%]">

                <button>Join</button></div>
        </form>
    </div>
</div>
{/if}