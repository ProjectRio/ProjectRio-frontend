# MSSB Team-Building Screens: Dossier

Scope: character select, lineup / batting-order editor, fielding assignment, team select, empty and error states.

Tag legend: **[FACT]** = confirmed from a named source (texture id, file path, symbol). **[INFERENCE]** = reasoned, not directly confirmed. **[NOT FOUND]** = searched, no evidence.

## 0. Setup and tooling notes

- ISO read in place: `/Users/matthewgreene/Large Files/isos/Mario Superstar Baseball (USA).iso` (GYQE01). Not copied or re-extracted.
- `python3 -m zzzzdat textures <id> -o <dir>` and `python3 -m zzzzdat characters` worked. `tables` confirmed the US DOL layout. The `dol` subcommand does not exist.
- DOL bytes read with `zzzzdat.layout.Dol` (`<scratchpad>/dump_dol.py`, `<scratchpad>/dol/tables1.json`, `<scratchpad>/dol/logo.json`).
- Text read with `zzzzdat.store.Store.text_search` and `zzzzdat.text.codes_of` / `plain` (`<scratchpad>/text_search.json`, `<scratchpad>/t79.json`).
- Textures dumped to `<scratchpad>/tex/865`, `<scratchpad>/tex/2528`, `<scratchpad>/tex/1745`.
- Findings are in the appended batches below. Section 7 is folded into Batch 6, Section 6 into Batch 7.

## 1. Character select layout

## 2. Stats surfaced at character select

## 3. Lineup / batting-order editor and fielding assignment

## 4. Chemistry ("Buddy players") surfacing and connector sprites

## 5. Team select

## 6. Empty and error states

## 7. Verbatim strings (T79 and other text tables)

## 8. Open questions / not found

---
### Appended findings (batch 1)

**Section 2 (stats)**
- [FACT] `include/game/character_stats.h` `StatTable` (packed, size 0x3B) fields: `CurveBallSpeed`@0x00, `FastBallSpeed`@0x01, `cursedBall`@0x02, `Curve`@0x03, `curveControl`@0x04, `UnusedBytes[27]`@0x05, `FieldingStats` (u32 FIELDING_ABILITIES bitmask)@0x20, `CharID` (s16)@0x24, `FieldingArm`@0x26, `BattingStance`@0x27, `SlapContactSize`@0x28, `ChargeContactSize`@0x29, `SlapHitPower`@0x2A, `ChargeHitPower`@0x2B, `BuntingContactSize`@0x2C, `HitTrajectoryPushPull`@0x2D, `HitTrajectoryHighLow`@0x2E, `Speed`@0x2F, `ThrowingArm`@0x30, `CharacterClass`@0x31 (enum CHARACTER_CLASS), `Weight`@0x32, `Captain`@0x33, `CaptainStarHitPitch`@0x34, `NonCaptainStarSwing`@0x35, `NonCaptainStarPitch`@0x36, `BattingStatBar`@0x37, `PitchingStatBar`@0x38, `RunningStatBar`@0x39, `FieldingStatBar`@0x3A.
- [FACT] The four `*StatBar` bytes (0x37-0x3A) are the only dedicated "bar" fields in the struct; they are the strongest candidate for what the selection screen displays as a stat meter. The raw battle values (Speed, contact, power) are not named as bars. [INFERENCE] the bars are the summary display; the values underneath are not shown directly.
- [FACT] `CharacterStats` row is 0xA0 bytes: `StatTable stats`@0x000, `ChemistryTable chemistry`@0x03B (0x36 bytes, 54 entries), padding, `UnusedShorts[22]`. Comment confirms 54 rows, one per CHAR_ID, at the start of `Static_Stats_Tables`, and `inMemRoster[2][9]`.
- [FACT] `SuperstarStatBonus` (0xC bytes) lists which stats a starred slot gets boosted: SlapContactSize, ChargeContactSize, SlapHitPower, ChargeHitPower, BuntingContactSize, Speed, ThrowingArm, CurveBallSpeed, FastBallSpeed, cursedBall, Curve, curveControl.
- [FACT] `FIELDING_ABILITIES` bitmask: WALL_SPLAT 0x1, WALL_JUMP 0x2, CLAMBER 0x4, SLIDING_CATCH 0x8, LASER 0x10, QUICK_THROW 0x20, SUPER_JUMP 0x40, MAGICAL_CATCH 0x80, TONGUE_CATCH 0x100, SUCTION 0x200, SUPER_CATCH 0x400, BALL_DASH 0x800, BODY_CHECK 0x1000, SUPER_CURVE 0x2000, UNASSIGNED 0x4000, UNASSIGNED2 0x8000.
- [FACT] `include/game/character_stats.h` line 13 comment: "The per-character stat record ... one row in the master stat table". Not a selection-screen file by itself.
- [NOT FOUND, so far] Whether the select screen reads `*StatBar` or the raw values. To be checked in captain_select / character-select source.

**Section 4 (chemistry) – data side**
- [FACT] `ChemistryTable` = 54 u8 entries (0x36 bytes), one per character in CHAR_ID order: Mario(0x00)..BoomerangBro(0x35). Column ordering is the same as the 54 rows of the StatTable. Full list in `character_stats.h`.
- [FACT] Notable indexes: Mario 0x00, Luigi 0x01, Peach 0x04, Daisy 0x05, Yoshi 0x06, Toadsworth 0x1C, Petey 0x26, Dixie 0x27, Goomba 0x28, BoomerangBro 0x35.
- [FACT] Header comment: "CharacterStats ... ChemistryTable that follows it in CharacterStats starts at 0x3B" and "packed so C agrees (natural alignment would round it to 0x3C and shift every chemistry entry one byte late)." Confirms 54x54 table layout is stored per row.
- [FACT] Thresholds (90 and 20) are not in this header. Still to locate.

