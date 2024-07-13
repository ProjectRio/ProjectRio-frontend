// sets starting value of the data needed to simulate pitches.
// many of these values come from 806b4248.

export const defaultPitchingData = {
      'inMemPitcher': {
            //calculated values
            'calced_cursedBall': -1,
            'calced_curve': -1,
            'calced_curveControl': -1,
            'calced_pitchSpeed': -1,
            'pitchZ_whenAirResistanceStarts': -1,
            'pitchZ_whenPitchSpecificResistanceStarts': -1,
            'pitchSpecific_VeloAdj': -1,
            'verticalGlobalParabolicVelo': -1,
            'verticalOffsetParabolaMidpoint': -1,
            'horizontalGlobalParabolicVelo': -1,
            'horizontalOffsetParabolaMidpoint': -1,
            'pitchCurveVelo': 0,
            'pitchCurveVelo_subCalculations': 0,
            'frameBallCanStartBeingControlled': -1,
            'frameWhenUnhittable': 0,
            'framesUntilBallReachesBatterZ': -1,
            'ballBouncePeakZFrame': -1,
            'unknown_alwaysSetTo0': -1,
            'pitchX_parabolicAdjustment': -1,
            'pitchY_parabolicAdjustment': -1,

            //pitch information
            'captainStarPitchThrown': 0,
            'nonCapStarPitchThrown': 0,
            'ChargePitchType': 0,
            'pitchType': 0,
            'pitchSubType': 0,
            'pitchInAirInd': false,
            'pitchBounceCounter': 0,
            'pitchFramesSinceLatestBounce': 0,
            'framesUntilPitchGetsToBatter': 0,
            'cancelCurveAndParabolicAdjInd': 0,
            'bulletPitchLoopStartingFrame': 0,
            'bulletPitchStageCode': 0,
            'bulletPitch_loopFrameCounter': 0,
            'bulletPitchLoopAngleRadians': 0,
            'warioWaluStarPitchRightLeft': 0, 
            'warioWaluStarPitch_occilationStage': 0,
            'eggBounceRelated': 0,
            'pitchStartingXPosition': 0,
            'zUnhittableThreshold': 0,
            'zUnhittableThresholdCopy': 0,
            'unused_XCurvePastBatter': 0,
            'unused_YCurvePastBatter': 0,
            
            //inputs
            'pitchChargeUp': 0,
            'Stamina': 10,
            'pitcherX': 0,

            //character values
            'charID': -1,
            'handedness': -1,
            'cursedBallStat': -1,
            'curveStat': -1,
            'curveControlStat': -1,
            'fastBallSpeed': -1,
            'curveBallSpeed': -1,
            'charClass': -1,
            'AIInd': -1,
            'aILevel': -1,

            //ball
            'ballCurrentPosition': {
                  'X': 0,
                  'Y': 1,
                  'Z': 0
            },
            'ballLastPosition': {
                  'X': -1,
                  'Y': -1,
                  'Z': -1
            },
            'ballVelocity': {
                  'X': 0,
                  'Y': 0,
                  'Z': 0
            },
            'pitchRelease': {
                  'X': -1,
                  'Y': -1,
                  'Z': -1
            },
            'starPitchAdjustment': {
                  'X': 0,
                  'Y': 0,
                  'Z': 0
            },
            'pitchTarget': {
                  'X': 0.5 * (-0.53 + 0.53),
                  'Y': 0.7,
                  'Z': 0.5 * (1.05 + 0.5)
            },
            'pitchEstimatedEndX_withoutCurve': 0,
            'pitchEstimatedEndingX_withCurve': 0,

            //export constants
            'horizontalCenterOfStrikeZone': 0.5 * (-0.53 + 0.53),
            'moundZ': 18.44,
            'pitchSpeedScaler': 240,
            'verticalCenterOfStrikeZone': 0.5 * (1.05 + 0.5),
            'decelerationFactor': 0.998,
            'strikeZoneLeft': -0.53,
            'strikeZoneRight': 0.53
      },

      'inMemBall': {
            'AtBat_Contact_BallPos': {
                  'X': -1,
                  'Y': -1,
                  'Z': -1
            },
            'pastCoordinates': {
                  'Y': -1
            }
      },

      'inMemBatter': {
            'batPosition': {
                  'X': -1,
                  'Y': -1,
                  'Z': -1
            }
      },

      'curveInput': [],
      'curveInput_current': 0,

      // AI related
      'pitcherAIPitchDownTheMiddleInd': 0,
      'aIMoundLocationIndex': 2,
      'aIMoundLocationX': 2,
      'aIPitchDesiredEndingLocIndex': 0, // get input from last pitch
      'aIPitchType': -1,
      'pitchingTeamStars': 5, // take this as an input
      'GameControls_Inning': 1, //need input
      'GameControls_InningsSelected': 9, // need input
      'maxNumberOfExtraInnings':  8, // need to derive this based on selected innings
      'GameControls_bottomOfInningInd': 0, // need inpit
      'pitcherOnHomeTeam': 1, // need derive this based on bottom of inning ind
      'GameScores': [0, 0], // need input
      'GameControls_Outs': 0, // need input
      'GameControls_Strikes': 0, // need input
      'aIDifficultyInverse0Weak': 0, // need input
      'nStarPitchesThrownThisAB': 0, // need input
      'aIPerfectCharge': 0,
      'aiPitchCurveType': 0,
      'aiPitchCurveEndingX': 0,
      'pitchAIDelayCurveStart': 0,
      'runnerTracking': {
            'baseRunnerStartingPos': 1 // need input
      },

      'pitchHangtimeCounter': 0,
      'StaticRandomInt1': 0,
      'StaticRandomInt2': 0,
      'TotalframesAtPlay': 0,
      'pitchDoneSimulating': false,
      'calcedOutputs': [{}],
      'calculatedPoints': [{}],
      'calculatedVelocity': [{}],
      'calculatedAtBatBallPosPoints': [{}]
}

