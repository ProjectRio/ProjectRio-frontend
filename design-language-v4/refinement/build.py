"""Rebuild the design-only v4 studies from untouched v3 sources."""
from pathlib import Path
import re
import shutil
import runpy

repo = Path(__file__).resolve().parents[2]
out = Path(__file__).resolve().parent
source = repo / 'design-language-v3/pages'
runpy.run_path(str(out/'draw-fields.py'))
runpy.run_path(str(out/'draw-stadium-chrome.py'))
runpy.run_path(str(out/'hazard-illustrations.py'))
runpy.run_path(str(out/'draw-stadium-materials.py'))
runpy.run_path(str(out/'draw-chemistry.py'))
runpy.run_path(str(out/'draw-vocabulary.py'))
runpy.run_path(str(out/'build-layouts.py'))
for name in ('index.html', 'concepts.html'):
    html = (source / name).read_text()
    html = html.replace('section > .wrap{', 'section > .wrap,section > .v3-only > .wrap{')
    component = name == 'concepts.html'
    html = html.replace('<html lang="en">', '<html lang="en" data-theme="dark" data-refinement="refined">')
    html = re.sub(r'<title>.*?</title>', '<title>Project Rio · V3 refinement study</title>', html, count=1)
    html = html.replace('</head>', '<link rel="stylesheet" href="refinement.css">\n<link rel="stylesheet" href="stadiums.css">\n<link rel="stylesheet" href="web-stadiums.css">\n<link rel="stylesheet" href="chemistry.css">\n</head>')
    toolbar = '''
<div class="study-bar"><div class="study-bar-inner">
  <div class="study-title"><b>PROJECT RIO / V4 REFINEMENT</b><span>V3 language · design specimens only</span></div>
  <div class="study-switch" role="group" aria-label="Compare styling">
    <button type="button" data-style="original" aria-pressed="false">V3 styling</button>
    <button type="button" data-style="refined" aria-pressed="true">Refinement</button>
  </div>
  <nav class="study-links" aria-label="Design studies">
    <a href="index.html" STUDY_LANGUAGE>Language</a><a href="concepts.html" STUDY_COMPONENT>Components</a>
    <a href="vocabulary.html">Vocabulary</a><a href="layouts.html">Layouts</a><a href="/design-v3/PAGE_NAME">Original v3 ↗</a>
  </nav>
</div></div>'''.replace('PAGE_NAME', name).replace('STUDY_LANGUAGE', '' if component else 'aria-current="page"').replace('STUDY_COMPONENT', 'aria-current="page"' if component else '')
    html = html.replace('<body>', '<body>\n' + toolbar)
    html = html.replace('design language v3 · measured off GYQE01', 'design refinement v4 · built on v3')
    if component:
        html = re.sub(r'<h1>.*?</h1>', '<h1>Component<br>refinements</h1>', html, count=1, flags=re.S)
        html = html.replace('seven concepts · built from the ideas board', 'v3 component specimens · design refinement v4')
        html = re.sub(r'<p class="dek">.*?</p>', '<p class="dek">V3’s typography and green chrome, refined for Project Rio. Explore the component studies, reusable chemistry marks, and stadium materials. Switch to <b>V3 styling</b> to compare the original specimens.</p>', html, count=1, flags=re.S)
        html = html.replace('<h3 id="cName" style="margin-bottom:12px">Mario</h3>', '<div class="character-heading"><img class="v4-only" id="cPortrait" src="/images/Characters/Mario.png" alt=""><div><span class="v4-only">Character specimen / base attributes</span><h3 id="cName" style="margin-bottom:12px">Mario</h3></div></div>')
        # Keep v3\'s data and behavior unchanged, adding only a small existing portrait.
        keys = re.findall(r"'\d+': '([^']+)'", (repo/'lib/data/characters.ts').read_text().split('export type CharacterClass')[0])
        import json
        # Match the printed v3 color names; leave the original roster untouched.
        keys[12], keys[42] = 'Koopa(R)', 'Koopa(G)'
        html = html.replace("document.getElementById('cName').textContent=c.n;", "document.getElementById('cName').textContent=c.n;\n    document.getElementById('cPortrait').src='/images/Characters/'+" + json.dumps(keys) + "[k]+'.png';")
        # Existing evidence tags belong in captions, with consistent typographic weight.
        html = html.replace('Concept 0', 'Specimen 0')
        def chemistry_section(match):
            section = match.group(0)
            if '<h2>The live strip</h2>' not in section:
                return section
            original = section.removeprefix('<section>').removesuffix('</section>')
            return '<section><div class="v3-only">' + original + '</div>' + (out/'chemistry.html').read_text() + '</section>'
        html = re.sub(r'<section>.*?</section>', chemistry_section, html, flags=re.S)
        html = html.replace('Concept 4 arranges real HUD elements into a layout the game never uses.', 'The original Concept 4 arranges HUD elements into a proposed strip. Refined Specimen 04 now presents new chemistry vector assets informed by the recovered emote artwork.')
    else:
        html = re.sub(r'<p class="dek">.*?</p>', '<p class="dek">A closer fit to <b>Mario Superstar Baseball and Project Rio</b>, within v3’s own language. The dark green ground, rounded type, translucent chrome, banded color, and chemistry symbols stay. The refinement is in their proportions, contrast, and use of the actual artwork.</p>', html, count=1, flags=re.S)
        for kind, alt, file in [('good','Good chemistry','good-chemistry.png'), ('bad','Anti-chemistry','anti-chemistry.png')]:
            target = f'<div class="emote e-{kind}">'
            html = html.replace(target, target + f'<img class="extracted-emote" src="assets/{file}" alt="{alt}">')
        # Original reconstruction remains visible in V3 mode; refined motion is explicitly an approximation.
        html = re.sub(r'<div class="curve">(.*?)</div>', r'<div class="curve v3-only">\1</div><div class="curve v4-only">Recovered composite artwork.<br>Whole-token motion study; layer motion is not reproduced.</div>', html, flags=re.S)
        for heading, file in [('Good · it pops and squashes','good-chemistry.png'), ('Anti · it shudders','anti-chemistry.png')]:
            scale = '<div class="token-scale v4-only" aria-label="Symbol size specimens">' + ''.join(f'<figure><img src="assets/{file}" alt="" width="{size}" height="{size}"><figcaption>{size}px</figcaption></figure>' for size in (32,48,72)) + '</div>'
            html = html.replace(f'<h3>{heading}</h3>', f'<h3>{heading}</h3>'+scale)
        # These two inherited paragraphs describe only the SVG reconstructions.
        html = html.replace('<b>The asymmetry does the semantic work.</b>', '<b>The asymmetry does the semantic work.</b> <span class="v4-only">The refined preview uses recovered composite images with a whole-token motion approximation; the following timing notes describe v3’s reconstruction.</span>')
        html = html.replace('<b>Not verified in motion.</b>', '<b>Not verified in motion.</b> <span class="v4-only">V4 replaces the drawn outlines in the large specimens with the recovered static composite images. </span>')
        team_plate = '<div class="team-specimen v4-only" aria-label="Existing team emblem specimens">'
        for team in ('Mario Fireballs','Yoshi Eggs','Bowser Monsters'):
            team_plate += f'<figure><img src="/images/Teams/{team}.png" alt=""><figcaption>{team}<span>EXISTING IN-GAME EMBLEM / NATURAL SILHOUETTE</span></figcaption></figure>'
        team_plate += '</div>'
        html = html.replace('<div class="chrome pennwrap"', team_plate+'\n<div class="chrome pennwrap"',1)
    # Replace only the stadium specimen in refined mode; V3 remains available.
    def stadium_section(match):
        section = match.group(0)
        if 'A park is a material and a hazard' in section or 'A material and a hazard, then a colour' in section:
            original = section.removeprefix('<section>').removesuffix('</section>')
            return '<section><div class="v3-only">' + original + '</div>' + (out/'web-stadiums.html').read_text() + '</section>'
        return section
    html = re.sub(r'<section>.*?</section>', stadium_section, html, flags=re.S)
    headings = re.findall(r'<h2[^>]*>(.*?)</h2>', html)
    section_index = [0]
    def add_anchor(match):
        section_index[0] += 1
        return f'<section id="specimen-{section_index[0]}">'
    html = re.sub(r'<section>', add_anchor, html)
    labels = ['Menu & motion','Character card','Chemistry','Chem & anti-chem','Records table','Materials','Banners'] if component else ['Registers','Chemistry','Materials','Chrome','Loading','Team identity','Typography','Keep / change']
    jumps = '<nav class="study-jumps" aria-label="Jump to specimen">'+''.join(f'<a href="#specimen-{i+1}">{label}</a>' for i,label in enumerate(labels))+'</nav>'
    header_end = html.index('</header>')
    before = html[:header_end]
    insert = before.rfind('  </div>')
    html = before[:insert]+jumps+'\n'+before[insert:]+html[header_end:]
    notes = '''<aside class="study-notes"><div class="wrap"><h2>Refinement, not a new direction.</h2><ul>
<li><b>Same type family.</b> Lilita stays expressive; condensed labels and monospace values do the quieter work. Tighter heading rhythm, more readable secondary text.</li>
<li><b>More legible chrome.</b> A slightly warmer neutral rim and clearer green staging help the translucent surfaces read. No colored card rails or new decorative border system.</li>
<li><b>Use the original shapes.</b> The chemistry composites and team emblems provide the distinctive outlines. They replace approximations, not the underlying design language.</li>
<li><b>Keep the game’s proportions.</b> Compact continuous gauges, small portraits, a calm selection bar, and disciplined spacing. No full-page character collage or new product features.</li>
</ul><p class="src">V4 is a design proposal. Original research prose and specimen interactions are retained from v3; they are not newly verified findings. Chemistry composites: v3/evidence. Emblems and portraits: existing frontend assets. Motion remains a web approximation.</p></div></aside>'''
    html = html.replace('<footer>',notes+'\n<footer>',1)
    html = html.replace('</body>', '<script src="refinement.js"></script>\n<script src="stadiums.js"></script>\n<script src="animated-stadiums.js"></script>\n<script src="web-stadiums.js"></script>\n</body>')
    (out/name).write_text(html)
