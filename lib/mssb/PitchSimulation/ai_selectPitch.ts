import { RandomInt_Game } from "../mssbHelpers";
import * as c from "./pitchingConstants";

// @ts-ignore
export function ai_selectPitch(dt) { // 80660334
  let diceRoll;
  let StarProb;
  let pitchProb;
  let starPitchSituation;
  
  dt.aIPitchType = c.aiPitchType_Curve;
                        /* Check if it's a star pitch situation, and probabilistically determine if a
                        star pitch is selected. */
      if (dt.pitchingTeamStars != 0) {
            starPitchSituation = false;
                              /* If not last inning (or extras), or defence is losing, or outs less than 2. */
            if ((dt.GameControls_Inning < dt.GameControls_InningsSelected) ||
                  ((dt.GameScores[dt.pitcherOnHomeTeam] <= dt.GameScores[1-dt.pitcherOnHomeTeam] || // needs to check fielding <= batting team
                  (dt.GameControls_Outs < 2)))) {
                              /* If inning earler than something, or top of inning, or outs less than 2. */
                  if ((dt.GameControls_Inning < dt.maxNumberOfExtraInnings) ||
                  ((dt.GameControls_bottomOfInningInd == 0 || (dt.GameControls_Outs < 2)))) {
                              /* if runner on 2nd. */
                        if ((dt.runnerTracking.baseRunnerStartingPos == 0x101) ||
                              ((dt.runnerTracking.baseRunnerStartingPos == 0x1101 ||
                              (dt.runnerTracking.baseRunnerStartingPos == 0x1111)))) {
                                    /* If after a certain inning, and bottom of inning, and 2 outs. */
                        starPitchSituation = true;
                        }
                  }
                  else {
                              /* If in last inning, and defence is winning, and 2 outs. */
                  starPitchSituation = true;
                  }
            }
            else {
                  starPitchSituation = true;
            }
            if (starPitchSituation) {
                  StarProb = c.starLikelihoodArray[dt.pitchingTeamStars][dt.aIDifficultyInverse0Weak];
                  if (dt.nStarPitchesThrownThisAB == '\0') {
                        if (dt.GameControls_Strikes != 0) {
                        StarProb = StarProb + dt.GameControls_Strikes * 10;
                        }
                  }
                  else {
                        StarProb = StarProb + 236;
                  };
                  [diceRoll, dt] = RandomInt_Game(100, dt);
                  if (diceRoll < StarProb) {
                  //dt.inMemPitcher.starPitchSelectedOnController = 1;
                  dt.aIPitchType = c.aiPitchType_Star;
                  return;
                  }
            }
      }
                        /* If no runners, 2+3, based loaded, or 3
                        The arrays are the same so this doesn't matter */
      if ((((dt.runnerTracking.baseRunnerHex == 1) || (dt.runnerTracking.baseRunnerHex == 0x1101)) ||
            (dt.runnerTracking.baseRunnerHex == 0x1111)) || (dt.runnerTracking.baseRunnerHex == 0x1001)) {
            pitchProb = c.chargePitchProb[dt.inMemPitcher.charClass][dt.aIDifficultyInverse0Weak];
      }
      else {
            pitchProb = c.chargePitchProb[dt.inMemPitcher.charClass][dt.aIDifficultyInverse0Weak];
      };
      [diceRoll, dt] = RandomInt_Game(100, dt);
      if (diceRoll < pitchProb) {
            dt.aIPitchType = c.aiPitchType_Charge;
            [diceRoll, dt] = RandomInt_Game(100, dt);
            if (diceRoll < c.changeUpProb[dt.inMemPitcher.charClass][dt.aIDifficultyInverse0Weak]) {
                  dt.aIPitchType = c.aiPitchType_Changeup;
                  dt.inMemPitcher.pitchType = c.pitchType_ChangeUp;
            }
            else {
                  pitchProb = c.perfectPitchProb[dt.GameControls_Strikes][dt.aIDifficultyInverse0Weak];
                  [diceRoll, dt] = RandomInt_Game(100, dt);
                  if (diceRoll < pitchProb) {
                        dt.aIPerfectCharge = 1;
                  }
            }
      }
  return;
}
