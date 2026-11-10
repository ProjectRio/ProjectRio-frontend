"""Rio design proposals. Ability pictograms are original, not recovered game UI."""
from pathlib import Path
from html import escape
import json
import zipfile
import runpy

root = Path(__file__).resolve().parent
out = root/'assets/vocabulary'
out.mkdir(exist_ok=True)
ink = '#24382e'
cream = '#f5edce'
gold = '#deb65e'

def path(d, fill=cream, stroke=ink, width=2.8):
    outline = ''
    if fill == 'none' and stroke in (gold, cream):
        outline = f'<path d="{d}" fill="none" stroke="{ink}" stroke-width="{width + 2.6}" stroke-linecap="round" stroke-linejoin="round"/>'
    return outline + f'<path d="{d}" fill="{fill}" stroke="{stroke}" stroke-width="{width}" stroke-linecap="round" stroke-linejoin="round"/>'

def ball(x, y, r=9):
    return f'<circle cx="{x}" cy="{y}" r="{r}" fill="{cream}" stroke="{ink}" stroke-width="2.5"/>' + path(f'M{x-r*.42} {y-r*.75} Q{x+r*.1} {y} {x-r*.42} {y+r*.75}', 'none', '#b15a48', 1.8)

def glove(transform=''):
    # A cupped leather glove: connected finger stalls, thumb, woven web and pocket.
    # Keep the outside contour broad enough to survive the compound 32px icons.
    return f'<g transform="{transform}">' + ''.join([
        path('M23 54 C14 49 8 39 7 29 C6 22 10 18 15 21 L22 28 L23 17 Q24 9 29 10 Q32 4 36 8 Q41 4 45 10 Q51 7 53 14 Q59 15 57 24 L54 39 Q51 51 41 56Z', '#ce9958'),
        path('M26 25 L28 13 Q31 8 34 11 L32 25 M36 25 L39 11 Q43 8 44 13 L41 27 M45 28 L48 15 Q52 12 53 17 L50 32', 'none', '#f0cb8a', 3.4),
        path('M34 10 L32 25 M43 11 L40 27 M52 16 L48 30', 'none', '#84562f', 1.9),
        path('M14 24 L25 16 L33 29 L24 37Z', '#65472b', '#8b5d32', 2),
        path('M18 23 L28 33 M23 20 L31 29 M19 30 L27 23', 'none', '#f2d294', 2),
        path('M25 34 C31 28 42 28 46 35 C50 43 42 51 33 49 C25 48 20 41 25 34Z', '#9d6839', '#84562f', 1.5),
        path('M12 25 C10 31 15 41 22 45 L26 40 Q20 31 15 25Z', '#e7b773', '#a06c39', 1.7),
        path('M25 48 Q33 53 43 49 L42 56 Q31 60 23 54Z', '#dca965', ink, 2.3),
        path('M27 52 L28 55 M33 53 L33 56 M39 52 L38 55', 'none', '#6b492b', 1.7),
    ]) + '</g>'

def shoe(transform=''):
    return f'<g transform="{transform}">' + path('M18 28 L31 27 L37 37 Q43 40 52 40 Q59 41 58 48 L13 48 Q9 40 18 28Z', '#c79750') + path('M13 48 H58 V54 H13Z') + path('M28 33 L34 32 M31 38 L38 36','none',cream,2.8) + '</g>'