# A dedicated design inventory; no application routes or features are introduced.
base = (out/'concepts.html').read_text()
head = base.split('<body>')[0].replace('<title>Project Rio · V3 refinement study</title>', '<title>Project Rio · Visual vocabulary</title>')
head = head.replace('</head>', '<link rel="stylesheet" href="vocabulary.css">\n</head>')
vocabulary_nav = '''<div class="study-bar"><div class="study-bar-inner"><div class="study-title"><b>PROJECT RIO / V4 REFINEMENT</b><span>Visual vocabulary · design proposal</span></div><nav class="study-links" aria-label="Design studies"><a href="index.html">Language</a><a href="concepts.html">Components</a><a href="vocabulary.html" aria-current="page">Vocabulary</a><a href="/design-v3/concepts.html">Original v3 ↗</a></nav></div></div>'''
(out/'vocabulary.html').write_text(head+'<body class="voc-page">'+vocabulary_nav+(out/'vocabulary-body.html').read_text()+'<script src="vocabulary.js"></script></body></html>')
(out/'vocabulary.html').write_text((out/'vocabulary.html').read_text().replace('<a href="/design-v3/concepts.html">', '<a href="layouts.html">Layouts</a><a href="/design-v3/concepts.html">'))
# Public files are a reproducible preview, not a separate source of truth.
public = repo/'public/design-v4'
public.mkdir(exist_ok=True)
for name in ('layouts.html', 'layouts.css', 'layouts.js'):
    shutil.copy2(out/name, public/name)
for name in ('index.html','concepts.html','vocabulary.html','vocabulary.css','vocabulary.js','refinement.css','refinement.js','chemistry.css','stadiums.css','stadiums.js','animated-stadiums.js','web-stadiums.css','web-stadiums.js','atmosphere-stadiums.css','atmosphere-stadiums.js','field-stadiums.css','field-stadiums.js','stats-first-pass.css','stats-first-pass.js','RioLogo.png','bowser-swing.png','roster.js','roster.json'):
    shutil.copy2(out/name, public/name)
shutil.copytree(out/'assets',public/'assets',dirs_exist_ok=True)
print('Built v4 language and component refinement studies.')
