<script lang="ts">
    import {getAllUsers} from "$lib/helpers/allUsers";
    let data: any;
    import {onMount} from "svelte";
    import type { TableSource } from '@skeletonlabs/skeleton';
    onMount(async () => {
        data = await getAllUsers();
    })



</script>
{#if data}
    <table class="table table-compact">
        <thead>
            <tr>Username</tr>
        </thead>
        {#each Object.values(data) as user}
            <tbody>
                <td><a href="/users/{user}">{user}</a></td>
            </tbody>
        {/each}
    </table>
{:else}
    <div class="placeholder" />
{/if}