art = {
 'clamber': path('M46 7 H59 V57 H46Z','#879e8e') + path('M46 20 H59 M46 34 H59 M46 47 H59','none',ink,2) + glove('translate(-3 -3) scale(.85)') + path('M7 51 V39 M3 43 L7 38 L11 43','none',gold,3),
 'wall-jump': path('M49 7 H59 V57 H49Z','#879e8e') + path('M49 21 H59 M49 36 H59 M49 49 H59','none',ink,2) + shoe('translate(9 -8) rotate(-35 30 40) scale(.72)') + path('M8 52 Q26 45 30 20 L18 9 M18 9 L18 18 M18 9 L27 9','none',gold,3),
 'super-jump': shoe('translate(4 -17) rotate(-12 30 40)') + path('M20 57 L27 43 M33 59 L40 45 M10 40 L10 19 M5 25 L10 18 L15 24','none',gold,3),
 'sliding-catch': glove('translate(7 20) rotate(52 24 24) scale(.64)') + ball(50,18,8) + path('M6 47 H17 M3 54 H26 M38 58 H55','none',gold,3),
 'wall-splat': path('M45 7 H58 V57 H45Z','#879e8e') + path('M45 21 H58 M45 37 H58','none',ink,2) + glove('translate(0 8) scale(.82 .85)') + path('M34 7 L38 12 M32 57 L38 52 M7 26 L13 29','none',gold,3),
 'ball-dash': shoe('translate(0 8) scale(.9)') + ball(44,17,10) + path('M5 20 H25 M9 28 H20 M3 38 H11','none',gold,3),
 'super-catch': glove('translate(-3 3) scale(.94)') + ball(30,38,8),
 'magical-catch': ball(34,35,13) + path('M14 6 L17 15 L26 18 L17 21 L14 30 L11 21 L3 18 L11 15Z',gold) + path('M50 33 L53 41 L61 44 L53 47 L50 55 L47 47 L39 44 L47 41Z',gold) + path('M51 10 L53 16 L59 18 L53 20 L51 26 L49 20 L43 18 L49 16Z',cream),
 'tongue-catch': path('M5 48 Q19 52 24 38 L29 23 Q34 10 45 16 Q56 20 50 31 Q47 36 39 34','none',ink,12) + path('M5 48 Q19 52 24 38 L29 23 Q34 10 45 16 Q56 20 50 31 Q47 36 39 34','none','#e89291',7) + ball(43,23,8),
 'suction': path('M6 31 L27 31 L43 16 Q49 33 43 50 L27 37 L6 37Z','#dd9690') + path('M43 16 Q35 33 43 50','none',ink,2.5) + ball(53,13,7) + path('M49 29 Q57 30 59 37 M49 38 Q55 41 55 47','none',gold,2.5),
 'laser': path('M5 48 L45 10 L56 20 L16 56 L26 39Z',gold) + path('M6 33 L22 18 M27 53 L43 37','none',cream,2.8) + ball(46,19,10),
 'quick-throw': path('M6 48 Q15 21 36 24 M11 54 Q25 32 44 36','none',gold,3.5) + path('M24 16 L34 24 L22 28','none',cream,3) + ball(47,18,11),
 'super-curve': path('M8 51 C61 60 61 18 32 18 Q17 18 17 31','none',ink,9) + path('M8 51 C61 60 61 18 32 18 Q17 18 17 31','none',gold,4.5) + ball(18,34,10),
 'body-check': path('M5 22 Q18 15 26 26 L25 48 L5 48Z',cream) + path('M59 22 Q46 15 38 26 L39 48 L59 48Z','#c79750') + path('M32 7 L28 20 L34 25 L29 37 L36 33 L32 57','none',gold,3.2),
}
labels = {key:key.replace('-', ' ').title() for key in art}
descriptions = {
 'clamber':'A glove reaching up a wall.', 'super-jump':'A raised cleat and upward motion.',
 'wall-jump':'A cleat pushing off the wall.',
 'sliding-catch':'A low glove reaching through a slide.', 'wall-splat':'A glove pressed against the wall.',
 'ball-dash':'A cleat, carried ball and trailing motion.', 'super-catch':'The ball held inside an open glove.',
 'magical-catch':'A baseball surrounded by sparks.', 'tongue-catch':'A curling tongue wrapping the ball.',
 'suction':'A flared mouth drawing in a baseball.', 'laser':'A baseball on a sharp, straight beam.',
 'quick-throw':'A quick release with two short trails.', 'super-curve':'A baseball following a deep hook.',
 'body-check':'Two shoulders meeting at impact.'
}

