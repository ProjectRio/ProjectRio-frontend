<script lang="ts">
    export let pitcherInfo: any = undefined;
    export let pitcherName: string = "Unknown";
	import { getIpString, getOppAvg, getERA } from '$lib/helpers/statCalcs';

    
</script>

<tr>
    <td>{pitcherName} </td> <!-- to do: add link to player-character stat page-->
    <td>{Math.floor(pitcherInfo.outs_pitched / 3) + "." + pitcherInfo.outs_pitched % 3} </td> <!--the helper function isn't working for some reason-->
    <td>{pitcherInfo.hits_allowed} </td>
    <td>{pitcherInfo.runs_allowed} </td>
    <td>{pitcherInfo.strikeouts_pitched}</td>
    <td>{pitcherInfo.walks_bb + pitcherInfo.walks_hbp} </td>
    <td>{getOppAvg(pitcherInfo)} </td>
    <td>{getERA(pitcherInfo)} </td>
</tr>

<style>
    td {
        padding-inline: 5px;
    }
</style>