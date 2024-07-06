<script lang="ts">
    import { generatePitchCoordinates } from "$lib/helpers/MssbFunctions/PitchSimulation/generatePitchCoordinates";
    import * as d3 from 'd3'
	import { Divide } from "lucide-svelte";
	import { onMount } from "svelte";
	import { tooltipAction } from "svelte-legos";
	import { string } from "zod";


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

    let pitchData:any = generatePitchCoordinates()
    console.log(pitchData)
    let plotData:any[] = [];

    for (let i in pitchData.calculatedAtBatBallPosPoints) {
        plotData.push({x: pitchData.calculatedAtBatBallPosPoints[i].X, y: pitchData.calculatedAtBatBallPosPoints[i].Z})
    }

    let pitchPathPlot:any;

    onMount(() => {
        const canvasHeight = 1000;
        const canvasWidth = 600;
        var pitchPlot = d3.select(pitchPathPlot)
                                    .attr("height", canvasHeight)
                                    .attr("width", canvasWidth)

        var widthScale = d3.scaleLinear()
                            .domain([-3, 3])
                            .range([0,canvasWidth]);

        var heightScale = d3.scaleLinear()
                            .domain([19, -3])  
                            .range([0,canvasHeight]);     
                            
        
        var line = d3.line()
                    .x(function(d:any) { return widthScale(d.x)})
                    .y(function (d:any) {return heightScale(d.y)}); 
        
                    
        var pitchPathLine = d3.line()
                    .x(function(d:any) {return widthScale(d.calculatedAtBatBallPosPoints.X)})
                    .y(function (d:any) {return heightScale(d.calculatedAtBatBallPosPoints.Z)}); 

        var homePlate = pitchPlot.append('g').attr('class', 'homePlate')
                                .selectAll('line')
                                .data([homePlateCorners])
                                .enter()
                                    .append("path")
                                    .attr('d', line)
                                    .attr('fill', 'none')
                                    .attr('stroke', 'blue')
                                    .attr('stroke-width', 3);
                                    //.attr("transform", "translate(0, " + heightScale(19-0.6264) + ")"); // eyeballed diff between (0,0) and the back corner of home plate.

        var pitchersPlate = pitchPlot.append("g").attr("id", "pitchersPlate")
                                .selectAll("line")
                                .data([pitchersPlateCorners])
                                .enter()
                                    .append("path")
                                    .attr('d', line)
                                    .attr('fill', 'none')
                                    .attr("stroke", "blue")
                                    .attr("stroke-width", 3)
                                    //.attr("transform", "translate(0, " + heightScale(19-0.6264) + ")"); // eyeballed diff between (0,0) and the back corner of home plate.

        // Draw path of the pitch
        var pitchPath = pitchPlot.append('g').attr('class', "pitchPath")
                                .selectAll("line")
                                .data([pitchData.calcedOutputs])
                                .enter()
                                    .append("path")
                                    .attr('d', pitchPathLine)
                                    .attr('fill', 'none')
                                    .attr("stroke", "grey")
                                    .attr("stroke-width", 1);

        // create the ball coordinate groups
        var ballCoords = pitchPlot.append("g").attr("class", "ballCoordinates")
                                .selectAll('g')
                                .data(pitchData.calcedOutputs)
                                .enter()
                                .append('g').attr('class', 'ballCoordinate');

        // add text to each ball coordinate (initially hidden)
        var ballCoordText = ballCoords.append('text').attr('class', 'coordinateText')
                                    .attr('x', function(d:any) {return widthScale(d.calculatedAtBatBallPosPoints.X + .1)})
                                    .attr('y', function(d:any) {return heightScale(d.calculatedAtBatBallPosPoints.Z)})
                                    .attr('fill', 'red')
                                    .attr('fill-opacity', 0)
                                    .append('tspan')
                                    .text(function(d:any) {return "Coordinates ".concat(d.calculatedAtBatBallPosPoints.X.toFixed(5)," ", d.calculatedAtBatBallPosPoints.Z.toFixed(5))})
                                    .append('tspan')
                                    .text(function(d:any) {return "Velocity ".concat(d.calculatedVelocity.X.toFixed(5)," ", d.calculatedVelocity.Z.toFixed(5))})
                                    .attr("x", function(d:any) {return widthScale(d.calculatedAtBatBallPosPoints.X + .1)})
                                    .attr("dy", '1.3em')
                                    .append('tspan')
                                    .text(function(d:any) {return "Frame ".concat(d.pitchFrame)})
                                    .attr("x", function(d:any) {return widthScale(d.calculatedAtBatBallPosPoints.X + .1)})
                                    .attr("dy", '1.3em')


        // add circles for each ball coordinate                            
        var ballCoordCircle = ballCoords.append("circle")
                                        .attr("cx", function (d:any) { return widthScale(d.calculatedAtBatBallPosPoints.X)})
                                        .attr("cy", function (d:any) { return heightScale(d.calculatedAtBatBallPosPoints.Z)})
                                        .attr("r", 4)
                                        .attr("fill", "red");

        // show and hide textboxes beside current coordinate the mouse is on
        ballCoords.on('mouseover', function(){
                                        d3.select(this).select('text')
                                            .transition()
                                            .duration(200)
                                            .attr('fill-opacity', '1')
                                    })
                .on('mouseout', function() {
                                        d3.select(this).select('text')
                                            .transition()
                                            .duration(200)
                                            .attr('fill-opacity', '0')
                });


            
    })

    
</script>

<svg bind:this={pitchPathPlot} > 

</svg>

<style>

</style>