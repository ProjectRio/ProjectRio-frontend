# Stadium theme dossier (MSSB, 7 parks)

Scope: read-only investigation of the MSSB ISO texture bank (via MSSB-Editor `zzzzdat`), the shipped RioVisualizer stills and collision JSON, and the website's `components/visualizer/stadiumThemes.ts`. No ISO bytes were copied. Only decoded PNGs of textures live in this scratchpad, plus 2-4 motif copies per park under `scratchpad/parks/<park>/`. Those PNGs are Nintendo game art. They are for reference only and must not ship on the website.

## Method and sanity checks

- Park-to-entry mapping (`python3 -m zzzzdat list --grep=stadium`, then `info <id>`): ids 8,9,10 Mario; 11,12,13 Bowser; 14 Wario; 15,16 Yoshi; 17,18 Peach; 19 DK; 20 Toy. Names agree for 8 ("Mario Stadium"), 9 ("Mario Stadium 2") and 15 ("Yoshi Park"). The `dol StadiumFiles` command in the brief does not exist. The list command above is the working route.
- Textures dumped to `scratchpad/raw/<id>/` (1,387 PNGs). Unique textures per park were found by MD5 of decoded RGBA.
- **Sanity-check finding:** texture banks overlap across parks. Mario 8 shares 142 of 147 unique textures with Bowser 13. Bowser 11 and 12 carry the real castle geometry (22k triangles each: Bowser door, lava, spiked arches). Entry 13 has only 2,282 triangles and 32 textures, and most of its textures are the Mario bank. Treat 13 as a secondary or variant entry and verify the mapping before assuming it is Bowser Castle. Mario's palette therefore comes from the Mario scene picture, not from entry 13.
- **In-game scene pictures** (entry 1746, `stadium_preview_pictures`): 065 Mario Stadium, 066 Peach Garden, 067 Wario Palace, 068 Yoshi Park, 069 DK Jungle, 070 Bowser Castle. No scene exists for Toy Field. These 640x448 pictures are the best source of true sky and ground colour.
- **Caution on contact-sheet reading:** labels were misaligned by one cell in places. Every motif below was confirmed by viewing its exact file.
- Palettes: sky and ground come from k-means over the 640x448 scene picture (k=7 full frame, k=3 sky band, k=4 ground band). Percentages are shares of that area and are approximate. Texture swatches are the mean of opaque pixels for a single texture.

## 1. Peach's Garden (entries 17, 18; scene 066)

**Palette (scene 066, approx % of pixels):**

| Role | Hex | % | Source |
|---|---|---|---|
| Sky / backdrop | #76908e | ~95% of top band | scene top 22% |
| Castle stone, cream/grey | #d7c6a0 | 8.8 | scene full |
| Castle stone, warm | #c3a883 | 6.3 | scene full |
| Garden ground, warm brown | #947742 | 24.5 | scene full |
| Ground, deep | #82551a | 14.9 | scene full |
| Shadowed masonry | #969886 | 5.4 | scene full |
| Light path / highlight | #b4b29c | 4.5 | scene full |
| Dominant mid tone (wall, distance) | #77908d | 35.6 | scene full |

Texture swatches: lawn `e17 t11` mean #659c32; terracotta ground `e17 t12` mean #c27857.

**Motifs (copied to `scratchpad/parks/peach_garden/`):**
- `e17_t29_red_brick.png` (source `raw/17/029_s5_t29_128x128_CMPR.png`): plain red brick. Wall motif.
- `e17_t41_mossy_ashlar.png` (source `raw/17/041_s5_t41_128x128_CMPR.png`): grey ashlar with moss patches. Castle masonry.
- `e17_t85_red_carpet_gold_trim.png` (source `raw/17/085_s5_t85_128x64_CMPR.png`): red carpet with a gold lattice trim. Royal motif.
- `e17_t11_lawn_grass.png` (source `raw/17/011_s5_t11_256x256_CMPR.png`): mown lawn with stripes.
- Also present, not copied: `e17 t34` grey paving-slab grid (`raw/17/034_s5_t34_128x128_CMPR.png`); `e17 t12` terracotta ground; `e17 t57` red stepped stonework (`raw/17/057_s5_t57_64x64_CMPR.png`); `e17 t88` red velvet seat (`raw/17/088_s5_t88_128x128_CMPR.png`).

