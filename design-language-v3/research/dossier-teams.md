# Dossier: MSSB team name / team logo system (entry 865)

Scope: read-only investigation of `zzzzdat` entry 865 (`team_name_logos_all_captains`, 144 textures), cross-checked against mssb-dtk source and pyrio/ProjectRio-frontend tables. Confidence levels are stated per section.

## 1. Structure (high confidence)

Entry 865 holds **144 textures = 48 team names x 3 renderings**, not 12 captains x 12 names.

| Texture index range | Size | Count | What it is |
|---|---|---|---|
| 000-047 | 153x54 RGBA | 48 | Stylised wordmark on its own silhouette (the "logo") |
| 048-095 | 90x90 RGBA | 48 | Emblem badge, one per name (same index order: 048+i is the emblem for name i) |
| 096-143 | 250x26 C4 | 48 | Plain-text name strip (single-colour text, white keyline, dark drop shadow) |

Within each block, texture `i` is name `i`. The name index is `captain*4 + slot`.

**Captains (12, in the order the game uses):** Mario, Luigi, Peach, Daisy, Yoshi, Birdo, Wario, Waluigi, DK, Diddy, Bowser, Bowser Jr.
Source: `mssb-dtk/src/Unknown/mb_subfunc.c` lines 84-88 (`captainIDMappings[12]`).

**Four slots per captain, and what picks each slot** (source: `mb_subfunc.c` `teamLogoDetermination`, lines ~720-745; composition table at lines 102-127):
- slot 0 (logo 1): roster matches composition set 0 of this captain (4 specific characters)
- slot 1 (logo 2): roster matches composition set 1
- slot 2 (logo 3): captain's class is the plurality class on the roster (`teamClassTypeLogos` returns 3)
- slot 3: fallback default (`(group+1)*4-1`)

The texture index equals `captain*4 + slot`, and the dtk code writes exactly that value into `Static_Stats_Tables.teamName[team]`, which the menus use as the frame index. So texture index = game team-name ID is the working assumption, and the composition table confirms it for every captain (see section 6).

## 2. Count (high confidence)

- 144 textures = 48 names x 3 sizes.
- **48 unique names.** Every name in the list below is distinct within its captain, and no name appears under two captains.
- **The client's "about 44 unique" is not reproduced.** I could not find any 44-name list in the sources. The 48-name list is the same in the in-game strip, pyrio's `TEAM_NAME` table, and the frontend `logoIdToTeamName`, so the 44 figure is likely a miscount.

Method: read every texture (the 250x26 strip gives plain text for all 48), then counted distinct strings (48) and checked against pyrio and the frontend (48 each, same set, different spelling in a few places). Confirmed the count against dtk's `teamName` index math (4 per captain).

## 3. Canonical team-name list (high confidence for spelling of the strip)

Spelling below is taken from the rendered in-game strip (texture 096+i). The wordmark art sometimes differs (noted in brackets). Index = texture index in the 153x54 block.

**Mario** (captain index 0)
- 000 Mario Sunshines
- 001 Mario All-Stars [wordmark: ALLSTARS, no hyphen]
- 002 Mario Fireballs
- 003 Mario Heroes

**Luigi** (1)
- 004 Luigi Leapers
- 005 Luigi Mansioneers
- 006 Luigi Vacuums
- 007 Luigi Gentlemen

**Peach** (2)
- 008 Peach Monarchs
- 009 Peach Princesses
- 010 Peach Dynasties
- 011 Peach Roses

**Daisy** (3)
- 012 Daisy Queen Bees
- 013 Daisy Petals
- 014 Daisy Cupids
- 015 Daisy Lilies [wordmark: LILIES; pyrio and frontend say "Lillies", which is a typo]

**Yoshi** (4)
- 016 Yoshi Islanders
- 017 Yoshi Flutters
- 018 Yoshi Speed Stars
- 019 Yoshi Eggs

**Birdo** (5)
- 020 Birdo Fans
- 021 Birdo Bows
- 022 Birdo Models
- 023 Birdo Beauties

**Wario** (6)
- 024 Wario Greats
- 025 Wario Beasts
- 026 Wario Steakheads
- 027 Wario Garlics

