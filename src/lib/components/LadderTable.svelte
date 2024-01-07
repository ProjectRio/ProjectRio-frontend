<script lang='ts'>


	import { onMount } from "svelte";
    import { ladderUsers } from '$lib/stores/ladder';
    import { getTagSetLadder } from '$lib/helpers/getLadder';

    export let ladderGameMode: string;
    export let nUsersToDisplay: number;

    let loadingInd: boolean = true
    let ladderTopX: any[]

    onMount(async () => {
        console.log(ladderUsers, $ladderUsers)

        await getTagSetLadder(ladderGameMode)
        console.log(ladderUsers, $ladderUsers)
        ladderTopX = <any>$ladderUsers
        if (nUsersToDisplay) { // if parameter was passed, shrink array length
            ladderTopX.length = nUsersToDisplay
        }

        //console.log("game on mount finished")
        //loadingInd = false
    })

</script>


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
            {#if ladderTopX && loadingInd}
                {#each ladderTopX as player, i}
                    <tr class="">
                        <td>{i + 1}</td>
                        <td>{player.adjusted_rating}</td>
                        <td class="player-link "><a class="player decoration-transparent" href={`/users/${player.username}`}>{player.username}</a></td>
                        <td>{player.num_wins}-{player.num_losses}</td>
                    </tr>
                {/each}
            {:else}
                    <tr>
                        <td>Loading</td>
                    </tr>
            {/if}
        </tbody>
    </table>
</section>