# Project Rio — design ideas ledger

Running list. Every entry is either **[FACT]** (measured off the disc or read in a repo, with
its source), **[RULE]** (a design law derived from facts), **[IDEA]** (a proposal for a real
site surface), or **[CORRECTION]** (something I previously told you that turned out wrong).

Nothing here is decided. It is a bench of parts.

---

## 0. Corrections to things I already said

**[CORRECTION] There is no pair of gold focus brackets.**
I told you the game's focus indicator was a pair of gold brackets and you liked it. The UI
agent scanned every sprite ≤40×40 across eight entries for dominant gold and found 22 hits —
all coins, stars, digits and glyphs. No bracket pair, and no glow sprite either.

What does exist:
- `1745:037` — a **single white corner bracket**, 20×17, ~2px thick, pure `#ffffff` with an
  alpha-feathered edge.
- `1745:148` — a **gold ring on a rounded square**, 60×55, rim 3–4px
  (`#ffdd11`→`#ffee22`→`#ffee55`), centre fully transparent (78% of pixels).

So the bracket idea survives, but honestly: the game ships *one* corner and we mirror it to
four. That's a legitimate move — it's how sprite UI is built — but it's our construction, not
something I can point at on the disc.

**[CORRECTION] The Rio logo was never missing a pixel version.**
`RioLogo.png` resolves to a clean **16×16 grid**, three colours only: `#000000`, `#ff0000`,
`#ffffff`. Every coordinate in `RioLogo.svg` is a multiple of 160 under a `scale(0.1)`
transform — nothing off-lattice. The two files are already a two-state mark system: PNG full
colour, SVG mono silhouette (red cells render black). I drew `mushroom-pixel.svg` to give the
logo a property it already had. It should come out of `public/images/`.

**[CORRECTION] The palette comment in `globals.css` is asserting a derivation that isn't real.**
It says the palette is "derived from the Project Rio mushroom logo (red / white / black)".
The logo's red is `#ff0000`; the token is `#e60012`. Either re-derive it or drop the claim.

---

## 1. Rules the game actually follows

**[FACT] Outlines are the fill hue darkened, not black.**
Navy gauge `1745:150`: 2px outline `#001063` on fill `#21639c`.

**[FACT] Saturated fills are separated from their background by a *neutral* band.**
The HUD letters (`2513:001`–`022`) are a 3px white halo over a 2px black keyline over a
graded coloured fill. Black and white do the separating; no two hues ever touch.

**[FACT] Where the game *does* clash, it is quarantined.**
Stacked saturated hues with no separator appear in exactly two places: minigame logos
(`2516:258` — brown `#423100`, green `#21b508`, yellow `#fff700`) and place badges
(`1745:166`–`170`, dark red `#631000` on orange-yellow). Nowhere in the chrome.

> **[RULE] Colour clash is a *register*, not an accident.** The loud stacked-hue treatment is
> reserved for award and result moments — one per page, maximum. Everything structural uses
> neutral separation. This is the principled version of your "no rio red on bright green":
> the game agrees with you, and tells us exactly where the exception lives.

**[FACT] Containers are translucent black with a hairline neutral rim. No bevel, no ornament.**
- `1744:018` — black at 50%, rim 1px white @30% + 1px grey @50%.
- `2514:028` — black at 71%, 2px tan rim `#b5ad9c`.
- Corners rounded by a few pixels. No 9-slice pieces, no corner ornaments, no rivets anywhere.

> **[RULE] The container is almost nothing.** This kills the heavy "plaque" I built — hard dark
> outline, top bevel, bottom shadow. The game's own panel is a dark translucent rectangle with
> a 1px rim you can barely see. The content does the work.

**[FACT] Gradients are banded, not smooth.**
Place badges step in 1–2px bands: `#ff9400` → `#ffb500` → `#ffce00` → `#ffb500` → `#ff9400`
→ `#f77b00` → `#b54200`. The "Last ball!" stamp (`2516:027`) does the same.

> **[RULE] Quantise every gradient.** Hard colour stops, 5–7 bands. This is a real signature
> and it is almost free to implement — and no other esports site does it, because it looks
> like a mistake unless it's deliberate and consistent.

**[FACT] Saturated rim, neutral core.**
Results rings `2516:001`–`005`: a 4px coloured ring (red/blue/yellow/green/purple) around a
disc of black at 85%. The five differ *only* in rim hue.

> **[RULE] Colour lives on the edge; the middle stays neutral.** This is the mechanism that
> lets seven stadium themes and dozens of team colours coexist without fighting.

**[FACT] Labels float. They do not get plates.**
Stat labels (`1745:142`–`145`: "Balance", "Power", "Speed", "Technique", each 100×22) are
white text with a dark outline on transparent. The gauge they label is a separate sprite.
Menu headers (`1745:001`–`005`, `1745:155` "Superstars") are white text with a 1–2px black
drop shadow — no plate behind them.

**[FACT] Gauges have no ticks and no segments.** They are capsules 9–30px wide with fully
rounded ends, a light top cap, a darker body, and a continuous fill. Sometimes a dark rail
behind. That is all.

**[FACT] The slot is the only mechanical metaphor in the whole UI.**
`1745:027`/`028` — a dark recess (black @57%) under a three-row lighter lip
(`#bbaaaa` → `#b5ada5` → `#887777`).

> **[RULE] One mechanical object, used for one job.** Reserve the slot-and-lip for bounded
> resources — things with a hard ceiling. Star charges. Roster slots. Nothing else gets to
> look physical.

---

## 2. Ideas, against real routes

**[IDEA] `/modes/[gamemode]/ladder` — the gold rail as the rank rail.**
`1745:033` is a 30×276 capped rail: 2px black keyline, dark gold `#948408`, then a banded
`#fff721` → `#ffde4a` → `#ffbd00` gradient, cap `#bda500`. Run it vertically down the left of
the ladder, filled to your position. Gold is already the game's ranking colour (medals, place
badges) — this makes the ladder feel like the game's own records book rather than a table.

**[IDEA] `/games/[gameID]` — innings as results rings.**
The five rings (`2516:001`–`005`) are a ready-made inning strip: coloured rim per inning
state, neutral black core carrying the run count. Walk-offs and big plays get the banded
stamp treatment from "Last ball!" (`2516:027`) — the game's own way of shouting.

**[IDEA] Loading screens keep the tips, and gain a rotation.**
You liked this most, so it should get the most. The Bowser swing strip is built and running
(16 frames, `b09_ba_008`). The tips corpus is being transcribed verbatim now. Suggest the
loader pairs a swing with a tip, and the swing character rotates with context — the captain
whose page you're loading, the captain who won the game you're opening.