**Batch 2: screen identity, source map, and DOL tables**
- [FACT] The game's own name for the character-select screen is **"captain select"** (`src/menus/captain_select/captain_select.c`, `captain_model_load.c`, `teamselect.c`). The team-select flow lives in the same folder (`teamselect.c`, `captainSelectScreen_manager`). The user's "character select" and "team select" both sit under `captain_select`.
- [FACT] Team-management screens (batting order, fielding alignment, info panels): `src/Unknown/team_management_screens.c` with functions `battingOrderProcessInputs` (0x8005A350, size 0xC18), `teamManagementGraphics_fieldingAlignmentScreen` (0x8005AF68, 0x330), `teamManagementGraphics_battingOrderScreen` (0x8005B298, 0x4C8), `teamManagementGraphics_fieldingAlignmentInfo` (0x8005BF40, 0x370), `teamManagementGraphics_battingOrderInfo` (0x8005C2B0, 0x314). Source: `config/GYQE01/symbols.txt`.
- [FACT] Lineup order mutation: `src/Unknown/orderchange.c` with `lineupOrderChangeRelated(u8 team, int position)` (0x80042598, size 0x144), `swapPosMenu_left_rightPress(u8 right, u8 team)` and `swapPosMenu_up_downPress(u8 down, u8 team)`. The position argument uses `FIELDING_POSITION_*` constants. [INFERENCE] The editor is a pairwise swap menu, not drag-and-drop, but I have not yet confirmed by reading the body.
- [FACT] `include/Unknown/team_management_screens.h` declares a `teamManagementGraphics_steadyState`, `challengeTeamManagementRelated`, and `starMissionRelated1`, all in one module.
- [FACT] Captain-select cursor/grid symbols (`config/GYQE01/symbols.txt`):
  - `mapCaptainCursorPositionToCharID` = .data:0x800FE5D4, size 0x350 (848 bytes)
  - `captainIDOrderedOnCapSS` = .data:0x80108EC4, size 12
  - `captainIDMappings` = .data:0x80108ED0, size 12
  - `challengeCaptainCharIDArray` = .data:0x800FE930, size 12
  - `battingOrderPriorityPositions` = .data:0x80109054, size 0x28
  - `superstarStatBonus` = .data:0x800E86F0, size 0xC
  - `superstarUnlocked` = .bss:0x80361B20, size 0x130
  - `lineUpInfoStruct` = .bss:0x80354720, size 0x48
- [FACT] Bytes read directly from the GYQE01 `main.dol` via `zzzzdat.layout.Dol` (script at `<scratchpad>/dump_dol.py`, output at `<scratchpad>/dol/tables1.json`):
  - `captainIDOrderedOnCapSS` = `00 04 0a 02 06 09 01 05 0b 03 11 13`. Decoded with the `CHAR_ID` order from `character_stats.h`: Mario, Peach, Wario, DK, Yoshi, Bowser, Luigi, Daisy, Waluigi, Diddy, Birdo, BowserJr. These are the 12 captains. [INFERENCE] The captain-select screen shows 12 captain cells, not 54.
  - `captainIDMappings` = `00 01 04 05 06 11 0a 0b 02 03 09 13` = Mario, Luigi, Peach, Daisy, Yoshi, Birdo, Wario, Waluigi, DK, Diddy, Bowser, BowserJr.
  - `challengeCaptainCharIDArray` = `00 04 0a 06 02 36 00 04 0a 06 02 09`. The `0x36` entry is 54, one past the last valid CHAR_ID, so it looks like a sentinel. [INFERENCE]
  - `superstarStatBonus` = `32 32 32 32 32 32 32 14 14 32 32 32`. Read literally, the entries for SlapContactSize..curveControl are bonuses in the 0x20 range. [INFERENCE] These are plausibly stat caps or bonus amounts, not percentages. Still to confirm from `superstarStatBonus` consumers.
  - `battingOrderPriorityPositions` = `02 05 04 03 08 03 04 05 02 06 00 01 08 06 07 01 02 00 07 04 04 03 01 02 05 01 02 04 06 08 07 06 08 05 03 03 05 07 04 06` (40 bytes, the table is 0x28 long). Values look like FIELDING_POSITION codes. [INFERENCE] Needs confirmation against the enum.
  - `mapCaptainCursorPositionToCharID` (848 bytes). Autocorrelation shows a clear 0x20-byte repetition (match 0.91 at period 32). The leading 0x30 bytes are permutations of 0..5 in groups of six, which fits the `sup*6` indexing noted in `docs/matching_notes.md` (line ~4096). Records from 0x30 on repeat at 0x20 with `ff ff ff ff` fields, so this is a per-entry structure, not a flat 54-cell grid. Full dump is in `<scratchpad>/dol/tables1.json`. Structure is not yet decoded.
- [FACT] `docs/matching_notes.md` line 4065 notes that `captain_select.c` is a decompilation project file that has been matched to the target. It is good evidence that the decomp code is faithful to the game, not just a guess.
- [FACT] `charOnCharacterGridSelected[54]` in `include/static/UnknownHomes_Static.h` line 247 is a "taken" table (one byte per CHAR_ID, at 0x803530F7). It marks which characters are already on a team. Consumers include `src/menus/text_0323C.c` (add/remove paths around lines 599-872).

