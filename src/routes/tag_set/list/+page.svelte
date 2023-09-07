<script lang="ts">
	import { BACKEND, UNCATEGORIZED_ENDPOINTS } from "$lib/constants";
    import { onMount } from "svelte";
    import {titleCase} from "$lib/utils";
    import { Accordion, AccordionItem } from "@skeletonlabs/skeleton";

    let tagset;
    onMount(async () => {
        const response = await fetch(BACKEND + UNCATEGORIZED_ENDPOINTS.TAGSET_LIST, {
            method: "POST",
        })
        const res = await response.json();
        console.log(res)
        tagset = res["Tag Sets"]
    })
</script>


{#if tagset}
    <div class="table-container flex">
        <table class="table">
            <thead>
            <tr>
                <th>Name</th>
                {#each Object.keys(tagset[0]) as key}
                    {#if !(key === "name")}
                        <th>{titleCase(key)}</th>
                    {/if}
                {/each}
            </tr>
            </thead>
            <tbody>
            {#each tagset as item}
                <tr>
                    <td>{item.name}</td>
                    {#each Object.keys(tagset[0]) as key}
                        {#if !(key === "name")}
                            {#if Object.keys(item).includes(key)}
                                {#if (key === "start_date")}
                                    <td>{new Date(item[key] * 1000).toLocaleDateString()}</td>
                                {:else if (key === "end_date")}
                                    <td>{new Date(item[key] * 1000).toLocaleDateString()}</td>
                                {:else if (key === "tags")}
                                    <td>
                                        <Accordion>
                                            <AccordionItem>
                                                <svelte:fragment slot="summary">Click to View Tags</svelte:fragment>
                                                <svelte:fragment slot="content">
                                                    <div style="white-space: pre-wrap; max-width: none;">
                                                        <ul class="list">
                                                        {#each item[key] as i}
                                                            <li>{i.name}</li>
                                                        {/each}
                                                        </ul>
                                                    </div>

                                                </svelte:fragment>

                                            </AccordionItem>
                                        </Accordion>
                                    </td>
                                {:else}
                                <td>{item[key]}</td>
                                {/if}

                            {:else}
                                <td></td>
                            {/if}
                        {/if}
                    {/each}
                </tr>
            {/each}
            </tbody>
        </table>

        <!--        <Table data={tags.Tags} tableClasses={tableClass} />-->
    </div>
{/if}
