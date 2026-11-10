# Handoff — Project Rio design language v3

Written 2026-10-27. Everything in this folder is uncommitted and nothing outside it was
changed. Delete the folder and the repo is exactly as you found it.

---

## 1. What this work is

The user's complaint, in his words, is that the current site is **"too generic, too much
like an AI output."** He explicitly did *not* want to be reduced to prompting "make a
website that doesn't look like AI built it." The brief instead:

> Build a purposeful, meaningful design language around Project Rio and Mario Baseball,
> using assets from the game. Unapologetically Mario Baseball and Project Rio, but still a
> cohesive fan-created esports passion project.

Inspirations he named: **Rocket League** and **Slippi**. The method he asked for: install
`LittleCoaks/MSSB-Editor` and **swarm Haiku agents over the game editor**, with the lead
agent making the design connections. Ten agents have now run; their reports are in
`research/dossier-*.md`.

His standing instruction while this was running: *"Only by documenting what we have access
to can the top level agent make connections to web design and pull things out with creative
and design work."* He values the evidence trail, not just the output.

---

## 2. The thing you most need to know

**`Project Rio Design System/` (tracked, at the repo root) is the language being replaced.**

It is a well-built, codified system — tokens, components, guidelines, a `SKILL.md` — and it
encodes precisely what he called generic:

| In that system | Status |
|---|---|
| `#07070b` night background | Replace. Cold neutral the game never uses. |
| Rajdhani display face | The default of every gaming-font listicle. |
| Rio red doing brand + live + loss + delta | Red gets **one** job: Rio, and live. |
| Pixel mushroom-with-stitching mark | The real logo is already `public/images/RioLogo.png`. |
| Star ratings (★ glyph) | **No grade or star rating exists anywhere on the disc.** |
| Tier ramp Shell → Mushroom → Flower → Star → Special → Legend | Invented. The game has its own per-character growth-title ladder. |

Do **not** quietly delete or overwrite it. It is the user's work, it is tracked, and the
`default` PRSH theme shares its tokens. Treat the v3 language as its successor and let the
user decide the migration. Also note `readme.md` in it claims the system was
"reverse-engineered from the official frontend" — so it describes what the site *is*, which
is exactly the thing under revision.

---

## 3. Where everything lives

### Published (durable, these are the deliverables)

| Artifact | URL | What it is |
|---|---|---|
| **Three Registers** | https://claude.ai/artifact/JAQzaLjp2com8ccZ78jSTg | The law. The design language itself. |
| **The Ideas Board** | https://claude.ai/artifact/Y9HntNASKHLxW4KCpQYg84 | 128 pickable ideas, filterable, tied to real routes. |
| **Seven Concepts** | https://claude.ai/artifact/78scTThtWV8ScUqfxHZdSc | Seven ideas built out far enough to judge. |

All three are **private to the user**. To update one, publish to the same URL — read it
first if your session has not. Their sources are in `pages/` here.

### In this folder

```
HANDOFF.md            this file
research/IDEAS.md     THE LEDGER — ~900 lines, every claim tagged
                      [FACT] (with a source) / [RULE] / [IDEA] / [CORRECTION].
                      Read this before doing any new extraction.
research/dossier-*.md 14 agent dossiers (chemistry, HUD, stadiums, teams, systems,
                      progression, progression-ui, choreography, roster-screens,
                      ui-features, type-material, gamedata, rio, esports-bench)
pages/                the three artifact sources + roster.json / roster.js
pages/roster.json     **the real 54-character roster + 54x54 chemistry matrix**
evidence/             screenshots proving the contested findings
```

### Not saved anywhere durable

~11,600 extracted texture PNGs (172 MB) are in a **session temp directory** that will be
cleared: `/private/tmp/claude-501/-Users-matthewgreene--claude-spares-spare-QU1O0D/db10369f-8cb7-407f-9ac1-0f18774f206d/scratchpad`.
They are all regenerable in minutes — see §6. Do not treat that path as storage.

### Memory

`~/.claude/projects/-Users-matthewgreene-GitHub-ProjectRio-frontend/memory/` —
see `mssb-asset-extraction.md` (tooling + findings) and `design-language.md` (the language).
Both are current as of this handoff.

---

## 4. The language, in one page

### Three registers, which the game never mixes