**Batch 3: chemistry logic (Section 4) and the "buddy" highlight**
- [FACT] `calculateChemistry(int team, CHAR_ID a, CHAR_ID b)` in `src/game/stats/stat_lookups.c` (0x0006D658, size 0x7C). It reads `CharacterStats[a].chemistry[b]` (the 54x54 table). Then, if the team is the human team, the game is not exhibition (`exhibitionMatchInd` == 0), and the **Buddy Emblem** challenge shop item is active, it adds `lbl_3_data_5FC4[10]` (float, declared extern in that file, value not yet read). The result is clamped to 100.
- [FACT] Buddy Emblem is challenge shop item index 5 (`include/game/challenge/challenge_items.h` line 10; `docs/challenge_shop_items.md` line 18 says "Chemistry increased by 50, capped at 100"). [INFERENCE] the +50 comes from `lbl_3_data_5FC4[10]`; confirm the float value.
- [FACT] "Buddy players" highlight source: `Static_Stats_Tables.highChemTeammates[2][9][9]` (s8, `include/static/UnknownHomes_Static.h` line 249). Comment: "per roster slot: teammates whose chemistry with it is >= 90 (100 excluded), -1 elsewhere, sorted ascending." The build code is `buildHighChemLists` and `sortHighChemTeammates` in `src/Unknown/mb_subfunc.c`. The filter is `if (chem < 90 || chem == 100) list[i] = CHAR_ID_NONE; else list[i] = CharID;`. So the included range is **90 to 99 only**. The value 100 is excluded, and `CHAR_ID_NONE` is the -1 filler. The sort is a 10-slot exchange loop (`list[10]`), so the 9 entries are sorted ascending.
- [FACT] **The connector / buddy indicator is drawn in `src/Unknown/team_management_screens.c`, function `fn_8005C830(MenuScene* scene, s32 port, s32 selection)`** (lines ~794-840). For each of the 9 high-chem teammates of the selected roster slot, it finds the matching roster index and sets `UIRecord->elementIndex = 0x2B` and `flags |= UI_FLAG_VISIBLE` on a per-player record. Two modes:
  - Batting-order view (`rosterView == ROSTER_VIEW_BATTING_ORDER`): the marker is put on record `rosterIndex + port*9 + 0x64` (or on the `0x52` and `0x75` records in other branches).
  - Otherwise: the marker goes on record `lineUpInfoStruct[port][rosterIndex][2] + port*9 + 0x12E`.
  - [FACT] `elementIndex = 0x2B` is the single UI element drawn on every buddy teammate. [NOT FOUND, so far] I have not yet confirmed that element 0x2B is a music note. That needs the UI layout data.
  - [FACT] The label "Buddy players" and the music-note symbol are the user's words. I have not yet found the string in the decomp or the text tables. Continue checking T79.
- [FACT] Team chemistry star meter: `fn_800670A0(u8 team)` in `src/Unknown/mb_subfunc.c` (around line 862). It averages `cursorPositions.roster.chemWCaptain[team][i]` over roster members that are nonzero and not the captain. Then it maps the average to `Static_Stats_Tables.startingChemStars[team]`:
  - >= 70 → 5 stars
  - 55-69 → 4
  - 35-54 → 3
  - 15-34 → 2
  - 1-14 → 1
  - 0 → 0 stars
  - [FACT] Quirk: zero entries are skipped, so an empty or 0-chem slot does not pull the average down.
  - [FACT] The UI that draws the star meter is `resetChemistryStars` / `resetChemistryStarsCount` in `src/menus/text_7E380.c` (lines 51-68) and `src/menus/text_78F78.c` (line 66). The stars are reset from `Static_Stats_Tables.startingChemStars[channel]`.
- [FACT] `captainChemistryOrder[2][54]` in `UnknownHomes_Static.h` line 248 sorts every CHAR_ID by chemistry with the captain. `buildHighChemLists` (called per roster slot j from `mb_subfunc.c` around line 936) is the per-slot consumer.
- [NOT FOUND, so far] The "20" threshold the user mentioned. The 90 and 20 values in the user's brief are only partly matched. 90 is confirmed as the buddy cut-off. 20 is not yet found. Continue searching for `< 20` or `>= 20` near chemistry use.

**Batch 4: stat bars, starring, and the lineup editor**
- [FACT] **StatBars are 0-10 meters.** `src/Unknown/orderchange.c` (the superstar-toggle function around lines 110-200; name not yet read): starring a player adds `superstarStatBonus` to the raw stats, then adds **+2** to each of `BattingStatBar`, `PitchingStatBar`, `RunningStatBar`, `FieldingStatBar`, clamped at **10**. So the four meters are on a 0-10 scale, and starring raises each by 2 up to 10. This is the best decomp evidence for what the selection UI shows as bars.
- [FACT] Starring is gated by `superstarUnlocked[CHAR_ID]` (must be nonzero). It is a toggle (`charIsStarred[team][slot] ^= 1`) outside challenge mode. In challenge mode it sets `charIsStarred[0][slot] = TRUE` only. Un-starring reloads the base stats with `copyCharacterStats(&inMemRoster[team][slot], &Static_Stats_Tables.characterStats[row][col])`.
- [FACT] `lineUpInfoStruct[2][9][4]` (s8, 0x48 bytes): index `[team][rosterSlot][k]`.
  - `[0]`, `[1]` and `[2]` start as the identity (`= slot`) in `fn_2_2D1C` / `fn_2_2BB8` (`src/menus/main_menu.c` lines ~150-190).
  - `[2]` is the **fielding position** used by `lineupOrderChangeRelated(team, FIELDING_POSITION_*)`, which returns `i + 1` (cursor index) for the roster slot `i` whose `[2]` equals the target position. [INFERENCE] `[2]` is the defensive position; the batting-order index is a separate field.
  - In `battingOrderProcessInputs` the code reads `position = lineUpInfoStruct[port][selection][2]`, and that value is used to light up a position marker (`+0x140` and `+0x152`). This confirms that `[2]` drives the field-position UI.
