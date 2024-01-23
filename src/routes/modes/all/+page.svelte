<script lang="ts">
    // Import components
    // Instantiate variables
    import {BACKEND, UNCATEGORIZED_ENDPOINTS,} from "$lib/constants";
    import {onMount} from "svelte";

    let tagsets: any = [];

    let showPassedDates = false;
    let showUnofficial = false;
    // Call on page load
    onMount(getAllTagSets);

    let body = {
        "Active": "y",
    }

    async function getAllTagSets() {
        try {
            const response = await fetch(BACKEND + UNCATEGORIZED_ENDPOINTS.TAGSET_LIST, {
                method: "POST",
            });
            const result = await response.json();
            tagsets = result['Tag Sets'];
            console.log(tagsets);
        } catch (error) {
            console.log(error);
        }
    }

    function hasEndDatePassed(endDate: number) {
        const currentDate = Math.floor(Date.now() / 1000); // Convert to seconds
        return endDate < currentDate;
    }

    function isOfficial(tagSetToCheck) {
        return tagSetToCheck.comm_type == "Official";
    }

</script>
<div>
    <div class="flex justify-between align-middle items-center">
        <h1 class="h1 flex">Game Modes</h1>
        <h2 class="h2 flex">

        </h2>
        <label class="label">
            <input class="checkbox" type="checkbox" bind:checked={showUnofficial}/>
            Show unofficial modes.
        </label>
        <label class="label">
            <input class="checkbox" type="checkbox" bind:checked={showPassedDates}/>
            Show modes that have ended.
        </label>
    </div>
    <section class="table-container">
        <table class="table table-hover">
            <thead>
            <tr>
                <!-- <th>Community Id</th> -->
                <!-- <th>Game Mode ID</th> -->
                <th>Name</th>
                <th>Type</th>
                <th>Start Date</th>
                <th>End Date</th>
            </tr>
            </thead>
            <tbody>
            {#if tagsets.length > 0}
                {#each tagsets as tagset}
                    {#if !showPassedDates && hasEndDatePassed(tagset.end_date)}
                        <!-- Skip rendering if showPassedDates is false and the end date has passed -->
                    {:else if !showUnofficial && !isOfficial(tagset)}
                        <div></div>
                    {:else}
                        <tr>
                            <!-- <td>{tagset.comm_id}</td> -->
                            <!-- <td>{tagset.id}</td> -->
                            <a class="link-text decoration-transparent" href="{tagset.name}">
                                <td class="link-cell">{tagset.name}</td>
                            </a>
                            <td>{tagset.comm_type}</td>
                            <td>{new Date(tagset.start_date * 1000).toLocaleString('US', {
                                year: 'numeric',
                                month: 'numeric',
                                day: 'numeric'
                            })}</td>
                            <td>{new Date(tagset.end_date * 1000).toLocaleString('US', {
                                year: 'numeric',
                                month: 'numeric',
                                day: 'numeric'
                            })}</td>
                        </tr>
                    {/if}
                {/each}
            {:else}
                <tr>
                    <td colspan="6">No game modes available. Please try again later.</td>
                </tr>
            {/if}
            </tbody>
        </table>
    </section>


</div>

<style>
    td a, a {
        color: rgba(var(--text-neutral-500) / 1) !important;
    }
</style>