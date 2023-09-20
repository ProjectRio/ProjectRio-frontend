<script lang="ts">
    import { z } from 'zod';
    import { GenericForm } from '$lib/zodSchema';
    import { superForm } from 'sveltekit-superforms/client';
    import type { PageData } from './$types';
    import { getAllUsers } from "$lib/helpers/allUsers";
    import {onMount} from "svelte";

    let users: string[] = [];
    onMount(async () => {
        users = await getAllUsers();
        console.log(users)
    })

    export let data: PageData;
    import { ListBox, ListBoxItem } from "@skeletonlabs/skeleton";
    const { form: formData, errors, constraints, enhance } = superForm(data.form);

</script>

<div class="flex items-center justify-center h-screen ">
    <div class="p-4 md:p-10 flex bg-gradient-to-br variant-gradient-primary-secondary w-[80%] h-[80%] rounded-container-token shadow-2xl space-y-10">
        <form method="POST" class="flex card flex-col justify-center items-center mx-auto transition-[width] duration-200 w-[80%] h-full shadow-2xl" use:enhance>
            <!-- Existing form inputs -->
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
<!--            <div class="card flex flex-col p-4 m-2 text-token space-y-4 shadow-2xl w-[80%] h-[20%]">-->
<!--                <label for="invite_list">Invite List (separate names with commas)</label>-->
<!--                <input-->
<!--                        class="text-primary-50-900-token"-->
<!--                        type="text"-->
<!--                        name="invite_list"-->
<!--                        aria-invalid={$errors.invite_list ? 'true' : undefined}-->
<!--                        bind:value={$formData.invite_list}-->
<!--                        on:input={() => { $formData.invite_list = $formData.invite_list.split(',').map((name) => name.trim()) }}-->
<!--                />-->
<!--                {#if $errors.invite_list}<span class="invalid">{$errors.invite_list}</span>{/if}-->
<!--            </div>-->
            {#if users}
                <div class="m-6">
                    <div class="invite_list">
                        <label class="label" for="user_list">Invite users.</label>

                        <div class="flex">
                            <ListBox multiple class="flex-auto">
                                <!--                                    Not Selected-->
                                {#each Object.values(users) as user}
                                    {#if !($formData.user_list.includes(user))}

                                        <ListBoxItem bind:group={$formData.user_list} name="medium" value={user}>{user}</ListBoxItem>

                                    {/if}
                                {/each}
                            </ListBox>
                            <ListBox multiple class="flex-auto">
                                <!--                                    Selected-->
                                {#each Object.values(users) as user}
                         {#if $formData.invite_list.includes(user)}
                                        <ListBoxItem bind:group={$formData.user_list} name="medium" value={user}>{user}</ListBoxItem>
                                    {/if}
                                {/each}
                            </ListBox>


                        </div>
                        {#if $errors.user_list}<span class="invalid">{$errors.user_list}</span>{/if}
                    </div>


                </div>
            {/if}
                <div class="card flex flex-col p-4 m-2 text-token space-y-4 shadow-2xl w-[80%] h-[10%]">
                    <button type="submit">Submit</button>
        </form>

    </div>
</div>



