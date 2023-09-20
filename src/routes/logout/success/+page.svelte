<script lang="ts">
    import type { PageData } from './$types'
    import {invalidateAll} from "$app/navigation";
    import {onMount} from "svelte";
    export let data: PageData

    onMount(() => {
        if (typeof localStorage !== 'undefined') {
            localStorage.removeItem('username')
        }
        // const interval = setInterval(() => {
        //     invalidateAll('/logout'
        // , 1000)
        // }
        const interval = setInterval(() => {
            invalidateAll();
        }, 1000);

        return () => {
            clearInterval(interval)
        }
    })
    // if (data) {



</script>
{#if data}
    <p>You have been successfully logged out.</p>
    {/if}