**[IDEA] Focus is a four-corner bracket, built from the game's one corner.**
Mirror `1745:037` into four. White, 2px, feathered edge. It beats a glow because the game
has no glow anywhere, and it beats a border because it doesn't change the element's box.

**[IDEA] `/characters/[char]` — stat bars as the game's own capsules.**
No ticks, no segments, rounded ends, light top cap, banded fill, dark rail behind. Labels
float beside them in white with a dark outline — no pills, no chips, no plates.

**[IDEA] The 16×16 logo grid is the spacing unit.**
The mark is 16 cells. At a 64px display that's a 4px cell; at 128px, 8px. Take 4px as the
base unit and every spacing step is a whole number of logo pixels. The grid isn't decoration —
it's the reason the numbers are what they are.

**[IDEA] Controller glyphs as real affordances.**
Entry `80` has A/B/X/Y/L/R/Z at 27×22 with their actual colours — A `#00a563`, B `#ef2929`,
X/Y grey pills, Z purple. Use them where the site talks about the game's inputs (Swing Lab,
the pitch calculator, tutorials) instead of generic keyboard chips.

**[IDEA] A "loud moment" budget, written into the system.**
Since the game quarantines its clashing register, make that a rule the components enforce:
one element per page may use the stacked-saturated treatment. Results, awards, a walk-off.
Everything else draws from the neutral-separated set. This is the thing that will keep the
site from drifting back toward generic.

---

## 3. The team-name system — and a live bug

**[FACT] Entry `865` is 48 names × 3 renderings, not 144 teams.**
- `000`–`047` — wordmarks, 153×54, free-form silhouettes
- `048`–`095` — emblems, 90×90
- `096`–`143` — plain text strips, 250×26

Index = `captain*4 + slot`. Twelve captains in game order: Mario, Luigi, Peach, Daisy,
Yoshi, Birdo, Wario, Waluigi, DK, Diddy, Bowser, Bowser Jr. **48 unique names, none repeated.**
Your "about 44" is close but the real number is 48.

| Captain | Names |
|---|---|
| Mario | Sunshines · All-Stars · Fireballs · Heroes |
| Luigi | Leapers · Mansioneers · Vacuums · Gentlemen |
| Peach | Monarchs · Princesses · Dynasties · Roses |
| Daisy | Queen Bees · Petals · Cupids · Lilies |
| Yoshi | Islanders · Flutters · Speed Stars · Eggs |
| Birdo | Fans · Bows · Models · Beauties |
| Wario | Greats · Beasts · Steakheads · Garlics |
| Waluigi | Flankers · Mashers · Smart-Alecks · Mystiques |
| DK | Kongs · Animals · Wild Ones · Explorers |
| Diddy | Tails · Red Caps · Ninjas · Survivors |
| Bowser | Monsters · Black Stars · Blue Shells · Flames |
| Bowser Jr. | Pixies · Rookies · Bombers · Fangs |

**[FACT] `lib/data/logoToTeam.ts` has four IDs wrong, and I verified this myself.**
I rendered the game's own text strips. Texture `100` (Luigi slot 0) reads **Luigi Leapers**;
the table says `0x4: 'Luigi Mansioneers'`. Texture `116` (Birdo slot 0) reads **Birdo Fans**;
the table says `0x14: 'Birdo Bows'`. Both pairs are swapped — `0x4`/`0x5` and `0x14`/`0x15`.
The agent reports `pyrio`'s `TEAM_NAME` has the same swap, while dtk's composition table and
pyrio's own `team_name_algo` agree with the textures. So the site currently shows the wrong
name and emblem for those four IDs.

Smaller: the tables spell "Lillies" (the wordmark says LILIES) and drop punctuation in
All-Stars, Smart-Alecks and Jr.

> This is a bug fix, not a design change. Worth doing on its own.

**[FACT] There is no common plate behind the wordmarks.** Each is a free-form silhouette and
its own outer keyline (1–2px navy, brown, black, white or dark green) is the only plate.
**Mario All-Stars is a pennant. Luigi Leapers is a torn banner. Birdo Bows is a striped banner.**

> **[RULE] The pennant is one team's shape, not the house shape.** This settles your question.
> Putting every team on a pennant would flatten the single most characterful thing about the
> set — that the shape is part of the identity. Use the pennant where it belongs (Rio's own
> marks, section headers) and let team identity stay per-team.

**[IDEA] Express the 48 as a set, in one place.** The wordmarks are *currently unused* —
`public/images/Teams/` holds 48 PNGs at 360×360 that are upscaled **emblems**, and nothing in
`app/`, `lib/` or `components/` references the wordmarks at all. A "48 teams" wall that shows
all of them at once is both a genuine visual for the site and a use for assets already paid for.

---

## 4. The game's own words

**[FACT] Chemistry is called *Buddy*, and its symbol is a music note.**
Tip 2539, verbatim: *"♪ is a symbol of friendship. Buddies exhibit unpredictable powers when
they field and bat."* The lineup screen label is **"Buddy players"**, with the same `<note>`
symbol. And entry `80` — the controller icons — has a **music note at slot 8**, 27×22,
alongside A/B/X/Y/L/R/Z.

> This reframes your squiggles note. The game's vocabulary is "Buddy", and the token is ♪.
> The chemistry agent is still hunting the lineup connector sprite; if the connector is a
> squiggle, then the pair is *squiggle + note* and we have the whole mechanism. Holding until
> it reports.

**[FACT] Per-park hazards, verbatim from the loading tips.** This is the stadium-theming
answer, and it's far better than colour:

| Park | What the game says is there |
|---|---|
| Peach Garden | blocks — "packed with blocks… you may misplay balls or see a Team Star appear" |
| DK Jungle | barrels crashing through the outfield; Klaptraps in the flowing river |
| Wario Palace | Chain Chomps that "mean business"; sandstorms; Team Stars buried in the sand |
| Yoshi Park | Piranha Plants that eat the ball and spit it elsewhere; the yellow Star Piranha Plant |
| Bowser Castle | Thwomps that "spurn home-run balls"; fiery Bubbles |
| Toy Field | the Star Panel |
| Mario Stadium | *(no hazard tip — it is the clean one, and that is its identity)* |

> **[IDEA] Theme each park by its hazard, not its hue.** A stadium's page, filter chip or
> visualizer frame carries its hazard as the motif. Mario Stadium having nothing is the point:
> it's the neutral ground, which is exactly why it's the default.

