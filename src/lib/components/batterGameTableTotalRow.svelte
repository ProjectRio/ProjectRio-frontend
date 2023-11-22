<script lang="ts">
    export let teamStats: any = undefined;
	import { getAvg, getObp, getOps, getPa, getSlg } from '$lib/helpers/statCalcs';
	import type { object } from 'zod';
    
    console.log("team stats component input: ", teamStats)
    function sumStats (statName: string) {
        let total: number = 0;
        teamStats.forEach(character => {
            total += character.battingStats[statName];
        }); 
        return total
    }

    let teamAB: number = sumStats('summary_at_bats');
    let teamH: number = sumStats('summary_hits');
    let teamRBI: number = sumStats('summary_rbi');
    let team1B: number = sumStats('singles');
    let team2B: number = sumStats('doubles');
    let team3B: number = sumStats('triples');
    let teamHR: number = sumStats('summary_homeruns');
    let teamBB: number = sumStats('summary_walks_bb') + sumStats('summary_walks_hbp');
    let teamSacFlys: number = sumStats('summary_sac_flys');
    let teamPA: number = teamH + teamBB + teamSacFlys;
    let teamAVG: number = (teamAB === 0) ? 0 : teamH / teamAB;
    let teamOBP: number = (teamPA === 0) ? 0 : (teamH + teamBB) / teamPA;
    let teamSLG: number = (teamAB === 0) ? 0 : (team1B + 2 * team2B + 3* team3B + 4 * teamHR) / teamAB;
    let teamOPS: number = teamOBP + teamSLG;
</script>

<tr>
    <td>Total </td>
    <td>{teamAB} </td>
    <td>{teamH} </td>
    <td>{teamRBI} </td>
    <td>{teamHR}</td>
    <td>{teamBB} </td>
    <td>{teamAVG.toFixed(3)} </td>
    <td>{teamOPS.toFixed(3)}</td>
</tr>

<style>
    td {
        padding-inline: 5px;
        font-weight: bold;
    }
</style>