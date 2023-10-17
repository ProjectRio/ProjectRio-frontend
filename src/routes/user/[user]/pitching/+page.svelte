<script lang="ts">
    import { getAllTagSets } from '$lib/helpers/tagNames';
    // import { sortableTableAction} from "svelte-legos";

    import { tagsets } from '$lib/stores/tagsets';
    import { userPitchingStats, userPitchingStatsByChar } from '$lib/stores/userStats';
    import { onMount } from 'svelte';
    import { page } from '$app/stores';
	import { getUserPstat } from '$lib/helpers/getUserStats';
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

    let avg: number;
    let obp: number;
    let slg: number;
    let ops: number;

    const getIpString = (stats: any) => Math.floor(stats?.outs_pitched / 3) + "." + stats?.outs_pitched % 3;
    const getOppAvg = (stats: any) => (stats?.hits_allowed / (stats?.batters_faced - stats?.walks_bb - stats?.walks_hbp)).toFixed(3);
    const getKPct = (stats: any) => (stats?.strikeouts_pitched / stats?.batters_faced * 100).toFixed(1)
    const getERA = (stats: any) => (stats?.runs_allowed / (stats?.outs_pitched / 27)).toFixed(2)

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
<table class="table table-hover table-interactive">
    <thead>
        <tr>
            <th>Character</th>
            <th>IP</th>
            <th>H</th>
            <th>R</th>
            <th>K</th>
            <th>BB</th>
            <th>opp. AVG</th>
            <th>K%</th>
            <th>ERA</th>
        </tr>
    </thead>
    <tbody>
        {#if statData}
            <tr>
                <td>ALL</td>
                <td>{getIpString(statData)}</td>
                <td>{statData?.hits_allowed}</td>
                <td>{statData?.runs_allowed}</td>
                <td>{statData?.strikeouts_pitched}</td>
                <td>{statData?.walks_bb + statData?.walks_hbp}</td>
                <td>{getOppAvg(statData)}</td>
                <td>{getKPct(statData)}</td>
                <td>{getERA(statData)}</td>
            </tr>
        {/if}
        {#if statDataByChar}
            { #each sortedChars(statDataByChar) as char }
                { #if statDataByChar[char]?.Pitching?.outs_pitched > 0 } 
                    <tr>
                        <td>{char}</td>
                        <td>{getIpString(statDataByChar[char]?.Pitching)}</td>
                        <td>{statDataByChar[char]?.Pitching?.hits_allowed}</td>
                        <td>{statDataByChar[char]?.Pitching?.runs_allowed}</td>
                        <td>{statDataByChar[char]?.Pitching?.strikeouts_pitched}</td>
                        <td>{statDataByChar[char]?.Pitching?.walks_bb + statDataByChar[char]?.Pitching?.walks_hbp}</td>
                        <td>{getOppAvg(statDataByChar[char]?.Pitching)}</td>
                        <td>{getKPct(statDataByChar[char]?.Pitching)}</td>
                        <td>{getERA(statDataByChar[char]?.Pitching)}</td>
                    </tr>
                {/if}
            {/each}
        {/if}
    </tbody>
</table>