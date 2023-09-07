<script lang="ts">
	import { GET, UNCATEGORIZED_ENDPOINTS } from "$lib/constants";
    import { onMount } from "svelte";
    import {titleCase} from "$lib/utils";
    import { Accordion, AccordionItem } from "@skeletonlabs/skeleton";

    let tags;
    onMount(async () => {
        const response = await GET(UNCATEGORIZED_ENDPOINTS.TAG_LIST)
        const res = await response;
        console.log(res)
        tags = res.Tags;
    })
</script>


{#if tags}
    <div class="table-container flex">
        <table class="table">
            <thead>
            <tr>
                <th>Name</th>
                {#each Object.keys(tags[0]) as key}
                    {#if !(key === "name")}
                        <th>{titleCase(key)}</th>
                    {/if}
                {/each}
            </tr>
            </thead>
            <tbody>
            {#each tags as item}
                <tr>
                    <td>{item.name}</td>
                    {#each Object.keys(tags[0]) as key}
                        {#if !(key === "name")}
                            {#if Object.keys(item).includes(key)}
                                {#if (key === "date_created")}
                                    <td>{new Date(item[key] * 1000).toLocaleDateString()}</td>
                                {:else if (key === "gecko_code")}
                                    <td>
                                        <Accordion>
                                            <AccordionItem>
                                                <svelte:fragment slot="summary">View Code</svelte:fragment>
                                                <svelte:fragment slot="content">
                                                    <div style="white-space: pre-wrap; max-width: none;">{item[key]}</div>

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
