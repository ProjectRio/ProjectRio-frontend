# Chemistry / anti-chemistry indicators in Mario Superstar Baseball (GYQE01)

## Verdict

**The squiggle textures were not found.** No texture in the 127 texture entries dumped (list in section 6) is a wavy or zigzag link line, and no good/bad pair of same-shape, different-hue squiggles exists.

The decomp shows that chemistry is not drawn as a squiggle on the team-select screen at all. Team-select shows a 0 to 5 star meter. The in-game link and anti-chemistry visuals are drawn through two systems whose art I could not resolve to texture ids (section 4).

The data model is fully established from the decomp and from the real roster data (sections 2 and 3).

Candidate art copied to `/private/tmp/claude-501/-Users-matthewgreene--claude-spares-spare-QU1O0D/db10369f-8cb7-407f-9ac1-0f18774f206d/scratchpad/chem/`: three star sprites, which are the closest chemistry-related art found, with the caveat that none is confirmed to be the chemistry indicator.

---

## 1. Candidate art (copied to `.../scratchpad/chem/`)

These are the nearest matches. None is confirmed as a chemistry indicator. Their use in the game is unverified.

| File (absolute path) | Source entry / texture | Size | Colours | Shape (measured or read from contact sheet) |
|---|---|---|---|---|
| `/private/tmp/claude-501/-Users-matthewgreene--claude-spares-spare-QU1O0D/db10369f-8cb7-407f-9ac1-0f18774f206d/scratchpad/chem/2516_191_star_row_220x24.png` | entry 2516 (`tex/results_and_ranking_screens`), texture `191` (`C4`, indexed) | 220 x 24 | `#FFFFFF` only, alpha steps 0/36/73/109/146/182/219/255 | 11 white star glyphs, each about 16 x 15 px, at x = 2, 22, 42 ... 202 (20 px pitch), y = 4 to 18. Full-width 1 px rules at y = 0 and y = 23 (220 px each). |
| `/private/tmp/claude-501/-Users-matthewgreene--claude-spares-spare-QU1O0D/db10369f-8cb7-407f-9ac1-0f18774f206d/scratchpad/chem/1745_149_star_60x55.png` | entry 1745 (`tex/menu_bars_and_cursors`), texture `149` (`C4`) | 60 x 55 | `#FFFF63` (most common), `#FFFF9C`, `#FFEF4A`, `#EFE74A`, `#CEC639`, `#E7D642` (all alpha 255) | Single filled yellow star with a gradient; opaque bounding box x 8 to 51, y 7 to 48 (44 x 42 px). |
| `/private/tmp/claude-501/-Users-matthewgreene--claude-spares-spare-QU1O0D/db10369f-8cb7-407f-9ac1-0f18774f206d/scratchpad/chem/1745_094_star_glow_35x35.png` | entry 1745, texture `094` (`C4`) | 35 x 35 | `#FFFFFF` with alpha ramp (36 to 182), `#FF6B00` (alpha 255), `#FFC600` (alpha 255) | Orange-rimmed yellow star with white glow; fills the full 35 x 35 box. |

Note on the 2516 row: 11 stars does not fit the team-chemistry meter, which holds at most 5 (section 4). Its game use is unverified.

---

## 2. Data model (decomp)

Source files are under `/Users/matthewgreene/GitHub/mssb-dtk/`.

**Storage.** `include/game/character_stats.h`:
- `CharacterStats` is 0xA0 bytes per character. `StatTable` sits at 0x000 (0x3B bytes, packed). `ChemistryTable chemistry` sits at 0x03B, followed by 3 spare bytes and 22 spare shorts.
- `ChemistryTable` is 0x36 bytes, one `u8` per character, in CHAR_ID order: 54 entries (Mario through Boomerang Bro).
- Every entry is `u8` and is read as a plain byte in `calculateChemistry`. Storage is in `Static_Stats_Tables.characterStats[id/9][id%9].chemistry[otherId]`.

**Runtime function.** `src/game/stats/stat_lookups.c`, `calculateChemistry(team, charIdA, charIdB)`:
1. Reads the stored byte `chem`.
2. If the team is the human team, not an exhibition match, and the Buddy Emblem challenge-shop item is active, adds `lbl_3_data_5FC4[10]` (= 50.0f).
3. Clamps to a maximum of 100.
4. Returns `int`.

