# Project Rio fan site: typography and material research

Date: 2026-10-26. Scope: display, UI label, and numeric typefaces; multi-stroke lettering in CSS/SVG; warm enamel/felt/chalk/stitch textures.

## Method and confidence

- **Verified:** designer, license, and axes from `google/fonts` METADATA.pb files (GitHub) and Fontsource pages.
- **Not verified:** OpenType feature support (tnum) for most families. Google Fonts specimen pages render client-side and returned no text. Run the check below before relying on tabular figures.
- **Editorial judgment:** the cliche calls. The evidence is SEO listicles that repeat the same picks.
- **Untested:** the CSS/SVG snippets are built from documented properties. I did not render them. Test each in a browser before shipping.

Tabular-figure check (not run here; requires fontTools installed locally):

```bash
python3 -c "from fontTools.ttLib import TTFont; import sys; f=TTFont(sys.argv[1]); print(sorted({r.FeatureTag for r in f['GSUB'].table.FeatureList.FeatureRecord}))" path/to/Font.ttf
```

Look for `tnum` in the output.

## 1. Typefaces

### Verified facts

| Family | Designer (per metadata) | License | Axes | Notes |
|---|---|---|---|---|
| Lilita One | Juan Montoreano | OFL | none, one weight | DISPLAY category |
| Titan One | Rodrigo Fuenzalida | OFL | none, one weight | Fontsource: "a really fat display type with a happy and cheerful personality" |
| Bowlby One | Vernon Adams | OFL | none, one weight | Fontsource: "utilitarian, all caps display font" |
| Luckiest Guy | Vernon Adams | OFL | none | comic-style display |
| Sigmar One | Vernon Adams | OFL | none | heavy display |
| Chango | Fontstage | OFL | none | ultra-bold, slab-like (blog description) |
| Bungee | David Jonathan Ross | OFL | none | signage display |
| Baloo 2 | Ek Type | OFL | wght 400-800 | rounded |
| Fredoka | Milena Brandao, Hafontia | OFL | wdth 75-125, wght 300-700 | rounded |
| Archivo | Omnibus-Type (Hector Gatti credited on GitHub) | OFL | wdth 62-125, wght 100-900 | no tnum mentioned in README |
| Barlow Condensed | Jeremy Tribby | OFL | static, 9 weights | no tnum mentioned in README |
| Saira Condensed | Omnibus-Type | OFL | static, 100-900 | technical, squarish |
| Oswald | Vernon Adams, Kalapi Gajjar, Cyreal | OFL | wght 200-700 | tall condensed |
| JetBrains Mono | JetBrains et al. | OFL | wght 100-800 | monospace |
| IBM Plex Mono | Mike Abbink, Bold Monday | OFL | static | monospace |
| Mona Sans / Hubot Sans | GitHub | OFL | width axis (third-party says 75-125, unverified) | not on Google Fonts; GitHub repo |

### (a) Display face

1. **Lilita One, top pick.** Its heavy, rounded-squarish letterforms are the closest match in this set to the disc's team wordmarks. One weight is fine because the outline treatment supplies the weight. Caution: it is a popular casual-game face, so plain fill can read "mobile casual." Lean on the outline and tight tracking.
2. **Bowlby One, second.** The strongest athletic/jersey read, with a slightly roughened vintage feel. Caution: all-caps by design, and very wide, so long team names need size control. The roughness can tip into grunge.
3. **Titan One, third.** Heaviest and roundest, closer to bubble/kids type. Counters close up when outlined, so use it only for short accents.

Situational: **Chango** (ultra-heavy, slab-like) is a candidate for hero numerals. **Bungee** suits stacked, colorful lockups. **Sigmar One** reads as a generic game HUD. **Luckiest Guy** and **Baloo 2 / Fredoka** read as comic or kids-app type; avoid them for wordmarks.

Licensing note: none of these is Nintendo's lettering. Do not ship the lettering or textures extracted from the disc on a public site. Design "inspired by" using the open fonts above.

### (b) UI / label face

1. **Barlow Condensed, top pick.** Its squarish geometry with slightly softened corners is the closest match to the disc's labels. It has nine weights in one OFL family. Use 600-700 uppercase with 0.08-0.12em tracking. Caution: tnum is unverified, and Barlow is common in sports UI.
2. **Archivo (variable).** One file gives both a condensed cut for labels and a wider cut for body. Caution: tnum unverified.
3. **Saira Condensed.** Squarish and technical. Its sci-fi leaning brings it close to the cliche zone.

Also viable but generic: **Oswald** (tall condensed uppercase, widely used on sports sites). **Mona Sans / Hubot Sans** are good neutral modern options, but they are not on Google Fonts. Load them from the GitHub release or the npm package.

### (c) Numeric / tabular face