export const stats = [{ "Curve Ball Speed": 130, "Fast Ball Speed": 168, "Cursed Ball": 60, "Curve": 53, "Curve Control": 50, "Char Id": 0, "Slap Contact Spot Size": 65, "Charge Contact Spot Size": 35, "Slap Hit Power": 50, "Charge Hit Power": 64, "Bunting": 35, "Speed": 50, "Throwing Arm": 60, "Weight": 2, "Captain Star Hit/Pitch": 1, "Non Captain Star Pitch": 2, "Batting Stat Bar": 6, "Pitching Stat Bar": 6, "Running Stat Bar": 5, "Fielding Stat Bar": 6, "Name": "Mario", "Fielding Arm": 0, "Batting Stance": 0, "Horizontal Hit Trajectory": 0, "Vertical Hit Trajectory": 0, "Character Class": 0, "Can Be Captain": 1, "Non Captain Star Swing": 1, "Fielding Ability": 10 }, { "Curve Ball Speed": 125, "Fast Ball Speed": 165, "Cursed Ball": 55, "Curve": 56, "Curve Control": 50, "Char Id": 1, "Slap Contact Spot Size": 70, "Charge Contact Spot Size": 40, "Slap Hit Power": 48, "Charge Hit Power": 59, "Bunting": 40, "Speed": 60, "Throwing Arm": 50, "Weight": 2, "Captain Star Hit/Pitch": 2, "Non Captain Star Pitch": 2, "Batting Stat Bar": 5, "Pitching Stat Bar": 6, "Running Stat Bar": 6, "Fielding Stat Bar": 6, "Name": "Luigi", "Fielding Arm": 0, "Batting Stance": 1, "Horizontal Hit Trajectory": 0, "Vertical Hit Trajectory": 0, "Character Class": 0, "Can Be Captain": 1, "Non Captain Star Swing": 2, "Fielding Ability": 66 }, { "Curve Ball Speed": 130, "Fast Ball Speed": 165, "Cursed Ball": 70, "Curve": 35, "Curve Control": 50, "Char Id": 2, "Slap Contact Spot Size": 30, "Charge Contact Spot Size": 15, "Slap Hit Power": 60, "Charge Hit Power": 80, "Bunting": 20, "Speed": 40, "Throwing Arm": 70, "Weight": 4, "Captain Star Hit/Pitch": 5, "Non Captain Star Pitch": 1, "Batting Stat Bar": 8, "Pitching Stat Bar": 7, "Running Stat Bar": 4, "Fielding Stat Bar": 4, "Name": "DK", "Fielding Arm": 0, "Batting Stance": 1, "Horizontal Hit Trajectory": 1, "Vertical Hit Trajectory": 1, "Character Class": 1, "Can Be Captain": 1, "Non Captain Star Swing": 1, "Fielding Ability": 20 }, { "Curve Ball Speed": 115, "Fast Ball Speed": 155, "Cursed Ball": 45, "Curve": 80, "Curve Control": 50, "Char Id": 3, "Slap Contact Spot Size": 45, "Charge Contact Spot Size": 15, "Slap Hit Power": 45, "Charge Hit Power": 30, "Bunting": 20, "Speed": 70, "Throwing Arm": 60, "Weight": 1, "Captain Star Hit/Pitch": 6, "Non Captain Star Pitch": 1, "Batting Stat Bar": 3, "Pitching Stat Bar": 6, "Running Stat Bar": 7, "Fielding Stat Bar": 7, "Name": "Diddy", "Fielding Arm": 0, "Batting Stance": 1, "Horizontal Hit Trajectory": 0, "Vertical Hit Trajectory": 2, "Character Class": 2, "Can Be Captain": 1, "Non Captain Star Swing": 2, "Fielding Ability": 4 }, { "Curve Ball Speed": 125, "Fast Ball Speed": 165, "Cursed Ball": 50, "Curve": 70, "Curve Control": 90, "Char Id": 4, "Slap Contact Spot Size": 80, "Charge Contact Spot Size": 45, "Slap Hit Power": 46, "Charge Hit Power": 45, "Bunting": 45, "Speed": 50, "Throwing Arm": 40, "Weight": 2, "Captain Star Hit/Pitch": 11, "Non Captain Star Pitch": 3, "Batting Stat Bar": 4, "Pitching Stat Bar": 8, "Running Stat Bar": 5, "Fielding Stat Bar": 7, "Name": "Peach", "Fielding Arm": 0, "Batting Stance": 0, "Horizontal Hit Trajectory": 2, "Vertical Hit Trajectory": 2, "Character Class": 3, "Can Be Captain": 1, "Non Captain Star Swing": 2, "Fielding Ability": 32 }, { "Curve Ball Speed": 120, "Fast Ball Speed": 160, "Cursed Ball": 55, "Curve": 60, "Curve Control": 55, "Char Id": 5, "Slap Contact Spot Size": 70, "Charge Contact Spot Size": 40, "Slap Hit Power": 49, "Charge Hit Power": 60, "Bunting": 55, "Speed": 40, "Throwing Arm": 40, "Weight": 2, "Captain Star Hit/Pitch": 12, "Non Captain Star Pitch": 3, "Batting Stat Bar": 6, "Pitching Stat Bar": 7, "Running Stat Bar": 4, "Fielding Stat Bar": 5, "Name": "Daisy", "Fielding Arm": 0, "Batting Stance": 1, "Horizontal Hit Trajectory": 0, "Vertical Hit Trajectory": 0, "Character Class": 0, "Can Be Captain": 1, "Non Captain Star Swing": 1, "Fielding Ability": 40 }, { "Curve Ball Speed": 120, "Fast Ball Speed": 155, "Cursed Ball": 50, "Curve": 51, "Curve Control": 50, "Char Id": 6, "Slap Contact Spot Size": 50, "Charge Contact Spot Size": 30, "Slap Hit Power": 50, "Charge Hit Power": 45, "Bunting": 25, "Speed": 90, "Throwing Arm": 40, "Weight": 2, "Captain Star Hit/Pitch": 9, "Non Captain Star Pitch": 3, "Batting Stat Bar": 5, "Pitching Stat Bar": 4, "Running Stat Bar": 9, "Fielding Stat Bar": 6, "Name": "Yoshi", "Fielding Arm": 0, "Batting Stance": 1, "Horizontal Hit Trajectory": 0, "Vertical Hit Trajectory": 0, "Character Class": 2, "Can Be Captain": 1, "Non Captain Star Swing": 2, "Fielding Ability": 4 }, { "Curve Ball Speed": 115, "Fast Ball Speed": 150, "Cursed Ball": 50, "Curve": 50, "Curve Control": 50, "Char Id": 7, "Slap Contact Spot Size": 50, "Charge Contact Spot Size": 25, "Slap Hit Power": 44, "Charge Hit Power": 30, "Bunting": 25, "Speed": 70, "Throwing Arm": 30, "Weight": 0, "Captain Star Hit/Pitch": 0, "Non Captain Star Pitch": 1, "Batting Stat Bar": 3, "Pitching Stat Bar": 5, "Running Stat Bar": 7, "Fielding Stat Bar": 3, "Name": "Baby Mario", "Fielding Arm": 0, "Batting Stance": 0, "Horizontal Hit Trajectory": 0, "Vertical Hit Trajectory": 2, "Character Class": 2, "Can Be Captain": 0, "Non Captain Star Swing": 2, "Fielding Ability": 2 }, { "Curve Ball Speed": 115, "Fast Ball Speed": 150, "Cursed Ball": 40, "Curve": 50, "Curve Control": 50, "Char Id": 8, "Slap Contact Spot Size": 45, "Charge Contact Spot Size": 25, "Slap Hit Power": 42, "Charge Hit Power": 20, "Bunting": 25, "Speed": 80, "Throwing Arm": 30, "Weight": 0, "Captain Star Hit/Pitch": 0, "Non Captain Star Pitch": 1, "Batting Stat Bar": 2, "Pitching Stat Bar": 5, "Running Stat Bar": 8, "Fielding Stat Bar": 3, "Name": "Baby Luigi", "Fielding Arm": 0, "Batting Stance": 1, "Horizontal Hit Trajectory": 0, "Vertical Hit Trajectory": 2, "Character Class": 2, "Can Be Captain": 0, "Non Captain Star Swing": 2, "Fielding Ability": 2 }, { "Curve Ball Speed": 120, "Fast Ball Speed": 175, "Cursed Ball": 90, "Curve": 35, "Curve Control": 50, "Char Id": 9, "Slap Contact Spot Size": 40, "Charge Contact Spot Size": 15, "Slap Hit Power": 60, "Charge Hit Power": 95, "Bunting": 20, "Speed": 10, "Throwing Arm": 70, "Weight": 4, "Captain Star Hit/Pitch": 7, "Non Captain Star Pitch": 2, "Batting Stat Bar": 9, "Pitching Stat Bar": 9, "Running Stat Bar": 1, "Fielding Stat Bar": 1, "Name": "Bowser", "Fielding Arm": 0, "Batting Stance": 1, "Horizontal Hit Trajectory": 1, "Vertical Hit Trajectory": 1, "Character Class": 1, "Can Be Captain": 1, "Non Captain Star Swing": 1, "Fielding Ability": 17 }, { "Curve Ball Speed": 125, "Fast Ball Speed": 165, "Cursed Ball": 80, "Curve": 30, "Curve Control": 50, "Char Id": 10, "Slap Contact Spot Size": 50, "Charge Contact Spot Size": 25, "Slap Hit Power": 55, "Charge Hit Power": 80, "Bunting": 25, "Speed": 30, "Throwing Arm": 60, "Weight": 3, "Captain Star Hit/Pitch": 3, "Non Captain Star Pitch": 2, "Batting Stat Bar": 8, "Pitching Stat Bar": 3, "Running Stat Bar": 3, "Fielding Stat Bar": 4, "Name": "Wario", "Fielding Arm": 0, "Batting Stance": 0, "Horizontal Hit Trajectory": 0, "Vertical Hit Trajectory": 0, "Character Class": 1, "Can Be Captain": 1, "Non Captain Star Swing": 1, "Fielding Ability": 9 }, { "Curve Ball Speed": 110, "Fast Ball Speed": 169, "Cursed Ball": 50, "Curve": 70, "Curve Control": 60, "Char Id": 11, "Slap Contact Spot Size": 90, "Charge Contact Spot Size": 40, "Slap Hit Power": 50, "Charge Hit Power": 1, "Bunting": 45, "Speed": 40, "Throwing Arm": 40, "Weight": 3, "Captain Star Hit/Pitch": 4, "Non Captain Star Pitch": 1, "Batting Stat Bar": 4, "Pitching Stat Bar": 9, "Running Stat Bar": 4, "Fielding Stat Bar": 4, "Name": "Waluigi", "Fielding Arm": 1, "Batting Stance": 1, "Horizontal Hit Trajectory": 2, "Vertical Hit Trajectory": 2, "Character Class": 3, "Can Be Captain": 1, "Non Captain Star Swing": 3, "Fielding Ability": 80 }, { "Curve Ball Speed": 120, "Fast Ball Speed": 160, "Cursed Ball": 50, "Curve": 50, "Curve Control": 50, "Char Id": 12, "Slap Contact Spot Size": 70, "Charge Contact Spot Size": 30, "Slap Hit Power": 40, "Charge Hit Power": 50, "Bunting": 30, "Speed": 40, "Throwing Arm": 50, "Weight": 1, "Captain Star Hit/Pitch": 0, "Non Captain Star Pitch": 1, "Batting Stat Bar": 5, "Pitching Stat Bar": 4, "Running Stat Bar": 4, "Fielding Stat Bar": 5, "Name": "Koopa(R)", "Fielding Arm": 0, "Batting Stance": 1, "Horizontal Hit Trajectory": 0, "Vertical Hit Trajectory": 0, "Character Class": 0, "Can Be Captain": 0, "Non Captain Star Swing": 2, "Fielding Ability": 8 }, { "Curve Ball Speed": 115, "Fast Ball Speed": 155, "Cursed Ball": 50, "Curve": 50, "Curve Control": 50, "Char Id": 13, "Slap Contact Spot Size": 50, "Charge Contact Spot Size": 30, "Slap Hit Power": 45, "Charge Hit Power": 70, "Bunting": 25, "Speed": 60, "Throwing Arm": 50, "Weight": 0, "Captain Star Hit/Pitch": 0, "Non Captain Star Pitch": 2, "Batting Stat Bar": 5, "Pitching Stat Bar": 3, "Running Stat Bar": 6, "Fielding Stat Bar": 3, "Name": "Toad(R)", "Fielding Arm": 0, "Batting Stance": 0, "Horizontal Hit Trajectory": 0, "Vertical Hit Trajectory": 0, "Character Class": 0, "Can Be Captain": 0, "Non Captain Star Swing": 1, "Fielding Ability": 0 }, 
{ "Curve Ball Speed": 120, "Fast Ball Speed": 160, "Cursed Ball": 50, "Curve": 90, "Curve Control": 60, "Char Id": 14, "Slap Contact Spot Size": 85, "Charge Contact Spot Size": 45, "Slap Hit Power": 40, "Charge Hit Power": 30, "Bunting": 50, "Speed": 40, "Throwing Arm": 40, "Weight": 1, "Captain Star Hit/Pitch": 0, "Non Captain Star Pitch": 1, "Batting Stat Bar": 3, "Pitching Stat Bar": 8, "Running Stat Bar": 4, "Fielding Stat Bar": 2, "Name": "Boo", "Fielding Arm": 1, "Batting Stance": 1, "Horizontal Hit Trajectory": 0, "Vertical Hit Trajectory": 0, "Character Class": 3, "Can Be Captain": 0, "Non Captain Star Swing": 2, "Fielding Ability": 64 }, { "Curve Ball Speed": 115, "Fast Ball Speed": 150, "Cursed Ball": 50, "Curve": 50, "Curve Control": 50, "Char Id": 15, "Slap Contact Spot Size": 50, "Charge Contact Spot Size": 30, "Slap Hit Power": 44, "Charge Hit Power": 20, "Bunting": 25, "Speed": 90, "Throwing Arm": 40, "Weight": 0, "Captain Star Hit/Pitch": 0, "Non Captain Star Pitch": 1, "Batting Stat Bar": 2, "Pitching Stat Bar": 3, "Running Stat Bar": 9, "Fielding Stat Bar": 4, "Name": "Toadette", "Fielding Arm": 0, "Batting Stance": 0, "Horizontal Hit Trajectory": 0, "Vertical Hit Trajectory": 2, "Character Class": 2, "Can Be Captain": 0, "Non Captain Star Swing": 2, "Fielding Ability": 10 }, { "Curve Ball Speed": 120, "Fast Ball Speed": 160, "Cursed Ball": 50, "Curve": 50, "Curve Control": 50, "Char Id": 16, "Slap Contact Spot Size": 50, "Charge Contact Spot Size": 30, "Slap Hit Power": 46, "Charge Hit Power": 55, "Bunting": 25, "Speed": 40, "Throwing Arm": 40, "Weight": 1, "Captain Star Hit/Pitch": 0, "Non Captain Star Pitch": 3, "Batting Stat Bar": 5, "Pitching Stat Bar": 3, "Running Stat Bar": 4, "Fielding Stat Bar": 5, "Name": "Shy Guy(R)", "Fielding Arm": 1, "Batting Stance": 1, "Horizontal Hit Trajectory": 0, "Vertical Hit Trajectory": 0, "Character Class": 0, "Can Be Captain": 0, "Non Captain Star Swing": 1, "Fielding Ability": 8 }, { "Curve Ball Speed": 125, "Fast Ball Speed": 165, "Cursed Ball": 60, "Curve": 40, "Curve Control": 50, "Char Id": 17, "Slap Contact Spot Size": 45, "Charge Contact Spot Size": 30, "Slap Hit Power": 55, "Charge Hit Power": 67, "Bunting": 20, "Speed": 40, "Throwing Arm": 60, "Weight": 3, "Captain Star Hit/Pitch": 10, "Non Captain Star Pitch": 2, "Batting Stat Bar": 6, "Pitching Stat Bar": 4, "Running Stat Bar": 4, "Fielding Stat Bar": 4, "Name": "Birdo", "Fielding Arm": 0, "Batting Stance": 0, "Horizontal Hit Trajectory": 0, "Vertical Hit Trajectory": 0, "Character Class": 0, "Can Be Captain": 1, "Non Captain Star Swing": 1, "Fielding Ability": 1 }, { "Curve Ball Speed": 120, "Fast Ball Speed": 155, "Cursed Ball": 50, "Curve": 50, "Curve Control": 50, "Char Id": 18, "Slap Contact Spot Size": 40, "Charge Contact Spot Size": 30, "Slap Hit Power": 45, "Charge Hit Power": 30, "Bunting": 20, "Speed": 60, "Throwing Arm": 30, "Weight": 1, "Captain Star Hit/Pitch": 0, "Non Captain Star Pitch": 3, "Batting Stat Bar": 3, "Pitching Stat Bar": 3, "Running Stat Bar": 7, "Fielding Stat Bar": 5, "Name": "Monty", "Fielding Arm": 0, "Batting Stance": 1, "Horizontal Hit Trajectory": 0, "Vertical Hit Trajectory": 2, "Character Class": 2, "Can Be Captain": 0, "Non Captain Star Swing": 2, "Fielding Ability": 1 }, { "Curve Ball Speed": 125, "Fast Ball Speed": 166, "Cursed Ball": 50, "Curve": 40, "Curve Control": 50, "Char Id": 19, "Slap Contact Spot Size": 35, "Charge Contact Spot Size": 20, "Slap Hit Power": 55, "Charge Hit Power": 75, "Bunting": 30, "Speed": 40, "Throwing Arm": 50, "Weight": 2, "Captain Star Hit/Pitch": 8, "Non Captain Star Pitch": 2, "Batting Stat Bar": 8, "Pitching Stat Bar": 5, "Running Stat Bar": 4, "Fielding Stat Bar": 3, "Name": "Bowser Jr", "Fielding Arm": 1, "Batting Stance": 0, "Horizontal Hit Trajectory": 0, "Vertical Hit Trajectory": 1, "Character Class": 1, "Can Be Captain": 1, "Non Captain Star Swing": 1, "Fielding Ability": 2 }, { "Curve Ball Speed": 115, "Fast Ball Speed": 155, "Cursed Ball": 50, "Curve": 60, "Curve Control": 50, "Char Id": 20, "Slap Contact Spot Size": 55, "Charge Contact Spot Size": 30, "Slap Hit Power": 48, "Charge Hit Power": 35, "Bunting": 20, "Speed": 60, "Throwing Arm": 60, "Weight": 1, "Captain Star Hit/Pitch": 0, "Non Captain Star Pitch": 1, "Batting Stat Bar": 3, "Pitching Stat Bar": 3, "Running Stat Bar": 6, "Fielding Stat Bar": 4, "Name": "Paratroopa(R)", "Fielding Arm": 0, "Batting Stance": 1, "Horizontal Hit Trajectory": 0, "Vertical Hit Trajectory": 2, "Character Class": 3, "Can Be Captain": 0, "Non Captain Star Swing": 2, "Fielding Ability": 64 }, { "Curve Ball Speed": 125, "Fast Ball Speed": 160, "Cursed Ball": 50, "Curve": 30, "Curve Control": 50, "Char Id": 21, "Slap Contact Spot Size": 35, "Charge Contact Spot Size": 15, "Slap Hit Power": 51, "Charge Hit Power": 65, "Bunting": 20, "Speed": 20, "Throwing Arm": 80, "Weight": 3, "Captain Star Hit/Pitch": 0, "Non Captain Star Pitch": 3, "Batting Stat Bar": 6, "Pitching Stat Bar": 3, "Running Stat Bar": 2, "Fielding Stat Bar": 5, "Name": "Pianta(B)", "Fielding Arm": 0, "Batting Stance": 0, "Horizontal Hit Trajectory": 1, "Vertical Hit Trajectory": 2, "Character Class": 1, "Can Be Captain": 0, "Non Captain Star Swing": 2, "Fielding Ability": 17 }, { "Curve Ball Speed": 125, "Fast Ball Speed": 160, "Cursed Ball": 50, "Curve": 30, "Curve Control": 50, "Char Id": 22, "Slap Contact Spot Size": 35, "Charge Contact Spot Size": 15, "Slap Hit Power": 51, "Charge Hit Power": 70, "Bunting": 20, "Speed": 10, "Throwing Arm": 80, "Weight": 3, "Captain Star Hit/Pitch": 0, "Non Captain Star Pitch": 2, "Batting Stat Bar": 7, "Pitching Stat Bar": 3, "Running Stat Bar": 1, "Fielding Stat Bar": 5, "Name": "Pianta(R)", "Fielding Arm": 0, "Batting Stance": 0, "Horizontal Hit Trajectory": 1, "Vertical Hit Trajectory": 2, "Character Class": 1, "Can Be Captain": 0, "Non Captain Star Swing": 1, "Fielding Ability": 17 }, { "Curve Ball Speed": 125, "Fast Ball Speed": 165, "Cursed Ball": 50, "Curve": 40, "Curve Control": 50, "Char Id": 23, "Slap Contact Spot Size": 35, "Charge Contact Spot Size": 15, "Slap Hit Power": 51, "Charge Hit Power": 65, "Bunting": 20, "Speed": 10, "Throwing Arm": 80, "Weight": 3, "Captain Star Hit/Pitch": 0, "Non Captain Star Pitch": 1, "Batting Stat Bar": 6, "Pitching Stat Bar": 4, "Running Stat Bar": 1, "Fielding Stat Bar": 5, "Name": "Pianta(Y)", "Fielding Arm": 0, "Batting Stance": 0, "Horizontal Hit Trajectory": 1, "Vertical Hit Trajectory": 2, "Character Class": 1, "Can Be Captain": 0, "Non Captain Star Swing": 2, "Fielding Ability": 17 }, { "Curve Ball Speed": 115, "Fast Ball Speed": 155, "Cursed Ball": 50, "Curve": 50, "Curve Control": 50, "Char Id": 24, "Slap Contact Spot Size": 40, "Charge Contact Spot Size": 15, "Slap Hit Power": 43, "Charge Hit Power": 30, "Bunting": 20, "Speed": 70, "Throwing Arm": 60, "Weight": 1, "Captain Star Hit/Pitch": 0, "Non Captain Star Pitch": 3, "Batting Stat Bar": 3, "Pitching Stat Bar": 3, "Running Stat Bar": 7, "Fielding Stat Bar": 4, "Name": "Noki(B)", "Fielding Arm": 0, "Batting Stance": 1, "Horizontal Hit Trajectory": 0, "Vertical Hit Trajectory": 2, "Character Class": 2, "Can Be Captain": 0, "Non Captain Star Swing": 2, "Fielding Ability": 8 }, { "Curve Ball Speed": 115, "Fast Ball Speed": 155, "Cursed Ball": 50, "Curve": 50, "Curve Control": 50, "Char Id": 25, "Slap Contact Spot Size": 40, "Charge Contact Spot Size": 15, "Slap Hit Power": 45, "Charge Hit Power": 40, "Bunting": 20, "Speed": 60, "Throwing Arm": 60, "Weight": 1, "Captain Star Hit/Pitch": 0, "Non Captain Star Pitch": 2, "Batting Stat Bar": 4, "Pitching Stat Bar": 3, "Running Stat Bar": 6, "Fielding Stat Bar": 4, "Name": "Noki(R)", "Fielding Arm": 0, "Batting Stance": 1, "Horizontal Hit Trajectory": 0, "Vertical Hit Trajectory": 2, "Character Class": 2, "Can Be Captain": 0, "Non Captain Star Swing": 1, "Fielding Ability": 8 }, { "Curve Ball Speed": 115, "Fast Ball Speed": 155, "Cursed Ball": 50, "Curve": 60, "Curve Control": 50, "Char Id": 26, "Slap Contact Spot Size": 45, "Charge Contact Spot Size": 13, "Slap Hit Power": 43, "Charge Hit Power": 30, "Bunting": 25, "Speed": 60, "Throwing Arm": 60, "Weight": 1, "Captain Star Hit/Pitch": 0, "Non Captain Star Pitch": 1, "Batting Stat Bar": 3, "Pitching Stat Bar": 4, "Running Stat Bar": 6, "Fielding Stat Bar": 4, "Name": "Noki(G)", "Fielding Arm": 0, "Batting Stance": 1, "Horizontal Hit Trajectory": 0, "Vertical Hit Trajectory": 2, "Character Class": 2, "Can Be Captain": 0, "Non Captain Star Swing": 3, "Fielding Ability": 8 }, { "Curve Ball Speed": 125, "Fast Ball Speed": 165, "Cursed Ball": 50, "Curve": 40, "Curve Control": 50, "Char Id": 27, "Slap Contact Spot Size": 30, "Charge Contact Spot Size": 20, "Slap Hit Power": 10, "Charge Hit Power": 85, "Bunting": 15, "Speed": 30, "Throwing Arm": 60, "Weight": 3, "Captain Star Hit/Pitch": 0, "Non Captain Star Pitch": 2, "Batting Stat Bar": 8, "Pitching Stat Bar": 3, "Running Stat Bar": 3, "Fielding Stat Bar": 3, "Name": "Bro(H)", "Fielding Arm": 0, "Batting Stance": 0, "Horizontal Hit Trajectory": 1, "Vertical Hit Trajectory": 1, "Character Class": 1, "Can Be Captain": 0, "Non Captain Star Swing": 1, "Fielding Ability": 1 }, { "Curve Ball Speed": 120, "Fast Ball Speed": 155, "Cursed Ball": 50, "Curve": 50, "Curve Control": 50, "Char Id": 28, "Slap Contact Spot Size": 85, "Charge Contact Spot Size": 40, "Slap Hit Power": 45, "Charge Hit Power": 40, "Bunting": 45, "Speed": 40, "Throwing Arm": 30, "Weight": 0, "Captain Star Hit/Pitch": 0, "Non Captain Star Pitch": 3, "Batting Stat Bar": 4, "Pitching Stat Bar": 4, "Running Stat Bar": 4, "Fielding Stat Bar": 6, "Name": "Toadsworth", "Fielding Arm": 0, "Batting Stance": 0, "Horizontal Hit Trajectory": 0, "Vertical Hit Trajectory": 0, "Character Class": 3, "Can Be Captain": 0, "Non Captain Star Swing": 3, "Fielding Ability": 1 }, 
{ "Curve Ball Speed": 115, "Fast Ball Speed": 155, "Cursed Ball": 50, "Curve": 50, "Curve Control": 50, "Char Id": 29, "Slap Contact Spot Size": 50, "Charge Contact Spot Size": 30, "Slap Hit Power": 40, "Charge Hit Power": 60, "Bunting": 25, "Speed": 70, "Throwing Arm": 50, "Weight": 0, "Captain Star Hit/Pitch": 0, "Non Captain Star Pitch": 3, "Batting Stat Bar": 4, "Pitching Stat Bar": 3, "Running Stat Bar": 7, "Fielding Stat Bar": 3, "Name": "Toad(B)", "Fielding Arm": 0, "Batting Stance": 0, "Horizontal Hit Trajectory": 0, "Vertical Hit Trajectory": 0, "Character Class": 0, "Can Be Captain": 0, "Non Captain Star Swing": 2, "Fielding Ability": 0 }, { "Curve Ball Speed": 120, "Fast Ball Speed": 160, "Cursed Ball": 50, "Curve": 55, "Curve Control": 50, "Char Id": 30, "Slap Contact Spot Size": 50, "Charge Contact Spot Size": 30, "Slap Hit Power": 40, "Charge Hit Power": 60, "Bunting": 25, "Speed": 60, "Throwing Arm": 50, "Weight": 0, "Captain Star Hit/Pitch": 0, "Non Captain Star Pitch": 1, "Batting Stat Bar": 4, "Pitching Stat Bar": 4, "Running Stat Bar": 6, "Fielding Stat Bar": 3, "Name": "Toad(Y)", "Fielding Arm": 0, "Batting Stance": 0, "Horizontal Hit Trajectory": 0, "Vertical Hit Trajectory": 0, "Character Class": 0, "Can Be Captain": 0, "Non Captain Star Swing": 2, "Fielding Ability": 0 }, { "Curve Ball Speed": 115, "Fast Ball Speed": 155, "Cursed Ball": 50, "Curve": 50, "Curve Control": 50, "Char Id": 31, "Slap Contact Spot Size": 55, "Charge Contact Spot Size": 35, "Slap Hit Power": 45, "Charge Hit Power": 65, "Bunting": 35, "Speed": 60, "Throwing Arm": 50, "Weight": 0, "Captain Star Hit/Pitch": 0, "Non Captain Star Pitch": 3, "Batting Stat Bar": 5, "Pitching Stat Bar": 3, "Running Stat Bar": 6, "Fielding Stat Bar": 3, "Name": "Toad(G)", "Fielding Arm": 0, "Batting Stance": 0, "Horizontal Hit Trajectory": 0, "Vertical Hit Trajectory": 0, "Character Class": 0, "Can Be Captain": 0, "Non Captain Star Swing": 2, "Fielding Ability": 0 }, { "Curve Ball Speed": 115, "Fast Ball Speed": 155, "Cursed Ball": 50, "Curve": 50, "Curve Control": 50, "Char Id": 32, "Slap Contact Spot Size": 50, "Charge Contact Spot Size": 30, "Slap Hit Power": 45, "Charge Hit Power": 70, "Bunting": 25, "Speed": 50, "Throwing Arm": 60, "Weight": 0, "Captain Star Hit/Pitch": 0, "Non Captain Star Pitch": 2, "Batting Stat Bar": 5, "Pitching Stat Bar": 3, "Running Stat Bar": 5, "Fielding Stat Bar": 4, "Name": "Toad(P)", "Fielding Arm": 0, "Batting Stance": 0, "Horizontal Hit Trajectory": 0, "Vertical Hit Trajectory": 0, "Character Class": 0, "Can Be Captain": 0, "Non Captain Star Swing": 1, "Fielding Ability": 0 }, { "Curve Ball Speed": 120, "Fast Ball Speed": 150, "Cursed Ball": 50, "Curve": 50, "Curve Control": 40, "Char Id": 33, "Slap Contact Spot Size": 65, "Charge Contact Spot Size": 35, "Slap Hit Power": 48, "Charge Hit Power": 40, "Bunting": 40, "Speed": 20, "Throwing Arm": 40, "Weight": 2, "Captain Star Hit/Pitch": 0, "Non Captain Star Pitch": 1, "Batting Stat Bar": 4, "Pitching Stat Bar": 2, "Running Stat Bar": 2, "Fielding Stat Bar": 8, "Name": "Magikoopa(B)", "Fielding Arm": 0, "Batting Stance": 1, "Horizontal Hit Trajectory": 2, "Vertical Hit Trajectory": 2, "Character Class": 3, "Can Be Captain": 0, "Non Captain Star Swing": 3, "Fielding Ability": 128 }, { "Curve Ball Speed": 120, "Fast Ball Speed": 155, "Cursed Ball": 50, "Curve": 50, "Curve Control": 40, "Char Id": 34, "Slap Contact Spot Size": 65, "Charge Contact Spot Size": 35, "Slap Hit Power": 50, "Charge Hit Power": 45, "Bunting": 40, "Speed": 10, "Throwing Arm": 40, "Weight": 2, "Captain Star Hit/Pitch": 0, "Non Captain Star Pitch": 1, "Batting Stat Bar": 5, "Pitching Stat Bar": 2, "Running Stat Bar": 1, "Fielding Stat Bar": 8, "Name": "Magikoopa(R)", "Fielding Arm": 0, "Batting Stance": 1, "Horizontal Hit Trajectory": 2, "Vertical Hit Trajectory": 2, "Character Class": 3, "Can Be Captain": 0, "Non Captain Star Swing": 3, "Fielding Ability": 128 }, { "Curve Ball Speed": 120, "Fast Ball Speed": 150, "Cursed Ball": 50, "Curve": 60, "Curve Control": 50, "Char Id": 35, "Slap Contact Spot Size": 65, "Charge Contact Spot Size": 35, "Slap Hit Power": 48, "Charge Hit Power": 40, "Bunting": 40, "Speed": 10, "Throwing Arm": 40, "Weight": 2, "Captain Star Hit/Pitch": 0, "Non Captain Star Pitch": 1, "Batting Stat Bar": 4, "Pitching Stat Bar": 3, "Running Stat Bar": 1, "Fielding Stat Bar": 8, "Name": "Magikoopa(G)", "Fielding Arm": 0, "Batting Stance": 1, "Horizontal Hit Trajectory": 2, "Vertical Hit Trajectory": 2, "Character Class": 3, "Can Be Captain": 0, "Non Captain Star Swing": 3, "Fielding Ability": 128 }, { "Curve Ball Speed": 120, "Fast Ball Speed": 150, "Cursed Ball": 50, "Curve": 70, "Curve Control": 50, "Char Id": 36, "Slap Contact Spot Size": 65, "Charge Contact Spot Size": 35, "Slap Hit Power": 40, "Charge Hit Power": 30, "Bunting": 40, "Speed": 10, "Throwing Arm": 40, "Weight": 2, "Captain Star Hit/Pitch": 0, "Non Captain Star Pitch": 1, "Batting Stat Bar": 3, "Pitching Stat Bar": 4, "Running Stat Bar": 1, "Fielding Stat Bar": 8, "Name": "Magikoopa(Y)", "Fielding Arm": 0, "Batting Stance": 1, "Horizontal Hit Trajectory": 2, "Vertical Hit Trajectory": 2, "Character Class": 3, "Can Be Captain": 0, "Non Captain Star Swing": 3, "Fielding Ability": 128 }, { "Curve Ball Speed": 125, "Fast Ball Speed": 165, "Cursed Ball": 50, "Curve": 60, "Curve Control": 50, "Char Id": 37, "Slap Contact Spot Size": 50, "Charge Contact Spot Size": 15, "Slap Hit Power": 55, "Charge Hit Power": 75, "Bunting": 20, "Speed": 30, "Throwing Arm": 70, "Weight": 4, "Captain Star Hit/Pitch": 0, "Non Captain Star Pitch": 2, "Batting Stat Bar": 7, "Pitching Stat Bar": 5, "Running Stat Bar": 3, "Fielding Stat Bar": 4, "Name": "King Boo", "Fielding Arm": 0, "Batting Stance": 0, "Horizontal Hit Trajectory": 0, "Vertical Hit Trajectory": 0, "Character Class": 1, "Can Be Captain": 0, "Non Captain Star Swing": 1, "Fielding Ability": 65 }, { "Curve Ball Speed": 130, "Fast Ball Speed": 170, "Cursed Ball": 50, "Curve": 30, "Curve Control": 50, "Char Id": 38, "Slap Contact Spot Size": 30, "Charge Contact Spot Size": 10, "Slap Hit Power": 60, "Charge Hit Power": 95, "Bunting": 10, "Speed": 10, "Throwing Arm": 100, "Weight": 4, "Captain Star Hit/Pitch": 0, "Non Captain Star Pitch": 3, "Batting Stat Bar": 9, "Pitching Stat Bar": 4, "Running Stat Bar": 1, "Fielding Stat Bar": 3, "Name": "Petey", "Fielding Arm": 1, "Batting Stance": 1, "Horizontal Hit Trajectory": 1, "Vertical Hit Trajectory": 1, "Character Class": 1, "Can Be Captain": 0, "Non Captain Star Swing": 1, "Fielding Ability": 1 }, { "Curve Ball Speed": 115, "Fast Ball Speed": 155, "Cursed Ball": 50, "Curve": 70, "Curve Control": 50, "Char Id": 39, "Slap Contact Spot Size": 60, "Charge Contact Spot Size": 25, "Slap Hit Power": 42, "Charge Hit Power": 25, "Bunting": 30, "Speed": 60, "Throwing Arm": 70, "Weight": 1, "Captain Star Hit/Pitch": 0, "Non Captain Star Pitch": 1, "Batting Stat Bar": 2, "Pitching Stat Bar": 5, "Running Stat Bar": 6, "Fielding Stat Bar": 6, "Name": "Dixie", "Fielding Arm": 0, "Batting Stance": 1, "Horizontal Hit Trajectory": 2, "Vertical Hit Trajectory": 2, "Character Class": 3, "Can Be Captain": 0, "Non Captain Star Swing": 2, "Fielding Ability": 4 }, { "Curve Ball Speed": 115, "Fast Ball Speed": 155, "Cursed Ball": 50, "Curve": 50, "Curve Control": 50, "Char Id": 40, "Slap Contact Spot Size": 40, "Charge Contact Spot Size": 15, "Slap Hit Power": 45, "Charge Hit Power": 40, "Bunting": 80, "Speed": 50, "Throwing Arm": 30, "Weight": 0, "Captain Star Hit/Pitch": 0, "Non Captain Star Pitch": 2, "Batting Stat Bar": 4, "Pitching Stat Bar": 3, "Running Stat Bar": 5, "Fielding Stat Bar": 4, "Name": "Goomba", "Fielding Arm": 0, "Batting Stance": 0, "Horizontal Hit Trajectory": 0, "Vertical Hit Trajectory": 0, "Character Class": 0, "Can Be Captain": 0, "Non Captain Star Swing": 2, "Fielding Ability": 0 }, { "Curve Ball Speed": 115, "Fast Ball Speed": 154, "Cursed Ball": 50, "Curve": 50, "Curve Control": 50, "Char Id": 41, "Slap Contact Spot Size": 30, "Charge Contact Spot Size": 15, "Slap Hit Power": 45, "Charge Hit Power": 30, "Bunting": 80, "Speed": 70, "Throwing Arm": 60, "Weight": 0, "Captain Star Hit/Pitch": 0, "Non Captain Star Pitch": 1, "Batting Stat Bar": 3, "Pitching Stat Bar": 2, "Running Stat Bar": 7, "Fielding Stat Bar": 5, "Name": "Paragoomba", "Fielding Arm": 0, "Batting Stance": 0, "Horizontal Hit Trajectory": 0, "Vertical Hit Trajectory": 2, "Character Class": 2, "Can Be Captain": 0, "Non Captain Star Swing": 2, "Fielding Ability": 64 }, { "Curve Ball Speed": 120, "Fast Ball Speed": 165, "Cursed Ball": 50, "Curve": 50, "Curve Control": 50, "Char Id": 42, "Slap Contact Spot Size": 70, "Charge Contact Spot Size": 30, "Slap Hit Power": 40, "Charge Hit Power": 60, "Bunting": 30, "Speed": 30, "Throwing Arm": 50, "Weight": 1, "Captain Star Hit/Pitch": 0, "Non Captain Star Pitch": 2, "Batting Stat Bar": 6, "Pitching Stat Bar": 4, "Running Stat Bar": 3, "Fielding Stat Bar": 5, "Name": "Koopa(G)", "Fielding Arm": 0, "Batting Stance": 1, "Horizontal Hit Trajectory": 0, "Vertical Hit Trajectory": 0, "Character Class": 0, "Can Be Captain": 0, "Non Captain Star Swing": 1, "Fielding Ability": 8 }, { "Curve Ball Speed": 115, "Fast Ball Speed": 155, "Cursed Ball": 50, "Curve": 60, "Curve Control": 50, "Char Id": 43, "Slap Contact Spot Size": 60, "Charge Contact Spot Size": 35, "Slap Hit Power": 40, "Charge Hit Power": 30, "Bunting": 20, "Speed": 60, "Throwing Arm": 60, "Weight": 1, "Captain Star Hit/Pitch": 0, "Non Captain Star Pitch": 1, "Batting Stat Bar": 2, "Pitching Stat Bar": 3, "Running Stat Bar": 6, "Fielding Stat Bar": 4, "Name": "Paratroopa(G)", "Fielding Arm": 0, "Batting Stance": 1, "Horizontal Hit Trajectory": 0, "Vertical Hit Trajectory": 2, "Character Class": 3, "Can Be Captain": 0, "Non Captain Star Swing": 3, "Fielding Ability": 64 }, 
{ "Curve Ball Speed": 120, "Fast Ball Speed": 160, "Cursed Ball": 50, "Curve": 50, "Curve Control": 50, "Char Id": 44, "Slap Contact Spot Size": 50, "Charge Contact Spot Size": 30, "Slap Hit Power": 42, "Charge Hit Power": 50, "Bunting": 25, "Speed": 50, "Throwing Arm": 40, "Weight": 1, "Captain Star Hit/Pitch": 0, "Non Captain Star Pitch": 3, "Batting Stat Bar": 4, "Pitching Stat Bar": 3, "Running Stat Bar": 5, "Fielding Stat Bar": 5, "Name": "Shy Guy(B)", "Fielding Arm": 1, "Batting Stance": 1, "Horizontal Hit Trajectory": 0, "Vertical Hit Trajectory": 0, "Character Class": 0, "Can Be Captain": 0, "Non Captain Star Swing": 2, "Fielding Ability": 8 }, { "Curve Ball Speed": 130, "Fast Ball Speed": 165, "Cursed Ball": 50, "Curve": 55, "Curve Control": 50, "Char Id": 45, "Slap Contact Spot Size": 50, "Charge Contact Spot Size": 30, "Slap Hit Power": 42, "Charge Hit Power": 50, "Bunting": 25, "Speed": 40, "Throwing Arm": 40, "Weight": 1, "Captain Star Hit/Pitch": 0, "Non Captain Star Pitch": 1, "Batting Stat Bar": 4, "Pitching Stat Bar": 4, "Running Stat Bar": 4, "Fielding Stat Bar": 5, "Name": "Shy Guy(Y)", "Fielding Arm": 1, "Batting Stance": 1, "Horizontal Hit Trajectory": 0, "Vertical Hit Trajectory": 0, "Character Class": 0, "Can Be Captain": 0, "Non Captain Star Swing": 2, "Fielding Ability": 8 }, { "Curve Ball Speed": 125, "Fast Ball Speed": 160, "Cursed Ball": 50, "Curve": 60, "Curve Control": 60, "Char Id": 46, "Slap Contact Spot Size": 50, "Charge Contact Spot Size": 30, "Slap Hit Power": 42, "Charge Hit Power": 50, "Bunting": 25, "Speed": 40, "Throwing Arm": 40, "Weight": 1, "Captain Star Hit/Pitch": 0, "Non Captain Star Pitch": 3, "Batting Stat Bar": 4, "Pitching Stat Bar": 4, "Running Stat Bar": 4, "Fielding Stat Bar": 5, "Name": "Shy Guy(G)", "Fielding Arm": 1, "Batting Stance": 1, "Horizontal Hit Trajectory": 0, "Vertical Hit Trajectory": 0, "Character Class": 0, "Can Be Captain": 0, "Non Captain Star Swing": 2, "Fielding Ability": 8 }, { "Curve Ball Speed": 120, "Fast Ball Speed": 160, "Cursed Ball": 50, "Curve": 50, "Curve Control": 50, "Char Id": 47, "Slap Contact Spot Size": 50, "Charge Contact Spot Size": 30, "Slap Hit Power": 42, "Charge Hit Power": 50, "Bunting": 25, "Speed": 40, "Throwing Arm": 50, "Weight": 1, "Captain Star Hit/Pitch": 0, "Non Captain Star Pitch": 2, "Batting Stat Bar": 4, "Pitching Stat Bar": 4, "Running Stat Bar": 4, "Fielding Stat Bar": 6, "Name": "Shy Guy(Bk)", "Fielding Arm": 1, "Batting Stance": 1, "Horizontal Hit Trajectory": 0, "Vertical Hit Trajectory": 0, "Character Class": 0, "Can Be Captain": 0, "Non Captain Star Swing": 1, "Fielding Ability": 8 }, { "Curve Ball Speed": 120, "Fast Ball Speed": 150, "Cursed Ball": 90, "Curve": 50, "Curve Control": 50, "Char Id": 48, "Slap Contact Spot Size": 65, "Charge Contact Spot Size": 25, "Slap Hit Power": 40, "Charge Hit Power": 55, "Bunting": 30, "Speed": 40, "Throwing Arm": 50, "Weight": 1, "Captain Star Hit/Pitch": 0, "Non Captain Star Pitch": 1, "Batting Stat Bar": 5, "Pitching Stat Bar": 4, "Running Stat Bar": 4, "Fielding Stat Bar": 3, "Name": "Dry Bones(Gy)", "Fielding Arm": 1, "Batting Stance": 1, "Horizontal Hit Trajectory": 0, "Vertical Hit Trajectory": 0, "Character Class": 3, "Can Be Captain": 0, "Non Captain Star Swing": 2, "Fielding Ability": 9 }, { "Curve Ball Speed": 120, "Fast Ball Speed": 150, "Cursed Ball": 90, "Curve": 50, "Curve Control": 50, "Char Id": 49, "Slap Contact Spot Size": 70, "Charge Contact Spot Size": 25, "Slap Hit Power": 40, "Charge Hit Power": 55, "Bunting": 30, "Speed": 30, "Throwing Arm": 50, "Weight": 1, "Captain Star Hit/Pitch": 0, "Non Captain Star Pitch": 1, "Batting Stat Bar": 6, "Pitching Stat Bar": 4, "Running Stat Bar": 3, "Fielding Stat Bar": 3, "Name": "Dry Bones(G)", "Fielding Arm": 1, "Batting Stance": 1, "Horizontal Hit Trajectory": 0, "Vertical Hit Trajectory": 0, "Character Class": 3, "Can Be Captain": 0, "Non Captain Star Swing": 3, "Fielding Ability": 9 }, { "Curve Ball Speed": 125, "Fast Ball Speed": 155, "Cursed Ball": 90, "Curve": 50, "Curve Control": 50, "Char Id": 50, "Slap Contact Spot Size": 65, "Charge Contact Spot Size": 25, "Slap Hit Power": 44, "Charge Hit Power": 60, "Bunting": 30, "Speed": 30, "Throwing Arm": 50, "Weight": 1, "Captain Star Hit/Pitch": 0, "Non Captain Star Pitch": 2, "Batting Stat Bar": 6, "Pitching Stat Bar": 4, "Running Stat Bar": 3, "Fielding Stat Bar": 3, "Name": "Dry Bones(R)", "Fielding Arm": 1, "Batting Stance": 1, "Horizontal Hit Trajectory": 0, "Vertical Hit Trajectory": 0, "Character Class": 3, "Can Be Captain": 0, "Non Captain Star Swing": 1, "Fielding Ability": 9 }, { "Curve Ball Speed": 120, "Fast Ball Speed": 150, "Cursed Ball": 90, "Curve": 50, "Curve Control": 50, "Char Id": 51, "Slap Contact Spot Size": 65, "Charge Contact Spot Size": 25, "Slap Hit Power": 40, "Charge Hit Power": 55, "Bunting": 30, "Speed": 30, "Throwing Arm": 60, "Weight": 1, "Captain Star Hit/Pitch": 0, "Non Captain Star Pitch": 3, "Batting Stat Bar": 5, "Pitching Stat Bar": 4, "Running Stat Bar": 3, "Fielding Stat Bar": 4, "Name": "Dry Bones(B)", "Fielding Arm": 1, "Batting Stance": 1, "Horizontal Hit Trajectory": 0, "Vertical Hit Trajectory": 0, "Character Class": 3, "Can Be Captain": 0, "Non Captain Star Swing": 2, "Fielding Ability": 9 }, { "Curve Ball Speed": 125, "Fast Ball Speed": 165, "Cursed Ball": 50, "Curve": 40, "Curve Control": 50, "Char Id": 52, "Slap Contact Spot Size": 30, "Charge Contact Spot Size": 20, "Slap Hit Power": 5, "Charge Hit Power": 90, "Bunting": 15, "Speed": 20, "Throwing Arm": 60, "Weight": 3, "Captain Star Hit/Pitch": 0, "Non Captain Star Pitch": 2, "Batting Stat Bar": 8, "Pitching Stat Bar": 3, "Running Stat Bar": 2, "Fielding Stat Bar": 3, "Name": "Bro(F)", "Fielding Arm": 0, "Batting Stance": 0, "Horizontal Hit Trajectory": 1, "Vertical Hit Trajectory": 2, "Character Class": 1, "Can Be Captain": 0, "Non Captain Star Swing": 2, "Fielding Ability": 1 }, { "Curve Ball Speed": 125, "Fast Ball Speed": 165, "Cursed Ball": 50, "Curve": 40, "Curve Control": 50, "Char Id": 53, "Slap Contact Spot Size": 30, "Charge Contact Spot Size": 20, "Slap Hit Power": 20, "Charge Hit Power": 80, "Bunting": 15, "Speed": 30, "Throwing Arm": 60, "Weight": 3, "Captain Star Hit/Pitch": 0, "Non Captain Star Pitch": 1, "Batting Stat Bar": 8, "Pitching Stat Bar": 3, "Running Stat Bar": 3, "Fielding Stat Bar": 3, "Name": "Bro(B)", "Fielding Arm": 0, "Batting Stance": 0, "Horizontal Hit Trajectory": 0, "Vertical Hit Trajectory": 0, "Character Class": 1, "Can Be Captain": 0, "Non Captain Star Swing": 3, "Fielding Ability": 1 }];

