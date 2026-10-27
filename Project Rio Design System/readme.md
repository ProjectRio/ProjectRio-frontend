# Project Rio — Design System

A design system for **Project Rio**, the competitive‑play ecosystem for *Mario Superstar Baseball*. Project Rio is a custom Dolphin (GameCube) emulator build tuned for optimized online netplay, plus a web platform that records every game: ranked ELO ladders, live game tracking, deep batting/pitching stats for players and all 54 characters, community game modes, and caster tools (pitch‑trajectory visualizer, stream overlays).

This system captures the product's blend of **esports broadcast energy** and **dense stat‑tracking utility**: a dark "night arena" UI lit by **Rio red**, condensed uppercase **Rajdhani** display type over readable **Inter** body, scoreboard‑style tabular numerals, and the pixel‑art **mushroom‑with‑baseball‑stitching** mark.

> Project Rio is a fan project and is not affiliated with Nintendo.

## Sources used

This system was reverse‑engineered from the official frontend. If you have access, explore these to build with higher fidelity:

- **Frontend (primary source):** https://github.com/matt-gree/ProjectRio-frontend — Next.js 15 / React 19 / Tailwind v4 site. The theme lives in `app/globals.css` (`@theme` tokens, the `.panel` / `.btn-*` / `.stat-table` / `.input` utility classes); components in `components/` (`Nav`, `Footer`, `GameCard`, `LiveGameCard`, `LadderTable`, `StatsTables`, `ui.tsx`); tier logic in `lib/ladder.ts`; roster data in `lib/data/characters.ts`.
- **Related repos** (explore for deeper context): https://github.com/ProjectRio/ProjectRio-web (RESTful stats API), https://github.com/ProjectRio/ProjectRio (the Dolphin emulator build), https://github.com/matt-gree/ProjectRioStreamHelper (overlays & scoreboards), https://github.com/matt-gree/pyrio (statfile/API library).
- **Uploaded brand assets:** the pixel mushroom logo (`ProjectRio.svg`, `RioLogo.svg`, `rio_logo_white_filled.svg`, `rio_logo_white_stitches.svg`) and two red mushroom‑pattern backgrounds (`MovingBackground.png`, `NPSSOverlayMainBackground.png`) — used by the stream overlays.

The reader is encouraged to browse the repositories above to design new Project Rio surfaces more accurately.

---

## Content fundamentals — how Project Rio writes

**Voice:** confident, community‑insider, sports‑broadcast. It talks to players like a league does — never corporate, never cutesy, despite the Mario subject matter.

- **Casing.** Display UI (headings, buttons, nav, table headers, badges, kickers) is **UPPERCASE** with wide letter‑spacing — it reads like a scoreboard. Body copy is sentence case.
- **Person.** Addresses the player directly with **"you"** ("find **your** roster edge", "climb from Shell to Legend"). Describes the product in third person ("Project Rio is a custom Dolphin build…").
- **Tone.** Punchy, declarative, stat‑forward. Headlines are short noun phrases ("Latest Games", "Ranked Ladders", "Explore Project Rio"). Kickers set context above a heading ("Around the league", "Everything tracked", "Join the community").
- **Numbers are the content.** Copy leans on concrete figures — "all 54 characters", ELO ratings, AVG/OPS/ERA. Stats are never decorative; every number shown is a real metric.
- **Domain vocabulary.** Uses baseball + MSSB terms plainly: at‑bat, box score, ELO, ladder, tier, captain, stadium; tier names **Shell → Mushroom → Flower → Star → Special → Legend**; "Perfect / Nice / Sour" contact; game modes like *Big Balls Brawl*, *Star Mode*.
- **Emoji:** none. The brand uses pixel sprites and the ★ glyph (for star ratings) rather than emoji. Don't introduce emoji.
- **Examples.** Hero: *"Online ranked play, live game tracking, and deep stats for the Mario Superstar Baseball community — powered by Project Rio."* CTA: *"Get Project Rio"*, *"View Ladders"*, *"Watch Live"*, *"Join the Discord"*. Footer disclaimer (always present): *"Project Rio is a fan project and is not affiliated with Nintendo."*

