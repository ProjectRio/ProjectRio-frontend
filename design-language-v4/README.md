# Project Rio — v3 refinement study (v4)

## Current direction

The user prefers v3 and has explicitly limited this work to design. The earlier
clubhouse/product direction is superseded. Do not use its new pages, product copy,
information architecture, cream palette, or feature suggestions as the brief.

The current deliverable is a refinement of the existing v3 language and its existing
component specimens. No new page concepts were added to this study.

Preview:

- `/v4` redirects to `/design-v4/index.html`.
- `/design-v4/index.html`: design language, based directly on v3's same document.
- `/design-v4/concepts.html`: v3 component specimens, with a new chemistry asset study in refined Specimen 04.
- `/design-v4/vocabulary.html`: visual vocabulary board with existing identity artwork, class labels, new ability/status pictograms, controls, and character-row samples. This is a design artifact, not a proposed application page.
- `/design-v4/layouts.html`: current layout and sizing study. Three shared compositions (roster rows, selected character, match summary), each rendered wide and narrow with identical content. Density and long-name controls are review tools. The same container-query styles handle both widths. Existing portrait/emblem assets are reused; newly drawn icons remain placeholders. Lineup order and match data are illustrative. No application features or v3 changes.
- The **V3 styling / Refinement** switch restores original specimens for comparison; the vocabulary board is a separate v4 proposal.
- **Original v3** links to the untouched original artifact copies.

## Design changes

- Retain the dark green ground, Lilita One, Barlow Condensed, IBM Plex Mono, Rio mark,
  banded loud treatment, continuous capsules, and neutral selection bar.
- Strengthen secondary text contrast and lightly warm the neutral panel rim.
- Establish a more consistent type hierarchy and spacing rhythm.
- Stage translucent panels on localized green surfaces so their construction reads.
- Replace the large reconstructed chemistry symbols with the recovered composite PNGs,
  and add 32 / 48 / 72 px scale specimens.
- Retain each existing team emblem's silhouette; show actual emblems in the team-identity
  specimen, without inventing a pennant template for each team.
- Put a small existing character portrait into v3's character-card specimen.
- Quiet the idle selection animation; preserve deliberate interaction feedback.
- Rebuild all seven stadium themes as two-dimensional web treatments grounded in field materials and hazards. The same
  illustrative stadium statistics page is shown in each theme.
  Original CSS/vector surfaces use game materials as reference only; no extracted
  stadium textures or rendered game images appear in the current theme specimen.
  Material is assigned deliberately to the outer frame, quiet panels, and small
  accents. The header and small hazard details carry the park identity without an overhead view. Optional ambient motion starts off. Website placement remains open.
  V3 styling restores the original stadium swatches.

These are design choices, not new findings about the original game's interface.
The chemistry images are flattened composites: the whole-token animation remains a
web approximation and does not reproduce the independent symbol layer animation.

## Sources and reproducibility

`refinement/build.py` reads the untouched `design-language-v3/pages/` sources and adds
only the design-study controls, styling layer, artwork specimens, and provenance notes.
It builds the two documents in `refinement/` and copies the preview to `public/design-v4/`.

Run from the repo root:

```sh
python3 design-language-v4/refinement/build.py
```

- Source styles: `refinement/refinement.css`
- Current statistics-page surfaces: `refinement/draw-stadium-chrome.py` generates
  header material strips and hazard marks. `web-stadiums.*` contains the design
  specimen and illustrative batting/pitching fixtures.
- Earlier field-illustration study: `/design-v4/stadium-field-study.html`.
- Field illustrations: `refinement/draw-fields.py` projects the local stadium geometry;
  `field-motifs.py` draws recognizable hazards. Original patterns and simplified markings
  replace the abstract corner decorations. Motion is opt-in and respects reduced motion.
- Earlier abstract web themes: `/design-v4/stadium-atmosphere-study.html`.
- Current stadium web themes: `refinement/web-stadiums.html`, `web-stadiums.css`,
  and `web-stadiums.js`. Theme selection is shareable with `?park=bowser` (or another
  theme key), with `#stadium-web-themes` targeting the comparison.
- Earlier image study: `/design-v4/stadium-image-study.html`, preserved as an alternate.
- Earlier 3D material experiment: `/v4/stadium-study`; its generated surfaces and
  collision-geometry mapping are exploratory and are not the current web direction.
  Existing visualizer files were not changed by these experiments.
- Stadium artwork: `refinement/assets/stadiums/`; provenance in `refinement/STADIUM-SOURCES.md`
- Comparison behavior: `refinement/refinement.js`
- Chemistry images: `design-language-v3/evidence/chem-chem-composite.png` and
  `chem-anti-composite.png`, copied into `refinement/assets/`
- Small portraits and team emblems: existing `public/images/` assets
- Roster, motion specimens, loading sprite, and research text: v3, retained
- Fonts: same Google Fonts stylesheet as v3

The inherited research prose is not a fresh verification. Consult v3's HANDOFF and
IDEAS ledger for subsequent corrections. The stadium specimen now includes original surface studies. The comparison
is not a pixel-identical copy of v3's document because both modes share the study
navigation and framing copy. The **Original v3** link provides that exact comparison.

## Earlier iteration

The first v4 product experiment is no longer the proposed direction. Its original
homepage source is preserved in `archive/first-pass-homepage.tsx.txt`. Its isolated
roster / ballpark / review routes and assets remain in the checkout for reversibility,
but are not linked from this design study. Existing non-v4 routes remain unchanged.