**Material:** brick and mortar walls, mossed grey ashlar, paved slabs, lawn with mowing stripes, terracotta paths, red carpet with gold trim. The scene is a castle garden: a cream-grey castle sits behind the lawn.

**Broadcaster line:** "A walled royal garden, all lawn and brick, with the castle looking down on the field."

## 2. DK Jungle (entry 19; scene 069)

**Palette (scene 069, approx % of pixels):**

| Role | Hex | % | Source |
|---|---|---|---|
| Sky / backdrop, pale | #e6eaf2 | 64.5% of top band | scene top 22% |
| Sky, grey secondary | #c5c2c0 | 32.6% of top band | scene top 22% |
| Rock / volcano, light | #c2bfbc | 18.9 | scene full |
| Rock, cool highlight | #e4e8ef | 16.6 | scene full |
| Jungle floor, olive-brown | #716440 | 15.4 | scene full |
| Jungle floor, dark brown | #59441f | 23.9 | scene full |
| Shadowed undergrowth | #32240b | 9.2 | scene full |
| Warm wood / bark | #935526 | 8.7 | scene full |
| Ground band, deep | #2b2008 | 18.8% of bottom band | scene bottom 28% |

Texture swatches: dense canopy `e19 t12` mean #1d4217; dirt `e19 t8` mean #3c2b21; plank wood `e19 t51` mean #78593c; stone brick `e19 t39` mean #7c7257; carved stone `e19 t42` mean #5a4c32.

**Motifs (copied to `scratchpad/parks/dk_jungle/`):**
- `e19_t51_jungle_wood_planks.png` (source `raw/19/051_s5_t51_256x256_CMPR.png`): large vertical wood planks. Boardwalk and hut motif.
- `e19_t39_stone_brick_wall.png` (source `raw/19/039_s5_t39_128x128_CMPR.png`): tan ruin brick. Temple wall.
- `e19_t42_carved_stone_ring.png` (source `raw/19/042_s5_t42_128x128_CMPR.png`): golden-brown carved concentric ring. Ruin carving.
- Also present, not copied: `e19 t12` dense canopy foliage (`raw/19/012_s5_t12_256x256_CMPR.png`); `e19 t14` bark-and-moss strip; `e19 t8` dark dirt.
- Trademarks in the bank, not for reuse: DK and DONKEY KONG logo and sign textures exist in `raw/19/` (not copied). They must not appear on the site.

**Material:** weathered timber plank, mossy ruin brick, carved stone, dense canopy foliage. The sky is pale and hazy and the rock is grey, so the scene reads as a volcanic outcrop.

**Broadcaster line:** "A jungle clearing hemmed in by carved stone and dense canopy, with a volcano smoking over the outfield."

## 3. Yoshi Park (entries 15, 16; scene 068)

**Palette (scene 068, approx % of pixels):**

| Role | Hex | % | Source |
|---|---|---|---|
| Sky / backdrop, lilac dusk | #baafd4 | 55.1% of top band | scene top 22% |
| Sky, white cloud | #f3f4f8 | 34.1% of top band | scene top 22% |
| Lawn / turf, olive-green | #999529 | 62.6% of bottom band | scene bottom 28% |
| Lawn, olive highlight | #928a25 | 12.7% of bottom band | scene bottom 28% |
| Infield / tan dirt | #caad55 | 19.9% of bottom band | scene bottom 28% |
| Full frame, olive-green | #98932b | 33.6 | scene full |
| Full frame, light cloud/stone | #eeeef2 | 10.4 | scene full |
| Full frame, cream-tan | #c3ab54 | 10.7 | scene full |
| Full frame, dark earth | #775a1c | 5.9 | scene full |

Texture swatches: blue cloud sky `e15 t1` mean #699de0; mown grass `e15 t3` mean #60a437; tan infield `e15 t2` mean #bca16c; wood door `e15 t22` mean #a98e61; stone with tufts `e15 t4` mean #babab3.

