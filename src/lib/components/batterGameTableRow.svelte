<script lang="ts">
    export let batterInfo: any = undefined;
    export let batterName: string = "Unknown";
    export let isCaptain: boolean = false;
	import { getAvg, getObp, getOps, getPa, getSlg } from '$lib/helpers/statCalcs';

    
</script>

<tr>
    <td>{batterName}{#if isCaptain}-✪{/if}</td> <!-- to do: add link to player-character stat page-->
    <td>{batterInfo.summary_at_bats} </td>
    <td>{batterInfo.summary_hits} </td>
    <td>{batterInfo.summary_rbi} </td>
    <td>{batterInfo.summary_homeruns}</td>
    <td>{batterInfo.summary_walks_bb + batterInfo.summary_walks_hbp} </td>
    <td>{getAvg(batterInfo).toFixed(3)} </td>
    <td>{getOps(batterInfo).toFixed(3)} </td>
</tr>

<style>
    td {
        padding-inline: 5px;
    }
</style>