**Waluigi** (7)
- 028 Waluigi Flankers
- 029 Waluigi Mashers
- 030 Waluigi Smart-Alecks [wordmark: SMARTALECKS; pyrio/frontend: "Smart Alecks"]
- 031 Waluigi Mystiques

**DK** (8)
- 032 DK Kongs
- 033 DK Animals
- 034 DK Wild Ones
- 035 DK Explorers

**Diddy** (9)
- 036 Diddy Tails
- 037 Diddy Red Caps
- 038 Diddy Ninjas
- 039 Diddy Survivors

**Bowser** (10)
- 040 Bowser Monsters
- 041 Bowser Black Stars
- 042 Bowser Blue Shells
- 043 Bowser Flames

**Bowser Jr** (11)
- 044 Jr. Pixies [pyrio/frontend: "Jr Pixies"]
- 045 Jr. Rookies
- 046 Jr. Bombers
- 047 Jr. Fangs

Spelling caveats: "All-Stars", "Smart-Alecks", and "Jr." are as rendered in the strip. The pyrio and frontend tables drop the hyphen and the dot. "Lillies" is a misspelling in those tables.

## 4. Table errors found (high confidence)

Two captain pairs are swapped in pyrio's `rio_value.py` `Tables.TEAM_NAME` and in the frontend's `lib/data/logoToTeam.ts` `logoIdToTeamName`:

| ID | Texture says | Table says | Proof |
|---|---|---|---|
| 4 | Luigi Leapers | Luigi Mansioneers | dtk composition row 2 (Daisy, Diddy, Waluigi, Baby Luigi) = set 0 = slot 0 = index 4; pyrio's own `team_name_algo.py` lists Leapers as that same signature |
| 5 | Luigi Mansioneers | Luigi Leapers | dtk row 3 (Bowser, Toad, Boo, King Boo) = set 1 = index 5 |
| 20 | Birdo Fans | Birdo Bows | dtk row 10 (Yoshi, Shy Guy, Koopa, Goomba) = set 0 = index 20; the frontend also has 0x15 = Fans |
| 21 | Birdo Bows | Birdo Fans | dtk row 11 (Mario, Luigi, Peach, Toad) = set 1 = index 21 |

Impact: the frontend's `logoImage()` shows the wrong emblem and wrong name for IDs 4, 5, 20, and 21. This is inference from dtk code, not a live-roster test.

## 5. Per-captain palette and stroke rings (medium confidence)

Method: each wordmark was flood-layered from its opaque silhouette (8-neighbour BFS, depth 1 = outermost opaque pixel ring). Per captain, the dominant colour at each depth was taken over its 4 names (pixels quantised to 8 levels). Thickness is in px at native 153x54 resolution. Anti-aliasing blends the inner layers, so thickness is approximate to +/-1 px.

Ring structure is consistent across captains: **outer keyline (depth 1, sometimes 2)** then **inner ring (depth 2-3, white or a contrasting colour)** then **fill (depth 3+)**. Some names have a dark or coloured inner band at depth 3-6 (noted below).

For each captain: outline = outer keyline colour; inner = inner ring colour; fill = dominant chromatic fill colours from the per-name interior pass.

