<script lang="ts">
    import { getAllTagSets } from '$lib/helpers/tagNames';
    import { sortableTableAction } from 'svelte-legos';

    import { tagsets } from '$lib/stores/tagsets';
    import { userBattingStats, userBattingStatsByChar } from '$lib/stores/userStats';
    import { onMount } from 'svelte';
    import { page } from '$app/stores';
	import { getUserOstat } from '$lib/helpers/getUserStats';
	import { getPa } from '$lib/helpers/statCalcs';
	import OffensiveStatTableHeader from '$lib/components/OffensiveStatTableHeader.svelte';
	import OffensiveStatTableRow from '$lib/components/OffensiveStatTableRow.svelte';
    // Access the tagsets data in your component

    let tagsetsData: any[] = []
    $: {
        tagsetsData = $tagsets.sort((a: any, b: any) => b.start_date - a.start_date); // Get the current value of the tagsets store
    }
    let statData: any;
    let statDataByChar: any;
    $: {
        statData = $userBattingStats?.Batting;
        statDataByChar = $userBattingStatsByChar;
    }

    let selectedMode = "Stars Off, Season 7"

    let avg: number;
    let obp: number;
    let slg: number;
    let ops: number;

    const sortedChars = (statsByChar: any) => Object.keys(statsByChar)?.sort((a: any, b: any) => getPa(statsByChar[b]?.Batting) - getPa(statsByChar[a]?.Batting));

    onMount(async () => {
        await getAllTagSets();
        await getUserOstat($page.params.user, selectedMode);
    })
</script>

<select id="modes" class="text-primary-50-900-token" bind:value={selectedMode} on:change={() => getUserOstat($page.params.user, selectedMode)}>
    {#each tagsetsData as mode}
        {#if mode?.type != "Test"}
            <option value={mode?.name} selected={mode.name == "Stars Off, Season 7"}>{mode?.name}</option>
        {/if}
    {/each}
</select>

<h2 style="display:flex;justify-content:center;align-items:center;">{$page.params.user}</h2>
<br/>
<table class="table table-hover table-compact" use:sortableTableAction>
    <OffensiveStatTableHeader title="Character" />
    <tbody>
        {#if statData}
            <OffensiveStatTableRow title="ALL" statData={statData} />
        {/if}
        {#if statDataByChar}
            { #each sortedChars(statDataByChar) as char } 
                <OffensiveStatTableRow title={char} statData={statDataByChar[char]?.Batting} />
            {/each}
        {/if}
    </tbody>
</table>