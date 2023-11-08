<script lang="ts">
    import { getAllTagSets } from '$lib/helpers/tagNames';
    // import { sortableTableAction} from "svelte-legos";

    import { tagsets } from '$lib/stores/tagsets';
    import { userPitchingStats, userPitchingStatsByChar } from '$lib/stores/userStats';
    import { onMount } from 'svelte';
    import { page } from '$app/stores';
	import { getUserPstat } from '$lib/helpers/getUserStats';
    import PitchingStatTableHeader from '$lib/components/PitchingStatTableHeader.svelte';
    import PitchingStatTableRow from '$lib/components/PitchingStatTableRow.svelte';
	import { sortableTableAction } from 'svelte-legos';
    // Access the tagsets data in your component

    let tagsetsData: any[] = []
    $: {
        tagsetsData = $tagsets.sort((a: any, b: any) => b.start_date - a.start_date); // Get the current value of the tagsets store
    }
    let statData: any;
    let statDataByChar: any;
    $: {
        statData = $userPitchingStats?.Pitching;
        statDataByChar = $userPitchingStatsByChar;
    }

    let selectedMode = "Stars Off, Season 7"

    const sortedChars = (statsByChar: any) => Object.keys(statsByChar)?.sort((a: any, b: any) => statsByChar[b]?.Pitching?.outs_pitched - statsByChar[a]?.Pitching?.outs_pitched);

    onMount(async () => {
        await getAllTagSets();
        await getUserPstat($page.params.user, selectedMode);
    })
</script>

<select id="modes" class="text-primary-50-900-token" bind:value={selectedMode} on:change={() => getUserPstat($page.params.user, selectedMode)}>
    {#each tagsetsData as mode}
        {#if mode?.type != "Test"}
            <option value={mode?.name} selected={mode.name == "Stars Off, Season 7"}>{mode?.name}</option>
        {/if}
    {/each}
</select>

<h2 style="display:flex;justify-content:center;align-items:center;">{$page.params.user}</h2>
<br/>
<table class="table table-hover table-compact" use:sortableTableAction>
    <PitchingStatTableHeader title="Character" />
    <tbody>
        {#if statData}
        <PitchingStatTableRow title="all" statData={statData} />
        {/if}
        {#if statDataByChar}
            { #each sortedChars(statDataByChar) as char }
                { #if statDataByChar[char]?.Pitching?.outs_pitched > 0 } 
                    <PitchingStatTableRow title={char} statData={statDataByChar[char]?.Pitching} />
                {/if}
            {/each}
        {/if}
    </tbody>
</table>