---

## Visual foundations

**Mood.** A dark broadcast booth. Near‑black "night" backgrounds, a faint red‑and‑gold *arena‑light wash* bleeding from the top and bottom corners, content organized into bordered panels, and Rio red used sparingly but decisively for emphasis and action.

- **Color.** Backgrounds ride the **night** scale (`#07070b` page → `#0b0b12` panels → `#10101a` raised headers/inputs). **Rio red** (`--rio-500 #e60012`) is the single brand accent — buttons, links, active nav, focus rings, kickers. **Star gold** (`#f5bb00`) marks ratings/highlights; **emerald** signals positive ELO deltas; **fog** greys carry text (`#f5f5f8` / `#c9c9d6` / `#8f8fa3`). Ranked tiers have their own six‑color ramp (Shell green → Legend gold). Red is never used as a large fill except buttons — it's an accent, not a background.
- **Backgrounds.** Solid night base + two soft radial washes (`--wash-arena`), fixed‑attachment so they don't scroll. Hero/feature sections add a stronger top wash (`--wash-hero`) and an occasional faint 135° hairline pattern. The brand also ships a literal tiled **mushroom‑cap pattern** (red on red) for stream overlays. No photographic imagery; no busy gradients beyond these subtle washes.
- **Type.** Display = **Rajdhani** (condensed, uppercase, tracked out) for headings, scoreboards, buttons, labels, table heads. Body = **Inter**. Numerals use **tabular‑nums** everywhere scores/stats appear; a mono face (JetBrains Mono) stands in for fixed‑width readouts. Big box‑score numbers go up to 48–60px; the winning side is fog‑100, the loser dims to fog‑500.
- **Spacing & layout.** 4px grid. Content is centered in a max‑width **1280px** column with a sticky 64px nav on top and a footer below. Generous section gaps (48–64px) between hero / games / features.
- **Corner radii.** Panels/cards = **12px** (`--radius-lg`); inputs = 8px; badges/tier chips = 4px; large CTA/hero sections = 16–24px; avatars and the live dot are fully round. **Buttons are NOT rounded** — they use the signature **angled clip‑path** (`--clip-button`, an 8px diagonal cut on two corners) for a sporty edge.
- **Cards.** The `.panel`: `night-900` fill, **1px** `night-700` border, 12px radius, `overflow:hidden` so flush headers/tables clip cleanly. Header bar (`.panel-header`) is a raised `night-850` strip with uppercase Rajdhani.
- **Borders & shadows.** Hairlines everywhere on the night scale (rows = `night-800`, panels = `night-700`, strong dividers = `night-600`). Shadows are minimal; depth comes from the **red glow**, not drop shadows. The signature hover is `.panel-glow`: border lights to translucent red and a soft `0 0 24px` red bloom appears.
- **Hover / press.** Primary button hover **lightens** (`rio-500 → rio-400`), active **darkens** (`→ rio-600`). Secondary button hover swaps its border/text to red. Nav and links shift grey → fog‑100 or → rio. Table rows wash faint red on hover (`rgb(230 0 18 / 0.06)`). No scale/shrink on press; no bouncy motion.
- **Focus.** Inputs light their border `rio-400` with a 3px translucent‑red halo (`--focus-shadow`).
- **Motion.** Restrained and fast — **150ms** color/border transitions (`--dur-fast`). The only looping animation is the **live‑game ping** (a red dot pulsing outward) and the loading spinner. Easing is a soft `--ease-out`. No parallax, no entrance choreography.
- **Transparency & blur.** The sticky nav is `night-950` at 90% with `backdrop-filter: blur`. Tints (badges, washes, glows) are built from `rgb(... / alpha)` of red/gold/emerald.
- **Imagery vibe.** Pixel‑art sprites only (characters, the mushroom mark, base diagrams), always rendered `image-rendering: pixelated` — never blurred or smoothly scaled. Cool, dark, high‑contrast; the warmth comes solely from the red/gold accents.

---

## Iconography

Project Rio is **sprite‑ and glyph‑driven**, not icon‑font driven.

