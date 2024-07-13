import { WeightedRandomIndex } from "../mssbHelpers";
import { pitcherAISelectPitch } from "./ai_selectPitch";
import { pitcherAISetCurve } from "./ai_setCurve";
import * as c from "./pitchingConstants";

// @ts-ignore
export function pitcherAI_prePitchSetConstants(dt) { //80660640
  let randomNum:any;
  let moundMovementNeeded:number;
  
                    /* On first frame, decide where the pitcher will stand on mound. */
  if (dt.inMemPitcher.CountsUpWhileWaitingForPitch == 1) {
    if (dt.pitcherAIPitchDownTheMiddleInd == 0) {
      randomNum = WeightedRandomIndex(c.aIMoundLocationProbabilities[dt.inMemPitcher.charClass],6, dt.StaticRandomInt1, dt.StaticRandomInt2, dt.TotalframesAtPlay);
      if (randomNum != 5) {
        dt.aIMoundLocationIndex = randomNum;
        dt.aIMoundLocationX =
             ((0.4 - (-0.4)) / 5) * randomNum + (-0.4);
      }
    }
    else {
      dt.aIMoundLocationX = 0;
    }
  }
  if (29 < dt.inMemPitcher.CountsUpWhileWaitingForPitch) {
                    /* If pitcher isn't at the desired location, move them 0.08m/frame */
    if (dt.aIMoundLocationX != dt.inMemPitcher.pitcherX) {
      moundMovementNeeded = dt.aIMoundLocationX - dt.inMemPitcher.pitcherX;
      if (moundMovementNeeded <= 0) {
        if (moundMovementNeeded < -0.08) {
          dt.inMemPitcher.pitcherX = dt.inMemPitcher.pitcherX - 0.08;
        }
        else {
          dt.inMemPitcher.pitcherX = dt.aIMoundLocationX;
        }
      }
      else if (0.08 < moundMovementNeeded) {
        dt.inMemPitcher.pitcherX = dt.inMemPitcher.pitcherX + 0.08;
      }
      else {
        dt.inMemPitcher.pitcherX = dt.aIMoundLocationX;
      }
    }
  }
  if ((true /*AIFrameToBeginPitch <= dt.inMemPitcher.CountsUpWhileWaitingForPitch*/) &&
     (true /*inMemBatter.someAnimationInd_beginningOfABAnimation? == 0*/)) {
    pitcherAISelectPitch(dt);
    pitcherAISetCurve(dt);
    //pitcherAITransitionFromPrePitchToWindup(2);
    //pitchCodeUsedForReplays = realPitch;
  }
  return;
}