| Register | Where | Treatment |
|---|---|---|
| **Chrome** | every container, gauge, label | Translucent black 50–71%, 1–2px *neutral* rim, no bevel, no ornament. Outlines are the fill hue darkened, never black. Saturated fills separated by a neutral band. |
| **Loud** | minigame logos, place badges, result stamps | Stacked saturated hues, no separator, banded gradients on a dark keyline. **One element per page.** |
| **Map** | challenge-map terrain only | Flat saturated colour, **no outline at all**. |

His "rio red on a bright green background" objection was a **register collision** — loud
treatment applied to chrome. The fix is one register per surface, not less colour.

> **Chrome is invisible over a dark page.** It only works over something bright, because in
> the game it sits over live gameplay. This caught me out building the menu concept. The
> site's dark pages cannot adopt the translucent panel wholesale without a lit backdrop.

### One token

A **bubble with a note in it**, and its negative twin, a **starburst with a scribble**. The
game says it three independent ways — tip text, a 3D emote, a flat HUD badge over each
occupied base. Two layers, symbol rotated off-axis. Motion is the semantic carrier: good
*pops and squashes*, anti *overshoots, sags, recovers while twitching three times*. Both
are distinguishable with colour removed. Exact curves in `IDEAS.md` §5a.

### Three things to stop doing, each because the game doesn't

No letter or star grades · no glow on focus · no smooth gradients (the game's are banded in
1–2px steps).

---

## 5. Corrections — read these or you will repeat them

I got things wrong repeatedly in this session. Each is now settled; do not re-derive.

1. **Focus is the selection bar, not a bracket.** `1745:027` is a tiling **middle**
   (uniform columns) and `1745:028` is the rounded **cap**; opaque twin at `1744:029/030`.
   Profile: `#bbaaaa` a109 / `#b5ada5` a255 / `#887777` a219 / black a146 (57%) ×25 /
   mirrored, radius ~5px on 31. **The user supplied this**, after I had claimed gold
   brackets and then four mirrored corners. Evidence: `evidence/focus_slices.png`.
2. **There is no "slot and lip", and the rule built on it is dead.** I read those same two
   textures as a recessed slot and derived *"one mechanical object, reserved for bounded
   resources."* Withdrawn entirely. Nothing in the UI is a mechanical object.
3. **There is no buddy connector sprite.** The lineup screen gives each buddy one element
   (`0x2B`) and draws no line. Drawing links is a fine idea but it is ours.
4. **No stamina gauge exists.** The pitch charge meter (9×106, frames 0–106) does.
5. **"No letter grade anywhere" is softened.** Entry 2513 holds a gold display alphabet
   (G A N C B W F D S L K + 2 hyphens) beside `STEAL!`, `Nice game!`, `TWO`, `THREE`. No E,
   and W/K/N/G/L fit no grade scale — but seven Grand Prix bands reference it and nobody
   rendered them. **Open.** Evidence: `evidence/grade_candidates_2513.png`.
