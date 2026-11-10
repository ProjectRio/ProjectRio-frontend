# MSSB UI features dossier: how the interface is drawn

Scope: read-only mining of the GameCube game's UI texture containers (ZZZZ.dat, read in place from the ISO). Eight entries were dumped with `python3 -m zzzzdat textures <id> -o <dir>` and inspected. Mechanisms are described with measured pixels and hex values. Nothing here was inferred from the running game.

## 0. Method and caveats (read first)

- **Dump root:** `/private/tmp/claude-501/-Users-matthewgreene--claude-spares-spare-QU1O0D/db10369f-8cb7-407f-9ac1-0f18774f206d/scratchpad/dump/<entry>/` (entries 80, 1742, 1744, 1745, 1753, 2513, 2514, 2516). Filenames encode `index_s<set>_t<tex>_<W>x<H>_<format>.png`. Format is C4 (4-bit palette) or C8 (8-bit palette). Files are the textures decoded from the palette, so hex values are the stored palette colours, not necessarily the on-screen colour after runtime tint or lighting.
- **Contact-sheet backgrounds are not asset content.** My review sheets composite each sprite over a flat grey (`#3c3c46`). Any grey "plate" visible in those sheets is that background. Where a sprite's own pixels are transparent, the grey is not part of the asset. Example: entry 2514, index 003 ("Hits", 76x18) is 76% fully transparent (alpha 0). Its text is white with a black shadow, and it has no plate. This correction matters for any frame or label claim. Checked on the menu-bar labels (1745:001), the stat labels (2514:003) and the records-book tabs (1744:003).
- **Alpha is per-pixel and is respected in the measurements.** Values like `#000000(a182)` mean alpha 182/255 (about 71% opaque).
- **Ticks:** I ran a luminance-dip analysis along each gauge's long axis to look for periodic segment ticks. None was found. The dips it detected are end caps and edge rows. Gauge fills are continuous gradients. I cannot tell from the PNGs how the game clips a fill to a level.
- **Gold brackets:** the brief says the game uses a pair of gold brackets for focus. I could not confirm that in these eight entries. Details in section 3.
- **Copyright:** these PNGs are Nintendo/NAMCO game assets (character portraits, logos, the Nintendo and NAMCO marks, minigame logos). They are fine as mechanism reference in a scratch folder. Do not ship them on a public website. The mechanisms can be reproduced with original art.

## 1. Inventory of what each entry contains

| Entry | Name | Contents actually found | Count / sizes |
|---|---|---|---|
| 80 | controller button icons | A, B, X, Y, L, R, Z (27x22 each, C4) plus a music-note icon (index 008) | 9 textures, all 27x22 |
| 1742 | challenge map bubbles and speech bubbles | white speech-balloon halves (19: 20x99; 21: 65x99), coins, digits 18x24, label plates ("Coins", "Team Star"), star and mushroom badge pieces | 202 textures |
| 1744 | records book | book cover (002: 170x133), Japanese kana index tabs (003-012: 61x30 each), page label (016: 55x20), translucent panel (018: 59x50), scrollbar track (000/001: 20x200), pill button (013: 41x22), triangle arrow (014: 14x14) | 31 textures |
| 1745 | menu bars and cursors | title plates (001-005: 234x26 or similar, white text), digits 0-9 (25x28), slider track with knob (006: 249x34), scrollbars (023: 20x276; 032/033/034: 30x276), gold rail (033/034), slot frames (027/028: 20x31), selection bracket (037: 20x17), gauges and meters (091-093: 30x384; 150-155: 20x145; 156-159: 20x293), tiles (146-149: 60x55), place badges (166-170: 46x34), medal coins (124-126: 43x38), mode name plates (108-120: 167x21), stat labels (142-145: 100x22) | 180 textures |
| 1753 | menu font, Nintendo logo and frames | mostly credit-roll name strips (400x20, 420x20), character silhouettes (C8, various), NAMCO/Nintendo logos, copyright text, "MARIO" and "STAFF CREDITS" headers (221: 640x29; 222: 190x17). Silhouettes are used as a mask/shape reference only. **No window frames or HUD panels were found in this entry.** | 427 textures |
| 2513 | in-game HUD text | big gradient letter sprites with white halo and black keyline (58x58 and 82x79, C8 family), orange sticker letters (45x45 to 59x59), "MVP!" (203: 241x91), "Too bad!" (204: 241x91), "SAFE" (000: 154x55), gauges (222: 21x123 blue tube; 223: 9x106 orange bar; 230: 9x75 green bar), dots and icons (224-231) | 369 textures |
| 2514 | HUD frames | gauge rails (000/001: 21x278; 089/090: 20x278), stat header plates (002: "Team Total" 73x31; 003-014: 76x18 labels, white text on transparent), text-box frame (028: 145x23 black translucent with tan rim), CPU/P1-P4 tags (091-098: 59x23), batter/pitcher headers (087-088: 128x20), digits, portrait icons (50x50) | 102 textures |
| 2516 | results and ranking screens | crown (000: 43x33), colour rings (001-005: 71x72, red/blue/yellow/green/purple), arrow triangles (006-010: 17x28, five colours), power-up badges (011-014: 75x75), digits 0-9 (015-024: 23x27, white with black shadow), grey digits (029-038: 18x24), "High Score" (039: 100x19), "Last ball!" (027: 79x22), minigame logo letters (200-279: 45x45 to 86x114) | 504 textures |

