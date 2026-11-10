# Mario Superstar Baseball (GYQE01) - game-data dossier

Scope: authentic names and numbers from the MSSB-Editor repo (`/Users/matthewgreene/GitHub/MSSB-Editor`), its README, its `zzzzdat` modules, `index/*.json`, and the game's own text tables. Sources are cited inline. Items marked **[INFERENCE]** are my reading, not something the code or README states. Items marked **[MEASURED]** are numbers I computed this session with the repo's own parsers.

Repo note: `python3 -m zzzzdat info 7` prints only the entry kind and refs; the stat table is decoded by `zzzzdat/presets.py`, which I ran directly.

## 1. Stadiums (the seven parks)

Names: `zzzzdat/stadiums.py` `NAMES`. The music table `zzzzdat/music/tracks.py` uses possessive forms ("Bowser's Castle", "Wario's Palace", "Peach's Garden"). The DOL table `StadiumFiles` (0x800EFBE8 in US build) holds 21 descriptors, three per park, in table order. Text strings also say "Donkey Kong Jungle" and "Peach Garden" (text table 87 and 79).

| # | Park | Stadium files (entry, slots) | Park tris [MEASURED] | Sky sample (mean RGB, rough) [MEASURED] | Prop pack (entry) |
|---|---|---|---|---|---|
| 0 | Mario Stadium | 8 (slot 0, day), 9 (slot 1, night), 10 (slot 2, day) | 11,026 / 11,125 | day ~70,134,194; night ~15,22,44 | `sea00` (21) |
| 1 | Bowser Castle | 11, 12 (dark), 13 (slot 2, daylight practice field) | 22,566 / 22,562 / 2,398 | dark ~28,28,32; practice ~70,134,194 | `Parts01` (22) |
| 2 | Wario Palace | 14 (all 3 slots) | 12,425 | ~190,170,125 (tan, desert) | `wanwan_00` (23) |
| 3 | Yoshi Park | 15 (slots 0,2), 16 (slot 1) | 22,876 / 20,775 | ~104,156,224 (blue) | `packun` (24) |
| 4 | Peach's Garden | 17 (slots 0,2), 18 (slot 1) | 13,905 / 13,863 | ~108,133,154 plus a red texture ~165,80,78 | `parts00_00` (25) |
| 5 | DK Jungle | 19 (all 3 slots) | 12,943 | ~197,211,226 (pale) | `taru00` (26) |
| 6 | Toy Field | 20 (all 3 slots) | 32,293 (largest) | ~8,28,37 (very dark; low confidence) | `parts0600_00` (27) |

Sky-sample caveat: `zzzzdat/stadiums.py` `_sky()` returns `None` here because Pillow is not installed. I sampled the sky-section textures with `zzzzdat/png.py` instead. The figures are unweighted RGB means and include transparent pixels, so treat them as rough.

`stadiums.py` `_sky()` labels a file night when its mean luminance is below 60. By my sample that marks Mario 9 (27), Bowser 11 and 12 (32), and Toy Field (24) as night. The README calls only Mario's file 9 night and Bowser's two files dark, so the Toy Field reading is doubtful.

