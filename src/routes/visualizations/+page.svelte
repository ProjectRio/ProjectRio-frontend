<script lang="ts">
    import PitchPlot from "$lib/components/pitchPlot.svelte";

        let inputPitchStartingX = -0.358750939;
        $: pitchInputs = {
            'chargeUp': 0.44,
            'curveInput': [0,0],//[0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
            'pitchType': 4, //0 curve, 1 charge, 2 perfect charge, 3 changeup, 4 star
            'pitcher_id': 2,
            'pitcherStarsOn': false,
            'pitcherHandedness': 0,
            'pitcherXOnMound': 0,
            'pitchStartingX': Number(inputPitchStartingX),
            'pitchStartingY': 2.83268118,//2.9281559,
            'pitchStartingZ': 17.872982,//17.6997108,
            'pitcherStamina': 10,
            'batter_id': 21,
            'batZ': 1.7
      }
   

    
</script>

<input bind:value={inputPitchStartingX} />

<PitchPlot {pitchInputs} canvasWidth={500}/>
<style>
    input {
        color: black;
    } 
</style>