**Motifs (copied to `scratchpad/parks/yoshi_park/`):**
- `e15_t1_blue_cloud_sky.png` (source `raw/15/001_s5_t1_512x256_CMPR.png`): blue sky with cumulus clouds. Sky-dome motif, present in the bank even though the scene picture shows a lilac dusk.
- `e15_t3_mown_grass.png` (source `raw/15/003_s5_t3_256x256_CMPR.png`): bright mown lawn.
- `e15_t22_wood_door.png` (source `raw/15/022_s5_t22_64x256_CMPR.png`): wooden door panel, part of the house and fence set.
- Also present, not copied: `e15 t2` tan infield sand (`raw/15/002_s5_t2_256x256_CMPR.png`); `e15 t4` grey stone with grass tufts (`raw/15/004_s5_t4_128x128_CMPR.png`); `e15 t12` purple cut-out bush shapes (alpha masks, `raw/15/012_s5_t12_128x128_CMPR.png`).
- Trademark, not for reuse: `e15 t9` is a Yoshi head line-art (`raw/15/009_s5_t9_128x128_CMPR.png`). Do not ship it on the site.

**Material:** storybook. Painted grass and sand with soft cloud sky, wood fences and doors, cut-out bushes and a painterly tree. The scene is a picture-book meadow with a lilac dusk sky.

**Broadcaster line:** "A picture-book meadow where the outfield rolls off into painted hills, and every fence post looks hand-carved."

## 4. Wario Palace (entry 14; scene 067)

**Palette (scene 067, approx % of pixels):**

| Role | Hex | % | Source |
|---|---|---|---|
| Sky / backdrop, golden haze | #e2bc7c | 34.5% of top band | scene top 22% |
| Sky, deeper gold | #b29662 | 33.8% of top band | scene top 22% |
| Sky, pale cream | #f8ecb5 | 31.6% of top band | scene top 22% |
| Ground, mid brown | #846847 | 41.1% of bottom band | scene bottom 28% |
| Ground, sand | #a3855c | 29.4% of bottom band | scene bottom 28% |
| Ground, light sand | #bea273 | 23.4% of bottom band | scene bottom 28% |
| Full frame, sandstone | #b89a62 | 22.2 | scene full |
| Full frame, shadow brown | #896b48 | 17.7 | scene full |
| Full frame, highlight sand | #d2ae74 | 15.9 | scene full |
| Full frame, deep brown | #755634 | 10.6 | scene full |
| Full frame, pale gold | #f9f0b5 | 8.9 | scene full |

Texture swatches: dune sand `e14 t10` mean #c4a35e; limestone block `e14 t48` mean #beaf93; sunset sky `e14 t36` mean #beaa7c; W banner `e14 t33` mean #6f5353; green serpent medallion `e14 t16` mean #567735; green W flag `e14 t32` mean #728542.

**Motifs (copied to `scratchpad/parks/wario_palace/`):**
- `e14_t33_w_banner.png` (source `raw/14/033_s5_t33_128x256_CMPR.png`): red, purple and white zigzag banner with a blue W medallion. Signature motif.
- `e14_t16_serpent_medallion_green.png` (source `raw/14/016_s5_t16_256x256_CMPR.png`): green circular inlay with a dark serpent-scroll border.
- `e14_t10_dune_sand.png` (source `raw/14/010_s5_t10_256x256_CMPR.png`): fine sand surface.
- Also present, not copied: `e14 t36` sunset cloud sky (`raw/14/036_s5_t36_512x256_CMPR.png`); `e14 t48` limestone block wall (`raw/14/048_s5_t48_128x128_CMPR.png`); `e14 t32` green W flag (`raw/14/032_s5_t32_128x128_CMPR.png`).
- Trademark, not for reuse: the W emblem and WARIO PARADISE sign textures. The W medallion on the banner is part of the copied motif, so the banner should be redrawn in-house, not shipped as-is.

**Material:** sandstone and limestone blocks, fine dune sand, carved serpent ornament, woven banners, gold trim. The sky is a warm sunset haze.

**Broadcaster line:** "A sun-baked desert arena with a sandstone palace looming over the infield and a sunset sky that never lets up."

## 5. Bowser Castle (entries 11, 12; scene 070; entry 13 caveat in the method notes)

**Palette (scene 070, approx % of pixels):**

