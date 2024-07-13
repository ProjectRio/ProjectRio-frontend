<script lang="ts">
    import PitchPlot from "$lib/components/pitchPlot.svelte";
    import * as c from "$lib/helpers/MssbFunctions/PitchSimulation/pitchingConstants";

        let inputPitcherXOnMound: number = 0;
        let inputPitcher_id: number = 0;
        let inputPitcherSuperstar: boolean = false;
        let inputPitcherHandedness: number = 0;
        let inputPitchType: number = 0;
        let inputPitchCharge: number = 0;
        let inputPitchCurve: number = 2; // for now, going to do 1=left, 2=straight, 3=right
        let inputPitcherStamina: number = 10;

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
            
            pitchStartingX = pitchStartingX + inputPitcherXOnMound;
        }

        // temporary way to handle pitch curve input. Once stat files are up and running, will think of a better way.
        let pitchCurveArray:number[] = [0];
        $: {
            pitchCurveArray.length = 0;
            Array.from(String(inputPitchCurve), Number).forEach((value) =>{
                let convertedValue;
                if (value == 1) {convertedValue = -1}
                else if (value == 2) {convertedValue = 0}
                else if (value == 3) {convertedValue = 1}
                else {convertedValue = 0}

                pitchCurveArray.push(convertedValue)
            })
        }

        $: pitchInputs = {
            'chargeUp': inputPitchCharge, // 80890AA0 float
            'curveInput': pitchCurveArray,//[0,0],//[0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
            'pitchType': inputPitchType, //0 curve, 1 charge, 2 perfect charge, 3 changeup, 4 star
            'pitcher_id': inputPitcher_id,
            'pitcherStarsOn': inputPitcherSuperstar,
            'pitcherHandedness': inputPitcherHandedness,
            'pitcherXOnMound': inputPitcherXOnMound, //808909E4 float
            'pitchStartingX': pitchStartingX, // 80890A54 float
            'pitchStartingY': pitchStartingY, // 80890A58 float
            'pitchStartingZ': pitchStartingZ,// 80890A5C float
            'pitcherStamina': inputPitcherStamina, 
            'batter_id': 21,
            'batZ': 1.7
      }

      let plotHeight:number = 750;
      let plotWitdh:number = plotHeight / 4.5;       
</script>
<div id='container'>
    <div id="plotContainer">
        <PitchPlot {pitchInputs} canvasHeight={plotHeight}/>
    </div>
    <div id="inputContainer">
        <label for="inputPitcherXOnMound">
            <input 
                bind:value={inputPitcherXOnMound} 
                type="number"
                step="0.01"
                min="-0.4"
                max="0.4"
            /> 
            Target X Coordinate
        </label><br>
        
        <label for="inputPitcher_id">
            <select bind:value={inputPitcher_id}>
                {#each Object.keys(c.charIDMapping).map((key) => [key, c.charIDMapping[key]]) as character, index}
                    <option value={character[0]} selected>{character[1]}</option>
                {/each}
            </select>
            Pitcher Character
        </label>

        <label for="inputPitcherSuperstar">
            <input type="checkbox" bind:checked={inputPitcherSuperstar}>
            Pitcher Superstar
        </label><br>

        <label for="inputPitcherHandedness">
            <select bind:value={inputPitcherHandedness}>
                <option value=0 selected>Righty</option>
                <option value=1 selected>Lefty</option>
            </select>
            Pitcher Handedness
        </label><br>

        <label for="inputPitchType">
            <select bind:value={inputPitchType}>
                <option value=0 selected>Curve</option>
                <option value=1 selected>Charge</option>
                <option value=2 selected>Perfect Charge</option>
                <option value=3 selected>Change Up</option>
                <option value=4 selected>Star</option>
            </select> 
            Pitch Type
        </label><br>

        <label for="inputPitchCharge">
            <input 
                bind:value={inputPitchCharge} 
                type="number"
                step="0.01"
                min="0"
                max="1"
            />
            Pitch Charge
        </label><br>

        <label for="inputPitchCurve">
            <input bind:value={inputPitchCurve} />
            Pitch Curve Sequence (1=left, 2=straight, 3=right)
        </label><br>

        <label for="inputPitcherStamina">
            <input 
                bind:value={inputPitcherStamina} 
                type="number"
                step="1"
                min="1"
                max="10"
            />
            Pitcher Stamina
        </label><br>
    </div>
</div>
<style>
    input {
        color: black;
    } 

    select {
        color: black;
    } 

    #container {
        display: grid;
        grid-template-columns: auto auto;
        grid-gap: 20px;
    }
</style>