So the runtime value is an integer in roughly 0 to 100, and a Buddy Emblem can push the sum over 100 before the clamp. `docs/challenge_shop_items.md` line 18 agrees: "Chemistry increased by 50, capped at 100".

**Thresholds.** `src/game/data_only/gameplay_tables.c` line 188: `s16 chemThresholds[4] = { 90, 20, 90, 90 };`

| Index | Value | Used in | Meaning (from code) |
|---|---|---|---|
| 0 | 90 | `fielder_ai.c` 164 | Chemistry throw eligibility: chem >= 90 with the thrown-to fielder, and the target base is where that fielder stands. |
| 1 | 20 | `fielder_ai.c` 168 | Anti-chemistry ceiling: chem < 20 can trigger a bad throw. |
| 2 | 90 | `fielder.c` 4670 | Checks `chem < 90`. Context not fully traced. |
| 3 | 90 | `runner.c` 525 | On-base link: batter and runner link when chem >= 90. |

Anti-chemistry probability: `lbl_3_data_4908[4] = { 20, 20, 0, 0 }` (`gameplay_tables.c` line 327). The fielder code calls `LERPToNewRange_Float(chem, 0, 100, 20, 20)`, so the output is 20 for any chem value. That is a flat 20% chance of a bad throw when chem < 20. This is a read of the code, not a measurement.

**Other chemistry-driven multipliers.** `chemBobbleMults[8]` (`gameplay_tables.c` line 184), indexed by `chemLinksOnBase - 1` (links on base, 1 to 3):

| Field (batter.c struct) | Values | Used at |
|---|---|---|
| `chemBobbleMults[2]` | 15.0, 20.0 | not traced |
| `chemMult[3]` | 1.05, 1.10, 1.20 | `batter.c` 1131, contact size |
| `chemBattingMult[3]` | 1.10, 1.25, 1.50 | `batter.c` 1578, power when charged |

`g_Batter.chemLinksOnBase` (`UnknownHomes_Game.h` line 157) is 0 to 3, counted in `runner.c` 522 to 526 as the number of runners on base whose chem with the batter is >= 90.

**Team-level stars.** `src/Unknown/mb_subfunc.c` line 880, `fn_800670A0`, and the mirror in `src/menus/text_744C8.c` line 191, `teamSelectionSetChemStars`:
- Average the captain-chemistry values of the 8 non-captain roster players, skipping zero entries.
- Stars: 5 if avg >= 70; 4 if 55 to 69; 3 if 35 to 54; 2 if 15 to 34; 1 if 1 to 14; 0 otherwise.
- Stored in `Static_Stats_Tables.startingChemStars[team]` (`UnknownHomes_Static.h` line 238).

So the team-select chemistry indicator is a star meter of at most 5 stars per team, derived from average chemistry with the captain.

---

## 3. Real data (roster entry 7)

Extracted with `python3 -m zzzzdat extract 7` (decompressed `rosterFileDescriptorGame`, 18,144 bytes). Parsed with `zzzzdat/presets.py`.

- Diagonal (self) value: 50 for all 54 characters.
- Off-diagonal values: min 5, max 99, 92 distinct values, mean 59.86, median 61.
- Symmetric: 0 asymmetric pairs out of 1,431 unordered pairs. Storage is per ordered pair, but the data is symmetric.
- Raw stored values never reach 100. Entries of 100 or more come only from the Buddy Emblem add at runtime.
- Values >= 90 (chem-link threshold): 202 directed entries, so 101 unordered pairs.
- Values < 20 (anti-chem range): 106 directed entries, so 53 unordered pairs.
- Most common values: 50 (112 entries, the default self value), 86 (74), 85 (74), 84 (72), 68 (70).

So chemistry is a per-pair integer 5 to 99, not a binary good/bad flag. "Good" and "bad" are threshold regions (>= 90 and < 20), with the middle band (20 to 89) giving no in-game effect according to the code above.

---

## 4. Where the indicators are drawn (code)

**A. Team-select / captain-select stars.** `teamSelectionSetChemStars` (`text_744C8.c` line 191) drives 5 star graphics per team: `gfxObject(scene, team*5 + 0x6E + i)`. These are 2D UI records. The star art is not confirmed. Candidate star textures are in section 1.