- Monospace families are tabular by construction. Verified for JetBrains Mono and IBM Plex Mono (both monospace categories).
- Inter's vendor page lists tabular numbers among its features, so it has tnum. Inter is the most generic UI face, so it is a safe but bland choice.

1. **IBM Plex Mono, top pick.** Fixed-width, so tables align guaranteed. OFL, and warmer than JetBrains Mono in my visual read (check the specimen). Caution: reads "dev tool," so use it only for numbers, not labels.
2. **JetBrains Mono, second.** Weight range 100-800 gives heavy scoreboard figures. Caution: strongly code-coded.
3. **Barlow or Archivo with tnum.** Use only if the fontTools check confirms `tnum`.

For the disc's heavy cream numerals, a display face with confirmed tnum (e.g., Chango or Lilita One) is the better fit than a mono.

### (d) LED / scoreboard face

Recommend against a segment or LED font as a default. It is the most common esports "scoreboard" cliche. If you need one scoreboard moment, draw a dot-matrix with CSS radial gradients (Section 3) rather than adding a font and its license checks.

### Cliche flags (client asked to avoid these)

- **Rajdhani:** the current site uses it. Gaming-font listicles recommend it repeatedly as the functional default, which makes it the most generic option here. Replace it.
- **Orbitron:** one listicle calls it the "unofficial standard for futuristic gaming logos." Flag it.
- **Exo / Exo 2:** a common sci-fi UI default. Flag it.
- **Michroma, Chakra Petch, Teko:** my own judgment, not researched beyond reputation. Teko is a condensed bold used by many esports brands, so it sits in the same class. Avoid all three.

### Recommended system

```css
:root {
  --font-display: "Lilita One", "Arial Black", sans-serif;
  --font-label: "Barlow Condensed", "Arial Narrow", sans-serif;
  --font-num: "IBM Plex Mono", ui-monospace, monospace;
}
.stat-label {
  font: 600 13px/1.2 var(--font-label);
  text-transform: uppercase;
  letter-spacing: 0.1em;
}
.stat-value {
  font: 500 15px/1.2 var(--font-num);
  font-variant-numeric: tabular-nums; /* maps to tnum; harmless if unsupported */
}
```

The project is Next.js, so load these with `next/font/google`. It self-hosts at build time and avoids a runtime request to Google.

## 2. Multi-stroke outlined lettering

Target stack, based on the disc: colored fill, then a thin white (or dark) inline ring, then a thick dark outer stroke.

### Approach A: `-webkit-text-stroke` + `paint-order`

The stroke is centered on the glyph outline. With `paint-order: stroke fill`, the fill covers the inner half, so the visible ring is half the stroke width, outside the letter. Set width to twice the outer ring you want.

```css
h2.outline {
  font-family: var(--font-display);
  color: #ffcc1a;
  -webkit-text-stroke: 10px #1b1b3a; /* about 5px visible, outside the glyph */
  paint-order: stroke fill;
  filter: drop-shadow(0 6px 0 #1b1b3a); /* hard offset shadow */
}
```

Limits: one ring only. You cannot get a white inline ring between fill and dark outline from a single stroke. Use this for H1/H2 without the full disc treatment.

### Approach B: stacked `text-shadow` rings

Zero-blur shadows at 8 offsets approximate a dilated glyph. Earlier shadows paint on top of later ones.

```css
.sticker {
  color: #ffcc1a;
  text-shadow:
    2px 0 0 #fff, -2px 0 0 #fff, 0 2px 0 #fff, 0 -2px 0 #fff,
    1.4px 1.4px 0 #fff, -1.4px 1.4px 0 #fff, 1.4px -1.4px 0 #fff, -1.4px -1.4px 0 #fff,
    5px 0 0 #1b1b3a, -5px 0 0 #1b1b3a, 0 5px 0 #1b1b3a, 0 -5px 0 #1b1b3a,
    3.5px 3.5px 0 #1b1b3a, -3.5px 3.5px 0 #1b1b3a, 3.5px -3.5px 0 #1b1b3a, -3.5px -3.5px 0 #1b1b3a,
    0 8px 0 #1b1b3a;
}
```

Limits: you get multiple rings, but jagged edges at larger offsets. The shadows sit under the fill, so a transparent or gradient fill breaks it. Each shadow is a paint, so 17 shadows on a list of rows will hurt. Headings only.

### Approach C: SVG `<use>` stack (recommended for wordmarks)

Draw the same text three times in layers: thick dark stroke, medium white stroke, solid fill on top. `stroke-linejoin="round"` avoids spiky joins. Arched lettering uses `<textPath>`.

