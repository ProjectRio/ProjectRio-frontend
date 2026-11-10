# Mario Superstar Baseball (GYQE01): in-game HUD dossier

Scope: how the game composes live match state on screen (score, inning, count, outs, runners, star charge, chemistry links, meters). Read-only investigation. Sources are the decomp at `/Users/matthewgreene/GitHub/mssb-dtk`, the ISO texture container entries 2513 and 2514 via MSSB-Editor, and the original `orig/GYQE01/files/game.rel`.

Confidence labels used below:
- **[V]** verified directly from code or decoded data (source or byte-level).
- **[D]** derived: decoded by me from the layout bytes, using the walker logic in `updateHUDRelatedUI`. The mapping matches the code's intent (e.g. digit N gives texture 0x46+N), but it has not been run in game.
- **[I]** inference. Not stated in the data or code.

---

## 0. Summary answers

1. **Elements.** Score, inning ordinal, inning digits, top/bottom, team badges, balls/strikes/outs pips with B/S/O labels, captain star medal, team star orbs, star-chance banners (NEXT / VS. / CHANCE!), class labels (Balance / Power / Speed / Technique), chemistry-link bubbles on bases, the diamond mini-map (diamond, runner dots, base gems, STEAL!, AUTO), swing and pitch charge meters, portraits. **No stamina gauge exists in the HUD code.** See section 3.
2. **Base indicator.** Two systems. (a) On-base chemistry-link bubbles (`draw_OnBaseChemLinks`): three per-base elements (0x11) plus one (0x12) drawn only when the batter has chem links. (b) The diamond mini-map (`drawDiamondMiniMap_*`), shown in every normal match, with a 92x92 diamond frame (tex 0x3E), live runner dots and occupied-base gems (11x12, tex 0x7D).
3. **Count and outs.** Pips, not digits. Strikes: 2 pips. Balls: 3 pips. Outs: 2 pips. Each set uses element 0x107 for its lit and unlit sprites (gold, green, red, silver gems). The pips are the three counts minus their terminal event.
4. **Pitcher-side gauge.** There is no stamina gauge. The vertical meter on the pitch side is the pitch charge meter: a tall 9x106 gradient fill driven by `ChargePitchType`. Its frame runs 0 to 106.
5. **Star charge.** Team star counts (0 to 5 per team) appear as five orange 13x13 orbs per team, plus a 44x43 captain star medal, chosen by the captain's star-skill id through `starGuageIconIDs`. Star-chance banners and a moonshot star-gain prediction are also present.
6. **Element index set.** Full list in section 4. `draw_OnBaseChemLinks` uses element 0x10 (background), 0x11 (three bases), and 0x12 (one, always on). Those indices come from `lbl_3_data_D4F8`, which is data, not code.
7. **Layout.** Canvas 640x448 (both containers). Root records are placed relative to the canvas centre, not screen corners. Child records use `anchorSub` to select a parent anchor. Batter handedness mirrors the star gauge through `anchorSub`. Section 6 gives details and the 4:3 to wide-viewport caveats.

Note on the request: `include/game/hud.h` does not exist in the decomp. The HUD headers are `include/game/hud/hud_gauges.h`, `hud_scoreboard.h`, `outs_indicator.h`, and `runner_items.h`. The sources are `src/game/hud/hud_gauges.c` (834 lines), `hud_scoreboard.c`, and `outs_indicator.c`.

---

## 1. Containers, load order, and what each one holds

| Container (ISO entry) | Role | Evidence |
|---|---|---|
| **2513** `in_game_hud_text_counts_team_names_results` (369 textures, layout with **284 elements**) | The in-game HUD. Every tag-2 HUD record resolves here. | [V] `match_loading.c` case 10 loads `CommonUIFiles_inGame[0]` with tag `2`. Its ARAM address `0x1A635000` matches entry 2513. Layout header element count `0x11C` [V]. |
| **2514** `hud_frames` (102 textures, layout with **28 elements**) | Stat-card labels, roster portraits (54 at 50x50), CPU/P1-P4 badges (59x23), Batter/Pitcher Stats headers, 0/3 1/3 2/3 counters, R/L hand icons, two 21x278 and two 20x278 bars. | [V] ARAM `0x1A6B3000` = `CommonUIFiles_inGame[1]`. [V] no tagged in-game load site found for it in `match_loading.c`. [I] its contents look like results and stats screens. The in-game HUD does not resolve against it. |
| Team captain logo containers | Tags `0xF` and `0x10` load `CommonUIFiles_inGame[logo.ID/4 + 0x11]`. Used by the score plate (C34C records 5 and 6). | [V] `match_loading.c` cases 11 and 12. |
| Tag `0x01` container (not identified) | Runner and on-deck portraits (element 0x83, frame = CharID 0 to 53). | [V] portraits take the frame `CharID << 16` (`draw_initStarGuageHud`, `drawDiamondMiniMap_init`). [I] tag-1 container is the portrait set. Its ISO entry is **not** identified. |