export const pitchType_Curve = 0;
export const pitchType_Charge = 1;
export const pitchType_ChangeUp = 2;

export const aiPitchType_Curve = 0;
export const aiPitchType_Charge = 0;
export const aiPitchType_Star = 0;
export const aiPitchType_Changeup = 0;

export const pitchSubType_CurveCharge = 1;
export const pitchSubType_ChangeUp = 3;
export const pitchSubType_Mario = 4;
export const pitchSubType_Luigi = 5;
export const pitchSubType_Wario = 6;
export const pitchSubType_Walu = 7;
export const pitchSubType_DK = 8;
export const pitchSubType_Diddy = 9;
export const pitchSubType_Bowser = 10;
export const pitchSubType_BJ = 11;
export const pitchSubType_Yoshi = 12;
export const pitchSubType_Birdo = 13;
export const pitchSubType_Peach = 14;
export const pitchSubType_Daisy = 15;
export const pitchSubType_StarCurve = 16;
export const pitchSubType_StarFastball = 17;
export const pitchSubType_StarChangeUp = 18;

export const marioStarPitch = 0x1;
export const luigiStarPitch = 0x2;
export const warioStarPitch = 0x3;
export const waluigiStarPitch = 0x4;
export const dKStarPitch = 0x5;
export const diddyStarPitch = 0x6;
export const bowserStarPitch = 0x7;
export const bJStarPitch = 0x8;
export const yoshiStarPitch = 0x9;
export const birdoStarPitch = 0xa;
export const peachStarPitch = 0xb;
export const daisyStarPitch = 0xc;