```html
<svg viewBox="0 0 600 140" role="img" aria-label="Mario Sunshines">
  <defs>
    <text id="wm" x="300" y="100" text-anchor="middle"
          font-family="Lilita One" font-size="96">Mario Sunshines</text>
  </defs>
  <use href="#wm" fill="none" stroke="#1b1b3a" stroke-width="22" stroke-linejoin="round"/>
  <use href="#wm" fill="none" stroke="#ffffff" stroke-width="10" stroke-linejoin="round"/>
  <use href="#wm" fill="#ffcc1a"/>
</svg>
```

Stroke widths: 22 gives an 11px dark ring outside, and 10 gives a 5px white ring outside, under the fill. Verify the font loads inside the SVG, since it inherits page @font-face.

### Approach D: duplicated `content: attr(data-text)` pseudo-elements

Works, but screen readers can read the duplicated text. Avoid it.

### Comparison

| Approach | Rings | Edge quality | Accessibility | Selection | Cost | Mobile |
|---|---|---|---|---|---|---|
| A. stroke + paint-order | 1 | smooth | text stays real text | good | low | good |
| B. stacked text-shadow | many | jagged at large offsets | text stays real text | good | high with many shadows | heavy in lists |
| C. SVG `<use>` stack | many | smooth | `role="img"` + `aria-label` hides children | weaker | low when static | good |
| D. pseudo-element duplicate | many | varies | duplicated text read aloud | varies | medium | varies |

### Ship

- **Team wordmarks (144):** Approach C as a static SVG component per team, one inline SVG each, lazy-rendered. Cheap and crisp.
- **Page headings:** Approach A with a `filter: drop-shadow` for the hard offset. Keep text as real text.
- **Never:** stacked `text-shadow` on table cells or list rows.

Browser notes: MDN lists `-webkit-text-stroke` as widely available and `paint-order` as Baseline. Older reports of Chrome ignoring `paint-order` on HTML text predate that. Retest on current Chrome and Safari.

## 3. Material and texture techniques

### 3.1 Halftone and dot grid (pure CSS)

A static `radial-gradient` tile repeats cheaply. A true halftone needs a threshold, which CSS approximates with a very high `contrast()`.

```css
.dots {
  background-image: radial-gradient(circle, rgba(27,27,58,.18) 1.2px, transparent 1.6px);
  background-size: 8px 8px;
}
```

For a threshold halftone, see leanrada.com and master.dev (below). Degrades: fine on mobile when static. Avoid `background-attachment: fixed`, which iOS ignores and which forces repaints. In dark mode, flip the dot color through a token.

### 3.2 Paper / canvas grain (SVG feTurbulence)

Put the noise in a data-URI tile and layer it as an overlay. Keep `numOctaves` at 3 or below, per the sources.

```css
.grain::after {
  content: "";
  position: absolute; inset: 0;
  pointer-events: none;
  background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='3' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 .5 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>");
  opacity: .12;
  mix-blend-mode: multiply;
}
```

Degrades: `mix-blend-mode` and a `position: fixed` full-page overlay are costly on mid-range Android and during scroll. Scope the grain to sections and shrink or hide it under 640px. In dark mode use a light grain (`fill` white, `mix-blend-mode: screen`) at lower opacity.

### 3.3 Felt pennant texture (untested construction)

Fibrous noise lit with a distant light, multiplied into the pennant color.

```svg
<filter id="felt" x="0" y="0" width="100%" height="100%">
  <feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" seed="4" result="noise"/>
  <feDiffuseLighting in="noise" lighting-color="#fff" surfaceScale="1.5" result="lit">
    <feDistantLight azimuth="235" elevation="60"/>
  </feDiffuseLighting>
  <feBlend in="SourceGraphic" in2="lit" mode="multiply"/>
</filter>
```

Apply with `filter="url(#felt)"` to a pennant path. `feDiffuseLighting` treats alpha as a bump map (MDN). Degrades: feDiffuseLighting is expensive on large areas, so apply it to small SVGs, or bake to a tile.

### 3.4 Enamel pin gloss

Layer a soft-light highlight over a beveled base. Drive the highlight position from pointer coordinates only on pointer devices.

```css
.pin {
  position: relative;
  background: linear-gradient(180deg, #ff5a4e, #c8281f);
  border-radius: 14px;
  overflow: hidden;
  box-shadow:
    inset 0 2px 0 rgba(255,255,255,.55),  /* top bevel */
    inset 0 -3px 0 rgba(0,0,0,.25),       /* bottom bevel */
    0 3px 0 #7a1510,                      /* hard plastic edge */
    0 6px 10px rgba(0,0,0,.25);           /* soft lift */
}
.pin::before {
  content: ""; position: absolute; inset: 0; pointer-events: none;
  background: radial-gradient(circle at var(--gx, 30%) var(--gy, 20%),
              rgba(255,255,255,.7), transparent 45%);
  mix-blend-mode: soft-light;
}
```

Set `--gx` and `--gy` from `pointermove`. Skip the script on touch and under `prefers-reduced-motion`. Degrades: on dark backgrounds the soft-light highlight disappears, so pair it with a lighter base.

