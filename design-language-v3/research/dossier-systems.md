# Mario Superstar Baseball: systems and in-game copy, for the Project Rio site

Scope: read-only mining of the GameCube game (ISO read in place via MSSB-Editor `zzzzdat`) and the mssb-dtk decomp headers.

Conventions:
- **Fact** lines cite their source (ISO entry id, decoded string-table id + string index, or decomp header).
- *Web idea* lines are **proposals**, not findings.
- `[gap]` marks text I could not read; nothing was guessed into the verbatim sections.

Source ids used below:
- Texture entries 2536-2552 = loading-tip banner images (`tex/loading_tip_*`, `dol relFileTable+0x330..0x430`). Listed as "CommonUIFiles_main enum 45-61 loading tips" in the decomp (`docs/file_descriptor_tables.md`).
- Text tables (decoded with `zzzzdat/text.py`):
  - **T79** = `text/text_strings_790_menus` (menu and screen copy, 790 strings)
  - **T82** = `text/text_strings_954_menus` (challenge rival dialogue, 954 strings)
  - **T83** = `text/text_strings_599_menus` (RecordsBook, 599 strings)
  - **T86** = `text/text_strings_23` (minigame descriptions, 23 strings)
  - **T87** = `text/text_strings_168_game` (in-game practice tutorial, 168 strings)
  - **T81** = `text/text_strings_11` (debug test strings, not used)
- Decomp root: `/Users/matthewgreene/GitHub/mssb-dtk/include/`. Shorthand: `game/…` and `menus/…`.

Decoding notes: text is stored as u16 glyph codes. Grid-font words decode to ASCII. Proportional-font words are raw cell numbers (`<cell 0xNN>`); I read those from rendered PNGs. `<colour>`, `<speed N>`, `<cue N>` are control codes kept as tags. `|` is a line break.

---

## Section A: Verbatim text corpus

### A1. Loading tips (entries 2536-2552)

Each tip is an image banner (640x256) with a title in the game's own display type. The body text is in T79 strings 146-162 (the 17 tip bodies, in the same order as the image entries). Titles are transcribed from the banner images; bodies are decoded from T79 exactly.

Titles below are as they appear on the banner image, with the T79 body text beneath.