| Role | Hex | % | Source |
|---|---|---|---|
| Sky / backdrop, sepia-dark | #3e3019 | 54.3% of top band | scene top 22% |
| Sky, muted brown | #51422a | 30.5% of top band | scene top 22% |
| Sky, dusky olive | #62604e | 15.2% of top band | scene top 22% |
| Floor / stone, warm grey-brown | #6a5b37 | 45.5% of bottom band | scene bottom 28% |
| Floor, mid | #766746 | 33.5% of bottom band | scene bottom 28% |
| Floor, shadow | #574624 | 14.0% of bottom band | scene bottom 28% |
| Lava highlight | #d09437 | 3.6 (full frame) | scene full |
| Full frame, dark earth | #3c2b0c | 13.7 | scene full |
| Full frame, mid tan | #766849 | 15.6 | scene full |
| Full frame, dark olive | #624716 | 13.5 | scene full |
| Full frame, gold-brown | #7a5f26 | 10.7 | scene full |

Texture swatches: lava `e11 t9` mean #e46710; spiked arch `e11 t31` mean #767a75; purple door `e11 t38` mean #88753b; dark stone brick `e11 t14` mean #675c53; blue-grey brick `e11 t13` mean #787a84.

**Motifs (copied to `scratchpad/parks/bowser_castle/`):**
- `e11_t9_lava.png` (source `raw/11/009_s5_t9_128x128_CMPR.png`): molten orange lava surface. Pits and moats.
- `e11_t31_spiked_bowser_arch.png` (source `raw/11/031_s5_t31_128x128_CMPR.png`): grey arch with a lion-faced keystone and a row of spikes beneath. Signature castle motif.
- `e11_t38_bowser_door_purple.png` (source `raw/11/038_s5_t38_64x64_CMPR.png`): purple studded door with a gold Bowser-style face. Gate motif.
- Also present, not copied: `e11 t14` dark stone brick (`raw/11/014_s5_t14_128x128_CMPR.png`); `e11 t13` blue-grey brick (`raw/11/013_s5_t13_128x128_CMPR.png`); `e11 t41` grey ashlar block wall (`raw/11/041_s5_t41_128x128_CMPR.png`); `e11 t53` checker floor (`raw/11/053_s5_t53_128x128_C8.png`).
- The gold face on the door and the lion-faced arch are character art. Redraw them in-house before shipping.

**Material:** cut stone and castle brick, with lava and gold-brown floor. The sky is dark and sepia-toned, with no bright elements.

**Broadcaster line:** "A stone fortress over a lava moat, with spiked arches and a door that looks like it wants to eat the ball."

## 6. Mario Stadium (entries 8, 9, 10; scene 065)

**Caveat:** entry 8 shares 142 of 147 unique textures with entry 13 (see method notes). The swatches and motifs below are from entry 8, and the scene picture is the authority for the look of the park.

**Palette (scene 065, approx % of pixels):**

| Role | Hex | % | Source |
|---|---|---|---|
| Sky / backdrop, grey stadium sky | #929198 | 68.4% of top band | scene top 22% |
| Sky, brown stand shadow | #5e3f25 | 18.0% of top band | scene top 22% |
| Sky, cloud white | #e1ddd7 | 13.6% of top band | scene top 22% |
| Infield / dirt, orange | #c8893b | 46.0% of bottom band | scene bottom 28% |
| Infield, lighter orange | #d49d4c | 32.3% of bottom band | scene bottom 28% |
| Outfield, olive-green | #959e2b | 17.3% of bottom band | scene bottom 28% |
| Chalk / line highlight | #f1e1bd | 4.4% of bottom band | scene bottom 28% |
| Full frame, stands grey | #9c999c | 25.2 | scene full |
| Full frame, infield orange | #c98c3e | 24.8 | scene full |
| Full frame, outfield olive | #8f9628 | 14.2 | scene full |
| Full frame, white stand | #e5e0d7 | 13.6 | scene full |
| Full frame, brown stand | #846250 | 11.4 | scene full |
| Full frame, dark brown | #573721 | 6.5 | scene full |

Texture swatches: mown grass `e8 t13` mean #809d33; infield clay `e8 t11` mean #ce7e38; blue stand trim `e8 t49` mean #3e65c2; blue stand panel `e8 t27` mean #3e5894.