Props, from `stadiums.py` `PROP_LABELS` and the decoded prop models (README "The Stadiums page" gives the placement counts):
- **Mario Stadium:** waves (`001_wave000`), boat (day and night variants), palms `yashinoki` (5 placed copies each for day and night; README says five palms). Sun-glare billboard is mesh `加算光` (additive light) in the sky sections of Peach's Garden.
- **Bowser Castle:** lava (`0000溶岩00`, `p_溶岩01`; 溶岩 = lava), **Thwomps** (`dossun`, 6 placed copies; 'ドッスン' = Thwomp), **Star Panels** (`starpanel00`, 2 copies; `starpanel01`, 6 copies).
- **Wario Palace:** **Chain Chomps** (`wanwan01`), sandstorm (`sunaarashi01`; 砂嵐), bench plants (`010_benchplant00`, 8 copies), **sand stars** (`starsuna01`, 3 copies), dust (`DUST01`).
- **Yoshi Park:** **Piranha Plants** (`packun_normal`, 6 copies; with `kihon`, `taiki`, `startaiki` variants), windmill blades (`st03parts_00`; 風車羽 = windmill blade, fixed in place).
- **Peach's Garden:** blocks (`Box01` x4), water surface (`水面`), shadow.
- **DK Jungle:** barrels (`010_taru00`, `taru_clash01` for crashing barrels), cannon (`010_cannon002`), **alligator** (`body · alligator_walk` / `alligator_open`; in-game text calls them Klaptraps), river meshes (`090al_river00/01`), smoke (`kemuri00`).
- **Toy Field:** 30 models. Seven letter blocks named `H`, `O`, `M`, `E`, `R`, `U`, `N` (`parts0603_00`..`_06`), plus `10` (`parts0603_10`) and the `Group03` blocks. **[INFERENCE]** The letter blocks spell HOMERUN, read from model names only.

Stadium hazards the game describes (text table 79, strings 151-162): Peach Garden "packed with blocks" that can reveal a Team Star; DK Jungle barrels and river Klaptraps; Wario Palace Chain Chomps, sandstorms, and Team Stars "buried" in sand; Yoshi Park Piranha Plants that spit balls out; Bowser Castle Thwomps that spurn home runs and a Star Panel; a fiery "Bubbles" hazard.

## 2. The 54 character slots

Source: `zzzzdat/chars.py` `SLOT_NAMES` (game-style names), `COMMUNITY_SLOTS` (internal file stems and community names, derived from the roeming FileNames.json community list in `index/known_names.json`), and `SLOT_TABLE`. Captain flag and class come from `zzzzdat/presets.py` on entry 7. The 32 character ids come from `ID_BASE_SLOT`.

Internal or community names for the slots that have them: `toad_r` (13), `boo` (14), `toadette` (15), `shy_guy_r` (16), `birdo` (17), `monty` (18), `bowser_jr` (19), `paratroopa` (20), `pianta_b` / `pianta_r` / `pianta_y` (21-23). Everything else uses the community form `First Found <name>` with a parenthesised suffix: `Koopa(R)`, `Noki(B/R/G)`, `Bro(H)` (Hammer), `Bro(F)` (Fire), `Bro(B)` (Boomerang), `Toad(B/Y/G/P)`, `Magikoopa(B/R/G/Y)`, `Shy Guy(B/Y/G/Bk)`, `Dry Bones(Gy/G/R/B)`, `Petey`, `Dixie`. So the suffix set is R, B, G, Y, P, Bk, Gy, H, F. The lowercase underscore forms and the parenthesised forms are mixed, so do not assume one scheme.

Captains (`captain = 1`, 12 slots): Mario 0, Luigi 1, DK 2, Diddy 3, Peach 4, Daisy 5, Yoshi 6, Bowser 9, Wario 10, Waluigi 11, Birdo 17, Bowser Jr. 19. Captain artwork exists only for Mario, Peach, Wario, DK, Yoshi and Bowser (editor_names.json). Team logos exist for all 12 captains. Non-captains are the other 42 slots.

Captain roster and body model sharing, from `SLOT_TABLE` (model index / texture set):
- Hammer Bro (27) uses texture set 47 with the Fire Bro (52) on the HB model's built-in textures (a quirk noted in `chars.py`).
- Pianta blue, red and yellow (21-23) share one body model, `cid 21`.
- Toad (13, 29-32), Magikoopa (33-36) and Shy Guy (16, 44-47) are colour variants of one body each. Dry Bones (48-51) use body 30 for gray, green and blue, and body 31 for red.

In-game sub-character names (entry 79, strings 83-115) differ from the file stems: "Blue Pianta", "Blue Noki", "Red Koopa Troopa", "Green Koopa Paratroopa", "Black Shy Guy", "Green Dry Bones".

## 3. Character stat fields and ranges

