<script lang="ts">
    import type { PageData, ActionData } from './$types'
    import { superForm } from 'sveltekit-superforms/client';
    import SuperDebug from 'sveltekit-superforms/client/SuperDebug.svelte';
    import {onMount} from "svelte";
    export let data: PageData;
    // Client API:
    const { form: formData, errors, constraints, enhance } = superForm(data.form);
    export let form

    onMount(() => {
        $formData.active_url = data.params.active_url;
    })

</script>


{#if form?.success}
    <div>Your password has been successfully changed.</div>
    <!-- <h2 class="h2">Header</h2> -->
{:else}
<!--     <SuperDebug data={$formData} />-->

    <div class="flex items-center justify-center h-screen ">
        <div class="p-4 md:p-10 flex bg-gradient-to-br variant-gradient-primary-secondary w-[60%] h-[70%] rounded-container-token shadow-2xl space-y-10">
            <form class="flex card flex-col justify-center items-center mx-auto transition-[width] duration-200 w-[90%] h-full shadow-2xl" method="POST" use:enhance>
<!--                <div class="card flex flex-col p-4 m-2 text-token space-y-4 shadow-2xl w-[70%] h-[20%]" hidden>-->
                    <label hidden class="label" for="active_url"></label>
                    <input
                            hidden
                            class="input"
                            type="text"
                            name="active_url"
                            aria-invalid={$errors.active_url ? 'true' : undefined}
                            bind:value={$formData.active_url}
                            {...$constraints.active_url} />
                    {#if $errors.active_url}<span class="invalid">{$errors.active_url}</span>{/if}
<!--                </div>-->
                <div class="card flex flex-col p-4 m-2 text-token space-y-4 shadow-2xl w-[70%] h-[20%]">
                    <label class="label" for="password">Enter your new password here.</label>
                    <input
                            class="input password"
                            type="password"
                            name="password"
                            aria-invalid={$errors.password ? 'true' : undefined}
                            bind:value={$formData.password}
                            {...$constraints.password} />
                    {#if $errors.password}<span class="invalid">{$errors.password}</span>{/if}
                </div>

                <div class="card flex flex-col p-4 m-2 text-token space-y-4 shadow-2xl w-[70%] h-[20%]">
                    <label class="label" for="confirm">Confirm Password</label>
                    <input
                            class="input"
                            type="password"
                            name="confirm"
                            aria-invalid={$errors.confirm ? 'true' : undefined}
                            bind:value={$formData.confirm}
                            {...$constraints.confirm} />

                    {#if $errors.confirm}<span class="invalid">{$errors.confirm}</span>{/if}
                </div>

                <ul class="flex flex-col p-4 m-2 text-token space-y-4  w-[70%] h-[20%]">
                    <!--        <ul class="list-nav">-->
                    {#if $formData.password === $formData.confirm}
                        <li> <button class="flex btn variant-filled-warning shadow-2xl ">Reset Password</button></li>
                    {:else if $formData.password && $formData.confirm}
                        <div>Your passwords do not match.</div>
                        <li> <button disabled class="flex btn variant-filled-warning shadow-2xl ">Reset Password</button></li>
                    {:else}
                        <li> <button disabled class="flex btn variant-filled-warning shadow-2xl ">Reset Password</button></li>
                    {/if}
                    <!--        </ul>-->
                </ul>
            </form>

        </div>
    </div>
    <!-- </div> -->
{/if}