export const pitchConstantsArray = [
      [0x96, 0, 0, 0, 0, 0, 0],
      [0x82, 0x19, 0x32, 0xF, 0x14, 0x5, 0x0],
      [0x82, 0x8, 0xA, -20, 0x1E, -2, 0x0],
      [0x82, 0x8, 0xA, 0x1E, 0x23, 0x5, 0x0],
      [0xC8,0xA,0x14,0x0,0x0,0x0,0x0],
      [0xC3,0xF,0x19,0x0,0x0,0x0,0x0],
      [0x5A,0x0,0x0,0xF,0x14,0x0,0x0],
      [0x5A,0x0,0x0,0xF,0x14,0x0,0x0],
      [0x6E,0xA,0x14,0xF,0x1E,0x5,-0x32],
      [0x6E,0x5,0xA,0x5,0x32,0x5,-0x1E],
      [0x32,0x3,0x8,-0x5A,0x37,0x0,0x0],
      [0x32,0x3,0x8,-0x32,0x28,0x0,0x0],
      [0x3C,0x0,0x0,0xF,0x1E,0x1E,0x0],
      [0x3C,0x0,0x0,0x14,0x1E,0x1E,0x0],
      [0x46,0x3,0x8,0x0,0x28,0x0,0x0],
      [0x5A,0x3,0x8,0x19,0x28,0x0,0x0],
      [0x82,0x19,0x41,0x14,0x14,0x5,0x0],
      [0x82,0x8,0xA,0xA,0x1E,-0x2,0x0],
      [0x82,0x8,0xA,0x32,0x32,0x5,0x0]
] 

