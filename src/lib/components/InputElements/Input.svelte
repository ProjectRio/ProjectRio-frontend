<script lang="ts">
    import type { PageData } from './$types';
    import { superForm } from 'sveltekit-superforms/client';
    import SuperDebug from 'sveltekit-superforms/client/SuperDebug.svelte';
    export let data: PageData;

    export let name: string = "";
    export let type: string = "text";
    export let styleClass: string = "";
    export let checkboxValue;
    // just for reference
    const binds = [
        'value',
        'checked',
        'group',
        'contenteditable',
        'this',
        'clientHeight',
        'clientWidth',
        'offsetHeight',
        'offsetWidth',
    ]

    const audiovideoBinds = [
        'duration',
        'buffered',
        'seekable',
        'played',
        'seeking',
        'ended',
        'currentTime',
        'playbackRate',
        'paused',
        'volume',
        'muted',
        'videoWidth',
        'videoHeight',
    ]
    const inputTypes = [
        'button',
        'checkbox',
        'color',
        'date',
        'datetime-local',
        'email',
        'file',
        'hidden',
        'image',
        'month',
        'password',
        'radio',
        'range',
        'reset',
        'search',
        'submit',
        'tel',
        'text',
        'time',
        'url',
        'week',
    ];
</script>

{#if inputTypes.includes(type)}
    {#each inputTypes as iType, i}
        {#if type === "button"}
        {:else if type === "checkbox"}
            <input type="checkbox" bind:checked={checkboxValue} />
        {:else if type === "text"}
            <input type="text" />

        {/if}
    {/each}
{/if}