- **Brand mark:** the pixel‑art **mushroom cap with baseball stitching** — a 1‑up mushroom reimagined as a baseball. Provided as a crisp PNG (`assets/logos/mushroom.png`) and as SVGs reconstructed from per‑pixel rects (`assets/logos/*.svg`, `viewBox="0 0 16 16"`, `shape-rendering:crispEdges`). Always pair with the wordmark "Project**Rio**" (the "Rio" in red). Never blur it — keep `image-rendering: pixelated`.
- **Character sprites:** small per‑character portrait PNGs (`assets/characters/*.png`) used in game cards, box scores, ladders, and the roster grid. The real app carries all 54; this system includes a representative dozen (Mario, Luigi, Peach, Daisy, Yoshi, DK, Diddy, Bowser, Bowser Jr, Wario, Boo, King Boo). Pull more from the frontend's `public/images/Characters/`.
- **Diagram sprites:** a bases diagram (`assets/icons/bases-empty.png`; the frontend has R1/R12/R123/… variants) and a baseball bat (`assets/icons/baseball-bat.png`).
- **Unicode glyphs as icons:** the app uses **★ / ☆** for star ratings, **✪** for the team captain, and simple arrows (▸ →) in lists and links — not an icon font.
- **No emoji.** None in the product; don't add them.
- **UI chrome icons:** the live site uses a handful of inline stroke SVGs (e.g. the hamburger menu) drawn ad hoc. There is no bundled icon set. If you need general UI icons (chevrons, gear, close, search) and none exist in the source, use **Lucide** (https://lucide.dev) at ~2px stroke as the closest neutral match — **this is a substitution, flagged for review** (see Caveats).

---

## Index — what's in this system

**Root**
- `styles.css` — the single entry point consumers link. `@import` manifest only.
- `tokens/` — `fonts.css`, `colors.css`, `typography.css`, `spacing.css`, `effects.css`, `base.css` (element resets + the `.panel` / `.btn-*` / `.stat-table` / `.input` / `.kicker` / `.label` utility classes and keyframes).
- `README.md` (this file), `SKILL.md` (Agent‑Skills wrapper).

**Assets** (`assets/`)
- `logos/` — `mushroom.png` (primary mark), `mushroom*.svg`, `RioLogo.svg`, `favicon.png`.
- `characters/` — 12 character sprite PNGs.
- `icons/` — `baseball-bat.png`, `bases-empty.png`.
- `backgrounds/` — `mushroom-pattern.png` (tiled overlay), `overlay-bg.png`.

**Components** (`window.ProjectRioDesignSystem_6fbb66`)
- `components/core/` — `Button`, `Badge`, `TierBadge` (+ `ratingToTier`), `Panel` + `PanelHeader`, `Input` + `Select`, `Avatar`, `LiveDot` + `LiveLabel`.
- `components/data/` — `PageHeader`, `StatTable`, `LadderTable`, `GameScoreCard`.

**UI kit** (`ui_kits/web/`)
- `index.html` + `app.jsx` — interactive site recreation: Home, Ranked, Characters, Box Score.

**Templates** (`templates/`)
- `web-page/` — "Rio Web Page" starter (`WebPage.dc.html`): sticky nav + hero + content grid wired to the bundle via `ds-base.js`.

**Design System tab** — 15 foundation/specimen + component cards across Colors, Type, Spacing, Brand, Components, Web.

---

## Caveats / substitutions

- **Fonts** (Rajdhani, Inter, JetBrains Mono) load from the **Google Fonts CDN** via `@import` in `tokens/fonts.css` rather than self‑hosted binaries — so they're not bundled as `@font-face` files. If you need offline/self‑hosted fonts, drop the `.woff2` files in and add `@font-face` rules. *Flagged for the user.*
- **General UI icons** beyond the brand sprites/glyphs aren't in the source; **Lucide** is suggested as a substitute when needed. *Flagged for the user.*
- The pixel‑art SVG logos were reconstructed from per‑pixel `<rect>`s; the **PNG mark (`mushroom.png`) is the highest‑fidelity logo** — prefer it.