**[FACT] The Team Star economy is the game's spine.** "A Star Chance is a chance to earn a
Team Star! Team Stars let you hit and pitch the ball with mysterious powers." Six of the
seventeen tips are about *how to earn one*. Settings copy: "Star Skills — Turn Star Skills ON
or OFF."

**[FACT] The records book's index, verbatim:** Past MVPs · Trophies Won · Past Superstars ·
Toy Field Records · Minigame Records · Grand Prix Medals Won. And **no letter or star grade
exists anywhere** — recognition is MVP, medals and trophies only.

> **[IDEA] Stop grading.** If the site has or plans letter grades or star ratings for
> performance, they're an import from other sports sites. The game recognises you by naming
> you MVP and handing you a thing. "Past Superstars" is a better page title than "Leaderboard".

**[FACT] The scorecard's own abbreviations (18 of them):**
`B` `B.K` `D.P` `D.S` `DB` `E` `F.C` `H` `K` `O` `P` `P.S` `PH` `PR` `R` `S` `T.P` `W.P`
The table ships no expansions, so what each means is inference — but the *set* is the game's,
and it's the natural column vocabulary for a box score.

**[FACT] 32 character bios exist, verbatim.** Mario's, in full: *"Everyone's favorite hero.
When Peach is in trouble, he always saves the day! A kart racer, tennis player, golf
enthusiast, doctor… The list goes on and on, showing he's a jack-of-all-trades. His trademark
Fireball will help him in his first foray into baseball."*

> **[IDEA] These fill a hole that is open right now.** The character dashboards ship with
> placeholder writeups waiting on community content. There are 32 finished bios on the disc,
> in the game's own voice, already written. They won't cover the Rio-specific analysis, but
> they end the empty state immediately.

**[FACT] Settings copy worth stealing wholesale:** *"Mercy — End a game if the score
differential reaches 10 runs."* · *"Innings — Set how many innings you'll play. When a game is
in a tie, you can play up to 3 extra innings."* · *"Choose Random to select the remaining
players randomly."* · *"Players will join you when you get all their flags."*

> **[RULE] The site's microcopy register is already written.** Short, imperative, a dash
> between label and explanation, no marketing voice. Match it and the writing stops sounding
> like a product and starts sounding like the game.

**[FACT] Specials have in-fiction names:** Fireball (Mario), green Fireball (Luigi), Banana
Ball (DK), Heart Ball (Peach), Flower Ball (Daisy), Killer Ball (Bowser), Garlic (Wario),
Liar Ball (Waluigi — called "Phony Ball" in the mission text), cursed balls (Dry Bones).

**[FACT] Other systems, with header citations:** challenge mode with 10 star missions per
character (~50 types), 12 scout-mission types, a 19-item challenge shop, a **54×54 chemistry
table**, a 14-ability fielding bitmask, and a per-character growth-title ladder that ends in
"Star".

> **[IDEA] The growth-title ladder is a ranked-ladder metaphor the game already owns.**
> `/modes/[gamemode]/ladder` could use the game's own progression nouns instead of generic
> tiers, with "Star" at the top.

---

## 5. Chemistry — the squiggle is not a sprite

**[FACT] There is no squiggle texture, and that is the finding.** 127 texture entries dumped
and reviewed — contact sheets, an automated wave-stroke scan, and a same-shape/different-hue
pair search. `1745`, `2513`, `2514`, `1753`, `1744`, `865`, `1739` and ~100 more are ruled out.

**[FACT] The decomp says why.** Chemistry has *three* separate visual treatments, and only one
of them was ever going to be a sprite:
1. **Team select** shows a **0–5 star meter** (`text_744C8.c teamSelectionSetChemStars`),
   computed from the average chemistry with the captain, thresholds 70 / 55 / 35 / 15.
2. **The on-base link** is a HUD UI record (`hud_gauges.c draw_OnBaseChemLinks`,
   elementIndex `0x10`/`0x11`/`0x12`).
3. **The chem / anti-chem effect is an animated actor model** —
   `actor_transform.c displayChem_antiChemGraphics`, modelIndex 2/3, slots 5/6.

> So the squiggle you remember is **3D geometry, not art**. That is why it never turned up in
> the texture dump.

### 5a. Found it — and you were right about the squiggle

**[FACT] The chem and anti-chem emotes live in archive entry `810` (`prop/maxtame`).**
Verified index chain: `displayChem_antiChemGraphics` queues modelIndex 2/3 →
`mUpdateActorTransformAndAnimation` → `scene_effects.c maybeHudRelated` loads entry 810 →
`fn_3_BF238` creates six actors in anim-section order 3, 11, 21, 27, 33, 39. So **modelIndex 2
= section 21 ("good")** and **modelIndex 3 = section 27 ("bad")**. The other two emote sets in
the same archive are `tsukare` (tired) and `piyori` (dizzy).

**[FACT] Each emote is two camera-facing billboard quads, not a ribbon or a chain.** I pulled
the textures and composited them at the game's own relative scales and rotations:

| | Backing quad | Symbol quad |
|---|---|---|
| **Chem (good)** | pink speech bubble, fill `#ffdeef`, ring `#ff94b5`, half-side 0.25 | black eighth note with a white outline, half-side 0.30, rotated **−30°** |
| **Anti-chem (bad)** | lilac 9-point starburst, fill `#e7ceff`, outline `#ad4ad6`, half-side 0.375 | dark purple scribble-swirl `#310042`, ~3 loops, half-side 0.23, rotated **−20°** |

> **You remembered it correctly.** The anti-chem symbol is a loose hand-drawn scribble — a
> swirl rather than a zigzag, but unmistakably the squiggle. And the good-chemistry emote is
> the music note from tip 2539, sitting in a speech bubble: *"♪ is a symbol of friendship."*
> The game says it in text and draws it in 3D, and both agree.

> **This also settles the burst.** You said you didn't remember a burst — the burst is real,
> but it belongs to **anti-chemistry**. I used it as generic decoration, which is why it read
> as invented. It has one job in the game and it is a negative one.

**[RULE] The emote is always a backing shape plus a symbol.** Never the symbol alone, never
the backing alone. Two layers, the symbol rotated off-axis. That off-axis tilt is most of
why it reads as hand-made rather than as an icon.

**[FACT] The two animations have opposite personalities, and this is the best detail found
all session.** Both are 30 frames at 30 fps — exactly 1.0 s — then hold.

