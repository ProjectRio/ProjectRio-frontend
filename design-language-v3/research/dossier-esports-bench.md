# Competitive / esports website benchmark dossier

Captured 2026-10-26. Styles and element counts come from live DOM measurement in the built-in browser unless marked otherwise. Blocked sources are stated, not worked around.

## 0. Capture status

| Benchmark | Method | Status |
|---|---|---|
| Rocket League Esports (rocketleague.com/competitive, /competitive/schedule) | Browser pane, computed styles | Full |
| BLAST.tv (RLCS data partner) | Browser pane | Full; cookie wall declined |
| Slippi (slippi.gg home, /leaderboards, /user/ging-345) | Browser pane | Full |
| HLTV (hltv.org/ranking/teams) | Browser pane | Full |
| VALORANT Esports (valorantesports.com/en-US) | Browser pane | Home only |
| start.gg (www.start.gg) | Browser pane | Home only; bracket not captured |
| Liquipedia | Cloudflare "Verify you are human" challenge; WebFetch 403 | Blocked, not bypassed; search snippets only |

Note: rocketleague.com/esports now returns "moved or no longer exists". The hub is /competitive. rlesports.gg was denied by the browser and rlesports.com fails TLS in WebFetch.

## 1. Rocket League Esports (priority 1)

Sources: https://www.rocketleague.com/competitive , https://www.rocketleague.com/competitive/schedule

**Architecture.** The competitive area is a sub-section of the publisher site (dropdown: Overview, Schedule, Watch, Rules, Image Galleries). Archetypes:
- *Hub (/competitive):* full-bleed hero video with a championship headline and a "Watch VODs" CTA, a "Competitive News" row of image cards, then utility modules (Fan Rewards, "Want to run a tournament?", an RLCS explainer). Magazine layout; no tables.
- *Schedule:* breadcrumb, centred uppercase H1 ("RLCS COMPETITIVE SCHEDULE"), a filter bar of segmented status chips (All / Ongoing / Upcoming / Completed) and two dropdowns (event type, region). Then sectioned full-width rows: name left, region as a small outlined pill (EU, SAM), a meta line (team count, prize, venue), bold right-aligned date.
- *Standings, brackets, rosters, stats:* not on rocketleague.com. Each event links to BLAST.tv (utm_source=rocketleague-com), and the page says "Find out more... at BLAST.tv". The data surfaces belong to a partner with a different visual system.

**Color.** Near-black with a navy cast (one measured background: rgb(13,13,34)). Text is white at 100% for headings and 75% for body. Accent is spent on CTAs (orange "Play Now", "Learn More"); cyan rgb(51,218,255) appears once. Team and game colour arrives through imagery.

**Typography.** Headings use "BourgeoisUltraBold" (H1, 48px, uppercase) and "BourgeoisBold" (H2, 24px, sentence case). Body is Inter Variable. The Bourgeois name is observed from computed styles; I found no published credit for it. Numerals were not measured for tabular figures; dates are bold and right-aligned.

**Geometry (measured; corrects the premise).** On /competitive: one clip-path element, zero skew in chrome, 11 translate-only animation transforms, 3 gradients, border radii 2px to 4px. The diagonal energy lives in content (the sheared Rocket Rivalry wordmark, car art), not in buttons or cards. My first skew count of 50 on the schedule page was identity matrices and is discounted.

**Identity and motion.** Players appear as caps names over photography ("TENACITY", "FIREWALL14"), not as colour-coded team cards. One auto-rotating hero with a visible pause control. Otherwise restrained.

**Balance.** The toy-car energy comes from the game's art; the UI steps back. Official polish comes from consistent type, square geometry and a disciplined accent. The move to copy is restraint in the interface so the content carries the personality.

## 1b. BLAST.tv (RLCS data surface)

Sources: https://blast.tv/rl/tournaments/rlcs-world-championship-2026 , https://blast.tv/rl/leaderboard/2026/world-championship/eu