| Entry | Banner title (verbatim, from image) | Tip body (T79, verbatim, `|` = line break) |
|---|---|---|
| 2536 `loading_tip_welcome_to_mario_superstar_baseball` | Welcome to Mario Superstar Baseball! | (T79 #146) Welcome to the world of\|Mario Superstar Baseball! |
| 2537 `loading_tip_what_s_a_star_chance` | What's a Star Chance? | (T79 #147) A Star Chance is a chance to earn a\|Team Star! Team Stars let you hit and\|pitch the ball with mysterious powers. |
| 2538 `loading_tip_star_chance` | Star Chance! | (T79 #148) A chance to get a Team Star!\|If you're batting, get a hit!\|If you're pitching, get the batter out! |
| 2539 `loading_tip_what_s_chemistry` | What's chemistry? | (T79 #149) `<note>` is a symbol of friendship.\|Buddies exhibit unpredictable powers\|when they field and bat. |
| 2540 `loading_tip_watch_your_stamina` | Watch your stamina! | (T79 #150) When a pitcher gets tired, his or her\|pitches slow down and get out of control.\|Switch to a fresh arm soon! |
| 2541 `loading_tip_hit_the_ball_onto_the_blocks` | Hit the ball onto the blocks! | (T79 #151) Peach Garden is packed with blocks.\|It's loaded with surprises: you may misplay\|balls or see a Team Star appear! |
| 2542 `loading_tip_watch_out_for_barrels` | Watch out for barrels! | (T79 #152) Huge barrels frequently crash through\|the outfield in Donkey Kong Jungle. \|Keep that in mind when you're fielding! |
| 2543 `loading_tip_careful_when_you_cross_the_river` | Careful when you cross the river! | (T79 #153) Watch out for Klaptraps when you cross\|the flowing river in Donkey Kong Jungle!\|If they chomp you, they'll slow you down. |
| 2544 `loading_tip_hit_the_ball_onto_a_klaptrap` | Hit the ball onto a Klaptrap! | (T79 #154) You'll get a Team Star if you can hit the\|ball into a Klaptrap! |
| 2545 `loading_tip_stay_away_from_chain_chomps` | Stay away from Chain Chomps! | (T79 #155) The Chain Chomps guarding Wario Palace\|mean business! They tend to pounce on\|you if you get close. |
| 2546 `loading_tip_forecast_sandstorms` | Forecast: Sandstorms | (T79 #156) When the ball flies into a sandstorm...\|who knows where it will end up? |
| 2547 `loading_tip_team_stars_are_hidden_in_the_sand` | Team Stars are hidden in the sand! | (T79 #157) Team Stars are buried in Wario Palace.\|Your only clues are `<cell 0x89>` shapes.\|Hit them with the ball to get them! |
| 2548 `loading_tip_piranha_plant_infestation` | Piranha Plant Infestation | (T79 #158) When Piranha Plants in Yoshi Park eat\|the ball, they spit it out somewhere else! |
| 2549 `loading_tip_hit_the_ball_onto_the_star_piranha_p` | Hit the ball onto the Star Piranha Plant! | (T79 #159) You'll get a Team Star if you hit the\|yellow Piranha Plant with the ball. |
| 2550 `loading_tip_thwomps_can_be_a_pain` | Thwomps can be a pain! | (T79 #160) The Thwomps in Bowser Castle spurn\|home-run balls. Don't rest easy even\|when you hit a long ball! |
| 2551 `loading_tip_don_t_get_burnt` | Don't get burnt! | (T79 #161) You'll burn yourself if you touch the fiery\|Bubbles! Careful when you're fielding! |
| 2552 `loading_tip_aim_for_the_star_panel` | Aim for the Star Panel!! | (T79 #162) You'll earn a Team Star if you manage to\|hit the ball against the Star Panel! |

Notes:
- Tip 2549's list name is truncated (`..._star_piranha_p`), but the banner reads "Hit the ball onto the Star Piranha Plant!".
- 2552's banner shows two exclamation marks after "Panel".
- `[gap]`: the `<cell 0x89>` in #157 is a proportional-font symbol that I did not resolve. It is the "shapes" the banner calls out.
- Tip 2546 has no body mention of which stadium it is in. The sandstorm stadium is not named in T79 #156.

### A2. Records-book category names (T83, cell-coded, rendered and read from PNG)

T83 strings 213-231 are proportional-font labels. Verbatim, in table order:

`B`, `B.K`, `D.P`, `D.S`, `DB`, `E`, `F.C`, `H`, `K`, `O`, `P`, `P.S`, `PH`, `PR`, `R`, `S`, `T.P`, `W.P`, and string 231 is blank.

These are 18 abbreviated labels. The table does not carry expansions. Likely meanings are inferred from the enums in `game/UnknownHomes_Game.h` (AT_BAT_RESULT includes DOUBLE_PLAY, FIELDERS_CHOICE, ERROR) and the batter stat fields. These expansions are inference, not text. `[gap]` on the expansions.

The records book's character entries are T83 strings 535-566 (32 bios). Verbatim example, Mario (#535):

> Mario | Everyone's favorite hero. When Peach is in trouble, he always saves the day! A kart racer, tennis player, golf enthusiast, doctor... The list goes on and on, showing he's a jack-of-all-trades. His trademark Fireball will help him in his first foray into baseball.

Other bios by character (verbatim openers, first line only): Luigi "The younger Mario bro."; Donkey Kong "A gorilla known for raw power."; Diddy Kong "DK's partner and buddy."; Peach "The Mushroom Kingdom's princess."; Daisy "Sarasara Land's princess."; Yoshi "A denizen of Yoshi's Island."; Baby Mario "The elder of the baby Mario brothers."; Baby Luigi "The younger of the baby Mario brothers."; Bowser "Mario's archrival and the king of the Koopa clan."; Wario "According to Wario, he's both Mario's rival and childhood friend."; Waluigi "Luigi's eccentric rival."; Koopa Troopa "A familiar face of the Mario series..."; Toad "Princess Peach's subject."; Boo "Bowser's underling ghost."; Toadette "A cute Toad girl with plaited locks."; Shy Guy "A charming, masked soldier."; Birdo "A dinosaur that spits eggs from her huge mouth."; Monty Mole "A lively, sometimes surly mole..."; Bowser Jr. "Bowser's exuberant son."; Koopa Paratroopa "Another longtime underling of Bowser."; Pianta "A cheerful islander living on the southern paradise called Delfino Island."; Noki "A mysterious member of a clan living on the southern paradise of Delfino Island."; Hammer Bro "One of Mario's oldest and most annoying foes."; Toadsworth "Princess Peach's attendant."; Magikoopa "A resident magician of the Koopa clan."; King Boo "The king of the Boos."; Petey Piranha "A mutation created this boss of the Piranha Plants."; Dixie Kong "Diddy Kong's partner and girlfriend."; Goomba "Though Goombas once lived in peace in the Mushroom Kingdom..."; Paragoomba "A Goomba with wings."; Dry Bones "A bony underling of Bowser."

Bio ball names (verbatim, used as in-fiction specials): Mario "trademark Fireball"; Luigi "green Fireball"; DK "Banana Ball"; Peach "Heart Ball"; Daisy "Flower Ball"; Bowser "Killer Ball"; Wario "Garlic"; Waluigi "Liar Ball"; Birdo "pink" references; Dry Bones "cursed balls when he pitches"; Hammer Bro "lethal bat"; Boomerang Bro (not in bios).

Mission text (T79 #456-659) uses different names for some specials: Waluigi's ball is "Phony Ball" in T79 but "Liar Ball" in T83 bio. Both verbatim.

### A3. Menu and screen labels (T79)

Records-book index (T79 #313-321), verbatim:
- "View the records of each mode."
- "Past MVPs" (twice, 314-315)
- "Trophies Won"
- "Past Superstars"
- "Toy Field Records"
- "Minigame Records"
- "Grand Prix Medals Won"

Team setup and lineup (T79 #241-260, 336-349):
- "Select team captains."
- "Select players and form a team."
- "Choose Random to select the remaining players randomly."
- "Deselect all players", "Change Color", "Swap positions", "Player profile", "Entry"
- "Select batting order." / "Switch batting order and positions" / "Buddy players" (buddy symbol = `<note>`)
- "Select where you want to play."
- "Select game settings."
  - "First Bat - Choose which team bats first."
  - "Star Skills - Turn Star Skills ON or OFF."
  - "Innings - Set how many innings you'll play. When a game is in a tie, you can play up to 3 extra innings."
  - "Mercy - End a game if the score differential reaches 10 runs."
- "Select control options." / "Batting - Select EASY to display batting cursor." / "Fielding - Select AUTO to automatically field the ball." / "Running - Select AUTO to automatically advance runners." / "Drop spot - Turn drop cursor display ON or OFF."
- "Switching to Superstars is done next time you select batting order."

Challenge-mode and mode screens:
- "Select a level to challenge."
- "Select a team captain."
- "Select members and form a team."
- "View player growth." (T79 #339, #373)
- "Items that you've had before." (T79 #340)
- "Play Toy Field in Challenge mode in 10 turns." (T79 #378)
- "Press <A> to begin Grand Prix." / "Grand Prix rules" (T79 #409-412)
- "View all goals that you have cleared." (T79 #408, #419)
- "Players will join you when you get all their flags." (T79 #418)
- "Select a minigame to play."
- "Please select a practice menu." / "Select what to practice."
- "Select how many turns to play."
- "Would you like to display in Progressive Mode?" / "Progressive Mode has been turned on." / "Progressive Mode has been turned off." (T79 #446-448; meaning unclear, `[gap]`)

Result and recruitment screen (T79 #399-400, #396-398):
- "Players who improved in this game." / "No players improved in this game."
- "Players who have joined you." / "Everyone joined due to the mercy rule!" / "No new players have joined." / "You didn't win. No one joined your team."

Challenge explanation (T79 #449-452, verbatim): "In Challenge mode games, you attempt to perform scout missions successfully. If you clear missions for the full number of flags and win the game, players will join you."

Unlock and progress messages (T79 #139-145):
- "`<string 1>`'s player profile has been added to the record. Press the `<A>` Button."
- "Now you can play Flower Level!"
- "Now you can play Star Level!"
- "Now you can play Special Level!"
- "A new minigame, Star Dash, has been unlocked!"
- "You unlocked Mario Grand Prix! Play all minigames in one shot!"

Save and challenge-carryover phrases (T79 #220-224, verbatim):
- "Save cleared data? Star Mission results will be retained if you save."
- "You're starting Challenge again, carrying over the results of your cleared Star Missions."
- "You completed the game! Save your results?" (T79 #206)

Other UI phrases:
- "Return to Main Menu?" / "Give up now?" (T79 #137-138)
- "Would you like to save your progress?" / "Return to Main Menu without saving?" (T79 #203-204)

### A4. Minigame descriptions (T86, verbatim)

- "Hit home runs and light up the night sky with fireworks!" (Bob-omb Derby; the table says fireworks)
- "Smash the `<cell 0xbd>` wall with a charge pitch!" (Wall Ball)
- "Collect gems while Chain Chomp snoozes." (Chain Chomp Sprint)
- "K.O. Piranha Plants with similar-colored eggs!" (Piranha Panic)
- "Aim at barrels, spray hits, and hit the exploding barrel! Score the most to win!" (Barrel Batter)
- "Run around the field and collect coins!" (Toy Field? inference, see inventory)
- "Play all the minigames as you play for the gold medal!" (Grand Prix)

Minigame-to-name mapping from `game/minigame/*.h` filenames is inference. Star Dash's description was not found in T86.

### A5. In-game practice tutorial (T87, verbatim, selected)

The practice menu tutorial is the game's own voice. Samples:
- "Practice pitching." / "Practice batting." / "Practice fielding." / "Practice base-running." / "Practice whatever you want."
- "All right, pitching fundamentals. Let me tell you how to pitch."
- "If you release A at the exact moment when the power is at its maximum, you will throw a blazing fastball. When NICE! appears, you did it right."
- "A change-up is a slow-moving ball that you can toss from the same wind-up motion as a charge pitch."
- "You can throw a lethal Star Pitch by using up Team Stars."
- "When your captain throws a Star Pitch, it will use up 1 Team Star. Any other captain character will use 2 Team Stars."
- "When a sub-character throws a Star Pitch, it will use 1 Team Star."
- "Since you swing hard when charged, the swing often ends in a slipup if you don't time it well. Be careful!"
- "If you tilt stick in a direction when you hit the ball, you can hit it to different areas. Give it a try."
- "Tilt stick sideways when laying down a bunt to aim for where there are no fielders. Try for a bunt single."
- "The faster you tap B, the faster the runner will dash. Always give 100 percent on every play!"
- "If you press stick and A at the same time to throw the ball, the ball travels faster than usual. Try it in a game!"
- "If you catch a fly ball before it hits the ground, you get a fly-out."
- "If a character with the ball touches a runner between bases, that's called a tag-out."
- "Be careful when you dash while chasing balls. It gets difficult to control a character who's running too fast."
- "Is it catchable or will you just miss it? Take the plunge and try diving catches! Don't ever give up!"

Star Swing and Star Pitch explanation (T87 #42-46, #65-69): "There are many types of Star Pitches, each particular to a captain. Try each captain's pitch out!" and "There are many types of Star Swings, each particular to a captain. Try each captain's swing out!"

### A6. Challenge rival dialogue (T82, verbatim, selected)

Rival dialogue uses cue codes (`<cue N>`) for character voice. Samples:
- Bowser intro: "Bowser craves a test of his might. He wishes to play a powerful team."
- Setup: "Your rivals are forming teams, too." / "Beating all the other teams should earn you a date with Bowser's team..." / "Even rival team members might help you out if you can impress them." / "The thing is, of course, you can only play with up to nine players." / "So, be sure to challenge Bowser with your best team of nine!"
- Scout explainer (T82 #34-39): "Scout missions occur during games. You'll see a message like SMACK A HIT! appear midgame." / "If you clear this mission, you will get a Mission Flag." / "By getting Mission Flags, you'll coax rivals to join your team." / "Star missions involve you clearing certain conditions to make your teammates go up in ranking." / "View Check Stars in the pause menu to check out the progress of your players." / "Your players become star players when you clear all of their missions. Try to make a superstar team!"
- Wario (T82 #55-56): "Well, knowing you, Wario, I highly doubt you used legitimate means..." / "You WHAT?!"
- Donkey Kong (T82 #68-69): "What's the deal with that boxing glove?" / "You're using that as a bat?! Is that even allowed?"
- Yoshi (T82 #89-90): "Don't gobble up any teammates for fun, OK?" / "And don't even THINK about eating me, either, OK?"
- Rival re-match lines include: "Won't you play another game?", "You'll never beat me no matter how hard you try!", "Hey, can you say 'blowout,' Chump?", "The umpire must call a fair game!"

### A7. Announcer and result text

`[gap]` No announcer or result-screen text was found in T79/T82/T83/T86/T87 beyond the phrases above. Phrases found:
- "NICE!" (charge-pitch timing, T87 #36)
- "SMACK A HIT!" (scout-mission banner, T82 #34)
- "Win MVP!!" recurs as a mission goal (T79 #457 and ~15 more)
- "Be the MVP in the last game!" (T79 #473 and more)
- "Everyone joined due to the mercy rule!" (T79 #396)

The results and ranking screens exist as textures (`tex/results_and_ranking_screens`, id 2516), but the in-screen labels are not in these five tables. `[gap]` not decoded.

---

## Section B: Feature inventory

Format per entry: **System** — fact (source). *Web idea:* proposal.

### B1. Challenge mode and star missions

- **Challenge mode** — a single-player campaign where the human assembles a team and plays rival teams in sequence, with a bracket-like progression ("Beating all the other teams should earn you a date with Bowser's team"). Bowser is the final boss. Source: T82 #22-32, #56-63; `game/challenge/challenge_state.h`; `game/UnknownHomes_Game.h` (`GAME_TYPE_CHALLENGE = 5` in `mssbTypes.h`).
  *Web idea:* a "Challenge ladder" on `/modes/[gamemode]/ladder`, showing a rival-team bracket where each win unlocks the next rival's card and a "Bowser stage" banner.

- **Star missions (per character)** — each character has 10 star-mission slots (`STAR_MISSIONS_PER_CHARACTER 10`). A mission has a type (≈50 types), a target, and flags (requires win, minimum difficulty, minigame-specific, Bowser-unlock). Completion can be "in-game" (conditionally completed, kept or reset by the game result) or "saved". Source: `game/challenge/challenge_state.h` (`STAR_MISSION_TRACKING`), `game/challenge/star_mission_data.h` (`STAR_MISSION_TYPE`, `STAR_MISSION_FLAG`).
  *Web idea:* per-player "mission board" on `/users/[user]` with 10 cards, each showing a mission type, its target, a progress bar, and a "won this game" flag, so players see what a star would take.

- **Star mission types** (from `STAR_MISSION_TYPE`, `game/challenge/star_mission_data.h`): win at a stadium, win as MVP, star chances, star pitch and star swing, strike out batter, hit batter with pitch, shutout against captain, no-hitter, complete game, shutout, strikeouts, star pitches, charge pitches, home run in inning, home run with RBIs, hit at least bases, hit off pitcher, home run off pitcher, RBI off pitcher, hits, bunts, bunt forces in run, RBIs, home runs, star swing RBIs, batting average, no strikeouts, charge hits, home run with Diddy and Dixie on base, bunt hits, home run with teammate, note block hits, field balls, big plays, big play catches, chemistry throw to, laser throw outs, double play with, stolen bases, runs scored, body checks, minigame rank, minigame points, minigame beat character.
  *Web idea:* a filter on `/users/[user]/batting` and `/pitching` that lets a viewer pick a mission type and see which players on a community roster have completed it, using the same type names.

- **Scout missions** — in-game mid-match objectives (`SCOUT_MISSION`, 12 types, plus NONE): retire flagged batter, reach base vs flagged pitcher, score in captain duel, take the lead, hold scoreless inning, turn double play, strike out captain, retire side in order, sac fly, squeeze bunt, steal second base, win Bowser Jr. game. Result is `PENDING`, `FAILED` or `SUCCEEDED`. Source: `game/challenge/scout_state.h`.
  *Web idea:* a "scout report" card on `/games/[gameID]` showing each mission the game set, with a pass/fail mark computed from the box score.

- **Mission flags (recruitment)** — completing scout missions earns Mission Flags; enough flags recruit a rival to your team. Recruitment state is `NOT_RECRUITED`, `RECRUITED`, `ON_BJ_TEAM` (Bowser Jr.'s team). Flags are required per difficulty and captain (`ScoutFlagTable.flagsRequired[4][6]`). Source: T82 #35-36, T79 #418, `game/challenge/challenge_state.h`.
  *Web idea:* a "recruit tracker" on `/communities` or `/modes/[gamemode]/ladder`: a roster of rivals who can join a community team, with flags earned per win, and a "joined" event in the activity feed.

- **Challenge shop items** — 19 items: Nice Bat, Power Bat, Super Ball, Lucky Glove, Dash Spikes, Buddy Emblem, Red Fireball, Green Fireball, Lovely Heart, Pretty Flowers, Gnarly Garlic, Whiskered Eggplant, Egg, Pink Egg, King Banana, Chimp Banana, Bullet Bill, Jr. Mask, Secret Map, Superstar. Source: `game/challenge/challenge_items.h` (`CHALLENGE_SHOP_ITEM`). Several are the same names as the captain special balls in mission text (see B4).
  *Web idea:* an "unlocks" shelf on `/users/[user]` showing which of the 19 items a player has bought or earned, with the item name as the badge.

- **Challenge save-situation** — a saved in-progress situation (score, outs, runner flags, current batter) is stored and restored (`ChallengeSituation`), and the save warns "If you save later, you'll lose the current data." Source: `game/match_setup/match_end.h`, T79 #224.
  *Web idea:* "resume" banner on `/users/[user]` for an unfinished community game, with the saved situation shown as a game-state chip.

### B2. Team-building, captains and chemistry

- **Captains and captain stars** — captain-capable characters have a star type (`CAPTAIN_STAR_TYPE`: Mario, Luigi, Wario, Waluigi, DK, Diddy, Bowser, Bowser Jr., Yoshi, Birdo, Peach, Daisy; 12 entries). The Challenge captains are Mario, Peach, Wario, DK, Yoshi, Bowser (`CHALLENGE_CAPTAIN`). Source: `mssbTypes.h`, `game/challenge/challenge_state.h`.
  *Web idea:* a captain-select card row on `/characters` that groups characters by their captain star type and shows which captains a community team has used.

- **Captain vs non-captain Star cost** — fact (T87 #44-45, verbatim): "When your captain throws a Star Pitch, it will use up 1 Team Star. Any other captain character will use 2 Team Stars." "When a sub-character throws a Star Pitch, it will use 1 Team Star." Same rule for Star Swing (T87 #67-68). Source: T87, `game/match_setup/star_power_costs.h` (`captainStarCost`, `nonCaptain_CaptainStarCost`, `regularStarCost`, `moonShotCost`).
  *Web idea:* a "star budget" meter on `/games/[gameID]` showing each team's Team Stars spent, split into captain and sub spends, with the verbatim cost rule as a tooltip.

- **Variant classification** — `CHARACTER_VARIANT_CLASSIFICATION`: primary captain, secondary captain, unique non-captain, primary variant, secondary variant. Source: `game/challenge/challenge_state.h`.
  *Web idea:* a "variant" tag on the `/characters` grid (e.g. "Secondary captain") so the Diddy and Dixie or Baby pairs read as families.

- **Chemistry (buddies)** — each character has a 54-entry chemistry table (one byte per other character). The in-game symbol is `<note>`, verbatim tip text: "`<note>` is a symbol of friendship. Buddies exhibit unpredictable powers when they field and bat." Source: `game/character_stats.h` (`ChemistryTable`, size 0x36), T79 #149, T79 #256, T79 #349, T79 #424.
  *Web idea:* a chemistry heat-map on `/characters/analytics`, from the 54x54 table, with the "buddy" note marking the strongest pairs.

- **Team setup, batting order and player-swap screens** — captain select, team select (up to 9 players per team: "you can only play with up to nine players"), batting-order screen with L/R and superstar switching, and "Random" to fill the rest. Source: T79 #241-260, T82 #31-32, `menus/captain_select/`.
  *Web idea:* a lineup builder on `/games/[gameID]` (or a draft view) that shows the 9-slot order and bench with the same "Random fills the rest" control.

### B3. Batting, pitching and fielding systems

- **Batting contact types** — slap, charge, and star contact; contact quality as sour / nice / perfect (`HIT_CONTACT_TYPE`: RIGHT_SOUR, RIGHT_NICE, PERFECT, LEFT_NICE, LEFT_SOUR). Hit types cover slap, charge, change-up each with sour/nice/perfect (`HIT_TYPE`). Source: `mssbTypes.h`, T87 #36 ("NICE!" appears when the release is correct).
  *Web idea:* a contact-quality chart on the `/characters/swing-lab` page that colors each swing by sour / nice / perfect.

- **Regular star swing shapes** — `REGULAR_STAR_SWING`: popfly, grounder, line drive. Source: `mssbTypes.h`.
  *Web idea:* a star-swing badge on the `/games/[gameID]` play-by-play that shows the swing shape when a star was used.

- **Captain-specific star swings and pitches** — `game/batting/star_swing_bowser.h`, `star_swing_peach_daisy.h`, `star_swing_wario_waluigi.h`, and `star_effect_glow.h`. Each captain has a distinct star swing; T87 #143 and #151: "There are many types of Star Pitches, each particular to a captain." Source: these headers plus T87.
  *Web idea:* a per-captain star-move gallery on `/characters/[char]` with the star swing name and frequency from the visualizer data.

- **Charge pitch and charge swing** — pressing and holding A builds power; releasing at max produces a "blazing fastball" or a longer ball, and "NICE!" appears when the timing is right (T87 #34-36, #57-59). Source: T87; `game/batting/charge_effects.h`.
  *Web idea:* a power-meter visual on the swing lab showing the NICE window.

- **Pitch and batting stats per character** — stat fields in `StatTable`: CurveBallSpeed, FastBallSpeed, cursedBall, Curve, curveControl, HitTrajectoryPushPull, HitTrajectoryHighLow, BattingStance (L/R via `BATTING_HAND`), SlapContactSize, ChargeContactSize, SlapHitPower, ChargeHitPower, BuntingContactSize, Speed, ThrowingArm, Weight, CharacterClass (BALANCED, POWER, SPEED, TECHNIQUE). Source: `game/character_stats.h`, `mssbTypes.h`.
  *Web idea:* a "bio card" on `/characters/[char]` with the four stat bars (batting, pitching, running, fielding) and the class label, mirroring the in-game profile.

- **Fielding abilities bitmask** — 14 named abilities plus two unassigned bits: Wall Splat, Wall Jump, Clamber, Sliding Catch, Laser, Quick Throw, Super Jump, Magical Catch, Tongue Catch, Suction, Super Catch, Ball Dash, Body Check, Super Curve. Source: `game/character_stats.h` (`FIELDING_ABILITIES`), `mssbTypes.h`/`game/UnknownHomes_Game.h` (`FIELDING_ABILITY`).
  *Web idea:* a fielding-ability chip set on each character card, and a filter on `/characters` for "has laser" or "has tongue catch".

- **Pitcher stamina** — stamina is a tracked pitcher stat (`StatisticsPitcher.stamina`) and a visible gauge (`game/pitching/pitcher_stamina.h`). Verbatim: "When a pitcher gets tired, his or her pitches slow down and get out of control. Switch to a fresh arm soon!" (T79 #150; tip 2540). Also `starPitchesThrown`, `pitchesThrown`, `maxPitchSpeed`.
  *Web idea:* a stamina sparkline on `/users/[user]/pitching` built from `pitchesThrown` per start, with a "switch to a fresh arm" marker where the game would have pulled the pitcher.

- **Star Pitch and Star Swing spending** — described above (B2). Star costs are read from the `StarPowerCosts` struct; the numeric values are `[gap]` (not read from the data).

- **Dash** — tapping B makes a runner or fielder dash (`DASH_STATE`, `FielderDash` in `game/fielding/fielder_types.h`). Verbatim: "The faster you tap B, the faster the runner will dash." (T87 #155).
  *Web idea:* a "dash" stat on `/users/[user]/batting` for runner speed, shown as a per-game tap count from replays.

- **Diving and running catches** — `game/fielding/fielder_types.h` (`FIELDER_TAG_TYPE` covers base-on-slide, running, standing, body-check won/failed). Verbatim: "Press A at the exact right time to make a diving catch." (T87 #102).
  *Web idea:* a catch-type chart on `/games/[gameID]` with diving, running and jumping catches as separate markers on the play map.

- **Fielding errors** — `FIELDING_ERROR` (dropped fly, groundball, late throw) and `FIELDING_ERROR_TYPE` (dropped fly, groundball, failed rundown). Source: `game/fielding/fielder_types.h`.
  *Web idea:* an error breakdown on the box score of `/games/[gameID]`, split by these three error types.

- **Pickoffs and steals** — `PICKOFF_STEAL_CODE`, `PICKOFF_TARGET_STATUS` in `game/fielding/fielder_types.h`.
  *Web idea:* a steal-attempt log on `/games/[gameID]` with the pickoff outcome.

- **At-bat result enum** — `AT_BAT_RESULT`: none, strikeout, walk, hit by pitch, out, caught line drive, caught, single, double, triple, home run, error, fielders choice, bunt, sac fly, double play, caught infield fly. Source: `game/UnknownHomes_Game.h` (line 2405).
  *Web idea:* an outcome legend on `/games/[gameID]` play-by-play, using these exact names as the chip labels.

- **Runner actions** — `RUNNER_ACTION`: slide, body check won, body check failed; overrun stages; `RUNNER_MOVEMENT_TYPE`. Source: `game/baserunning/runner_types.h`.
  *Web idea:* baserunning badges on the play-by-play (slide, body check won, overrun) on `/games/[gameID]`.

- **Stadium hazards** — hazards named in tips and text: barrels (DK Jungle), Klaptraps and river (DK Jungle), Chain Chomps (Wario Palace), sandstorms (Wario Palace), Team Stars buried in sand (Wario Palace), Piranha Plants (Yoshi Park), Thwomps (Bowser Castle), fiery Bubbles, blocks (Peach Garden). Source: T79 #151-162, `STADIUM_ID` in `mssbTypes.h`, `game/stadium/`.
  *Web idea:* a per-stadium hazard card on `/games/[gameID]` showing which hazards fired in that game, using the tip titles verbatim.

### B4. Captain special balls and character growth

- **Captain special balls** — each captain's signature ball is a named pitch-and-bat move. Mission text (T79) uses: "Get a Red Fireball!", "Get a Green Fireball!", "Get a King Banana!", "Get a Chimp Banana!", "Get a Lovely Heart!", "Get a Pretty Flower!", "Get an Egg!", "Get a Pink Egg!", "Get a Bullet Bill!", "Get a Gnarly Garlic!", "Get a Whiskered Eggplant!", "Get a Jr. Mask!". These match the shop item names in `CHALLENGE_SHOP_ITEM` (B1). Mission text also includes "Pitch and bat with the Heart Ball and win the game!", "Pitch and bat with the Killer Jr. Ball and win the game!", "Pitch and bat with the Phony Ball and win the game!", and "Pitch and bat with the Boomerang Ball and win the game!". Source: T79 #456-659, `game/challenge/challenge_items.h`.
  *Web idea:* a "ball collection" on `/characters/[char]` that shows the captain's special ball as a card, with "earned" once a player has the mission.

- **Per-character mission lists** — T79 #456-659 is a long list of goal strings (e.g., "Win MVP!!", "Get a runner out with a laser beam throw!", "Strike out Baby Mario!"). Their grouping by character is not labelled in the table; the "Win MVP!!" and special-ball lines recur at regular intervals, and the grouping is inference.
  *Web idea:* a "goal list" tab on `/users/[user]` that lists the character's goals in plain text, with a checkmark for each one the player has cleared.

- **Growth titles** — T79 #660-779 is a ladder of growth titles, grouped in consecutive runs that end in "Star". Mario group in table order: Mini-Mario, Super Mario, Fire Mario, Wing Mario, Star. The character each group belongs to is `[gap]` (groups are not labelled). The ladder's last rung is "Star", matching "Your players become star players when you clear all of their missions" (T82 #39).
  *Web idea:* a growth-title ladder on `/characters/[char]` (or on a player profile) showing the rung the player has reached, with "Star" as the top.

- **Superstar** — a status for characters who have cleared all missions. `charIsSuperstar[54]` and `SuperstarStatBonus` (stat bonuses applied to a starred slot). Source: `game/challenge/challenge_state.h`, `game/character_stats.h`, T79 #443 ("Switching to Superstars is done next time you select batting order."), T79 #253/#290/#304 (`<Y>Superstar` control).
  *Web idea:* a "Superstar" badge on the `/users/[user]` roster, appearing when all of a player's missions are done.

### B5. Result, MVP, records and grading

- **MVP and winning pitcher** — game-end MVP calculation (`MVPCalculation`, `endOfGameStats_MVP`, `winningPitcher`). The MVP formula weights a field, `_22`, at 5 points (`StatisticsBatter` comment). Source: `game/stats/result_stats.h`, `static/UnknownHomes_Static.h`.
  *Web idea:* an MVP card on `/games/[gameID]` that shows the batter or pitcher the game picked, with the points breakdown from the stat fields.

- **Batter stat fields** (the basis of the in-game stat book and the records): plateAppearances, AtBats, Hits, Singles, Doubles, Triples, HomeRuns, BuntSuccesses, SacFlies, GIDP, Strikeouts, Walks_4Balls, Walks_Hit, RBI, runs, BasesStolen, AB_W_RISP, hits_W_RISP, runnersAdvancedAgainst, fielder_playsInvolvedIn, RBI_W_RISP, HR_W_RISP, BigPlays, StarHitsActivated. Source: `static/UnknownHomes_Static.h` (`StatisticsBatter`).
  *Web idea:* the batting table on `/users/[user]/batting` can add "RISP" splits (AB_W_RISP, hits_W_RISP, RBI_W_RISP) and "Big plays", which the game already tracks.

- **Pitcher stat fields** — battersFaced, runsAllowed, earnedRunsAllowed, walks, battersHit, hitsAllowed, homeRunsAllowed, pitchesThrown, stamina, outsAsPitcher, maxPitchSpeed, strikeouts, starPitchesThrown. Source: `static/UnknownHomes_Static.h` (`StatisticsPitcher`).
  *Web idea:* a max-pitch-speed column on `/users/[user]/pitching`, and a star-pitch count next to strikeouts.

- **In-game stat book** — two pages (batting, pitching) with a team toggle and a scrolling lineup (`game/stats/stat_book.h`, `statsDisplayed`, `scrollIndex`).
  *Web idea:* the box score on `/games/[gameID]` gets the same two-page layout (batting / pitching tabs) and a lineup scroll on mobile.

- **Records book** — the category list (T83 A2; T79 #313-320): Past MVPs, Trophies Won, Past Superstars, Toy Field Records, Minigame Records, Grand Prix Medals Won. Plus the 18 abbreviated stat columns (T83 #213-230) and the 32 character bios (T83 #535-566).
  *Web idea:* a "Records" page at `/modes` with the same six category names, and the stat abbreviations as column labels on the leaderboard tables.

- **Grand Prix medals and trophies** — "Press A to begin Grand Prix", "Play all the minigames as you play for the gold medal!", "Grand Prix Medals Won", "Trophies Won" (T79 #320, #316; T86 #19-21). The grading is medal-based, not letter-based. No letter or star grade was found in any decoded table. `[gap]` on whether trophies are awarded per mode.
  *Web idea:* a medal shelf on `/users/[user]` that counts gold, silver and bronze medals from community Grand Prix events (community-defined, not the game's).

- **Records and results texts** — "Players who improved in this game." / "No players improved in this game." appear on the post-game screen (T79 #399-400). This implies a per-game improvement readout. The actual improvement criteria are `[gap]`.
  *Web idea:* a "who improved" strip on `/games/[gameID]` that lists players whose star-mission progress moved in that game.

### B6. Game modes, settings and tooling

- **Game types** — `GAME_TYPE`: Exhibition (0), Practice (2), Demo (4), Challenge (5), Toy Field (6), Minigames (7). Source: `mssbTypes.h`.
  *Web idea:* a mode selector at `/modes` that shows the five playable types as cards, with Challenge linking to the ladder.

- **Exhibition game settings** — First Bat, Star Skills on/off, Innings (with up to 3 extra innings on a tie), Mercy (10-run differential). Source: T79 #261-268 (verbatim above), `game/match_setup/`, `static/UnknownHomes_Static.h` (`InningSettings`: `starSkillsSetting`, `runsNeededForMercy`, `inningCount`).
  *Web idea:* a "game settings" chip row on `/games/[gameID]` that shows the settings the game used (star skills, innings, mercy), so results can be compared like-for-like.

- **Control options** — Batting EASY (shows batting cursor), Fielding AUTO, Running AUTO, Drop spot on/off. Source: T79 #270-284, `static/UnknownHomes_Static.h` (`GameControlOptions`).
  *Web idea:* a "how this game was played" note on `/games/[gameID]` that lists the control options, since they change stat meaning (auto-running changes baserunning stats).

- **Practice** — practice menu with pitching, batting, fielding, baserunning and free practice; tutorial text is in T87 (A5). Source: `game/practice/` (`pitching_practice.h`, `batting_fielding_practice.h`, `baserunning_practice.h`, `free_fielding_practice.h`, `guided_practice.h`), T87.
  *Web idea:* a "drills" page at `/tools` that uses the game's own tutorial steps (the five-throw and five-hit goals in T87) as a training plan, with a checklist.

- **Minigames** — eight files in `game/minigame/` (barrel_batter, bobomb_derby, chain_chomp_sprint, kinoko, piranha_panic, star_dash, toy_field, wall_ball). Descriptions in A4. The `kinoko` minigame is `[gap]` (name and rules not read). Source: `game/minigame/`, T86, `STAR_MISSION_FLAG_MINI_GAME(id)` (ids 0-6).
  *Web idea:* a minigame records board on `/modes` that uses the "Minigame Records" category (T79 #319) with a per-minigame best score.

- **Toy Field** — a Challenge-mode stadium and a minigame mode ("Play Toy Field in Challenge mode in 10 turns.", T79 #378; "Get more than 200 coins in the Toy Field!", T79 #549). Source: `STADIUM_ID_TOY_FIELD`, `game/minigame/toy_field.h`.
  *Web idea:* a Toy Field leaderboard on `/modes/[gamemode]/peak` using the coin totals.

- **Replays** — the game records controller input per frame (`ReplayFrame`, `ReplayPadFrame`, `game/replay/replay_state.h`, `replay_inputs.h`).
  *Web idea:* "watch the replay" on `/games/[gameID]`, if the site ever stores per-frame inputs.

- **Pause menu** — the pause menu is a shared control block (`game/match_setup/pause_menu.h`), with "Check Stars" (T82 #38) as the progress screen.
  *Web idea:* the Check Stars screen maps to a "star progress" tab on `/users/[user]`.

- **Memory-card save flow** — many save-related messages (T79 #168-240), including "You completed the game! Save your results?" (T79 #206). The save messages are copy only; they do not describe a web feature.
  *Web idea:* a "saved" confirmation pattern on `/tools` for uploads, reusing "Saved. Press A to continue."

### B7. Stadium and characters

- **Stadiums** — `STADIUM_ID`: Mario Stadium, Bowser's Castle, Wario Palace, Yoshi Park, Peach Garden, DK Jungle, Toy Field. Source: `mssbTypes.h`.
  *Web idea:* stadium cards on `/games/recent` filtered by stadium, with the hazard list from B3 under each.

- **Character classes** — BALANCED, POWER, SPEED, TECHNIQUE (`CHARACTER_CLASS`). Source: `mssbTypes.h`.
  *Web idea:* a class filter on `/characters` and `/characters/analytics` with the four classes as tabs.

- **Character roster size** — 54 characters (`inMemRoster [2][9]`, `characterStats[NUM_CHOOSABLE_CHARACTERS / 9][9]`, `ChallengeRoster challengeRosters[12]`). Source: `static/UnknownHomes_Static.h`, `game/character_stats.h`.
  *Web idea:* the `/characters` grid is a 6x9 layout, which mirrors the game's own roster grid.

---

## Gaps and follow-ups

- Results-screen labels (`tex/results_and_ranking_screens`, id 2516) and the remaining proportional-font strings in T79 (about 8 cell-coded entries) are not transcribed. The entries are: #1-#7 (glyph strips, likely the font row), #246 and #438 ("Choose Random to select the remaining players randomly" lines). The glyph-strip entries are not copy.
- The 19 records-book abbreviations have no in-table expansions. Expansions above are inference.
- Star cost numeric values are in `StarPowerCosts` data, not read.
- Minigame name mapping from descriptions (T86) is inference except Grand Prix.
- The growth-title and special-ball mission groupings are not labelled in the table. The groupings are inference.
- `game/challenge/challenge_state.h` comments give difficulty values 0-2 for three levels, while `flagsRequired[4][6]` implies four. Not resolved.