- [FACT] **Defensive alignment is cursor-navigated on a diamond, not sorted.** In `src/Unknown/orderchange.c`, `swapPosMenu_left_rightPress(u8 right, u8 team)` (line 489) and `swapPosMenu_up_downPress(u8 down, u8 team)` (line 601) move the cursor from the current fielder's position to a neighbour with a switch statement. Up from Catcher goes to Pitcher, up from Pitcher to SS, up from 1B to RF, up from 2B to CF, up from 3B to LF, up from SS to CF, and so on. Left/right is the mirror (1B to 2B, 3B to SS, LF to RF, and so on). Moving past the edge goes to the confirm cell (`cursorPos = 0`).
  - [FACT] Fielders are not swapped by a drag. The press handling uses `charSelectedToBeSwapped[team]`: the user picks one fielder, moves the cursor, and presses A to place. (The A handler is not yet located.)
- [FACT] **Batting-order view** is a vertical list of 9 slots, with `cursorPos` 1-9 and 0 as the confirm cell. Up and down wrap. Up from 1 goes to confirm (0), and down from confirm goes to slot 1 (`swapPosMenu_up_downPress`, lines 601-700). While swapping (`charSelectedToBeSwapped != 0`), the cursor wraps and skips the confirm cell (`PLAYERS_PER_TEAM + 1` wrap).
- [FACT] **X button in batting-order view cycles batting stance and throwing arm**, implemented in `battingOrderProcessInputs` (`src/Unknown/team_management_screens.c` lines 250-450). `stance = BattingStance + FieldingArm*2 + 1`, wrapped at 4. Then `BattingStance = stance % 2` and `FieldingArm = stance / 2`. It is a 4-state cycle, with a sound effect `0x1B7`.
- [FACT] **Starring from the lineup editor** (`battingOrderProcessInputs`, the `inProgress_superStarAPlayer` branch): it calls `transferStatsToInMemRoster` on press, plays `sndFXRelated(INPUT_TRIGGER_L)`, and toggles the visibility of star markers on the roster record (`+0x76`, `+0x88`) and on the lineup record (`+0x140`, `+0x152`). Outside challenge mode only.
- [FACT] **Z menu** is a sub-menu with pages `Z_MENU_PAGE_MAIN` and `Z_MENU_PAGE_STAR_MOVES`. It opens and closes on the records at `port + 0x19A`, `0x19C`, `0x1AC` (or `0x118`, `0x119`, `0x121` in the other mode). The text is not yet read.
- [FACT] Star menu (the superstar moves list) opens through `starMissionRelated1`, `fn_800596D4`, and records at `0x1D3`, `0x1D5`, `0x1D7` (or `0x16A`, `0x16C`, `0x16E`).
- [NOT FOUND, so far] The A-press handler that actually performs the swap (`charSelectedToBeSwapped`). Next step is to grep for it.

**Batch 5: input model for the lineup and fielding editor (Section 3)**
- [FACT] Button map for the team-management screen, from `teamManagement_takeInputs(s32 playerIndex)` in `src/Unknown/File_0x8004617c.c` (line 69 onwards). The branches are checked in this order:
  - **Stick Down / Up** → `swapPosMenu_up_downPress(1 or 0, team)`. Moves the cursor through the lineup (batting view) or the diamond (defence view).
  - **Stick Left / Right** → `swapPosMenu_left_rightPress(0 or 1, team)`. Only acts in the defence view, and only when the cursor is on a fielder. In the batting view it does nothing.
  - **R trigger (new press)** → switch to `ROSTER_VIEW_DEFENSIVE_ALIGNMENT` (fielding), sound `0x1B7`.
  - **L trigger (new press)** → switch back to `ROSTER_VIEW_BATTING_ORDER`, sound `0x1B7`. Ignored in the batter-swap menu type.
  - **X (new press)** → in the batting view, toggles batting stance and arm (`stanceChangeRequested = 1`, then the cycle in `battingOrderProcessInputs`). Blocked when the team is confirmed.
  - **Y (new press)** → on a player, in batting view, toggles the superstar (star) state if `superstarUnlocked[CHAR_ID]` is nonzero. Outside challenge mode, it sets `inProgress_superStarAPlayer`. In challenge mode, it opens the star-missions menu (`STAR_MENU_DRAW_STEP_OPEN`, sound `0x1BF`).
  - **A (new press)** → if the cursor is 0 (confirm cell), it confirms the team. If the cursor is on a player, the first A picks that player (`charSelectedToBeSwapped = 1`, sound `0x1B8`). The second A on another player completes the swap (`charSelectedToBeSwapped = 0`, `swapCompleted = 1`). If the cursor is on the confirm cell, A confirms: `teamConfirmed[team] = 1`. In 2-player mode, the other team must also confirm before the screen exits.
  - **B (new press)** → cancel the pending pick (`charSelectedToBeSwapped = 0`, sound `0x1B9`). Else go to cursor 0 (confirm). Else exit.
  - **Sound effects**: `0x1B7` = move/tick, `0x1B8` = confirm, `0x1B9` = cancel, `0x1BA` = error/deny, `0x1BF` = star menu.