**Motifs (copied to `scratchpad/parks/mario_stadium/`):**
- `e8_t13_mown_grass.png` (source `raw/8/013_s5_t13_128x128_CMPR.png`): mown grass. Turf motif.
- `e8_t11_infield_clay.png` (source `raw/8/011_s5_t11_256x256_CMPR.png`): orange infield clay with fine grain.
- `e8_t49_blue_stand_trim.png` (source `raw/8/049_s5_t49_128x128_CMPR.png`): blue curved stand trim. Stand motif.
- Also present, not copied: `e8 t27` blue stand panel (`raw/8/027_s5_t27_128x64_CMPR.png`); `e8 t2` and `e8 t3` fan crowd sprite sheets (`raw/8/002_s5_t2_256x256_CMPR.png`, `raw/8/003_s5_t3_256x512_CMPR.png`).
- Trademark, not for reuse: the MARIO STADIUM wordmark (`raw/8/073_s5_t73_512x64_C4.png`), a red M roundel (`raw/8/137_s5_t137_64x64_CMPR.png`), and the crowd sprite sheets. These are Nintendo marks and characters. The site may name the park but should not use these files.

**Material:** mown turf with orange clay infield, grey concrete stands, blue steel trim, and a crowd of fans. The sky is a flat grey-blue with white clouds.

**Broadcaster line:** "The classic diamond, neatly mown and clay-raked, with the stands packed and the fans waving their towels."

## 7. Toy Field (entry 20; no in-game scene picture)

**Caveat:** there is no 640x448 scene for this park in entry 1746. The palette below is texture-sampled only. The RioVisualizer still is a 3D render of its own theme, not game art, so it is not used as a colour source here.

**Palette (texture-sampled, mean RGB of each texture):**

| Role | Hex | Source texture |
|---|---|---|
| Night sky, starfield | #081b24 | `e20 t0` 512x256 |
| Floor, blue panel | #2b3a61 | `e20 t4` 64x64 |
| Gold accent, screw-head | #bcac00 | `e20 t13` 32x32 |
| Silver rivet, mean | #303230 | `e20 t12` 64x64 (highlight brighter) |
| Starburst core | #080708 | `e20 t23` 128x128 (white rays on black) |

Structural colour and pads are not textured in the bank. The site already has them as the HIT, COIN and rainbow decals.

**Motifs (copied to `scratchpad/parks/toy_field/`):**
- `e20_t0_starfield_sky.png` (source `raw/20/000_s5_t0_512x256_CMPR.png`): night starfield with a blue nebula. The sky motif.
- `e20_t4_blue_panel_floor.png` (source `raw/20/004_s5_t4_64x64_CMPR.png`): plain blue panel floor. The field motif.
- `e20_t12_silver_screwhead.png` (source `raw/20/012_s5_t12_64x64_CMPR.png`): silver disc with a cross-slot screw head. Toy-hardware motif.
- `e20_t23_starburst.png` (source `raw/20/023_s5_t23_128x128_CMPR.png`): white-to-yellow starburst. Stage-light motif.
- Also present, not copied: `e20 t13` gold screw-head disc (`raw/20/013_s5_t13_32x32_CMPR.png`); `e20 t31` spark ring (`raw/20/031_s10_t3_256x256_CMPR.png`); `e20 t3` gold pillar (`raw/20/003_s5_t3_64x64_CMPR.png`).

**Material:** smooth painted plastic and metal. Blue panels with rivets, a starfield sky and starburst light sources. There are no natural textures in this park.

**Broadcaster line:** "A toy-box ballpark under a starfield, the blue floor lit up like a game board with the bonus pads glowing."

## 8. Existing `components/visualizer/stadiumThemes.ts` (website) and the proposed extension

**Consumers:** `app/games/[gameID]/page.tsx`, `components/swinglab/TrajectoryView.tsx`, `components/characters/TrajectoryLab.tsx`, `components/visualizer/HitVisualizer.tsx`, `components/visualizer/scene.ts`. Keys are stadium ids 0 to 6, matching `lib/data/characters.ts` `stadiums`.

**What it defines per stadium today (`THEMES_3D[id]`):**

