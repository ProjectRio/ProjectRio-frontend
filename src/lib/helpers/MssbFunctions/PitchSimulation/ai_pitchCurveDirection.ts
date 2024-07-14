// @ts-ignore
export function aiPitchCurveDirection(curvePerFrame, dt) {
  let direction;
  let framesLeftInPitch;
  let curveMaxRange;
  let diffXToEndLoc;
  
                    /* Curve starts 3 frames after start of pitch. */
  if (dt.pitchHangtimeCounter < 2) {
    direction = 0;
  }
  else {
                    /* If pitch can't be curved due to pitcher stats, then don't input left or
                       right. */
    if (0 == curvePerFrame) {
      direction = 0;
    }
    else {
      diffXToEndLoc = (dt.aiPitchCurveEndingX - dt.inMemPitcher.pitchEstimatedEndingX_withCurve);
                    /* Checks the latest the pitcher can delay curving based on the frames remaining
                       in the air. Once they can't delay anymore, then the curve will start. In the
                       meantime, no curve. */
      if (dt.pitchAIDelayCurveStart != 0) {
        framesLeftInPitch = dt.inMemPitcher.framesUntilTargetZ - dt.pitchHangtimeCounter;
        if (framesLeftInPitch < 1) {
          return 0;
        }
        curveMaxRange = (curvePerFrame * (framesLeftInPitch / 2) * framesLeftInPitch );
        if (0 <= diffXToEndLoc) {
          if (diffXToEndLoc < curveMaxRange) {
            return 0;
          }
        }
        else if (-diffXToEndLoc < curveMaxRange) {
          return 0;
        }
        dt.pitchAIDelayCurveStart = 0;
      }
      if (diffXToEndLoc <= 0.03) {
                    /* If pitch x is close enough to desired spot, stop curving. */
        if (-0.03 <= diffXToEndLoc) {
          direction = 0;
        }
        else {
                    /* If wrong direction, stop input this frame. */
          if (dt.aiPitchDirectionInput == 1) {
            direction = 0;
          }
          else {
                    /* Left input */
            direction = -1;
            dt.aiPitchDirectionInput = -1;
          }
        }
      }
      else {
                    /* If wrong direction, stop input this frame. */
        if (dt.aiPitchDirectionInput == -1) {
          direction = 0;
        }
        else {
                    /* Right input */
          direction = 1;
          dt.aiPitchDirectionInput = 0;
        }
      }
    }
  }
  return direction;
}
