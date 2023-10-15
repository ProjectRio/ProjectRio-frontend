<script lang="ts">
    import { getAllTagSets } from '$lib/helpers/tagNames';
    // import { sortableTableAction} from "svelte-legos";

    import { tagsets } from '$lib/stores/tagsets';
    import { userStats, userStatsByChar } from '$lib/stores/userStats';
    import { onMount } from 'svelte';
    import { page } from '$app/stores';
	import { getUserOstat } from '$lib/helpers/getUserStats';
    // Access the tagsets data in your component

    let tagsetsData: any[] = []
    $: {
        tagsetsData = $tagsets.sort((a: any, b: any) => b.start_date - a.start_date); // Get the current value of the tagsets store
    }
    let statData: any;
    let statDataByChar: any;
    $: {
        statData = $userStats?.Batting;
        statDataByChar = $userStatsByChar;
    }

    let selectedMode = "Stars Off, Season 7"

    let avg: number;
    let obp: number;
    let slg: number;
    let ops: number;

    const getPa = (stats: any) => stats?.summary_at_bats + stats?.summary_walks_hbp + stats?.summary_walks_bb + stats?.summary_sac_flys;
    const getAvg = (stats: any) => stats?.summary_hits / stats?.summary_at_bats;
    const getObp = (stats: any) => (stats?.summary_hits + stats?.summary_walks_hbp + stats?.summary_walks_bb) / getPa(stats).toFixed(3);
    const getSlg = (stats: any) => (stats?.summary_singles + (stats?.summary_doubles * 2) + (stats?.summary_triples * 3) + (stats?.summary_homeruns * 4)) / stats?.summary_at_bats
    const getOps = (stats: any) => getObp(stats) + getSlg(stats);

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
<table class="table table-hover table-interactive">
    <thead>
        <tr>
            <th>Character</th>
            <th>PA</th>
            <th>H</th>
            <th>2B</th>
            <th>3B</th>
            <th>HR</th>
            <th>RBI</th>
            <th>BB</th>
            <th>SO</th>
            <th>Perfect</th>
            <th>Nice</th>
            <th>Sour</th>
            <th>AVG</th>
            <th>OBP</th>
            <th>SLG</th>
            <th>OPS</th>
        </tr>
    </thead>
    <tbody>
        {#if statData}
            <tr>
                <td>ALL</td>
                <td>{getPa(statData)}</td>
                <td>{statData?.summary_hits}</td>
                <td>{statData?.summary_doubles}</td>
                <td>{statData?.summary_triples}</td>
                <td>{statData?.summary_homeruns}</td>
                <td>{statData?.summary_rbi}</td>
                <td>{statData?.summary_walks_bb + statData?.summary_walks_hbp}</td>
                <td>{statData?.summary_strikeouts}</td>
                <td>{statData?.perfect_hits}</td>
                <td>{statData?.nice_hits}</td>
                <td>{statData?.sour_hits}</td>
                <td>{getAvg(statData)?.toFixed(3)}</td>
                <td>{getObp(statData)?.toFixed(3)}</td>
                <td>{getSlg(statData)?.toFixed(3)}</td>
                <td>{getOps(statData)?.toFixed(3)}</td>
            </tr>
        {/if}
        {#if statDataByChar}
            { #each sortedChars(statDataByChar) as char } 
                <tr>
                    <td>{char}</td>
                    <td>{getPa(statDataByChar[char]?.Batting)}</td>
                    <td>{statDataByChar[char]?.Batting?.summary_hits}</td>
                    <td>{statDataByChar[char]?.Batting?.summary_doubles}</td>
                    <td>{statDataByChar[char]?.Batting?.summary_triples}</td>
                    <td>{statDataByChar[char]?.Batting?.summary_homeruns}</td>
                    <td>{statDataByChar[char]?.Batting?.summary_rbi}</td>
                    <td>{statDataByChar[char]?.Batting?.summary_walks_bb + statData?.summary_walks_hbp}</td>
                    <td>{statDataByChar[char]?.Batting?.summary_strikeouts}</td>
                    <td>{statDataByChar[char]?.Batting?.perfect_hits}</td>
                    <td>{statDataByChar[char]?.Batting?.nice_hits}</td>
                    <td>{statDataByChar[char]?.Batting?.sour_hits}</td>
                    <td>{getAvg(statDataByChar[char]?.Batting)?.toFixed(3)}</td>
                    <td>{getObp(statDataByChar[char]?.Batting)?.toFixed(3)}</td>
                    <td>{getSlg(statDataByChar[char]?.Batting)?.toFixed(3)}</td>
                    <td>{getOps(statDataByChar[char]?.Batting)?.toFixed(3)}</td>
                </tr>
            {/each}
        {/if}
    </tbody>
</table>