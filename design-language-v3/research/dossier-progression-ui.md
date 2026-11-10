# MSSB Progression UI Dossier

Scope: challenge-mode overworld map, challenge shop, scout system, records book, completion/reward feedback, Grand Prix medals.

Tagging: every claim is [FACT] (with source) or [INFERENCE].

## 0. Setup and tooling
## 1. Challenge overworld map
## 2. Challenge shop
## 3. Scout system
## 4. Records book layout
## 5. Completion and reward feedback
## 6. Grand Prix medals
## 7. Open questions / not found

## 0. Setup and tooling (confirmed this run)
- [FACT] ISO present read-only at `/Users/matthewgreene/Large Files/isos/Mario Superstar Baseball (USA).iso`. Not copied or re-extracted.
- [FACT] Prior work already exists in the scratchpad and is reused, not re-derived: `dossier-progression.md` (sections 2 to 10: growth ladders, star-mission rows, scout table, shop with 20 items and prices, challenge map 1756/1742 notes, unlock copy, Grand Prix), `dossier-ui-features.md` (1742/1744/1745/2514/2516 sprite inventories and frame/gauge mechanics), `dossier-systems.md` (T83 category names, scout explainer copy).
- [FACT] Texture dumps already exist under `scratchpad/tex_<id>/` for 1739-1743, 1744, 1745, 1753, 2513, 2514, 2516, 2517; `tex2513`, `tex2514`, `dump/` hold other extracts.
- [FACT] Raw sheets and scripts are in `scratchpad/scripts/prog/` and `scratchpad/scripts/`.
- [GAP] Brief says entry 1744 has 32 textures. Prior dossier-ui-features.md says 31. To re-check with `zzzzdat textures 1744`.

## 6. Grand Prix medals (cutoffs search)
- [FACT] Medal-related strings in decoded text (T79, T86) contain no tier thresholds. T79 #320 "Grand Prix Medals Won" (records category); T86 #19-21 "Play all the minigames as you play for|the gold medal!" (`text/0086_..._MinigameCommonFiles...decoded.tsv`). No "silver", "bronze", "1st place" or points cutoff string found in `text/` (grep -i medal, silver, bronze, trophy).
- [FACT] mssb-dtk source: no occurrence of "medal", "gold", "silver", "bronze" or "trophy" in `src/` or `include/` (only a float-compare library file `Dolphin/gx/GXPixel.c` matched "gold" as a substring of an identifier).
- [FACT] Decomp Grand Prix award code, `mssb-dtk/src/game/minigame/minigame_framework.c`:
  - `minigameGrandPrixCheckWin` (line ~3764): `grandPrixWonInd = TRUE` iff the solo player's `rank == 1` after the final.
  - `minigameUpdateHighScores` (line ~2767-2781): per character row (`characterStaticIndexes[charID].requirementRow`, 0-31), stores `grandPrixBestPlace[row] = 3 - placeRank` when that exceeds the stored value. `placeRank` is 0-based finishing order from `minigame_rankPlayers` (line ~3629).
  - `minigameRecords` struct (line ~146-151): `MinigameResultEntry scores[8][5]`, `MiniGrandPrixScoreInput grandPrixBest[32]`, `s8 grandPrixBestPlace[32]`, `u8 _420[0x34]`. Total 0x454 bytes (matches `File_0x8003c00c.c` memcpy size 0x454).
  - Score ranking uses `minigameGrandPrixRankPoints[4] = { 10, 6, 3, 0 }` (line 587), double on the final (see progression dossier section 8).
- [INFERENCE] The only persistent medal-like state is `grandPrixBestPlace` (values 0-3 per character row). Mapping 3 = 1st (gold), 2 = 2nd (silver), 1 = 3rd (bronze), 0 = 4th or none is an inference from the `3 - placeRank` encoding and the three medal textures. No code draws a medal from it in the decomp that I found. The reader is not found in `src/menus` (text_579B4.c only edits a 32-entry byte array at offset 0x400 in a copy of the record block, cycling values mod 4 with L/R or D-pad, which is a debug or editor screen, not the records book).
- [FACT] Textures for medals: 1745:124 (gold), 1745:125 (silver), 1745:126 (bronze), each 43x38, C4 (dossier-ui-features.md section 2.5; `tex_1745/124_s0_t124_43x38_C4.png` etc.).
- [FACT] Place badges 1745:166-170, 46x34, C4 (`tex_1745/166..170_s0_t*_46x34_C4.png`). Not yet mapped to a place.
- [GAP] Threshold values for gold, silver or bronze are not in the text tables, the decomp source, or the DOL-derived data in the prior dossier. The award rule is therefore most likely placement-based (1st/2nd/3rd in a whole Grand Prix), but the exact tier per placement is not confirmed in the disc data.