- **Mario**: outline #14148C navy (2 px; variants #14048C, #1C148C, #040C94). Inner: #FCFCFC white (~1 px). Fill: #C40404 red, #0C0CBC / #1C04B4 blue letters, #FCF4A4 cream (Fireballs).
- **Luigi**: outline varies by name: #442C0C brown (004), #049C04 green (005), #044444 teal (006), #1C4414 dark green (007). Inner: #FCFCFC white (~1 px) at depth 3. Fill: #DCAC4C tan + #F41404 red (004); #04AC1C green (005); #FCF4DC cream + #04AC24 green (006); #0CBC0C green + #FC0404 red (007).
- **Peach**: outline #8C3414 / #8C4414 / #8C3404 brown-red (010 is #843C14), 2 px. Inner: #FCECF4 pale pink (009, 2 px), otherwise no clear white ring. Fill: #F4E49C cream + #FC844C orange (008); #FCAC2C orange (009); #FC5474 pink (010); #FCD4B4 peach (011).
- **Daisy**: outline #FCFCFC white (012, 013, 015); #4C2404 dark brown (014). Inner: #64C4CC light cyan (013, depth 3); #FC5C04 orange at depth 3-5 elsewhere. Fill: #FC5C04 orange (012, dominant), #FC7C04 orange (013), #FC5404 orange (014), #FC5C04 orange + #FCFC04 yellow (015).
- **Yoshi**: outline #043C04 / #043404 / #045404 dark green, 1-2 px. Inner: #FCFCFC white (~1-2 px) at depth 2-3. Fill: #ACDC04 lime (016), #A4D40C lime (017, 018), #C4E404 lime + #4CB414 green (019), #54A404 green (018).
- **Birdo**: outline #FCFCFC white (020, 023) or #DC348C magenta (021, 022). Inner: #FCFCFC white (~1-2 px). Fill: #E4346C pink (020), #E40C0C red (021), #DC3C8C magenta (022), #E44494 pink (023).
- **Wario**: outline #040404 black (1 px, 78% of depth-1 pixels). Inner: #542494 purple band at depth 3-6 (not a clean ring). Fill: #542494 purple + #FCD404 yellow (024), + #CC1C04 red + #FCFCA4 (025), + #F4DC44 yellow (026), #AC74E4 lilac + #FCFC24 yellow (027).
- **Waluigi**: outline #04047C navy (1-2 px; variants #040474, #040454). Inner: #FCFCFC white (~1-2 px) at depth 2-3. Fill: #5C04DC purple (028, 031); #ECECF4 near-white + #3404DC (029); #5404AC purple (030); #C42C34 red on 031.
- **DK**: outline #040404 black (1 px, 83%). Inner: #FCFCFC white (~1 px) at depth 3; #E49434 orange band at depth 3-4 on some names. Fill: #E4A404 gold + #E47C04 orange + #CC0404 red (032); #B46C2C wood brown + #FCE404 yellow (033); #EC9C34 orange (034); #D40404 red + #9C8C74 khaki (035).
- **Diddy**: outline #FCFCFC white (037-039), #ECECEC light grey (036). Inner: #BC0404 red at depth 2-3, #FCFC04 yellow at depth 4-6. Fill: #BC0404 red + #FCFC04 yellow (036-038); #FCFC04 yellow + #ECF404 (039).
- **Bowser**: outline #040404 black (1 px, 97%). Inner: #041404 / #042C04 near-black at depth 2, then #046404 green at depth 3-6 (2 px). Fill: #FC740C orange + #F4AC04 yellow (040); #64BC04 green (041); #54B404 green (042); #FCE40C yellow (043).
- **Bowser Jr**: outline #FCFCFC white (044), #040404 black (045-047). Inner: #FCFCFC / #CCCCCC white at depth 2; #CCE4EC light blue at depth 3 (046-047). Fill: #DC0404 red + #FCEC04 yellow (044); #FCFC1C yellow + #AC0404 red (045); #AC0404 red + #A4E444 lime (046); #F4F40C yellow + #CC0404 red (047).

Outline thickness: outer keyline 1 px at depth 1 for most names, 2 px where depth 2 is still the outline colour; inner ring 1-2 px at depth 2-3. Per-name values are in `/private/tmp/claude-501/-Users-matthewgreene--claude-spares-spare-QU1O0D/db10369f-8cb7-407f-9ac1-0f18774f206d/scratchpad/rings2.json` and `rings4.json`.

## 6. Verification of structure against dtk composition table (high confidence)

dtk `lbl_80108F38[24][4]` (mb_subfunc.c 102-127) has two rows per captain (`group*2 + set`). Set 0 = slot 0, set 1 = slot 1. Checked row by row against the wordmark texture indices, every captain matched (for example Mario sets = Sunshines and All-Stars; Peach sets = Monarchs and Princesses; Wario sets = Greats and Beasts; Waluigi sets = Flankers and Mashers). Only Luigi (4/5) and Birdo (20/21) disagree with pyrio/frontend, as described in section 4.

## 7. Plate and shape (medium confidence)

