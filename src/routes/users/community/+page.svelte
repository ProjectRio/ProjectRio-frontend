<script lang="ts">
    import { GET, USER_ENDPOINTS } from "$lib/constants";
    import { Accordion, AccordionItem } from "@skeletonlabs/skeleton";
    import {titleCase} from "$lib/utils";
    let data;
    let user = '';
    import {username} from "$lib/stores/user";
    async function handleClick() {
        const response = await GET(USER_ENDPOINTS.USER_COMMUNITY, `?username=${$username}`)
        const res = await response;
        console.log(res)
        data = res.communities;
    }

    console.log($username)
    async function handleDataReset() {
        data = undefined;
        user = '';
    }
    // $: data;
</script>
{#if $username}
    <div>{$username}</div>
{/if}
{#if !(data)}

    <h3 class="h3 flex flex-auto justify-center align-middle text-center">Enter username to view user communities.</h3>
    <div class="input-group flex m-2 justify-center align-middle w-[25%]">
        <span class="p-2 justify-center align-middle">
            <input class="input justify-center align-middle" type="text" placeholder="Enter username." bind:value={user} />
        </span>
        <span class="p-2 justify-center align-middle">
            <button class="btn variant-filled-success justify-center align-middle" on:click={handleClick}><span class="label">Submit</span></button>
       </span>
    </div>
{/if}

{#if data}
    <div class="table-container flex flex-col">
        <div class="flex flex-auto">
            <h1 class="h1 flex-auto flex">{user} Communities</h1>
            <button class="btn variant-filled-success justify-center" on:click={handleDataReset}>Click to enter a different username.</button>
        </div>
        <table class="table flex-auto">
            <thead>
            <tr>
                <th>Name</th>
                {#each Object.keys(data[0]) as key}
                    {#if !(key === "name")}
                        <th>{titleCase(key)}</th>
                    {/if}
                {/each}
            </tr>
            </thead>
            <tbody>
            {#each data as item}
                <tr>
                    <td>{item.name}</td>
                    {#each Object.keys(data[0]) as key}
                        {#if !(key === "name")}
                            {#if Object.keys(item).includes(key)}
                                {#if (key === "date_created")}
                                    <td>{new Date(item[key] * 1000).toLocaleDateString()}</td>
                                {:else if (key === "desc")}
                                    <td>
                                        <Accordion>
                                            <AccordionItem>
                                                <svelte:fragment slot="summary">View Description</svelte:fragment>
                                                <svelte:fragment slot="content">
                                                    <div class="card" style="white-space: pre-wrap; max-width: none;">{item[key]}</div>

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
    </div>
{/if}