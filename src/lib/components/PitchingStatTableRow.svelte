<script lang="ts">
    import { getERA, getIpString, getKPct, getOppAvg } from '$lib/helpers/statCalcs';

    export let title: string;
    export let statData: any;
</script>

<tr>
    <th>{title}</th>
    <td>{getIpString(statData)}</td>
    <td>{statData?.hits_allowed}</td>
    <td>{statData?.runs_allowed}</td>
    <td>{statData?.strikeouts_pitched}</td>
    <td>{statData?.walks_bb + statData?.walks_hbp}</td>
    <td>{getOppAvg(statData)}</td>
    <td>{getKPct(statData)}</td>
    <td>{getERA(statData)}</td>
</tr>