| id | Park | label | sky top / bottom | fog (density) | hemi (sky / ground / intensity) | sun (colour / intensity) | palette keys | foulMult | extras |
|---|---|---|---|---|---|---|---|---|---|
| 0 | Mario | Sunny Island Park | #4da3e8 / #cdeefb | #cdeefb (0.0028) | #bdd9ff / #7fae6a / 0.95 | #fff3d6 / 1.25 | 12 colours | 0.82 | ground #4db4d4 (sea) |
| 1 | Bowser | Molten Keep | #171015 / #3a1f16 | #2c1812 (0.004) | #5a3a32 / #1c1016 / 0.7 | #ff9c5a / 0.85 | 12 colours | 0.74 | emissive lava; ground #221419 |
| 2 | Wario | Desert Arena | #d9a45e / #f3ddab | #ecd9a8 (0.0036) | #f0dcb0 / #a08252 / 0.95 | #ffd9a0 / 1.15 | 12 colours | 0.8 | ground #c9a86a |
| 3 | Yoshi | Picture-Book Meadow | #3f8fe0 / #bfe8f8 | #cfeaf4 (0.0022) | #d8ecff / #5fa848 / 1.05 | #fff8e0 / 1.2 | 12 colours | 0.86 | ground #54ad46 |
| 4 | Peach | Royal Garden | #7fa9e0 / #f4cfd9 | #e9d4dc (0.003) | #dcd4ec / #7c9c66 / 1.0 | #ffe2ce / 1.1 | 12 colours | 0.84 | ground #79a468 |
| 5 | DK | Volcano Jungle | #9fb4bc / #dde8e6 | #cfdcd8 (0.0048) | #cfe0da / #42603a / 0.9 | #eef4e2 / 0.9 | 12 colours | 0.78 | ground #3d5c36 |
| 6 | Toy | Midnight Toy Box | #040407 / #0b1026 | #070910 (0.0015) | #3a4a7a / #0a0c18 / 0.85 | #cfe0ff / 1.3 | 12 colours | 0.92 | night: true; 8 decals (HIT, rainbow, COIN) |

The palette is a flat `Record<string,string>` over the 11 collision keys (grass, dirt, wall, oob, foulLine, back, pitWall, pit, rough, water, chomp), plus `emissive` overrides. Every park is a colour set. None has a texture, pattern or motif field, and none has a broadcaster line.