**B. On-base links (in-game HUD).** `draw_OnBaseChemLinks` (`src/game/hud/hud_gauges.c` line 618) draws `lbl_3_data_D4F8` (`hud_scoreboard.c` line 1126):

| Record | `elementIndex` | `layer` | `parent` | `tag` | Visibility rule |
|---|---|---|---|---|---|
| 0 | 0x10 | 0 | none | 0 | always |
| 1 | 0x11 | 1 | 0 | 0 | hidden unless `runnersOnBase & 1` |
| 2 | 0x11 | 1 | 0 | 1 | hidden unless `runnersOnBase & 2` |
| 3 | 0x11 | 1 | 0 | 2 | hidden unless `runnersOnBase & 4` |
| 4 | 0x12 | 1 | 0 | 3 | always |

The `elementIndex` values are layout-element indices, not texture indices. They resolve through a layout table inside a texture container. I could not decode that table with the tools available. The HUD container is most likely `2513` (`in_game_hud_text_counts_team_names_results`) or `2514` (`hud_frames`), but this is not confirmed.

**C. Anti-chemistry / chemistry-throw graphics (fielders).** `displayChem_antiChemGraphics` (`src/game/animation/actor_transform.c` line 168) does not use a 2D record. It queues an actor-transform draw (`fn_3_168DFC`):
- Chem throw: `modelIndex = 2`, `slotA = 5`, `offsetIndex = 0`.
- Anti-chem throw: `modelIndex = 3`, `slotA = 6`, `offsetIndex = 1`.
- Scale `lbl_3_data_28680[13] / 1e5 = 3.0`. The offset for `offsetIndex` 0 and 1 is (0, 0.5, 0).

So these are animated model slots on the fielder, not a 2D squiggle. They are drawn per frame and removed when the animation reaches `frames`. The model and texture files behind `modelIndex` 2 and 3 are in the per-character actor data, which I did not dump. This is the most likely place for an animated link/squiggle effect, but it is unverified.

**D. Lineup chemistry markers.** `fn_8005C830` (`src/Unknown/team_management_screens.c` line 782) sets `elementIndex = 0x2B` on the records of teammates whose chemistry with the selected character is >= 90 (`highChemTeammates`, `UnknownHomes_Static.h` line 249). These are 2D records in the team-management container. Container id not confirmed.

---

## 5. Ruled out

Each entry below was dumped with `python3 -m zzzzdat textures <id>` into `/private/tmp/claude-501/-Users-matthewgreene--claude-spares-spare-QU1O0D/db10369f-8cb7-407f-9ac1-0f18774f206d/scratchpad/tex_<id>/`.

- **1745 (menu bars and cursors), 180 textures.** Contact-sheet review of all 129 textures at 64 px height or less. Contains stat labels (Balance, Power, Speed, Technique), mode labels, digits, character heads, items, and a star (149) and a glow star (094). No squiggle.
- **2514 (hud_frames), 102 textures.** Full contact-sheet review. Contains score-column labels, numerals, CPU/P1-P4 tags, team portraits, and a Mario Sunshine logo. No squiggle.
- **2513 (in-game HUD text, counts, team names, results), 369 textures.** Contact-sheet review of 270 textures at 160x64 or smaller. Contains HUD labels, letters in several colour schemes (SAFE, STEAL, CHANCE, TOP, BOTTOM), digits, power/speed/balance labels, and a red meter bar (357). No squiggle.
- **1753 (menu font and frames), 427 textures.** 139 textures are 400x20 or 420x20 staff-credit name strips. The 22 textures flagged by the automated wave scan are character silhouette masks (review sheet). The rest of the set was not sheeted individually.
- **1744 (records book), 31 textures.** Contains hiragana kana glyphs, a book image, and 0 to 9 digits. No squiggle.
- **865 (team name logos), 144 textures.** All are 153x54 wordmark logos. No squiggle.
- **1739 (help text pages), 202 textures.** Contains label text, numerals and small panel text. No squiggle.
- **Other entries scanned automatically (wave detector).** 0, 4, 5, 6, 78, 80, 866 to 888, 1740 to 1743, 1747 to 1752, 1754, 1857 to 1877, 2201 to 2221, 2515 to 2552 (127 entries total in the dumps). The detector flagged text lines, sparkles and glyph sheets. Reviewed the top candidates by eye; none is a squiggle.
- **Pair search.** All same-size pairs (up to 200x100) with identical opaque masks and different mean colour were listed (640 candidates). Most were flat text plates and red/blue digit sets (for example 2516 349 to 400, reviewed). None is a good/bad pair of squiggles.
- **MSSB-Editor sources.** `grep -i chem` over `zzzzdat/`, `tools/`, `native/` and `README.md` finds only roster-table code and the chemistry byte offset (`zzzzdat/presets.py`). No texture name or UI-layout parser.
- **pyrio** (`/Users/matthewgreene/GitHub/pyrio`). `grep -i chem` returns nothing.
- **Decomp docs.** `docs/file_map.md` lines 104, 117, 181 describe the files above. `config/GYQE01/symbols.txt` gives addresses for `calculateChemistry` (0x0006D658), `draw_OnBaseChemLinks` (0x00099CFC), `displayChem_antiChemGraphics` (0x00168FA0) and `teamSelectionSetChemStars` (0x00075BE4).