export const bulletBallConstants = [[0x14, 0x23, 0x28, 0x37, -0x1], [0x19, 0x26, 0x1e, 0x37, 0xc8]]

export const BatterHitbox = [{ 'HorizontalRangeNear': -0.6499999761581421, 'HorizontalRangeFar': 0.550000011920929, 'VerticalRangeFront': -0.20000000298023224, 'VerticalRangeBack': 1.5, 'EasyBattingSpotHorizontal': -2.0999999046325684, 'EasyBattingSpotVertical': -1.0, 'BoxMoveSpeed': 0.05000000074505806, 'PitchingHeight': 1.0, 'TrimmedBat': 0.0 }, { 'HorizontalRangeNear': -0.6499999761581421, 'HorizontalRangeFar': 0.6499999761581421, 'VerticalRangeFront': 0.30000001192092896, 'VerticalRangeBack': 1.899999976158142, 'EasyBattingSpotHorizontal': -1.7999999523162842, 'EasyBattingSpotVertical': -1.0, 'BoxMoveSpeed': 0.05000000074505806, 'PitchingHeight': 1.0, 'TrimmedBat': 0.0 }, { 'HorizontalRangeNear': -0.550000011920929, 'HorizontalRangeFar': 0.6499999761581421, 'VerticalRangeFront': 0.4000000059604645, 'VerticalRangeBack': 1.399999976158142, 'EasyBattingSpotHorizontal': -2.6500000953674316, 'EasyBattingSpotVertical': -1.0, 'BoxMoveSpeed': 0.05000000074505806, 'PitchingHeight': 1.0, 'TrimmedBat': 1.0 }, { 'HorizontalRangeNear': -0.550000011920929, 'HorizontalRangeFar': 0.550000011920929, 'VerticalRangeFront': -0.30000001192092896, 'VerticalRangeBack': 1.7999999523162842, 'EasyBattingSpotHorizontal': -1.7000000476837158, 'EasyBattingSpotVertical': -1.0, 'BoxMoveSpeed': 0.05000000074505806, 'PitchingHeight': 1.0, 'TrimmedBat': 0.0 }, { 'HorizontalRangeNear': -0.75, 'HorizontalRangeFar': 0.5, 'VerticalRangeFront': 0.10000000149011612, 'VerticalRangeBack': 1.5, 'EasyBattingSpotHorizontal': -1.899999976158142, 'EasyBattingSpotVertical': -1.2999999523162842, 'BoxMoveSpeed': 0.05000000074505806, 'PitchingHeight': 1.0, 'TrimmedBat': 0.0 }, { 'HorizontalRangeNear': -0.6499999761581421, 'HorizontalRangeFar': 0.6000000238418579, 'VerticalRangeFront': -0.20000000298023224, 'VerticalRangeBack': 1.600000023841858, 'EasyBattingSpotHorizontal': -2.0, 'EasyBattingSpotVertical': -1.2999999523162842, 'BoxMoveSpeed': 0.05000000074505806, 'PitchingHeight': 1.0, 'TrimmedBat': 0.0 }, { 'HorizontalRangeNear': -0.6499999761581421, 'HorizontalRangeFar': 0.6499999761581421, 'VerticalRangeFront': 0.20000000298023224, 'VerticalRangeBack': 1.5, 'EasyBattingSpotHorizontal': -2.049999952316284, 'EasyBattingSpotVertical': -1.0, 'BoxMoveSpeed': 0.05000000074505806, 'PitchingHeight': 1.0, 'TrimmedBat': 0.0 }, { 'HorizontalRangeNear': -0.75, 'HorizontalRangeFar': 0.550000011920929, 'VerticalRangeFront': -0.10000000149011612, 'VerticalRangeBack': 1.7000000476837158, 'EasyBattingSpotHorizontal': -1.7999999523162842, 'EasyBattingSpotVertical': -1.2999999523162842, 'BoxMoveSpeed': 0.05000000074505806, 'PitchingHeight': 1.0, 'TrimmedBat': 0.0 }, { 'HorizontalRangeNear': -0.6499999761581421, 'HorizontalRangeFar': 0.550000011920929, 'VerticalRangeFront': -0.10000000149011612, 'VerticalRangeBack': 1.7999999523162842, 'EasyBattingSpotHorizontal': -1.899999976158142, 'EasyBattingSpotVertical': -1.149999976158142, 'BoxMoveSpeed': 0.05000000074505806, 'PitchingHeight': 1.0, 'TrimmedBat': 0.0 }, { 'HorizontalRangeNear': -0.550000011920929, 'HorizontalRangeFar': 1.4500000476837158, 'VerticalRangeFront': 0.10000000149011612, 'VerticalRangeBack': 0.20000000298023224, 'EasyBattingSpotHorizontal': -3.5999999046325684, 'EasyBattingSpotVertical': -1.0, 'BoxMoveSpeed': 0.05000000074505806, 'PitchingHeight': 1.0, 'TrimmedBat': 0.0 }, { 'HorizontalRangeNear': -0.550000011920929, 'HorizontalRangeFar': 0.75, 'VerticalRangeFront': 0.4000000059604645, 'VerticalRangeBack': 1.5, 'EasyBattingSpotHorizontal': -2.4000000953674316, 'EasyBattingSpotVertical': -1.600000023841858, 'BoxMoveSpeed': 0.05000000074505806, 'PitchingHeight': 1.0, 'TrimmedBat': 0.0 }, { 'HorizontalRangeNear': -0.550000011920929, 'HorizontalRangeFar': 0.8500000238418579, 'VerticalRangeFront': 0.30000001192092896, 'VerticalRangeBack': 1.5, 'EasyBattingSpotHorizontal': -2.299999952316284, 'EasyBattingSpotVertical': -1.0, 'BoxMoveSpeed': 0.05000000074505806, 'PitchingHeight': 1.0, 'TrimmedBat': 0.0 }, { 'HorizontalRangeNear': -0.5, 'HorizontalRangeFar': 0.550000011920929, 'VerticalRangeFront': -0.20000000298023224, 'VerticalRangeBack': 1.600000023841858, 'EasyBattingSpotHorizontal': -2.1500000953674316, 'EasyBattingSpotVertical': -1.0, 'BoxMoveSpeed': 0.05000000074505806, 'PitchingHeight': 1.0, 'TrimmedBat': 0.0 }, { 'HorizontalRangeNear': -0.949999988079071, 'HorizontalRangeFar': 0.550000011920929, 'VerticalRangeFront': -0.10000000149011612, 'VerticalRangeBack': 1.7999999523162842, 'EasyBattingSpotHorizontal': -1.7000000476837158, 'EasyBattingSpotVertical': -1.0, 'BoxMoveSpeed': 0.05000000074505806, 'PitchingHeight': 0.75, 'TrimmedBat': 0.0 }, { 'HorizontalRangeNear': -0.44999998807907104, 'HorizontalRangeFar': 0.8500000238418579, 'VerticalRangeFront': -0.10000000149011612, 'VerticalRangeBack': 1.600000023841858, 'EasyBattingSpotHorizontal': -2.4000000953674316, 'EasyBattingSpotVertical': -1.0, 'BoxMoveSpeed': 0.05000000074505806, 'PitchingHeight': 1.100000023841858, 'TrimmedBat': 0.0 }, { 'HorizontalRangeNear': -0.6499999761581421, 'HorizontalRangeFar': 0.5, 'VerticalRangeFront': -0.10000000149011612, 'VerticalRangeBack': 1.7000000476837158, 'EasyBattingSpotHorizontal': -1.7999999523162842, 'EasyBattingSpotVertical': -1.0, 'BoxMoveSpeed': 0.05000000074505806, 'PitchingHeight': 0.75, 'TrimmedBat': 0.0 }, { 'HorizontalRangeNear': -0.550000011920929, 'HorizontalRangeFar': 0.6499999761581421, 'VerticalRangeFront': -0.10000000149011612, 'VerticalRangeBack': 1.399999976158142, 'EasyBattingSpotHorizontal': -2.5, 'EasyBattingSpotVertical': -1.0, 'BoxMoveSpeed': 0.05000000074505806, 'PitchingHeight': 1.0, 'TrimmedBat': 0.0 }, { 'HorizontalRangeNear': -0.550000011920929, 'HorizontalRangeFar': 0.550000011920929, 'VerticalRangeFront': 0.10000000149011612, 'VerticalRangeBack': 1.7999999523162842, 'EasyBattingSpotHorizontal': -1.899999976158142, 'EasyBattingSpotVertical': -1.0, 'BoxMoveSpeed': 0.05000000074505806, 'PitchingHeight': 1.0, 'TrimmedBat': 0.0 }, { 'HorizontalRangeNear': -0.550000011920929, 'HorizontalRangeFar': 0.8500000238418579, 'VerticalRangeFront': 0.30000001192092896, 'VerticalRangeBack': 1.399999976158142, 'EasyBattingSpotHorizontal': -2.5, 'EasyBattingSpotVertical': -1.0, 'BoxMoveSpeed': 0.05000000074505806, 'PitchingHeight': 1.0, 'TrimmedBat': 0.0 }, { 'HorizontalRangeNear': -0.6499999761581421, 'HorizontalRangeFar': 0.6499999761581421, 'VerticalRangeFront': 0.20000000298023224, 'VerticalRangeBack': 1.399999976158142, 'EasyBattingSpotHorizontal': -2.5, 'EasyBattingSpotVertical': -1.0, 'BoxMoveSpeed': 0.05000000074505806, 'PitchingHeight': 1.0, 'TrimmedBat': 0.0 }, { 'HorizontalRangeNear': -0.550000011920929, 'HorizontalRangeFar': 0.6499999761581421, 'VerticalRangeFront': -0.20000000298023224, 'VerticalRangeBack': 1.600000023841858, 'EasyBattingSpotHorizontal': -2.200000047683716, 'EasyBattingSpotVertical': -1.0, 'BoxMoveSpeed': 0.05000000074505806, 'PitchingHeight': 1.0, 'TrimmedBat': 0.0 }, { 'HorizontalRangeNear': -0.44999998807907104, 'HorizontalRangeFar': 0.8500000238418579, 'VerticalRangeFront': 0.5, 'VerticalRangeBack': 1.2999999523162842, 'EasyBattingSpotHorizontal': -2.299999952316284, 'EasyBattingSpotVertical': -1.0, 'BoxMoveSpeed': 0.05000000074505806, 'PitchingHeight': 1.0, 'TrimmedBat': 0.0 }, { 'HorizontalRangeNear': -0.44999998807907104, 'HorizontalRangeFar': 0.8500000238418579, 'VerticalRangeFront': 0.5, 'VerticalRangeBack': 1.2999999523162842, 'EasyBattingSpotHorizontal': -2.299999952316284, 'EasyBattingSpotVertical': -1.0, 'BoxMoveSpeed': 0.05000000074505806, 'PitchingHeight': 1.0, 'TrimmedBat': 0.0 }, { 'HorizontalRangeNear': -0.44999998807907104, 'HorizontalRangeFar': 0.8500000238418579, 'VerticalRangeFront': 0.5, 'VerticalRangeBack': 1.2999999523162842, 'EasyBattingSpotHorizontal': -2.299999952316284, 'EasyBattingSpotVertical': -1.0, 'BoxMoveSpeed': 0.05000000074505806, 'PitchingHeight': 1.0, 'TrimmedBat': 0.0 }, { 'HorizontalRangeNear': -0.6499999761581421, 'HorizontalRangeFar': 0.6499999761581421, 'VerticalRangeFront': 0.10000000149011612, 'VerticalRangeBack': 1.399999976158142, 'EasyBattingSpotHorizontal': -2.0, 'EasyBattingSpotVertical': -1.2000000476837158, 'BoxMoveSpeed': 0.05000000074505806, 'PitchingHeight': 1.0, 'TrimmedBat': 0.0 }, { 'HorizontalRangeNear': -0.6499999761581421, 'HorizontalRangeFar': 0.6499999761581421, 'VerticalRangeFront': 0.10000000149011612, 'VerticalRangeBack': 1.399999976158142, 'EasyBattingSpotHorizontal': -2.0, 'EasyBattingSpotVertical': -1.2000000476837158, 'BoxMoveSpeed': 0.05000000074505806, 'PitchingHeight': 1.0, 'TrimmedBat': 0.0 }, { 'HorizontalRangeNear': -0.6499999761581421, 'HorizontalRangeFar': 0.6499999761581421, 'VerticalRangeFront': 0.10000000149011612, 'VerticalRangeBack': 1.399999976158142, 'EasyBattingSpotHorizontal': -2.0, 'EasyBattingSpotVertical': -1.2000000476837158, 'BoxMoveSpeed': 0.05000000074505806, 'PitchingHeight': 1.0, 'TrimmedBat': 0.0 }, { 'HorizontalRangeNear': -0.6499999761581421, 'HorizontalRangeFar': 0.6499999761581421, 'VerticalRangeFront': -0.20000000298023224, 'VerticalRangeBack': 1.2000000476837158, 'EasyBattingSpotHorizontal': -1.7000000476837158, 'EasyBattingSpotVertical': -1.0, 'BoxMoveSpeed': 0.05000000074505806, 'PitchingHeight': 1.0, 'TrimmedBat': 1.0 }, { 'HorizontalRangeNear': -0.6499999761581421, 'HorizontalRangeFar': 0.550000011920929, 'VerticalRangeFront': -0.10000000149011612, 'VerticalRangeBack': 1.600000023841858, 'EasyBattingSpotHorizontal': -1.75, 'EasyBattingSpotVertical': -1.0, 'BoxMoveSpeed': 0.05000000074505806, 'PitchingHeight': 0.75, 'TrimmedBat': 1.0 }, { 'HorizontalRangeNear': -0.44999998807907104, 'HorizontalRangeFar': 0.44999998807907104, 'VerticalRangeFront': -0.6000000238418579, 'VerticalRangeBack': 1.2000000476837158, 'EasyBattingSpotHorizontal': -1.7000000476837158, 'EasyBattingSpotVertical': -1.0, 'BoxMoveSpeed': 0.05000000074505806, 'PitchingHeight': 0.75, 'TrimmedBat': 0.0 }, 
{ 'HorizontalRangeNear': -0.44999998807907104, 'HorizontalRangeFar': 0.44999998807907104, 'VerticalRangeFront': -0.6000000238418579, 'VerticalRangeBack': 1.2000000476837158, 'EasyBattingSpotHorizontal': -1.7000000476837158, 'EasyBattingSpotVertical': -1.0, 'BoxMoveSpeed': 0.05000000074505806, 'PitchingHeight': 0.75, 'TrimmedBat': 0.0 }, { 'HorizontalRangeNear': -0.44999998807907104, 'HorizontalRangeFar': 0.44999998807907104, 'VerticalRangeFront': -0.6000000238418579, 'VerticalRangeBack': 1.2000000476837158, 'EasyBattingSpotHorizontal': -1.7000000476837158, 'EasyBattingSpotVertical': -1.0, 'BoxMoveSpeed': 0.05000000074505806, 'PitchingHeight': 0.75, 'TrimmedBat': 0.0 }, { 'HorizontalRangeNear': -0.44999998807907104, 'HorizontalRangeFar': 0.44999998807907104, 'VerticalRangeFront': -0.6000000238418579, 'VerticalRangeBack': 1.2000000476837158, 'EasyBattingSpotHorizontal': -1.7000000476837158, 'EasyBattingSpotVertical': -1.0, 'BoxMoveSpeed': 0.05000000074505806, 'PitchingHeight': 0.75, 'TrimmedBat': 0.0 }, { 'HorizontalRangeNear': -0.6000000238418579, 'HorizontalRangeFar': 0.699999988079071, 'VerticalRangeFront': -0.20000000298023224, 'VerticalRangeBack': 1.5, 'EasyBattingSpotHorizontal': -2.0, 'EasyBattingSpotVertical': -1.0, 'BoxMoveSpeed': 0.05000000074505806, 'PitchingHeight': 1.0, 'TrimmedBat': 0.0 }, { 'HorizontalRangeNear': -0.6000000238418579, 'HorizontalRangeFar': 0.699999988079071, 'VerticalRangeFront': -0.20000000298023224, 'VerticalRangeBack': 1.5, 'EasyBattingSpotHorizontal': -2.0, 'EasyBattingSpotVertical': -1.0, 'BoxMoveSpeed': 0.05000000074505806, 'PitchingHeight': 1.0, 'TrimmedBat': 0.0 }, { 'HorizontalRangeNear': -0.6000000238418579, 'HorizontalRangeFar': 0.699999988079071, 'VerticalRangeFront': -0.20000000298023224, 'VerticalRangeBack': 1.5, 'EasyBattingSpotHorizontal': -2.0, 'EasyBattingSpotVertical': -1.0, 'BoxMoveSpeed': 0.05000000074505806, 'PitchingHeight': 1.0, 'TrimmedBat': 0.0 }, { 'HorizontalRangeNear': -0.6000000238418579, 'HorizontalRangeFar': 0.699999988079071, 'VerticalRangeFront': -0.20000000298023224, 'VerticalRangeBack': 1.5, 'EasyBattingSpotHorizontal': -2.0, 'EasyBattingSpotVertical': -1.0, 'BoxMoveSpeed': 0.05000000074505806, 'PitchingHeight': 1.0, 'TrimmedBat': 0.0 }, { 'HorizontalRangeNear': -0.6499999761581421, 'HorizontalRangeFar': 0.6499999761581421, 'VerticalRangeFront': -0.10000000149011612, 'VerticalRangeBack': 1.7999999523162842, 'EasyBattingSpotHorizontal': -2.299999952316284, 'EasyBattingSpotVertical': -1.0, 'BoxMoveSpeed': 0.05000000074505806, 'PitchingHeight': 1.2000000476837158, 'TrimmedBat': 0.0 }, { 'HorizontalRangeNear': -0.6499999761581421, 'HorizontalRangeFar': 0.6499999761581421, 'VerticalRangeFront': -0.20000000298023224, 'VerticalRangeBack': 1.2000000476837158, 'EasyBattingSpotHorizontal': -1.899999976158142, 'EasyBattingSpotVertical': -1.399999976158142, 'BoxMoveSpeed': 0.05000000074505806, 'PitchingHeight': 1.100000023841858, 'TrimmedBat': 0.0 }, { 'HorizontalRangeNear': -0.6499999761581421, 'HorizontalRangeFar': 0.550000011920929, 'VerticalRangeFront': 0.20000000298023224, 'VerticalRangeBack': 1.7000000476837158, 'EasyBattingSpotHorizontal': -1.600000023841858, 'EasyBattingSpotVertical': -1.0, 'BoxMoveSpeed': 0.05000000074505806, 'PitchingHeight': 1.2000000476837158, 'TrimmedBat': 0.0 }, { 'HorizontalRangeNear': -0.550000011920929, 'HorizontalRangeFar': 0.550000011920929, 'VerticalRangeFront': 0.0, 'VerticalRangeBack': 1.5, 'EasyBattingSpotHorizontal': -2.0999999046325684, 'EasyBattingSpotVertical': -1.0, 'BoxMoveSpeed': 0.05000000074505806, 'PitchingHeight': 0.75, 'TrimmedBat': 0.0 }, { 'HorizontalRangeNear': -0.550000011920929, 'HorizontalRangeFar': 0.550000011920929, 'VerticalRangeFront': -0.20000000298023224, 'VerticalRangeBack': 1.399999976158142, 'EasyBattingSpotHorizontal': -2.299999952316284, 'EasyBattingSpotVertical': -1.0, 'BoxMoveSpeed': 0.05000000074505806, 'PitchingHeight': 1.0, 'TrimmedBat': 0.0 }, { 'HorizontalRangeNear': -0.5, 'HorizontalRangeFar': 0.550000011920929, 'VerticalRangeFront': -0.20000000298023224, 'VerticalRangeBack': 1.600000023841858, 'EasyBattingSpotHorizontal': -2.1500000953674316, 'EasyBattingSpotVertical': -1.0, 'BoxMoveSpeed': 0.05000000074505806, 'PitchingHeight': 1.0, 'TrimmedBat': 0.0 }, { 'HorizontalRangeNear': -0.550000011920929, 'HorizontalRangeFar': 0.6499999761581421, 'VerticalRangeFront': -0.20000000298023224, 'VerticalRangeBack': 1.600000023841858, 'EasyBattingSpotHorizontal': -2.0999999046325684, 'EasyBattingSpotVertical': -1.0, 'BoxMoveSpeed': 0.05000000074505806, 'PitchingHeight': 1.0, 'TrimmedBat': 0.0 }, { 'HorizontalRangeNear': -0.550000011920929, 'HorizontalRangeFar': 0.6499999761581421, 'VerticalRangeFront': -0.10000000149011612, 'VerticalRangeBack': 1.399999976158142, 'EasyBattingSpotHorizontal': -2.5, 'EasyBattingSpotVertical': -1.0, 'BoxMoveSpeed': 0.05000000074505806, 'PitchingHeight': 1.0, 'TrimmedBat': 0.0 }, { 'HorizontalRangeNear': -0.550000011920929, 'HorizontalRangeFar': 0.6499999761581421, 'VerticalRangeFront': -0.10000000149011612, 'VerticalRangeBack': 1.399999976158142, 'EasyBattingSpotHorizontal': -2.5, 'EasyBattingSpotVertical': -1.0, 'BoxMoveSpeed': 0.05000000074505806, 'PitchingHeight': 1.0, 'TrimmedBat': 0.0 }, { 'HorizontalRangeNear': -0.550000011920929, 'HorizontalRangeFar': 0.6499999761581421, 'VerticalRangeFront': -0.10000000149011612, 'VerticalRangeBack': 1.399999976158142, 'EasyBattingSpotHorizontal': -2.5, 'EasyBattingSpotVertical': -1.0, 'BoxMoveSpeed': 0.05000000074505806, 'PitchingHeight': 1.0, 'TrimmedBat': 0.0 }, { 'HorizontalRangeNear': -0.550000011920929, 'HorizontalRangeFar': 0.6499999761581421, 'VerticalRangeFront': -0.10000000149011612, 'VerticalRangeBack': 1.399999976158142, 'EasyBattingSpotHorizontal': -2.5, 'EasyBattingSpotVertical': -1.0, 'BoxMoveSpeed': 0.05000000074505806, 'PitchingHeight': 1.0, 'TrimmedBat': 0.0 }, { 'HorizontalRangeNear': -0.75, 'HorizontalRangeFar': 0.550000011920929, 'VerticalRangeFront': -0.10000000149011612, 'VerticalRangeBack': 1.2999999523162842, 'EasyBattingSpotHorizontal': -1.899999976158142, 'EasyBattingSpotVertical': -1.100000023841858, 'BoxMoveSpeed': 0.05000000074505806, 'PitchingHeight': 1.0, 'TrimmedBat': 0.0 }, { 'HorizontalRangeNear': -0.75, 'HorizontalRangeFar': 0.550000011920929, 'VerticalRangeFront': -0.10000000149011612, 'VerticalRangeBack': 1.2999999523162842, 'EasyBattingSpotHorizontal': -1.899999976158142, 'EasyBattingSpotVertical': -1.100000023841858, 'BoxMoveSpeed': 0.05000000074505806, 'PitchingHeight': 1.0, 'TrimmedBat': 0.0 }, { 'HorizontalRangeNear': -0.75, 'HorizontalRangeFar': 0.550000011920929, 'VerticalRangeFront': -0.10000000149011612, 'VerticalRangeBack': 1.2999999523162842, 'EasyBattingSpotHorizontal': -1.899999976158142, 'EasyBattingSpotVertical': -1.100000023841858, 'BoxMoveSpeed': 0.05000000074505806, 'PitchingHeight': 1.0, 'TrimmedBat': 0.0 }, { 'HorizontalRangeNear': -0.75, 'HorizontalRangeFar': 0.550000011920929, 'VerticalRangeFront': -0.10000000149011612, 'VerticalRangeBack': 1.2999999523162842, 'EasyBattingSpotHorizontal': -1.899999976158142, 'EasyBattingSpotVertical': -1.100000023841858, 'BoxMoveSpeed': 0.05000000074505806, 'PitchingHeight': 1.0, 'TrimmedBat': 0.0 }, { 'HorizontalRangeNear': -0.6499999761581421, 'HorizontalRangeFar': 0.6499999761581421, 'VerticalRangeFront': -0.20000000298023224, 'VerticalRangeBack': 1.2000000476837158, 'EasyBattingSpotHorizontal': -1.7000000476837158, 'EasyBattingSpotVertical': -1.0, 'BoxMoveSpeed': 0.05000000074505806, 'PitchingHeight': 1.0, 'TrimmedBat': 1.0 }, { 'HorizontalRangeNear': -0.6499999761581421, 'HorizontalRangeFar': 0.6499999761581421, 'VerticalRangeFront': -0.20000000298023224, 'VerticalRangeBack': 1.2000000476837158, 'EasyBattingSpotHorizontal': -1.7000000476837158, 'EasyBattingSpotVertical': -1.0, 'BoxMoveSpeed': 0.05000000074505806, 'PitchingHeight': 1.0, 'TrimmedBat': 1.0 }]