6. **Entry 13 is not Bowser Castle content.** It sits in Bowser's slot but holds Mario
   Stadium data (144 textures vs Bowser's real 77). Sample Bowser from 11 and 12. This trap
   has been hit twice.
7. **`include/game/hud.h` does not exist.** Real headers: `hud_gauges.h`,
   `hud_scoreboard.h`, `outs_indicator.h`, `runner_items.h`.
8. **Records book entry 1744 has 31 textures, not 32.** The "32 character bios" figure is
   separate, from T83, and stands.

---

## 6. Tooling

**The ISO is read in place. Never copy, move or re-extract it.**
`/Users/matthewgreene/Large Files/isos/Mario Superstar Baseball (USA).iso` (GYQE01).

```bash
cd /Users/matthewgreene/GitHub/MSSB-Editor
python3 -m zzzzdat list --all          # 2556 entries
python3 -m zzzzdat textures <id> -o <dir>
```

- Run with plain `python3`, **never `python3 -I`** — isolated mode drops cwd from `sys.path`.
- **There is no `dol` subcommand.** Use the Python API: `from zzzzdat.store import Store`.
- `st.bank(key)` returns a **`(label, Bank)` tuple**, not a Bank.
- **`Store.glb()` embeds the wrong textures for multi-section archives** — it resolves draw
  indices against the global texture list. Geometry and clips are fine; rebuild images from
  the section.
- Decomp: `/Users/matthewgreene/GitHub/mssb-dtk` — authoritative symbol names.
- Also on disk and relevant: `pyrio`, `RioVisualizer`, `PRSH` (two complete broadcast
  themes), `Vectorizer` (55 cleaned per-character portraits — use these, don't re-extract).

### The roster extraction, since it took three wrong guesses

File: `entry7/0007_..._rosterFileDescriptorGame.bin`, 18144 bytes.
**Rows are `0xA0` = 160 apart** (not 336 — that was the dead end). Offsets within a row:
chemistry `+0x3B` (54 B), stat bars `+0x37..0x3A`, fielding bitmask `+0x20`, CharID `+0x24`,
trajectory `+0x2D`, speed `+0x2F`, class `+0x31`, weight `+0x32`, captain `+0x33`.

Validates: diagonal all 50 · **0 of 1431 pairs asymmetric** · min 5 max 99 mean 59.9 ·
101 pairs ≥90 · 53 under 20 · 12 captains · bars span 1–9. If your extraction does not hit
all of those, it is wrong. Already done for you in `pages/roster.json`.

> **Useful trick:** to find a 3-slice set in a texture dump, test every image for
> **all-columns-identical**. That is the signature of a tiling middle. It found the
> selection bar in one pass after two visual searches had missed it.

---

## 7. What is still open

- Transition wipe: `fn_8004D0F0` has no decompiled body and the available objdump lacks
  PowerPC support. Unknown whether the game wipes between screens.
- The gold-letter / grade-band mapping (§5.5).
- Grand Prix **medal** thresholds. The 7 score bands are found
  (`{7000, 6500, 6000, 5500, 5000, 4000}`); gold/silver/bronze cutoffs are not.
- Map node geometry, shop and records-book row layouts.
- Base StatBar values live in `.bss` and load at runtime.
- `stadiumThemes.ts` and `RioVisualizer/web/themes.js` **disagree** — fog density, Bowser's
  hemi and sun, six Wario keys. A decision, not a bug hunt.
- Cursor easing: the recovered constants `7, 6, 12, -1, 3, -3, 1, -6` are Bernstein basis
  coefficients, **not** CSS control points. The timings are exact; the curve is a stand-in.
- Nothing has been verified by running the game. The HUD mappings follow walker logic and
  match the sheets, but none was observed.

## 8. Known defects found along the way (not yet fixed)

- `lib/data/logoToTeam.ts` and `lib/data/teamNames.ts` swap `0x4`/`0x5` (Leapers /
  Mansioneers) and `0x14`/`0x15` (Fans / Bows). Texture 100 reads "Luigi Leapers", 116 reads
  "Birdo Fans". **`pyrio`'s `TEAM_NAME` has the same swap.**
- Same files spell "Lillies"; the wordmark reads LILIES. Punctuation dropped from
  All-Stars, Smart-Alecks and Jr.
- `public/images/mushroom-pixel.svg` is a redrawn mark that should be deleted — the real
  logo was always a 16×16 three-colour pixel mark.
- `public/images/RioLogo.svg` carries a DOCTYPE, which some publishing paths refuse.

The user was offered the team-ID fix twice and deferred it both times in favour of design
work. **Do not fix it unprompted.**

---

## 9. Working with this user

- He corrects from memory of the actual game and **he has been right**. The selection bar
  came from him after two wrong answers from me. Treat his recollections as leads worth
  checking directly, not as things to politely absorb.
- He wants the provenance trail. Tag claims with their source and say plainly when
  something is a construction rather than a finding. The artifacts do this on-page and he
  has not pushed back on it.
- He reacts to *specifics*, not mood words. "Thwomps spurn home-run balls" lands;
  "evocative stadium theming" does not.
- Things he has explicitly liked: loading-screen tips ("so smart"), pushing video-game
  features into web screens, pennants as a device, the 48 team names and logos, per-stadium
  theming driven by the visualizer models, and the chemistry/anti-chemistry squiggles in
  their original design.
- Things he has explicitly rejected: invented logos, a shell mark, the burst used as
  decoration, thick outlines in clashing colours, a pennant template per team, and Team
  Stars as a site-wide theme.

## 10. The obvious next step

Nothing is in the codebase. The open question put to him, unanswered, was which to build
first: **the chemistry pages** on `/characters` (data is extracted, payoff largest) or
**the motion tokens** in `app/globals.css` (smaller, touches every page). He was also asked
whether to sweep for other 3-slice sets that may have been misread as standalone sprites.

Ask before writing code. He has steered every step of this so far.
