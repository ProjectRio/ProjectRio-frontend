# MSSB (GameCube): Challenge progression, growth titles and shop economy

Read-only dossier. Target: Challenge Mode progression, character growth (titles), the star and scout mission system, the challenge shop, the challenge map, unlock copy, and Grand Prix.

## 0. Sources and confidence

Each claim is tagged with where it came from:

- **[ISO]** Bytes read from the disc in place: decoded text tables (T79 = `text_strings_790_menus`, T82 = `text_strings_954_menus_challengeDialogueTextFileDescriptor`, T86 = `text_strings_23`, T87 = `text_strings_168`, T83 = `text_strings_599`), plus data read from `main.dol` (`characterStaticIndexes`, `starMissionRequirementsTable`, `starMissionDisplayRules`, `starRankTextIDs`, `starRankByMissionCount`, `starMenuSizes`) and from `menus.rel` / `game.rel` `.data` (shop prices, shop availability table, Buddy Emblem multiplier). The DOL and RELs were read through `zzzzdat` (`read_dol`, `load_binaries`, `Dol.offset_of`).
- **[decomp]** Names and comments from `mssb-dtk` (a community decompilation, not on the disc). Used for enum names (`STAR_MISSION_TYPE_*`, `CHAR_ID_*`, `CHALLENGE_SHOP_ITEM_*`) and code logic. The decomp's data tables match the DOL bytes (spot-checked: row 0 slot 0 = STRIKEOUTS, target 1; row 31 has 4 slots; `CHAR_ID` ordering matches `characterStaticIndexes`).
- **[inference]** Something I derived and did not see directly.
- **[gap]** Could not resolve.

Text conventions: verbatim strings from the tables. `|` marks an in-game line break. Engine markup (`<grid font>`, `<speed N>`, colour tags) is stripped where noted. `[block glyph 0xBD]` is a proportional-font symbol I did not resolve.

Script location (not part of the deliverable): `scratchpad/scripts/prog/` (`dol_dump.py`, `shop_dump.py`, `analyze.py`, `analyze2.py`, `gen_md.py`). Raw extracts: `scratchpad/scripts/prog/dol_tables.json`, `shop.json`, `rows_dump.txt`.

## 1. Headline findings