export const BatterHitboxMultiplier = [[1.18, 1.1], [1.18, 1.1], [1.11, 1.0], [1.18, 1.15], [1.18, 1.08], [1.18, 1.1], [1.18, 1.1], [1.2, 1.1], [1.2, 1.18], [1.0, 0.8], 
                                [1.18, 1.06], [1.0, 0.8], [1.18, 1.1], [1.4, 1.32], [1.2, 1.12], [1.4, 1.32], [1.2, 1.12], [1.18, 1.1], [1.0, 0.92], [1.2, 1.12],
                                [1.2, 1.12], [1.2, 1.08], [1.2, 1.08], [1.2, 1.08], [1.2, 1.12], [1.2, 1.12], [1.2, 1.12], [1.2, 1.12], [1.4, 1.32], [1.4, 1.32],
                                [1.4, 1.32], [1.4, 1.32], [1.4, 1.32], [1.2, 1.12], [1.2, 1.12], [1.2, 1.12], [1.2, 1.12], [1.2, 1.12], [1.1, 0.7], [1.18, 1.15],
                                [1.2, 1.12], [1.2, 1.12], [1.18, 1.1], [1.2, 1.12], [1.2, 1.12], [1.2, 1.12], [1.2, 1.12], [1.2, 1.12], [1.2, 1.12], [1.2, 1.12],
                                [1.2, 1.12], [1.2, 1.12], [1.2, 1.12], [1.2, 1.12]]