- **Good** *pops and squashes*: scale 0 → 1.10 at f10 → settles 1.00 at f15. The symbol
  rotates −15° at f10, then **squashes** (scale z 1.25, y −0.18) at f18, back to rest at f30.
- **Bad** *shudders*: scale 0 → 1.133 at f10 → **dips to 0.80 at f20** → recovers to 1.00 at
  f30. The symbol **flickers** −25° at f10, f21 and f27, with rests at f18, f24, f30.

> **[IDEA] Port both curves to CSS verbatim.** Good chemistry overshoots and settles; anti
> chemistry overshoots, *sags*, then recovers while twitching three times. That is a free,
> completely authentic motion language — and the asymmetry does the semantic work, so the
> two states are distinguishable with the colour removed.

**[ASSET] Exported glTF**, texture-correct, in `.../scratchpad/chem/actor810/`:
`chem_good_810_s20_bank21_TEX_FIXED.glb`, `antichem_bad_810_s26_bank27_TEX_FIXED.glb`,
plus `tsukare` and `piyori`. Flat composites at `.../scratchpad/chem-chem-composite.png` and
`.../scratchpad/chem-anti-composite.png`.

**[GOTCHA for the pipeline] `Store.glb()` embeds the wrong textures for multi-section
archives.** It resolves draw texture indices against the *global* texture list
(`texture_base` returns 0 for entry 810), so it attaches section 0's images instead of the
set's own. Geometry and clips are correct; only the images are wrong. Rebuild with the
section's images explicitly. This would silently poison any future effect export.

**[FACT] The data model, verified against the real roster (entry 7, decompressed):**
- `ChemistryTable` — `0x36` bytes per character at `CharacterStats+0x3B`, one `u8` per other
  character, 54 CHAR_IDs.
- Self value is **50** for everyone. Off-diagonal runs **5 to 99**, mean **59.9**.
- **Perfectly symmetric** — 0 of 1431 pairs disagree. A likes B exactly as much as B likes A.
- **101 pairs at ≥90.** **53 pairs under 20.**
- `chemThresholds = {90, 20, 90, 90}` — chem-throw eligibility at ≥90, anti-chem under 20,
  on-base link at ≥90.
- Anti-chem throw misfires at a flat **20%** when chemistry is under 20.
- `chemBobbleMults` — contact ×1.05 / ×1.10 / ×1.20 and power ×1.10 / ×1.25 / ×1.50, indexed
  by how many chem links are on base (1–3).
- The Buddy Emblem adds **+50**, clamped to 100 (not in exhibition).

> **[IDEA] The 54×54 matrix is the single best data visual the game has to offer.**
> It is symmetric, so it renders as a triangle. 101 bright pairs and 53 hostile ones against a
> mean of 59.9 means it has real structure, not noise. On `/characters` this is a genuine
> centrepiece — and it is *not* a generic heatmap, because the thresholds are meaningful:
> 90 and 20 are hard lines the game itself draws, so the scale gets three bands, not a ramp.

> **[IDEA] Chemistry is a relationship, so render it as one.** A player's page shows their
> row of the matrix: who they're ≥90 with, who they're under 20 with. "Buddies" and the
> anti-chem list, in the game's own vocabulary.

> **[IDEA] The escalating on-base multiplier is a live state worth showing.** One, two, three
> links on base is ×1.10 → ×1.25 → ×1.50 on power. In `/games/live` and the game page, that is
> a real-time thing happening that no scoreboard currently shows.

> **[RULE] Three states, not a gradient.** Because the game thresholds at 90 and 20, every
> chemistry display gets exactly three states — buddy, neutral, anti. No smooth colour ramp.
> This also keeps it on the right side of the "saturated rim, neutral core" rule: the neutral
> band is genuinely neutral, and only the two extremes carry hue.

---

## 6. Stadiums — materials, not swatches

**[FACT] The game ships its own preview scene for six parks.** Entry `1746`: `065` Mario,
`066` Peach, `067` Wario, `068` Yoshi, `069` DK, `070` Bowser. Palettes below are sampled
from those scenes, so they are what the park actually looks like in frame, not what a texture
atlas averages to. Toy Field has no scene — its palette is texture-only.

**[FACT] Each park's identity is a short list of nameable materials.**

| Park | Materials | Signature motif |
|---|---|---|
| Peach's Garden | red brick, mossed grey ashlar, paved slabs, lawn with mowing stripes, terracotta | red carpet with gold lattice trim |
| DK Jungle | weathered timber plank, mossy ruin brick, carved stone, dense canopy | carved stone ring |
| Yoshi Park | painted grass and sand, soft cloud sky, wood fences, cut-out bushes | storybook flatness — everything looks hand-made |
| Wario Palace | sandstone and limestone block, fine dune sand, woven banners, gold trim | carved serpent medallion |
| Bowser Castle | cut stone, castle brick, lava, gold-brown floor | spiked arch with a faced keystone |
| Mario Stadium | mown grass, infield clay, blue stand trim | the clean diamond |
| Toy Field | smooth painted plastic and metal, riveted blue panels | starfield and starburst — **no natural texture anywhere** |

> **[RULE] A park is a material and a hazard, and only then a colour.** Combine this with the
> hazard table in section 4 and each park has a three-part identity — what it's made of, what
> lives there, what it looks like — none of which is a hex value. That's the difference
> between seven themes and seven accent colours.

**[FACT] The broadcaster lines, which are the agent's writing, not the game's:**
- Mario — *"The classic diamond, neatly mown and clay-raked, with the stands packed and the fans waving their towels."*
- Peach — *"A walled royal garden, all lawn and brick, with the castle looking down on the field."*
- DK — *"A jungle clearing hemmed in by carved stone and dense canopy, with a volcano smoking over the outfield."*
- Yoshi — *"A picture-book meadow where the outfield rolls off into painted hills, and every fence post looks hand-carved."*
- Wario — *"A sun-baked desert arena with a sandstone palace looming over the infield and a sunset sky that never lets up."*
- Bowser — *"A stone fortress over a lava moat, with spiked arches and a door that looks like it wants to eat the ball."*
- Toy — *"A toy-box ballpark under a starfield, the blue floor lit up like a game board with the bonus pads glowing."*

**[FACT] `stadiumThemes.ts` is colour-only, and it has drifted from its source.**
It defines sky, fog, hemi, sun, an 11-key collision palette, emissive and foulMult per park —
**no texture, pattern, motif or voice field anywhere.** Its header says it was ported from
RioVisualizer, but `RioVisualizer/web/themes.js` has moved on since. Concrete divergences:
Mario fog density 0.0028 vs 0.0014; Bowser's hemi and sun are completely different
(`#5a3a32`/`0.7` vs `#8c88a8`/`1.3`; sun `#ff9c5a` vs `#cfc4ff`); Wario differs on dirt, wall,
oob, pit, rough, sun position and hemi ground, and RV has mound colours the site lacks.

