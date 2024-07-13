import { randomInRange } from "../mssbHelpers";
import * as c from "./pitchingConstants";

// @ts-ignore
export function initializeValues(pInputs, dt) {
      // roughly imitates 806b31bc and 806b21a0
      dt.inMemPitcher.charID = pInputs["pitcher_id"]
      dt.inMemPitcher.handedness = pInputs.pitcherHandedness;
      dt.inMemPitcher.charClass = c.stats[dt.inMemPitcher.charID]["Character Class"];
      dt.inMemPitcher.AIInd = 0;
      dt.curveInput = pInputs.curveInput;
      dt.StaticRandomInt1 = Math.floor(Math.random() * 5000)
      dt.StaticRandomInt2 = Math.floor(Math.random() * 5000)
      dt.TotalframesAtPlay = Math.floor(Math.random() * 500)

      // Set pitcher stats
      dt.inMemPitcher.cursedBallStat = c.stats[dt.inMemPitcher.charID]['Cursed Ball'];
      dt.inMemPitcher.curveControlStat = c.stats[dt.inMemPitcher.charID]["Curve Control"];
      dt.inMemPitcher.curveStat = c.stats[dt.inMemPitcher.charID]["Curve"];
      dt.inMemPitcher.fastBallSpeed = c.stats[dt.inMemPitcher.charID]["Fast Ball Speed"];
      dt.inMemPitcher.curveBallSpeed = c.stats[dt.inMemPitcher.charID]["Curve Ball Speed"];

      if (pInputs.pitcherStarsOn) {
            dt.inMemPitcher.cursedBallStat = Math.min(dt.inMemPitcher.cursedBallStat + 50, 100)
            dt.inMemPitcher.curveControlStat = dt.inMemPitcher.curveControlStat + 50 // no max for this stat
            dt.inMemPitcher.curveStat = Math.min(dt.inMemPitcher.curveStat + 50, 100)
            dt.inMemPitcher.fastBallSpeed = Math.min(dt.inMemPitcher.fastBallSpeed + 20, 200)
            dt.inMemPitcher.curveBallSpeed = Math.min(dt.inMemPitcher.curveBallSpeed + 20, 200)
      }

      // Set pitch type variables
      dt.inMemPitcher.captainStarPitchThrown = 0;
      dt.inMemPitcher.nonCapStarPitchThrown = 0;
      dt.inMemPitcher.ChargePitchType = 0;
      if (pInputs.pitchType == 0) { //curve
        dt.inMemPitcher.pitchType = c.pitchType_Curve;
        dt.inMemPitcher.pitchSubType = c.pitchSubType_CurveCharge;
    
      } else if (pInputs.pitchType == 1) { //charge
        dt.inMemPitcher.pitchType = c.pitchType_Charge;
        dt.inMemPitcher.pitchSubType = c.pitchSubType_CurveCharge;  
        dt.inMemPitcher.ChargePitchType = 2; 
    
      } else if (pInputs.pitchType == 2) { // perfect charge
        dt.inMemPitcher.pitchType = c.pitchType_Charge;
        dt.inMemPitcher.pitchSubType = c.pitchSubType_CurveCharge;   
        dt.inMemPitcher.ChargePitchType = 3; 
    
      } else if (pInputs.pitchType == 3) { // change up
        dt.inMemPitcher.pitchType = c.pitchType_ChangeUp;
        dt.inMemPitcher.pitchSubType = c.pitchSubType_ChangeUp;  
    
      } else if (pInputs.pitchType == 4) { // star
        if (c.stats[dt.inMemPitcher.charID]["Can Be Captain"] == 1) {
          dt.inMemPitcher.captainStarPitchThrown = c.stats[dt.inMemPitcher.charID]["Captain Star Hit/Pitch"];
          dt.inMemPitcher.pitchSubType = dt.inMemPitcher.captainStarPitchThrown + 3;
          dt.inMemPitcher.pitchType = (([4, 5, 10, 11].includes(dt.inMemPitcher.pitchSubType)) ? c.pitchType_Charge : c.pitchType_Curve)
    
        } else {
          dt.inMemPitcher.nonCapStarPitchThrown = c.stats[dt.inMemPitcher.charID]["Non Captain Star Pitch"]
          dt.inMemPitcher.pitchType = c.pitchType_Curve;
          dt.inMemPitcher.pitchSubType = dt.inMemPitcher.nonCapStarPitchThrown + 15;
        }
      }
    
      dt.inMemBatter.batPosition.Y = c.BatterHitbox[pInputs.batter_id].PitchingHeight * c.BatterHitboxMultiplier[pInputs.batter_id][0]; 
      dt.inMemBatter.batPosition.Z = pInputs.batZ; 
      dt.inMemPitcher.pitchTarget.Y = dt.inMemBatter.batPosition.Y;

      dt.inMemPitcher.pitcherX = pInputs.pitcherXOnMound;
      dt.inMemPitcher.pitchTarget.X = dt.inMemPitcher.pitcherX;
      if ((dt.inMemPitcher.captainStarPitchThrown == c.waluigiStarPitch) ||
            (dt.inMemPitcher.captainStarPitchThrown == c.waluigiStarPitch)) {
            dt.inMemPitcher.pitchTarget.X = 0;
      }
      else if ((dt.inMemPitcher.captainStarPitchThrown == c.yoshiStarPitch) ||
                  (dt.inMemPitcher.captainStarPitchThrown == c.birdoStarPitch)) {
            let dVar2 
            [dVar2, dt.StaticRandomInt1, dt.StaticRandomInt2, dt.TotalframesAtPlay] = randomInRange(-1, 1, dt.StaticRandomInt1, dt.StaticRandomInt2, dt.TotalframesAtPlay);
            dt.inMemPitcher.pitchTarget.X = dVar2;
            dt.inMemPitcher.pitchTarget.Y = 0.35;
            [dVar2, dt.StaticRandomInt1, dt.StaticRandomInt2, dt.TotalframesAtPlay] = randomInRange(7, 9, dt.StaticRandomInt1, dt.StaticRandomInt2, dt.TotalframesAtPlay);
            
            dt.inMemPitcher.pitchTarget.Z = dVar2;
      }
      dt.inMemPitcher.pitchChargeUp = pInputs.chargeUp;
    
      dt.inMemPitcher.Stamina = ((isNaN(pInputs.pitcherStamina)) ? 10 : pInputs.pitcherStamina);

      // pitch release (get from stat file)
      if (isNaN(pInputs.pitchStartingX)) {
            dt.inMemPitcher.pitchRelease.X = -0.358750939;
      } else {
            dt.inMemPitcher.pitchRelease.X = pInputs.pitchStartingX;
      }
      
      if (isNaN(pInputs.pitchStartingY)) {
            dt.inMemPitcher.pitchRelease.Y = 2.9281559;
      } else {
            dt.inMemPitcher.pitchRelease.Y = pInputs.pitchStartingY;
      }
      
      if (isNaN(pInputs.pitchStartingZ)) {
            dt.inMemPitcher.pitchRelease.Z = 17.6997108;
      } else {
            dt.inMemPitcher.pitchRelease.Z = pInputs.pitchStartingZ;
      }

      dt.inMemPitcher.pitchZ_whenPitchSpecificResistanceStarts = 18.44 * (100 - c.pitchConstantsArray[dt.inMemPitcher.pitchSubType][4]) / 100;
      dt.inMemPitcher.pitchSpecific_VeloAdj = 0.001 * c.pitchConstantsArray[dt.inMemPitcher.pitchSubType][3];
      
      dt.inMemPitcher.ballCurrentPosition.X = dt.inMemPitcher.pitchRelease.X;
      dt.inMemPitcher.ballCurrentPosition.Y = dt.inMemPitcher.pitchRelease.Y;
      dt.inMemPitcher.ballCurrentPosition.Z = dt.inMemPitcher.pitchRelease.Z;
      
      dt.inMemBall.AtBat_Contact_BallPos.X = dt.inMemPitcher.pitchRelease.X;
      dt.inMemBall.AtBat_Contact_BallPos.Y = dt.inMemPitcher.pitchRelease.Y;
      dt.inMemBall.AtBat_Contact_BallPos.Z = dt.inMemPitcher.pitchRelease.Z;

      return dt;
}