## 3. Scout system: banners, verified by code and layout
- [FACT] Scout HUD code: `mssb-dtk/src/game/hud/hud_scoreboard.c` lines ~1339-1410 and ~2178-2330 (`scoutMissionIntro_init`, `scoutMissionStart_init`, `scoutMissionBanner_init`, `scoutMissionProgress_init`, `scoutMissionCountdown_init`). Banner frame = `scoutMissionBannerFrames[scoutMissionID] << 16`.
- [FACT] `scoutMissionBannerFrames[14] = {0,0,1,2,3,4,5,6,7,8,9,10,11,0}` (indexed by SCOUT_MISSION id 0-12; id 0 = none).
- [FACT] The banner element is layout element 0x65 in the in-game HUD container (ISO entry 2513, section 1 layout). Its part 1 is a keyed table, 12 entries, frame key 0 to 11. Texture index per key read from the layout bytes (tag 0x4 in the high byte, texture index in the low 16 bits): key 0 -> tex 243, 1 -> 245, 2 -> 246, 3 -> 320, 4 -> 321, 5 -> 323, 6 -> 244, 7 -> 322, 8 -> 324, 9 -> 325, 10 -> 326, 11 -> 358. Decoder: `scratchpad/el_probe.py`.
- [FACT] Banner plates are elements 0x66 and 0x67 (records in `scoutMissionBannerDescriptors`); 0x65 is the text image.
- [FACT] Verbatim banner copy from entry 2513 textures (read from PNG, and the texture file name is shown):

| Scout id (decomp enum) | Frame | Texture (2513) | Size | Banner text (verbatim, read from PNG) |
|---|---|---|---|---|
| 0 NONE, 1 RETIRE_FLAGGED_BATTER | 0 | 243 | 300x44 C4 | Get the player out! |
| 2 REACH_BASE_VS_FLAGGED_PITCHER | 1 | 245 | 272x44 C4 | Get a hit! |
| 3 SCORE_IN_CAPTAIN_DUEL | 2 | 246 | 305x44 C4 | Score a run! |
| 4 TAKE_THE_LEAD | 3 | 320 | 316x44 C4 | Mount a comeback! |
| 5 HOLD_SCORELESS_INNING | 4 | 321 | 350x44 C4 | Don't let them score even one run! |
| 6 TURN_DOUBLE_PLAY | 5 | 323 | 351x44 C4 | Get a double play! |
| 7 STRIKE_OUT_CAPTAIN | 6 | 244 | 332x44 C4 | Strike 'em out! |
| 8 RETIRE_SIDE_IN_ORDER | 7 | 322 | 450x44 C4 | Finish them off in 3 batters! |
| 9 SAC_FLY | 8 | 324 | 351x44 C4 | Hit a sacrifice fly! |
| 10 SQUEEZE_BUNT | 9 | 325 | 355x44 C4 | Drop a successful squeeze bunt! |
| 11 STEAL_SECOND_BASE | 10 | 326 | 231x44 C4 | Steal a base! |
| 12 WIN_BOWSER_JR_GAME | 11 | 358 | 231x44 C4 | Win the game! |