1. **The growth-title ladder is per character row, not one global list.** T79 #660-779 is 32 ladders packed back to back. Each ladder is a run of 3 to 5 titles, usually ending in "Star". Rank is picked by the number of cleared star missions and the character's variant class. [ISO + decomp]
2. **Each character has 4 to 10 star missions.** The table holds 10 slots per row, but rows use 4, 6, 8 or 10 of them. Slot text is T79 #456-659, verbatim. [ISO]
3. **Most rows start with 2 or 3 always-visible slots.** In the 10-slot rows these are a stat or contact mission, "Win MVP!!", and a "Get a [ball item]!" mission. The rest unlock after a star count and a difficulty row. [ISO]
4. **"Get a X!" missions target shop item ids.** The target of the "Get ..." slot equals the challenge-shop item index (for example Mario's "Get a Red Fireball!" has target 6, which is `CHALLENGE_SHOP_ITEM_RED_FIREBALL`). [ISO + decomp]
5. **The shop has 20 entries (ids 0-19), not 19.** Id 19 is Super Star. Prices come from `menus.rel`. Descriptions and names are in T82 #880-920. [ISO + decomp]
6. **Buddy Emblem adds +50 chemistry** for the human team (confirmed: `lbl_3_data_5FC4[10] = 50.0`, applied in `calculateChemistry`). [ISO + decomp]
7. **Possible title overflow for Yoshi and Bowser** (section 2.3). The decomp rank math can point past the end of their ladders. Not verified in-game. [decomp, gap]
8. **Four challenge difficulties**: Flower, Star, Special, Miracle (T82 #774-777; the first three also in T79 #141-143). [ISO]


## 2. Growth titles (character growth)

### 2.1 How the title is chosen [decomp, verified against DOL tables]

- `challenge_getStarRank(charID)` = `starRankByMissionCount[variantClassification][countStarMissions(charID)]`.
- `countStarMissions` counts the star-mission slots whose status is "completed" (`challengeStarRelatedInd`), either saved (-2) or conditionally completed in this game (-1).
- The title shown is T79 entry `starRankTextIDs[row] + rank`, where `row` is the character's `requirementRow` (from `characterStaticIndexes`). Used in `File_0x80056ae4.c` (star-check screen) and `team_management_screens.c`.
- `starRankTextIDs[32] = 780` (T79 "none"); `starRankTextIDs[33] = 0` (sentinel).

`starRankByMissionCount[5][11]` (index: completed count 0-10; classes: 0 primary captain, 1 secondary captain, 2 unique non-captain, 3 primary variant, 4 secondary variant):

| Class | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 0 primary captain | 0 | 0 | 1 | 1 | 1 | 2 | 2 | 3 | 3 | 3 | 4 |
| 1 secondary captain | 0 | 0 | 1 | 1 | 1 | 2 | 2 | 2 | 3 | 3 | 3 |
| 2 unique non-captain | 0 | 0 | 1 | 1 | 2 | 2 | 3 | 3 | 3 | 3 | 3 |
| 3 primary variant | 0 | 0 | 1 | 1 | 2 | 2 | 2 | 2 | 2 | 2 | 2 |
| 4 secondary variant | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |

Rank 4 is the "Star" rung on 5-entry ladders. Variant characters (Toads, Shy Guys, Koopa Troopa red, Paratroopa green, etc.) share their primary's row, so they share a ladder but are capped lower by class.

### 2.2 Full ladder table, verbatim [ISO]

Rank 0 is the first title. "Star" is the top rung on every ladder that has one.

| Row | Characters sharing this ladder | Titles, rank 0 to top (T79 ids) |
|---|---|---|
| 0 | Mario | Mini-Mario > Super Mario > Fire Mario > Wing Mario > Star (#660-664) |
| 1 | Luigi | Bit Player > Sidekick > Hero > Star (#665-668) |
| 2 | Donkey Kong | Big Eater > Powerhouse > Konga Master > Jungle King > Star (#669-673) |
| 3 | Diddy Kong | Klutz > Trickster > Acrobat > Star (#674-677) |
| 4 | Peach | Mischief-Maker > Elegant Lass > Lady > Princess > Star (#678-682) |
| 5 | Daisy | Tomboy > Angel > Floral Queen > Star (#683-686) |
| 6 | Yoshi | Egg > Mini-Yoshi > Hungry Yoshi > Super Yoshi (#687-690) |
| 7 | Baby Mario | Crybaby > Late-Riser > Wild Child > Star (#691-694) |
| 8 | Baby Luigi | Shy Kid > Spoiled Boy > Little Angel > Star (#695-698) |
| 9 | Bowser | Roughneck > Koopa Boss > Koopa King > Pure Evil (#699-702) |
| 10 | Wario | Fatso > Hunk > Muscle Man > Great One > Star (#703-707) |
| 11 | Waluigi | Skin and Bones > Thin Dude > Model > Star (#708-711) |
| 12 | Koopa Troopa (green), Koopa Troopa (red) | Easygoing Guy > Runner > Star (#712-714) |
| 13 | Toad (red), Toad (blue), Toad (yellow), Toad (green), Toad (purple) | Helper > Hard Worker > Star (#715-717) |
| 14 | Boo | Blusher > Scamp > Star (#718-720) |
| 15 | Toadette | City Girl > Ms. Popular > Mushroom Idol > Star (#721-724) |
| 16 | Shy Guy (red), Shy Guy (blue), Shy Guy (yellow), Shy Guy (green), Shy Guy (black) | Amateur > Expert > Star (#725-727) |
| 17 | Birdo | Pebble > Glass Bead > Diamond > Star (#728-731) |
| 18 | Monty Mole | Scoop > Shovel > Drill > Star (#732-735) |
| 19 | Bowser Jr. | Naughty One > Brat > Prince > Star (#736-739) |
| 20 | Koopa Paratroopa (red), Koopa Paratroopa (green) | Feather > Big Wing > Star (#740-742) |
| 21 | Pianta (blue), Pianta (red), Pianta (yellow) | Easygoing > Friendly > Star (#743-745) |
| 22 | Noki (blue), Noki (red), Noki (green) | Colorful One > Dr. Snazzy  > Star (#746-748) |
| 23 | Hammer Bro., Fire Bro., Boomerang Bro. | Iron Hammer > Steel Hammer > Star (#749-751) |
| 24 | Toadsworth | Smart Guy > Brainstormer > Maven > Star (#752-755) |
| 25 | Magikoopa (blue), Magikoopa (red), Magikoopa (green), Magikoopa (yellow) | Apprentice > Magician > Star (#756-758) |
| 26 | King Boo | Big Ghost > Boss Ghost > Ghost King > Star (#759-762) |
| 27 | Petey Piranha | Croaker > Howler > Opera Singer > Star (#763-766) |
| 28 | Dixie Kong | Cutie > Pretty Gal > Charmer > Star (#767-770) |
| 29 | Goomba | Newcomer > Veteran > Star (#771-773) |
| 30 | Paragoomba | Hippety-hop > Flap Flap > Star (#774-776) |
| 31 | Dry Bones (gray), Dry Bones (green), Dry Bones (red), Dry Bones (blue) | Bony One > Big Bone > Star (#777-779) |
Concrete examples (rank 0 to top):

- **Mario**: Mini-Mario > Super Mario > Fire Mario > Wing Mario > Star. Matches the Mushroom-powerup theme of the row.
- **Luigi**: Bit Player > Sidekick > Hero > Star.
- **Donkey Kong**: Big Eater > Powerhouse > Konga Master > Jungle King > Star.
- **Peach**: Mischief-Maker > Elegant Lass > Lady > Princess > Star.
- **Yoshi**: Egg > Mini-Yoshi > Hungry Yoshi > Super Yoshi (no "Star"; see 2.3).
- **Bowser**: Roughneck > Koopa Boss > Koopa King > Pure Evil (no "Star"; see 2.3).
- **King Boo**: Big Ghost > Boss Ghost > Ghost King > Star.

### 2.3 Anomaly: Yoshi and Bowser ladders have no "Star" [ISO + decomp, gap]

Rows 6 (Yoshi) and 9 (Bowser) have 4 titles and no "Star". Both have 10 mission slots and are primary captains (class 0), so `starRankByMissionCount[0][10] = 4` is reachable.

- Row 6 at rank 4 indexes T79 #691 = **Crybaby** (Baby Mario's first title).
- Row 9 at rank 4 indexes T79 #703 = **Fatso** (Wario's first title).

If the game reads it this way, a fully cleared Yoshi or Bowser shows another character's title. I did not confirm this in-game. Check whether those two characters' tracker classification can be 0 at runtime, or whether a clamp exists.

### 2.4 Rows with variants [ISO]

Variant groups in `characterStaticIndexes` (`variantGroup` > 0): Koopa Troopa (green primary; red variant), Toad (red primary; blue, yellow, green, purple variants), Shy Guy (red primary), Paratroopa (red primary; green variant), Pianta (blue primary; red, yellow), Noki (blue primary; red, green), Hammer Bro. (primary; Fire Bro., Boomerang Bro. variants), Magikoopa (blue primary; red, green, yellow), Dry Bones (gray primary; green, red, blue). Variants have `hasOwnStarMissions = 0` and read their primary's row.

## 3. Star missions and scout missions

### 3.1 Structure [ISO + decomp]

- `starMissionRequirementsTable[32][10]`: per row and slot, type, target, flags. Flags: `REQUIRES_WIN` (0x1), `MIN_DIFFICULTY_1/2/3` (0x2/0x4/0x8), minigame-specific bits (0x10 << id), `BOWSER_UNLOCK` (0x800).
- `starMissionDisplayRules[32][10]`: T79 text id, mode, `minStars`, `minScoutRow`. Mode 0 = always shown. Mode 1 = shown once the character has `minStars` completed and the difficulty row is at least `minScoutRow` (`challengeDrawStarsOnMissionMenu`). Unused slot text id = 455.
- Text ids run contiguously from T79 #456 to #659 (204 strings); #455 is blank.
- Some decoded `type` names are "UNK_nn" in the decomp. These are not named there. Their text is still verbatim.

### 3.2 Gates in use [ISO]

Gates are per slot as (minStars, minScoutRow) pairs. The pairs used are (1,1), (1,2), (2,1), (2,2), (3,2), (4,2) and (6,3). The most common tiers are: always visible; (2,1); (4,2); (6,3).

### 3.3 Every row, verbatim [ISO]

Columns: slot, when shown, type (decomp name), target, gate flags, mission text (T79, verbatim; `/` = line break). Unused slots are omitted.

### Row 0: Mario

Growth ladder (T79 #660-664, rank 0 to top): Mini-Mario > Super Mario > Fire Mario > Wing Mario > **Star**

| Slot | Shown | Type (decomp) | Target | Gate | Mission text (T79, verbatim) |
|---|---|---|---|---|---|
| 0 | always | STRIKEOUTS | 1 | - | Strike 'em out! (#456) |
| 1 | always | WIN_AS_MVP | 0 | - | Win MVP!! (#457) |
| 2 | always | UNK_58 | 6 | - | Get a Red Fireball! (#458) |
| 3 | after 2 stars, difficulty row >= 1 | MINIGAME_POINTS | 20 | difficulty >= 1; minigame Bob-omb Derby only | Blast more than 2,000-points / worth of Bob-ombs! (#459) |
| 4 | after 2 stars, difficulty row >= 1 | STAR_SWING_RBIS | 1 | difficulty >= 1 | Drive in a run with a / Fireball swing! (#460) |
| 5 | after 2 stars, difficulty row >= 1 | BIG_PLAYS | 1 | difficulty >= 1 | Make a big play! (#461) |
| 6 | after 4 stars, difficulty row >= 2 | HOME_RUN_WITH_RBIS | 2 | difficulty >= 2 | Belt a 2-run homer or better! (#462) |
| 7 | after 4 stars, difficulty row >= 2 | RBIS | 3 | difficulty >= 2 | Drive in more than 3 runs in / a game! (#463) |
| 8 | after 4 stars, difficulty row >= 2 | NO_HITTER | 0 | requires win; difficulty >= 2 | Pitch a perfect game & win! (#464) |
| 9 | after 6 stars, difficulty row >= 3 | HOME_RUN_WITH_RBIS | 4 | difficulty >= 3 | Belt a grand slam! (#465) |

### Row 1: Luigi

Growth ladder (T79 #665-668, rank 0 to top): Bit Player > Sidekick > Hero > **Star**

| Slot | Shown | Type (decomp) | Target | Gate | Mission text (T79, verbatim) |
|---|---|---|---|---|---|
| 0 | always | HITS | 1 | - | Smack a hit! (#466) |
| 1 | always | WIN_AS_MVP | 0 | - | Win MVP!! (#467) |
| 2 | always | UNK_58 | 7 | - | Get a Green Fireball! (#468) |
| 3 | after 2 stars, difficulty row >= 1 | UNK_35 | 1 | difficulty >= 1 | Make a jumping catch! (#469) |
| 4 | after 2 stars, difficulty row >= 1 | MINIGAME_POINTS | 20 | difficulty >= 1; minigame Barrel Batter only | Score over 2,000 points and / clear Barrel Batter! (#470) |
| 5 | after 4 stars, difficulty row >= 2 | MINIGAME_RANK | 1 | difficulty >= 2; minigame id 0 (decomp MINI_GAME_ID_NONE; Toy Field by text) only | Win in the Toy Field! (#471) |
| 6 | after 4 stars, difficulty row >= 2 | SHUTOUT | 0 | requires win; difficulty >= 2 | Win with a shutout! (#472) |
| 7 | after 6 stars, difficulty row >= 3 | WIN_AS_MVP | 0 | difficulty >= 3; Bowser-unlock only | Be the MVP in the last game! (#473) |

### Row 2: Donkey Kong

Growth ladder (T79 #669-673, rank 0 to top): Big Eater > Powerhouse > Konga Master > Jungle King > **Star**

| Slot | Shown | Type (decomp) | Target | Gate | Mission text (T79, verbatim) |
|---|---|---|---|---|---|
| 0 | always | HIT_AT_LEAST_BASES | 2 | - | Crack a long hit! (#474) |
| 1 | always | WIN_AS_MVP | 0 | - | Win MVP!! (#475) |
| 2 | always | UNK_58 | 14 | - | Get a King Banana! (#476) |
| 3 | after 2 stars, difficulty row >= 1 | HOME_RUNS | 1 | difficulty >= 1 | Hit a home run! (#477) |
| 4 | after 2 stars, difficulty row >= 1 | STAR_SWING_RBIS | 1 | difficulty >= 1 | Score a run with a / Banana Ball swing! (#478) |
| 5 | after 2 stars, difficulty row >= 1 | RBI_OFF_PITCHER | 0 | difficulty >= 1 | Drive in runs vs. Mario! (#479) |
| 6 | after 4 stars, difficulty row >= 2 | STRIKEOUTS | 3 | difficulty >= 2 | Get 3 strikeouts in a game! (#480) |
| 7 | after 4 stars, difficulty row >= 2 | HOME_RUNS | 2 | difficulty >= 2 | Belt more than 2 homers in a game! (#481) |
| 8 | after 4 stars, difficulty row >= 2 | LASER_THROW_OUTS | 0 | difficulty >= 2 | Get a runner out with a / laser beam throw! (#482) |
| 9 | after 6 stars, difficulty row >= 3 | HOME_RUN_WITH_DIDDY_AND_DIXIE_ON_BASE | 0 | difficulty >= 3 | Belt a homer with Diddy and / Dixie Kong as runners! (#483) |

### Row 3: Diddy Kong

Growth ladder (T79 #674-677, rank 0 to top): Klutz > Trickster > Acrobat > **Star**

| Slot | Shown | Type (decomp) | Target | Gate | Mission text (T79, verbatim) |
|---|---|---|---|---|---|
| 0 | always | RUNS_SCORED | 1 | - | Cross home plate! (#484) |
| 1 | always | WIN_AS_MVP | 0 | - | Win MVP!! (#485) |
| 2 | always | UNK_58 | 15 | - | Get a Chimp Banana! (#486) |
| 3 | after 2 stars, difficulty row >= 1 | STAR_PITCH_AND_STAR_SWING | 0 | requires win; difficulty >= 1 | Pitch and bat with the Boomerang / Ball and win the game! (#487) |
| 4 | after 2 stars, difficulty row >= 1 | STRIKE_OUT_BATTER | 7 | difficulty >= 1 | Strike out Baby Mario! (#488) |
| 5 | after 4 stars, difficulty row >= 2 | STRIKE_OUT_BATTER | 17 | difficulty >= 2 | Strike out Birdo! (#489) |
| 6 | after 4 stars, difficulty row >= 2 | HIT_OFF_PITCHER | 0 | difficulty >= 2 | Get a hit with Mario! (#490) |
| 7 | after 6 stars, difficulty row >= 3 | UNK_38 | 1 | difficulty >= 3 | Climb up the wall and / make a catch! (#491) |

### Row 4: Peach

Growth ladder (T79 #678-682, rank 0 to top): Mischief-Maker > Elegant Lass > Lady > Princess > **Star**

| Slot | Shown | Type (decomp) | Target | Gate | Mission text (T79, verbatim) |
|---|---|---|---|---|---|
| 0 | always | STRIKEOUTS | 1 | - | Strike 'em out! (#492) |
| 1 | always | WIN_AS_MVP | 0 | - | Win MVP!! (#493) |
| 2 | always | UNK_58 | 8 | - | Get a Lovely Heart! (#494) |
| 3 | after 2 stars, difficulty row >= 1 | STRIKE_OUT_BATTER | 9 | difficulty >= 1 | Strike out Bowser! (#495) |
| 4 | after 2 stars, difficulty row >= 1 | STAR_PITCH_AND_STAR_SWING | 0 | requires win; difficulty >= 1 | Pitch and bat with the / Heart Ball and win the game! (#496) |
| 5 | after 2 stars, difficulty row >= 1 | BIG_PLAYS | 1 | difficulty >= 1 | Make a big play! (#497) |
| 6 | after 4 stars, difficulty row >= 2 | STRIKEOUTS | 5 | difficulty >= 2 | Get 5 strikeouts! (#498) |
| 7 | after 4 stars, difficulty row >= 2 | MINIGAME_POINTS | 30 | difficulty >= 2; minigame Wall Ball only | Score over 300 points by / breaking walls! (#499) |
| 8 | after 4 stars, difficulty row >= 2 | SHUTOUT_AGAINST_CAPTAIN | 9 | requires win; difficulty >= 2 | Shut out the Bowser team and / win! (#500) |
| 9 | after 6 stars, difficulty row >= 3 | UNK_71 | 1 | - | Become a captain and / round everyone up! (#501) |

### Row 5: Daisy

Growth ladder (T79 #683-686, rank 0 to top): Tomboy > Angel > Floral Queen > **Star**

| Slot | Shown | Type (decomp) | Target | Gate | Mission text (T79, verbatim) |
|---|---|---|---|---|---|
| 0 | always | HITS | 1 | - | Smack a hit! (#502) |
| 1 | always | WIN_AS_MVP | 0 | - | Win MVP!! (#503) |
| 2 | always | UNK_58 | 9 | - | Get a Pretty Flower! (#504) |
| 3 | after 2 stars, difficulty row >= 1 | RBIS | 1 | difficulty >= 1 | Drive in a run! (#505) |
| 4 | after 2 stars, difficulty row >= 1 | STAR_PITCH_AND_STAR_SWING | 0 | requires win; difficulty >= 1 | Pitch and bat with the / Flower Ball and win the game! (#506) |
| 5 | after 4 stars, difficulty row >= 2 | UNK_52 | 1 | difficulty >= 2 | Smash the bonus barrel in / Barrel Batter! (#507) |
| 6 | after 4 stars, difficulty row >= 2 | HITS | 3 | difficulty >= 2 | Smack more than 3 hits in / a game! (#508) |
| 7 | after 6 stars, difficulty row >= 3 | DOUBLE_PLAY_WITH | 4 | difficulty >= 3 | Make a double play with Peach! (#509) |

### Row 6: Yoshi

Growth ladder (T79 #687-690, rank 0 to top): Egg > Mini-Yoshi > Hungry Yoshi > Super Yoshi

| Slot | Shown | Type (decomp) | Target | Gate | Mission text (T79, verbatim) |
|---|---|---|---|---|---|
| 0 | always | STOLEN_BASES | 1 | - | Steal a base! (#510) |
| 1 | always | WIN_AS_MVP | 0 | - | Win MVP!! (#511) |
| 2 | always | UNK_58 | 12 | - | Get an Egg! (#512) |
| 3 | after 2 stars, difficulty row >= 1 | STAR_PITCH_AND_STAR_SWING | 0 | requires win; difficulty >= 1 | Pitch and bat with the / Egg Ball and win the game! (#513) |
| 4 | after 2 stars, difficulty row >= 1 | BUNT_HITS | 1 | difficulty >= 1 | Reach base on a bunt with / the bases empty! (#514) |
| 5 | after 2 stars, difficulty row >= 1 | HIT_AT_LEAST_BASES | 3 | difficulty >= 1 | Belt either a triple or / a home run! (#515) |
| 6 | after 4 stars, difficulty row >= 2 | HITS | 2 | difficulty >= 2 | Smack more than 2 hits in a game! (#516) |
| 7 | after 4 stars, difficulty row >= 2 | MINIGAME_POINTS | 100 | difficulty >= 2; minigame Piranha Panic only | Score over 100 points in / Piranha Panic! (#517) |
| 8 | after 4 stars, difficulty row >= 2 | RUNS_SCORED | 3 | difficulty >= 2 | Cross the plate more than / 3 times in a game! (#518) |
| 9 | after 6 stars, difficulty row >= 3 | UNK_37 | 3 | difficulty >= 3 | Get more than 3 outs in a / game using the tongue catch! (#519) |

### Row 7: Baby Mario

Growth ladder (T79 #691-694, rank 0 to top): Crybaby > Late-Riser > Wild Child > **Star**

| Slot | Shown | Type (decomp) | Target | Gate | Mission text (T79, verbatim) |
|---|---|---|---|---|---|
| 0 | always | HITS | 1 | - | Smack a hit! (#520) |
| 1 | always | STRIKEOUTS | 1 | - | Strike 'em out! (#521) |
| 2 | after 1 stars, difficulty row >= 1 | UNK_72 | 0 | - | Beat Bowser Jr.'s team! (#522) |
| 3 | after 1 stars, difficulty row >= 1 | RUNS_SCORED | 2 | difficulty >= 1 | Cross the plate more than / twice in a game! (#523) |
| 4 | after 1 stars, difficulty row >= 2 | RBI_OFF_PITCHER | 0 | difficulty >= 2 | Drive in runs vs. Mario! (#524) |
| 5 | after 3 stars, difficulty row >= 2 | UNK_42 | 1 | difficulty >= 2 | Catch a booted ball! (#525) |

### Row 8: Baby Luigi

Growth ladder (T79 #695-698, rank 0 to top): Shy Kid > Spoiled Boy > Little Angel > **Star**

| Slot | Shown | Type (decomp) | Target | Gate | Mission text (T79, verbatim) |
|---|---|---|---|---|---|
| 0 | always | STOLEN_BASES | 1 | - | Steal a base! (#526) |
| 1 | always | BUNT_FORCES_IN_RUN | 1 | - | Drop a squeeze bunt! (#527) |
| 2 | after 1 stars, difficulty row >= 1 | STAR_CHANCES | 1 | difficulty >= 1 | Get a Team Star! (#528) |
| 3 | after 1 stars, difficulty row >= 1 | UNK_54 | 0 | requires win; difficulty >= 1 | Win Piranha Panic with / no damage! (#529) |
| 4 | after 1 stars, difficulty row >= 2 | STRIKE_OUT_BATTER | 1 | difficulty >= 2 | Strike out Luigi! (#530) |
| 5 | after 3 stars, difficulty row >= 2 | STOLEN_BASES | 2 | difficulty >= 2 | Steal a base more than twice / in a game! (#531) |

### Row 9: Bowser

Growth ladder (T79 #699-702, rank 0 to top): Roughneck > Koopa Boss > Koopa King > Pure Evil

| Slot | Shown | Type (decomp) | Target | Gate | Mission text (T79, verbatim) |
|---|---|---|---|---|---|
| 0 | always | RBIS | 1 | - | Drive in a run! (#532) |
| 1 | always | WIN_AS_MVP | 0 | - | Win MVP!! (#533) |
| 2 | always | UNK_58 | 16 | - | Get a Bullet Bill! (#534) |
| 3 | after 2 stars, difficulty row >= 1 | CHARGE_HITS | 1 | difficulty >= 1 | Smack a hit with a / charge swing! (#535) |
| 4 | after 2 stars, difficulty row >= 1 | SHUTOUT | 0 | requires win; difficulty >= 1 | Win with a shutout! (#536) |
| 5 | after 2 stars, difficulty row >= 1 | STAR_SWING_RBIS | 1 | difficulty >= 1 | Bat in a run with a / Killer Ball swing! (#537) |
| 6 | after 4 stars, difficulty row >= 2 | BODY_CHECKS | 1 | difficulty >= 2 | Crush someone with a / body check! (#538) |
| 7 | after 4 stars, difficulty row >= 2 | HOME_RUNS | 1 | difficulty >= 2 | Hit a home run! (#539) |
| 8 | after 4 stars, difficulty row >= 2 | HOME_RUNS | 2 | difficulty >= 2 | Belt 2 homers in 1 game! (#540) |
| 9 | after 6 stars, difficulty row >= 3 | HOME_RUN_WITH_RBIS | 4 | difficulty >= 3 | Belt a grand slam! (#541) |

### Row 10: Wario

Growth ladder (T79 #703-707, rank 0 to top): Fatso > Hunk > Muscle Man > Great One > **Star**

| Slot | Shown | Type (decomp) | Target | Gate | Mission text (T79, verbatim) |
|---|---|---|---|---|---|
| 0 | always | HITS | 2 | - | Smack more than 2 hits in a game! (#542) |
| 1 | always | UNK_70 | 2 | - | Become a captain and win more / than 900 coins! (#543) |
| 2 | always | UNK_58 | 10 | - | Get a Gnarly Garlic! (#544) |
| 3 | after 2 stars, difficulty row >= 1 | HIT_OFF_PITCHER | 0 | difficulty >= 1 | Get a hit with Mario! (#545) |
| 4 | after 2 stars, difficulty row >= 1 | STAR_PITCH_AND_STAR_SWING | 0 | requires win; difficulty >= 1 | Pitch and bat with the / Phony Ball and win the game! (#546) |
| 5 | after 2 stars, difficulty row >= 1 | STRIKE_OUT_BATTER | 0 | difficulty >= 1 | Strike out Mario! (#547) |
| 6 | after 4 stars, difficulty row >= 2 | UNK_53 | 1 | difficulty >= 2 | Get a red gem in / Chain Chomp Sprint! (#548) |
| 7 | after 4 stars, difficulty row >= 2 | MINIGAME_POINTS | 20 | difficulty >= 2; minigame id 0 (decomp MINI_GAME_ID_NONE; Toy Field by text) only | Get more than 200 coins in the / Toy Field! (#549) |
| 8 | after 4 stars, difficulty row >= 2 | HOME_RUN_OFF_PITCHER | 0 | difficulty >= 2 | Belt a home run with Mario! (#550) |
| 9 | after 6 stars, difficulty row >= 3 | RBIS | 5 | difficulty >= 3 | Get more than 5 RBIs in the / game! (#551) |

### Row 11: Waluigi

Growth ladder (T79 #708-711, rank 0 to top): Skin and Bones > Thin Dude > Model > **Star**

| Slot | Shown | Type (decomp) | Target | Gate | Mission text (T79, verbatim) |
|---|---|---|---|---|---|
| 0 | always | STRIKEOUTS | 1 | - | Strike 'em out! (#552) |
| 1 | always | WIN_AS_MVP | 0 | - | Win MVP!! (#553) |
| 2 | always | UNK_58 | 11 | - | Get a Whiskered Eggplant! (#554) |
| 3 | after 2 stars, difficulty row >= 1 | SHUTOUT | 0 | requires win; difficulty >= 1 | Win with a shutout! (#555) |
| 4 | after 2 stars, difficulty row >= 1 | STRIKE_OUT_BATTER | 1 | difficulty >= 1 | Strike out Luigi! (#556) |
| 5 | after 4 stars, difficulty row >= 2 | LASER_THROW_OUTS | 1 | difficulty >= 2 | Get a runner out with a / laser beam throw! (#557) |
| 6 | after 4 stars, difficulty row >= 2 | HITS | 3 | difficulty >= 2 | Smack more than 3 hits in / a game! (#558) |
| 7 | after 6 stars, difficulty row >= 3 | UNK_65 | 0 | - | Clear all minigames! (#559) |

### Row 12: Koopa Troopa (green), Koopa Troopa (red)

Growth ladder (T79 #712-714, rank 0 to top): Easygoing Guy > Runner > **Star**

| Slot | Shown | Type (decomp) | Target | Gate | Mission text (T79, verbatim) |
|---|---|---|---|---|---|
| 0 | always | RBIS | 1 | - | Drive in a run! (#560) |
| 1 | always | COMPLETE_GAME | 0 | requires win | Pitch a whole game and win! (#561) |
| 2 | after 1 stars, difficulty row >= 1 | HIT_AT_LEAST_BASES | 2 | difficulty >= 1 | Crack a long hit! (#562) |
| 3 | after 2 stars, difficulty row >= 2 | HITS | 3 | difficulty >= 2 | Smack more than 3 hits in / a game! (#563) |

### Row 13: Toad (red), Toad (blue), Toad (yellow), Toad (green), Toad (purple)

Growth ladder (T79 #715-717, rank 0 to top): Helper > Hard Worker > **Star**

| Slot | Shown | Type (decomp) | Target | Gate | Mission text (T79, verbatim) |
|---|---|---|---|---|---|
| 0 | always | UNK_59 | 0 | - | Let someone go shopping / for you! (#564) |
| 1 | always | WIN_AS_MVP | 0 | - | Win MVP!! (#565) |
| 2 | after 1 stars, difficulty row >= 1 | HOME_RUNS | 1 | difficulty >= 1 | Hit a home run! (#566) |
| 3 | after 2 stars, difficulty row >= 2 | BODY_CHECKS | 1 | difficulty >= 2 | Crush someone with a / body check! (#567) |

### Row 14: Boo

Growth ladder (T79 #718-720, rank 0 to top): Blusher > Scamp > **Star**

| Slot | Shown | Type (decomp) | Target | Gate | Mission text (T79, verbatim) |
|---|---|---|---|---|---|
| 0 | always | HITS | 1 | - | Smack a hit! (#568) |
| 1 | always | STRIKEOUTS | 3 | - | Get 3 strikeouts in a game! (#569) |
| 2 | after 1 stars, difficulty row >= 1 | HITS | 2 | difficulty >= 1 | Smack more than 2 hits in a game! (#570) |
| 3 | after 2 stars, difficulty row >= 2 | SHUTOUT | 0 | requires win; difficulty >= 2 | Win with a shutout! (#571) |

### Row 15: Toadette

Growth ladder (T79 #721-724, rank 0 to top): City Girl > Ms. Popular > Mushroom Idol > **Star**

| Slot | Shown | Type (decomp) | Target | Gate | Mission text (T79, verbatim) |
|---|---|---|---|---|---|
| 0 | always | HITS | 1 | - | Smack a hit! (#572) |
| 1 | always | STRIKEOUTS | 1 | - | Strike 'em out! (#573) |
| 2 | after 1 stars, difficulty row >= 1 | BIG_PLAYS | 1 | difficulty >= 1 | Make a big play! (#574) |
| 3 | after 1 stars, difficulty row >= 1 | SHUTOUT | 0 | requires win; difficulty >= 1 | Win with a shutout! (#575) |
| 4 | after 1 stars, difficulty row >= 2 | WIN_AS_MVP | 0 | difficulty >= 2 | Win MVP!! (#576) |
| 5 | after 3 stars, difficulty row >= 2 | NOTE_BLOCK_HITS | 1 | difficulty >= 2 | Hit a [block glyph 0xBD] block with the ball! (#577) |

### Row 16: Shy Guy (red), Shy Guy (blue), Shy Guy (yellow), Shy Guy (green), Shy Guy (black)

Growth ladder (T79 #725-727, rank 0 to top): Amateur > Expert > **Star**

| Slot | Shown | Type (decomp) | Target | Gate | Mission text (T79, verbatim) |
|---|---|---|---|---|---|
| 0 | always | HITS | 1 | - | Smack a hit! (#578) |
| 1 | always | MINIGAME_POINTS | 10 | minigame Bob-omb Derby only | Belt more than 1,000-points / worth of Bob-ombs! (#579) |
| 2 | after 1 stars, difficulty row >= 1 | BIG_PLAYS | 1 | difficulty >= 1 | Make a big play! (#580) |
| 3 | after 2 stars, difficulty row >= 2 | STRIKEOUTS | 5 | difficulty >= 2 | Get 5 strikeouts! (#581) |

### Row 17: Birdo

Growth ladder (T79 #728-731, rank 0 to top): Pebble > Glass Bead > Diamond > **Star**

| Slot | Shown | Type (decomp) | Target | Gate | Mission text (T79, verbatim) |
|---|---|---|---|---|---|
| 0 | always | RBIS | 1 | - | Drive in a run! (#582) |
| 1 | always | WIN_AS_MVP | 0 | - | Win MVP!! (#583) |
| 2 | always | UNK_58 | 13 | - | Get a Pink Egg! (#584) |
| 3 | after 2 stars, difficulty row >= 1 | BIG_PLAYS | 1 | difficulty >= 1 | Make a big play! (#585) |
| 4 | after 2 stars, difficulty row >= 1 | UNK_73 | 1 | - | Beat Peach's team! (#586) |
| 5 | after 4 stars, difficulty row >= 2 | MINIGAME_POINTS | 30 | difficulty >= 2; minigame Chain Chomp Sprint only | Collect more than 30 gems! (#587) |
| 6 | after 4 stars, difficulty row >= 2 | HOME_RUNS | 1 | difficulty >= 2 | Hit a home run! (#588) |
| 7 | after 6 stars, difficulty row >= 3 | WIN_AS_MVP | 0 | difficulty >= 3; Bowser-unlock only | Be the MVP in the last game! (#589) |

### Row 18: Monty Mole

Growth ladder (T79 #732-735, rank 0 to top): Scoop > Shovel > Drill > **Star**

| Slot | Shown | Type (decomp) | Target | Gate | Mission text (T79, verbatim) |
|---|---|---|---|---|---|
| 0 | always | STOLEN_BASES | 1 | - | Steal a base! (#590) |
| 1 | always | BUNT_FORCES_IN_RUN | 1 | - | Drop a squeeze bunt! (#591) |
| 2 | after 1 stars, difficulty row >= 1 | STAR_CHANCES | 1 | difficulty >= 1 | Get a Team Star! (#592) |
| 3 | after 1 stars, difficulty row >= 1 | BUNT_HITS | 1 | difficulty >= 1 | Reach base on a bunt with / the bases empty! (#593) |
| 4 | after 1 stars, difficulty row >= 2 | UNK_39 | 1 | difficulty >= 2 | Tag someone out while / carrying the ball! (#594) |
| 5 | after 3 stars, difficulty row >= 2 | RUNS_SCORED | 3 | difficulty >= 2 | Cross the plate more than / 3 times in a game! (#595) |

### Row 19: Bowser Jr.

Growth ladder (T79 #736-739, rank 0 to top): Naughty One > Brat > Prince > **Star**

| Slot | Shown | Type (decomp) | Target | Gate | Mission text (T79, verbatim) |
|---|---|---|---|---|---|
| 0 | always | HITS | 1 | - | Smack a hit! (#596) |
| 1 | always | RUNS_SCORED | 1 | - | Cross home plate! (#597) |
| 2 | always | UNK_58 | 17 | - | Get a Jr. Mask! (#598) |
| 3 | after 2 stars, difficulty row >= 1 | STAR_PITCH_AND_STAR_SWING | 0 | requires win; difficulty >= 1 | Pitch and bat with the Killer Jr. Ball / and win the game! (#599) |
| 4 | after 2 stars, difficulty row >= 1 | HOME_RUNS | 1 | difficulty >= 1 | Hit a home run! (#600) |
| 5 | after 4 stars, difficulty row >= 2 | STRIKE_OUT_BATTER | 0 | difficulty >= 2 | Strike out Mario! (#601) |
| 6 | after 4 stars, difficulty row >= 2 | HOME_RUN_WITH_TEAMMATE | 9 | difficulty >= 2 | Belt a back-to-back homer / with Bowser! (#602) |
| 7 | after 6 stars, difficulty row >= 3 | WIN_AS_MVP | 0 | difficulty >= 3; Bowser-unlock only | Be the MVP in the last game! (#603) |

### Row 20: Koopa Paratroopa (red), Koopa Paratroopa (green)

Growth ladder (T79 #740-742, rank 0 to top): Feather > Big Wing > **Star**

| Slot | Shown | Type (decomp) | Target | Gate | Mission text (T79, verbatim) |
|---|---|---|---|---|---|
| 0 | always | HITS | 1 | - | Smack a hit! (#604) |
| 1 | always | RUNS_SCORED | 1 | - | Cross home plate! (#605) |
| 2 | after 1 stars, difficulty row >= 1 | COMPLETE_GAME | 0 | requires win; difficulty >= 1 | Pitch a whole game and win! (#606) |
| 3 | after 2 stars, difficulty row >= 2 | UNK_35 | 1 | difficulty >= 2 | Make a jumping catch! (#607) |

### Row 21: Pianta (blue), Pianta (red), Pianta (yellow)

Growth ladder (T79 #743-745, rank 0 to top): Easygoing > Friendly > **Star**

| Slot | Shown | Type (decomp) | Target | Gate | Mission text (T79, verbatim) |
|---|---|---|---|---|---|
| 0 | always | HIT_AT_LEAST_BASES | 2 | - | Crack a long hit! (#608) |
| 1 | always | RBIS | 1 | - | Drive in a run! (#609) |
| 2 | after 1 stars, difficulty row >= 1 | HOME_RUNS | 1 | difficulty >= 1 | Hit a home run! (#610) |
| 3 | after 2 stars, difficulty row >= 2 | LASER_THROW_OUTS | 1 | difficulty >= 2 | Get a runner out with a / laser beam throw! (#611) |

### Row 22: Noki (blue), Noki (red), Noki (green)

Growth ladder (T79 #746-748, rank 0 to top): Colorful One > Dr. Snazzy  > **Star**

| Slot | Shown | Type (decomp) | Target | Gate | Mission text (T79, verbatim) |
|---|---|---|---|---|---|
| 0 | always | HITS | 1 | - | Smack a hit! (#612) |
| 1 | always | STOLEN_BASES | 1 | - | Steal a base! (#613) |
| 2 | after 1 stars, difficulty row >= 1 | COMPLETE_GAME | 0 | requires win; difficulty >= 1 | Pitch a whole game and win! (#614) |
| 3 | after 2 stars, difficulty row >= 2 | RUNS_SCORED | 3 | difficulty >= 2 | Cross the plate more than / 3 times in a game! (#615) |

### Row 23: Hammer Bro., Fire Bro., Boomerang Bro.

Growth ladder (T79 #749-751, rank 0 to top): Iron Hammer > Steel Hammer > **Star**

| Slot | Shown | Type (decomp) | Target | Gate | Mission text (T79, verbatim) |
|---|---|---|---|---|---|
| 0 | always | HITS | 1 | - | Smack a hit! (#616) |
| 1 | always | HIT_AT_LEAST_BASES | 2 | - | Crack a long hit! (#617) |
| 2 | after 1 stars, difficulty row >= 1 | HOME_RUNS | 1 | difficulty >= 1 | Hit a home run! (#618) |
| 3 | after 2 stars, difficulty row >= 2 | HOME_RUNS | 2 | difficulty >= 2 | Belt 2 homers in 1 game! (#619) |

### Row 24: Toadsworth

Growth ladder (T79 #752-755, rank 0 to top): Smart Guy > Brainstormer > Maven > **Star**

| Slot | Shown | Type (decomp) | Target | Gate | Mission text (T79, verbatim) |
|---|---|---|---|---|---|
| 0 | always | FIELD_BALLS | 1 | - | Catch the ball! (#620) |
| 1 | always | HITS | 1 | - | Smack a hit! (#621) |
| 2 | after 1 stars, difficulty row >= 1 | BIG_PLAYS | 1 | difficulty >= 1 | Make a big play! (#622) |
| 3 | after 1 stars, difficulty row >= 1 | STOLEN_BASES | 1 | difficulty >= 1 | Steal a base! (#623) |
| 4 | after 1 stars, difficulty row >= 2 | WIN_AS_MVP | 0 | difficulty >= 2 | Win MVP!! (#624) |
| 5 | after 3 stars, difficulty row >= 2 | UNK_65 | 0 | - | Clear all minigames! (#625) |

### Row 25: Magikoopa (blue), Magikoopa (red), Magikoopa (green), Magikoopa (yellow)

Growth ladder (T79 #756-758, rank 0 to top): Apprentice > Magician > **Star**

| Slot | Shown | Type (decomp) | Target | Gate | Mission text (T79, verbatim) |
|---|---|---|---|---|---|
| 0 | always | BUNTS | 1 | - | Drop a sacrifice bunt! (#626) |
| 1 | always | STRIKEOUTS | 1 | - | Strike 'em out! (#627) |
| 2 | after 1 stars, difficulty row >= 1 | BIG_PLAY_CATCHES | 1 | difficulty >= 1 | Make a big play with a / magical catch! (#628) |
| 3 | after 2 stars, difficulty row >= 2 | WIN_AS_MVP | 0 | difficulty >= 2 | Win MVP!! (#629) |

### Row 26: King Boo

Growth ladder (T79 #759-762, rank 0 to top): Big Ghost > Boss Ghost > Ghost King > **Star**

| Slot | Shown | Type (decomp) | Target | Gate | Mission text (T79, verbatim) |
|---|---|---|---|---|---|
| 0 | always | HITS | 1 | - | Smack a hit! (#630) |
| 1 | always | STAR_CHANCES | 1 | - | Get a Team Star! (#631) |
| 2 | after 1 stars, difficulty row >= 1 | CHARGE_HITS | 1 | difficulty >= 1 | Smack a hit with a / charge swing! (#632) |
| 3 | after 1 stars, difficulty row >= 1 | UNK_35 | 1 | difficulty >= 1 | Make a jumping catch! (#633) |
| 4 | after 1 stars, difficulty row >= 2 | HOME_RUNS | 1 | difficulty >= 2 | Hit a home run! (#634) |
| 5 | after 3 stars, difficulty row >= 2 | WIN_AS_MVP | 0 | difficulty >= 2; Bowser-unlock only | Be the MVP in the last game! (#635) |

### Row 27: Petey Piranha

Growth ladder (T79 #763-766, rank 0 to top): Croaker > Howler > Opera Singer > **Star**

| Slot | Shown | Type (decomp) | Target | Gate | Mission text (T79, verbatim) |
|---|---|---|---|---|---|
| 0 | always | HIT_AT_LEAST_BASES | 2 | - | Crack a long hit! (#636) |
| 1 | always | MINIGAME_RANK | 1 | minigame Piranha Panic only | Place first in Piranha Panic! (#637) |
| 2 | after 1 stars, difficulty row >= 1 | HOME_RUNS | 1 | difficulty >= 1 | Hit a home run! (#638) |
| 3 | after 1 stars, difficulty row >= 1 | SHUTOUT_AGAINST_CAPTAIN | 0 | requires win; difficulty >= 1 | Shut out Mario's team and win! (#639) |
| 4 | after 1 stars, difficulty row >= 2 | BODY_CHECKS | 1 | difficulty >= 2 | Crush someone with a / body check! (#640) |
| 5 | after 3 stars, difficulty row >= 2 | FIELD_BALLS | 5 | difficulty >= 2 | Catch the ball more than / 5 times in a game! (#641) |

### Row 28: Dixie Kong

Growth ladder (T79 #767-770, rank 0 to top): Cutie > Pretty Gal > Charmer > **Star**

| Slot | Shown | Type (decomp) | Target | Gate | Mission text (T79, verbatim) |
|---|---|---|---|---|---|
| 0 | always | HITS | 1 | - | Smack a hit! (#642) |
| 1 | always | STRIKEOUTS | 1 | - | Strike 'em out! (#643) |
| 2 | after 1 stars, difficulty row >= 1 | BIG_PLAYS | 1 | difficulty >= 1 | Make a big play! (#644) |
| 3 | after 1 stars, difficulty row >= 1 | HIT_AT_LEAST_BASES | 2 | difficulty >= 1 | Crack a long hit! (#645) |
| 4 | after 1 stars, difficulty row >= 2 | UNK_73 | 1 | - | Beat Peach's team! (#646) |
| 5 | after 3 stars, difficulty row >= 2 | UNK_38 | 0 | difficulty >= 2 | Climb up the wall and / make a catch! (#647) |

### Row 29: Goomba

Growth ladder (T79 #771-773, rank 0 to top): Newcomer > Veteran > **Star**

| Slot | Shown | Type (decomp) | Target | Gate | Mission text (T79, verbatim) |
|---|---|---|---|---|---|
| 0 | always | HITS | 1 | - | Smack a hit! (#648) |
| 1 | always | BUNTS | 1 | - | Drop a sacrifice bunt! (#649) |
| 2 | after 1 stars, difficulty row >= 1 | MINIGAME_BEAT_CHARACTER | 13 | difficulty >= 1 | Beat Toad in Wall Ball! (#650) |
| 3 | after 2 stars, difficulty row >= 2 | STOLEN_BASES | 2 | difficulty >= 2 | Steal a base more than twice / in a game! (#651) |

### Row 30: Paragoomba

Growth ladder (T79 #774-776, rank 0 to top): Hippety-hop > Flap Flap > **Star**

| Slot | Shown | Type (decomp) | Target | Gate | Mission text (T79, verbatim) |
|---|---|---|---|---|---|
| 0 | always | BUNT_FORCES_IN_RUN | 1 | - | Drop a squeeze bunt! (#652) |
| 1 | always | RUNS_SCORED | 1 | - | Crack a long hit! (#653) |
| 2 | after 1 stars, difficulty row >= 1 | UNK_35 | 1 | difficulty >= 1 | Make a jumping catch! (#654) |
| 3 | after 2 stars, difficulty row >= 2 | RBIS | 3 | difficulty >= 2 | Drive in more than 3 runs in / a game! (#655) |

### Row 31: Dry Bones (gray), Dry Bones (green), Dry Bones (red), Dry Bones (blue)

Growth ladder (T79 #777-779, rank 0 to top): Bony One > Big Bone > **Star**

| Slot | Shown | Type (decomp) | Target | Gate | Mission text (T79, verbatim) |
|---|---|---|---|---|---|
| 0 | always | RBIS | 1 | - | Drive in a run! (#656) |
| 1 | always | BIG_PLAYS | 1 | - | Make a big play! (#657) |
| 2 | after 1 stars, difficulty row >= 1 | WIN_AS_MVP | 0 | difficulty >= 1 | Win MVP!! (#658) |
| 3 | after 2 stars, difficulty row >= 2 | STRIKEOUTS | 3 | difficulty >= 2 | Get 3 strikeouts in a game! (#659) |

## 4. Scout missions, flags and recruitment [decomp + ISO]

### 4.1 Scout mission types (12 + none) [decomp names; in-game banner text not found]

`scoutMissionTable[13]`, enum `SCOUT_MISSION` (`include/game/challenge/scout_state.h`). Chance columns are the percent chance to start the mission, by difficulty (Flower, Star, Special, Miracle). `starMission` = 1 means that completing the scout mission also counts as a star mission.

| Id | Enum name (decomp) | Start chance A (diff 0-3) | Chance B (diff 0-3) | Flags awarded (by outcome) | Counts as star |
|---|---|---|---|---|---|
| 1 | RETIRE_FLAGGED_BATTER | 40 / 30 / 30 / 30 | 20 / 20 / 20 / 20 | 1, 1, 0, 0 | yes |
| 2 | REACH_BASE_VS_FLAGGED_PITCHER | 20 / 20 / 10 / 10 | 20 / 20 / 20 / 20 | 1, 1, 1, 0 | yes |
| 3 | SCORE_IN_CAPTAIN_DUEL | 25 / 30 / 40 / 50 | 10 / 10 / 10 / 10 | 3, 0, 0, 0 | yes |
| 4 | TAKE_THE_LEAD | 0 / 10 / 20 / 30 | 0 / 5 / 10 / 15 | 4, 0, 0, 0 | yes |
| 5 | HOLD_SCORELESS_INNING | 5 / 10 / 20 / 30 | 5 / 5 / 10 / 15 | 3, 0, 0, 0 | yes |
| 6 | TURN_DOUBLE_PLAY | 0 / 10 / 20 / 30 | 0 / 5 / 10 / 10 | 3, 0, 0, 0 | yes |
| 7 | STRIKE_OUT_CAPTAIN | 30 / 30 / 30 / 30 | 10 / 10 / 10 / 10 | 2, 0, 0, 0 | yes |
| 8 | RETIRE_SIDE_IN_ORDER | 20 / 20 / 20 / 20 | 10 / 10 / 10 / 10 | 3, 0, 0, 0 | no |
| 9 | SAC_FLY | 0 / 10 / 20 / 30 | 0 / 0 / 0 / 0 | 2, 0, 0, 0 | no |
| 10 | SQUEEZE_BUNT | 0 / 10 / 20 / 30 | 0 / 0 / 0 / 0 | 2, 0, 0, 0 | no |
| 11 | STEAL_SECOND_BASE | 5 / 10 / 20 / 30 | 0 / 0 / 0 / 0 | 2, 0, 0, 0 | no |
| 12 | WIN_BOWSER_JR_GAME | 100 / 100 / 100 / 100 | 0 / 0 / 0 / 0 | 3, 0, 0, 0 | no |

- Scout banner copy: T82 #34 gives "SMACK A HIT!" as the example banner. Banners for the other 11 types are not in the decoded tables. [gap]. They may be image banners (the loading-tip banners in dossier-systems.md were images), not checked.
- The decomp's `scoutMissionTable` has 13 rows (row 0 unused).

### 4.2 Flags required to recruit [decomp]

`scoutFlagTables[55]` (one row per character slot): `challengeCaptain`, `variantClassification`, and `flagsRequired[difficulty][captain]`. Columns are the player's captain in CHALLENGE_CAPTAIN order: Mario, Peach, Wario, DK, Yoshi, Bowser. Example, table 0 (the Mario primary captain row):

| Difficulty | Mario | Peach | Wario | DK | Yoshi | Bowser |
|---|---|---|---|---|---|---|
| 0 Flower | 0 | 3 | 3 | 3 | 3 | 0 |
| 1 Star | 0 | 3 | 4 | 4 | 3 | 0 |
| 2 Special | 0 | 4 | 4 | 4 | 4 | 0 |
| 3 Miracle | 0 | 5 | 5 | 5 | 5 | 0 |

Read as: a character recruits when the player has scored that many scout flags and the player's chosen captain matches the character's opposing captain team. A value of 0 means "not recruitable this way". [decomp, inference on the reading]

### 4.3 Recruitment rules [decomp]

- `challenge_checkRecruitment`: a character is recruited when `scoutFlagsAchieved` equals `flagsRequired[difficulty][captain]` (and that is not 0), and the character's captain team is the opponent captain. The Bowser Jr. team has its own path: characters marked `ON_BJ_TEAM` join when Bowser Jr. is the opponent.
- `challenge_leftoverTeammatesJoinBowserJr`: when a captain's team is recruited, the leftover members of that captain's team move to the Bowser Jr. team (`ON_BJ_TEAM`).
- `challenge_hasRecruitedEnoughNonBowserCharacters`: 28 non-Bowser recruits are counted for a flag (the exact use is not decoded).

### 4.4 Other challenge numbers [decomp]

- Difficulty names are in T82 (see section 6). The innings table `challengeInnings[4]` = {inning limit, Bowser inning limit, mercy threshold}: Flower 3/5/10, Star 3/5/10, Special 3/5/10, Miracle 5/7/10.
- Intermediate stat buffs for completed missions: `challengeIntermediateStarBuffs[5][11]` (by class and completed count); CPU stage buffs `challengeIntermediateStarBUffs_CPU[4][7]` (by difficulty).
- Superstar: `charIsSuperstar[54]`; T82 #790-800 are the "became a Superstar!" lines (one per character).


## 5. Shop (challenge items): 20 entries, prices and copy

Names: T82 #880-899 (verbatim, one per line). Descriptions: T82 #900-920. The decomp enum `CHALLENGE_SHOP_ITEM` has 20 entries (0-19), so the "19-item shop" figure in the earlier notes does not match the enum. [decomp + ISO]

Prices: `menus.rel` `.data` at `+0x3764`, 8 bytes per item (4 values, one per difficulty). Availability and "replace current" flags: `menus.rel` `.data` at `+0x373C` (20 values). Read by `fn_2_50B0C` / `text_3C03C.c`. [ISO + decomp, label-to-offset mapping is an inference, but the decoded values look right]

Shop menu text (T82, verbatim): "Welcome to the shop!!" / "Buy an item" / "Leave the shop" / "Wanna buy this item?" / "You'll lose what you have now. OK?" / "You can't buy this yet..." / "You don't have enough coins..." / "Sorry! Out of stock..." / "Thank you!!" / "Come again!".

| # | Shop item (T82 #880-899) | Shop-tab class | Price, difficulty 0 / 1 / 2 / 3 (menus.rel) | Description (T82, verbatim) | Notes |
|---|---|---|---|---|---|
| 0 | Nice Bat (#880) | equip, one at a time (replaces current) | 100 / 150 / 180 / 200 | A mysterious power makes it / easier for everyone to get hits. / (Only good next game.) /  (#900) |  |
| 1 | Power Bat (#881) | equip, one at a time (replaces current) | 100 / 150 / 180 / 200 | Gives your team power. / Everyone becomes a homer machine with this! / (Only good next game.) /  (#901) |  |
| 2 | Super Ball (#882) | equip, one at a time (replaces current) | 100 / 150 / 180 / 200 | Makes your pitches faster / and makes them curve more. / (Only good next game.) /  (#902) |  |
| 3 | Lucky Glove (#883) | equip, one at a time (replaces current) | 100 / 150 / 180 / 200 | Lets teammates catch calmly with  / less chance of errors. / (Only good next game.) /  (#903) |  |
| 4 | Dash Spikes (#884) | equip, one at a time (replaces current) | 100 / 150 / 180 / 200 | Makes everyone run faster. / The perfect cure for slowpokes! / (Only good next game.) /  (#904) |  |
| 5 | Buddy Emblem (#885) | equip, one at a time (replaces current) | 100 / 150 / 180 / 200 | Matching patches improve your teamwork. / (Only good next game.) /  (#905) | decomp: +50 chemistry for the human team (calculateChemistry, lbl_3_data_5FC4[10] = 50.0). |
| 6 | Red Fireball (#886) | unlockable, no replace | 200 / 200 / 200 / 200 | Awakens someone to the / power of the flame. /  (#906) | Likely teaches (inference): Mario (Fireball). Star-mission "Get ...!" slot targets this item id (UNK_58 target; verified for 12 rows). |
| 7 | Green Fireball (#887) | unlockable, no replace | 200 / 200 / 200 / 200 | Awakens someone to the / power of green fire. /  (#907) | Likely teaches (inference): Luigi (Green Fireball). Star-mission "Get ...!" slot targets this item id (UNK_58 target; verified for 12 rows). |
| 8 | Lovely Heart (#888) | unlockable, no replace | 200 / 200 / 200 / 200 | Awakens someone to the / power of the heart. /  (#908) | Likely teaches (inference): Peach (Heart Ball). Star-mission "Get ...!" slot targets this item id (UNK_58 target; verified for 12 rows). |
| 9 | Pretty Flower (#889) | unlockable, no replace | 200 / 200 / 200 / 200 | Awakens someone to the / power of the flower. /  (#909) | Likely teaches (inference): Daisy (Flower Ball). Star-mission "Get ...!" slot targets this item id (UNK_58 target; verified for 12 rows). |
| 10 | Gnarly Garlic (#890) | unlockable, no replace | 200 / 200 / 200 / 200 | Awakens someone to the / power of the cunning mind. /  (#910) | Likely teaches (inference): Wario (Phony Ball). Star-mission "Get ...!" slot targets this item id (UNK_58 target; verified for 12 rows). |
| 11 | Whiskered Eggplant (#891) | unlockable, no replace | 200 / 200 / 200 / 200 | Awakens someone to the / power of the dubious mind. /  (#911) | Likely teaches (inference): Waluigi (Liar Ball). Star-mission "Get ...!" slot targets this item id (UNK_58 target; verified for 12 rows). |
| 12 | Egg (#892) | unlockable, no replace | 200 / 200 / 200 / 200 | Awakens someone to the / power of the egg. /  (#912) | Likely teaches (inference): Yoshi (Egg Ball). Star-mission "Get ...!" slot targets this item id (UNK_58 target; verified for 12 rows). |
| 13 | Pink Egg (#893) | unlockable, no replace | 200 / 200 / 200 / 200 | Awakens someone to the / power of the egg. / (For non-egg-layers.) /  (#913) | Likely teaches (inference): Birdo (Weird Ball). Star-mission "Get ...!" slot targets this item id (UNK_58 target; verified for 12 rows). |
| 14 | King Banana (#894) | unlockable, no replace | 200 / 200 / 200 / 200 | Awakens someone to the / power of the banana. /  (#914) | Likely teaches (inference): Donkey Kong (Banana Ball). Star-mission "Get ...!" slot targets this item id (UNK_58 target; verified for 12 rows). |
| 15 | Chimp Banana (#895) | unlockable, no replace | 200 / 200 / 200 / 200 | Awakens someone to the / power of the banana. / (For small bodies.)  /  (#915) | Likely teaches (inference): Diddy Kong (Boomerang Ball). Star-mission "Get ...!" slot targets this item id (UNK_58 target; verified for 12 rows). |
| 16 | Bullet Bill (#896) | unlockable, no replace | 200 / 200 / 200 / 200 | Awakens someone to the / power of the Bullet Bill. /  (#916) | Likely teaches (inference): Bowser (Killer Ball). Star-mission "Get ...!" slot targets this item id (UNK_58 target; verified for 12 rows). |
| 17 | Jr. Mask (#897) | unlockable, no replace | 200 / 200 / 200 / 200 | Awakens someone to the / power of the Bullet Bill. / (For juniors.) /  (#917) | Likely teaches (inference): Bowser Jr. (Killer Jr. Ball). Star-mission "Get ...!" slot targets this item id (UNK_58 target; verified for 12 rows). |
| 18 | Secret Map (#898) | unlockable, no replace | 500 / 500 / 500 / 500 | You might get lucky... /  (#918) | Description text is "You might get lucky..."; the extra T82 #920 string "It is still a secret..." is not mapped (possible locked-state text, inference). |
| 19 | Super Star (#899) | equip, one at a time (replaces current) | 600 / 700 / 800 / 900 | All abilities improve. / You'll truly feel like a superstar!  / (Only good next game.) /  (#919) | Decomp enum name SUPERSTAR; in T82 #899 the name is "Super Star". Description: all abilities improve, next game only. |
Notes on the shop:

- **Two kinds of item.** The 7 items with class "equip, one at a time" (ids 0-5 and 19) are exclusive: buying one replaces what you have ("You'll lose what you have now. OK?"). The decomp uses a single active slot for this (`challengeShopItemActive`, slot byte at `+0x444B`). The 13 others are unlockable ("unlockable, no replace").
- **Captain-ball items.** Items 6-17 each "awaken" one captain's special pitch. T82 #866-877 give the pitch names: Mario Fireball, Luigi Green Fireball, Peach Heart Ball, Daisy Flower Ball, Wario Phony Ball, Waluigi Liar Ball, Yoshi Egg Ball, Birdo Weird Ball, Donkey Kong Banana Ball, Diddy Kong Boomerang Ball, Bowser Killer Ball, Bowser Jr. Killer Jr. Ball. The pairing of item to captain is an inference from the item descriptions and the item ids used by the "Get a ... !" missions (see section 3.3). [inference]
- **Secret Map**: price 500 at every difficulty, no equip class. Description "You might get lucky..."; another unmapped string "It's still a secret..." (T82 #920) probably shows while the item is locked. [inference]
- **Super Star** (id 19): price 600 / 700 / 800 / 900. Only for the next game.
- **Coins.** Earned in games and minigames: "Become a captain and win more than 900 coins!" (T79 #543), "Get more than 200 coins in the Toy Field!" (T79 #549), "Run around the field and collect coins!" (T86 #16-17). The currency is coins; exact per-game earnings not decoded. [gap]
- Buddy Emblem: `calculateChemistry` adds `lbl_3_data_5FC4[10]` (= 50.0) to the human team's chemistry when the emblem is active and the game is not an exhibition, capped at 100. [ISO + decomp]


## 6. Challenge map (entry 1756 terrain, 1742 sprites, 1757-1768 walkers) [ISO, visual]

### 6.1 What is on disc [ISO]

| Entry | Name | Contents | Map role (inference unless noted) |
|---|---|---|---|
| 1742 | challenge_mode_map_and_speech_bubbles (202 textures) | 2D sprites: speech balloons (019-021, 036, 037, 039), coin and digit glyphs, "TEAM STAR" label (015), file/label plates, 20 shop name plates (162-181), 20 shop icons (126-145), captain portraits (022-029), level plates (192-195), cleared banners (196-199), "SOLD" stamp (125), "NO ITEM" (154), "Teammates" (155), "Score Bonus" (188), "Entry Fee" (189), "Call Lakitu" (191) | HUD and dialogue, node labels |
| 1743 | challenge_mode_backgrounds_stadium_bowser_flag (15) | 640x248 and 640x448 backgrounds | Backgrounds |
| 1747-1752 | captain_artwork_* | Mario, Peach, Wario, DK, Yoshi, Bowser (6 captains) | Captain select art |
| 1756 | prop/ch_ground (136 textures) | Terrain textures: grass, sand, water, brick, wood, the DK sign, Mario-M flag, a 512x512 map terrain (019) | The map board |
| 1757-1768, 1779 | ChallengeMapCharacterFiles | Walker props: mario00_2, peach00, wario00, yoshi00_2, donkey00, koopa00, koopa_jr00, monte_b00, kinopio00, kamekku00, heiho, nokonoko00, choropu00 | Pieces that stand on the map (rival or team markers, inference) |

### 6.2 The map board (1756 #019, 512x512) [ISO, visual]

A top-down terrain drawn in flat colours. Sampled values (approximate; from the flat areas):

| Area | Sampled hex | Reading |
|---|---|---|
| Field (dot pattern) | #00e700 | Green ground with a dot pattern |
| River / path | #299eff | Blue, runs top to bottom through the centre. Reads as the route |
| Lava field | #ff9200 | Top right, with ring marks |
| Sand | #ffe742 | Right side, with triangle markers (#d6be4a) |
| Forest | #107942 | Top centre |
| Beach | #fff3ce | Left |
| Rock / boulder | #a5a6ad | Bottom |
| Node (round grass island) | #08ff08 centre, #00ba00 rim | Top centre of the river. A single round node with a brown base |

Reference files: `challenge/01_map_ground_terrain_1756-019_512x512.png`.

### 6.3 Node, path and state visuals [ISO + visual, partly inference]

- **Nodes.** No geometry was decoded. The board is one texture and the nodes are either modelled in `ch_ground` or placed by the game. Visible node-like pieces are the round grass island and the rock pair.
- **Paths.** The blue river texture is the only path-like element. [inference]
- **Rival and team markers.** Walker props from 1757-1768 (see table 6.1). These are the characters that move on the map. [inference]
- **Locked, cleared and unavailable states (sprites in 1742):**
  - "You can't play anymore at this spot..." and "...Too bad!" (T82 #740, #749).
  - "This is your last chance! Are you sure you're ready?" (T82 #741, #750).
  - "You can play this minigame 2 more times." / "3 more times." (T82 #742-743, #751-752). Spots carry a count of plays left. [ISO]
  - Cleared banners: "Mushroom level cleared!", "Flower level cleared!", "Star level cleared!", "Special level cleared!" (1742 #196-199, images). Level plates: "Flower Level", "Star Level", "Special Level", "miracle Level" (1742 #192-195).
  - "SOLD" stamp (1742 #125) on sold shop items; "NO ITEM" (1742 #154) empty slot.
- **Progress indicators.** "TEAM STAR" label (1742 #015), coin glyphs (1742 #002-014), Team Star icon (1742 #152, #183), Mario-M flag (1756 #043). Progress as a count is inference. [inference]
- **Helper.** "Call Lakitu" plate (1742 #191), Lakitu cloud sprite (#185-186). Helper dialogue offers "What are scout missions?" / "What are star missions?" / "Never mind." (T82 #753). [ISO + inference on the role]

### 6.4 Visual language summary

- Speech balloons: white, rounded, a tail on one side (1742 #019-021, #036, #037, #039). Size 20x99 half, 52x99 body, 65x99 with tail.
- Labels: white letters with a blue or dark outline and drop shadow (Coins, Team Star, level plates).
- Badges and icons: gold and white rims, flat colour fill (item icons 126-145 at 100x100, C8).
- Cleared/state banners: white 284x16 strips with blue or grey text.

### 6.5 Reference files (challenge/)

- Map terrain: `challenge/01_map_ground_terrain_1756-019_512x512.png`
- Speech balloons: `challenge/02_balloon_left_half_1742-019_20x99.png`, `03_balloon_half_1742-020_52x99.png`, `04_balloon_tail_1742-021_65x99.png`
- Captains: `challenge/05_captain_portrait_mario_1742-023.png`, `06_captain_portrait_wario_1742-025.png`
- Item icons: `challenge/07_item_icon_lucky_glove_1742-129.png`, `08_item_icon_buddy_emblem_1742-131.png`, `09_item_icon_super_star_1742-145.png`, `14_icon_unknown_question_1742-146.png`
- Plates and banners: `challenge/10_name_plate_super_star_1742-181.png`, `11_label_flower_level_1742-192.png`, `12_banner_mushroom_level_cleared_1742-196.png`, `13_stamp_sold_1742-125.png`, `15_label_coins_1742-002.png`
- Contact sheets: `challenge/_sheet_1742_b.png`, `_sheet_1742_c.png`, `_sheet_1756_a.png`, `_sheet_1756_b.png`

Icon identity for 126-145 is from the name plates and the decomp's shop order. Icons 126 and 128 (bat/shield, "K" shield) were not matched to a shop name. [gap]

## 7. Unlock and recruitment copy (verbatim) [ISO]

Unlock (T79 #141-145, verbatim):

- "Now you can play Flower Level!" (#141)
- "Now you can play Star Level!" (#142)
- "Now you can play Special Level!" (#143)
- "A new minigame, Star Dash, has been unlocked!" (#144)
- "You unlocked Mario Grand Prix! Play all minigames in one shot!" (#145)

Unlock (T82 #769-785, verbatim):

- "You got the Home-Run Badge!" / "You got the Bat Badge!" / "You got the Strikeout Badge!" / "You got the Super-Bat Badge!" / "You got the Zero Badge!" (#769-773)
- "You can now select the Flower Level!" (#774) / "...Star Level!" (#775) / "...Special Level!" (#776) / "...Miracle Level!" (#777)
- "You can now select Bowser as a team captain!" (#778)
- "You can now select Bowser Castle and the Star Dash minigame!" (#779)
- "You can now use Monty Mole!" (#780) / "...Toadette!" (#781) / "...Petey Piranha!" (#782) / "...Dixie Kong!" (#783) / "...Baby Luigi!" (#784) / "...Hammer Bro!" (#785)

Recruitment and mission results (T79, verbatim):

- "In Challenge mode games, you attempt to perform scout missions successfully. If you clear missions for the full number of flags and win the game, players will join you." (#449-452)
- "Players will join you when you get all their flags." (#418)
- "Players who have joined you." (#395) / "Everyone joined due to the mercy rule!" (#396) / "No new players have joined." (#397) / "You didn't win. No one joined your team." (#398)
- "Players who improved in this game." (#399) / "No players improved in this game." (#400)
- "View all goals that you have cleared." (#408, #419)
- "Save cleared data? Star Mission results will be retained if you save." (#220)
- "You're starting Challenge again, carrying over the results of your cleared Star Missions." (#223-224)
- Explainer (T82 #34-39, verbatim): "Scout missions occur during games. You'll see a message like SMACK A HIT! appear midgame." / "If you clear this mission, you will get a Mission Flag." / "By getting Mission Flags, you'll coax rivals to join your team. Do well and you'll form the best team!" / "Star missions involve you clearing certain conditions to make your teammates go up in ranking." / "View Check Stars in the pause menu to check out the progress of your players." / "Your players become star players when you clear all of their missions. Try to make a superstar team!"

Team-level text (T82 #22-33, verbatim): "Beating all the other teams should earn you a date with Bowser's team..." / "Even rival team members might help you out if you can impress them." / "The thing is, of course, you can only play with up to nine players. So, be sure to challenge Bowser with your best team of nine!"

Star-chance and Team Star copy (T79, verbatim): "A Star Chance is a chance to earn a Team Star! Team Stars let you hit and pitch the ball with mysterious powers." (#147). "Buddies exhibit unpredictable powers when they field and bat." (#149, preceded by a buddy symbol).

## 8. Grand Prix [ISO + decomp]

- **Unlock**: "You unlocked Mario Grand Prix! Play all minigames in one shot!" (T79 #145). Minigame ids: `MINI_GAME_ID_MARIO_GRAND_PRIX = 7` (decomp).
- **Start**: "Press <A> to begin Grand Prix." / "Grand Prix rules" / "Play all the minigames as you play for the gold medal!" (T79 #409, #412; T86 #19-21). Rules page (#413): "Press <A> to begin." Records: "Grand Prix Medals Won" (T79 #320).
- **Structure** (decomp `minigameStartGrandPrix`, `minigameGrandPrixNextRound`): six rounds. The round order is a shuffle of the six minigames with ids 1-6: Bob-omb Derby (1), Wall Ball (2), Barrel Batter (3), Chain Chomp Sprint (4), Piranha Panic (5), Star Dash (6). Order is shuffled each run (`shuffleU8Array`).
- **Scoring** (decomp `minigame_framework.c`): each round awards `minigameGrandPrixRankPoints = {10, 6, 3, 0}` for 1st to 4th. Round 6 (the final) doubles the award. Totals are kept per player (`grandPrixTotals`).
- **Win**: the solo player wins the Grand Prix if they finish first in the final (`minigameGrandPrixCheckWin`, sets `grandPrixWonInd`).
- **Medals**: gold, silver and bronze exist as textures (1745 #124 gold, #125 silver, #126 bronze, 43x38, coin with red ribbon tail, per dossier-ui-features.md). The text names only "the gold medal". The award threshold per tier is not decoded. [gap]
- **Difficulty table**: `lbl_3_data_21EBC` = {70, 40, 20, 15} and `lbl_3_data_21EC0` = {30, 50, 70, 85} are AI strength tables (used in Piranha Panic); not medal thresholds. [decomp]


## 9. Corrections to earlier notes

| Earlier note | Finding |
|---|---|
| "19-item challenge shop" | The enum and the price table both have 20 entries (ids 0-19, Super Star at 19). Only the count of 19 is wrong; the list in the earlier notes was right. |
| "~10 star missions per character" | 10 is the slot capacity. Rows use 4, 6, 8 or 10 slots. |
| "~50 mission types" | About 50 distinct type values (`STAR_MISSION_TYPE`). About 25 are unnamed `UNK_nn` in the decomp. |
| "Growth-title ladder ends in Star" | Ends in Star on 30 of 32 ladders. Yoshi (row 6) and Bowser (row 9) do not have a Star, and Bowser's shows Pure Evil at the top (see 2.3). Rows 0-31 are all the ladders. |
| "Growth-title groupings are unlabelled" | Resolved: `starRankTextIDs` gives each row's first T79 id. |
| "Scout flags per difficulty use 0-2 levels" (earlier comment) | Four difficulties: Flower, Star, Special, Miracle (T82 #774-777). |
| "Mission text around T79 strings 456-659" | Confirmed: 456-659 exactly. |
| "Buddy Emblem adds +50 chemistry" | Confirmed (`lbl_3_data_5FC4[10] = 50.0`). |

## 10. Open gaps (not resolved, not guessed)

1. Scout banner copy for 11 of 12 scout types (only "SMACK A HIT!" found).
2. Silver and bronze Grand Prix award thresholds (gold is named in text; textures exist for all three).
3. Exact runtime variant class per character (needed to confirm the Yoshi/Bowser overflow).
4. Icon identity of 1742 #126, #128, #143 (no shop name plate matched).
5. The unmapped T82 #920 string "It's still a secret...".
6. Coin income per game and per minigame.
7. Map node positions and path logic: no node geometry decoded. Only the 512x512 terrain texture was checked.
8. Meaning of the unnamed `UNK_nn` star-mission types (about 25).

## 11. Proposals (ideas, not facts)

Routes are from the site as listed in the brief. Each idea uses data above.

1. **`/characters/[char]`: growth-title card.** Show the current rung (verbatim T79 title) and the next rung, computed from completed star missions. Use the 32-row ladder table in section 2. Show "Star" as the top rung. Hold Yoshi and Bowser back until section 2.3 is checked in-game.
2. **`/characters/[char]`: star-mission checklist.** List only the slots the game shows: always-visible slots first, then gated slots with their unlock condition ("after 4 stars, Special level or higher"). Text is verbatim from T79.
3. **`/modes/[gamemode]/ladder` for Challenge.** Add a difficulty strip (Flower, Star, Special, Miracle) with the innings rule and scout-flag counts from section 4.
4. **`/tools`: challenge shop reference.** A table of the 20 items with names, descriptions, and price by difficulty, plus the captain each item teaches (marked as inference). Add a Buddy Emblem toggle that adds +50 to chemistry in a team calculator.
5. **`/characters/analytics`: Buddy Emblem overlay.** Show chemistry with and without the +50 emblem bonus (capped at 100).
6. **`/games/[gameID]`: scout report.** Show the scout mission types that were active in the game, with a pass or fail mark (based on the decomp outcome rules), when the events data supports it.
7. **`/communities`: Grand Prix board.** Community Grand Prix events with six rounds, 10/6/3/0 points, double points in the final, and gold, silver and bronze tiers (community-defined, not the game's thresholds).
8. **`/users/[user]`: medal shelf.** Gold, silver and bronze counts from community Grand Prix events, kept separate from the game's own records.

