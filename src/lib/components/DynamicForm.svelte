<script lang="ts">
    import type { PageData } from './$types';
    import type { Writable } from 'svelte/store';
    import { superForm } from 'sveltekit-superforms/client';
    import SuperDebug from 'sveltekit-superforms/client/SuperDebug.svelte';
  
    export let data: PageData;
    export let debug: boolean = false;
    // Client API:
    const { form, errors, constraints, enhance } = superForm(data.form);
  </script>


{#if debug}
  <SuperDebug data={$form} />
{/if}