### 3.5 Chalk and infield dirt (SVG noise thresholding)

Dirt is low-frequency mottling. Chalk is high-frequency grain with the alpha thresholded hard. The threshold uses a linear alpha transfer with a steep slope.

```svg
<filter id="chalk">
  <feTurbulence type="fractalNoise" baseFrequency=".8" numOctaves="2" seed="3" result="t"/>
  <feColorMatrix in="t" type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 -1 1" result="a"/>
  <feComponentTransfer in="a">
    <feFuncA type="linear" slope="20" intercept="-9"/>
  </feComponentTransfer>
  <feComposite in2="SourceGraphic" operator="in"/>
</filter>
```

Degrades: not tested. Expect it to be heavy if applied to large text.

### 3.6 Stitched seams (SVG dasharray)

Stitches are short dashes along a curve, which gradients cannot draw. Use a dashed path.

```svg
<path d="M10 50 C 40 10, 60 90, 90 50" fill="none" stroke="#c22"
      stroke-width="2" stroke-linecap="round" stroke-dasharray="3 4"/>
```

Degrades: none significant. Scales with SVG.

### 3.7 Scoreboard panel bevel

```css
.scoreboard-panel {
  background:
    linear-gradient(180deg, rgba(255,255,255,.08), transparent 40%),
    #0d1b2a;
  border: 3px solid #2b2b2b;
  border-radius: 10px;
  box-shadow:
    inset 0 0 0 2px #444,
    inset 0 3px 6px rgba(0,0,0,.6),
    0 4px 0 #1a1a1a;
}
```

Degrades: none significant. Dark-mode friendly by nature; in light mode, invert the gradient.

## 4. Degradation matrix

| Technique | Mobile | Dark mode | Light mode |
|---|---|---|---|
| Halftone radial-gradient | good | flip dot color | good |
| feTurbulence grain (scoped) | fine if scoped, bad as fixed overlay | use light grain | good |
| Felt feDiffuseLighting | costly on large areas | ok | ok |
| Enamel gloss (pointer) | disable on touch | highlight weak | strong |
| Chalk threshold | heavy on large text | ok | ok |
| SVG stitches | good | good | good |
| Scoreboard bevel | good | good | ok |
| text-shadow stack | bad in lists | ok | ok |

## 5. Sources

- MDN paint-order: https://developer.mozilla.org/en-US/docs/Web/CSS/paint-order
- MDN -webkit-text-stroke: https://developer.mozilla.org/en-US/docs/Web/CSS/-webkit-text-stroke
- MDN font-variant-numeric: https://developer.mozilla.org/docs/Web/CSS/font-variant-numeric
- MDN feDiffuseLighting: https://developer.mozilla.org/en-US/docs/Web/SVG/Element/feDiffuseLighting
- WebKit text-stroke: https://webkit.org/?p=85
- CSS-Tricks, paint-order on HTML text: https://css-tricks.com/?p=251936
- O'Reilly, SVG paint-order outlines: https://oreilly.com/content/elegant-outlines-with-svg-paint-order
- Stefan Judis, paint-order TIL: https://stefanjudis.com/today-i-learned/paint-order-of-svg-elements-is-configurable/
- Ashley Nolan, text-shadow: https://ashleynolan.co.uk/blog/playing-around-with-css-text-shadow
- Google Fonts metadata (GitHub): https://github.com/google/fonts/tree/main/ofl
- Fontsource Lilita One: https://fontsource.org/fonts/lilita-one
- Fontsource Titan One: https://fontsource.org/fonts/titan-one
- Fontsource Bowlby One: https://fontsource.org/fonts/bowlby-one
- Archivo repo: https://github.com/Omnibus-Type/Archivo
- Barlow repo: https://github.com/jpt/barlow
- Inter: https://rsms.me/inter/
- GitHub Mona Sans: https://github.com/github/mona-sans
- GitHub blog, Mona and Hubot Sans: https://github.blog/2022-12-02-introducing-mona-sans-and-hubot-sans/
- Leanrada, pure CSS halftone: https://leanrada.com/notes/pure-css-halftone/
- Master.dev, halftone in 3 declarations: https://master.dev/blog/pure-css-halftone-effect-in-3-declarations/
- CSS-IRL halftone patterns: https://css-irl.info/css-halftone-patterns/
- freeCodeCamp, grainy backgrounds with SVG filters: https://www.freecodecamp.org/news/grainy-css-backgrounds-using-svg-filters/
- Cloud Four, SVG noise: https://cloudfour.com/?p=6282
- CSS-Tricks, noise backgrounds: https://css-tricks.com/?p=351302
- Gaming font listicles (cliche evidence): https://madegooddesigns.com/best-gaming-fonts/ and https://fontalternatives.com/best-fonts-for/gaming/