- [FACT] **Batting view layout**: one list of 9 slots, cursor 1-9, then 0 = confirm. Wrap rule: up from slot 1 goes to confirm (0), and down from confirm goes to slot 1. During a pending swap, the cursor skips the confirm cell and wraps 1↔9 (`PLAYERS_PER_TEAM + 1`).
- [FACT] **Defence view**: the cursor moves between fielders on a spatial diamond. `swapPosMenu_left_rightPress` (orderchange.c 489-600) and `swapPosMenu_up_downPress` (601-700) choose the next cell from the current fielder's `FIELDING_POSITION_*`. For example, from Pitcher, `up` goes to SS and `left` goes to 3B. Edge exits go to the confirm cell. [INFERENCE] This is the spatial navigation the game expects, not a free-form pick.
- [FACT] **Starring blocks the confirm step**: if the selected player has `superstarUnlocked == 0` (Y press), nothing happens. There is no error sound for this case, only a return. The deny sound `0x1BA` only fires when the cursor is on a player and the team is already confirmed, or when A is pressed while the cursor is non-zero on a non-confirm cell (lines ~342-350).
- [FACT] **Illegal lineup**: no check was found in the lineup editor for a legal or illegal batting order. The editor only swaps within a fixed set of 9 slots, so the lineup is always a full permutation. [NOT FOUND] A conflict check, a duplicate-position check, or an "illegal lineup" message. (Checked: `teamManagement_takeInputs`, `swapPosMenu_*`, `lineupOrderChangeRelated`. `lineupOrderChangeRelated` calls `OSPanic("orderchange.c", 0xD69, "//OZ 戻り値がありません\b")` only when the target position does not exist, which is a debug assertion, not a player message.)
- [FACT] The swap commit helper is `fn_800471F4(u8 charSelected, u8 team)` (`.text:0x800471F4`, size 0xAEC, from `config/GYQE01/symbols.txt` line 1877). **Its body is not in the decomp tree** (only the declaration appears in `File_0x8004617c.c` line 67). It returns the roster slot the cursor points at and is called on both picks. [NOT FOUND] the body that actually exchanges `lineUpInfoStruct[team][slot][2]` values.
- [FACT] Team-management view enums, from the names used in `src/Unknown/orderchange.c` and `team_management_screens.c`: `ROSTER_VIEW_BATTING_ORDER`, `ROSTER_VIEW_DEFENSIVE_ALIGNMENT`, `TEAM_MENU_TYPE_BATTER_SWAP`, `TEAM_MENU_TYPE_FIELDER_SWAP`, `TEAM_MENU_TYPE_SCOUT_FLAGS`, `TEAM_MENU_TYPE_STAR_MISSIONS`, `Z_MENU_PAGE_MAIN`, `Z_MENU_PAGE_STAR_MOVES`. The enum definitions are in headers not located in this search.
- [FACT] Default lineup generator: `mb_subfunc.c` lines ~1110-1135 set `lineUpInfoStruct[team][j][0] = j`, `[1] = j`, and `[2] = positions[k]`. Non-human teams and new teams get their fielding positions from `positions[]`. [INFERENCE] This is the auto-fill the user sees when the roster is first built.
- [FACT] Game-start lineup load: `src/game/match_setup/game_rel_entry.c` lines 160-180. Each slot gets `[0] = i`, `[1] = 0xA`, `[2] = 0xA`, and `[3] = FALSE`. A slot that is filled from `lineup[slot + PLAYERS_PER_TEAM]` gets `[1] = slot` and `[2] = lineup[...]`, and `[3] = TRUE`. **The value 0xA (10) is the "unfilled" sentinel** for the batting order and the fielding position. [FACT] This is the closest thing the code has to an "empty slot" marker in the lineup data.
- [FACT] Position/roster draw helper: `load_Icon(scene, lineUpInfoStruct[team][player][2] + team*9 + 0x10A, 1, 0x83, CharID)` in `team_management_screens.c` line 677. The fielding position of each player picks the icon record (0x10A + team*9 + position). The icon texture ID is not yet confirmed.

