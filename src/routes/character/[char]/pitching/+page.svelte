<script lang="ts">
    import { getAllTagSets } from '$lib/helpers/tagNames';

    import { tagsets } from '$lib/stores/tagsets';
    import { onMount } from 'svelte';
    import { page } from '$app/stores';
	import { getUserPstat } from '$lib/helpers/getUserStats';
    import PitchingStatTableHeader from '$lib/components/PitchingStatTableHeader.svelte';
    import PitchingStatTableRow from '$lib/components/PitchingStatTableRow.svelte';
	import { charPitchingStats, charPitchingStatsByUser } from '$lib/stores/charStats';
	import { getCharPstat } from '$lib/helpers/getCharStats';
	import { getERA } from '$lib/helpers/statCalcs';
    // Access the tagsets data in your component

    let tagsetsData: any[] = []
    $: {
        tagsetsData = $tagsets.sort((a: any, b: any) => b.start_date - a.start_date); // Get the current value of the tagsets store
    }
    let charData: any;
    let charDataByUser: any;
    $: {
        charData = $charPitchingStats?.Pitching;
        charDataByUser = $charPitchingStatsByUser;
    }

    let selectedMode = "Stars Off, Season 7"

    const sortedUsers = (statsByUser: any) => Object.keys(statsByUser)
    ?.filter(u => statsByUser[u]?.Pitching?.outs_pitched > charData?.outs_pitched / 100)
    .sort((a: any, b: any) => parseFloat(getERA(statsByUser[a]?.Pitching)) - parseFloat(getERA(statsByUser[b]?.Pitching)));

    onMount(async () => {
        await getAllTagSets();
        await getCharPstat($page.params.char, selectedMode);
    })
</script>

<select id="modes" class="text-primary-50-900-token" bind:value={selectedMode} on:change={() => getUserPstat($page.params.user, selectedMode)}>
    {#each tagsetsData as mode}
        {#if mode?.type != "Test"}
            <option value={mode?.name} selected={mode.name == "Stars Off, Season 7"}>{mode?.name}</option>
        {/if}
    {/each}
</select>

<h2 style="display:flex;justify-content:center;align-items:center;">{$page.params.char}</h2>
<br/>
<table class="table table-hover table-interactive">
    <PitchingStatTableHeader title="Character" />
    <tbody>
        {#if charData}
        <PitchingStatTableRow title="all" statData={charData} />
        {/if}
        {#if charDataByUser}
            { #each sortedUsers(charDataByUser) as user }
                { #if charDataByUser[user]?.Pitching?.outs_pitched > 0 } 
                    <PitchingStatTableRow title={user} statData={charDataByUser[user]?.Pitching} />
                {/if}
            {/each}
        {/if}
    </tbody>
</table>