> **[IDEA] Extend the file additively rather than replacing it.** Add a `materials` object —
> surface, turf, infield, walls, sky, a `voice` string, and a `motifs` list of *procedural
> recipe kinds* rather than image paths. Procedural matters: the recipes (brick courses,
> ashlar, plank, dune ripple, starfield, mow stripes) are generic materials we can draw
> ourselves, so the theme carries texture without shipping Nintendo art.
> The existing labels are already good and should stay — "Molten Keep", "Picture-Book Meadow",
> "Midnight Toy Box" are doing real work.

> **[IDEA] Reconcile the drift deliberately, in one direction, and write down which wins.**
> Two copies of the same theme silently disagreeing is how the visualizer and the site end up
> looking like different products.

**[FACT] RioVisualizer already has per-park stills** at `web/renders/<park>.webp`, 1400×1050,
with `-glow.png` variants and a `manifest.json`. Collision JSON is at
`rio_visualizer/data/stadiums/*.json`, 83–298 triangles per park.

**[FACT, I verified this myself] Entry 13 sits in Bowser Castle's slot but holds Mario
Stadium's content.** I ran `stadiums.summary()` against the DOL table directly:

```
Mario Stadium   8 (144 tex)   9 (117)   10 (144)
Bowser Castle  11 ( 77 tex)  12 ( 77)   13 (144)
Wario Palace   14 ( 71)
Yoshi Park     15 (128)      16 (128)
Peach's Garden 17 (120)      18 (120)
DK Jungle      19 ( 60)
Toy Field      20 ( 32)
```

The slot assignment is real — 13 genuinely is Bowser Castle's third descriptor. But Bowser's
two real files carry **77 textures each** and entry 13 carries **144**, which is exactly
Mario Stadium's count, and the agent found 13 shares 142 textures with entry 8. So the third
slot holds Mario Stadium data.

> **The working rule: never sample Bowser Castle from entry 13.** Use 11 and 12. This is the
> same trap as before — I previously mapped id 10 to Bowser Castle and its palette came back
> byte-identical to Mario Stadium's. The three-slots-per-park structure invites exactly this
> error, twice now, so it is worth writing down rather than re-deriving.

**[CONSTRAINT] Trademarked material is excluded from the motif plan**: the MARIO STADIUM
wordmark, the M roundel, DK/DONKEY KONG logos, WARIO PARADISE, the Yoshi head, the Bowser
face, the W emblem, character sprite sheets. Generic materials — brick, ashlar, plank, sand,
grass, starfield — are what the recipes are built from.

---

## 7. Progression — the game already has a rank ladder, and it is per character

**[FACT] Every character climbs their own named ladder.** T79 #660–779 holds **32 ladders**,
one per character row. Title = `T79[starRankTextIDs[row] + rank]`, where rank comes from
`starRankByMissionCount[variantClass][completed star missions]`. Variant classes: 0 primary
captain, 1 secondary captain, 2 unique non-captain, 3 primary variant, 4 secondary variant.

**I read T79 #660–711 directly to check this.** The ladders are contiguous and
variable-length — 5 rungs for a primary captain, 4 for a secondary:

| # | Character | Ladder |
|---|---|---|
| 660–664 | Mario | Mini-Mario → Super Mario → Fire Mario → Wing Mario → **Star** |
| 665–668 | Luigi | Bit Player → Sidekick → Hero → **Star** |
| 669–673 | DK | Big Eater → Powerhouse → Konga Master → Jungle King → **Star** |
| 674–677 | Diddy | Klutz → Trickster → Acrobat → **Star** |
| 678–682 | Peach | Mischief-Maker → Elegant Lass → Lady → **Princess** → **Star** |
| 683–686 | Daisy | Tomboy → Angel → Floral Queen → **Star** |
| 687–690 | Yoshi | Egg → Mini-Yoshi → Hungry Yoshi → **Super Yoshi** |
| 691–694 | Birdo | Crybaby → Late-Riser → Wild Child → **Star** |
| 695–698 | Bowser Jr. | Shy Kid → Spoiled Boy → Little Angel → **Star** |
| 699–702 | Bowser | Roughneck → Koopa Boss → Koopa King → **Pure Evil** |
| 703–707 | Wario | Fatso → Hunk → Muscle Man → Great One → **Star** |
| 708–711 | Waluigi | Skin and Bones → Thin Dude → Model → **Star** |