**Batch 6: character-select stat bars (Section 2) and the buddy legend (Section 4 strings)**
- [FACT] **The character-select (CSS) screen draws exactly four stat bars for the cursored character**: `gfx_cssCharStatBars_and_sthgElse(MenuScene *scene, s32 port)` in `src/menus/text_744C8.c` line 255 (`.text:0x00074F40`, size 0xC18). It reads `Static_Stats_Tables.characterStats[id/9][id%9].stats.{Batting,Running,Pitching,Fielding}StatBar`. It calls `fn_2_74E14(scene, port, value, idx)` with these index codes: **Batting = 0, Pitching = 1, Fielding = 2, Running = 3**. The raw Speed, contact, power, and pitch values are **not** displayed on this screen.
- [FACT] `fn_2_74E14` (text_744C8.c line 356, `.text:0x00074E14`, size 0x12C): writes `frame = (value - 1) << 16` on the bar record at `c + a*4 + 0x9B` (fill) and `frame = (value - 1) << 16` on `c + a*4 + 0xA3`. It also calls `fn_80036214(scene, 0xAB, 0, (value + 1)/2 - 1)` and stores the result in `rgba` of the second record. [INFERENCE] Bar fill is `value - 1` frames, so the scale is **1 to 10**. The second record takes `(value+1)/2 - 1`, which gives 0-4 (five steps of two). [INFERENCE] That is a 5-step segment or rank display. Not yet confirmed as a literal star row. Note: a value of 0 gives `(0-1)<<16`, which is a negative frame. [INFERENCE] a zero-valued bar would glitch.
- [FACT] Bar limits: `orderchange.c` caps each bar at 10 when starring (see Batch 4). The bar index is always 1..10, so 10 is the top of the meter.
- [FACT] Other CSS records for the cursored character (same function): `port + 0xB0` shows the character portrait at `frame = character << 16` (the portrait is the character ID as a frame index). `port + 0xAE` shows the colour variant at `frame = variant << 16`, where variant is 1..6 for red/blue/yellow/green/purple/black (switch on `CHAR_ID_*`). `port + 0xB2` is visible only when a variant exists. `port + 0xAC` is the name/panel record.
- [FACT] Challenge-mode captain pool: `challengeCaptainCharIDArray[superstarUnlocked[0xF4] * 6 + menuCursors[4]]`. So the challenge captain row depends on whether `superstarUnlocked[0xF4]` is set. Normal mode uses `mapCaptainCursorPositionToCharID[menuCursors[port + 4]]`.
- [FACT] **Text-table strings (T79, decoded with `zzzzdat.text`, lines 1-790).** These are the help-bar and prompt strings for the team screens. Verbatim, with trailing spaces trimmed:
  - n241 `Select team captains.`
  - n245 `Select players and form a team.` (team-building header, roster view)
  - n246 `Choose <cell 0x57>Random<cell 0x58> to select the` (random-team help)
  - n248 `<Y>Deselect all players            <L>Change Color`
  - n249 `<R>Swap positions`
  - n250 `<Z>Player profile`
  - n252 `Select batting order.`
  - n253 `<X>Switch L/R            <Y>Superstar`
  - n255 `<L><R>Switch batting order and positions`
  - n256 `<note>Buddy players`   **(the buddy legend, confirmed verbatim)**
  - n258 `Select where you want to play.`
  - n259 `<R>Random`
  - n263 `First Bat - Choose which team bats first.`
  - n264 `Star Skills - Turn Star Skills ON or OFF.`
  - n272/273 `Batting - Select EASY to display batting cursor.` + `Fielding - Select AUTO to` (the continuation is the next line)
  - n275 `Running - Select AUTO to automatically`
  - n288 `Select a Character.`
  - n317 `Past Superstars`
  - n336 `Select a team captain.`
  - n341 `Select members and form a team.`
  - n346 `<X>Switch L/R            <Y>Star`
  - n379 `Select  START GAME to begin.`
  - n398 `You didn't win. No one joined your team.`
  - n420 `Select batting order.` (n423 and n424 repeat the legend for the other batting-order mode)
  - n427 `<R>Random            <L>Change Color`
  - n443 `Switching to Superstars is done` / n444 ` next time you select batting order.`
  - n351 `You can't change game settings.`
- [FACT] **The "Buddy players" icon is a controller-icon control word.** `zzzzdat/text.py` (header doc, drawn from `src/text/text_draw.c`): control words **0x2D-0x35** are controller icons in the order `stick, A, B, X, Y, R, L, Z, note`. So `<note>` is control word **0x35**, and it is drawn as a **28-px icon**, inline in the text, the same way `<A>` and `<X>` are. [FACT] So the buddy "music note" is an in-font icon, not a free sprite.
- [FACT] Team-select dialogue (T82, the rival-team prompts) contains team and roster text such as `<grid font>Is your team ready?` (T82 n22), `Are you sure this is the team you want?` (T82 n26), and `your best <blue>team of nine</colour>` (T82 n32). These are the captain-select prompts for the rival CPU. Full strings are in `<scratchpad>/t79.json` and the search dump in `<scratchpad>/text_search.json`.
- [FACT] **Chemistry text is absent.** Searching T79 and T82 for `Chemistry` returns 0 hits. The word "Buddy" appears in T79 (n256, n349, n424, the legend), in T82 n885 (`Buddy Emblem`, the challenge shop item), and in T83 as part of a character description. No hit gives the "90" or "20" threshold, so the in-game text does not explain the buddy cut-off.
- [FACT] **Error and empty-state strings.** No "illegal lineup", "invalid team", or "empty slot" string was found in T79 or T82. The closest messages are `You didn't win. No one joined your team.` (T79 n398) and the deny sound `0x1BA` used when a press is refused (see Batch 5).

**Batch 7: grid geometry, team identity, art sizes, thresholds, in-match links**

