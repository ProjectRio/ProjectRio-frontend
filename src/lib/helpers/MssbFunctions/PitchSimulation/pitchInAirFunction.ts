
import { LinearInterpolateToNewRange, randBetween, randomInRange } from "../mssbHelpers";
import { estimateXAndFrameAtBatterZ } from "./estimateFrameAndXAtBatterZ";
import { pitchCurve } from "./pitchCurve";
import * as c from "./pitchingConstants";

// @ts-ignore
export function pitchInAirFunction(dt) { // 806b02dc
      /*uVar3 = 0;*/
      let frameWhenUnhittable;
      let local_50;
      let local_98;
      let adjustedVelo;
      let framesUntilPitchGetsToBatter;
      let uStack84;
      let framesUntilPitchGetsToBatter2;
      let halfFramesUntilPitchGetsToBatter;
      let framesUntilBallReachesBatterZ;
      let halfFramesToBatter;
      let pitchFramesSinceLatestBounce;
      let loopFrames;
      let loopAngle
      let local_94;
      let local_90;
      let veloAdj;
      let pitchVelo;
      let someAngle;
      let pitchVelo2;
      let starType;   
      let sin_angle; 
      let groundYThreshold;
      let calced_pitchSpeed;
      let RNG1;
      let rng2;
      let rng3;      
      let rng4;
      let returnVal = {};


      if (dt.inMemPitcher.pitchBounceCounter != 0) {
        dt.inMemPitcher.pitchFramesSinceLatestBounce = dt.inMemPitcher.pitchFramesSinceLatestBounce + 1;
      }
      dt.inMemPitcher.ballLastPosition.X = dt.inMemPitcher.ballCurrentPosition.X;
      dt.inMemPitcher.ballLastPosition.Y = dt.inMemPitcher.ballCurrentPosition.Y;
      dt.inMemPitcher.ballLastPosition.Z = dt.inMemPitcher.ballCurrentPosition.Z;
      dt.inMemBall.pastCoordinates.Y = dt.inMemBall.AtBat_Contact_BallPos.Y; //added this line manually since it's needed lower down
    
    
      //removed wall ball section
      //The following logic has been modified from the original code to workaround a goto jump from the decomp.
      if ((dt.inMemPitcher.captainStarPitchThrown == c.bowserStarPitch) || (dt.inMemPitcher.captainStarPitchThrown == c.bJStarPitch)) {
        if ((dt.inMemPitcher.bulletPitchLoopStartingFrame <= dt.pitchHangtimeCounter) && (dt.inMemPitcher.bulletPitchStageCode == 0)) {
          dt.inMemPitcher.bulletPitchStageCode = 1;
        }
      } 
      if (((dt.inMemPitcher.captainStarPitchThrown == c.bowserStarPitch) || (dt.inMemPitcher.captainStarPitchThrown == c.bJStarPitch)) &&
          (dt.inMemPitcher.bulletPitchStageCode == 1)) {
        /*if ((dt.inMemPitcher.bulletPitchLoopStartingFrame <= pitchHangtimeCounter) && (dt.inMemPitcher.bulletPitchStageCode == 0)) {
          dt.inMemPitcher.bulletPitchStageCode = 1;
        }
        if (dt.inMemPitcher.bulletPitchStageCode != 1) goto skipBulletCode; //<-the replaced goto*/
        dt.inMemPitcher.bulletPitch_loopFrameCounter = dt.inMemPitcher.bulletPitch_loopFrameCounter + 1;
        loopFrames = dt.inMemPitcher.bulletPitch_loopFrameCounter;
        if (loopFrames < dt.inMemPitcher.bulletPitchLoopFrames) {
          loopAngle = (loopFrames / dt.inMemPitcher.bulletPitchLoopFrames ) * 2*Math.PI + Math.PI;
          /*getSinAndCosOfAngle(loopAngle,&cos,&sin);*/
          local_94 = Math.cos(loopAngle);
          local_90 = Math.sin(loopAngle);
          veloAdj = c.bulletBallConstants[dt.inMemPitcher.captainStarPitchThrown - 7][4];
          dt.inMemPitcher.starPitchAdjustment.X = 0;
          dt.inMemPitcher.bulletPitchLoopAngleRadians = loopAngle;
          pitchVelo = 0.01 * veloAdj;
          dt.inMemPitcher.starPitchAdjustment.Y = local_94 * pitchVelo + pitchVelo;
          dt.inMemPitcher.starPitchAdjustment.Z = local_90 * pitchVelo;
        }
        else {
          dt.inMemPitcher.bulletPitchStageCode = 2;
        }
      }
      else {
                        /* Pitch-specific air resistance.
                           If ball is past the threshold where resistance starts, apply resistance to
                           each velo variable.
                           Curve and charge is 1.5% resistance each frame. Change up is 3%. 
                           Unknown pitch type 2 adds 0.5% each frame. */
        if ((dt.inMemPitcher.ballCurrentPosition.Z <= dt.inMemPitcher.pitchZ_whenPitchSpecificResistanceStarts)
           && (adjustedVelo = -(dt.inMemPitcher.ballVelocity.Z * dt.inMemPitcher.pitchSpecific_VeloAdj - dt.inMemPitcher.ballVelocity.Z),
              adjustedVelo < -0.05)) {
          dt.inMemPitcher.ballVelocity.X = -(dt.inMemPitcher.ballVelocity.X * dt.inMemPitcher.pitchSpecific_VeloAdj - dt.inMemPitcher.ballVelocity.X);
          dt.inMemPitcher.ballVelocity.Y = -(dt.inMemPitcher.ballVelocity.Y * dt.inMemPitcher.pitchSpecific_VeloAdj - dt.inMemPitcher.ballVelocity.Y);
          dt.inMemPitcher.ballVelocity.Z = adjustedVelo;
        }
        if (dt.inMemPitcher.ballCurrentPosition.Z <= dt.inMemPitcher.pitchZ_whenPitchSpecificResistanceStarts) {
          adjustedVelo = -(dt.inMemPitcher.ballVelocity.Z * dt.inMemPitcher.pitchSpecific_VeloAdj - dt.inMemPitcher.ballVelocity.Z);
            if (adjustedVelo < -0.05) {
              dt.inMemPitcher.ballVelocity.X = -(dt.inMemPitcher.ballVelocity.X * dt.inMemPitcher.pitchSpecific_VeloAdj - dt.inMemPitcher.ballVelocity.X);
              dt.inMemPitcher.ballVelocity.Y = -(dt.inMemPitcher.ballVelocity.Y * dt.inMemPitcher.pitchSpecific_VeloAdj - dt.inMemPitcher.ballVelocity.Y);
              dt.inMemPitcher.ballVelocity.Z = adjustedVelo;
            }
        }
       
        dt = pitchCurve(dt);
                        /* Pitch slows down by 2% each frame. */
        dt.inMemPitcher.ballVelocity.X = dt.inMemPitcher.ballVelocity.X * dt.inMemPitcher.decelerationFactor;
        dt.inMemPitcher.ballVelocity.Y = dt.inMemPitcher.ballVelocity.Y * dt.inMemPitcher.decelerationFactor;
        dt.inMemPitcher.ballVelocity.Z = dt.inMemPitcher.ballVelocity.Z * dt.inMemPitcher.decelerationFactor;
                        /* Sets parabolic vertical movement of pitch. */
        if ((dt.inMemPitcher.captainStarPitchThrown == c.yoshiStarPitch) || (dt.inMemPitcher.captainStarPitchThrown == c.birdoStarPitch)) {
          if (dt.inMemPitcher.pitchBounceCounter == 0) {
            frameWhenUnhittable = dt.inMemPitcher.frameWhenUnhittable;
            local_50 = dt.pitchHangtimeCounter;
            local_98 = -(frameWhenUnhittable * 0.5 - local_50);
            dt.inMemPitcher.pitchY_parabolicAdjustment = dt.inMemPitcher.verticalOffsetParabolaMidpoint - (local_98 * dt.inMemPitcher.verticalGlobalParabolicVelo * local_98) / 10000;
          }
          else if ((dt.inMemPitcher.pitchBounceCounter == 1) || (dt.inMemPitcher.pitchBounceCounter == 2)) {
            if (dt.inMemPitcher.pitchFramesSinceLatestBounce == 1) {
              if (dt.inMemPitcher.pitchBounceCounter == 1) {
                  //changed last parameter from 0 to 2 to differentiate it from the other function calls and remove the pointer variable. The function itself was edited to handle this.
                returnVal = estimateXAndFrameAtBatterZ(dt.inMemPitcher.eggBounceRelated,/*local_98,*/2, dt);  
                // @ts-ignore
                framesUntilPitchGetsToBatter = returnVal.framesUntilBat;
                // @ts-ignore
                dt = returnVal.dataStruct
                framesUntilPitchGetsToBatter2 = framesUntilPitchGetsToBatter;
                halfFramesUntilPitchGetsToBatter = (framesUntilPitchGetsToBatter2 * 0.5);
                /*local_50 = halfFramesUntilPitchGetsToBatter;*/
                dt.inMemPitcher.ballBouncePeakZFrame = halfFramesUntilPitchGetsToBatter;
                uStack84 = LinearInterpolateToNewRange(dt.inMemPitcher.calced_pitchSpeed,70,90,35,45) 
                /*uStack84 = uStack84 ^ 0x80000000;
                local_58 = 0x43300000;*/
                dt.inMemPitcher.verticalGlobalParabolicVelo = uStack84;
                halfFramesToBatter = dt.inMemPitcher.ballBouncePeakZFrame;
                dt.inMemPitcher.verticalOffsetParabolaMidpoint = ((halfFramesToBatter) * dt.inMemPitcher.verticalGlobalParabolicVelo * (halfFramesToBatter)) / 10000;
              }
              else {
                framesUntilBallReachesBatterZ = dt.inMemPitcher.framesUntilBallReachesBatterZ;
                dt.inMemPitcher.verticalOffsetParabolaMidpoint = 0.3 + 0.7;
                dt.inMemPitcher.ballBouncePeakZFrame = dt.inMemPitcher.framesUntilBallReachesBatterZ;
                dt.inMemPitcher.verticalGlobalParabolicVelo = (10000 * dt.inMemPitcher.verticalOffsetParabolaMidpoint) / (framesUntilBallReachesBatterZ * framesUntilBallReachesBatterZ);
              }
            }
            pitchFramesSinceLatestBounce = dt.inMemPitcher.pitchFramesSinceLatestBounce ;
            halfFramesToBatter = dt.inMemPitcher.ballBouncePeakZFrame;
            local_98 = pitchFramesSinceLatestBounce - halfFramesToBatter;
            dt.inMemPitcher.pitchY_parabolicAdjustment = dt.inMemPitcher.verticalOffsetParabolaMidpoint - (local_98 * dt.inMemPitcher.verticalGlobalParabolicVelo * local_98) / 10000;
          }
          else {
            dt.inMemPitcher.pitchY_parabolicAdjustment = 0;
          }
        }
        else if (dt.inMemPitcher.cancelCurveAndParabolicAdjInd == 0) {
          frameWhenUnhittable = dt.inMemPitcher.frameWhenUnhittable;
          local_98 = -(frameWhenUnhittable * 0.5 - dt.pitchHangtimeCounter);
          dt.inMemPitcher.pitchY_parabolicAdjustment = dt.inMemPitcher.verticalOffsetParabolaMidpoint - (local_98 * dt.inMemPitcher.verticalGlobalParabolicVelo * local_98) / 10000;
        }
        else {
          dt.inMemPitcher.pitchY_parabolicAdjustment = 0;
        }
                        /* Sets parabolic horizontal path of ball. Only banana star pitches have
                           constants that actually impact this. */
        if (dt.inMemPitcher.cancelCurveAndParabolicAdjInd == 0) {
          frameWhenUnhittable = dt.inMemPitcher.frameWhenUnhittable;
          pitchVelo = -(dt.inMemPitcher.frameWhenUnhittable * 0.5 - dt.pitchHangtimeCounter)
          dt.inMemPitcher.pitchX_parabolicAdjustment = dt.inMemPitcher.horizontalOffsetParabolaMidpoint - (pitchVelo * dt.inMemPitcher.horizontalGlobalParabolicVelo * pitchVelo) / 10000;
        }
        else {
          dt.inMemPitcher.pitchX_parabolicAdjustment = 0;
        }
        dt.inMemPitcher.ballVelocity.X = dt.inMemPitcher.ballVelocity.X + dt.inMemPitcher.pitchCurveVelo;
        dt.inMemPitcher.ballCurrentPosition.Y = dt.inMemPitcher.ballCurrentPosition.Y + dt.inMemPitcher.ballVelocity.Y;
        dt.inMemPitcher.ballCurrentPosition.X = dt.inMemPitcher.ballCurrentPosition.X + dt.inMemPitcher.ballVelocity.X;
        dt.inMemPitcher.ballCurrentPosition.Z = dt.inMemPitcher.ballCurrentPosition.Z + dt.inMemPitcher.ballVelocity.Z;
      }
    
                        /* Assign the global ball location based on stored pitch location plus parabolic
                           offset. */
      dt.inMemBall.AtBat_Contact_BallPos.X = dt.inMemPitcher.ballCurrentPosition.X + dt.inMemPitcher.pitchX_parabolicAdjustment;
      dt.inMemBall.AtBat_Contact_BallPos.Y = dt.inMemPitcher.ballCurrentPosition.Y + dt.inMemPitcher.pitchY_parabolicAdjustment;
      dt.inMemBall.AtBat_Contact_BallPos.Z = dt.inMemPitcher.ballCurrentPosition.Z;
      if (((dt.inMemPitcher.captainStarPitchThrown == c.bowserStarPitch) || (dt.inMemPitcher.captainStarPitchThrown == c.bJStarPitch)) && 
           (dt.inMemPitcher.bulletPitchStageCode == 1)) {
        dt.inMemBall.AtBat_Contact_BallPos.X = dt.inMemBall.AtBat_Contact_BallPos.X + dt.inMemPitcher.starPitchAdjustment.X;
        dt.inMemBall.AtBat_Contact_BallPos.Y = dt.inMemBall.AtBat_Contact_BallPos.Y + dt.inMemPitcher.starPitchAdjustment.Y;
        dt.inMemBall.AtBat_Contact_BallPos.Z = dt.inMemPitcher.ballCurrentPosition.Z + dt.inMemPitcher.starPitchAdjustment.Z;
      }
      if (dt.inMemPitcher.captainStarPitchThrown == c.warioStarPitch) {
        if (0 <= 17 - dt.inMemBall.AtBat_Contact_BallPos.Z) {
          dt.inMemPitcher.starPitchAdjustment.X = 0.4 * ((17 - dt.inMemBall.AtBat_Contact_BallPos.Z) / 17);
          if (dt.inMemPitcher.warioWaluStarPitchRightLeft != 0) {
            dt.inMemPitcher.starPitchAdjustment.X = -dt.inMemPitcher.starPitchAdjustment.X;
          }
          dt.inMemBall.AtBat_Contact_BallPos.X = dt.inMemBall.AtBat_Contact_BallPos.X + dt.inMemPitcher.starPitchAdjustment.X;
          /*if (dt.inMemPitcher.warioWaluSoundPlayedInd == 0) {
            Sound::PlaySoundEffect(warioWaluStarPitch);
          }*/
          dt.inMemPitcher.warioWaluStarPitch_occilationStage = 1;
          if (dt.inMemBall.AtBat_Contact_BallPos.Z < 3) {
            dt.inMemPitcher.warioWaluStarPitch_occilationStage = 2;
          }
          //dt.inMemPitcher.warioWaluSoundPlayedInd = dt.inMemPitcher.warioWaluSoundPlayedInd + 1;
        }
      }
      else if ((dt.inMemPitcher.captainStarPitchThrown == c.waluigiStarPitch) &&
              (0 <= 17 - dt.inMemBall.AtBat_Contact_BallPos.Z)) {
        someAngle = (17 - dt.inMemBall.AtBat_Contact_BallPos.Z) / 17;
        pitchVelo2 = (0.4 * someAngle);
        if (1 < someAngle) {
          someAngle = 1;
        }
        sin_angle = Math.sin(4.712389 * someAngle);
        dt.inMemPitcher.starPitchAdjustment.X = ((2 * pitchVelo2) * -sin_angle + -pitchVelo2);
        if (dt.inMemPitcher.warioWaluStarPitchRightLeft != 0) {
          dt.inMemPitcher.starPitchAdjustment.X = -dt.inMemPitcher.starPitchAdjustment.X;
        }
        dt.inMemBall.AtBat_Contact_BallPos.X = dt.inMemBall.AtBat_Contact_BallPos.X + dt.inMemPitcher.starPitchAdjustment.X;
        /*if (dt.inMemPitcher.warioWaluSoundPlayedInd == 0) {
          Sound::PlaySoundEffect(warioWaluStarPitch);
        }*/
        dt.inMemPitcher.warioWaluStarPitch_occilationStage = 1;
        if (dt.inMemBall.AtBat_Contact_BallPos.Z < 3) {
          dt.inMemPitcher.warioWaluStarPitch_occilationStage = 2;
        }
        dt.inMemPitcher.warioWaluSoundPlayedInd = dt.inMemPitcher.warioWaluSoundPlayedInd + 1;
      }
      starType = dt.inMemPitcher.captainStarPitchThrown;
      //removed section relating to Peach and Daisy star pitch animations
                        /* Seems like yoshi and burdo star pitches have different ground thresholds. */
      groundYThreshold = 0.15;
      if (dt.inMemPitcher.captainStarPitchThrown == c.yoshiStarPitch) {
         groundYThreshold = 0.15
        } else if (dt.inMemPitcher.captainStarPitchThrown == c.birdoStarPitch) {
        groundYThreshold = 0.35;
      }
                        /* If the ball touches the ground. */
      if (dt.inMemBall.AtBat_Contact_BallPos.Y < groundYThreshold) {
        if (((dt.inMemPitcher.captainStarPitchThrown == c.yoshiStarPitch) ||
            (dt.inMemPitcher.captainStarPitchThrown == c.birdoStarPitch)) &&
           ((dt.inMemPitcher.pitchBounceCounter == 0 || (dt.inMemPitcher.pitchBounceCounter == 1)))) {
          if (dt.inMemPitcher.pitchBounceCounter == 0) {
            [rng2, dt.StaticRandomInt1, dt.StaticRandomInt2, dt.TotalframesAtPlay] = randomInRange(-1, 1, dt.StaticRandomInt1, dt.StaticRandomInt2, dt.TotalframesAtPlay);
            dt.inMemPitcher.pitchStartingXPosition = rng2;
            dt.inMemPitcher.bat_y_coord = 0.35;
            [rng3, dt.StaticRandomInt1, dt.StaticRandomInt2, dt.TotalframesAtPlay] = randomInRange(3,5, dt.StaticRandomInt1, dt.StaticRandomInt2, dt.TotalframesAtPlay);
                        dt.inMemPitcher.eggBounceRelated = rng3;
            dt.inMemPitcher.zUnhittableThreshold = 0.5 * (rng3 + dt.inMemPitcher.zUnhittableThreshold);
          }
          else {
            [rng4, dt.StaticRandomInt1, dt.StaticRandomInt2, dt.TotalframesAtPlay] = randomInRange(-0.3, 0.3, dt.StaticRandomInt1, dt.StaticRandomInt2, dt.TotalframesAtPlay);
            dt.inMemPitcher.pitchStartingXPosition = rng4;
            dt.inMemPitcher.bat_y_coord = 0.35;
            dt.inMemPitcher.zUnhittableThreshold = 0.775;
          }
          dt.inMemPitcher.calced_pitchSpeed = randBetween(70, 90, dt.StaticRandomInt1, dt.StaticRandomInt2, dt.TotalframesAtPlay);
          calced_pitchSpeed = dt.inMemPitcher.calced_pitchSpeed;
          dt.inMemPitcher.pitchBounceCounter = dt.inMemPitcher.pitchBounceCounter + 1;
          dt.inMemPitcher.ballVelocity.Z = -calced_pitchSpeed / 240;
          dt.inMemPitcher.pitchFramesSinceLatestBounce = 0;
          dt.inMemPitcher.ballVelocity.X =
               -(((dt.inMemPitcher.pitchStartingXPosition - dt.inMemPitcher.ballCurrentPosition.X) * dt.inMemPitcher.ballVelocity.Z) /
                (dt.inMemPitcher.ballCurrentPosition.Z - dt.inMemPitcher.zUnhittableThreshold));
          dt.inMemPitcher.ballVelocity.Y =
               -(((dt.inMemPitcher.bat_y_coord - dt.inMemPitcher.ballCurrentPosition.Y) * dt.inMemPitcher.ballVelocity.Z) /
                (dt.inMemPitcher.ballCurrentPosition.Z - dt.inMemPitcher.zUnhittableThreshold));
        }
        else {
          dt.inMemPitcher.pitchBounceCounter = dt.inMemPitcher.pitchBounceCounter + 1;
          RNG1 = 1;
          pitchVelo = dt.inMemPitcher.ballVelocity.X * dt.inMemPitcher.ballVelocity.X +
                      dt.inMemPitcher.ballVelocity.Z * dt.inMemPitcher.ballVelocity.Z;
          pitchVelo2 = pitchVelo;
          dt.inMemPitcher.ballVelocity.Y = -(groundYThreshold - dt.inMemBall.pastCoordinates.Y) * 0.8;
          dt.inMemPitcher.cancelCurveAndParabolicAdjInd = 1;
          //Removed section that just makes the value more precise, and doesn't actually change the value.
          if (pitchVelo2 < 0.01) {
            pitchVelo2 = 0.01;
          }
          dt.inMemPitcher.pitchCurveVelo = 0;
          dt.inMemPitcher.unknown_alwaysSetTo0 = 0;
          dt.inMemPitcher.ballVelocity.X = 0.15 * (dt.inMemPitcher.ballVelocity.X / pitchVelo2);
          dt.inMemPitcher.ballVelocity.Z = 0.15 * (dt.inMemPitcher.ballVelocity.Z / pitchVelo2);
          dt.inMemPitcher.ballCurrentPosition.Y = groundYThreshold;
          dt.inMemBall.AtBat_Contact_BallPos.Y = groundYThreshold;
          /*Sound::PlaySoundEffect(pitchHittingGround);*/
        }
      }
      returnVal = estimateXAndFrameAtBatterZ(dt.inMemBatter.batPosition.Z,/*0x80890a98,*/0, dt);
      // @ts-ignore
      dt.inMemPitcher.framesUntilBallReachesBatterZ = returnVal.framesUntilBat;
      // @ts-ignore
      dt = returnVal.dataStruct

                  /* This function is ran a 2nd time to calculated the predicted pitch X with
                      curve taken into account. */
      returnVal = estimateXAndFrameAtBatterZ(dt.inMemBatter.batPosition.Z,/*0x80890a9c,*/1, dt);
      // @ts-ignore
      dt = returnVal.dataStruct;
      
      if (dt.inMemPitcher.framesUntilPitchGetsToBatter < 0) {
        dt.inMemPitcher.framesUntilPitchGetsToBatter = dt.inMemPitcher.framesUntilBallReachesBatterZ + dt.pitchHangtimeCounter;
      }
      /* Deleted sections related to HBP and some seemingly unused logic */
     
      /* Keep updating this frame count until the ball is behind the player. */
      if (0.775 <= dt.inMemBall.AtBat_Contact_BallPos.Z) {
        dt.inMemPitcher.framesUntilUnhittable = dt.inMemPitcher.frameWhenUnhittable - dt.pitchHangtimeCounter;
      }
      if (dt.inMemBall.AtBat_Contact_BallPos.Z < -3 || dt.pitchHangtimeCounter == 200) {
        /*dt.inMemPitcher.pitcherActionState = postPitchNoContact;
        dt.inMemPitcher.CountsUpWhileWaitingForPitch = 0;
        dt.inMemPitcher.pitchDidntResultInLiveBallInd = 1;*/
        dt.pitchDoneSimulating = true;
      }
      dt.inMemPitcher.zUnhittableThresholdCopy = dt.inMemPitcher.zUnhittableThreshold;
      dt.inMemPitcher.unused_XCurvePastBatter = dt.inMemPitcher.pitchRelease.X +
           ((dt.inMemPitcher.ballCurrentPosition.X - dt.inMemPitcher.pitchRelease.X) *
           (dt.inMemPitcher.zUnhittableThreshold - dt.inMemPitcher.pitchRelease.Z)) /
           (dt.inMemPitcher.ballCurrentPosition.Z - dt.inMemPitcher.pitchRelease.Z);
      dt.inMemPitcher.unused_YCurvePastBatter = dt.inMemPitcher.pitchRelease.X +
           ((dt.inMemPitcher.ballCurrentPosition.Y - dt.inMemPitcher.pitchRelease.Y) *
           (dt.inMemPitcher.zUnhittableThreshold - dt.inMemPitcher.pitchRelease.Z)) /
           (dt.inMemPitcher.ballCurrentPosition.Z - dt.inMemPitcher.pitchRelease.Z);
      /* Deleted a section relating to the ball location after a HBP*/
      
      return dt;
    }