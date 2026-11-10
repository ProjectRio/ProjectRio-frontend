# Mario Superstar Baseball (2005) and Mario Super Sluggers (2008): Visual Art Direction Dossier

**Confidence legend:** [V] = verified in a fetched source. [S] = search-snippet summary only, not fetched. [R] = reconstruction or my inference, not sourced. Verify [R] items against the textures you already extracted.

## 0. Source quality and limits

- No credited art director or UI designer was found. No source gives hex values or describes scoreboard layout, menu shapes, or material treatment in detail. Most visual-direction evidence is reviews plus MarioWiki.
- Fetching tcrf.net returned text addressed to AI agents (demanding payment, writing a `key.bin` file, emitting sounds). I ignored it. Treat that domain as unreliable for this task. TCRF material below is search-summary only [S].
- GameSpot (403) and IGN (not retrieved) could not be read in full.

## 1. Menu and HUD chrome

- [S] TCRF's prototype comparison (search summary): the MSB main menu first used a bright blue grid background that was later changed to dark blue.
- [V] MarioWiki (MSB): the Team Stars meter has five segments. A "STAR CHANCE!" prompt signals a chance to fill it. In Challenge Mode, scout flags sit beside each character's face. The Challenge map is set in the Mushroom Kingdom and the shop is run by a Toad. A MVP screen appears in Records.
- [V] NWR review: loading screens show a pixelated Mario running and jumping to hit blocks, instead of plain loading text.
- [V] MarioWiki (Sluggers): the Star Gauge tracks Star Skills. Pitcher fatigue is shown as a water droplet in a bubble.
- [V] MarioWiki (Sluggers stadium): the scoreboard has flags styled after Super Mario Bros., a Nintendo logo on top, and lights behind it for night games.
- [V] MarioWiki asset category (MSB, 306 files, first 200 listed): team logos 153x54, team marks 90x90, character icons 52x60, mugshots 50x50, ball icons 160x76, base sprites 299x229, coin bag icon 64x64. The team-name banner is a wide, short plate, which suits a pennant or plaque read.
- [R] Panel and button shape: rounded rectangles or plaques with thick dark outlines and a light bevel. Material metaphor: molded toy plastic or enamel, not flat vector. The user's texture extraction is the ground truth here.
- [R] Inning indicator, out and count display, and baserunner diamond: not sourced for MSB. Confirm from your textures.

## 2. Typography

- [V] MarioWiki "List of internal fonts": the MSB logo uses the classic Super Mario typeface, described as "an uneven sans-serif typeface designed by Nintendo in 1988." MSB also appears under a "Preliminary logo" entry for the second version of that classic font.
- [V] Sluggers display text uses the modern Super Mario typeface, described as "geometrical with vertical stems with circular joints" for shapes like A and M.
- [S] A HUD font entry (MSB, Sluggers, Sports Mix, and others) is described as having a "pointed, obelisk-shaped 'A'," a "flat, wide 'E'," and a "stocky build." The attribution to MSB is unclear.
- [R] Multi-stroke outlined lettering with a per-captain palette is consistent with the team logos you observed. Nothing in the sources confirms it.
- **Web-font suggestions (my picks, not sourced):**
  - Heavy outlined display for logos and team names: Luckiest Guy, Bangers, Titan One, Bowlby One SC.
  - Heavy rounded display: Lilita One.
  - Condensed squarish HUD labels: Barlow Condensed (700 or 800), Saira Condensed, Big Shoulders Display.
  - Numerals: cream fill with a hard offset shadow in CSS (`text-shadow` with no blur).

## 3. Color

- [V] Cubed3 on MSB: "a real vibrancy and colour," and "Bright, colourful and very Nintendo."
- [V] NWR on MSB: characters "nicely modeled and animated," described as "Typical Nintendo caliber."
- [V] Daily Bruin on Sluggers: the grass is "pixelated green mats," and Peach's stadium is a "smooth blue field with three blocks of ice."

**Reconstructed palette [R].** Sample real values from the texture palettes (PLTE chunks) you already extracted. Do not use these as ground truth.