Source: `zzzzdat/presets.py`, decomp struct `CharacterStats`, 0xA0-byte rows, 54 rows in roster order, in `game.rel` entry 7 (18,144 bytes = 0x21C0 stats + 528 x 18-byte line-ups). Ranges measured over the 54 rows [MEASURED]:

| Field (offset) | Range | Notes |
|---|---|---|
| curve_ball_speed (0x00) | 110-130 | pitch speed |
| fast_ball_speed (0x01) | 150-175 | pitch speed |
| cursed_ball (0x02) | 40-90 | |
| curve (0x03) | 30-90 | |
| curve_control (0x04) | 40-90 | |
| fielding_arm (0x26) | 0-1 | |
| batting_stance (0x27) | 0-1 | |
| slap_contact (0x28) | 30-90 | normal swing |
| charge_contact (0x29) | 10-45 | charge swing |
| slap_power (0x2A) | 5-60 | normal swing |
| charge_power (0x2B) | 1-95 | charge swing |
| bunting_contact (0x2C) | 10-80 | |
| trajectory_push_pull (0x2D) | 0-2 | **[INFERENCE]** three positions |
| trajectory_high_low (0x2E) | 0-2 | **[INFERENCE]** three positions |
| speed (0x2F) | 10-90 | |
| throwing_arm (0x30) | 30-100 | |
| character_class (0x31) | 0-3 | 0 balance (17 slots), 1 power (12), 2 speed (10), 3 technique (15) |
| weight (0x32) | 0-4 | |
| captain (0x33) | 0-1 | 12 captains |
| captain_star_hit_pitch (0x34) | 0-12 | captains 1-12, one each (unique per captain); 0 for others. **[INFERENCE]** index into the captain's star ability |
| star_swing (0x35) | 1-3 | **[INFERENCE]** tier |
| star_pitch (0x36) | 1-3 | **[INFERENCE]** tier |
| batting_bar (0x37) | 2-9 | menu stat bar |
| pitching_bar (0x38) | 2-9 | menu stat bar |
| running_bar (0x39) | 1-9 | menu stat bar |
| fielding_bar (0x3A) | 1-8 | menu stat bar |

Fielding ability flags: u32 at 0x20. The 16 names in `presets.py` are the decomp's: wall splat, wall jump, clamber, sliding catch, laser, quick throw, super jump, magical catch, tongue catch, suction, super catch, ball dash, body check, super curve, plus two unassigned bits. Yoshi's flags (0x104) decode to clamber and tongue catch, which matches the character.

Example rows [MEASURED]: Mario has pitch 130/168, charge power 64, class balance, weight 2, captain 1, bars 6/6/5/6. Bowser has pitch 120/175, charge power 95, curve 35, speed 10, weight 4, bars 9/9/1/1, and fielding abilities wall splat, laser and body check (flags 0x1011). Waluigi has slap contact 90 and charge power 1.

## 4. Chemistry

Stored as 54 bytes per row at 0x3B, one byte per other character in roster (slot) order. The matrix is symmetric (0 asymmetric pairs of 2,916) and the diagonal is always 50 [MEASURED]. Values run 5-99.
- Highest values in Mario's row: Luigi 99, Peach 95, Yoshi 90, Daisy 88.
- Lowest values in Mario's row: Wario 10, Bowser 15, Waluigi 20, Bowser Jr. 25.
- Mario's own row is low for the Dry Bones (32), Magikoopa (40) and Shy Guy (48) slots.

The game names it in a loading tip: "What's chemistry?" (editor_names.json, 0x1aafa800). Whether the lineup records use chemistry is **[INFERENCE]**; the code does not say.

## 5. Line-ups

