"""Original scalable redraws informed by the recovered entry-810 emote artwork."""
from pathlib import Path

root = Path(__file__).resolve().parent
assets = root / 'assets/chemistry'
assets.mkdir(exist_ok=True)

note = 'M45 87 L85 18 Q88 13 92 18 L110 59 C119 80 101 88 77 91 L76 84 C97 79 103 73 97 60 L88 38 L59 100 C53 111 30 118 20 109 C7 98 28 82 45 87Z'
burst = 'M65 9 L78 32 L108 19 L101 47 L122 61 L102 76 L111 104 L83 98 L67 121 L53 99 L24 112 L29 84 L8 70 L28 54 L18 24 L47 33Z'
spiral = 'M26 45 C48 29 99 30 109 45 C127 66 41 78 28 63 C11 44 88 52 98 67 C112 84 48 94 41 79 C34 64 81 71 85 84 C90 98 54 105 51 93 C48 83 76 89 73 100 Q71 107 61 113'

def svg(name, title, body):
    (assets / name).write_text(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" role="img" aria-labelledby="title"><title id="title">{title}</title>{body}</svg>\n')

note_shape = f'<path d="{note}" fill="#14151b" stroke="#fffaf3" stroke-width="5" stroke-linejoin="round" paint-order="stroke fill"/>'
swirl_shape = f'<path d="{spiral}" fill="none" stroke="#430658" stroke-width="6.4" stroke-linecap="round" stroke-linejoin="round"/>'
svg('chemistry.svg', 'Chemistry', f'''
<defs><linearGradient id="pink" x2=".3" y2="1"><stop stop-color="#fff1f7"/><stop offset="1" stop-color="#ffc5df"/></linearGradient></defs>
<path d="M69 21 C97 21 115 40 115 66 C115 95 94 115 65 115 C54 115 45 112 39 108 L23 117 L27 98 C17 89 14 78 15 65 C16 39 39 20 69 21Z" fill="url(#pink)" stroke="#f58bb4" stroke-width="4.5" stroke-linejoin="round"/>
<path d="M30 65 C31 43 49 32 69 32" fill="none" stroke="#fff9fc" stroke-width="4" stroke-linecap="round"/>
{note_shape}''')
svg('anti-chemistry.svg', 'Anti-chemistry', f'''
<defs><linearGradient id="lilac" x2=".3" y2="1"><stop stop-color="#f5eaff"/><stop offset="1" stop-color="#d6a5f7"/></linearGradient></defs>
<path d="{burst}" fill="url(#lilac)" stroke="#ad4ad6" stroke-width="4" stroke-linejoin="round"/>
<path d="M36 38 L50 44 L64 24 L73 42 L94 33" fill="none" stroke="#fcf6ff" stroke-width="3" stroke-linejoin="round" stroke-linecap="round" opacity=".85"/>
{swirl_shape}''')
svg('chemistry-mark.svg', 'Chemistry note', note_shape)
svg('anti-chemistry-mark.svg', 'Anti-chemistry spiral', f'<path d="{spiral}" fill="none" stroke="#fff5ff" stroke-width="11" stroke-linecap="round"/>{swirl_shape}')
# Small-size art omits highlights and opens up the spiral. Intended for 16–24px.
svg('chemistry-small.svg', 'Chemistry', f'<path d="M68 22 C97 22 115 42 115 68 C115 97 92 116 65 116 Q49 116 39 109 L22 118 L27 98 C9 78 14 51 31 36 Q46 22 68 22Z" fill="#ffdeef" stroke="#ff94b5" stroke-width="5" stroke-linejoin="round"/>{note_shape}')
svg('anti-chemistry-small.svg', 'Anti-chemistry', f'<path d="{burst}" fill="#e7ceff" stroke="#ad4ad6" stroke-width="5" stroke-linejoin="round"/><path d="M27 47 C54 29 104 33 109 49 C115 69 29 76 31 59 C33 44 97 61 96 75 C95 90 46 94 46 80 C46 69 82 82 78 95 Q74 106 60 111" fill="none" stroke="#430658" stroke-width="9" stroke-linecap="round"/>')

cards = []
for kind, heading, sub, description, partner in [
    ('chemistry', 'Chemistry', 'THE NOTE', 'A full, weighted notehead. A forward lean. The pink bubble sits behind the note, leaving its silhouette free.', 'Luigi'),
    ('anti-chemistry', 'Anti-chemistry', 'THE SPIRAL', 'Wide loops tighten into a downward twist. The lavender burst gives the negative state its own unmistakable outline.', 'Bowser'),
]:
    sizes = ''.join(f'<figure><img src="assets/chemistry/{kind}{"-small" if size < 32 else ""}.svg" width="{size}" height="{size}" alt=""><figcaption>{size}</figcaption></figure>' for size in [16,24,32,48])
    cards.append(f'''<article class="chem-card {kind}">
      <div class="chem-card-head"><div><span class="chem-eyebrow">{sub}</span><h3>{heading}</h3></div><a class="chem-download" href="assets/chemistry/{kind}.svg" download>SVG ↓<span class="chem-sr"> — {heading}</span></a></div>
      <div class="chem-stage"><img class="chem-hero" src="assets/chemistry/{kind}.svg" width="180" height="180" alt="{heading}: {'black musical note on a pink bubble' if kind == 'chemistry' else 'purple tapered spiral on a lavender burst'}"></div>
      <p class="chem-description">{description}</p>
      <div class="chem-sizes" aria-label="{heading} at 16, 24, 32 and 48 pixels">{sizes}<span>ACTUAL SIZE / PX</span></div>
      <div class="chem-use"><div class="chem-pair"><img src="/images/Characters/Mario.png" width="34" height="34" alt=""><img src="assets/chemistry/{kind}.svg" width="32" height="32" alt="{heading}"><img src="/images/Characters/{partner}.png" width="34" height="34" alt=""></div><span>Mario <span class="chem-pair-separator">/</span> {partner}</span><strong>{heading}</strong></div>
    </article>''')

marks = ''.join(f'<figure><img src="assets/chemistry/{kind}-mark.svg" width="48" height="48" alt="{label}"><figcaption>{label}</figcaption></figure>' for kind, label in [('chemistry','Note'),('anti-chemistry','Spiral')])
(root/'chemistry.html').write_text('''<div class="wrap v4-only chem-study">
  <div class="chead"><span class="cnum">Specimen 04</span><h2>Chemistry, with character.</h2></div>
  <p class="intro">Two recognizable Mario Baseball signals, redrawn for Rio. Bold silhouettes, the game’s pink and purple, and enough room for each mark to read.</p>
  <div class="chem-designs">''' + ''.join(cards) + '''</div>
  <div class="chem-utility">
    <div class="chem-utility-copy"><span class="chem-eyebrow">THE MARKS ON THEIR OWN</span><h3>Same character. Less framing.</h3><p>Use the complete badge for relationships. Use the isolated mark beside an explicit label when space is tight.</p><div class="chem-downloads"><a href="assets/chemistry/chemistry-mark.svg" download>Note SVG ↓</a><a href="assets/chemistry/anti-chemistry-mark.svg" download>Spiral SVG ↓</a></div></div>
    <div class="chem-ground dark" aria-label="Marks on dark green">''' + marks + '''</div><div class="chem-ground light" aria-label="Marks on ivory">''' + marks + '''</div>
  </div>
  <div class="chem-spec-footer"><p><b>Ready to use:</b> transparent SVGs, with simplified 16–24px versions. Color, silhouette and labels all distinguish the two states.</p><div class="chem-downloads"><a href="assets/chemistry/chemistry-small.svg" download>Small chem ↓</a><a href="assets/chemistry/anti-chemistry-small.svg" download>Small anti-chem ↓</a></div></div>
  <p class="src">Original vector redraws informed by the recovered chemistry emotes. The source game artwork remains in Language / Chemistry for reference.</p>
</div>''')