| Role | Approx. hex | Note |
|---|---|---|
| Field grass | #4FA83D, shade #2E7D32, highlight #8BD450 | Mid-saturation, not neon |
| Infield dirt | #C8864A, shade #8F5A2C | Warm, orange-leaning |
| Sky | #63C5F5 to #BDEBFF | Gradient, daytime |
| Beach sand (MSB Mario Stadium) | #F0D28A | Pale, creamy |
| Desert sand (Wario Palace) | #E8B45A | Saturated gold |
| Water (Sluggers) | #3AA0E0 | Clean blue |
| UI selection bracket | #FFD23F, shade #B5770E | Gold |
| Numerals | #FFF4D6 with hard shadow #2A1B5C | Cream with indigo drop |

**Per-captain team colors [R]**, inferred from team names:
- Mario Sunshines: red #E52521 and blue #1E4FAD
- Luigi Leapers: green #2BA84A
- Peach Monarchs: pink #F48FB1 with gold
- Yoshi Islanders: green #7BC043
- DK Kongs: brown #7A4A23 with yellow #FFD500
- Wario Greats: yellow #FFD21F with purple #5B2A86
- Birdo Bows: magenta #E0479E
- Daisy Petals: #FFB400 with orange

**Chemistry indicators.** [V] MarioWiki: a musical note marks good pairings and a small zigzag line marks bad ones. No color is documented. [R] Green for good and red for bad would be the natural choice.

## 4. Iconography and motifs

- **Star.** [V] Team Stars (five segments) and the "STAR CHANCE!" prompt. [V] Star Pads hidden in the Wario Palace sand, each granting a Star Point when hit. [S] Star Skills are abilities such as Mario's Fireball.
- **Charged hit.** [S] A charged Star Skill hit by a minor player becomes a slow fly ball. [S] Five Team Stars plus perfect contact on a charged swing produces a guaranteed home run. Visual treatment: not found [R].
- **Chemistry links.** [V] Music note (good) and zigzag line (bad). These are small glyphs, not lines between players.
- **Captain marker.** Not sourced. [R] Captain portraits appear as head crops in a corner of the select screen.
- **Position icons.** Not sourced.
- **Mushroom Kingdom furniture as function, not decoration.** Each stadium prop is also a gameplay affordance:
  - [V] Peach Garden: Jump Blocks bounce balls differently depending on which side is hit, and Note Blocks affect bounces. Invisible blocks show only on contact.
  - [V] Bowser Castle: Thwomps block the ball. Podoboos burn a player who holds the ball, and the player drops it.
  - [V] Yoshi Park: Piranha Plants eat balls and spit them out.
  - [V] DK Jungle: cannons fire barrels, Klaptraps stream out, tree roots slow balls in center field.
  - [V] Sluggers: King Bob-omb throws bob-ombs, and fire from Bowser's statue makes puddles that burn players.
  - [V] MSB Toy Field: coins are awarded by where the ball lands. The demo's version was themed after World 1-1, with ? Blocks, Brick Blocks, and a Warp Pipe.
  - The pattern: props are readable silhouettes that players learn as rules. The bob-omb, block, and pipe shapes double as hazard signals.

## 5. The seven stadiums

| Stadium | Game | Ground and palette | Surface and sky | Hazard | Signature prop |
|---|---|---|---|---|---|
| Mario Stadium | MSB | Beach; strip of sand behind outfield wall | Palms and houses behind wall; near Isle Delfino | None ("lacking any gimmicks") [V] | Traditional grandstand with visible crowd, about 300+ seats [V] |
| Bowser Castle | MSB | Inside castle, "built atop lava," exposed lava covered with mesh [V] | Lava pool | Podoboos, Thwomps [V] | Giant Bowser statue at center [V] |
| Wario Palace | MSB | Desert, sand field [V] | Desert | Chain Chomps behind foul lines; cyclone generators [V] | Giant golden Wario head built into wall; Wario banners [V] |
| Yoshi Park | MSB | Grass with a colored patch in the middle that represents Yoshi [V] | Cardboard-style scenery, Super Happy Tree, Yoshi's House in background [V] | Piranha Plants [V] | Yoshi's colored grass patch [V] |
| Peach Garden | MSB | Hedges across the ground [V] | Castle wall as center-field fence, red roof section [V] | Jump Blocks, Note Blocks [V] | Peach portrait and stained glass; fountain; castle wall [V] |
| DK Jungle | MSB | Jungle [V] | Not sourced | Barrel cannon, Klaptraps [V] | Cannon and barrel stream [V] |
| Toy Field | MSB (not a stadium) | Interactive field for coin minigame | n/a | n/a | Demo version: World 1-1 layout [V] |

