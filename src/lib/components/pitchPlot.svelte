<script lang="ts">
	import { generatePitchCoordinates } from '$lib/helpers/MssbFunctions/PitchSimulation/generatePitchCoordinates';
  
      export let pitchInputs: any = {
            'chargeUp': 0,
            'curveInput': [0],
            'pitchType': 0, //0 curve, 1 charge, 2 perfect charge, 3 changeup, 4 star
            'pitcher_id': 0,
            'pitcherStarsOn': false,
            'pitcherHandedness': 0,
            'pitcherXOnMound': 0,
            'pitchStartingX': -0.358750939,
            'pitchStartingY': 2.9281559,
            'pitchStartingZ': 17.6997108,
            'pitcherStamina': 10,
            'batter_id': 21,
            'batZ': 1.7
      };
      export let canvasHeight:number = 750;
      //export let canvasWidth:number = ; 
      $: canvasWidth = canvasHeight / 3; // ratio of home to the mound, and 4m accross
      $: circleRadius = canvasHeight / 250;
      $: fontSize = Math.floor(canvasHeight/75)

      import * as d3 from 'd3'
      import { onMount } from "svelte";
	import { fade } from 'svelte/transition';

      const ftToM = 0.3048;
      const gameHomePlateScale = (0.53*2)/16.5 // conversion between an actual homeplate front measurement (16.5 inches) to what the game uses (0.53*2 meters)

      let homePlateCorners:any[] = [  {x:0, y:0},
                                          {x:0.53, y:1.06*0.513939}, 
                                          {x:0.53, y:1.06}, 
                                          {x:-0.53, y:1.06},
                                          {x:-0.53, y:1.06*0.513939},
                                          {x:0, y:0}] 


      let moundLeft = -(24/2)*gameHomePlateScale, moundRight = -moundLeft, moundBack = (60.5) * ftToM + 0.5*12 * gameHomePlateScale, moundFront = 60.5 * ftToM;
      let pitchersPlateCorners:any[] = [{x:moundLeft, y:moundBack},
                                                {x:moundRight, y:moundBack},
                                                {x:moundRight, y:moundFront},
                                                {x:moundLeft, y:moundFront},
                                                {x:moundLeft, y:moundBack}]

      let pitchPathPlot2:any;
      let pitchData:any = [];
      $: pitchData = generatePitchCoordinates(pitchInputs)


      $: minX = Math.min(...pitchData.calcedOutputs.map((item: any) => item.calculatedAtBatBallPosPoints.X ))
      $: maxX = Math.max(...pitchData.calcedOutputs.map((item: any) => item.calculatedAtBatBallPosPoints.X ))

      let padding:number = 0.2;
      
      $: widthScale2 = d3.scaleLinear()
                              .domain([-Math.max(2, Math.abs(minX), Math.abs(maxX)) - padding, Math.max(2, Math.abs(minX), Math.abs(maxX)) + padding ])
                              //.domain([Math.min(-2 - padding, minX - padding), Math.max(2 + padding, maxX + padding)])
                              .range([0,canvasWidth]);

      $: heightScale2 = d3.scaleLinear()
                              .domain([19.5, -3])  
                              .range([0,canvasHeight]); 

      
      var line = d3.line()
                  .x(function(d:any) { return widthScale2(d.x)})
                  .y(function (d:any) {return heightScale2(d.y)}); 

      
      var pitchPathLine:any = d3.line()
                  .x(function(d:any) {return widthScale2(d.calculatedAtBatBallPosPoints.X)})
                  .y(function (d:any) {return heightScale2(d.calculatedAtBatBallPosPoints.Z)}); 

      let circleHovered:any;
  </script>

<!--svg bind:this={pitchPathPlot2} > 

</svg-->

<svg width={canvasWidth} height={canvasHeight}>
      <g class='homePlate'>
            {#each homePlateCorners as corner}
                  <path
                        d={line(homePlateCorners)}
                        fill='none'
                        stroke='blue'
                        stroke-width=3 
                  />
            {/each}
      </g>
      <g class='pitchersPlate'>
            {#each pitchersPlateCorners as corner}
                  <path
                        d={line(pitchersPlateCorners)}
                        fill='none'
                        stroke='blue'
                        stroke-width=3 
                  />
            {/each}
      </g>
      <g class='pitchPath'  >
            {#each pitchData.calcedOutputs as point}
                  <path
                        d={pitchPathLine(pitchData.calcedOutputs)}
                        fill='none'
                        stroke='grey'
                        stroke-width=1 
                  />
            {/each}
      </g>
      <g class='ballCoordinates'>
            {#each pitchData.calcedOutputs as pitch_Frame, index (pitch_Frame.pitchFrame)}
                  <g>
                        <text 
                              class='coordinateText' 
                              x={widthScale2(pitch_Frame.calculatedAtBatBallPosPoints.X)} 
                              y={heightScale2(pitch_Frame.calculatedAtBatBallPosPoints.Z)} 
                              fill= 'red'
                              fill-opacity={(circleHovered && circleHovered == index) ? 1 : 0}
                              font-size={fontSize}
                        >
                              <tspan 
                                    x={widthScale2(pitch_Frame.calculatedAtBatBallPosPoints.X + .1)} 
                                    dy=0
                              >
                                    Coordinates {pitch_Frame.calculatedAtBatBallPosPoints.X.toFixed(5)}, {pitch_Frame.calculatedAtBatBallPosPoints.Z.toFixed(5)}
                              </tspan>
                              <tspan 
                                    x={widthScale2(pitch_Frame.calculatedAtBatBallPosPoints.X + .1)} 
                                    dy=1.3em
                              >
                                    Velocity {pitch_Frame.calculatedVelocity.X.toFixed(5)}, {pitch_Frame.calculatedVelocity.Z.toFixed(5)}
                              </tspan> 
                              <tspan 
                                    x={widthScale2(pitch_Frame.calculatedAtBatBallPosPoints.X + .1)} 
                                    dy=1.3em
                              >
                              Frame {pitch_Frame.pitchFrame}
                              </tspan> 
                              <tspan 
                                    x={widthScale2(pitch_Frame.calculatedAtBatBallPosPoints.X + .1)} 
                                    dy=1.3em
                              >
                              Curve Input {pitch_Frame.curveInput}
                              </tspan> 
                        </text>
                        <!-- svelte-ignore a11y-no-static-element-interactions -->
                        <!-- svelte-ignore a11y-mouse-events-have-key-events -->
                        <circle 
                              cx={widthScale2(pitch_Frame.calculatedAtBatBallPosPoints.X)} 
                              cy={heightScale2(pitch_Frame.calculatedAtBatBallPosPoints.Z)} 
                              r={circleRadius} 
                              on:mouseover={() => circleHovered = index}
                              on:mouseout={() => circleHovered = null}
                              fill={(circleHovered && circleHovered == index) ? 'green' : 'red'}
                        />
                  </g>
            {/each}
      </g>
</svg>

<style>
      :hover {
            color: green
      }

      circle {
            transition: 1s;
      }
</style>