<script lang="ts">
    import { generatePitchCoordinates } from "$lib/helpers/MssbFunctions/PitchSimulation/generatePitchCoordinates";
    import * as d3 from 'd3'
	import { onMount } from "svelte";

    const ftToM = 0.3048;
    const gameHomePlateScale = (0.53*2)/16.5 // conversion between an actual homeplate front measurement (16.5 inches) to what the game uses (0.53*2 meters)
    let homePlateCorners:number[][] = [ [0, 0, 0.53, 1.06*0.513939],
                                        [0.53, 1.06*0.513939,0.53, 1.06], 
                                        [0.53, 1.06, -0.53, 1.06], 
                                        [-0.53, 1.06, -0.53, 1.06*0.513939],
                                        [-0.53, 1.06*0.513939,0,0]] 
        //TODO: translate these values up a bit since the game doesn't define (0,0) as the back corner of home plate. Probably need to eyeball it

    let moundLeft = -(24/2)*gameHomePlateScale, moundRight = -moundLeft, moundBack = (60.5) * ftToM + 0.5*12 * gameHomePlateScale, moundFront = 60.5 * ftToM;
    let pitchersPlateCorners:number[][] = [[moundLeft, moundBack, moundRight, moundBack],
                                            [moundRight, moundBack, moundRight, moundFront],
                                            [moundRight, moundFront, moundLeft, moundFront],
                                            [moundLeft,moundFront,moundLeft,moundBack]]

    let pitchData:any = generatePitchCoordinates()
    let plotData:any[] = [];
    console.log(pitchData)
    for (let i in pitchData.calculatedPoints) {
        plotData.push({x: pitchData.calculatedPoints[i].X, z: pitchData.calculatedPoints[i].Z})
    }

    let pitchPathPlot:any;

    onMount(() => {
        console.log("Onmount started")
        const canvasHeight = 1000;
        const canvasWidth = 100;
        var pitchPlot = d3.select(pitchPathPlot)
                                    .attr("height", canvasHeight)
                                    .attr("width", canvasWidth)

        var widthScale = d3.scaleLinear()
                            .domain([-1, 1])
                            .range([0,canvasWidth]);

        var heightScale = d3.scaleLinear()
                            .domain([21, -3])  
                            .range([0,canvasHeight]);                  
        console.log(plotData)

        var backgroundObjects = pitchPlot.selectAll("line")
                                .data(homePlateCorners.concat(pitchersPlateCorners))
                                .enter()
                                    .append("line")
                                    .attr("x1", function (d) { return widthScale(d[0])})
                                    .attr("y1", function (d) { return heightScale(d[1])})
                                    .attr("x2", function (d) { return widthScale(d[2])})
                                    .attr("y2", function (d) { return heightScale(d[3])})
                                    .attr("stroke", "blue")
                                    .attr("stroke-width", 3)
                                    .attr("class", "homePlate")
                                    .attr("transform", "translate(0, "+heightScale(21-0.6264)+")"); // eyeballed diff between (0,0) and the back corner of home plate.

/*        var pitchersPlate = pitchPlot.selectAll("line")
                                .data(pitchersPlateCorners)
                                .enter()
                                    .append("line")
                                    .attr("x1", function (d) { return widthScale(d[0])})
                                    .attr("y1", function (d) { return heightScale(d[1])})
                                    .attr("x2", function (d) { return widthScale(d[2])})
                                    .attr("y2", function (d) { return heightScale(d[3])})
                                    .attr("stroke", "blue")
                                    .attr("stroke-width", 3)
                                    .attr("class", "homePlate");
*/

        var ballCoords = pitchPlot.selectAll("circle")
                                .data(plotData)
                                .enter()
                                    .append("circle")
                                    .attr("cx", function (d) { return widthScale(d.x)})
                                    .attr("cy", function (d) { return heightScale(d.z)})
                                    .attr("r", 2)
                                    .attr("fill", "red");
        console.log("Onmount finished")
            
    })

    
</script>

Test
<!--svg width="500" height = "400"></svg-->
<div id="mainArea">
    test 2
    <!--div>
        Testing
        {JSON.stringify(pitchData)}
    </div-->
</div>
<svg bind:this={pitchPathPlot} > 

</svg>