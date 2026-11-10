# Rio visual vocabulary — first proposal

Preview: `/design-v4/vocabulary.html`. This extends the current v3-based design work, with no application feature or navigation changes outside the v4 studies.

## Decisions made concrete

- Identity uses existing character portraits and team emblems at controlled optical sizes. No new enclosing badge template.
- Character classes are neutral text wordmarks. The original game uses text labels for Balance, Power, Speed and Technique; see `design-language-v3/research/dossier-ui-features.md` and `dossier-hud.md`. The new typography is a Rio proposal, not a copy of those sprites.
- All 14 abilities found in the original character records have new original pictograms. Shared glove, baseball, cleat and motion shapes connect the set. Ability names always accompany them. Use 32px or larger; text alone works for tighter rows.
- Four core attribute marks reuse that language: bat, pitched ball, cleat, glove. The specimen shows them at 64px and beside Mario's existing standard attribute values at 32px. Attribute magnitude stays in the number and bar, rather than in icon color or size.
- Ten play-result marks cover single, double, triple, home run, walk, strikeout, groundout, flyout, double play and caught stealing. Hit paths progress from home to first to second to third; path length distinguishes the outcomes without color. K is a generic strikeout, without a swinging/looking claim. Labels remain visible; GO/FO are descriptive display abbreviations, not a full scorekeeping notation system.
- The play log is explicitly illustrative, not data from a real game. It demonstrates 32px artwork beside text and scoring shorthand. This is not a complete taxonomy of every possible game event.
- Captain status uses a new C shield; Superstar uses a gold star; selection uses a neutral check and rim. These proposals keep status and UI state distinct.
- Chemistry uses the note/spiral family from Specimen 04. Those shapes and pink/purple hues retain their relationship meaning.
- Twelve everyday controls use a restrained 24px rounded-stroke family. Each gallery tile downloads its SVG, rather than pretending to execute the pictured action.
- Character-row examples use Mario/Yoshi class and captain fields from the study roster, with corrected ability assignments verified against the original character records. No statistics or features were invented for the samples.

## Reference limits

Ability and status artwork is newly designed, not recovered or verified as game UI. The ability descriptions describe the pictograms, not exact game mechanics. Glove imagery is shorthand for fielding; characters in the game need not wear a glove. The captain patch is a baseball-inspired proposal, not an official captain emblem. Superstar artwork does not imply a star meter or live star charge.

## Source and output

- `draw-vocabulary.py`: SVG geometry, manifest, board content and zip packaging.
- `draw-baseball-vocabulary.py`: four attribute and ten play-result SVGs, plus the stat/result specimens. Uses the same drawing primitives as the ability family.
- `vocabulary.css`: layout and specimen presentation.
- `vocabulary.js`: size and background preview controls.
- `assets/vocabulary/`: 42 SVGs and a kit with those SVGs plus the six chemistry SVGs (48 total).
- `vocabulary-roster-abilities.json`: all 54 ability masks and corrected names, decoded from original entry 7 records.
- `build.py`: rebuilds and publishes the board along with the other local studies.

Run `python3 design-language-v4/refinement/build.py` from the repo root. The generated board and assets publish under `public/design-v4/`. The zip includes a usage README and manifest. Standalone utility SVGs default to black; inline use inherits `currentColor`. Do not expect an external SVG image to inherit its parent's color.

## Review focus

The shared glove was redrawn after review: a broad tan leather silhouette, connected padded finger stalls, distinct thumb, woven web, recessed palm pocket and laced heel. It replaces the earlier white hand-like outline in Fielding, Clamber, Sliding Catch, Wall Splat, Super Catch, Groundout, Flyout and Caught Stealing. Super Catch places the ball in the new pocket. The source primitive updates all eight exports and the downloadable kit together.

Judge ability silhouettes at both 32px and 48px, with the dark/ivory preview controls. Review the C patch and gold star as proposals. Existing portraits, team emblems, class naming and the chemistry family anchor the new material in Mario Baseball.

The ability and result galleries each have independent size/background controls. Play-result marks are designed for 32px and above; use text below that size, especially for the more detailed tag and double-play illustrations. Attributes retain their names beside numeric stats.

## Inherited data issue discovered during visual QA

The existing v3/refinement `roster.json` ability labels are wrong and omit Wall Jump. This board uses a separate corrected ability mapping, leaving the original comparison artifacts intact. The original character record contains a big-endian u32 at `row * 0xA0 + 0x20`; decode it using `mssb-dtk/include/game/character_stats.h`, `FIELDING_ABILITIES`. Mario's mask `0xA` gives Wall Jump + Sliding Catch; Yoshi's `0x104` gives Clamber + Tongue Catch. The board build checks that the icon set covers all ability names in that corrected mapping. The older character-card specimen still needs a separate data correction; do not reuse its ability labels as authoritative.
