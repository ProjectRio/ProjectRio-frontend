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
            'chargeUp': 0,
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
      }

      pitchData = initializeValues(pitchInputs, pitchData);
      pitchData = calcuatedPitchingStats(pitchData);
      pitchData = calculatePhysicsConstants(pitchData);


      pitchData.calculatedPoints.pop(); // get rid of dummy data from the initialization
      pitchData.calculatedVelocity.pop(); // get rid of dummy data from the initialization

      while (!pitchData.pitchDoneSimulating) {
            pitchData = pitchInAirFunction(pitchData);

            pitchData.calculatedPoints.push({X: pitchData.inMemPitcher.ballCurrentPosition.X, 
                  Y: pitchData.inMemPitcher.ballCurrentPosition.Y, 
                  Z: pitchData.inMemPitcher.ballCurrentPosition.Z});
            pitchData.calculatedVelocity.push({X: pitchData.inMemPitcher.ballVelocity.X, 
                        Y: pitchData.inMemPitcher.ballVelocity.Y, 
                        Z: pitchData.inMemPitcher.ballVelocity.Z})

            console.log(pitchData.pitchFrames)
            pitchData.pitchFrames += 1;
      }
      
      return pitchData;
}