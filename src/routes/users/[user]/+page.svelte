<script lang="ts">
    import { page } from '$app/stores';
	import RecentSingleGame from '$lib/components/recentSingleGame.svelte';
	import { getRecentGames } from '$lib/helpers/getGameLists';
	import { winLossRecord } from '$lib/helpers/winLossRecord';
	import { recentGameList } from '$lib/stores/gameLists';
	import { onMount } from 'svelte';

    let record: number[] = [0,0];
    let loadingInd: boolean = true;

    onMount(async () => {
        await getRecentGames(10, undefined, false, $page.params.user)
        console.log("Recent games retreived", $recentGameList)
    
        record = winLossRecord($recentGameList, $page.params.user)

        loadingInd = false
    })

</script>

<h1>UNDER CONSTRUCTION</h1>

<p>{$page.params.user}'s profile page. This page will contain a player profile with a table of recent games, a small preview of offensive/defensive stats and a link to the detailed table, and other user-related content.</p><br>

<h3>Most Recent Game</h3> <br>
{#if !loadingInd}
    <RecentSingleGame displayedGame={$recentGameList[0]} /> <br>
    <p>Record (Last 10 Games): {record[0]}-{record[1]}</p> <br>
{:else}
    <p>Loading</p>
{/if}

<a href={`${$page.params.user}/batting`}>Batting Stats</a><br>
<a href={`${$page.params.user}/pitching`}>Pitching Stats</a>