*Section 1 (character select layout)*
- [FACT] The game's character select is the **captain select** (`src/menus/captain_select/`). It has **12 captain cells**, not 54. `menuCursors[4+port]` wraps at `>= 0xC` (`captain_select.c` line ~384).
- [FACT] **Grid geometry: 2 rows x 6 columns.** `captainSelect_processCursorMovement_getCharID` (`src/Unknown/File_0x8004e62c.c` lines 9-140): `base = (cur/6)*6`, so left and right wrap inside a row of 6. Up and down toggle between row 0 and row 1 (`other = ((cur/6+1)%2)*6`). `mapCaptainCursorPositionToCharID[0x0C + col*6 + k]` gives the cross-row order.
- [FACT] Direction bits (`include/Dolphin/pad.h`): LEFT=0x1, RIGHT=0x2, DOWN=0x4, UP=0x8, R=0x20, L=0x40. R triggers the random roll (`captainSelect_processCursorMovement_getCharID`, timer-driven `rand() % freeSlots`). L cycles the colour variant of the cursored character (`bytes[0x83+i]`, up to 5 variants). T79 n259 `<R>Random`, n248 `<L>Change Color`.
- [FACT] **12 cursor cells map to these characters** (first 12 bytes of `mapCaptainCursorPositionToCharID`, DOL 0x800FE5D4): Mario, Luigi, Peach, Yoshi, DK, Bowser, Daisy, Birdo, Waluigi, Diddy, Wario, Bowser Jr. [INFERENCE] Reading these as a 6-by-2 grid (top row Mario-Luigi-Peach-Yoshi-DK-Bowser) follows from the code above.
- [FACT] Two 3D captain models, one per team, at world positions `{-225, -35, 0}` and `{95, -35, 0}` (`src/menus/captain_select/captain_model_load.c` line ~179, `lbl_2_data_20F8`). The perspective frustum is `C_MTXFrustum(-0.175, 0.175, 0.25, -0.25, 1, 512)`. The ortho is `(-320..320, -240..240)`, so the screen is **640 x 480**.
- [NOT FOUND] The 54-character browser geometry (rows, columns, cell pixel size). The input path is `characterSelectControls` → `cssCursorOnBottomControl_maybe` (`src/menus/text_0323C.c` line 5005). The second function is only declared (`minigame_framework.c` line 94), not defined in the decomp. The 0x350 table `mapCaptainCursorPositionToCharID` holds 848 bytes, which is more than 12, so it likely serves that browser too. Not resolved.
- [FACT] Textures: `865` contains 144 entries: 0-47 are 153x54 C8 (team wordmarks), 48-95 are 90x90 C8 (team emblems), 96-143 are 250x26 C4 (team name banners). Confirmed by viewing 000 ("Mario Sunshines" wordmark), 048 (Shine-M emblem), and 096 (name banner). `2528`: 19 entries, including six 149x149 C4 captain portraits (009-014); 009 is Mario. `1745`: 32 entries at 50x50 C8 (053-084), e.g. 053 is a Mario head icon.

*Section 2 (stats at select time)*
- [FACT] The CSS shows **four stat bars**: Batting, Pitching, Running, Fielding. Source: `gfx_cssCharStatBars_and_sthgElse` (`text_744C8.c` line 255). Speed, contact, power, and pitch values are not drawn here.
- [FACT] Bar scale is 1-10 (`fn_2_74E14`: `frame = (value-1) << 16`). Starring caps each bar at 10 (`orderchange.c`). [INFERENCE] The bar frames are 10 steps.
- [FACT] Character-select also draws: portrait (`port+0xB0`, frame = character ID), colour variant (`port+0xAE`), and the variant-available marker (`port+0xB2`).
- [FACT] Base values of the four bars are in the `StatTable` at 0x37-0x3A (`character_stats.h`). **Numeric values not extracted**: the master table is in `.bss` (`Static_Stats_Tables` at 0x8034E9A0), so it is loaded at runtime rather than from the DOL's data section. [NOT FOUND] in this pass.
- [FACT] Class: `CharacterClass` (0x31) with values `BALANCED=0, POWER=1, SPEED=2, TECHNIQUE=3` (`include/mssbTypes.h` line 104). Class is used in auto-lineup via `battingOrderPriorityPositions[2][4][5]` (`mb_subfunc.c` line 153). Not shown on the select screen.

*Section 3 (lineup and fielding)*
- See Batches 4 and 5. Summary: A-press pick then A-press place (pairwise swap); B cancels; L/R switches batting view and defence view; X cycles batting stance and arm (4 states); Y toggles star. Defence view navigates a diamond by position. Illegal-lineup check: [NOT FOUND].

*Section 4 (chemistry and buddies)*
- [FACT] **Buddy threshold is 90 (≥90 and not 100).** `chemThresholds[4] = {90, 20, 90, 90}` (`src/game/data_only/gameplay_tables.c` line 188). The 90 for buddies is `buildHighChemLists` in `mb_subfunc.c`, and the 100-exclusion is there too.
- [FACT] **The 20 threshold is a gameplay cut-off, not a UI one.** `chemThresholds[1] = 20` is used in `src/game/fielding/fielder_ai.c` line 168: if chemistry < 20, the throw is redirected by a probability `LERPToNewRange_Float(chem, 0, 100, lbl_3_data_4908[0], lbl_3_data_4908[1])`. Other uses: `[0]=90` (chemistry throw, fielder_ai.c line 164), `[2]=90` (fielder assist, fielder.c line 4669), `[3]=90` (chem links on base, runner.c line 525).
- [FACT] **Connector: none on the lineup screen.** The only chemistry marker there is one UI element, `elementIndex = 0x2B`, set on each buddy teammate (`team_management_screens.c` `fn_8005C830`). The selected position uses `0x2A` (`fn_8005CCE4`). No line-drawing code was found in the team-management or CSS units. [INFERENCE] `0x2B` is the note marker, from the legend (`<note>` is controller-icon control word 0x35, 28 px). Confirming the sprite needs the UI layout.
- [FACT] **In-match, the only chem visual is a HUD icon per base, not a line.** `draw_OnBaseChemLinks` (`src/game/hud/hud_gauges.c` line ~615) hides HUD records 1, 2, or 3 for each empty base, based on `runnersOnBase` (bits 0-2, from `chemLinksOnBase` in runner.c line 525). It draws only when at least one runner has chem ≥ 90 with the batter.
- [FACT] Chem multipliers (in play): `chemBobbleMults[8] = {15, 20, 1.05, 1.10, 1.20, 1.10, 1.25, 1.5}` (`gameplay_tables.c` line 184), used for contact size and batting power (`batter.c` lines 1130, 1577).
- [FACT] Buddy Emblem adds `lbl_3_data_5FC4[10]` to chemistry for the human team when the challenge item is active (`stat_lookups.c` line 36-40). [NOT FOUND] that float's value.
- [FACT] Team chemistry stars (team select): average of nonzero `chemWCaptain` values over non-captain slots, mapped to 1-5 stars: ≥70 → 5, 55-69 → 4, 35-54 → 3, 15-34 → 2, 1-14 → 1 (`mb_subfunc.c` `fn_800670A0`). Five star records per team at `channel*5 + 0x6E + i` (`text_7E380.c` line 51-68).
- [FACT] Random and CPU rosters pick the captain's highest-chemistry available characters first, from `captainChemistryOrder` (`mb_subfunc.c` `fn_80067C48` line ~640 and fill loop line ~575).

