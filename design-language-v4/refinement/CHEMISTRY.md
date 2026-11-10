# Chemistry marks

Specimen 04 in `concepts.html` now presents reusable chemistry assets. The earlier live strip is retained under the V3 styling toggle. V3 source files are unchanged.

## Assets

All six files live in `assets/chemistry/` and publish to `/design-v4/assets/chemistry/`. They are transparent, self-contained SVGs with a shared 128 × 128 viewBox, no font dependencies, and accessible titles.

| File | Use |
| --- | --- |
| chemistry.svg | Complete note and pink bubble; 32px and above |
| anti-chemistry.svg | Complete spiral and purple burst; 32px and above |
| chemistry-small.svg | Flat, simplified chemistry badge; 16–24px |
| anti-chemistry-small.svg | Fewer, thicker spiral loops; 16–24px |
| chemistry-mark.svg | Isolated note beside a chemistry label |
| anti-chemistry-mark.svg | Isolated spiral beside an anti-chemistry label |

Use both shape and color to convey the state. Keep visible labels where possible. When an adjacent label already names the state, use an empty image alt to avoid repetition. Otherwise use `alt="Chemistry"` or `alt="Anti-chemistry"`. Preserve square dimensions; the artwork includes its own optical spacing. These are discrete relationship states, not values on a color gradient. No neutral badge is introduced.

## Reference and authorship

These are new vector redraws, not embedded game textures or a traced raster export. They use the shapes and palette visible in `assets/good-chemistry.png` and `assets/anti-chemistry.png`, recovered from the entry-810 emote art. Research is in `design-language-v3/research/dossier-chemistry.md`, section 7.4. The original recovered images remain available in the Language chemistry study.

The note keeps the full oval head, forward diagonal stem, curved flag and pale outline. Its pink bubble has a small lower-left tail. Anti-chemistry keeps a tapered spiral over an irregular lavender burst. The standalone spiral has a pale keyline to work on dark surfaces. Colors include source pink #FFDEEF / #FF94B5 and lavender #E7CEFF / #AD4AD6; the violet ink is adjusted slightly for the vector redraw.

## Rebuild

Edit `draw-chemistry.py` for the SVGs and specimen markup, and `chemistry.css` for presentation. Run `python3 design-language-v4/refinement/build.py` from the repository root. Do not edit the generated `concepts.html` directly.
