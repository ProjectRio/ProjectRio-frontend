<script lang="ts">
    import PitchPlot from "$lib/components/pitchPlot.svelte";
    import * as c from "$lib/helpers/MssbFunctions/PitchSimulation/pitchingConstants";

        let inputPitcherXOnMound: number = 0;
        let inputPitcher_id: number = 0;
        let inputPitcherHandedness: number = 0;
        let inputPitchType: number = 0;
        let inputPitchCharge: number = 0;

        // These are estimates of the translation of the base release point - we should use the stat files for the real values once avaialble
        let pitchStartingX:number = -0.358750939;
        let pitchStartingY:number = 2.9281559;
        let pitchStartingZ:number = 17.6997108;
        $: {
            if (inputPitchType == 1 || inputPitchType == 2 || inputPitchType == 3) {
                pitchStartingX = c.pitchBaseReleaseCoordinates[c.charIDNoDupMapping[inputPitcher_id]].charge.X
                pitchStartingY = c.pitchBaseReleaseCoordinates[c.charIDNoDupMapping[inputPitcher_id]].charge.Y
                pitchStartingZ = c.pitchBaseReleaseCoordinates[c.charIDNoDupMapping[inputPitcher_id]].charge.Z
            } else {
                pitchStartingX = c.pitchBaseReleaseCoordinates[c.charIDNoDupMapping[inputPitcher_id]].curve.X
                pitchStartingY = c.pitchBaseReleaseCoordinates[c.charIDNoDupMapping[inputPitcher_id]].curve.Y
                pitchStartingZ = c.pitchBaseReleaseCoordinates[c.charIDNoDupMapping[inputPitcher_id]].curve.Z
            }

            if (inputPitcherHandedness == 1) {pitchStartingX = -pitchStartingX}
        }

        $: pitchInputs = {
            'chargeUp': inputPitchCharge,
            'curveInput': [0,0],//[0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
            'pitchType': inputPitchType, //0 curve, 1 charge, 2 perfect charge, 3 changeup, 4 star
            'pitcher_id': inputPitcher_id,
            'pitcherStarsOn': false,
            'pitcherHandedness': inputPitcherHandedness,
            'pitcherXOnMound': inputPitcherXOnMound,
            'pitchStartingX': pitchStartingX,
            'pitchStartingY': pitchStartingY,
            'pitchStartingZ': pitchStartingZ,
            'pitcherStamina': 10,
            'batter_id': 21,
            'batZ': 1.7
      }
       
</script>

<input bind:value={inputPitcherXOnMound} />

<select bind:value={inputPitcher_id}>
    {#each Object.keys(c.charIDMapping).map((key) => [key, c.charIDMapping[key]]) as character, index}
        <option value={character[0]} selected>{character[1]}</option>
    {/each}
</select>

<select bind:value={inputPitcherHandedness}>
    <option value=0 selected>Righty</option>
    <option value=1 selected>Lefty</option>
</select>

<select bind:value={inputPitchType}>
    <option value=0 selected>Curve</option>
    <option value=1 selected>Charge</option>
    <option value=2 selected>Perfect Charge</option>
    <option value=3 selected>Change Up</option>
    <option value=4 selected>Star</option>
</select>

<input bind:value={inputPitchCharge} />

<PitchPlot {pitchInputs} canvasWidth={500}/>
<style>
    input {
        color: black;
    } 
    select {
        color: black;
    } 
</style>