- **Color:** plum-black ground rgb(31,12,25), white text, amber rgb(255,192,70) as the main accent, yellow rgb(255,254,62) on consent buttons. A different palette from rocketleague.com, so one league runs two visual systems.
- **Type:** "TT Norms Pro" (H1 weight 500, 30px; body 16px).
- **Event page:** title, date range, prize pool, team count, venue; sub-tabs Overview / Results / Stats; a "Last matches" strip of rows with logo, name, a win-probability split bar, and a boxed score; then Brackets; then Teams with seed numbers, country codes and rosters; then "Where to watch" with language-flagged channels; then a past-tournaments rail; then FAQ written as concrete questions ("Who won...?").
- **Bracket:** horizontal canvas. Round headers are dated with round names ("2026/09/19 UB Quarter Final 1", "LB Round 1 M1"). Cards show logo, abbreviated name, and a boxed score. Upper and lower brackets are separated by vertical offset. It runs wider than a laptop viewport.
- **Standings (EU World Championship qualifying):** stage control (Major 1 / Major 2 / World Champs), region pills, rows of rank, favourite star, logo and name, player handles as chips, right-aligned points, expand chevron. **Best structural detail in the set:** a labelled cut line, "WORLD CHAMPIONSHIP EU QUALIFYING CUT", between #5 and #6. Qualification is drawn as geometry.
- **Friction:** a Cookiebot wall citing "1086 partners" covers the event page. Declined under the privacy rule.

## 2. Slippi (priority 2)

Sources: https://slippi.gg/ , https://slippi.gg/leaderboards , https://slippi.gg/user/ging-345

**Home.** Purple top bar (about rgb(49,0,87)), green hero, dark feature section, headline set in a white reversed block, CRT monitor illustration, faint hexagon tile texture. Plain copy with icon bullets (rollback netcode, matchmaking, replays), a donation form, no ads seen.

**Type.** Headings "Maven Pro" 700 (H1 52px, H2 22px): rounded geometric, warm, tool-like. Body "Rubik". Community utility tone, not sports display.

