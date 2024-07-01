<script lang="ts">
    import { generatePitchCoordinates } from "$lib/helpers/MssbFunctions/PitchSimulation/generatePitchCoordinates";
    import * as d3 from 'd3'
	import { X } from "lucide-svelte";
	import { onMount } from "svelte";

    let pitchData:any = generatePitchCoordinates() 
    let plotData:any[] = [];

    for (let i = 0; i < pitchData.calculatedPoints; i++) {
        plotData.push({x: pitchData.calculatedPoints[i].X, z: pitchData.calculatedPoints[i].Z})
    }

    //const line = d3.line((d) => x(d.Date), (d) => yield(d.Close))
</script>


<!--svg width="500" height = "400"></svg-->
<div>
    Testing
    {JSON.stringify(pitchData)}
</div><br>
