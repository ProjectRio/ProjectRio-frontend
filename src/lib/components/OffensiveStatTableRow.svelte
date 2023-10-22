<script lang="ts">
	import { getAvg, getObp, getPa, getSlg, getOps } from "$lib/helpers/statCalcs";

    export let title: string;
    export let statData: any;
</script>

<tr>
    <td>{title}</td>
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