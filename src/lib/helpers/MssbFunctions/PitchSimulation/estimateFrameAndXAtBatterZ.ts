// @ts-ignore
export function estimateXAndFrameAtBatterZ(batZ, /**varToUpdate,*/ considerCurveInd, dt)

{
  let ballX_stored;
  let ballZ_stored;
  let frames = 0;
  let veloX = dt.inMemPitcher.ballVelocity.X;
  let veloZ = dt.inMemPitcher.ballVelocity.Z;
  if (dt.inMemPitcher.ballCurrentPosition.Z < batZ) {
    return {framesUntilBat: frames, dataStruct: dt};
  }
  let ballZ = dt.inMemPitcher.ballCurrentPosition.Z;
  let ballX = dt.inMemPitcher.ballCurrentPosition.X;
  do {
    ballX_stored = ballX;
    ballZ_stored = ballZ;
    frames = frames + 1;
    if ((ballZ_stored <= dt.inMemPitcher.pitchZ_whenAirResistanceStarts) &&
       (ballZ = -(veloZ * dt.inMemPitcher.airResistance_veloAdj - veloZ),
       ballZ < -0.05)) {
      veloX = -(veloX * dt.inMemPitcher.airResistance_veloAdj - veloX);
      veloZ = ballZ;
    }
    veloX = (veloX * dt.inMemPitcher.decelerationFactor);
    veloZ = (veloZ * dt.inMemPitcher.decelerationFactor);
    ballX = (ballX_stored + veloX);
    ballZ = (ballZ_stored + veloZ);
    if (considerCurveInd == 1) {
      ballX = (ballX + dt.inMemPitcher.pitchCurveVeloV1);
    }
  } while (batZ <= ballZ);
  
  
  let estimatedFinalX = ballX_stored + ((ballX - ballX_stored) * (1.0 - (ballZ - batZ) / (ballZ - ballZ_stored)));
  if (considerCurveInd == 0) {
    dt.inMemPitcher.pitchEstimatedEndX_withoutCurve = estimatedFinalX
  } else if (considerCurveInd == 1) {
    dt.inMemPitcher.pitchEstimatedEndX_withCurve = estimatedFinalX
  } else if (considerCurveInd == 2) {
    // nothing, this is for egg balls.
  }

  return {framesUntilBat: frames, dataStruct: dt};
}