def save(key,label,body,viewbox='0 0 64 64'):
    (out/f'{key}.svg').write_text(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{viewbox}" role="img" aria-labelledby="title"><title id="title">{escape(label)}</title>{body}</svg>\n')

for key,body in art.items(): save(key,labels[key],body)
save('captain','Captain',path('M12 9 H52 V42 Q45 53 32 59 Q19 53 12 42Z','#d8bb72')+path('M17 14 H47 V40 Q42 48 32 53 Q22 48 17 40Z','#1c392c')+path('M39 24 Q33 19 26 24 Q20 29 23 37 Q27 44 39 38','none',cream,5))
star='M32 5 L40 22 L59 24 L45 38 L49 57 L32 48 L15 57 L19 38 L5 24 L24 22Z'
save('superstar','Superstar',path(star,'#f3cd5d')+path('M32 12 L37 25 L51 27 L40 36 L43 48 L32 42 L21 48 L23 36 L13 27 L27 25Z','#ffe795','none',0))

controls = {
 'search': '<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/>',
 'filter': '<path d="M4 6h16M7 12h10M10 18h4"/>',
 'sort': '<path d="M8 4v16m-4-4 4 4 4-4M15 5h5M15 10h4M15 15h2"/>',
 'compare': '<path d="M4 8h15l-4-4M20 16H5l4 4"/>',
 'expand': '<path d="M4 9V4h5M15 4h5v5M20 15v5h-5M9 20H4v-5"/>',
 'close': '<path d="m6 6 12 12M18 6 6 18"/>',
 'back': '<path d="m14 5-7 7 7 7"/>',
 'next': '<path d="m10 5 7 7-7 7"/>',
 'info': '<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7v.1"/>',
 'download': '<path d="M12 3v12m-4-4 4 4 4-4M4 16v5h16v-5"/>',
 'reset': '<path d="M4 10a8 8 0 1 1 1 7M4 4v6h6"/>',
 'check': '<path d="m5 12 4 4L19 6"/>',
}
for key,body in controls.items():
    # External-image assets default to dark ink; inline use inherits currentColor.
    save(key,key.title(),f'<g fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">{body}</g>','0 0 24 24')

def img(key,size=48,alt=''):
    return f'<img src="assets/vocabulary/{key}.svg" width="{size}" height="{size}" alt="{escape(alt)}">'

def portrait(name,size=48):
    return f'<img src="/images/Characters/{name}.png" width="{size}" height="{size}" alt="{name}">'

baseball_family = runpy.run_path(str(root/'draw-baseball-vocabulary.py'))['build_family'](path,ball,glove,shoe,save,img,root)

ability_cards=''.join(f'<a class="voc-ability" href="assets/vocabulary/{key}.svg" download><span class="voc-ability-art">{img(key)}</span><span><b>{labels[key]}</b><small>{descriptions[key]}</small></span><span class="voc-arrow" aria-hidden="true">↓</span><span class="voc-sr"> Download SVG</span></a>' for key in art)
class_cards=''.join(f'<div class="voc-class">{portrait(char,44)}<span><small>CHARACTER CLASS</small><b>{label}</b></span></div>' for label,char in [('Balance','Mario'),('Power','Bowser'),('Speed','Yoshi'),('Technique','Peach')])
utility_cards=''.join(f'<a class="voc-control" href="assets/vocabulary/{key}.svg" download><svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">{body}</g></svg><span>{key.title()}</span><span class="voc-sr"> Download SVG</span></a>' for key,body in controls.items())

body='''
<header class="top voc-header"><div class="wrap">
<span class="voc-kicker">PROJECT RIO / VISUAL VOCABULARY / DESIGN PROPOSAL</span>
<h1>Mario Baseball,<br>at a glance.</h1>
<p class="dek">Familiar faces. Expressive game symbols. Clear everyday controls. A shared set of marks for Mario Baseball, built on v3.</p>
<div class="voc-top-actions"><a class="voc-kit" href="assets/vocabulary/rio-vocabulary.zip" download>Download SVG kit ↓</a><a href="concepts.html?style=refined#specimen-4">Chemistry study ↗</a></div>
<nav class="study-jumps" aria-label="Vocabulary sections"><a href="#identity">Identity</a><a href="#classes">Classes</a><a href="#attributes">Attributes</a><a href="#abilities">Abilities</a><a href="#outcomes">Play outcomes</a><a href="#status">Status</a><a href="#controls">Controls</a><a href="#together">In context</a></nav>
</div></header>
<main>
<section id="identity"><div class="wrap">
<div class="chead"><span class="cnum">01 / IDENTITY</span><h2>Start with the faces we know.</h2></div>
<p class="intro">Portraits identify characters. Team emblems identify teams. Their original silhouettes carry the personality.</p>
<div class="voc-identity"><div class="voc-identity-group"><span class="voc-label">CHARACTERS / EXISTING ARTWORK</span><div class="voc-portraits">'''+''.join(portrait(n,56) for n in ['Mario','Luigi','Yoshi','Peach','Bowser','DK'])+'''</div><p>Consistent space around each portrait. No new colored badge behind every face.</p></div>
<div class="voc-identity-group"><span class="voc-label">TEAMS / EXISTING EMBLEMS</span><div class="voc-emblems">'''+''.join(f'<img src="/images/Teams/{n}.png" width="68" height="68" alt="{n}">' for n in ['Mario Fireballs','Yoshi Eggs','Bowser Monsters'])+'''</div><p>Keep each emblem’s outline. Team identity stays separate from character status.</p></div></div>
</div></section>
<section id="classes"><div class="wrap"><div class="chead"><span class="cnum">02 / CLASSES</span><h2>The name is the mark.</h2></div>
<p class="intro">Balance, Power, Speed, Technique. The game uses text labels; Rio keeps that directness, with a compact, slightly leaning wordmark.</p>
<div class="voc-classes">'''+class_cards+'''</div><p class="voc-caption">One neutral treatment across all four classes. The class name remains readable without a color key.</p>
</div></section>
<section id="abilities"><div class="wrap"><div class="chead"><span class="cnum">04 / ABILITIES</span><h2>Draw the action.</h2></div>
<p class="intro">Fourteen new pictograms for the existing abilities. Shared baseballs, gloves and motion strokes connect the set; the action gives each its silhouette.</p>
<div class="voc-gallery" data-ground="dark" data-size="48">
<div class="voc-gallery-toolbar"><span>ORIGINAL RIO PROPOSALS <small>Click a mark to download its SVG</small></span><div class="voc-tools"><div role="group" aria-label="Ability icon size"><button type="button" data-voc-size="32" aria-pressed="false">32px</button><button type="button" data-voc-size="48" aria-pressed="true">48px</button></div><div role="group" aria-label="Ability icon background"><button type="button" data-voc-ground="dark" aria-pressed="true">Dark</button><button type="button" data-voc-ground="light" aria-pressed="false">Ivory</button></div></div></div>
<div class="voc-abilities">'''+ability_cards+'''</div></div>
<p class="voc-caption">Names stay attached. These are new interface illustrations, not recovered game icons. At very small sizes, use the ability name on its own.</p>
</div></section>
<section id="status"><div class="wrap"><div class="chead"><span class="cnum">06 / STATUS</span><h2>Different meanings. Different marks.</h2></div>
<div class="voc-status-grid">
<article>'''+img('captain',60)+'''<h3>Captain</h3><p>A compact C patch. The letter carries the meaning; the shield gives it a baseball uniform character.</p><a href="assets/vocabulary/captain.svg" download>Captain SVG ↓</a></article>
<article>'''+img('superstar',60)+'''<h3>Superstar</h3><p>A warm gold star reserved for Superstar status. Standard characters use a plain text label.</p><a href="assets/vocabulary/superstar.svg" download>Superstar SVG ↓</a></article>
<article><div class="voc-selected-mark"><svg viewBox="0 0 24 24" width="30" height="30" aria-hidden="true"><path d="m5 12 4 4L19 6" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg></div><h3>Selected</h3><p>A neutral check and a clear rim. Selection stays distinct from character class, chemistry and star status.</p><span class="voc-label">INTERFACE STATE</span></article>
<article><div class="voc-relationship"><img src="assets/chemistry/chemistry.svg" width="56" height="56" alt="Chemistry"><img src="assets/chemistry/anti-chemistry.svg" width="56" height="56" alt="Anti-chemistry"></div><h3>Relationship</h3><p>Pink note for chemistry. Purple spiral for anti-chemistry. These symbols keep their specific meaning.</p><a href="concepts.html?style=refined#specimen-4">Open chemistry study ↗</a></article>
</div></div></section>
<section id="controls"><div class="wrap"><div class="chead"><span class="cnum">07 / CONTROLS</span><h2>A quieter supporting cast.</h2></div>
<p class="intro">Simple, rounded strokes for everyday actions. Neutral color, familiar shapes, and text wherever the meaning needs help.</p><div class="voc-controls">'''+utility_cards+'''</div><p class="voc-caption">24px artwork, 1.8px strokes. Interactive targets should be at least 44px. Each sample downloads its icon; it does not perform the pictured action.</p>
</div></section>
<section id="together"><div class="wrap"><div class="chead"><span class="cnum">08 / IN CONTEXT</span><h2>Let the pieces work together.</h2></div>
<p class="intro">Existing roster information, arranged as compact design samples. Portrait first, class second, abilities alongside their names.</p>
<div class="voc-context-grid">'''
roster=json.loads((root/'roster.json').read_text())
verified_abilities=json.loads((root/'vocabulary-roster-abilities.json').read_text())['characters']
assert set(labels.values()) == {a for c in verified_abilities.values() for a in c['abilities']}
for name in ['Mario','Yoshi']:
    c=next(c for c in roster['chars'] if c['n']==name)
    cls=['Balance','Power','Speed','Technique'][c['cls']]
    ab=''.join(f'<span>{img(a.lower().replace(" ","-"),32)}{a}</span>' for a in verified_abilities[str(c['id'])]['abilities'])
    partner='Luigi' if name=='Mario' else 'Birdo'
    body+=f'''<article class="voc-context"><div class="voc-context-head">{portrait(name,64)}<div><h3>{name}</h3><span class="voc-class-word">{cls}</span></div><span class="voc-captain-label">{img('captain',28)}Captain</span></div><div class="voc-context-abilities">{ab}</div><div class="voc-context-foot"><span><img src="assets/chemistry/chemistry-small.svg" width="24" height="24" alt="">Chemistry with {partner}</span><span>Standard</span></div></article>'''
body+='''</div><p class="voc-caption">Existing portraits and roster fields; ability assignments checked against the original character records. These are visual samples, not new product features.</p></div></section>
</main><footer class="wrap voc-footer"><p>Visual vocabulary / v4 proposal. Existing character and team artwork, new Rio ability and status illustrations, and the new chemistry family.</p><a href="assets/vocabulary/rio-vocabulary.zip" download>Download the complete SVG kit ↓</a></footer>'''
body=body.replace('<section id="abilities">',baseball_family['attribute_section']+'<section id="abilities">',1)
body=body.replace('<section id="status">',baseball_family['result_section']+'<section id="status">',1)
(root/'vocabulary-body.html').write_text(body)
manifest = {'attributes':baseball_family['attributes'],'results':baseball_family['results'],'abilities':labels,'status':['captain','superstar'],'controls':list(controls),'chemistry':['chemistry','anti-chemistry','chemistry-small','anti-chemistry-small','chemistry-mark','anti-chemistry-mark']}
(out/'manifest.json').write_text(json.dumps(manifest,indent=2)+'\n')
readme='''Project Rio visual vocabulary — v4 proposal

Original SVG ability and status illustrations; these are not extracted game icons.
Ability/status canvas: 64x64. Use abilities at 32px or above with visible names.
Attributes and results: 64x64. Use at 32px or above with labels; retain scoring
codes where useful. Below 32px use text. Single/double/triple encode advancement
through path length. Strikeout is a generic K; it does not encode swing/looking.
GO/FO are descriptive display labels, not a replacement for a scoring record.
Controls: 24x24, stroke 1.8, currentColor. Inline SVG inherits the text color;
an external image does not inherit its parent's color. Use visible labels or an
accessible name on the control. Give interactive elements at least a 44px target.
Chemistry: 128x128. Use -small badges at 16–24px and full badges at 32px+.

Captain C = captain status; gold star = Superstar status; check = UI selection.
Pink note / purple spiral are exclusively relationship indicators.
Classes remain text: Balance, Power, Speed, Technique. No color legend required.
Game portraits and team emblems remain existing assets and are not in this kit.

Use alt="" when the adjacent label already supplies the meaning. Otherwise label
the image. Do not rely on color alone. Keep pictograms static unless a specific
interaction needs feedback. New imagery is a design proposal awaiting review.
'''
(out/'README.txt').write_text(readme)
with zipfile.ZipFile(out/'rio-vocabulary.zip','w',zipfile.ZIP_DEFLATED) as bundle:
    for f in sorted(out.glob('*.svg')): bundle.write(f,'vocabulary/'+f.name)
    for f in sorted((root/'assets/chemistry').glob('*.svg')): bundle.write(f,'chemistry/'+f.name)
    bundle.writestr('README.txt',readme)
    bundle.write(out/'manifest.json','manifest.json')
print('Drew 4 attributes, 10 results, 14 abilities, 2 status marks and 12 controls; packaged 48 SVG assets.')
