import * as c from "./pitchingConstants";

// @ts-ignore
export function calcuatedPitchingStats(dt) { // based off of 806b1d3c
      dt.inMemPitcher.cursedBallStat = c.stats[dt.inMemPitcher.charID]['Cursed Ball'];
      let cursedBall = dt.inMemPitcher.cursedBallStat;
      dt.inMemPitcher.curveControlStat = c.stats[dt.inMemPitcher.charID]["Curve Control"];
      let curveControl = dt.inMemPitcher.curveControlStat;
      dt.inMemPitcher.curveStat = c.stats[dt.inMemPitcher.charID]["Curve"];
      let curve = dt.inMemPitcher.curveStat;
      dt.inMemPitcher.fastBallSpeed = c.stats[dt.inMemPitcher.charID]["Fast Ball Speed"];
      dt.inMemPitcher.curveBallSpeed = c.stats[dt.inMemPitcher.charID]["Curve Ball Speed"];
      let fastBallSpeed;
      let curveBallSpeed
    
      if (dt.inMemPitcher.captainStarPitchThrown == 0) {
                        /* If perfect pitch or fastball star pitch. */
        if ((dt.inMemPitcher.ChargePitchType == 3) || (dt.inMemPitcher.nonCapStarPitchThrown == 2)) {
          dt.inMemPitcher.calced_pitchSpeed = dt.inMemPitcher.fastBallSpeed  * 1.05;
        }
        else {
                        /* else if this isn't a charge pitch, then set speed to curveball speed. */
          if (dt.inMemPitcher.ChargePitchType == 0) {
            if (dt.inMemPitcher.pitchType == 2) {
              dt.inMemPitcher.calced_pitchSpeed = dt.inMemPitcher.curveBallSpeed;
            }
            else {
              dt.inMemPitcher.calced_pitchSpeed = dt.inMemPitcher.curveBallSpeed;
            }
          }
          else {
                        /* else if slider pitch, set pitch speed to be a combination of the fast ball
                           speed and the curve ball speed, the proportion coming from the charge up
                           time.  */
            fastBallSpeed = dt.inMemPitcher.fastBallSpeed;
            curveBallSpeed = dt.inMemPitcher.curveBallSpeed;
            dt.inMemPitcher.calced_pitchSpeed = dt.inMemPitcher.fastBallSpeed - Math.floor(0.85 * (fastBallSpeed - curveBallSpeed) * (1 - dt.inMemPitcher.pitchChargeUp));
          }
        }
                        /* If not captain star pitch and (charge pitch or change up or fastball star
                           pitch or changeup star pitch), then multiply curve stat by 0.02 */
        if ((((1 < dt.inMemPitcher.ChargePitchType) || (dt.inMemPitcher.pitchType == c.pitchType_ChangeUp))
            || (dt.inMemPitcher.nonCapStarPitchThrown == 2)) || (dt.inMemPitcher.nonCapStarPitchThrown == 3))
        {
          cursedBall = (cursedBall * 1);
          curveControl = (curveControl * 1);
          curve = (curve * 0.02);
        }
                        /* If pitcher is tired and not a star pitch. */
        if ((dt.inMemPitcher.nonCapStarPitchThrown == 0) && (dt.inMemPitcher.Stamina < 4)) {
          if (dt.inMemPitcher.ChargePitchType == 0) {
                        /* If tired and not charge or changeup, reduce curve stat by 99% */
            if (dt.inMemPitcher.pitchType != c.pitchType_ChangeUp) {
              curve = (curve * -(0.01 * 99 - 1));
            }
          }
          else {
                        /* Else if tired charge pitch, reduce pitch speed to 80% of normal */
            dt.inMemPitcher.calced_pitchSpeed = Math.floor(dt.inMemPitcher.calced_pitchSpeed * -(0.01 * 20 - 1));
          }
                        /* If tired, reduce curve control and cursed ball by 99% */
          curveControl = (curveControl * -(0.01 * 100 - 1));
          cursedBall = (cursedBall * -(0.01 * 100 -1));
        }
        
        dt.inMemPitcher.calced_cursedBall = cursedBall;
        dt.inMemPitcher.calced_curveControl = curveControl;
        dt.inMemPitcher.calced_curve = curve;
      }
      else {
                        /* else if captain star pitch */
        dt.inMemPitcher.calced_cursedBall = 100;
        dt.inMemPitcher.calced_curveControl = 100;
        dt.inMemPitcher.calced_curve = 100;
        dt.inMemPitcher.calced_pitchSpeed = c.pitchConstantsArray[dt.inMemPitcher.pitchSubType][0];
        if ((dt.inMemPitcher.captainStarPitchThrown == 9) ||
           (dt.inMemPitcher.captainStarPitchThrown == 10)) { // Yoshi or Birdo
          dt.inMemPitcher.calced_pitchSpeed = 0x50;
        }
      }
    
      return dt;
    }