export const charIDMapping:any = {
      0: "Mario",
      1: "Luigi",
      2: "DK",
      3: "Diddy",
      4: "Peach",
      5: "Daisy",
      6: "Yoshi",
      7: "Baby Mario",
      8: "Baby Luigi",
      9: "Bowser",
      10: "Wario",
      11: "Waluigi",
      12: "Koopa(G)",
      13: "Toad(R)",
      14: "Boo",
      15: "Toadette",
      16: "Shy Guy(R)",
      17: "Birdo",
      18: "Monty",
      19: "Bowser Jr",
      20: "Paratroopa(R)",
      21: "Pianta(B)",
      22: "Pianta(R)",
      23: "Pianta(Y)",
      24: "Noki(B)",
      25: "Noki(R)",
      26: "Noki(G)",
      27: "Bro(H)",
      28: "Toadsworth",
      29: "Toad(B)",
      30: "Toad(Y)",
      31: "Toad(G)",
      32: "Toad(P)",
      33: "Magikoopa(B)",
      34: "Magikoopa(R)",
      35: "Magikoopa(G)",
      36: "Magikoopa(Y)",
      37: "King Boo",
      38: "Petey",
      39: "Dixie",
      40: "Goomba",
      41: "Paragoomba",
      42: "Koopa(R)",
      43: "Paratroopa(G)",
      44: "Shy Guy(B)",
      45: "Shy Guy(Y)",
      46: "Shy Guy(G)",
      47: "Shy Guy(Bk)",
      48: "Dry Bones(Gy)",
      49: "Dry Bones(G)",
      50: "Dry Bones(R)",
      51: "Dry Bones(B)",
      52: "Bro(F)",
      53: "Bro(B)"
  }

  export const charIDNoDupMapping:any = {
      0: 0,
      1: 1,
      2: 2,
      3: 3,
      4: 4,
      5: 5,
      6: 6,
      7: 7,
      8: 8,
      9: 9,
      10: 10,
      11: 11,
      12: 12,
      13: 13,
      14: 14,
      15: 15,
      16: 16,
      17: 17,
      18: 18,
      19: 19,
      20: 20,
      21: 21,
      22: 21,
      23: 21,
      24: 22,
      25: 22,
      26: 22,
      27: 23,
      28: 24,
      29: 13,
      30: 13,
      31: 13,
      32: 13,
      33: 25,
      34: 25,
      35: 25,
      36: 25,
      37: 26,
      38: 27,
      39: 28,
      40: 29,
      41: 30,
      42: 12,
      43: 20,
      44: 16,
      45: 16,
      46: 16,
      47: 16,
      48: 31,
      49: 31,
      50: 31,
      51: 31,
      52: 23,
      53: 23
  }