Layouts in both containers have canvas size `0x280 x 0x1C0` = **640 x 448** [V] (u16 at layout+0 and +2, read by `maybeProcessUIUpdates`).

Loading the HUD: `matchHudDrawingControl` is called every frame from `match_scene.c:678`. The diamond mini-map is inserted from `match_scene.c:672` in normal matches, and not during replays (`replayInd`).

---

## 2. How the game composes the HUD (architecture)

- **Records.** Each HUD element is one or more `UIRecord`s in a shared pool of 864 (`menuGraphicsStructures`). `addGraphicsElementToScene` builds them from a descriptor list terminated by `type == 3`. A record holds `elementIndex`, `textureSlot` (resolved from the descriptor's `tag`), `layer`, `playMode`, `parent`, `anchorSub`, and `rgba` [V `File_0x80034e20.c`, `File_0x80034f50.c`, `File_0x80034e20.h`].
- **Descriptor fields.** `mode` values: 0 = visible and stopped, 1 = visible and playing, 2 = created hidden and stopped, 3 = created hidden and playing [V `File_0x80034e20.h`, `allocateGraphicsSlot`]. `unk4` (8 bytes) holds the initial `pos` as two floats. All HUD tables decoded here have `unk4 = 0` [V decoded]. The `unk15[3]` float is the billboard scale. It is zero in every HUD table, which I did not resolve.
- **Per-frame draw.** `maybeProcessUIUpdates` walks the pool in index order (`uiDrawLoopStart` to `uiDrawLoopEnd`, default 0 to 864). Records whose visible flag (`UI_FLAG_VISIBLE`, value 2) is clear are skipped. The draw order is therefore allocation order. `layer` is passed to `fn_800B24D4`, whose semantics I did not trace [V code; semantics unresolved].
- **Element = state table.** `setIndicatorSlotState(node, slot, handle, elementBase, state)` looks up `elementBase` at frame `state` in the container layout, takes its texture index, and writes it into a part of the record's own element. So an element such as 0x107 is a *state to sprite* table, and the record elements (0x106, 0x28 and so on) are *slots* that get their textures from it [V `File_0x8003649c.c`]. `fn_3_972A0(node, slot, handle, digit)` is the same call with base 0x28 [V `match_scene.c:784`].
- **Keyed frames.** Each element part is a list of keyed entries: `u16 kind`, `u16 key` (a frame threshold), then payload. An entry is reached when `frame >= key`. Kinds 0 (static), 2 (indirect), and 3 (table) are handled in `updateHUDRelatedUI` [V `File_0x8000c194.c`].
- **Fade.** `matchHudDrawingControl` ramps the alpha byte (low byte of `rgba`) by 0x10 per frame in and out, so the full fade takes about 16 frames [V `hud_gauges.c`]. Pause dims the HUD to 0xF0 [V].
- **Insertions** [V `hud_gauges.c` `matchHudDrawingControl`]: `init_BallStrikeOutHud`, `draw_ScoreInningHud`, `draw_initStarGuageHud` (unless `animRelated[0xA8]`), `draw_OnBaseChemLinks` (when `g_Batter.chemLinksOnBase != 0`), `HUD_initStarChance` (when `framesInGameStatus == 10`). All at priority 2. Then `drawDiamondMiniMap_init` in `match_scene.c`.
- **Tables not in source.** The `lbl_3_data_*` descriptor arrays exist only as symbols (`config/GYQE01/game/symbols.txt`). I read them from `orig/GYQE01/files/game.rel` at `.data` (section 5, file offset `0x172640`) plus each symbol's offset. The REL header confirms module id 3, which matches the `lbl_3_` prefix.

---

## 3. Element inventory

### 3.1 Balls, strikes, outs (`hud_gauges.c` BallStrikeOut; `outs_indicator.c`)

| Item | Evidence |
|---|---|
| **Panel with B, S, O letters.** Record 0 is element **0x105** (toy field uses 0x103). Its parts reference B = tex 0x3F (19x23), S = tex 0x41 (19x23), O = tex 0x40 (19x23), plus a glint tex 0x5B (99x74). | [V] `lbl_3_data_C22C` [0]. [D] parts. [V] letters seen in `sheet_2513_00_2f.png` and `hud/label_*`. |
| **Pip slot elements.** Records 1 to 7 use element **0x106**, mode 0, alpha 0 (hidden until set). | [V] `lbl_3_data_C22C` [1..7]. |
| **Pip state sprites.** Element **0x107**, four frames: frame 0 gold gem tex 0x45; frame 1 green tex 0x42; frame 2 red tex 0x44; frame 3 silver tex 0x43. | [D] keyed entries: (kind0 key3 -> 0x43), (kind2 key2 -> 0x44), (kind2 key1 -> 0x42), (kind2 key0 -> 0x45). |
| **Pip state meaning.** `setIndicatorSlotState(..., 0x107, state)` uses state 0 = lit strike, 1 = lit ball, 2 = lit out, 3 = off. | [V] `maybe_updateBallStrikeOutUI`. |
| **Pip counts.** Strikes: handles 1, 2; lit when strikes ≥ 1, 2. **So 2 strike pips.** Balls: handles 3, 4, 5; lit when balls ≥ 1, 2, 3. **So 3 ball pips.** Outs: handles 6, 7; lit when outs ≥ 1, 2. **So 2 out pips.** | [V] `maybe_updateBallStrikeOutUI` loop thresholds. |
| **Terminal events.** The counts shown are the pre-terminal states: 4th ball is a walk, 3rd strike an out, 3rd out ends the half-inning. | [I] consistent with the pip counts; the code never lights a third strike or out pip. |
| **Toy field** hides balls and strikes beyond its own limits, uses `toyField_maxOuts - toyField_outsRemaining`, and moves the row to `pos.y = -30`. | [V] `init_BallStrikeOutHud`, `maybe_updateBallStrikeOutUI`. |
| **Toy field outs indicator** (`fn_3_912B4`, descriptor D5B8): element 0xD5 (O label, tex 0x40 plus gloss 0x5C) and element 0xD4 (two gold/silver gem pips), placed at `pos.y = 56`. It is inserted **only** by `toyfield_score_update.c`, so toy field only. | [V] `outs_indicator.c`, `toyfield_score_update.c:19`. |

### 3.2 Inning and score (`draw_ScoreInningHud`, `fn_3_9B320`, `fn_3_9B108`)

| Item | Evidence |
|---|---|
| **Inning ordinal suffix.** Element **0x110**, frames 0 = "st" (tex 0xE8), 1 = "nd" (0xE9), 2 = "rd" (0xEA), 3 = "th" (0xEB), each 28x16. Set with state `F4D0[inning-1]`, where F4D0 = {0,1,2,3,3,3,3,3,3,3,3,3,0,0,0,0}. So innings 1 to 3 get st/nd/rd, and inning 4 onward gets th. | [V] `lbl_3_data_F4D0`. [D] textures. |
| **Inning digits.** Element **0x112**, frames 0 to 9, texture 0x46 + digit (15x23 small digits). For inning 10 and up, tens and units are drawn separately. | [D] keyed entries (`k0@9 -> 0x4F`, down to `k2@0 -> 0x46`). [V] calls with state `Inning`, `Inning/10`, `Inning%10`. |
| **Half-inning label.** `halfInning != 0` re-points records 1 to 3 to elements 0x11B, 0x119, 0x116. Top and bottom text textures are 0xEC (TOP, 39x17) and 0xED (BOTTOM, 60x17); element 0x116 references BOTTOM (some of its parts also reference 0xE8 'st'; not fully traced). | [V] `draw_ScoreInningHud`. [D] textures. |
| **Team score digits.** Element **0x28**, frame = digit, texture 0x50 + digit (18x25 gold digits). Frame 10 gives 0x69 ("P", 18x25). Two-digit scores use two records. | [D] keyed entries. [V] `fn_3_972A0` uses base 0x28, `fn_3_9B108` calls it. |
| **Team badges (in the star gauge).** Element **0x25** (28x16) frames 0 to 3 = P1, P2, P3, P4 (tex 0x108 to 0x10B, red, blue, orange, green); frames 4 to 7 = CPU variants (tex 0x10C to 0x10F). | [V] `draw_initStarGuageHud` sets frame `teams` or `teams + 4` (CPU). [D] textures, confirmed visually in `sheet_2513_hud_candidates_c.png`. |
| **Score plate.** Descriptor C34C (17 records). Record 0 is element 0x114, which points to tex 0x7E (189x96, a dark brown blob-shaped backdrop as seen visually). Records 5 and 6 are captain logos (element 0x01 in tags 0xF and 0x10). | [V] descriptor table. [D] texture for record 0. |

### 3.3 Star charge and star chance (`draw_initStarGuageHud`, `draw_ongoingStarGuageHud`, `HUD_initStarChance`)

Descriptor C56C is two tables of 51 records, one per batter hand. The star gauge uses records 0 to 49.

| Item | Records | Evidence |
|---|---|---|
| **Captain star medal.** Element **0x22** (44x43), 13 frames, tex 0x11A to 0x126. Records 3 (pitcher side) and 4 (batter side) take their frame from `starGuageIconIDs[CaptainStarHitPitch]`. | 3, 4 | [V] `starGuageIconIDs` = {12,0,6,2,8,4,10,5,11,3,9,1,7,0}. [D] frames. |
| **Team star orbs.** Element **0x18** = orange 13x13 orb, tex 0x115. Fielding team's five at records 34 to 38; batting team's five at 39 to 43. Frame 3 = earned. | 34 to 43 | [V] `scene->firstHandle + 0x22 + i` and `0x27 + i`. [D] texture. |
| **Empty star slots.** Element **0x17** = silver 13x13 orb, tex 0x114. | 24 to 33 | [D] texture. [I] empty-slot backdrop. |
| **Star count.** Each team's `TeamStars[team]` (0 to 5). | | [V] `draw_ongoingStarGuageHud`. |
| **Gain animation.** Frame 0 starts, then runs to frame 20 (orb keyframe), then is set to frame 3 and stopped. Gain and lose banners are records 44 to 47 (elements 0x2F and 0x16). | 44 to 47 | [V] `draw_ongoingStarGuageHud`. [D] keyframe at 20. Banner texture not resolved. |
| **Moonshot star-gain thresholds.** `lbl_3_data_D250` = {17, 21, 27, 35, 45}. Compared against `PauseSimulationFrameCount` to predict the next star gain after a moonshot. | | [V] data and `draw_ongoingStarGuageHud`. |
| **Star-chance banners.** Record 20: element 0x1F = "NEXT" (tex 0x12E, 48x16, the on-deck batter). Record 21: element 0x24 = "VS." (tex 0x9D, 100x42). Record 22: element 0x26 = "CHANCE!" (tex 0x130, 87x16) with a large gold star (tex 0x76, 120x119). | 20 to 22 | [V] record ids. [D] textures (visually confirmed in `sheet_2513_hud_candidates_c.png`). `HUD_initStarChance` plays SFX `0x1A9`. |
| **Superstar matchup.** Element 0x5B references "Superstar Matchup!" (tex 0x9E, 255x14). Records 48 and 49 (element 0x27) show superstar marks for non-CPU superstars. | 48, 49 | [D] texture. [V] visibility logic. |
| **Class labels.** Element **0x2A** (65x17), frame = `lbl_3_data_D22C[CharacterClass]`, where D22C = {0,1,2,3}. Frames give Balance (tex 0x110), Power (0x111), Speed (0x112), Technique (0x113). Used on records 13 (pitcher) and 14 (batter). | 13, 14 | [V] D22C. [D] textures, visually confirmed. [I] the CharacterClass enum order matches the label order. |
| **Portraits.** Records 9 (pitcher), 10 (batter), and 6 (on deck) are element 0x83 children, with frame = CharID. | 6, 9, 10 | [V] `draw_initStarGuageHud`. Texture container is the tag-1 container, not identified. |

### 3.4 Chemistry links on base (`draw_OnBaseChemLinks`, `fn_3_99C88`)

Descriptor D4F8 (6 records):

| Record | Element | Parent / anchorSub | Shown when | Evidence |
|---|---|---|---|---|
| 0 | **0x10** | root | always (background, flags bit 31 per `UILayoutElement` comment) | [V] D4F8 [0]. Background flag from `File_0x8000d838.h`. |
| 1 | **0x11** | parent 0, anchorSub **0** | `runnersOnBase & 4` (third base) | [V] code. |
| 2 | **0x11** | parent 0, anchorSub **1** | `runnersOnBase & 2` (second base) | [V] code. |
| 3 | **0x11** | parent 0, anchorSub **2** | `runnersOnBase & 1` (first base) | [V] code. |
| 4 | **0x12** | parent 0, anchorSub **3** | always, once started | [V] D4F8 [4]. |

- Bit mapping: bit 0 = first base, bit 1 = second base, bit 2 = third base. [V] from the masks; [I] standard convention.
- Element 0x11 texture: 0x118 (36x36), pink speech bubble [D, visually confirmed]. Element 0x12 texture: 0x119 (24x28), white music note, keyed over 103 frames [D].
- Plays SFX `0x1AB` when `nPitchesThisAB == 0 && nPickoffAttempts == 0` [V].
- [I] The speech bubble and music note are the chemistry-link indicator. Confirm against in-game footage before relying on the meaning.
- Element 0x10 has 9 parts whose textures use a different flag (`0x0300` high word), so I did not resolve its texture [D, partial].
- The star gauge also contains a copy of this chem-link group (records 17 to 19), shown when `chemLinksOnBase != 0` [V].

### 3.5 Diamond mini-map (`drawDiamondMiniMap_init`, `drawDiamondMiniMap_ongoing`)

Non-toy descriptor **BFEC** (14 records). Toy field uses 8D88 (6 records).

| Record | Element | Texture (decoded) | Role | Evidence |
|---|---|---|---|---|
| 0 | **0xA1** | tex 0x3E, **92x92** brown diamond with white border | Diamond frame, always visible, playing, layer 8 | [V] descriptor. [D] texture, visually confirmed (`hud/elA1_...`). |
| 1 to 4 | **0xA7** | tex 0xAD, 52x60 (Mario face, placeholder) | Runner dots. Record 1 is runner 0 (the batter-runner). Position = world coordinates through the transform below. Record 1 fades in with `sinceHit << 4` after a hit. | [V] code. [D] texture. [V] visibility: `runnerStatus == ON_FIELD` and `outs < 3`. |
| 5 to 8 | **0x83** children, tag `0x01` | (tag-1 container, portrait by CharID) | Runner portraits | [V] code. |
| 9 to 11 | **0xA3** | tex 0x7D, 11x12 red and gold gem | Occupied-base marker. Record 9 = base 1, 10 = base 2, 11 = base 3. Hidden until the base is occupied. | [V] `REC_PREV(scene, base + 9)` maps base to records 9 to 11. [D] texture. |
| 12 | **0xA6** or **0xA2** | tex 0x7F, 91x20 "STEAL!" (+ burst tex 0xAC, 177x132, on 0xA2) | Steal indicator. 0xA2 when a runner is perfect-stealing, else 0xA6. | [V] code. [D] textures. |
| 13 | **0xA0** | tex 0x9B, 56x16 "AUTO" | Shown when the human controls auto-running | [V] code. [D] texture. |

- **Transform (runner to diamond).** `mapX = 556.0 + 2.3 * x`, `mapY = 102.0 - 2.3 * z`, where `(556.0, 102.0, 2.3, 2.3)` is `lbl_3_data_C1CC` [V code and decoded floats]. These are HUD-space units.
- Toy field: `lbl_3_data_8D88` uses 0xA1 (diamond), 0xA4 (gem, tex 0x7D), 0xA3 (three gems), 0x08 (tag 0x0E). Its runner-home and base flags come from `g_Minigame.toyField_*`.
- The mini-map is not inserted in replays (`match_scene.c:672`).

### 3.6 Pitch and swing meters (not stamina)

Batter swing meter, descriptor D378, driver `fn_3_993A8`:

| Record | Element | Texture | Behaviour | Evidence |
|---|---|---|---|---|
| 1 | 0x47 | tex 0xDE, **21x123** blue capsule | Meter track, always visible | [V] D378 [1]. [D] texture. |
| 2 | 0x49, switching to 0x48 | 0x49: tex 0xE6, **9x75** green bar. 0x48: tex 0xDF, **9x106** red-to-yellow gradient | Fill sprite. Element switches from 0x49 to 0x48 once `chargeUp >= 1`. | [V] code. [D] textures. |
| 3 | 0x4A | not resolved | Frame = charge phase value: 0 to 75 while charging up (`75 * chargeUp`), then 75 to 106 while holding (`31 * chargeDown + 75`), held at 106 when fully charged | [V] code. Texture not resolved. |
| 5 | 0x46 | tex 0xE2, 29x38 hand | Frame = charge + 10 (a marker that follows the fill) | [V] code. [D] texture. [I] marker. |
| 6 | 0x4D | not resolved | Visible while swinging; frame follows the fill | [V] code. |
| 7 | 0x4C | tex 0xE0, 16x16 white dot | Child of record 6, plays forward on swing | [V] code. [D] texture. |
| 8 | 0x50 | tex 0xE7, 9x10 white triangle | Static pointer-like sprite | [V] D378 [8]. [D] texture. [I] pointer. |

Pitch charge, descriptor D258, driver `wallBallAnimationRelated` (also used in wall ball): `frame = 106 * ratio` where `ratio = unknownFrameCounter / (pitchWindUpCountDown - lbl_3_data_5F3C[2])`. Record 3 (0x4A) takes that frame. Record 2 (0x48, 9x106 gradient) is held at 0 normally and at 106 for charge type 3. Over-charge uses `pitchChargeUp`. Records 6 (0x4D) and 7 (0x4C) follow the same pattern as the batter meter [V code].

- **Orientation.** The fill textures are tall and thin (9x106, 9x75, 21x123), and the frame counts 0 to 106 scale with the bar length. So the meters are **vertical** [I]. The fill direction (bottom-up or top-down) is not in the data [unresolved].

### 3.7 Stamina

- No HUD file in `src/game/hud/` mentions stamina (`grep -i stamina` returns zero matches in all five HUD sources). The only stamina code is gameplay logic in `src/game/pitching/pitcher_stamina.c` [V].
- The two 21x278 bars (tex 0x00, 0x01) and two 20x278 bars (tex 0x59, 0x5A) in container 2514 are the tallest gauge textures I found. I found no in-game consumer for them. Container 2514 is not resolved by the in-game HUD [V for loading, I for role].
- **Conclusion:** the in-game HUD has no stamina gauge. The closest pitch-side gauge is the pitch charge meter in section 3.6.

---

## 4. Element index table (game's own component list)

Record indices are from the descriptor tables; element indices are the layout elements they reference. `draw_OnBaseChemLinks` (the question's focus) is entry A.

| Element | Descriptor and records | Texture(s) in 2513 | What it draws | Confidence |
|---|---|---|---|---|
| 0x10 | D4F8 [0]; C56C [17]; | 9 parts, not resolved | On-base chem-link background | V/D-partial |
| 0x11 | D4F8 [1,2,3]; C56C [18] | 0x118 (36x36) | Chem-link bubble per base | V/D |
| 0x12 | D4F8 [4]; C56C [19] | 0x119 (24x28) | Chem-link note (always on, 103-frame loop) | V/D |
| 0x17 | C56C [24 to 33] | 0x114 (13x13) | Silver star-slot backdrop | V/D |
| 0x18 | C56C [34 to 43] | 0x115 (13x13) | Orange team star orb (frame 3 = earned) | V/D |
| 0x1C to 0x1E | C56C per hand | by element | Star gauge frame elements (not resolved) | V |
| 0x1F | C56C [20] | 0x12E (48x16) | "NEXT" (on-deck) | V/D |
| 0x21 | C56C [3, 4] | 0x126 | Captain medal slot; its part 1 texture is overridden by an 0x22 frame | V/D |
| 0x22 | C56C via load_Icon | 0x11A to 0x126 (44x43) | Captain star medal, 13 frames | V/D |
| 0x23 | C56C [13, 14] | 0x110 | Class label slot (overridden by 0x2A) | V/D |
| 0x24 | C56C [21] | 0x9D (100x42) | "VS." | V/D |
| 0x25 | C56C [15, 16] | 0x108 to 0x10F (28x16) | Team badge (P1 to P4, CPU) | V/D |
| 0x26 | C56C [22] | 0x130 (87x16), 0x76 (120x119) | "CHANCE!" and star | V/D |
| 0x27 | C56C [48, 49] | not resolved | Superstar mark | V |
| 0x28 | C34C (score digits) via `fn_3_972A0` | 0x50 to 0x59 (18x25), 0x69 "P" | Team score digits | V/D |
| 0x2A | C56C via load_Icon(D22C) | 0x110 to 0x113 (65x17) | Class label (Balance, Power, Speed, Technique) | V/D |
| 0x2C | C56C [0] | 37-part plate | Star gauge plate, playing (role inferred) | V/I |
| 0x2E | C56C [23] | 0x17 | Parent of star pips (21 parts) | V/D |
| 0x2F | C56C [44 to 47] | not resolved | Gain and lose banners (with 0x16) | V |
| 0x46 | D378 [5] | 0xE2 (29x38) | Charge marker (frame = charge + 10) | V/D |
| 0x47 | D378 [1], D258 [1] | 0xDE (21x123) | Meter track | V/D |
| 0x48 | D378 and D258 [2] | 0xDF (9x106) | Meter fill, phase 2 (also the fill element at 0 or 106) | V/D |
| 0x49 | D378 [2] | 0xE6 (9x75) | Meter fill, phase 1 (charge up) | V/D |
| 0x4A | D378 [3], D258 [3] | not resolved | Frame-driven 0 to 106 | V |
| 0x4C | D378 [7], D258 [7] | 0xE0 (16x16) | Dot, child of 0x4D | V/D |
| 0x83 | portraits in C56C and minimap | tag-1 container | Character portrait, frame = CharID | V (texture container unresolved) |
| 0x101, 0x103, 0x105 | BallStrikeOut panel (0x105 record 0; 0x103 toy field) | 0x3F (B), 0x40 (O), 0x41 (S), 0x5B glint | B / S / O panel | V/D |
| 0x106 | BallStrikeOut [1 to 7] | container slots | Pip slots | V |
| 0x107 | Pip state table | 0x42 green, 0x43 silver, 0x44 red, 0x45 gold | Pip sprites by state | V/D |
| 0x110 | ScoreInning (state from F4D0) | 0xE8 to 0xEB (28x16) | st / nd / rd / th | V/D |
| 0x112 | ScoreInning (inning digits) | 0x46 to 0x4F (15x23) | Inning digits | V/D |
| 0x115, 0x116 | ScoreInning half-inning | 0xEC TOP, 0xED BOTTOM | Top/bottom | V/D |
| 0xA0 | Minimap [13] | 0x9B (56x16) | "AUTO" | V/D |
| 0xA1 | Minimap [0] (both variants) | 0x3E (92x92) | Diamond frame | V/D |
| 0xA2 | Minimap [12] (perfect steal) | 0x7F "STEAL!", 0xAC burst | Perfect steal | V/D |
| 0xA3 | Minimap [9 to 11] | 0x7D (11x12) | Occupied-base gem | V/D |
| 0xA4 | Toy field minimap | 0x7D | Toy field gem | V/D |
| 0xA6 | Minimap [12] (steal) | 0x7F "STEAL!" | Steal | V/D |
| 0xA7 | Minimap [1 to 4] | 0xAD (52x60) | Runner dot (placeholder face) | V/D |
| 0xD4, 0xD5 | Toy field outs (D5B8) | 0x40 (O), 0x45 (gem), 0x5C gloss | Toy field outs | V/D |

Descriptor data and numbers for the star gauge (C56C) are per batter hand: `[0]` is for right-handed batters, `[1]` for left-handed batters. Both tables have the same elements and different `anchorSub` values.

---

## 5. Draw order and layers

- Draw order within a frame = pool index order (allocation order) [V `maybeProcessUIUpdates`].
- Layers observed in descriptors [V]: BallStrikeOut panel 7, pips 6; ScoreInning 7, 6, 5; star gauge 7; on-base chem 6; charge meters 8; minimap diamond 8, runner dots 7, base gems 8, STEAL and AUTO 6.
- Layer semantics (what `fn_800B24D4(layer)` does) are not traced [unresolved].
- Insertion priority is 2 for all HUD drawing functions [V].

---

## 6. Layout geometry

- **Canvas.** 640 x 448 for both containers [V].
- **Root placement.** For a root record (`parent == NULL`), `trans = pos - (canvas_w/2, canvas_h/2)`, i.e. `pos` is the canvas centre [V `maybeProcessUIUpdates`].
- **Positions.** HUD descriptor `pos` values are zero. Runtime overrides: toy field BallStrikeOut row `pos.y = -30` [V], toy field outs `pos.y = 56` [V], runner dots `pos = (556 + 2.3x, 102 - 2.3z)` [V]. So the non-toy HUD sits at canvas centre, and the mini-map sits at x = 556, right of centre on a 640-wide canvas.
- **Child anchoring.** Children use `anchorSub` to pick one of the parent's anchors. The parent writes those anchors each frame [V `File_0x80034e20.h`]. The anchor values themselves are in sub-record data I did not decode [unresolved].
- **Batter-hand mirroring.** `C56C[0]` and `C56C[1]` are identical in elements but differ in `anchorSub`. Example: record 1 is `anchorSub 0` for right-handed and `1` for left-handed; record 3 is `2` and `10`. The gain banner also sets `anchorSub` 0 to 3 by hand and team [V].
- **Screen mapping.** The projection matrix (`lbl_800F78E0` and offsets) is not recovered, so there are no absolute screen pixel positions [unresolved].
- **Corner anchoring.** None in the data. Every HUD element is either canvas-centred (root with pos 0), positioned by a fixed number (mini-map, toy field rows), or parented to another element.

---

## 7. Where the layout logic does NOT transfer to a wide browser viewport

The game is authored in a 640x448 canvas (aspect 1.43, not 4:3). Specific cases:

1. **No reflow.** Positions are fixed numbers (`556, 102`, the `±320` and `±224` centre offsets, `-30`, `56`). A wide viewport needs the 640x448 canvas letterboxed or pillarboxed and scaled. Stretching the canvas would not move elements individually because they are not corner-anchored.
2. **Centre origin.** The HUD is centred on the canvas. Corner-anchored web layouts do not map onto it without a transform.
3. **Frame-counted timing.** Animation runs on 16.16 frame counters (`rate 0x10000`), and fades step by 0x10 per frame. A web version has to drive these from a frame counter at the game's rate (60 fps assumed, not verified), not from wall-clock time with CSS easing.
4. **Fixed pixel art.** Pips are 19x23, digits 15x23 and 18x25, orbs 13x13, the runner marker 52x60, the diamond 92x92. They were designed for CRT scale and will look soft if scaled non-integrally.
5. **Minimap transform.** World to HUD is a fixed transform (`2.3` scale, offset `556, 102`). A web diamond should map world coordinates through its own transform. The constants are a reference, not a web layout.
6. **Score plate.** Team names and scores sit in fixed-width slots (18x25 and 15x23 digits). Long names will not fit without redesign.

---

## 8. Mapping to the website surfaces

- **`/games/live`.** Show strikes as 2 pips, balls as 3 pips, outs as 2 pips. The game never shows a third strike, ball, or out as lit. [I] This is the game's own display convention and worth matching.
- **Diamond.** Use the game's model: diamond frame, runner dots at live positions, gem on each occupied base, STEAL! and AUTO banners. The minimap is shown in normal matches. [V]
- **Star charge.** Five orange orbs per team, a captain medal chosen by star-skill id (`starGuageIconIDs`), and CHANCE! / VS. / NEXT banners. [V/D]
- **Inning.** The ordinal suffix is st, nd, rd for innings 1 to 3, then th. [V/D]
- **Chem links.** Speech bubble per occupied base and a note. [I] meaning.

---

## 9. Open items

1. Sub-record geometry (positions, scales, UV rectangles) is not decoded. This is what would give real screen positions and sizes.
2. `fn_8000CEF0` (the layout frame lookup) has no source in the decomp, only a symbol. My frame lookup reproduces the `updateHUDRelatedUI` walker. It is confirmed by digit, score, and star-medal elements, which follow their documented frame-to-texture rules.
3. Identity of the tag-1 container (portraits).
4. Whether 2514's 21x278 and 20x278 bars have any in-game consumer.
5. Colour meaning of the pip gems (which colour means strike, ball, out). The data does not label it.
6. Gain and lose banner textures (elements 0x2F and 0x16, records 44 to 47).
7. Layer semantics (`fn_800B24D4`) and the exact projection to screen pixels.
8. Mini-map runner-dot screen position: the constants are in HUD space, but I did not recover the final projection.

---

## 10. Files

PNGs in `hud/` (15 files, renamed by element and texture):
- `elA1_base_diamond_frame_tex3E_92x92.png`
- `elA3_base_occupied_gem_tex7D_11x12.png`
- `elA7_runner_marker_face_texAD_52x60.png`
- `pip_gem_strike_lit_gold_tex45_19x23.png`
- `pip_gem_ball_lit_green_tex42_19x23.png`
- `pip_gem_out_lit_red_tex44_19x23.png`
- `pip_gem_unlit_silver_tex43_19x23.png`
- `label_B_tex3F_19x23.png`, `label_O_tex40_19x23.png`, `label_S_tex41_19x23.png`
- `digit_small_0_inning_tex46_15x23.png`
- `digit_score_0_tex50_18x25.png`
- `class_label_Balance_tex110_65x17.png`
- `chem_bubble_on_base_tex118_36x36.png`
- `star_orb_filled_tex115_13x13.png`

Contact sheets (in the scratchpad root):
- `sheet_2513_00_2f.png`, `sheet_2513_misc.png`, `sheet_2513_40_59.png`
- `sheet_2513_hud_candidates_a.png`, `..._b.png`, `..._c.png`
- `sheet_2514_00_35.png`, `sheet_2514_36_101.png`

Full texture dumps: `tex2513/` (369 PNGs) and `tex2514/` (102 PNGs). Decoded layouts: `entry_2513.bin`, `entry_2514.bin`. Decoders: `layout_decode.py`, `rel_desc.py`, `rel_desc2.py`, `rel_sections.py`.