*Section 5 (team select)*
- [FACT] **48 team identities** = 12 captains x 4 logos. `teamName[team] = logo - 1 + group*4`, where `group` is the captain's index in `captainIDMappings` (`mb_subfunc.c` `teamLogoDetermination`, line ~716). Fallback `teamName = (group+1)*4 - 1`.
- [FACT] Logo rule: `teamCompositionLogos` (returns 1 or 2) checks whether the roster holds the four characters in `lbl_80108F38[group*2+set][4]` (u16, 24 sets of four, DOL 0x80108F38). It also counts variant substitutes. `teamClassTypeLogos` (returns 3) checks whether ≥3 roster members share the captain's favoured class (`lbl_8010902C` first 12 bytes: `[0,0,3,0,2,0,1,3,1,2,1,1]` in `captainIDMappings` order). Otherwise logo 4.
- [FACT] Team-select cell (records set in `text_7E380.c` line 487-490 and `text_7BFF8.c` line 282): wordmark and banner frame = `teamName<<16`, captain portrait frame = `captainIDMappings[captain] << 16`, star meter = `startingChemStars` (0-5).
- [FACT] Team-select prompts (T79): `Select players and form a team.` (n245), `Select members and form a team.` (n341), `Select a team captain.` (n336), `Select batting order.` (n252), `Select START GAME to begin.` (n379).

*Section 6 (empty and error states)*
- [FACT] Empty roster slot: `rosterCharID = CHAR_ID_NONE (-1)` or the placeholder `NUM_CHOOSABLE_CHARACTERS (54)`, with `rosterSpotFilledInd = FALSE`. The placeholder is set in `fn_2_B508` (`text_0323C.c` line 3055) for team 1, slots 1-8. In the CSS, `character < 54` gates the bars and portrait (`text_744C8.c` lines 345-352), so an empty slot draws no bars, no portrait, and no name.
- [FACT] Empty lineup slot: `lineUpInfoStruct[..][1] = 0xA` and `[2] = 0xA` with `[3] = FALSE` (`game_rel_entry.c` lines 166-169). 0xA = 10 is the unfilled sentinel.
- [FACT] Duplicate-character check: `findRosterOverlap` (`text_0323C.c` line ~2835) and `fn_2_A62C` (line 2857) scan for a repeated character. `fn_2_A6E0` (line 2878) builds `lbl_2_bss_3E0[4]`, a 4-state validity flag set (-1 pass, 0 fail, 1 ok). Consumer `fn_2_B66C` picks a random stadium only if flag 0 is not -1 (`stadiumRandomizer(1,2)`).
- [FACT] **Start with an incomplete or illegal team is silent.** `captainSelectScreen_manager` case 4 (`teamselect.c` line ~160): if either ready flag `lbl_2_bss_100B8[0x40]` / `[0x41]` is 0, or `unk55[0]/[1]` is nonzero, it does `break` and does nothing. No message is shown.
- [FACT] Deny sound `0x1BA` is played when a press is refused (e.g. A on a non-confirm cell while the other team is confirmed, `File_0x8004617c.c` lines ~338-350).
- [FACT] Strings verbatim (T79): `You didn't win. No one joined your team.` (n398). The T82 rival prompt is `Are you sure this is the team you want?` (n26). No error string for an illegal team was found.
- [FACT] Team-size: `PLAYERS_PER_TEAM (9)` (`include/game/UnknownHomes_Game.h` line 25). A team is 9 slots, slot 0 = captain (`rosterCharID[team][0] = captain`, `mb_subfunc.c` line ~568).

*Section 4 extra: the 54x54 chemistry table*
- [FACT] `CharacterStats.chemistry[54]` at offset 0x3B of each 0xA0 row (`character_stats.h`). Row = `characterStats[charID/9][charID%9]`, column = partner CHAR_ID. Values: not extracted (in `.bss`, same reason as Section 2).

**Corrections and caveats (added last)**
- Batch 7 says `fn_2_B66C` "picks a random stadium". That is too strong. It calls `stadiumRandomizer(1, 2)` and loops until the chosen index's flag is not 0. The purpose of the result is [NOT FOUND]. Treat it as a validity-driven random pick, not a stadium pick.
- Batch 2 said the mapping columns are "the same as the 54 rows of the StatTable". That was an assumption. Only the 0x36-byte row length is confirmed.
- `lbl_8010902C[0x15]` (Batch 7) mixes class values (first 12 bytes) with CHAR_ID values (last 9 bytes). Only the first 12 bytes are read as favoured class.
- Team-select logo sets `lbl_80108F38` are the decoded u16 values as stored. The set membership is not validated against the in-game text.
- The `fn_800471F4` swap helper body and the 54-cell browser grid are outside the decomp tree. Anything about them here is inferred from callers only.
- Not extracted: numeric StatBar values, the chemistry matrix, `lbl_3_data_5FC4[10]`, 54-cell grid dimensions, and the exact pixel size of each UI cell (the UI layout records are not decoded in this pass).
- Extracted art is Nintendo IP: the PNGs are in `<scratchpad>/tex/` for documentation only.
