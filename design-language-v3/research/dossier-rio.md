# Project Rio dossier

Compiled 2026-10-26. Part A is from web sources (fetched or search snippets, noted per claim). Part B is from a read-only pass over the `next-js-migrate` branch.

## Part A: The project and community

### What it is

Project Rio is a modified build of Dolphin (the GameCube/Wii emulator) plus a stats database, built for Mario Superstar Baseball (MSSB, GameCube, 2005). The official site describes it as "a modified version of Dolphin Emulator & a database," developed by PeacockSlayer, LittleCoaks and maybejon. Its tagline is "The Mario Superstar Baseball Center." Stated goals: automatically track and collect in-game stats, and optimize MSSB for online and offline play. Mario Golf: Toadstool Tour is listed for optimized online play, with stat tracking planned later. Listed features: optimized online play, ranked online, a public game database, gameplay mods, pre-made game modes, free to use. (Source: https://www.projectrio.online/ , which redirects to http://www.projectrio.online/ .)

Correction to the brief: the site is **projectrio.online**. projectrio.app did not resolve as a website. It is the API host (`api.projectrio.app`, per `lib/api.ts` and the Rio Web README).

### Official presence

- **Website:** https://www.projectrio.online/ (menu: Home, Rio Stats, Events, Optimize, Game Modes, Version History; buttons for download, account, setup tutorial, Rio Web, a Tableau "Rio Analytics Hub").
- **GitHub org:** https://github.com/ProjectRio is a user-style profile with 6 public repos:
  - `ProjectRio`: fork of dolphin-emu (C++, GPLv2+). The fetched README is upstream Dolphin and does not describe the changes.
  - `ProjectRio-web`: Python REST API ("Rio Web") that collects and returns stats from the client. MIT. Endpoints: `/characters/`, `/games/`, `/events/`, `/plate_data/`, `/landing_data/`, `/star_chances/`, `/pitch_analysis/`, `/stats/`. Links: projectrio.online, Patreon, Discord. (https://github.com/ProjectRio/ProjectRio-web)
  - `ProjectRio-frontend`: "WIP frontend for the Rio Web API," Svelte/Vite/Tailwind. Hosted at project-rio-frontend.vercel.app. This is the baseline the Next.js branch is migrating from. (https://github.com/ProjectRio/ProjectRio-frontend)
  - `ProjectRio-Modding`: Gecko codes built with CGecko (a LittleCoaks tool). Code lists: `ranked`, `all`, `rio-server`. Publishes a `codes-latest` release. (https://github.com/ProjectRio/ProjectRio-Modding)
  - `Rio-scripts` (Python) and `Dolphin-memory-engine` (fork of roeming's RAM-search tool).
- **Discord:** Two invites appear in the sources. The Rio Web README calls discord.gg/ZMFCuvwAyH the "MSB Discord." The frontend's Nav and home CTA link discord.gg/c3r9PabfRU. I did not confirm which one is the main community server.
- **Patreon:** https://www.patreon.com/projectrio
- **Documentation:** no docs site found. The site relies on a setup tutorial, an optimization guide, an MSSB wiki link (Fandom: mario-superstar-baseball.fandom.com), a datamined stats spreadsheet, Roeming's batting calculator, Neil's stat cards, Mori's Gecko code generator, and Mr. Joe's Baseball Basics videos. Tournaments run on Challonge.
- **Speedrun:** https://www.speedrun.com/mssb (categories include Any% Mushroom, Superstar%, Exhibition 99 Runs).

### Visual identity

The mushroom logo (`public/images/RioLogo.png`) is pixel art: a red cap with white baseball-seam stitching lines, a black outline, and a white stem. The frontend's palette is derived from it (red / white / black). The site has no published style guide that I could find.

### Competitive vocabulary (verified in code or sources unless noted)

- **Rulesets:** "Superstars Off" (also "Stars Off," "superstars-off") and "Superstars On" (also "Stars On"). "Big Balla" is a separate ruleset named in the frontend's mode grouping (`lib/modeGroups.ts`). Its meaning is not explained in any external source I found.
- **Modifiers in mode names:** "Randoms" and "Hazards" (the code excludes "Hazardless"). Randoms and hazards change the roster and ball behavior, so the frontend keeps them out of the core groups.
- **Season numbering:** Modes are named by season, for example "Stars Off, Season 7" (the default in `lib/api.ts`) and "S14 Superstars Off."
- **Tournaments and series:** "Netplay Superstars" (numbered; the author runs it; search snippet calls it the top Stars Off tournament, not verified), "Rookie Rumble XV" (named in `lib/modeGroups.ts`), "Bobble: Stars-Off (Bracket)," "Legacy Mode: Stars Off," "NationalNetplayLeague" (named in Rio Web's README). Mode names are typed by whoever creates the tag set, so the ruleset must be parsed from the name.
- **Ranked:** Ranked games are marked as ranked in the client and automatically enable the competitive Gecko codes (setup tutorial page). The ladder is ranked by "adjusted rating." Rating tiers are Shell, Mushroom, Flower, Star, Special, Legend. Each tier has 50-point divisions from 600. Below 600 is "Shell V"; 2000+ is "Legend I" (`lib/ladder.ts`).
- **Official community tier lists:** "Superstars Off, 2nd Official Community Tier List" is in the repo. A "Superstars On" list is "awaiting ratification" by community vote (`lib/data/characterContent.ts`).
- **Superstar mechanics (Wikipedia):** Characters earn stars through Challenge Mode missions. Meeting all requirements upgrades them to Superstars. Captains have 10 missions, second captains 8, minor characters 6, others 4. Superstar versions can be used in other modes. A "charged swing" roughly doubles hit power.
- **Stat vocabulary (in the repo):** batting, pitching, fielding, misc; "fair" vs non-fair contact (`exclude_nonfair`); star chances; landing data; plate data; contact frame; stick direction; swing type; linescore; scoring plays; Elo.
- **Community figures:** LittleCoaks (co-lead modder and Project Rio co-lead, runs Netplay Superstars, made the Dinger City tier list videos). The 2021 Reddit master guide put them at 14th on the ranked ladder. That is a stale snapshot.
- **Unverified from the brief:** "Ranked Normal," "Ranked Superstar," and "Unlimited" appear nowhere in the repo or in any source I found. Do not design around those names without confirming them with the community.

### How stats and results are shared now

1. The Rio client records each game automatically and posts it to Rio Web (`api.projectrio.app`).
2. Rio Web feeds the public site: Rio Stats, the game database, ladders, Elo peaks, and player profiles.
3. Off-site: a Tableau analytics hub, a datamined stats spreadsheet, community-made stat cards, and Tournament brackets on Challonge.
4. Gecko codes are distributed through the GitHub `codes-latest` release. Stream overlays exist for OBS.

### Related projects

- **CGecko** and **mssb-dtk** (decomp): LittleCoaks tools, linked from ProjectRio-Modding.
- **MSSB-Editor** by LittleCoaks: **not verified.** No source I found confirms that this exists or what it does.
- **Stat trackers:** Rio's own automated tracker; Roeming's batting calculator; Neil's stat cards.

## Part B: Current frontend (read only)

Repo: `/Users/matthewgreene/GitHub/ProjectRio-frontend`, branch `next-js-migrate`. No files were modified.

### Route inventory (50 pages, 4 API routes)

Routes marked "inferred" were classified from the file name and not read in full.

**Home and discovery**
- `/`: hero, latest games, four feature cards, Discord CTA.
- `/games/recent`: recent games list.
- `/games/live`, `/games/live/[gameId]`: live games and a single live game.
- `/games/[gameID]`: completed game page (box score, play-by-play, hit visualizer, run flow).
- `/users`, `/users/all` (inferred), `/users/[user]`, `/users/[user]/batting`, `/users/[user]/pitching`: player directory and profiles.

**Ranked**
- `/modes`: game mode index.
- `/modes/[gamemode]`: mode overview, last game, ladder table.
- `/modes/[gamemode]/ladder`: ranked ladder.
- `/modes/[gamemode]/peak`: all-time Elo peaks.
- `/modes/player/[player]`: legacy player page.

**Characters**
- `/characters`: tier lists and roster (hidden from nav).
- `/characters/[char]`: character dashboard with attributes, tier placements, writeup, trajectory and landing labs.
- `/characters/[char]/batting`, `/characters/[char]/pitching`: per-character stats.
- `/characters/analytics`: win-rate analytics with filters.
- `/characters/swing-lab`: contact frame by stick direction across modes.

**Communities**
- `/communities`: directory. `/communities/create`: create one.
- `/communities/[name]`: community hub.
- `/communities/[name]/modes/create`, `/communities/[name]/modes/[mode]/edit`: game mode create and edit.
- `/communities/[name]/tags/create`, `/communities/[name]/tags/[tagId]/edit`: tag create and edit.
- `/community`, `/community/create`: legacy redirects to `/communities` (the second is inferred).
- `/tags`, `/tag/list`, `/tag_set/list`, `/tag_set/create`: rulebook and tag and tag-set management (the last three are inferred).

**Tools**
- `/tools`: index. `/tools/pitch-calculator`: trajectory simulation.
- `/codes`: gecko code library.
- `/muddyball`: budget draft board for lineups and fielding, shareable by link.
- `/streaming/scoreboard`: green-screen OBS overlay.

**Rio Online (client)**
- `/rio-online`, `/rio-online/tutorial`, `/rio-online/optimize`, `/rio-online/events`, `/rio-online/version-history`.

**Account and admin**
- `/signup` (falling mushroom sprites), `/login`, `/login/reset_password`, `/login/reset_password/[active_url]`, `/logout`, `/admin` (staff only).

**API routes**
- `/api/auth/login`, `/api/auth/logout`, `/api/auth/session`, `/api/rio/[...path]` (proxy to the backend).

### Design tokens (`app/globals.css`)

- **Colors (Tailwind v4 `@theme`):** rio red scale `#ff6b78` / `#ff3d4e` / `#e60012` (500, the logo red) / `#c4000f` / `#9a000c`. Star gold `#ffd23f` / `#f5bb00`. Night backgrounds `#07070b` (950) down to `#2b2b40` (600). Fog text `#f5f5f8`, `#c9c9d6`, `#8f8fa3`.
- **Fonts:** Rajdhani (500/600/700) for display, Inter for body (`app/layout.tsx`). Headings are uppercase-friendly, letter-spacing 0.02em.
- **Component classes:** `.panel` (rounded 0.75rem, 1px border), `.panel-glow` (red glow on hover), `.kicker` (uppercase, 0.25em tracking, red), `.btn-primary` and `.btn-secondary` (clip-path parallelogram, uppercase), `.stat-table`, `.input`, `.label`, and mushroom animations.
- **Body:** dark only (`color-scheme: dark`). Two radial gradients on the page (red top-center at 12% alpha, gold bottom-right at 5%), fixed.
- **Shell:** sticky 64px header with backdrop blur, a games ticker, and max-width 7xl.

### Asset inventory

- `public/images/`: 117 files. `RioLogo.png` / `.svg` (pixel mushroom), `mushroom-pixel.svg`, `Teams/` (about 50 team crests), `Characters/` (sprites with color variants in parentheses, such as `Toad(P).png`), `Bases/` (base icons), `Baseball_bat.png`, `baseball.png`, `slice.png`, `github.svg`.
- `lib/data/`: `characters.ts`, `characterAttributes.ts`, `characterContent.ts` (writeups and tier placements), `logoToTeam.ts`, `teamNames.ts`, `stadiumWalls.ts`, and `stadiums/` (seven stadium wall-coordinate text files).

### API surface (`lib/api.ts`)

Base URL: `https://api.projectrio.app` (overridable with `NEXT_PUBLIC_RIO_BACKEND`). Data domains:

- **Games:** `/games/` (scores, rosters, captains, tags, linescore, scoring plays); `/games/events/` (per-pitch detail).
- **Stats:** `/stats/` (batting, pitching, fielding, misc; filterable by user, character, tag, and by-character or by-user grouping).
- **Characters:** `/characters/`, `/star_chances/`, `/landing_data/`.
- **Ladders:** `/tag_set/ladder/` (POST). The frontend adjusts ratings for games played.
- **Live:** `/populate_db/ongoing_game/`, `/ladder/games/`.
- **Users and communities:** signup, login, JWT validation, privacy, user tags, user communities, `/user/all`; community create, join, invite, members, tags, manage, sponsor, key, update.
- **Tag sets:** `/tag_set/list`, `/tag/list`, `/tag_set/create`.

Default mode in code: `Stars Off, Season 7`.

## Critique: what reads as generic or AI-templated

Your suspicions are mostly right. The palette is brand-derived, but the scaffolding around it is the template look.

1. **Near-black background with red glow gradients.** `globals.css` puts radial red and gold glows on the body with `background-attachment: fixed`. The home hero adds a radial glow plus a 1.5%-alpha diagonal stripe texture. This is the default dark-SaaS or gaming backdrop. Nothing in the glow carries meaning.
2. **Rajdhani, uppercase, wide-tracked kickers.** Nearly every page header is a `.kicker` ("Around the league," "Happening now," "Play together," "Rulebook") over an uppercase h2. The pattern is consistent, but it is the esports eyebrow reflex and it appears on almost every page.
3. **Clip-path parallelogram buttons.** `.btn-primary` and `.btn-secondary` use a skewed clip-path. This is the most recognizable gaming-UI tell.
4. **Hover glow on every card.** `.panel-glow` adds a red border and shadow on hover to every tile. The home and tools pages are identical 2-4-column card grids (title, description, "Open →").
5. **Marketing copy in the hero.** "Competitive Mario Superstar Baseball," "Everything tracked," "Explore Project Rio," "Join the community," "Every at-bat and every pitch recorded." This is generic SaaS-landing voice. The better copy in the app is specific: "Climb from Shell to Legend," "Superstars Off, Season 7," "Netplay Superstars."
6. **Imagery is underused where it matters.** The home page shows only the logo. It shows no character sprites, team crests, base icons, or stadium data, even though the repo has all of them. The app's strongest identity assets are buried on deeper pages.
7. **Decorative motion.** The signup page drops falling pixel mushrooms on a clock. This is charming once but reads as decoration rather than function.
8. **Dark-only.** `color-scheme: dark` is hard-coded, with no light theme, which narrows the palette further.

**What is not generic:** the ladder tier colors (Shell green, Legend gold), the star-gold accent (stars are a game mechanic), the pixel-mushroom logo with `image-rendering: pixelated`, and the domain-specific copy in the ladder and mode pages.

I did not run a contrast audit. Rough luminance estimates for the fog and red text on night backgrounds suggest they clear WCAG AA, but that needs confirming.