---

## 6. Open leads (not done)

1. **Decode the UI layout table** that maps `elementIndex` to (texture, rectangle). Needed to resolve `0x10`, `0x11`, `0x12` (on-base links), `0x2B` (lineup markers) and the team-select star records. The decomp header `include/Unknown/File_0x80034e20.h` says the layout is traced in ProjectRio-ASM (`Include/Rio/MenuScene.h`, `docs/menu_scenes.md`). That repo is not on this machine.
2. **Dump the actor models** referenced by `modelIndex` 2 and 3 (chem and anti-chem) and the animation slots `lbl_3_common_bss_35154.slots[5]` and `[6]`. This is the most likely place for an animated squiggle effect.
3. **Confirm the team-select star art** by checking which container `teamSelectionSetChemStars` gfxObjects are built from.

No ISO data was copied. Entries were read in place with `zzzzdat`, and the only extracted data are the entry 7 roster file and the scratchpad PNG dumps.

---

## 7. Chem / anti-chem actor models (open lead 2, resolved)

**Result.** The chem and anti-chem effects are two small animated billboard sprites ("emote" icons) in archive entry **810** (`prop/maxtame`, `contactWordModelsFileDescriptor`). They are not squiggles. There is no wave in the mesh, and the textures are icons, not a zigzag line.

### 7.1 How the indices resolve (decomp)

1. `displayChem_antiChemGraphics` (`src/game/animation/actor_transform.c` line 168) queues `fn_3_168DFC` with `modelIndex` 2 (chem) or 3 (anti), `slotA` 5 or 6.
2. `mUpdateActorTransformAndAnimation` (line 240) reads `model = lbl_3_common_bss_35154.models + modelIndex*0x90 + 0x34`. So `modelIndex` indexes the 0x90-byte actor records in the shared effects block.
3. `models` at +0x10 is the same field as `actorList` at +0x10 in `src/game/animation/scene_effects.c` (struct `SceneFx`, line 42).
4. `maybeHudRelated` (`scene_effects.c` line 1654) loads entry 810 with `ARAMTransfer(&contactWordModelsFileDescriptor, ...)` into `lbl_3_common_bss_35154._0C`. `fn_3_BF238` (line 1649) walks its 44 section pointers.
5. For anim sections 3, 11, 21, 27, 33, 39 it calls `animateBallRelated(actorList, actorCount, ...)` and increments `actorCount` (0 to 5). Each one is a model record. Section 21 is actorCount 2, and section 27 is actorCount 3. That is the `modelIndex` 2 and 3 mapping.
6. The textures for each set are the textures section just before it (section 18 for set 2, section 24 for set 3). The geometry is the geopalette section just after its anim.

`slotA` 5 and 6 are `ActorFxSlot` records (`actor_transform.c` line 17). `frames` for those slots is what ends the draw in `fn_3_168DFC` (line 216). I did not resolve the slot `frames` values, so the on-screen lifetime is unmeasured. The bank itself is 30 frames.

### 7.2 Entry 810 section map (verified with `Store.info(e).sections` and `c3.parse_geopalette`)