- [FACT] So all 12 scout types have banner copy. The earlier note "only SMACK A HIT! was found" is superseded. "SMACK A HIT!" (T82 #34) is the explainer's example text, not a texture. The closest banner is "Get a hit!" (245).
- [INFERENCE] The id-to-text pairing is by the frame table (FACT) plus the decomp mission meaning (consistent for all 12). Id 0 and id 1 share frame 0.
- [FACT] Other scout banner-adjacent textures in 2513: 158 "Superstar Matchup!" (255x14), 157 "VS." (100x42), 333 "TWO" (300x101), 334 "THREE" (300x101), 360 "Your Team is Number 7!" (450x57, Japanese-style gold text), 361 "BALL DEAD" (272x57), 362 "MERCY" (125x47), 348 "Nice game!" (111x15), 349 "Good luck next time." (400x15), 139 "You are HERO !!" (153x15), 140 "Congratulations !!" (177x15), 203 "MVP!!" (241x91), 204 "Too Bad!!" (241x91).
- [FACT] Scout banner text strings are also in the T82 text table? Not as these exact 12 lines. Decoded text does not hold them (they are image banners).

## 6b. Grand Prix / results grade function: thresholds FOUND in the DOL
- [FACT] `fn_8006C100` (DOL `.text` 0x8006C100, 0x3C bytes; `config/GYQE01/symbols.txt:2112`). Disassembled by hand from `orig/GYQE01/sys/main.dol` (bytes in `scratchpad/dolfn/fn_8006C100.bin`, extractor `scratchpad/dolfn.py`). Loads the table `lbl_80109400` (DOL `.data`, 0x10 bytes, `s16`), loops i = 0..6, returns the first i where `score >= table[i]`, and returns 6 if none match.
- [FACT] Table `lbl_80109400` (s16, verified from DOL bytes): 7000, 6500, 6000, 5500, 5000, 4000, 0 (7th entry 0 is the fall-through sentinel).
- [FACT] Resulting bands: score >= 7000 -> 0; 6500-6999 -> 1; 6000-6499 -> 2; 5500-5999 -> 3; 5000-5499 -> 4; 4000-4999 -> 5; < 4000 -> 6.
- [FACT] Callers (`mssb-dtk/src/game/minigame/minigame_hud.c`): line 1892, Grand Prix results rows, `HUD_RECORD_AT(scene, 0x5F, i)->frame = fn_8006C100(entry->score) << 16`; line 1755, Toy Field results, `elementIds[fn_8006C100(n)]`.
- [FACT] Score fed to it in Grand Prix: `minigameFillGrandPrixScoreInput` / `fn_8006C13C` (score compare, `minigame_framework.c` line 2684). The score is a Grand Prix total, not raw points.
- [FACT] `HudDescriptorTables` (`minigame_hud.c` line ~189-196): `elementIds[8]` = {0x81, 0x82, 0x83, 0x84, 0x85, 0x86, 0x87, 0x00} and `thresholds[8]` = {20, 30, 40, 50, 60, 70, 80, 90}, at `game.rel` `.data` offset 0x226E0 + 0x428 (read from `orig/GYQE01/files/game.rel`, section file base 0x172640). `thresholds` is not used by `fn_8006C100`.
- [INFERENCE] These seven bands are the Grand Prix (and Toy Field) result grades. Index 0 is the top band.
- [GAP] Which icon each band shows in-game is not decoded. Elements 0x81-0x87 are multi-part composites in container 2513 (see below).

## 6c. Letter sprites in container 2513 (conflicts with the brief's "no letter grade on the disc")
- [FACT] Entry 2513 holds large gold letters with a white and dark outline, 117x106 or 108x109, C4: tex 328 "G", 329 "A", 330 "N", 331 "C", 332 "B", 335 "W", 336 "-", 337 "F", 338 "A" (59x59), 350 "D", 351 "S", 352 "L", 353 "-", 354 "K". Read from PNG (`scratchpad/grade_candidates_2513.png`).
- [FACT] Elements 0x81-0x87 reference these letter textures in their parts (`scratchpad/el_tex.py`): 0x82 uses 329, 331, 332, 354; 0x83 uses 329, 335, 337, 352, 353, 354; 0x85 uses 331; 0x81 uses 331. They also reference digits and small plates (112, 119-126, 128, 130, 133, 135, 137).
- [INFERENCE] The letter set is a grade set (A, B, C, D, F, S with plus/minus marks). The "G N W L K" glyphs are not explained, so the full set may be a word or name rather than grades. Treat it as an open question, not a finding.
- [GAP] Band-to-letter mapping is not confirmed. I did not render the composed elements.

## 2516 medallions (visual, from the contact sheet)
- [FACT] Entry 2516 holds four 75x75 C8 difficulty medallions: 011 "MUSHROOM", 012 "FLOWER", 013 "STAR", 014 "SPECIAL" (crown). Also 001-005 coloured rings 71x72 (red, blue, yellow, green, purple), 006-010 coloured arrows (17x28), 027 "Last ball!" (79x22), 039 "High Score" (100x19), 000 crown 43x33, 025 bomb 33x37, 016-024 digits 23x27, 029-038 digits 18x24.
- [FACT] No letter grade sprites in 2516.

## 6d. Minigame top-5 board (the leaderboard model)
- [FACT] `MinigameResultEntry { s32 score; s16 count; s16 charID; }` (`include/game/minigame/minigame_framework.h` line 11-16). Table `lbl_803616CC.scores[8][5]`. `minigameGetScoreTable` returns `&scores[GameMode-1][5]` for minigames (the index is flat, so this points into the following row; treat the exact board as an unresolved indexing detail) and `&scores[7][0]` for Grand Prix. Each board holds 5 rows.
- [FACT] Insert rule `minigameGetScoreRank`: a new entry goes in before the first row where `score > row.score`, or `score == row.score && count > row.count`. Rows are shifted down, the last row is dropped. `newRecordRow` marks the inserted row (5 means no new row).
- [FACT] Row drawing (`minigame_hud.c` lines 1855-1935): rank frame = `entry->rank`; charID portrait via `load_Icon(i + 0x32)`; score drawn as four digits, each digit its own element (0x41 + 4i .. 0x44 + 4i), capped at 9999 for Grand Prix and at `lbl_80109410[mode]` for minigames; Bob-omb Derby count drawn as three digits, leading zeros replaced by blank (frame 10).
- [FACT] Non-new rows are played back with `minigameHudSeekRecordFrame`; the new row is highlighted and plays a sound (`callSfx(lbl_3_data_81FC[0x2F])`).
- [GAP] Records book (`1744`) itself is drawn by menu code I have not located. This board is the minigame results screen, not the records book. The "Minigame Records" category on the records book is assumed to read these tables (INFERENCE).

## Remaining gaps (this run)
- Map node geometry and state frames (sections 1 and 2 of the brief). 1742 holds level icons 150-153 (34x29: mushroom, flower, star, crown) and level labels 192-195 (145x13), but I did not decode which element draws them or their states.
- Shop row layout (icon 126-145 at 100x100 in 1742; name plate 162-181 at 114x34; prices in orange digits 044-066 25x23 and coin 003 24x29). Row positions are not decoded.
- Records book row layout (1744): no row geometry decoded.
- Completion stamps (section 5): textures listed in section 5 below.

## 5. Completion and reward feedback (textures, sizes, sampled colours)
Sampled colours are 16-step buckets from opaque pixels (C4/C8 palette), so they are approximate. [FACT] for the texture and size, [INFERENCE] for the treatment reading.
- Cleared banners (1742, 284x16 C4, white text, transparent field): 196 "Mushroom level cleared!", 197 "Flower level cleared!", 198 "Star level cleared!", 199 "Special level cleared!". Sampled: #f0f0f0 only.
- Result words (2513): 203 "MVP!!" 241x91 C4, yellow `#f0f040` and orange `#e09000` with white and black outline; 204 "Too Bad!!" 241x91 C4, blue `#0000f0` and white outline; 361 "BALL DEAD" 272x57 C4, white and blue gradient with black outline; 362 "MERCY" 125x47 C4, yellow and orange with black outline; 360 "Your Team is Number 7!" 450x57 C4, brown `#603010` ground with gold `#e0b050` lettering.
- Result lines (2513, white text, black outline): 139 "You are HERO !!" 153x15; 140 "Congratulations !!" 177x15; 348 "Nice game!" 111x15; 349 "Good luck next time." 400x15; 158 "Superstar Matchup!" 255x14; 157 "VS." 100x42, black and grey with gold `#f0d080`.
- Burst and flash art (2513/1742): 172 white star burst 177x132 C4; 1742:018 starburst 49x52; 1742:035 yellow cross flash 64x64; 1742:037 white burst 55x50; 1742:036 white cloud shape 476x140; 1742:039 white jagged burst 488x158. Art only; no burst appears in an overlay with the banners in the decoded layouts I checked.
- Stamps: 1742:125 "SOLD" 46x25 C4, grey-white `#e0e0e0` with orange `#f06020` and outline (sold shop item). 1742:154 "NO ITEM" 55x25 C4.
- Medals (1745:124 gold, 125 silver, 126 bronze, 43x38 C4, coin with red ribbon tail). Place badges 1745:166-170 46x34.
- Team Star: 1742:183 star with face 80x77 C4, yellow `#f0f050` to `#f0e040`. 1742:015 "TEAM STAR" label 107x13 C4 white.
- Coins and currency: 1742:003 coin 24x29 C4, `#e0d050` to `#c0b030`; 1742:040 "Coins" plate 125x46 C4 orange-red `#f03000` with white and yellow edge; 1742:002 "Coins" small 46x13 C4 white; 1742:076-080 coin spin frames 37x37 C8 (`#e0f000` face, edge frames 078/079 at about 16x37). 1742:081 "Level Bonus" 137x23, black with white. 1742:188 "Score Bonus", 189 "Entry Fee" (137x23, black with white).
- Digits: 1742:044-066 orange digits 25x23 C4 (`#f06000` fill, white inner), 1742:012 white digits with black outline 18x24 (`#000000`/`#f0f0f0`), 1742:116-123 blue digits 18x21 (`#0060a0` with `#d0e0f0`).
- Japanese labels (1742:067-075, 137x23 C4 black plate, white text): かち (win), まけ (lose), とくてん (score), チームスター (Team Star), しってん, Tie, かくとく (acquired), 1位とのさ (margin to 1st), 4位とのさ (margin to 4th). [INFERENCE] results and Grand Prix standing lines. Translations are my reading.
- Mission-clear feedback in the HUD: scout progress uses frame 1 for achieved, 40 or 60 for pending, and 0 for empty (`hud_scoreboard.c` `scoutMissionProgress_init`). [FACT]
- Recruitment copy and badges: T82 #769-773 "You got the Home-Run Badge!" etc. are in the unlock section of the progression dossier. Recruitment art is not identified.

## 1-2. Map and shop: what is confirmed
- [FACT] Shop icons 126-145 (100x100 C8) and name plates 162-181 (114x34 C4) are in 1742, in shop order (item 0 Nice Bat to item 19 Super Star). Plates 100-114 are 131x21 versions of the same names (Red Fireball ... Chimp Banana, etc.).
- [FACT] Shop currency: coin 1742:003 (24x29) and "Coins" plate 1742:040. Prices (from the progression dossier, `menus.rel`): 100/150/180/200 for equip items, 200 for captain balls, 500 for Secret Map, 600/700/800/900 for Super Star.
- [FACT] Level markers: 1742:150 mushroom 34x29 (`#a00000`), 151 flower 34x29 (C8), 152 star 34x29 (`#f0f060`), 153 crown 34x29 (C8). 1742:033 "Mushroom Level" 145x13 and 192-195 "Flower Level", "Star Level", "Special Level", "miracle Level" (145x13). 2516:011-014 are the 75x75 medallion versions.
- [GAP] Node positions, path logic, and which texture or state each map marker uses are still not decoded. The map board (1756 #019, 512x512) is in the progression dossier.
- [GAP] Shop row geometry and records-book row geometry were not decoded.

## Corrections and checks
- [FACT] Entry 1744 has 31 textures (`zzzzdat info 1744`: "textures (31 textures)", referenced as `menus:.data:0x1ff84 recordsBookTexturesFileDescriptor`). The brief's "32" is wrong.
- [FACT] Scout banner count is 12 (not "12 types plus SMACK A HIT!"). Scout banners are complete in section 3.
- [FACT] Grand Prix thresholds are in the DOL (`lbl_80109400`), not absent (section 6b). Medal award thresholds per tier (gold, silver, bronze) are still not found: 6b gives 7-band grades, not medal tiers.
- [FACT] Letter-glyph sprites exist in 2513 (section 6c). This conflicts with the brief's "no letter grade anywhere on the disc". Band-to-letter mapping is unconfirmed.