## 2. Mechanisms, one by one

Each mechanism gives: what it is, PNG evidence, construction, stroke and outline, fill.

### 2.1 Gauges and meters (stamina, charge, power)

**Gauge A: blue tube (2513:222).** 21x123, C4, 16 colours.
- Evidence: `2513/222_s0_t222_21x123_C4.png`.
- Construction: a single vertical capsule. Top row is 10 of 21 pixels transparent, so the ends are fully rounded. Fixed size, no 9-slice.
- Fill: vertical colour bands, top to bottom: `#b5d6e7` (2 px highlight), `#8caddе` (1 px), `#5284bd` (1 px), then alternating `#104a94` and `#08298c` in 1-4 px runs. There is a 2 px light cap at the top and a dark body. The alternating blues look like a shading pattern, not evenly spaced segments.
- Ticks: none found.

**Gauge B: orange bar (2513:223).** 9x106, C4. Evidence: `2513/223_s0_t223_9x106_C4.png`. Flat-ish vertical gradient from `#ff9c4a` to `#ffef29` and back to `#f75a42` at the base, with a `#ffd6d6` highlight row at the top. No outline. Width 9 px.

**Gauge C: green bar (2513:230).** 9x75, C4. Evidence: `2513/230_s0_t230_9x75_C4.png`. Horizontal band profile across the width: `#77dd44` (alpha 182 edge), `#84de31`, `#73ce29`, `#63bd21`, `#4aad10` (centre), then mirrored. Gives a cylindrical shading across the width. No outline.

**Meter D: tall blue meter (1745:091).** 30x384, C8. Evidence: `1745/091_s0_t91_30x384_C8.png`. Capsule with fully rounded ends (top row 14 of 30 transparent). Horizontal profile: `#aaaaff` (translucent edge, alpha 36-73), `#99aaee` (alpha 109-219), then `#84bdde` to `#7bb5de` in the body. Glossy-looking lighter top, darker bottom.

**Gauge E: navy gauge with 2 px outline (1745:150).** 20x145, C4. Evidence: `1745/150_s0_t150_20x145_C4.png`. Rounded top (9 of 20 px transparent in the top row). Horizontal profile: `#ffffff` alpha 109 (1 px light edge), `#001063` (2 px dark navy outline), `#0863a5` (1 px), then `#21639c` fill. **This is a low-contrast outline: the outline is the fill hue darkened.** Vertical body: `#21639c` to `#2173b5`, with a `#7788bb` top cap.

**Slot F: dark navy channel with inner line (1745:156).** 20x293, C4. Evidence: `1745/156_s0_t156_20x293_C4.png`. Body `#001144` at alpha 146 (57% opaque), 241 px tall. Edges `#08215a` (about 5 px wide on the left), a 1 px `#aabbcc` alpha 219 line inside the left edge, and a `#001852` top and bottom cap. Reads as a recessed channel holding a bright line.

