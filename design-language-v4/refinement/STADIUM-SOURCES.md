# Stadium study sources

## Current statistics-page theme study

`web-stadiums.*` now shows a hypothetical stadium statistics page, with identical
illustrative numbers for theme comparison. The page does not load field diagrams,
geometry, extracted stadium textures, or rendered game backgrounds.

`draw-stadium-chrome.py` builds original repeatable surface strips and small hazard
marks, reusing the original vector definitions in `field-motifs.py`. Materials are
confined to the header and edging; numbers sit on quiet reading surfaces. The
Batting/Pitching switch changes local sample fixtures only. Ambient motion is off
by default and respects reduced motion. Table overflow is contained and labelled
on mobile, with character names pinned while scrolling.

The accepted overhead-field pass remains at `stadium-field-study.html` with its
own preserved `field-stadiums.css` and `field-stadiums.js`.

## Earlier field-led web themes

The current `web-stadiums.*` specimen uses flat, original SVG illustrations.
`draw-fields.py` projects the horizontal playing surfaces and boundary from
`public/stadiums/0.json` through `6.json`. It deliberately omits generic
out-of-bounds geometry, which cannot reliably identify a visual material.
Turf stripes, stone joints, sand grain, water marks, and enamel seams are newly
drawn patterns. Field markings are simplified. No extracted raster art is loaded
by this specimen.

`field-motifs.py` supplies newly drawn Thwomps, fiery Bubbles, Chain Chomps,
Piranha Plants, Note Blocks, barrels, a Klaptrap, and a star. They are enlarged
illustrative placements, not precise hazard coordinates. Toy Field targets are
a simplified composition, not a recovered panel map. The game’s loading tips
transcribed in the v3 language page (T79 #151–162) support the hazard identities;
the [original manual](https://www.gamingalexandria.com/gc/Mario%20Superstar%20Baseball/Mario%20Superstar%20Baseball%20-%20Clearscan.pdf) also describes the five initially available parks.

Hazard motion is opt-in and disabled by the reduced-motion preference. Mario
Stadium has no stadium hazard, so its motion control is disabled.

The earlier abstract web themes remain at `stadium-atmosphere-study.html`;
the image study below remains at `stadium-image-study.html`.

## Earlier image study


These local visual studies use recovered Mario Superstar Baseball artwork already
extracted during the v3 research. No new website placement or product flow is proposed.
V3's typography, translucent control surface, neutral selection frame, and Rio mark
remain the common interface language.

The six environment images are the game's stadium previews, entry 1746, 640×448.
Their soft resolution is original; these are reference compositions, not final
high-resolution website backgrounds. Toy Field instead combines its actual starfield
and blue floor textures in a new perspective composition.

| Theme | Preview texture | Material bank and texture IDs | Local material names |
| --- | --- | --- | --- |
| Mario Stadium | 065 | 8:11, 8:49 | mario-clay, mario-trim |
| Peach Garden | 066 | 17:41, 17:85 | peach-stone, peach-carpet |
| Wario Palace | 067 | 14:10, 14:33 | wario-sand, wario-banner |
| Yoshi Park | 068 | 15:1, 15:22 | yoshi-cloud, yoshi-wood |
| DK Jungle | 069 | 19:51, 19:42 | dk-wood, dk-carving |
| Bowser Castle | 070 | 11:31, 11:9 | bowser-arch, bowser-lava |
| Toy Field | 20:0 starfield | 20:4, 20:23 | toy-panel, toy-star |

Files live in `assets/stadiums/`. Environment images follow `<theme>-environment.png`.
Bowser's materials use entry 11, not the superseded entry 13 identification.
Yoshi's sky texture is blue; the preview's rendered lighting is lilac. The study
distinguishes those references rather than treating them as identical colors.

Interface palettes, crops, dimming, material framing, and control composition are new
design choices. The Atmosphere setting emphasizes the place; Quiet retains a faint
environment behind the proposed ground and surface colors. The 3D visualizer's
existing stadium theme values are not changed by this work.
