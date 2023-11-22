<script lang="ts">
    export let teamStats: any = undefined;
	import { getAvg, getObp, getOps, getPa, getSlg } from '$lib/helpers/statCalcs';
	import type { object } from 'zod';
    
    console.log("team stats component input: ", teamStats)
    function sumStats (statName: string) {
        let total: number = 0;
        teamStats.forEach(character => {
            total += character.pitchingStats[statName];
        }); 
        return total
    }

    let teamOutsPitched: number = sumStats('outs_pitched');
    let teamIP: number = Math.floor(teamOutsPitched / 3) + teamOutsPitched % 3;
    let teamH: number = sumStats('hits_allowed');
    let teamR: number = sumStats('runs_allowed');
    let teamK: number = sumStats('strikeouts_pitched');
    let teamBB: number = sumStats('walks_bb') + sumStats('walks_hbp');
    let teamOppAB: number = sumStats('batters_faced') - teamBB;
    let teamOppAvg: number = (teamOppAB === 0) ? 0 : teamH / teamOppAB;
    let teamERA: number = (teamOutsPitched === 0) ? ((teamR === 0) ? 0.00 : 99.99) :
                            teamR/(teamOutsPitched / 27);
</script>

<tr>
    <td>Total </td>
    <td>{teamIP} </td>
    <td>{teamH} </td>
    <td>{teamR} </td>
    <td>{teamK}</td>
    <td>{teamBB} </td>
    <td>{teamOppAvg.toFixed(3)} </td>
    <td>{teamERA.toFixed(2)}</td>
</tr>

<style>
    td {
        padding-inline: 5px;
        font-weight: bold;
    }
</style>