- **There is no common plate.** Each wordmark is a free-form silhouette with its own outer keyline. The keyline is the only "plate".
- Some names have a recognisable plate-like form: Mario All-Stars is a pennant on a pole; Luigi Leapers is a torn banner; Birdo Bows is a striped banner; Peach Princesses is a ribbon.
- **Arch (approximate):** silhouette mid-line (top+bottom)/2, quadratic fit, centre vs ends. Values run from -12 px to +17 px, sign varies by name, and decorative elements dominate. This is not a consistent typographic arch and should not be used as a design rule.
- **Skew (approximate, see section 8):** the glyph slant is not a constant. Measured on the 250x26 plain-text strip, best-fit slant is about -13 degrees for most names, with several names at +17 to +20 and a few near -3 to -9. The sign flips across captains, so I cannot say "all italic at N degrees". Visually several names look italic (Waluigi, Wario, Diddy).

## 8. Slant (approximate, reported as found)

Method: strip-only (250x26), shear search from -20 to +20 degrees, maximising variance of the de-slanted column histogram. The wordmark silhouettes saturate the search bound, so only the strip values are used.

Per captain (4 values each, degrees):
- Mario: +12.0, +17.5, -13.0, -14.5
- Luigi: -13.0, -13.0, -13.0, -12.0
- Peach: -13.0, -12.5, -13.0, -14.5
- Daisy: +18.5, +17.0, +19.5, +19.0
- Yoshi: -13.0, -12.0, -13.0, -14.5
- Birdo: -14.5, -13.5, +18.5, -13.0
- Wario: +10.0, +17.0, -14.5, +18.5
- Waluigi: -14.5, -14.5, -13.0, -14.5
- DK: +18.5, +20.0, +18.5, +20.0
- Diddy: -3.0, -13.0, -14.5, -13.0
- Bowser: -9.0, -9.0, -3.0, -12.5
- Jr: -15.0, -15.0, -12.5, -12.0

So the strip has two families: about -13 (most names, the common value) and about +18 to +20 (DK, Daisy, and some Birdo, Wario, Mario). This is a real variance in the art, not noise averaged away, and the sign split follows captain groups rather than being random.

## 9. Website art (high confidence)

`/Users/matthewgreene/GitHub/ProjectRio-frontend/public/images/Teams/` has 48 PNGs, 360x360 RGBA. They are upscaled copies of the **90x90 emblems**, not the wordmarks. Filenames use the frontend spellings: "Birdo Bows.png" (striped flag, matches texture 021), "Birdo Fans.png" (heart with B, matches texture 020), "Waluigi SmartAlecks.png", "Daisy Lillies.png", "Jr Pixies.png", "Mario All Stars.png". Visual check of all 48 thumbnails matches the game emblems by name, except that the frontend's ID to name table (section 4) pairs some names with the wrong image for IDs 4, 5, 20, 21.

The frontend reads these files in `lib/data/logoToTeam.ts` (`logoImage`) and `lib/data/teamNames.ts`. Nothing in `app/`, `lib/`, or `components/` references the wordmarks; they are not used by the site.

## 10. Sample files

Twelve representative wordmarks (slot 0 of each captain, native 153x54) are in:
`/private/tmp/claude-501/-Users-matthewgreene--claude-spares-spare-QU1O0D/db10369f-8cb7-407f-9ac1-0f18774f206d/scratchpad/teams-sample/`

Files: 01_Mario_Sunshines, 02_Luigi_Leapers, 03_Peach_Monarchs, 04_Daisy_Queen_Bees, 05_Yoshi_Islanders, 06_Birdo_Fans, 07_Wario_Greats, 08_Waluigi_Flankers, 09_DK_Kongs, 10_Diddy_Tails, 11_Bowser_Monsters, 12_Jr_Pixies (all `_153x54.png`).

Canonical list as a TSV: `/private/tmp/claude-501/-Users-matthewgreene--claude-spares-spare-QU1O0D/db10369f-8cb7-407f-9ac1-0f18774f206d/scratchpad/canonical_names.txt`

## 11. Open items

- Whether the frontend and pyrio IDs 4/5/20/21 are wrong or just a different index convention can only be settled on a live roster. The dtk composition table says they are wrong.
- Stroke thickness is measured from silhouette depth, not from a true stroke vector. Treat px values as +/-1.
- Slant and arch numbers are approximate; the wordmark silhouettes do not give a stable slant measure.