528 records x 18 bytes at 0x21C0 (`presets.py`). Each holds nine character ids (0xFF = empty) then nine 0x0A bytes. Only 43 records contain players; five are fully empty (records 504, 508, 512, 516, 520). The 48 records are grouped four per captain, in the challenge-mode captain order: Mario, Peach, Wario, DK, Yoshi, Bowser, Luigi, Daisy, Waluigi, Diddy, Birdo, Bowser Jr. Within a group, there is a full nine, one or two shorter squads, and a captain alone. Record 524 (Bowser Jr.'s first) lists each Dry Bones colour twice (**data observation**; nothing states why).

## 6. Star mechanics

From text tables (text 79 and 87 are the tutorial and menu strings; numbers in parentheses are string IDs):
- **Team Stars** are the currency. A **Star Chance** is "a chance to earn a Team Star" (entry 79, string 147). Hitting into a Klaptrap, a Star Panel or a yellow Piranha Plant, or sand stars in Wario Palace, award one.
- **Star Pitch / Star Swing cost:** a captain uses 1 Team Star, any other captain 2, and a sub-character ("buddy") 1 (entry 87, strings 43-46 and 66-69). Each captain has its own star type ("many types ... each particular to a captain"). The star-pitch/swing tiers in the stats table ground this.
- **Superstars:** "Star players" become superstars when all their Star Missions are cleared (entry 82, strings 37-39). Superstar appears as a control on the batting-order screen (`<Y>Superstar`, entry 79, string 253).
- **Music:** `star_01_h.adp` is "Star Chance" and `star_03_h.adp` is "Star Chance 2 (unused)" (`zzzzdat/music/tracks.py`).
- Hand-pose event frame marks: 0x80 bat contact (mid-swing), 0x50 pitch release (a third in), 0x40 catch, 0x60 follow-through, 0x20 last frame (`chars.py`).

Other mission and bonus terms in the text: Scout Missions, Star Missions, "Buddy players" (note icon), "Buddy Emblem" item, "Sidekick" title, "Mini-Mario / Super Mario / Fire Mario / Wing Mario / Star / Bit Player / Hero / Big Eater" titles.

## 7. Textures

Texture table: 0x20-byte records (README "Texture table", `gx.py`). Full archive count [MEASURED], 11,601 texture records across 508 entries:

| GX format | Records | Entries | Implication **[INFERENCE]** |
|---|---|---|---|
| CMPR (DXT1-style) | 6,458 (56%) | 428 | 4-colour blocks of 4x4, 1-bit alpha; most of the look is block-quantised |
| C4 (16-colour palette) | 3,760 (32%) | 107 | 16-entry TLUT per texture, palette-limited |
| C8 (256-colour palette) | 1,281 (11%) | 99 | 256-entry TLUT |
| I4 (16 greys) | 65 | 19 | greyscale |
| RGBA8 | 27 | 6 | full colour, the rare hi-fi textures |
| RGB5A3 | 5 | 5 | 15-bit colour plus alpha |
| IA4 / IA8 | 3 / 2 | 3 / 2 | alpha greyscale |

Texture sizes: most records are small. 64x64 appears in 2,555 records, 32x32 in 1,436, 128x128 in 664, 16x16 in 515; the largest is 640x448. 

## 8. Music and audio

Disc music: 17 `snd/my_snd_h/*.adp` streams, 48 kHz stereo DTK, 32-byte frames (README "Audio", `zzzzdat/music/tracks.py`):
`mario_01_h` Mario Stadium, `koopa_h` Bowser's Castle, `wario_h` Wario's Palace, `yoshi_h` Yoshi Park, `peach_h` Peach's Garden, `donkey_h` DK Jungle, `toy_h` Toy Field, `replay_h` Replay, `result_h` Results, `cha_victry_h` Victory, `home_in_h` Home Run, `cha_s_roll_h` Staff Roll / Credits, `cha_end_jin_h` Ending Jingle, `cha_demo_h` Demo, `cha_map_h` Challenge Mode Map, `star_01_h` Star Chance, `star_03_h` Star Chance 2 (unused). Ten `custom_NN_h.adp` custom slots exist.

Layout metadata reports 15 music tracks (`index/GYQE01.json` meta `music_tracks`), while `tracks.py` names 17. **Discrepancy, unresolved.**

Sequenced songs: two containers, a 19-song file (index entry 28, 39,072 bytes) and a 1-song file (entry 29, 2,416 bytes). They are MusyX sequences on instrument bank group 31, not recordings (README "Sequenced songs"; `song.py`). MIDI export at 384 ticks per quarter.

Stray audio: a 288 s, 32 kHz mono master of "Letters" by Hikaru Utada, in the AdGCForm file at 0x8F2E808 (index entry 89, 5,272,528 bytes). Nothing in the game references it (README "Audio").

Voice and SFX: 47 MusyX sound-effect groups in the index, plus one instrument bank; the 48 MusyX entries carry 842 audio streams in total (`naud`). Character voice groups are one per character id, 32 in total.

## 9. Counts and bit layouts

- Index: 2,556 entries in `index/GYQE01.json` (`meta.built` 2026-09-05). **Discrepancy:** README says 2,212 entries. Largest categories: animation 1,193, hand model 306, prop model 216, glove model 186, character model 141.
- Character tables: 54 slots x 19 sub-files = 1,026 descriptors (`chars.py`). Master table 516 entries: 33 body models, 21 texture sets, 7 sub-items per slot (378 entries, 432-485 region with 54 rig entries, one per slot), then 30 shared items (486-515) of which 29 are hand-pose event sets. Hand table 320 descriptors (six per slot). Event-track sets 29. Slot table: u16 `model << 8 | textureSet`, 0xFF = none.
- Roster file: 18,144 bytes (0xA0 x 54 stats, then 18 x 528 line-ups). Stat block 0x3B (59) bytes, chemistry 54 bytes, spare 47 bytes (0x71-0x9F).
- Hand-pose vertex sets: 12 poses on batting hands (`L/R_hand07`, 556 triangles), 3 on simple hands (`hand00`). The bat is a 1.8-unit object (`handpose.py`).
- Animation key times are frames at 30 fps (`zzzzdat/anim.py` `FRAME_RATE`).
- Rig: arm bones 16-20 left, 22-26 right; wrist bones 19 and 25 (README "Animation banks and skins").
- Collision surface types (README "Models" / `collision.py`): 1 grass, 2 wall, 3 structure, 4 foul line, 5 unclimbable wall, 6 dirt, 7 pit wall, 8 pit, 9 rough terrain, 10 water, 11 Chain Chomp hazard; bit 0x80 = foul territory.

## 10. Menu and text vocabulary (text tables)

Six tables, 790 menu strings (entry 79), 954 challenge-mode lines (entry 82), 599 menu lines from the RecordsBookFiles table (entry 83), 168 game-UI lines (entry 87), 23 minigame blurbs (entry 86), and 11 debug placeholders (entry 81, "test1" to "test10"). Decoded text is in `/private/tmp/claude-501/-Users-matthewgreene--claude-spares-spare-QU1O0D/db10369f-8cb7-407f-9ac1-0f18774f206d/scratchpad/mine/text_79.txt` (and 82, 83, 86, 87).

Named minigames and modes: Star Dash, Piranha Panic, Chain Chomp Sprint, Mario Grand Prix, Flower Level, Star Level, Special Level, Challenge, Scout Missions, Star Missions, Toy Field Records, Past Superstars. 
Menu terms: "Select team captains", "Select batting order", "Buddy players", "Superstar", "Random", "Player profile", "Change Color", "Swap positions", "Switch L/R". Controller glyph names: stick, A, B, X, Y, R, L, Z, note.

Text uses a grid font (11 px ASCII cells) and a proportional font (22 px cells); control words set one of nine colours, typewriter speed (10-90 frames per letter) and sound cues (README "Text strings").

## 11. Open questions

- Why the Dry Bones duplicates in record 524, and whether chemistry feeds the lineups.
- Music track count: 15 (layout) vs 17 (tracks.py).
- Trajectory and star-tier field meanings (inference only).
- The HOMERUN reading of Toy Field letters (inference only).
- Pillow is not installed here, so `stadiums.py` sky and night detection did not run for me.
