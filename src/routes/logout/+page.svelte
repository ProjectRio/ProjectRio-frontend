<script lang="ts">
    import type { PageData } from './$types'
    export let data: PageData
    // if (data) {
        if (typeof localStorage !== 'undefined') {
            localStorage.removeItem('username')
        // }
    }

</script>
{#if data}
    <p>You have been successfully logged out.</p>
    {/if}