<script>
    export let data = [];
    export let tableClasses;
    export let theadClasses;
    export let theadRowClasses;
    export let thClasses;
    export let tbodyClasses;
    export let tbodyRowClasses;
    export let tdClasses;

    import { titleCase } from "$lib/utils";
</script>


<table class={tableClasses}>
    <thead class={theadClasses}>
    <tr class={theadRowClasses}>
        {#each Object.keys(data[0]) as key}
            <th class={thClasses}>{titleCase(key)}</th>
        {/each}
    </tr>
    </thead>
    <tbody class={tbodyClasses}>
    {#each data as item}
        <tr {tbodyRowClasses}>
            {#each Object.keys(data[0]) as key}
                {#if Object.keys(item).includes(key)}
                    <td class={tdClasses}>{item[key]}</td>
                {:else}
                    <td class={tdClasses}></td>
                {/if}
            {/each}
        </tr>
    {/each}
    </tbody>
</table>