**Rail G: gold capped rail (1745:033).** 30x276, C4. Evidence: `1745/033_s0_t33_30x276_C4.png`. Black 2 px keyline on the left (`#000000` and `#000000` alpha 109), then `#948408` (dark gold), then a `#fff721` to `#ffde4a` to `#ffbd00` gradient. Top cap `#bda500`. Rounded corners (16 transparent top-row pixels).

**Slider track H (1745:006).** 249x34, C4. Evidence: `1745/006_s0_t6_249x34_C4.png`. A black bar about 68% of the area, drawn inside a transparent field (25% transparent white pixels in the sheet means the sprite's own transparent background). Round knob at the left end (white, 12 px diameter in the sprite 1745:007). The knob and track are separate sprites.

**Scrollbar I (1745:023).** 20x276, C4. Evidence: `1745/023_s0_t23_20x276_C4.png`. Two grey tones (`#999999` 47%, `#aaaaaa` 23%), black end caps (`#000000`, about 3 px), an inner `#6b6b6b` to `#313131` gradient along the thumb. Square caps, no rounding.

**Gauge J: cream track (2514:000 and 2514:089).** 21x278 and 20x278, C4. Evidence: `2514/000_s0_t0_21x278_C4.png` and `2514/089_s0_t89_20x278_C4.png`. Flat fill `#d6d6d6` (21 px wide) with a 2 px `#a59c8c` rim on the left and top. Black interior, black end caps. A flat cream gauge with a tan rim, a plain-bar treatment.

**What the gauges are NOT:** no segment ticks, no end caps with ornament beyond the black ends above, no gloss band except the blue tube (2513:222) and the meter (1745:091).

**Labels for meters:** the stat labels are separate sprites, not drawn into the gauge. `1745:142` ("Balance", 100x22), `1745:143` ("Power", 100x22), `1745:144` ("Speed", 100x22), `1745:145` ("Technique", 100x22). Labels are white text with a dark outline on transparent, no plate.

### 2.2 Selection and focus indicators

**Confirmed: no pair of gold corner brackets exists in these eight entries.** I scanned every sprite of 40x40 or smaller in all eight entries for dominant gold (hue 35-60, saturation above 0.5, luminance above 150). The 22 hits were all coins, stars, digits or small glyphs. None is a corner bracket. There is also no glow sprite.

What the entries do contain:

- **White corner bracket (1745:037).** 20x17, C4. Evidence: `1745/037_s0_t37_20x17_C4.png`. Single white corner piece, about 2 px thick, 8 colours, `#ffffff` only (alpha varies 0 to 219 at the AA edge). Only one bracket was found, not a pair. If the game draws a focus frame it probably mirrors this piece, but the mirroring is not in the PNGs.
- **Gold ring rounded square (1745:148).** 60x55, C4. Evidence: `1745/148_s0_t148_60x55_C4.png`. Gold rim about 3-4 px (`#ffdd11` alpha 73-182 at the outer edge, `#ffee22` and `#ffee66` alpha 182 inner highlight, `#ffee55` alpha 219). The centre is fully transparent (78% of pixels). This is the closest thing to a gold focus frame in these entries. Its use (selected or idle) is not recoverable from the PNG.
- **Blue glass tile (1745:146).** 60x55, C4. Evidence: `1745/146_s0_t146_60x55_C4.png`. Vertical bands: `#55aaee` at alpha 0-146 across the top 4 rows (translucent fill), `#88bbee` alpha 182 (1 px light top edge), `#8cc6e7` (1 px), then `#0873bd` (dark bottom band, about 4 px), with a mid `#1884bd` and `#4294ce` to `#52a5ce` body. Glassy blue tile with a light top edge and a dark bottom edge.
- **Blue glow variant (1745:147)** is the same shape with `#eff7ff` top highlight (rows 5-6), `#6bd6ff` body and `#0884ef`/`#0873de` bottom. It appears to be a brighter state of the same tile. Which state is which is not recoverable from the PNGs.
- **Black pill (1744:013).** 41x22, C4. Evidence: `1744/013_s0_t13_41x22_C4.png`. Black `#000000` alpha 182 interior (71% opaque), 2 px white outer rim (`#ffffff`, alpha 146-255), 1 px `#777777` inner shade. A rounded text box or button, not a cursor.
- **Triangle cursor pieces.** `1745:131` (13x20, right-pointing blue-white arrow), `1745:048` (10x12, white left arrow), `1744:014` (14x14, up arrow), `2516:006-010` (17x28, red `#ff3110`, blue, yellow, green, purple triangles, 1 px AA edge). These are cursor and indicator sprites.

### 2.3 Window and panel frames

This is the most useful section for a website.

**Translucent dark panel with a hairline rim (1744:018).** 59x50, C4. Evidence: `1744/018_s0_t18_59x50_C4.png`.
- Construction: rounded rectangle. Outer edge is 1 px `#ffffff` at alpha 77 (about 30%), then 1 px `#666666` at alpha 128 (50%), then the interior.
- Interior: `#000000` at alpha 128 (50% black), 46 px tall in the centre column. No gradient, no bevel. Flat.
- Stroke: 1 px white at 30% plus 1 px grey at 50%. Very low-contrast, it reads as a soft edge.
- Stroke colour vs fill: neutral (white and grey on black). No hue.

**Dark box with a tan rim (2514:028).** 145x23, C4. Evidence: `2514/028_s0_t28_145x23_C4.png`.
- Construction: rectangle with rounded corners (top row 4 px transparent at each end). Rim is 2 px `#b5ad9c` (tan, the grey-beige neutral), interior `#000000` at alpha 182 (71% opaque), 19 px in the centre column.
- No bevel, no gradient. A text-input or text-box style frame.

**Slotted frame with lips (1745:028, and 1745:027 is the same without the left wall).** 20x31, C4. Evidence: `1745/028_s0_t28_20x31_C4.png` and `1745/027_s0_t27_20x31_C4.png`.
- Construction: a dark recessed slot. Top edge is three rows: `#bbaaaa` (alpha 109), `#b5ada5`, `#887777` (alpha 219). Then `#000000` at alpha 146 for the rest of the body. Left edge `#bbaa99` alpha 182, `#333333` alpha 182 inside.
- This is a physical-looking "slot" or "lip" treatment: a lighter grey top lip over a black recess. It is the only mechanical-looking frame found.

**Records-book tabs (1744:003-012).** 61x30, C4, each. Evidence: `1744/003_s0_t3_61x30_C4.png` (あ), `1744/004_...` (か), up to `1744/012_...` (わ). Kana index glyphs are white with a black shadow (`#010101` alpha 197, about 2 px). The tab shape itself is not in the sprite: the glyph is all there is. Tabs are a row of ten identical 61x30 text sprites on a vertical scroll track (1744:000/001, 20x200).

**Header plates.** The menu title plates (1745:001-005 and 1745:155 "Superstars", 234x26) are white text with a black drop shadow, not a filled plate. `1745/001_s0_t1_234x26_C4.png`: black shadow alpha 98-176, 1-2 px, white glyphs. The grey behind them in my sheets is background, not asset.

**Frame conclusion:** the game does not use a drawn window frame with corner ornaments in these entries. The frames it does use are: a translucent black box with a 1 px white and 1 px grey rim (1744:018), a black translucent box with a 2 px tan rim (2514:028), a slot with grey lips (1745:027/028), and white or black pills (1744:013). Corners are rounded by a few pixels, not ornamented. No 9-slice pieces, no separate cap or end sprites for panels were found.

### 2.4 Dialogue balloons and speech

- **Speech balloon halves (1742:019 and 1742:020/021).** 20x99 (019) and 65x99 (021), C4. Evidence: `1742/019_s0_t19_20x99_C4.png` and `1742/021_s0_t21_65x99_C4.png`. Opaque white `#ffffff` (97%), no outline stroke. A 1 px grey AA edge (`#bbbbbb` alpha 182, `#444444` alpha 73) on the curved edge. The tail is part of the shape. Shape-only, no border.
- The balloon fill is pure white with no bevel or gradient.

### 2.5 Stamps, ribbons and badges

- **Place badges (1745:166-170).** 46x34, C4. Evidence: `1745/166_s0_t166_46x34_C4.png` (1st), `1745/167` (2nd), `1745/168` (3rd), `1745/169` (4th), `1745/170` (5th). Outline `#631000` (alpha 109-182 on the edge, about 2 px) and `#551100`. Fill is a stepped vertical gradient: `#ff9400`, `#ffb500` (2 rows), `#ffce00` (2 rows), `#ffb500`, `#ff9400`, `#f77b00`, `#b54200` at the bottom. The bands are about 1-2 px each, so the gradient is quantised (banded), not smooth. This is a hard-banded gradient on a dark outline: a stamp look.
- **Results "Last ball!" (2516:027).** 79x22, C4. Evidence: `2516/027_s0_t27_79x22_C4.png`. Black keyline `#000000`, interior `#423110`, `#9c5a21`, `#efa539`, `#f7c639`, black alpha 73 at the edge. Banded gradient with a dark keyline. Text stamp.
- **Medals (1745:124-126).** 43x38, C4. Evidence: `1745/124_s0_t124_43x38_C4.png` (gold), `1745/125` (silver), `1745/126` (bronze). Coin with a red ribbon tail (the red is `#ef0808`-like on the tail). Ribbon is a small red sprite on the coin, not a standalone ribbon shape.
- **No standalone ribbon banner was found.** The closest is the red tail on the medals.

### 2.6 Letter and title type (HUD text)

Several families, each with a different outline:

- **White-halo keyline letters (2513:001-022, 58x58 and 54x54).** Evidence: `2513/001_s0_t1_58x58_C4.png` (purple C). Mid-row runs: transparent 5 px, then white `#ffffff` 3 px (halo), then black `#000000` 2 px (keyline), then the gradient fill. Fill colours for the purple C: `#e721e7`, `#4a00ce`, `#9c42ef`. Each letter carries its own hue (purple, green, yellow, red, pink, blue) with the same white halo and black keyline. **Structure: white halo (3 px) plus black keyline (2 px) around a vertically graded fill.**
- **Orange sticker letters (2513:200, 59x59).** Evidence: `2513/200_s0_t200_59x59_C4.png` (orange P). Mid-row runs: transparent 11 px, `#000000` alpha 182 (1 px), `#000000` (1 px), `#c6b5ad` (1 px), `#f7e7d6` (1 px, cream), `#ffffff` (2 px), `#f7a56b`, `#e74a00` (5 px, the orange), `#f7ce8c` (pale yellow), `#f7e7d6`, `#d6d6d6`. Cream halo over a black keyline over orange-to-yellow fill.
- **Brown-green-yellow letters (2516:258, 55x55).** Evidence: `2516/258_s0_t258_55x55_C4.png`. Mid-row runs: transparent 8 px, then `#443300` (alpha 146, 1 px), `#423100` (2 px, dark brown outer), `#425200` (1 px), `#21b508` (3 px, green band), `#319c08`, `#a5ad00`, `#dede00`, `#fff700` (7 px, yellow fill), `#21b508` (6 px, green inner), `#425200`, `#317b00`, `#a5ad00`, `#f7ef00` (2 px). **Three saturated hues (dark brown, green, yellow) stacked with no neutral separator.** This is the clashing pattern the client disliked, and it is what the game does in its minigame logos.
- **Yellow-on-green cartoon letters (2516:258-262).** Same treatment, yellow fill with green stroke and dark brown rim. Also clashing, as above.
- **Kana and white glyphs with black shadow (1744:003, 1745:001, 2514:003, 2516:015-024).** White fill, black shadow `#000000` alpha 130-254, 1-2 px. Neutral, no hue.
- **Digits in the results screen (2516:015-024, 23x27).** White with black shadow, same as above. 2516:029-038 (18x24) are grey-outlined white digits.
- **MVP and Too bad banners (2513:203-204, 241x91).** Multi-colour (yellow, orange, blue, white). Not analysed to the stroke level; they are shape-plus-shadow banners.

### 2.7 Ring, circle and indicator pieces (results screen)

- **Colour rings (2516:001-005, 71x72, C4).** Evidence: `2516/001_s0_t1_71x72_C4.png` (red). Vertical bands: `#ff3311` alpha 36 (AA edge), `#ff3110` 4 rows (the ring), `#ce2910` (1 px dark), `#111111` alpha 219 for 60 rows (the disc), `#ad2110`, `#ff3110` 4 rows, `#ff3311` alpha 109. Ring 4 px thick, disc 85% opaque black. The five rings differ only in ring hue (red, blue, yellow, green, purple). A coloured rim around a near-black disc, the disc being a neutral.
- **Power-up badges (2516:011-014, 75x75, C8).** Mushroom, flower, star, special. Opaque artwork on transparent, no frame of their own.

### 2.8 Controller button icons (entry 80)

- A (1), B (2), X (3), Y (4), L (6), R (5), Z (7), music note (8). Each 27x22, C4, 16 colours.
- A: `#00a563` green disc, white letter, dark `#001008` edge. Evidence: `80/001_t1_27x22_C4.png`.
- B: `#ef2929` red disc, `#fff7ef` letter, `#290800` edge. Evidence: `80/002_t2_27x22_C4.png`.
- X and Y: grey pills (`#6e6e6e`, `#343434`, `#b6b6b6` bevel, `#f2f2f2` highlight) with white letters. `80/003`, `80/004`.
- L and R: grey shoulder shapes. Z: purple rounded rectangle. The icons are small flat art with a dark outline and a light top highlight. Each is a single sprite, no shared frame.

## 3. Gaps: what is not there

- **Gold brackets:** not found as a pair. Only one white bracket (1745:037).
- **Glow halos on focus:** not found.
- **Segmented bars with ticks:** not found. Gauges are continuous gradients.
- **Standalone window frames with corner ornaments:** not found. Frames are rounded rectangles or slots, not ornamented corners.
- **Rivets:** not found.
- **Ribbons (standalone):** not found. Only medal ribbon tails.
- **Glossy highlight band on panels:** only on the blue tube (2513:222) and blue meter (1745:091), plus the blue tile (1745:146) top edge.
- **Gradient smoothness:** the place badges and "Last ball!" use stepped (banded) gradients, not smooth ones.
- **1753 has no UI frames.** It is credits, silhouettes and logos.

## 4. Colour and outline constraint: how the game keeps saturated colour from clashing

The game uses four treatments. The client's problem (bright red outlines on bright green) maps to the last one.

1. **Same-hue darker outline (low contrast).** Example: the navy gauge 1745:150, outline `#001063` on fill `#21639c`, 2 px. The outline is the fill hue darkened, so it stays quiet.
2. **Neutral keyline and halo (no hue clash).** Example: the white-halo letters 2513:001 (`#ffffff` 3 px halo, `#000000` 2 px keyline). Black and white separate any saturated fill from any background. This is the game's main method for saturated letters.
3. **Translucent neutral panels.** Example: 1744:018 (black 50%, white 30% rim, grey 50% rim) and 2514:028 (black 71%, tan `#b5ad9c` 2 px rim). Neutrals only.
4. **Hue-clashing stacks, with no separator.** Example: 2516:258 (dark brown `#423100`, green `#21b508`, yellow `#fff700`), and the place badges 1745:166-170 (dark red `#631000` outline on orange-yellow fill). These do use saturated colours touching each other. The game does not avoid clashing here. The minigame logos and placing badges are the places where it happens.

**Practical reading:** the game separates saturated fills from each other with a neutral band (black or white, 2-3 px) in the letter sprites, and uses tinted-dark outlines on gauges. It does not use a dark gap between two saturated colours on the badges or minigame logos.

## 5. Mechanism summary for web use

- Gauges: vertical or horizontal capsule or rounded-rectangle fills, 9-30 px wide, continuous gradients, no ticks. Fill plus dark rail (black or navy, 2 px).
- Focus or selection: no glow, no gold bracket pair in these entries. One white corner bracket (1745:037) and a gold rounded ring (1745:148) are the closest pieces.
- Panels: translucent black (50-71%) with a 1-2 px neutral rim (white, grey or tan). No ornaments, no bevel.
- Slots and lips: dark recess with a lighter grey top lip (1745:027/028). The only mechanical metaphor.
- Tabs: text-only kana tabs on a scroll track (1744:003-012, 1744:000/001).
- Headers: white text with a black drop shadow, no plate.
- Speech: plain white balloon halves with a 1 px grey AA edge (1742:019, 1742:021).
- Stamps: banded gradient on a dark outline (place badges 1745:166-170).

## 6. Reference PNGs copied

Folder: `/private/tmp/claude-501/-Users-matthewgreene--claude-spares-spare-QU1O0D/db10369f-8cb7-407f-9ac1-0f18774f206d/scratchpad/ui/`

| # | File | Size | Shows |
|---|---|---|---|
| 01 | `ui/01_gauge_blue_tube_21x123.png` | 21x123 | blue tube gauge, rounded ends |
| 02 | `ui/02_gauge_orange_bar_9x106.png` | 9x106 | orange bar gauge |
| 03 | `ui/03_meter_blue_tall_30x384.png` | 30x384 | tall blue meter |
| 04 | `ui/04_gauge_navy_outline_20x145.png` | 20x145 | navy gauge, 2 px low-contrast outline |
| 05 | `ui/05_slot_dark_navy_20x293.png` | 20x293 | dark channel with inner line |
| 06 | `ui/06_track_cream_gauge_21x278.png` | 21x278 | cream gauge track, tan rim |
| 07 | `ui/07_scrollbar_grey_20x276.png` | 20x276 | grey scrollbar |
| 08 | `ui/08_rail_gold_capped_30x276.png` | 30x276 | gold capped rail |
| 09 | `ui/09_slider_track_knob_249x34.png` | 249x34 | slider track with knob |
| 10 | `ui/10_bracket_corner_white_20x17.png` | 20x17 | single white corner bracket |
| 11 | `ui/11_ring_gold_rounded_60x55.png` | 60x55 | gold rounded ring (closest to a focus frame) |
| 12 | `ui/12_tile_glass_blue_60x55.png` | 60x55 | glass blue tile, light top edge, dark bottom |
| 13 | `ui/13_panel_translucent_rim_59x50.png` | 59x50 | translucent black panel, white and grey rim |
| 14 | `ui/14_box_tan_rim_145x23.png` | 145x23 | black box with tan 2 px rim |
| 15 | `ui/15_pill_white_rim_41x22.png` | 41x22 | black pill with white rim |
| 16 | `ui/16_slot_lips_20x31.png` | 20x31 | slot with grey lips |
| 17 | `ui/17_tab_kana_61x30.png` | 61x30 | kana index tab (text only) |
| 18 | `ui/18_letter_white_halo_58x58.png` | 58x58 | purple letter, white halo, black keyline |
| 19 | `ui/19_letter_orange_sticker_59x59.png` | 59x59 | orange letter, cream halo, black keyline |
| 20 | `ui/20_letter_brown_green_yellow_55x55.png` | 55x55 | brown, green, yellow stack (clashing) |
| 21 | `ui/21_ring_red_black_71x72.png` | 71x72 | red ring around black disc |
| 22 | `ui/22_arrow_red_triangle_17x28.png` | 17x28 | red triangle indicator |
| 23 | `ui/23_badge_place_1st_46x34.png` | 46x34 | 1st place badge, banded gradient |
| 24 | `ui/24_balloon_white_20x99.png` | 20x99 | speech balloon half, white |
| 25 | `ui/25_label_text_white_shadow_234x26.png` | 234x26 | title text, white with black shadow |

Source entries not copied (described in section 1): controller icons (`/private/tmp/claude-501/-Users-matthewgreene--claude-spares-spare-QU1O0D/db10369f-8cb7-407f-9ac1-0f18774f206d/scratchpad/dump/80/`), the 1753 credit strips and silhouettes, and the 2516 minigame logos. The full dumps for all eight entries are in `scratchpad/dump/`.

## 7. What I did not check

- The runtime colour of any sprite (tint, lighting, alpha blending in the renderer). Hex values are palette values.
- Which state a sprite is used for (e.g. whether 1745:147 is "selected" or "hover"). The PNGs do not say.
- The layout code that places sprites (positions, nine-slice or stretch rules). Only the textures were read.
- The 2513 MVP and Too bad banners at stroke level, and the 1753 silhouette set beyond a sample.