**[CORRECTION to the agent's caveat] "Crybaby" and "Fatso" are not Yoshi's and Bowser's apex
ranks.** They are the *first rungs of the next character's ladder* — Birdo's and Wario's. The
agent's rank index was running one past the end of a 4-rung ladder and landing in the
neighbour's first entry, which is exactly the footprint of an overflow rather than a real
in-game title.

**Yoshi and Bowser genuinely do not end in "Star", and that is deliberate.** Yoshi tops out at
**Super Yoshi** and Bowser at **Pure Evil** — each ends on its own flavour instead of the
shared apex. That is a better detail than the uniform version would have been.

> **[IDEA] "Star" is the game's apex rank, and it should be the site's.** This is a far better
> top-of-ladder noun than Diamond/Master/Grandmaster, and it ties straight into the Team Star
> economy that six of the seventeen loading tips are about. It is also the honest one — the
> game grades nothing with letters (section 4), so a ladder that ends in Star is the game's
> own answer to "what is the best you can be".

> **[IDEA] The per-character ladder is a genuinely novel surface.** `/characters/[char]`
> could show that character's own ladder as the progression spine — Mario's page climbs
> Mini-Mario → Star, Bowser's climbs Roughneck → Pure Evil. Nobody else's site can do this,
> because the nouns only exist on the disc. It also gives the dashboards a structure that
> does not depend on community-written content.

**[CAVEAT, flagged by the agent as unverified] Yoshi and Bowser are primary captains with 10
mission slots, so a full clear reaches rank 4 — which indexes T79 #691 ("Crybaby") and #703
("Fatso"). That looks like an off-by-one in the ladder read, not two characters whose apex is
an insult. Needs an in-game check before anyone builds on it.**

**[FACT] The shop has 20 items, not 19.** Ids 0–19, names T79/T82 #880–899. Prices by
difficulty: bats/glove/spikes/emblem 100/150/180/200; captain balls and Jr. Mask 200 each;
Secret Map 500; Super Star 600/700/800/900. Items 0–5 and 19 are one-at-a-time equips —
buying one replaces the current one. **The Buddy Emblem's +50 chemistry is confirmed in the
data** (`lbl_3_data_5FC4[10] = 50.0`), matching the `calculateChemistry` path in section 5.

**[FACT] Grand Prix is a six-round format with real scoring.** Bob-omb Derby, Wall Ball,
Barrel Batter, Chain Chomp Sprint, Piranha Panic, Star Dash, in shuffled order.
**Points 10 / 6 / 3 / 0 for 1st–4th, and the final round counts double.**

> **[IDEA] That is a tournament format the community could actually run.** The site already
> has competitions and collections in scope. A Grand Prix bracket type with the game's own
> scoring — including the double-weighted final — is a feature that comes pre-designed and
> pre-balanced, and it is defensibly *Mario Baseball's* format rather than a generic bracket.

**[FACT] The challenge map's terrain is flat, unoutlined, highly saturated colour** —
field `#00e700`, river `#299eff`, lava `#ff9200`, sand `#ffe742` (entry 1756 #019, 512×512).
Entry 1742 holds only 2D sprites over it: balloons, labels, shop plates, level and cleared
banners, and a "SOLD" stamp.

> **[RULE] The map is the game's third register, and it is not the chrome's.** Flat saturated
> fills with no outline at all — the opposite of both the neutral-separated chrome and the
> clashing loud register. Three registers total: **chrome** (neutral, translucent, hairline),
> **loud** (stacked hues, awards only), **map** (flat saturated, no outline). Keeping them
> apart is most of what will stop the site drifting generic. A map or bracket view may use
> the map register; nothing else may.

**[FACT] Unlock copy, verbatim:** *"You can now select Bowser as a team captain!"* ·
*"Players will join you when you get all their flags."* · minigame spots carry play counts:
*"You can play this minigame 2 more times."*

---

## 8. The HUD — the game's own component list for live state

**[FACT] The bubble-and-note is the game's chemistry token everywhere, in 2D as well as 3D.**
`draw_OnBaseChemLinks` draws element `0x10` as a background, `0x11` a **bubble per base**
(tex `0x118`, 36×36) and `0x12` a **note** (tex `0x119`). Bit 0 = first base, bit 1 = second,
bit 2 = third. That is the *same* bubble + note pairing as the 3D emote in section 5a.

> This is the strongest unification in the whole investigation. Chemistry is a bubble with a
> note in it — stated in the tip text, drawn as a 3D emote over a player, and drawn again as
> a flat HUD badge over each occupied base. Three independent expressions of one token.
> **If one thing from the game belongs in the site's design language, it is this.**

**[FACT] There are two separate base indicators.** The chem-link badges above, and a **92×92
diamond mini-map** (element `0xA1`) with runner dots, 11×12 occupied-base gems (`0xA3`),
and `STEAL!` and `AUTO` banners. The mini-map is shown in normal matches; runner position
maps as `x = 556 + 2.3*x`, `y = 102 − 2.3*z`.

**[FACT] Balls, strikes and outs are pips, not digits.** Element `0x107`, with gem sprites in
gold / green / red / silver. **Strikes show 2 pips, balls 3, outs 2** — one fewer than the
count that ends the state, which is the correct way to draw it. The B / S / O letter panel is
a separate element (`0x105`).

> **[IDEA] Use pips, not numerals, anywhere the site shows a count that has a ceiling.**
> It is the game's own choice and it reads instantly. Pairs naturally with the slot-and-lip
> rule from section 1 — bounded resources look physical, unbounded ones are just numbers.

**[FACT] Team Stars are five 13×13 orange orbs per team** (element `0x18`, tex `0x115`) on
silver backdrops (`0x17`). The captain medal (`0x22`) picks one of 13 frames from
`starGuageIconIDs[CaptainStarHitPitch]`. The star-chance banners are `NEXT`, `VS.` and
`CHANCE!` (elements `0x1F`, `0x24`, `0x26`).

> **[IDEA] Five orbs is a finished widget for `/games/live` and `/streaming/scoreboard`.**
> The Team Star economy drives six of the seventeen loading tips and the whole Star Chance
> mechanic, and no current scoreboard shows it.

**[FACT] Inning is drawn as digits plus a separate ordinal-suffix element** (`0x110` —
st/nd/rd/th, which returns "th" from inning 4 onward). Score digits are element `0x28`,
18×25.

**[CORRECTION] There is no stamina gauge in the HUD.** I went looking for one by name —
"stamina, charge, power" — and that framing was mine, not the game's. Nothing under
`src/game/hud/` references stamina. What exists
is a **pitch charge meter** (9×106 gradient, frames 0–106, driven by `ChargePitchType`), and
the batter's swing meter uses the same element family. The loading tip *talks* about stamina
— *"When a pitcher gets tired, his or her pitches slow down"* — but the game never draws it
as a bar. That is worth knowing before we build a stamina bar the game itself declined to.

**[CORRECTION, mine] `include/game/hud.h` does not exist.** I named it in the brief. The real
headers are `include/game/hud/hud_gauges.h`, `hud_scoreboard.h`, `outs_indicator.h` and
`runner_items.h`.

**[FACT] Where the layout does NOT transfer.** Canvas is 640×448 in both containers, root
records are **centred** (`trans = pos − canvas/2`), children use `anchorSub`, timing is
frame-counted, art is fixed-size pixel art, and the mini-map uses absolute coordinates.
**There is no reflow anywhere.** Batter-hand mirroring is done by swapping `anchorSub`
(`C56C[0]` vs `C56C[1]`), which is a nice trick but is still absolute positioning.

> **[RULE] Take the game's components, not its layout.** Every element above is worth having.
> The centre-origin, no-reflow, absolute-coordinate system behind them is a 4:3 television
> artifact and must not be carried into a responsive page. The mirroring idea *does* carry:
> a scoreboard that flips handedness is a real behaviour, just implemented with logical
> properties instead of a second coordinate table.

**[CAVEAT] Entry 2514 could not be tied to any in-game load site.** Its 28-element layout
holds stat-card labels, roster portraits and CPU/P1–P4 badges, so treat it as results and
stats art rather than live HUD. Frame-to-texture mappings for digits, score, medal, badges
and pips follow the documented walker logic and match the sheets, but have **not been run in
game**.

---

## 9. The shape this is taking

Seven agents have now been through the editor, the decomp and the Rio repos. Reading back,
the design language is not a mood board — it is **three registers and one token**.

**Three registers, which the game never mixes:**

| Register | Where the game uses it | Treatment |
|---|---|---|
| **Chrome** | all UI containers, gauges, labels | translucent black 50–71%, 1–2px neutral rim, no bevel, no ornament; outlines are the fill hue darkened; saturated fills separated by a neutral band |
| **Loud** | minigame logos, place badges, result stamps | stacked saturated hues with no separator, banded gradients on a dark keyline |
| **Map** | the challenge map terrain | flat saturated colour, no outline at all |

Your "rio red on a bright green background" complaint was a register collision — loud
treatment applied to chrome. The fix is not "less colour", it is **one register per surface,
and the loud one costs you your one moment per page.**

**One token: the bubble with a note in it.** Said in the tip text, drawn as a 3D emote over a
player, drawn again as a flat badge over each occupied base. Its negative twin is the
starburst with a scribble. Two layers, symbol rotated off-axis, one second of animation that
*squashes* when good and *shudders* when bad.

**And three things the site should stop doing**, each because the game doesn't:
no letter or star grades (it recognises you by naming you MVP and handing you a thing);
no glow on focus (it has none anywhere); no smooth gradients (its are banded).

## 10. Still open

All seven agents have reported. What is genuinely unresolved:

**Gaps in the source material**
- The records-book abbreviations ship with **no expansions** in the table. `B` `B.K` `D.P`
  `D.S` `DB` `E` `F.C` `H` `K` `O` `P` `P.S` `PH` `PR` `R` `S` `T.P` `W.P` — the set is the
  game's, the meanings would be our inference.
- The `<cell 0x89>` symbol in tip #157 ("Your only clues are `<cell 0x89>` shapes") is
  unresolved. It is the shape that marks buried Team Stars in Wario Palace.
- Scout-banner copy for 11 of the 12 scout types; only `SMACK A HIT!` was recovered.
- Grand Prix medal thresholds. The gold/silver/bronze textures exist; the cutoffs do not.
- ~25 star-mission types are still `UNK_` in the decomp.
- Entry `2514` could not be tied to any in-game load site.
- Pip gem colour meaning (gold / green / red / silver) is undetermined.
- The chem emote's on-screen lifetime (ActorFxSlot 5/6 frames).

**Things asserted but never run in game.** Worth saying plainly, because a lot above is
decoded rather than observed:
- No HUD frame-to-texture mapping was verified by running the game — they follow the walker
  logic and match the sheets.
- The chem/anti-chem emotes were exported and composited but never rendered in motion.
- My reading that Yoshi tops out at "Super Yoshi" and Bowser at "Pure Evil" comes from the
  string table's layout, not from clearing their missions.

**Decisions that are yours, not mine**
- Whether the four wrong team IDs get fixed as a standalone bug, and whether `pyrio` gets the
  same fix.
- Which direction `stadiumThemes.ts` and `RioVisualizer/web/themes.js` reconcile in.
- How far to go on shipping extracted art versus redrawing from it. The motif plan is built
  on generic materials (brick, ashlar, plank, dune, starfield) specifically so the themes can
  carry texture without shipping Nintendo assets — but the wordmarks, emblems and emote
  sprites are a different question, and the site already ships 48 emblems today.

---

## 11. v3 package — what shipped (2026-10-27)

Artifact: **Three Registers** · `https://claude.ai/artifact/JAQzaLjp2com8ccZ78jSTg`
Source: `.../scratchpad/pkg/index.html`, with `RioLogo.png` and `bowser-swing.png` published
alongside. Verified in the browser at desktop, 375px and light mode: no horizontal scroll,
no console errors.

**Built on:** the three registers (§9), the bubble-and-note token with both motion curves
ported verbatim (§5a), per-park procedural materials + verbatim hazards (§4, §6), the real
`RioLogo.png`, capsule gauges, banded gradients, saturated-rim/neutral-core rings, pips
instead of digits, the game's nouns, and the seventeen loading tips rotating in the real
frame.

**Dropped, per feedback:** every invented mushroom, the shell mark, the burst as decoration,
heavy plaques, accent rails, per-team pennant templates, star/letter grades, focus glow,
smooth gradients, Team Stars as a theme.

**The page obeys its own law** — chrome everywhere, exactly one loud element (the `LAST BALL!`
stamp), map register only on the terrain demo. That is the demonstration, not just the claim.

**Stated as ours, not the game's, on the page itself:** the four-corner focus bracket, the
two emote symbol outlines, the park material recipes, and the box-score abbreviation
meanings. The emotes are measured but were never rendered in motion.

**Two fixes found while building:** CSS background layers paint first-on-top, so an opaque
course fill buries joint layers listed after it (hit on the ashlar recipe); and the repo's
`RioLogo.svg` carries a DOCTYPE, which the Artifact publisher refuses — strip the DTD or
ship the PNG.

---

## 12. The Ideas Board (2026-10-27)

Artifact: **The Ideas Board** · `https://claude.ai/artifact/Y9HntNASKHLxW4KCpQYg84`
Source: `.../scratchpad/pkg/ideas.html`. 128 ideas across 13 surfaces, filterable, with a
local-only tick list and a copyable shortlist. Companion to **Three Registers**, which
remains the law; this is the menu.

Three more agents reported after v3 shipped. What they changed:

**[CORRECTION] "No letter grade exists anywhere on the disc" was overstated.**
Entry 2513 holds a gold display alphabet — G A N C B W F D S L K plus two hyphens, at
117x106 / 108x109 C4, sitting beside `STEAL!`, `Nice game!`, `TWO` and `THREE`. It is **not**
an A–F scale: there is no E, and W, K, N, G and L appear in no grade set. But the seven
Grand Prix result bands (elements 0x81–0x87) reference those letters and nobody has rendered
the composed elements, so the mapping is open. The claim is now: *no grade scale was found,
and the recognition the game ships is MVP, medals and trophies.*

**[FACT] Grand Prix thresholds found** — `fn_8006C100` reads `lbl_80109400` =
{7000, 6500, 6000, 5500, 5000, 4000}, seven bands, band 0 top. These are **score bands, not
medal tiers**; gold/silver/bronze cutoffs are still missing.

**[FACT, settles an open question] There is NO buddy connector sprite.** The lineup screen
gives each buddy teammate a single element (0x2B) and draws no line between players. The only
in-match chemistry visual is the per-base HUD icon. Drawing links in a lineup builder is a
good idea but it is **ours**, not the game's.

**[FACT] Character select shows exactly four bars** — Batting, Pitching, Running, Fielding,
scale 1–10 (`gfx_cssCharStatBars_and_sthgElse`). Speed, contact, power and pitch are hidden.
Starring adds +2 to each, capped at 10. Base values live in `.bss`, so they were not extracted.

**[FACT] Captain select is 12 in a 2x6 grid**, 640x480, two 3D models at (-225,-35,0) and
(95,-35,0). The 54-character browser geometry is **not** in the decomp, so that grid is ours.

**[FACT] The star meter is derived chemistry**, not a rating: average non-captain chemistry
with the captain. >=70 five stars, 55–69 four, 35–54 three, 15–34 two, 1–14 one.

**[FACT] Menu motion is keyframed, with exact counts.** Cursor step = 14 frames with input
locked (`makeCursorUnmovable`); wrap plays 0->14 forward or 54->45 backward; selection loops
14–55; confirm plays 55–65 once. Easing is a cubic Bezier (constants 7, 6, 12, -1, 3, -3, 1,
-6). Text fade is an integer exponential over 16 ticks — 64, 112, 148, 175, 196, 211, 223,
232, 238, 243, 247, 250, 252, 253, 254, 255 — which ports to CSS `linear()` verbatim.
**No stagger constant exists**: list items appear together.

**[FACT] All 12 scout banners recovered** (entry 2513, 231–450 x 44 C4). `SMACK A HIT!` was
only the explainer's example, not a texture.

**[CORRECTION] Records book entry 1744 holds 31 textures, not 32.** The "32 bios" figure is
separate and comes from T83; it stands.

**Still not found:** transition wipe (`fn_8004D0F0` has no decompiled body and the available
objdump lacks PowerPC support), map node geometry, shop and records-book row layouts, the
attract-mode timer, and base StatBar values.

---

## 13. Seven Concepts (2026-10-27)

Artifact: **Seven Concepts** · `https://claude.ai/artifact/78scTThtWV8ScUqfxHZdSc`
Source `.../scratchpad/pkg/concepts.html` + `roster.js`.

**[FACT] The real roster and chemistry table are now extracted.**
`entry7/0007_..._rosterFileDescriptorGame.bin`, 18144 bytes. **Rows are 0xA0 = 160 apart**,
not 336 — the earlier memory note gave the packed struct offset without the stride, which
cost a dead end. Chemistry at `+0x3B` (54 bytes), four stat bars at `+0x37..0x3A`, fielding
bitmask `+0x20`, CharID `+0x24`, captain `+0x33`, weight `+0x32`, trajectory `+0x2D`.
Validated: diagonal all 50, **0 of 1431 pairs asymmetric**, min 5 max 99 mean 59.9,
101 pairs >=90, 53 under 20, 12 captains, bars span 1-9. Exported to `pkg/roster.json`.
Spot check: Bowser's buddies are Bowser Jr. 99, Hammer Bro 95, Fire Bro 95, Boomerang Bro 95;
his anti list is Peach 5, Toadette 5 and all four Toads at 10. Mario: Luigi 99, Peach 95,
Yoshi 90.

**The seven:** 01 the menu in motion (interactive, real frame counts, locked input);
02 four bars + Superstars toggle on real data; 03 the 54x54 chemistry triangle on real data;
04 the live strip (chem badges, pips, rings, multiplier, Team Stars); 05 Past Superstars
ladder with the gold rail; 06 two park headers as material + hazard + voice; 07 the twelve
scout banners as challenge cards.

**Labelled on the page as ours, not the game's:** the cursor easing curve (the recovered
constants 7,6,12,-1,3,-3,1,-6 are Bernstein coefficients, **not** CSS control points —
converting them is still to do, so the timings are exact and the curve shape is a stand-in);
concept 04's arrangement; concept 05's figures and growth titles; concept 06's broadcaster
lines and CSS material recipes.

**Build gotchas worth keeping:**
- The chrome register is invisible over a dark page. It only works over something bright,
  which is how the game uses it — the menu concept needed a lit park behind it before the
  translucent-black panel read at all.
- Put the focus corners on the **cursor**, not the selected row, or they snap while the
  highlight slides.
- A web-font swap reflows the rows after first paint and desyncs an absolutely-positioned
  cursor. Re-place on `document.fonts.ready` and on resize.
- The browser pane throttles transitions while hidden, so mid-transition measurements lie.
  Verify final state by reading the computed transform, not a timed screenshot.

---

## 14. [CORRECTION] Focus is the selection bar, and there is no slot (2026-10-27)

The user said the focus selection is a transparent rounded rectangle whose **caps are dumped
separately from the middle bar**. That is exactly right, and it overturns two of my claims.

**[FACT] `1745:027` is the middle and `1745:028` is the cap**, both 20x31 C4. Found by
testing every UI texture for **uniform columns** — the signature of a tiling middle slice.
027 passes (every column identical); 028's per-column alpha ramps 123, 200, 171, 151 then
flattens to 155, i.e. a rounded end that butts seamlessly into the middle. An opaque twin
pair exists at `1744:029` (cap) / `1744:030` (middle).

Middle, column 10 top to bottom:
`#bbaaaa` a109 · `#b5ada5` a255 · `#887777` a219 · `#000000` a146 (57%) x25 · mirrored.
Cap rounding reaches x=5 by the top row, so radius ~5px on 31.

CSS that reproduces it:
`background:rgb(0 0 0/.573); border:1px solid #b5ada5; border-radius:6px;
 box-shadow:inset 0 0 0 1px rgb(136 119 119/.86), 0 0 0 1px rgb(187 170 170/.43)`

**[CORRECTION] Focus was wrong twice.** First "a pair of gold brackets", then "four white
corners mirrored from `1745:037`". Both withdrawn. `1745:037` is a lone 20x17 corner and
`1745:148` a 60x55 gold ring; neither is the cursor. The no-glow finding still stands.

**[CORRECTION] The "slot and lip" does not exist, and its rule dies with it.** I read
027/028 as a dark recess under a three-row lighter lip and derived *"one mechanical object,
reserved for bounded resources — star charges, roster slots, nothing else gets to look
physical."* Those two textures are the selection bar. **There is no mechanical object in
the UI at all.** Any idea resting on the slot (empty states, roster slots, the login empty
state) has been rewritten.

**Method worth reusing:** to find a 3-slice set in a texture dump, test for columns that are
all identical. It found this in one pass after a visual search had missed it twice.

All three artifacts were patched and republished.
