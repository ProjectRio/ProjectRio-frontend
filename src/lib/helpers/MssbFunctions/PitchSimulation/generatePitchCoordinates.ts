/*
-Set initial data
-Take inputs
-Call windup functions
-Calculate pitching stats
-Calculate physics constants
-Run pitch in air function
*/

import { initializeValues } from "./InitializeValues";
import { calculatePhysicsConstants } from "./calculatePhysicsConstants";
import { calcuatedPitchingStats } from "./calculatedPitchingStats";
import { pitchInAirFunction } from "./pitchInAirFunction";
import { defaultPitchingData } from "./pitchingConstants";

export function generatePitchCoordinates() {
      let pitchData = defaultPitchingData;

      const pitchInputs = {
            'chargeUp': 0.44,
            'curveInput': [0,0],//[0,0,0,0,0,0,0,0, 0,0,0,0,0,0,0,0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
            'pitchType': 1, //0 curve, 1 charge, 2 perfect charge, 3 changeup, 4 star
            'pitcher_id': 0,
            'pitcherStarsOn': false,
            'pitcherHandedness': 0,
            'pitcherXOnMound': 0,
            'pitchStartingX': -0.370488256,//-0.358750939,
            'pitchStartingY': 2.83268118,//2.9281559,
            'pitchStartingZ': 17.872982,//17.6997108,
            'pitcherStamina': 10,
            'batter_id': 21,
            'batZ': 1.7
      }

      pitchData = initializeValues(pitchInputs, pitchData);
      pitchData = calcuatedPitchingStats(pitchData);
      pitchData = calculatePhysicsConstants(pitchData);


      pitchData.calculatedPoints.pop(); // get rid of dummy data from the initialization
      pitchData.calculatedVelocity.pop(); // get rid of dummy data from the initialization
      pitchData.calculatedAtBatBallPosPoints.pop(); // get rid of dummy data from the initialization
      pitchData.calcedOutputs.pop();

      while (!pitchData.pitchDoneSimulating) {

            pitchData.calculatedPoints.push({X: pitchData.inMemPitcher.ballCurrentPosition.X, 
                  Y: pitchData.inMemPitcher.ballCurrentPosition.Y, 
                  Z: pitchData.inMemPitcher.ballCurrentPosition.Z});
            pitchData.calculatedVelocity.push({X: pitchData.inMemPitcher.ballVelocity.X, 
                        Y: pitchData.inMemPitcher.ballVelocity.Y, 
                        Z: pitchData.inMemPitcher.ballVelocity.Z})
            pitchData.calculatedAtBatBallPosPoints.push({X: pitchData.inMemBall.AtBat_Contact_BallPos.X, 
                  Y: pitchData.inMemBall.AtBat_Contact_BallPos.Y, 
                  Z: pitchData.inMemBall.AtBat_Contact_BallPos.Z});

            pitchData.calcedOutputs.push(
                  {
                        calculatedPoints: {
                              X: pitchData.inMemPitcher.ballCurrentPosition.X, 
                              Y: pitchData.inMemPitcher.ballCurrentPosition.Y, 
                              Z: pitchData.inMemPitcher.ballCurrentPosition.Z
                        },
                        calculatedVelocity: {
                              X: pitchData.inMemPitcher.ballVelocity.X, 
                              Y: pitchData.inMemPitcher.ballVelocity.Y, 
                              Z: pitchData.inMemPitcher.ballVelocity.Z
                        },
                        calculatedAtBatBallPosPoints: {
                              X: pitchData.inMemBall.AtBat_Contact_BallPos.X, 
                              Y: pitchData.inMemBall.AtBat_Contact_BallPos.Y, 
                              Z: pitchData.inMemBall.AtBat_Contact_BallPos.Z
                        },
                        pitchFrame: pitchData.pitchHangtimeCounter
                        
                  }
            )

            pitchData = pitchInAirFunction(pitchData);

            pitchData.pitchHangtimeCounter += 1;
      }
      
      return pitchData;
}