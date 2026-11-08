---
name: project-rio-design
description: Use this skill to generate well-branded interfaces and assets for Project Rio (competitive Mario Superstar Baseball — ranked ladders, live games, player/character stat tracking, and stream tools), either for production or throwaway prototypes/mocks/etc. Contains essential design guidelines, colors, type, fonts, assets, and UI kit components for prototyping.
user-invocable: true
---

Read the `readme.md` file within this skill, and explore the other available files.

If creating visual artifacts (slides, mocks, throwaway prototypes, etc), copy assets out and create static HTML files for the user to view. If working on production code, you can copy assets and read the rules here to become an expert in designing with this brand.

If the user invokes this skill without any other guidance, ask them what they want to build or design, ask some questions, and act as an expert designer who outputs HTML artifacts _or_ production code, depending on the need.

## Quick map
- `readme.md` — full brand guide: content voice, visual foundations, iconography, file index, caveats.
- `styles.css` → `tokens/*.css` — link `styles.css` for the complete token set and the `.panel` / `.btn-primary` / `.btn-secondary` / `.stat-table` / `.input` / `.kicker` / `.label` utility classes.
- `assets/` — the pixel mushroom logo, character sprites, icons, and mushroom-pattern backgrounds. Copy what you need; keep `image-rendering: pixelated`.
- `components/` — React primitives (Button, Badge, TierBadge, Panel, Input, Avatar, LiveDot, PageHeader, StatTable, LadderTable, GameScoreCard).
- `ui_kits/web/` — an interactive site recreation to lift screen layouts from.
- `templates/web-page/` — a ready scaffold (nav + hero + grid).

## Non-negotiables
- Dark "night" backgrounds; **Rio red `#e60012`** as the only brand accent (buttons, links, active states).
- Display type **Rajdhani UPPERCASE** with wide tracking; body **Inter**; **tabular-nums** for all stats/scores.
- Buttons use the **angled clip-path** (never rounded); cards are 12px panels with 1px night borders and a red glow on hover.
- Pixel sprites + ★/✪ glyphs for iconography. **No emoji.** Keep the "fan project, not affiliated with Nintendo" disclaimer in footers.