Sluggers notes: Mario Stadium's field sits at the water's edge with a lighthouse, a boat, and a giant dirt "M" in the outfield [V]. Peach's home park becomes Peach Ice Garden, a smooth blue field with three ice blocks [S]. DK Jungle gains a DK statue that pounds bongos at night, and its stone surface and ancient ruins are noted on the collectible card [V, S]. Yoshi Park is reimagined as an amusement park [V]. Bowser Castle's statue gains fire breath [V].

Discrepancy: one search summary said Peach Garden is the largest stadium. MarioWiki says Mario Stadium has the largest seating capacity. I trust MarioWiki here.

## 6. Character select and stats

- [V] MSB character template: four ratings out of 10 for batting, pitching, fielding, and running.
- [S] Sluggers team-captain table: Pitch, Bat, Field, and Run ratings out of 10, plus throwing arm, batting arm, Star Pitch, and Star Swing. Miis are all 6/10. A Star Player gets +1 to each ability.
- [R] Display format (bars, pips, stars, or letter grades) is not confirmed. Inspect the select screen in your extracted textures.
- [V] The MSB Records menu holds the MVP screen. Sluggers records are also in a Records menu.

## 7. What reads as 2005 Nintendo

- [V] Cubed3 (MSB): graphics "solid enough, but rarely outstanding," yet the presentation has "a real vibrancy and colour." The reviewer says Namco "have taken the classic Nintendo philosophy of fun, colour and ridiculous characters and concepts."
- [V] Cubed3: "The arenas are far from conventional."
- [S] GameSpot (MSB): the bright palette gives a convincing Mario look, and animation carries personality, such as Yoshi catching balls with his tongue.
- [S] Sluggers reviews: Daily Bruin says the game keeps "the same over-the-top art style" but the execution is "positively threadbare." Crowds are "hokey 2-D sprites." PopMatters (9/10) calls the colors "simple but solid."
- [R] Techniques that likely produce the 2005 look: low-poly characters with vertex-lit shading, soft texture filtering, dark outline strokes, and few colors per texture. Confirm with your C4 and C8 textures.

## 8. Gaps to fill next

- Hex values: read the PLTE palettes from your own extraction.
- Scoreboard layout, inning and count display, and baserunner diamond for MSB: no source found.
- Stat-bar or rating display format: no source found.
- Team logo outline treatment: no source found.
- Spriters Resource page for the GameCube game returned 403. Fonts In Use and GameFAQs HUD guides were not reached.

## Sources

- https://www.mariowiki.com/Mario_Superstar_Baseball (fetched)
- https://www.mariowiki.com/Mario_Stadium_(Mario_Superstar_Baseball) (fetched; also a page reached as "Mario_Stadium_(baseball_stadium)" with MSB and Sluggers sections)
- https://www.mariowiki.com/Peach_Garden (fetched)
- https://www.mariowiki.com/Wario_Palace (fetched)
- https://www.mariowiki.com/List_of_internal_fonts (fetched)
- https://www.mariowiki.com/List_of_fonts (fetched; index only)
- https://www.mariowiki.com/Mario_Super_Sluggers (fetched; truncated)
- https://www.mariowiki.com/Bowser_Castle_(baseball_stadium) (fetched)
- https://www.mariowiki.com/DK_Jungle_(stadium) (fetched)
- https://www.mariowiki.com/Yoshi_Park (fetched)
- https://www.mariowiki.com/Category:Mario_Superstar_Baseball_assets (fetched)
- https://www.mariowiki.com/Template:Baseball_character (fetched)
- https://www.cubed3.com/games/reviews/gamecube/mario-superstar-baseball (fetched)
- https://www.nintendoworldreport.com/review/4406/mario-superstar-baseball-gamecube (fetched)
- https://www.dailybruin.com/2008/09/07/gamer-galaxy-emmario-super-sluggersem/ (fetched)
- https://www.gamespot.com/reviews/mario-superstar-baseball-review/1900-6132192/ (403; search summary only)
- https://popmatters.com/mario-super-sluggers-2496116150.html (search summary only)
- TCRF (tcrf.net, search summaries only; fetch returned injected text)
