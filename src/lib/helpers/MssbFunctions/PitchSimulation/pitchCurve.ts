import { LinearInterpolateToNewRange } from "../mssbHelpers";
import * as c from "./pitchingConstants";

// @ts-ignore
export function pitchCurve(dt) {
      let uVar2 = 0;
      let curve_Interpolated;
      let framesUntilFullCurve; 
                        /* Resets this to 0, but will always be recalculated during this function unless
                           there are indicators set that cancel the curve calculation. */
      dt.inMemPitcher.pitchCurveVelo = 0;
      dt.inMemPitcher.unknown_alwaysSetTo0 = 0;
      let leftOrRight = 0; //TODO: replace this with an input variable
      //controllerInput = inMemControls + UINT_ARRAY_80892a78[fieldingTeam];
      if ((dt.inMemPitcher.cancelCurveAndParabolicAdjInd == 0) && (dt.inMemPitcher.calced_curve != 0)) {
        curve_Interpolated =
             LinearInterpolateToNewRange
                               (dt.inMemPitcher.calced_curve,
                                1,
                                100,
                                c.pitchConstantsArray[dt.inMemPitcher.pitchSubType][1],
                                c.pitchConstantsArray[dt.inMemPitcher.pitchSubType][2]);
        curve_Interpolated = 0.00005 * curve_Interpolated;
        //removed controller and AI input section
        framesUntilFullCurve =
             LinearInterpolateToNewRange
                               (dt.inMemPitcher.calced_curveControl,
                                1,100,
                                8,2);
        if (framesUntilFullCurve < 1) {
          framesUntilFullCurve = 1;
        }
        if (leftOrRight == 0) {
          if (0 <= dt.inMemPitcher.pitchCurveVelo_subCalculations) {
            dt.inMemPitcher.pitchCurveVelo_subCalculations =
                 dt.inMemPitcher.pitchCurveVelo_subCalculations -
                 (curve_Interpolated / framesUntilFullCurve);
            if (dt.inMemPitcher.pitchCurveVelo_subCalculations < 0) {
              dt.inMemPitcher.pitchCurveVelo_subCalculations = 0;
            }
          }
          else {
            dt.inMemPitcher.pitchCurveVelo_subCalculations =
                 dt.inMemPitcher.pitchCurveVelo_subCalculations +
                 (curve_Interpolated / framesUntilFullCurve);
            if (0 < dt.inMemPitcher.pitchCurveVelo_subCalculations) {
              dt.inMemPitcher.pitchCurveVelo_subCalculations = 0;
            }
          }
        }
        else {
          dt.inMemPitcher.pitchCurveVelo_subCalculations =
               dt.inMemPitcher.pitchCurveVelo_subCalculations +
               (curve_Interpolated * leftOrRight) / framesUntilFullCurve;
          if (leftOrRight < 0) {
            if (dt.inMemPitcher.pitchCurveVelo_subCalculations < -curve_Interpolated) {
              dt.inMemPitcher.pitchCurveVelo_subCalculations = -curve_Interpolated;
            }
          }
          else if (curve_Interpolated < dt.inMemPitcher.pitchCurveVelo_subCalculations) {
            dt.inMemPitcher.pitchCurveVelo_subCalculations = curve_Interpolated;
          }
        }
        dt.inMemPitcher.pitchCurveVelo = dt.inMemPitcher.pitchCurveVelo_subCalculations;
        /*if (leftOrRight != 0) {
          dt.inMemPitcher.anyCurveInput? = 1;
        }*/
      }
      
      return dt;
    }