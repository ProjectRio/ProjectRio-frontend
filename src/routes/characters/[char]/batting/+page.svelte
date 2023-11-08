<script lang="ts">
    import { getAllTagSets } from '$lib/helpers/tagNames';

    import { tagsets } from '$lib/stores/tagsets';
    import { onMount } from 'svelte';
    import { page } from '$app/stores';
	import { getCharOstat } from '$lib/helpers/getCharStats';
	import { charBattingStats, charBattingStatsByUser } from '$lib/stores/charStats';
	import { getOps, getPa } from '$lib/helpers/statCalcs';
	import OffensiveStatTableHeader from '$lib/components/OffensiveStatTableHeader.svelte';
	import OffensiveStatTableRow from '$lib/components/OffensiveStatTableRow.svelte';
	import { sortableTableAction } from 'svelte-legos';
    // Access the tagsets data in your component

    let tagsetsData: any[] = []
    $: {
        tagsetsData = $tagsets.sort((a: any, b: any) => b.start_date - a.start_date); // Get the current value of the tagsets store
    }
    let charStats: any;
    let charStatsByUser: any;
    $: {
        charStats = $charBattingStats?.Batting;
        charStatsByUser = $charBattingStatsByUser;
    }

    let selectedMode = "Stars Off, Season 7"

    let avg: number;
    let obp: number;
    let slg: number;
    let ops: number;

    const sortedUsers = (statsByChar: any) => Object.keys(statsByChar)
        ?.filter(u => getPa(statsByChar[u]?.Batting) > getPa(charStats) / 100)
        .sort((a: any, b: any) => getOps(statsByChar[b]?.Batting) - getOps(statsByChar[a]?.Batting));

    onMount(async () => {
        await getAllTagSets();
        await getCharOstat($page.params.char, selectedMode);
    });
</script>

<select id="modes" class="text-primary-50-900-token" bind:value={selectedMode} on:change={() => getCharOstat($page.params.char, selectedMode)}>
    {#each tagsetsData as mode}
        {#if mode?.type != "Test"}
            <option value={mode?.name} selected={mode.name == "Stars Off, Season 7"}>{mode?.name}</option>
        {/if}
    {/each}
</select>

<h2 style="display:flex;justify-content:center;align-items:center;">{$page.params.char}</h2>
<br/>
<table class="table table-hover table-compact" use:sortableTableAction>
    <OffensiveStatTableHeader title="User" />
    <tbody>
        {#if charStats}
            <OffensiveStatTableRow title="ALL" statData={charStats} />
        {/if}
        {#if charStatsByUser}
            { #each sortedUsers(charStatsByUser) as user }
                <OffensiveStatTableRow title={user} statData={charStatsByUser[user]?.Batting} />
            {/each}
        {/if}
    </tbody>
</table>