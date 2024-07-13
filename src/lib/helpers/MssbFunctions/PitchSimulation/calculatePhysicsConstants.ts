import * as c from "./pitchingConstants";
import { randBetween, RandomInt_Game } from "../mssbHelpers";

// @ts-ignore
export function calculatePhysicsConstants(dt) { //806b17fc
      let pitchSubType = dt.inMemPitcher.pitchSubType;
      let frameCounter = 1;
      let currentFrameCount;
      let halfFramesToPlate;
      let uVar1;
      let halfWayToThePlate;

      let controlStickInputs = [0]; //placeholder for now
      dt.inMemPitcher.ballVelocity.Z = -(dt.inMemPitcher.calced_pitchSpeed / dt.inMemPitcher.pitchSpeedScaler);
      let loopCounter = 0xfffe;
      dt.inMemPitcher.moundZ = 18.44;
      dt.inMemPitcher.pitchZ_whenAirResistanceStarts = (18.44 * (100 - c.pitchConstantsArray[pitchSubType][4])) / 100;
      dt.inMemPitcher.ballVelocity.X =
           -(((dt.inMemPitcher.pitchTarget.X - dt.inMemPitcher.ballCurrentPosition.X) *
             dt.inMemPitcher.ballVelocity.Z) /
            (dt.inMemPitcher.ballCurrentPosition.Z - dt.inMemPitcher.pitchTarget.Z));
      dt.inMemPitcher.ballVelocity.Y =
           -(((dt.inMemPitcher.pitchTarget.Y - dt.inMemPitcher.ballCurrentPosition.Y) *
             dt.inMemPitcher.ballVelocity.Z) /
            (dt.inMemPitcher.ballCurrentPosition.Z - dt.inMemPitcher.pitchTarget.Z));
      dt.inMemPitcher.airResistance_veloAdj = 0.001 * c.pitchConstantsArray[pitchSubType][3];
      let ballZ = dt.inMemPitcher.ballCurrentPosition.Z;
      let pitchVelo = dt.inMemPitcher.ballVelocity.Z;
      do {
                        // If ball is in the controllable zone, and the has control variable still is
                           //false, then set to true. 
        if ((ballZ <= 18.44) && (dt.inMemPitcher.pitchInAirInd == false)) {
          dt.inMemPitcher.pitchInAirInd = true;
        }
                        // if pitch has been thrown 
        if (ballZ <= dt.inMemPitcher.pitchZ_whenAirResistanceStarts) {
          if (dt.inMemPitcher.frameBallCanStartBeingControlled == -1) {
            dt.inMemPitcher.frameBallCanStartBeingControlled = frameCounter;
          }
          halfFramesToPlate = -(pitchVelo * dt.inMemPitcher.airResistance_veloAdj - pitchVelo);
          if (halfFramesToPlate < -0.05) {
            pitchVelo = halfFramesToPlate;
          }
        }
        pitchVelo = pitchVelo * dt.inMemPitcher.decelerationFactor;
        ballZ = ballZ + pitchVelo;
        currentFrameCount = frameCounter;
        if (ballZ <= dt.inMemPitcher.pitchTarget.Z) break;
        frameCounter = frameCounter + 1;
        loopCounter = loopCounter + -1;
        currentFrameCount = dt.inMemPitcher.frameWhenUnhittable;
      } while (loopCounter != 0);
      dt.inMemPitcher.frameWhenUnhittable = currentFrameCount;
                        // Sets the parabolic path of the pitch. 
      dt.inMemPitcher.verticalGlobalParabolicVelo = c.pitchConstantsArray[pitchSubType][5] ;
      if ((dt.inMemPitcher.captainStarPitchThrown == c.yoshiStarPitch) ||
         (dt.inMemPitcher.captainStarPitchThrown == c.birdoStarPitch)) {
        uVar1 = randBetween(0x37,0x3c, dt.StaticRandomInt1, dt.StaticRandomInt2, dt.TotalframesAtPlay);
        dt.inMemPitcher.verticalGlobalParabolicVelo = uVar1;
      }
      halfWayToThePlate = dt.inMemPitcher.frameWhenUnhittable  * 0.5;
      dt.inMemPitcher.horizontalGlobalParabolicVelo = c.pitchConstantsArray[pitchSubType][6];
                        // Sets vertical adjustment as the ende of the parabola. 
      dt.inMemPitcher.verticalOffsetParabolaMidpoint = (halfWayToThePlate * dt.inMemPitcher.verticalGlobalParabolicVelo * halfWayToThePlate) / 10000.0;
      if (dt.inMemPitcher.handedness != 0) {
        dt.inMemPitcher.horizontalGlobalParabolicVelo = -dt.inMemPitcher.horizontalGlobalParabolicVelo;
      }
      halfFramesToPlate = dt.inMemPitcher.frameWhenUnhittable * 0.5;
                        // Sets the starting horizontal adjustment based on the end of the frame by
                           //frame adjustment parabola. 
      dt.inMemPitcher.horizontalOffsetParabolaMidpoint = (halfFramesToPlate * dt.inMemPitcher.horizontalGlobalParabolicVelo * halfFramesToPlate) / 10000.0;
                        // Set wario and walu's left or right for their star pitch. 1 left, 0 right 
      if ((dt.inMemPitcher.captainStarPitchThrown == c.warioStarPitch) ||
         (dt.inMemPitcher.captainStarPitchThrown == c.waluigiStarPitch)) {
        if (dt.inMemPitcher.AIInd == 0) {
          if ((controlStickInputs[0]) == 0) {
            if ((controlStickInputs[0]) == 0) {
              loopCounter = RandomInt_Game(2, dt.StaticRandomInt1, dt.StaticRandomInt2, dt.TotalframesAtPlay);
              dt.inMemPitcher.warioWaluStarPitchRightLeft = loopCounter;
            }
            else {
              dt.inMemPitcher.warioWaluStarPitchRightLeft = 1;
            }
          }
          else {
            dt.inMemPitcher.warioWaluStarPitchRightLeft = 0;
          }
        }
        else {
          loopCounter = RandomInt_Game(2, dt.StaticRandomInt1, dt.StaticRandomInt2, dt.TotalframesAtPlay);
          dt.inMemPitcher.warioWaluStarPitchRightLeft = loopCounter;
        }
      }
      uVar1 = dt.inMemPitcher.captainStarPitchThrown;
      if ((uVar1 == 7) || (uVar1 == 8)) {
        let boswer0Jr1 = uVar1 - 7;
        dt.inMemPitcher.bulletPitchLoopFrames =
             randBetween(c.bulletBallConstants[boswer0Jr1][0],c.bulletBallConstants[boswer0Jr1][1], dt.StaticRandomInt1, dt.StaticRandomInt2, dt.TotalframesAtPlay);
        dt.inMemPitcher.bulletPitchLoopStartingFrame =
             randBetween(c.bulletBallConstants[boswer0Jr1][2],c.bulletBallConstants[boswer0Jr1][3], dt.StaticRandomInt1, dt.StaticRandomInt2, dt.TotalframesAtPlay);
        dt.inMemPitcher.frameWhenUnhittable =
             dt.inMemPitcher.frameWhenUnhittable + dt.inMemPitcher.bulletPitchLoopFrames;
      }
      return dt;
    }