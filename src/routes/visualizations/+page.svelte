<script lang="ts">
    import { generatePitchCoordinates } from "$lib/helpers/MssbFunctions/PitchSimulation/generatePitchCoordinates";

    let pitchCoords:any = generatePitchCoordinates() 
</script>

<div>
    Testing
    {JSON.stringify(pitchCoords)}
</div>