**Leaderboard (the ranked ladder).** Left icon sidebar (Home, Leaderboards, Netplay, Downloads, About); green header bar; dark slate content (rgb(35,37,44)). Regions are tabs (North America / Europe / Other). Freshness is stated: "Auto updates every 2 minutes."
- Columns: RANK (large centred numerals), PLAYER, RATING, W/L.
- PLAYER cell: bold display name, then the **Melee connect code** in small caps (GING#345). This is the most credible identity element in the set. Below, character icons: green ring for primary, grey for secondary, "+2 more" overflow.
- RATING: large, right-aligned, one decimal (2919.8). Beneath it, wins and losses in green and red. Green and red appear only here, for W/L.

**Player page.** Hero band of dark slate with a dark-red gradient and hex texture. Name, connect code, a faceted gem-crest rank badge with the tier label (GRANDMASTER) and rating (2919.8). Right-rail stat cards: region, matchmaking rating (3074.4, shown separately from the displayed rating), supporter tier. Sections with icon headings: Gameplay, Placements (1st in the world, 1st in N. America), and a Past Seasons table (date range, rating, W/L, world and regional rank per season).

**Identity.** Melee's vocabulary (connect codes, characters, sets). Two ratings shown with labels. The hex texture is the project's own motif.

Context: https://upcomer.com/what-is-slippi-ranked-how-to-use-the-online-super-smash-bros-melee-tool/. A fan-built Melee tier mapping (Bronze 1 to Master 3; Grandmaster for top 300) exists via DeepWiki, unofficial and unverified against Slippi's thresholds: https://deepwiki.com/phillymelee/phillymelee.github.io/3.1.2-rank-retrieval-and-caching

## 3. Liquipedia (priority 3)

Blocked by a Cloudflare challenge on https://liquipedia.net/rocketleague/RLCS/2026/World_Championship. Not bypassed. Search-snippet evidence only:
- A documented colour scheme (LPColors, on the Overwatch wiki) with separate faction-colour variants for light and dark backgrounds, tuned for WCAG contrast: https://liquipedia.net/overwatch/Special:LPColors
- Brackets and tables generated by modules (Module:Brkts, Module:MatchGroup): https://liquipedia.net/commons/Module:Brkts/WikiSpecific/Base

Unverified expectation from the wiki model: tournament infobox, match rows with logo, name and score, round-by-round brackets, participant tables, dense text-first layout. Credibility comes from citations and edit history, not styling.

## 4. start.gg (priority 4)

Source: https://www.start.gg/ (home only).
- Roboto. Tailwind-style slate palette measured (rgb(30,41,59), rgb(100,116,139), rgb(148,163,184)); green "Registration Open" chips; blue primary CTA.
- Dark navy hero with centred wordmark and two CTAs; narrow dark icon rail; event cards with image, game name, dates, city, attendee count.
- Community extensions add a dark theme and bracket shortcuts (search snippets), which signals demand for dark mode on a utility site.
- Lesson: neutral utility skin. Event cards carry operational facts (status chip, dates, location, attendees). The tournaments supply the colour.

## 5. VALORANT Esports (priority 5)

Source: https://valorantesports.com/en-US/ (home only).
- Near-black ground rgb(15,21,25), white text, grey rgb(163,163,163), red accent rgb(220,48,48). Closest to the user's current site; the genre template at its purest.
- riotSans (display, caps) with Inter body. One clip-path element and 13 real skew transforms: skew used sparingly.
- Top to bottom: global Riot bar; **phase stepper** (SEP Champions Shanghai with check, NOW GCC with red node, JAN VCT Kickoff), a timeline as navigation; event lockup with a featured-tournament card; dark **next-match card** with a large countdown and "View details"; **match strip** of date chips with "Final" tags in a horizontal carousel; "View bracket" tile.
- The sequence works: phase, next match, schedule strip, bracket. Team logos rendered as hidden placeholders in the capture, so logo use could not be verified.

## 6. HLTV (priority 5)

Source: https://www.hltv.org/ranking/teams/2026/october/26
- Open Sans throughout; no display face. Grey text rgb(146,154,158), links rgb(135,163,191), panels rgb(45,56,68), green rgb(9,193,0) for rank-up deltas, red for down. Almost no accent.
- Three columns: year filter rail, ranking list, "Recent activity" ticker. Ranking tabs (World, Regional, Valve, VRS Invites).
- Row: rank, team name with named metric in parentheses ("Spirit (904 HLTV points)"), roster handles with flags, delta at right.
- No hero, motion or imagery. Trust comes from the named metric and a table that never changes shape.

## 7. Cross-benchmark synthesis

### Conventions a competitive site must honour

1. **Time-ordered structure.** Past, now, next are always distinct (RL status chips, VALORANT phase stepper, BLAST dated rounds).
2. **Qualification is visible.** BLAST's cut line, stage tabs and region pills answer "how do I get in" on the page.
3. **Brackets are boxed and dated.** Round name and date, logo before name, boxed score, winner distinct, horizontal scroll when wide.
4. **Standings show movement and identity.** Rank, team, roster, points, delta; the metric is named.
5. **Players use the game's native ID.** Connect codes (Slippi), handles with flags (HLTV), handle chips (BLAST).
6. **Result colour is reserved.** Green and red mean W/L or delta (Slippi, HLTV), so a brand red collides with losses.
7. **Freshness is stated.** "Auto updates every 2 minutes", dates on every row.
8. **Numerals are aligned.** Right-aligned scores and ratings with consistent decimals.
9. **Provenance is visible.** Partner attribution (RL to BLAST), named metrics with method disclosure (HLTV points, Slippi's two ratings).

### What separates real identity from the template

Template: near-black ground, one saturated red or neon accent, condensed caps display, uppercase letterspaced kickers, skewed parallelogram buttons, radial glow behind the hero, countdown centrepiece. VALORANT uses several of these and still works because hierarchy and content are strong. The problem is when the whole kit is decoration.

Identity comes from:
- **One geometry decision, held everywhere.** RL keeps square chrome and puts angles in art. The angle is rare and earned, not repeated on 40 buttons.
- **A native data vocabulary.** Connect codes and characters; named points; a cut line.
- **Restrained colour.** Two colours at most: one for CTAs and live state, one reserved for results.
- **A typeface with a point of view.** Maven Pro and Bourgeois read as specific; Roboto and Open Sans read as tools, which is fine when the data carries credibility.

## 8. TELLS of the generic esports template

1. Skewed parallelogram buttons via clip-path on every control. RL chrome has one clip-path and no button skew.
2. Radial glow behind hero or cards: decoration with no data meaning. RL's whole competitive page has 3 gradients.
3. One neon or red accent used for everything, including "win" states and brand. Red then means brand, live and loss at once.
4. Uppercase letterspaced kickers above every section. Use sentence case; reserve caps for one display moment.
5. A condensed caps display face (Rajdhani, Teko, Saira Condensed or similar) applied to body-weight data too.
6. Hero with blurred photo, huge headline and two CTAs, and no data above the fold.
7. Countdown timer as the centrepiece with no standings or results beside it.
8. Team colour bleeding into gradients, borders and buttons, so every page is the same shade.
9. Dark mode only. HLTV and start.gg both work in light and dark.
10. Decorative circuit, hex or grid textures unconnected to the game or community. Slippi's hex texture is defensible because it is the project's own motif, used sparingly.
11. Stat tiles with big unlabelled numbers and no units, time window or provenance.
12. Oversized display numerals used for everything; reserve scale for the one number that matters.
13. Identical image cards in carousels with no date, status or result.

## 9. How fan-built projects earn credibility differently

- **Accuracy and disclosure over polish.** Slippi labels its two ratings; HLTV names its metric and keeps its table shape stable. Fan audiences check numbers, so the site makes checking easy.
- **Native identifiers.** Connect codes, handles and character icons are recognised instantly. Publisher sites lead with brand.
- **Stated method and freshness.** Refresh cadence stated; unofficial mappings labelled as such.
- **Citation culture (Liquipedia).** Density is accepted because every row is sourced and editable in public.
- **Lower production budget, higher utility tolerance.** HLTV's dated look reads as data-first to its audience. Publisher sites must look expensive, which is where the genre template comes from.
- **Consent walls cost credibility.** BLAST's 1086-partner wall contrasts with the fan sites, which show a donation form and no ad wall.
- **Identity fragmentation.** A publisher that outsources data (RL to BLAST) can end up with two visual systems. A fan project can own one.

## 10. Implications for this redesign

- Keep chrome square and flat. Put angles in artwork or one signature element.
- Spend the single accent on live and CTA state. Reserve green and red for results and deltas; do not use either for brand.
- Make standings and brackets first-class. Adopt the cut-line pattern for qualification and boxed, dated match cards for brackets.
- Use the Melee connect code and character icons as the player identity primitive. Show two ratings only with labels.
- State freshness on every ranked table.
- Pick one display face with a point of view; use one body face for all numerals.
- Drop radial glows, uppercase kickers and skewed buttons.

## Sources

Official and partner:
- https://www.rocketleague.com/competitive
- https://www.rocketleague.com/competitive/schedule
- https://blast.tv/rl/tournaments/rlcs-world-championship-2026
- https://blast.tv/rl/leaderboard/2026/world-championship/eu
- https://valorantesports.com/en-US/
- https://www.engadget.com/2019-01-18-riot-lec-league-esports-design-rebrand.html (LEC rebrand: DesignStudio; Gattica and Druk; "clashing opposites"; deliberate rejection of traditional sports visual cues for esports)

Fan-built and community:
- https://slippi.gg/ , https://slippi.gg/leaderboards , https://slippi.gg/user/ging-345
- https://www.hltv.org/ranking/teams/2026/october/26
- https://liquipedia.net/overwatch/Special:LPColors (search snippet)
- https://liquipedia.net/commons/Module:Brkts/WikiSpecific/Base (search snippet)

Tournament platforms:
- https://www.start.gg/
- https://createit.com/?p=5935 (ESL redesign case study; conversion-focused)
- https://vp0.com/blogs/esports-tournament-bracket-ui-react-native/ (bracket as pan-and-zoom canvas; follow-your-team path highlight)
- https://anwp.pro/docs/sports-api-hub/display/season-pages/ (grouped standings; mirrored two-conference bracket)

Design writeups (portfolio or vendor claims, descriptive only):
- https://www.theskinsfactory.com/gamein-esports-web-design (charcoal and black palette, sparing accents)
- https://contra.com/p/velYqW2N-respawn-arena-brand-identity (one job per typeface; red and green reserved for live states)
- https://hernanlindenbaum.myportfolio.com/riot-lol-worlds-2022 (Manuka Bold and Fraktion; palette recombined per stage)
- https://havenagency.com/case-study/blizzard-entertainment/heroes-of-the-dorm (bracket updating from API standings)
- https://kombai.com/gallery/app-pages/leaderboard-ios-21/ (standings template: striped rows, sub-tabs)