| Set | Textures sec | Layout sec | Geopalette sec | Bank (anim) sec | Bank sequence name | Used as |
|---|---|---|---|---|---|---|
| 0 | 0 (2 tex: 128x64, 128x128) | 1 | 2 | 3 | `maxtame` | not in ActorTransform |
| 1 | 8 | 9 | 10 | 11 | `maxpitch` | not in ActorTransform |
| 2 | 18 (2 tex: 64x64, 64x64) | 19 | 20 | 21 | **`good`** | `modelIndex` 2, chem |
| 3 | 24 (2 tex: 64x64, 64x64) | 25 | 26 | 27 | **`bad`** | `modelIndex` 3, anti-chem |
| 4 | 30 (2 tex: 64x64, 64x64) | 31 | 32 | 33 | `tsukare` | `modelIndex` 4 (fn_3_168CD8, slot 7) |
| 5 | 36 (2 tex: 64x32, 64x64) | 37 | 38 | 39 | `piyori` | `modelIndex` 5 (fn_3_16892C, slots 8 and 9) |

### 7.3 Geometry

Both chem and anti-chem geopalettes contain 4 triangles in 2 meshes, and each mesh is a flat quad at z = 0 (2 triangles each). Each mesh is parented to one bone. Layout is `actor` > `bone0` > `good00` or `bad00`, and `actor` > `bone1` > `good01` or `bad01`. The quads are flat planes, not a ribbon or a chain. The transform in `mUpdateActorTransformAndAnimation` multiplies by the inverse view rotation, so each quad is camera-facing.

| Mesh (glTF node) | Bone | Vertices (x, y, z) | Shape | Texture (draw index) |
|---|---|---|---|---|
| `good00` | bone0 | (+0.25, -0.25), (+0.25, +0.25), (-0.25, +0.25), (-0.25, -0.25) | axis-aligned square, half-side 0.25 | set 2 tex 0 (pink speech bubble) |
| `good01` | bone1 | (+0.367, -0.212), (+0.212, +0.367), (-0.367, +0.212), (-0.212, -0.367) | square, half-side 0.30, rotated -30 deg | set 2 tex 1 (musical note) |
| `bad00` | bone0 | (+0.375, -0.375), (+0.375, +0.375), (-0.375, +0.375), (-0.375, -0.375) | axis-aligned square, half-side 0.375 | set 3 tex 0 (purple starburst) |
| `bad01` | bone1 | (+0.304, -0.111), (+0.111, +0.304), (-0.304, +0.111), (-0.111, -0.304) | square, half-side 0.23, rotated -20 deg | set 3 tex 1 (purple spiral) |

Each mesh has 4 vertices, each with UVs, normals and colours.

### 7.4 Textures (64x64, 4-bit indexed `C4`)

Files are in `/private/tmp/claude-501/-Users-matthewgreene--claude-spares-spare-QU1O0D/db10369f-8cb7-407f-9ac1-0f18774f206d/scratchpad/chem/actor810/`.

- `s18_t0_64x64_C4.png`: pink speech bubble. Dominant colours `#FFDEEF` (fill, 2124 px), `#FF94B5` (ring, 157 px), `#FF9CBD` (71 px), `#FFD6E7`, `#FFBDD6`. Tail at bottom-left. Chem set, tex 0.
- `s18_t1_64x64_C4.png`: musical note, black fill `#000000` (279 px) with white outline `#FFFFFF` (454 px) and grey anti-alias `#424242`, `#9C9C9C`. Chem set, tex 1.
- `s24_t0_64x64_C4.png`: starburst. Fill `#E7CEFF` (1123 px), with `#DEBDF7`, `#D6A5F7`, outline `#AD4AD6` (93 px) and `#A542CE` (75 px). Anti-chem set, tex 0.
- `s24_t1_64x64_C4.png`: spiral swirl, near-black purple `#310042` (593 px) and `#330044` (the bulk of the stroke). Tornado-like, about 3 loops. Anti-chem set, tex 1.
- `s30_t0_64x64_C4.png`: light-blue sweat drop (tsukare set, tex 0).
- `s30_t1_64x64_C4.png`: grey puffy cloud with bubble tail (tsukare set, tex 1).
- `s36_t0_64x32_C4.png`: three yellow horizontal streaks (piyori set, tex 0).
- `s36_t1_64x64_C4.png`: yellow five-point star (piyori set, tex 1).

Hex values in this list come from sampling the 64x64 PNGs (most common opaque colours). The sec-30 and sec-36 textures were described from the contact sheet only.

The "squiggle" nearest to a wavy line is `s24_t1` (the purple spiral). It is a spiral, not a zigzag. The chem set has no wavy texture.