// Coordinates of pitch start, assuming right handed and no movement on mound. Array uses no duplicate character ID. 
export const pitchBaseReleaseCoordinates = [
      {'curve': {'X': -0.358750939, 'Y': 2.9281559, 'Z': 17.6997108}, 'charge': {'X': -0.370488256, 'Y': 2.83268118, 'Z': 17.872982}},
      {'curve': {'X': 0.221170574, 'Y': 2.30373907, 'Z': 18.0957241}, 'charge': {'X': -0.253166497, 'Y': 2.7028234, 'Z': 17.5246811}},
      {'curve': {'X': -2.04435539, 'Y': 2.03053284, 'Z': 16.223959}, 'charge': {'X': -2.04427075, 'Y': 2.03053284, 'Z': 16.2238922}},
      {'curve': {'X': -0.484804153, 'Y': 2.21302128, 'Z': 18.831337}, 'charge': {'X': -0.422204643, 'Y': 2.27686, 'Z': 19.3343658}},
      {'curve': {'X': -0.0703445852, 'Y': 2.16658092, 'Z': 18.1502056}, 'charge': {'X': -0.131633073, 'Y': 2.19204974, 'Z': 19.2481537}}, //4
      {'curve': {'X': -0.281522155, 'Y': 1.16270649, 'Z': 17.975111}, 'charge': {'X': -0.462917864, 'Y': 0.998229444, 'Z': 17.4418068}},
      {'curve': {'X': -0.0526904576, 'Y': 1.73863459, 'Z': 17.0554199}, 'charge': {'X': -0.102338329, 'Y': 1.74589205, 'Z': 17.2527218}},
      {'curve': {'X': -0.294910491, 'Y': 0.501412511, 'Z': 17.8377438}, 'charge': {'X': -0.293749392, 'Y': 1.67534804, 'Z': 18.0460491}},
      {'curve': {'X': -0.100495219, 'Y': 1.24129128, 'Z': 17.8929539}, 'charge': {'X': -0.204690278, 'Y': 1.14138937, 'Z': 18.3971405}},
      {'curve': {'X': -1.1208117, 'Y': 2.37041189, 'Z': 17.7443905}, 'charge': {'X': -0.935231805, 'Y': 2.83790755, 'Z': 17.9320602}},// 9
      {'curve': {'X': -0.218430877, 'Y': 2.11808395, 'Z': 18.0982456}, 'charge': {'X': -0.387497813, 'Y': 2.14200447, 'Z': 18.0287138}},
      {'curve': {'X': -0.0994037464, 'Y': 2.91129541, 'Z': 16.6599312}, 'charge': {'X': -0.0872518569, 'Y': 2.91058898, 'Z': 16.6630745}},
      {'curve': {'X': -0.0643017143, 'Y': 1.38116789, 'Z': 18.2691517}, 'charge': {'X': -0.0115943998, 'Y': 1.42475438, 'Z': 18.2572403}},
      {'curve': {'X': 0.0409559123, 'Y': 1.2589829, 'Z': 17.795105}, 'charge': {'X': 0.0392686874, 'Y': 1.24723339, 'Z': 17.8072586}},
      {'curve': {'X': -0.976979315, 'Y': 2.43798327, 'Z': 16.8721886}, 'charge': {'X': -1.05723453, 'Y': 3.21649265, 'Z': 17.1067276}},// 14
      {'curve': {'X': -0.432494819, 'Y': 1.53251338, 'Z': 17.9790344}, 'charge': {'X': -0.442466974, 'Y': 0.960499167, 'Z': 18.0559368}},
      {'curve': {'X': -0.525757074, 'Y': 4.07900000, 'Z': 18.8315792}, 'charge': {'X': -0.491243154, 'Y': 3.79274869, 'Z': 18.9465904}},
      {'curve': {'X': -0.408602893, 'Y': 0.954139769, 'Z': 18.4027977}, 'charge': {'X': -0.185714141, 'Y': 0.965393066, 'Z': 18.973381}},
      {'curve': {'X': -0.392196894, 'Y': 1.25717086, 'Z': 15.9324245}, 'charge': {'X': -0.337694883, 'Y': 1.46883655, 'Z': 15.9852085}},
      {'curve': {'X': -1.17502844, 'Y': 0.908061326, 'Z': 18.7266293}, 'charge': {'X': -0.954403996, 'Y': 1.51448655, 'Z': 18.1687946}},// 19
      {'curve': {'X': -0.0549990535, 'Y': 2.26200676, 'Z': 18.3726215}, 'charge': {'X': 0.0554796606, 'Y': 2.54858708, 'Z': 18.4819603}},
      {'curve': {'X': -0.902026832, 'Y': 2.77712846, 'Z': 17.7310047}, 'charge': {'X': -1.41902661, 'Y': 4.07295799, 'Z': 16.8742599}},
      {'curve': {'X': -1.00128365, 'Y': 1.20490992, 'Z': 18.1284885}, 'charge': {'X': -0.832903445, 'Y': 2.27637315, 'Z': 17.8932285}},
      {'curve': {'X': 0.276068062, 'Y': 3.39618778, 'Z': 19.1116161}, 'charge': {'X': -0.770916998, 'Y': 2.54096055, 'Z': 18.5399666}},
      {'curve': {'X': -0.645938098, 'Y': 0.680195332, 'Z': 18.2057915}, 'charge': {'X': -0.0759834051, 'Y': 1.17852771, 'Z': 18.0417519}},// 24
      {'curve': {'X': -0.0110720694, 'Y': 1.12154889, 'Z': 17.2940254}, 'charge': {'X': 0.274167657, 'Y': 1.36672831, 'Z': 17.4065056}},
      {'curve': {'X': -1.19448996, 'Y': 2.59314823, 'Z': 16.9215889}, 'charge': {'X': -1.27474511, 'Y': 3.37165785, 'Z': 17.1561279}},
      {'curve': {'X': -0.541439176, 'Y': 1.78280687, 'Z': 17.56321}, 'charge': {'X': -1.13070774, 'Y': 1.67450738, 'Z': 17.7182236}},
      {'curve': {'X': -1.3091619, 'Y': 1.27092195, 'Z': 18.7103424}, 'charge': {'X': -0.379683375, 'Y': 1.10366392, 'Z': 18.385828}},
      {'curve': {'X': -0.294719875, 'Y': 1.01028323, 'Z': 17.451561}, 'charge': {'X': -0.729693174, 'Y': 0.665731907, 'Z': 18.527298}},// 29
      {'curve': {'X': -0.795248866, 'Y': 2.18529749, 'Z': 18.4609985}, 'charge': {'X': -0.7055155504, 'Y': 3.25615358, 'Z': 18.637495}},
      {'curve': {'X': -0.137758076, 'Y': 2.01307893, 'Z': 18.0202503}, 'charge': {'X': -0.30223608, 'Y': 2.3172307, 'Z': 18.1311436}}
]

export const aIMoundLocationProbabilities = [
      [15, 20, 30, 20, 15, 10],
      [30, 0, 40, 0, 30, 20],
      [20, 20, 20, 20, 20, 2],
      [25, 20, 10, 20, 25, 8]
]

export const starLikelihoodArray = [
      [0, 10, 20, 40],
      [0, 15, 20, 25],
      [0, 15, 25, 25],
      [0, 20, 30, 35],
      [0, 25, 35, 40]
]

export const chargePitchProb = [
      [10, 35, 50, 60],
      [15, 40, 60, 70],
      [10, 30, 45, 55],
      [5, 20, 40, 50]
]

export const perfectPitchProb = [
      [5, 10, 15, 30],
      [10, 15, 20, 50],
      [15, 20, 40, 60]
]

export const changeUpProb = [
      [0, 5, 10, 15],
      [0, 5, 5, 15],
      [0, 5, 10, 10],
      [0, 10, 20, 40]
]

export const aiPitchWeakCurveProbabilities = [36, 25, 10, 5]

export const aIPitchCurveEndingXConstants = [-0.65, -0.5, -0.25, 0.0, 0.25, 0.5, 0.65]
export const pitchAIDelayPitchStartProbabilities = [
      [50, 60, 70, 70],
      [30, 30, 35, 40],
      [50, 50, 55, 60],
      [60, 70, 80, 90]
]