**Drift from `RioVisualizer/web/themes.js`:** the header of the website file says it was ported from the RioVisualizer, but the RioVisualizer copy has moved on. Website values that differ from it:
- Mario: fogDensity 0.0028 (site) vs 0.0014 (RV).
- Bowser: hemi sky/ground/intensity #5a3a32 / #1c1016 / 0.7 (site) vs #8c88a8 / #2a1a20 / 1.3 (RV); sun #ff9c5a 0.85 at [40,90,-70] (site) vs #cfc4ff 1.1 at [60,90,-90] (RV).
- Wario: palette differs on dirt (#dcc078 site vs #e6cd8c RV), wall, oob, pit and rough; sun at [70,70,-50] 1.15 (site) vs [-120,45,10] 1.5 (RV); hemi ground 0.95 (site) vs 0.65 (RV). RV also has an infield mound colour (#6f5478) and moundPanels (#7c5a86, radius 13).
- DK: fogDensity 0.0048 (site) vs 0.0011 (RV); grass #3f8a37 (site) vs #4a9c3e (RV); sun at [-30,100,-60] 0.9 (site) vs [-70,90,-40] 1.3 (RV).
- Toy: **pit #d9a93a (site: golden bonus panels) vs #213f96 (RV: dark-blue foul panels a step lower)**. This is the largest semantic disagreement. The two files also disagree on what Toy's floor holes are. The site comment says golden bonus panels, RV says foul panels.
- Toy fogDensity 0.0015 (site) vs 0.00075 (RV).

RV also has keys the site lacks: `horizon` / `horizonY`, `mow` / `mowCell`, `lamps` (point lights with glow sprites), `stars`, `exposure`, `infield`, `moundPanels`, and `night` overrides (Mario has a full night set; the RV stills use the night set when it exists, via `getRenderTheme`).

**Proposed extension (concrete, additive, backward-compatible):**

```ts
export interface StadiumMaterials {
  surface: 'grass' | 'stone' | 'wood' | 'sand' | 'plastic' | 'lava' | 'brick' | 'mixed';
  voice: string;                       // broadcaster one-liner from section 1 to 7
  turf: { base: string; mow?: number; mowCell?: number };
  infield: { base: string; mound?: string };
  walls: { base: string; trim: string; pattern: 'ashlar' | 'brick' | 'planks' | 'sandstone' | 'panel' | 'rock' | 'lattice' };
  sky: { top: string; bottom: string; clouds?: boolean; stars?: boolean; sunsetBands?: boolean };
  motifs: Array<{ kind: MotifKind; where: 'wall' | 'floor' | 'sky' | 'entrance' | 'outfield'; color?: string; density?: number }>;
  palettePct?: Record<string, number>; // scene-sampled shares, for audit
}
export type MotifKind =
  | 'lava-pool' | 'spike-arch' | 'carved-arch' | 'purple-door' | 'banner-zigzag' | 'serpent-medallion'
  | 'sand-dune' | 'sunset-sky' | 'cloud-sky' | 'mown-turf' | 'wood-fence' | 'cut-out-bush'
  | 'brick-quoin' | 'carpet-gold-lattice' | 'lawn-stripe' | 'terracotta-path' | 'wood-planks'
  | 'carved-ring' | 'foliage-canopy' | 'starfield' | 'rivet-panel' | 'starburst' | 'stand-trim' | 'clay-infield';
// StadiumTheme3D gains: materials: StadiumMaterials; plus RV's horizon / mow / lamps / stars / exposure / infield / moundPanels / night
```

Rules for the extension: a motif is a **generated recipe** (procedural pattern or geometry in code), not a copied sprite. The PNGs in `scratchpad/parks/` are Nintendo game art. They are for reference only and must not ship on the site. Trademarked marks (MARIO STADIUM wordmark, M roundel, DK/DONKEY KONG logos, WARIO PARADISE, Yoshi head, Bowser face, W emblem) are excluded entirely. Generic materials (brick, ashlar, planks, sand, grass, starfield) are safe to redraw.

**Per-park motif plan for the extension** (texture references are for the reference renders only):

| Park | Surface | Motifs (recipe kinds) | Palette anchors (scene-sampled) |
|---|---|---|---|
| Mario (0) | grass / clay / concrete | mown-turf, clay-infield, stand-trim | sky #929198, infield #c8893b, outfield #959e2b |
| Bowser (1) | stone / lava | lava-pool, spike-arch, purple-door, stone ashlar | sky #3e3019, floor #6a5b37, lava #d09437 |
| Wario (2) | sandstone / dune sand | banner-zigzag, serpent-medallion (green), sand-dune, sunset-sky | sky #e2bc7c / #b29662 / #f8ecb5, ground #846847 |
| Yoshi (3) | grass / wood / storybook | cloud-sky, mown-turf, wood-fence, cut-out-bush | sky #baafd4 / #f3f4f8, lawn #999529, infield #caad55 |
| Peach (4) | brick / masonry / lawn | brick-quoin, carpet-gold-lattice, lawn-stripe, terracotta-path | sky #76908e, ground #947742 / #8a6d35 |
| DK (5) | wood / ruin / jungle | wood-planks, carved-ring, foliage-canopy, rock | sky #e6eaf2 / #c5c2c0, floor #59441f, rock #c2bfbc |
| Toy (6) | plastic panel | starfield, rivet-panel, starburst, blue floor | sky #081b24, floor #2b3a61, gold #bcac00 |

**Next steps (not done here):** (1) reconcile `pit` for Toy Field (site vs RV) before extending; (2) confirm entry 13 mapping; (3) if a richer look is wanted, add the `materials` field and a motif renderer in `scene.ts`; (4) keep all motif PNGs out of the repo.

## Files produced

- Dossier: `scratchpad/dossier-stadiums.md` (this file).
- Motif copies (reference only): `scratchpad/parks/<park>/` for `peach_garden`, `dk_jungle`, `yoshi_park`, `wario_palace`, `bowser_castle`, `mario_stadium`, `toy_field` (2 to 4 PNGs each). `scratchpad/parks/_discard/` holds one mislabelled copy I moved aside, which should be ignored.
- Scene pictures: `scratchpad/raw/preview_1746/065..070_*.png`. Textures: `scratchpad/raw/<entry>/`. Scripts: `scratchpad/scripts/`.
- RioVisualizer assets: `/Users/matthewgreene/GitHub/RioVisualizer/web/renders/{mario-stadium,bowser-castle,wario-palace,yoshi-park,peach-garden,dk-jungle,toy-field}.webp` (1400x1050 stills, plus `-glow.png`), `web/renders/manifest.json`, collision data `rio_visualizer/data/stadiums/*.json` (83 to 298 collision triangles per park, not the GCN model), theme config `web/themes.js`.
