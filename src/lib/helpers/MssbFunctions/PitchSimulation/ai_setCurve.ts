import { randBetween, RandomInt_Game } from "../mssbHelpers";
import * as c from "./pitchingConstants";

// @ts-ignore
export function pitcherAISetCurve(dt) {
  let bVar1;
  let rng;
  let finalLocIndex;
  let moundLoc;
  let loopIndex;
  
  if (dt.aiPitchCurveType == 0) {
      dt.aiPitchCurveType = 3
      if (dt.pitcherAIPitchDownTheMiddleInd != 0) {
            dt.aiPitchCurveType = 1;
      }
  }
  if (dt.aiPitchCurveType == 1) {
    dt.aiPitchCurveEndingX = 0;
  }
  else if (dt.aiPitchCurveType == 2) {
    moundLoc = randBetween(0xfffffff6,10, dt.StaticRandomInt1, dt.StaticRandomInt2, dt.TotalframesAtPlay);
    dt.aiPitchCurveEndingX = 0.01 * moundLoc;
  }
  else if (dt.aiPitchCurveType == 3) {
    loopIndex = 0;
    rng = RandomInt_Game(100, dt.StaticRandomInt1, dt.StaticRandomInt2, dt.TotalframesAtPlay);
                    /* There are 7 positions for the ending loc of the pitch. I believe if the RNG
                       indicates a strong curve, then this algo randomly sets the ending position at
                       least 2 away from the mound position. */
    if (c.aiPitchWeakCurveProbabilities[dt.aIDifficultyInverse0Weak] <= rng) {
      do { // edited original function to get rid of jumps.
        rng = RandomInt_Game(4, dt.StaticRandomInt1, dt.StaticRandomInt2, dt.TotalframesAtPlay);
        moundLoc = dt.aIMoundLocationIndex;
        if (moundLoc == 0) {finalLocIndex = rng + 3}
        else {finalLocIndex = ((rng < moundLoc) ? rng : rng + 3)}

        if ((dt.aIPitchDesiredEndingLocIndex != finalLocIndex) || (1 < loopIndex))
          break; // break if different spot than last time, or if RNG was tried 3 times.
        loopIndex = loopIndex + 1;
      } while (true);
      /*do { // edited this function to remove loops.
        rng = RandomInt_Game(4, dt.StaticRandomInt1, dt.StaticRandomInt2, dt.TotalframesAtPlay);
        moundLoc = dt.aIMoundLocationIndex;
        finalLocIndex = 0;
        if (((moundLoc == 0) || (moundLoc == 0xffffffff)) || (moundLoc == 0xfffffffe)) {
LAB_806601a0:
          finalLocIndex = 1;
          if (((moundLoc != 1) && (moundLoc != 0)) && (moundLoc != 0xffffffff)) {
            if (rng == 0) continue checkIfDiffLocThanLastTime;
            rng = rng + -1;
          }
          finalLocIndex = 2;
          if (((moundLoc != 2) && (moundLoc != 1)) && (moundLoc != 0)) {
            if (rng == 0) continue checkIfDiffLocThanLastTime;
            rng = rng + -1;
          }
          finalLocIndex = 3;
          if (((moundLoc != 3) && (moundLoc != 2)) && (moundLoc != 1)) {
            if (rng == 0) continue checkIfDiffLocThanLastTime;
            rng = rng + -1;
          }
          finalLocIndex = 4;
          if (((moundLoc != 4) && (moundLoc != 3)) && (moundLoc != 2)) {
            if (rng == 0) continue checkIfDiffLocThanLastTime;
            rng = rng + -1;
          }
          finalLocIndex = 5;
          if (((moundLoc != 5) && (moundLoc != 4)) && (moundLoc != 3)) {
            if (rng == 0) continue checkIfDiffLocThanLastTime;
            rng = rng + -1;
          }
          finalLocIndex = 6;
          if ((((moundLoc == 6) || (moundLoc == 5)) || (moundLoc == 4)) || (rng != 0)) {
            finalLocIndex = 7;
          }
        }
        else if (rng != 0) {
          rng = rng + -1;
          continue LAB_806601a0;
        }
checkIfDiffLocThanLastTime:
                    /* Tries three times to get different pitch location than the last time, before
                       it will give same as last time. 
        if ((dt.aIPitchDesiredEndingLocIndex != finalLocIndex) || (1 < loopIndex))
            continue setFinalCurveValues;
        loopIndex = loopIndex + 1;
      } while( true );*/
    }
    while( true ) {
                    /* For weak curves, this will set the curve to be straight, or one position to
                       the left or right.
                       It will try 3 times total before it would repeat the same location as the
                       previous pitch. */
      rng = RandomInt_Game(3, dt.StaticRandomInt1, dt.StaticRandomInt2, dt.TotalframesAtPlay);
      finalLocIndex = dt.aIMoundLocationIndex + rng;
      if ((dt.aIPitchDesiredEndingLocIndex != finalLocIndex) || (1 < loopIndex)) break;
      loopIndex = loopIndex + 1;
    }
//setFinalCurveValues:
    dt.aiPitchCurveEndingX = c.aIPitchCurveEndingXConstants[finalLocIndex];
    dt.aIPitchDesiredEndingLocIndex = finalLocIndex;
  }
  dt.pitchAIDelayCurveStart = 0;
  bVar1 = c.pitchAIDelayPitchStartProbabilities[dt.inMemPitcher.charClass][dt.aIDifficultyInverse0Weak];
  rng = RandomInt_Game(100, dt.StaticRandomInt1, dt.StaticRandomInt2, dt.TotalframesAtPlay);
  if (bVar1 < rng) {
    dt.pitchAIDelayCurveStart = 1;
  }
  return;
}