### 7.5 Animation clips (from the bank, 30 fps)

`good` (chem, section 21), 30 frames = 1.0 s, 2 tracks:
- bone0 (scale on `good00`): f0 (0,0,0), f10 (1.10,1.10,1.10), f15 (1.00,1.00,1.00), f30 (1.00,1.00,1.00). A pop-in from zero to 1.10 and settle to 1.0.
- bone1 (rotation/scale/translation on `good01`): z-rotation 0 deg at f0 and f5, -15 deg at f10 (quaternion z = -0.1305), 0 deg at f18 with scale z 1.25 and y translation -0.1835, back to 0 deg and scale 1.0 at f30. A wobble and squash.

`bad` (anti-chem, section 27), 30 frames = 1.0 s, 2 tracks:
- bone0 (scale on `bad00`): f0 (0,0,0), f10 (1.133,1.133,1.133), f20 (0.80,0.80,0.80), f30 (1.00,1.00,1.00). Pop, then shrink, then settle.
- bone1 (rotation on `bad01`): z-rotation -25 deg at f10, 0 deg at f18, -25 deg at f21, 0 deg at f24, -25 deg at f27, 0 deg at f30. Three oscillations of a flicker.

After f30 the animation holds the final pose.

The glTF `animations` arrays confirm the channel targets (bone0 scale, bone1 rotation, bone1 translation, bone1 scale).

### 7.6 Exported glTF files

Directory: `/private/tmp/claude-501/-Users-matthewgreene--claude-spares-spare-QU1O0D/db10369f-8cb7-407f-9ac1-0f18774f206d/scratchpad/chem/actor810/`

- `chem_good_810_s20_bank21_TEX_FIXED.glb` (animation `good`, meshes `good00` and `good01`, images 64x64 from section 18). **Use this one.**
- `antichem_bad_810_s26_bank27_TEX_FIXED.glb` (animation `bad`, meshes `bad00` and `bad01`, images 64x64 from section 24). **Use this one.**
- `tsukare_810_s32_bank33_TEX_FIXED.glb` and `piyori_810_s38_bank39_TEX_FIXED.glb` (the other two emote sets, fixed).

**Gotcha found.** `Store.glb()` resolved draw texture indices against the global texture list. For entry 810 that gives section 0's textures (128x64 and 128x128), not the set's own textures. The unfixed exports are kept as `WRONG_TEX_section0_*.glb` in the scratchpad `actor810/` folder so you can see the difference. The `_TEX_FIXED` files were rebuilt with the correct section textures, and their embedded PNGs were verified by re-decoding. The geometry and animations in the two sets are the same. Only the images differ.

Mesh and bone structure is taken directly from the GLB JSON. The rig is `actor` (root) > `bone0` > mesh 0, and `actor` > `bone1` > mesh 1. The glTF has no skin, so the bones are plain nodes.

### 7.7 Answers to the four questions

1. **Entries.** Chem = entry 810, geopalette section 20, bank section 21 (`good`). Anti-chem = entry 810, geopalette section 26, bank section 27 (`bad`). Their model slots are `modelIndex` 2 and 3 of the shared effects block. The on-screen lifetime comes from `slotA` 5 and 6 frames, which I did not resolve.
2. **Clip names.** `good` (chem) and `bad` (anti-chem), each 30 frames at 30 fps. The naming convention is `<name>` with no `<char><id>_<verb>_<nnn>` form, since these are effect actors.
3. **Geometry.** Flat camera-facing quads (2 per effect), with 2 bones each and 4 triangles per effect. No ribbon, no tube, no chain. The "squiggle" is not a mesh wave.
4. **Texture.** The planes sample real textures. The chem planes sample a bubble and a musical note. The anti-chem planes sample a starburst and a purple spiral. The spiral (`s24_t1`) is the closest match to the squiggle, but it is a swirl, not a zigzag.

### 7.8 Open items

- The on-screen lifetime (`slots[5]` and `slots[6]` `frames`) was not resolved.
- Which fielder-relative offset is applied: the decomp uses `lbl_3_data_28680` offsets for the billboard (x +0.5 in view space) and scale 3.0. I did not render, so the on-screen size is computed, not observed.
- `modelIndex` 4 and 5 (tsukare and piyori) are the sweat-drop and star effects, not chemistry.
