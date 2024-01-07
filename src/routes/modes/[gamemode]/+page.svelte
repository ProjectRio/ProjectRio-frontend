<script lang="ts">

    import { getAllTagSets } from '$lib/helpers/tagNames';
    import { tagsets } from '$lib/stores/tagsets';
	import { onMount } from "svelte";
    import { page } from '$app/stores';
    import RecentSingleGame from '$lib/components/recentSingleGame.svelte';
	import { getRecentGames } from '$lib/helpers/getGameLists';
	import { recentGameList } from '$lib/stores/gameLists';
    import { ladderUsers } from '$lib/stores/ladder';
    import { getTagSetLadder } from '$lib/helpers/getLadder';
	import { filter } from '@skeletonlabs/skeleton';

    let loadingInd: boolean = true;
    let mode_name: string = $page.params.gamemode;
    let mode_id: number
    let mode_info: any
    let ladderTop10: any[]

    onMount(async () => {
        //console.log("Onmount started")
        if ($tagsets.length === 0) {
            console.log("No tagsets in store, calling API")
            await getAllTagSets();
        }
        console.log($tagsets)
        mode_info = $tagsets.find((i: {name: string}) => i.name === mode_name)
        mode_id = mode_info.id
        console.log(mode_info)
        console.log(mode_id)

        
        await getRecentGames(1, mode_name.replace(" ", "").replace(",", ""), false, $page.params.user)
        console.log("Recent games retreived", $recentGameList)

        console.log(ladderUsers, $ladderUsers)

        await getTagSetLadder(mode_name)
        console.log(ladderUsers, $ladderUsers)
        ladderTop10 = <any>$ladderUsers
        ladderTop10.length = 10

        //console.log("game on mount finished")
        loadingInd = false
    })
    //Make vars for game mode name and game mode ID


</script>

<h1>{mode_name}</h1> <br>

<h2>Last game played</h2>
<RecentSingleGame displayedGame={$recentGameList[0]} /> <br>

<!--h2>Live games</h2-->  
<h2>Top 10</h2>
<section class="table-container">
    <table class="table table-hover table-interactive table-compact">
    
        <thead>
        <tr>
            <th>#</th>
            <th>Rating</th>
            <th>Username</th>
            <th>W-L</th>
        </tr>
        </thead>
        <tbody>
            {#if ladderTop10}
                {#each ladderTop10 as player, i}
                    <tr class="">
                        <td>{i + 1}</td>
                        <td>{player.adjusted_rating}</td>
                        <td class="player-link "><a class="player decoration-transparent" href={`/modes/player/${player.username}`}>{player.username}</a></td>
                        <td>{player.num_wins}-{player.num_losses}</td>
                    </tr>
                {/each}
            {/if}
        </tbody>
    </table>
</section><br>

<h2>Rules</h2>
<section class="table-container">
    <table class="table table-hover table-interactive table-compact">
        <thead>
            <tr>
                <th>Tag Name</th>
                <th>Description</th>
            </tr>
        </thead>
        <tbody>
            {#if mode_info}
                {#each mode_info.tags.filter((tag) => tag.type !== "Community") as tag}
                    <tr class="">
                        <td>{tag.name}</td>
                        <td>{tag.desc}</td>
                    </tr>
                {/each}
            {/if}
        </tbody>
    </table>
</section><br>
<h2>Batting Stats (coming soon)</h2>
<h2>Pitching Stats (coming soon)</h2>