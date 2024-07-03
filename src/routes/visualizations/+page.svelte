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

    let moundLeft = -(24/2)*gameHomePlateScale, moundRight = -moundLeft, moundBack = (60.5) * ftToM + 0.5*12 * gameHomePlateScale, moundFront = 60.5 * ftToM;
    let pitchersPlateCorners:number[][] = [[moundLeft, moundBack, moundRight, moundBack],
                                            [moundRight, moundBack, moundRight, moundFront],
                                            [moundRight, moundFront, moundLeft, moundFront],
                                            [moundLeft,moundFront,moundLeft,moundBack]]

    let pitchData:any = generatePitchCoordinates()
    let plotData:any[] = [];
    
    /*for (let i in pitchData.calculatedPoints) {
        plotData.push({x: pitchData.calculatedPoints[i].X, z: pitchData.calculatedPoints[i].Z})
    }*/

    for (let i in pitchData.calculatedAtBatBallPosPoints) {
        plotData.push({x: pitchData.calculatedAtBatBallPosPoints[i].X, z: pitchData.calculatedAtBatBallPosPoints[i].Z})
    }

    let pitchPathPlot:any;

    onMount(() => {
        const canvasHeight = 1000;
        const canvasWidth = 300;
        var pitchPlot = d3.select(pitchPathPlot)
                                    .attr("height", canvasHeight)
                                    .attr("width", canvasWidth)

        var widthScale = d3.scaleLinear()
                            .domain([-3, 3])
                            .range([0,canvasWidth]);

        var heightScale = d3.scaleLinear()
                            .domain([19, -3])  
                            .range([0,canvasHeight]);                  


        var homePlate = pitchPlot.append("g").attr("id", "homePlate")
                                .selectAll("line")
                                .data(homePlateCorners)
                                .enter()
                                    .append("line")
                                    .attr("x1", function (d) { return widthScale(d[0])})
                                    .attr("y1", function (d) { return heightScale(d[1])})
                                    .attr("x2", function (d) { return widthScale(d[2])})
                                    .attr("y2", function (d) { return heightScale(d[3])})
                                    .attr("stroke", "blue")
                                    .attr("stroke-width", 3)
                                    .attr("transform", "translate(0, " + heightScale(19-0.6264) + ")"); // eyeballed diff between (0,0) and the back corner of home plate.

        var pitchersPlate = pitchPlot.append("g").attr("id", "pitchersPlate")
                                .selectAll("line")
                                .data(pitchersPlateCorners)
                                .enter()
                                    .append("line")
                                    .attr("x1", function (d) { return widthScale(d[0])})
                                    .attr("y1", function (d) { return heightScale(d[1])})
                                    .attr("x2", function (d) { return widthScale(d[2])})
                                    .attr("y2", function (d) { return heightScale(d[3])})
                                    .attr("stroke", "blue")
                                    .attr("stroke-width", 3)
                                    .attr("transform", "translate(0, " + heightScale(19-0.6264) + ")"); // eyeballed diff between (0,0) and the back corner of home plate.



        //create paths between points
        let ballPathNodes = [];
        let i:number = 0;
        while (i < plotData.length-1) {
            ballPathNodes.push(
                d3.linkHorizontal()({
                    source: [widthScale(plotData[i].x), heightScale(plotData[i].z)],
                    target: [widthScale(plotData[i+1].x), heightScale(plotData[i+1].z)],
                })
            )
            i += 1;
        }

        var ballPath = pitchPlot.append('g').attr('id', 'ballPath')
        for (let i = 0; i < ballPathNodes.length; i++) {
            pitchPlot
                .append('path')
                .attr('d', ballPathNodes[i])
                .attr('stroke', 'grey')
                .attr('fill', 'none');
        }

        var ballCoords = pitchPlot.append("g").attr("id", "ballCoordinates")
                                .selectAll("circle")
                                .data(plotData)
                                .enter()
                                    .append("circle")
                                    .attr("cx", function (d) { return widthScale(d.x)})
                                    .attr("cy", function (d) { return heightScale(d.z)})
                                    .attr("r", 2)
                                    .attr("fill", "red");
            
    })

    
</script>

<svg bind:this={pitchPathPlot} > 

</svg>