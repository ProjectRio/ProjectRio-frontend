"""Design specimens: identical content rendered in wide and narrow containers."""
from pathlib import Path
import json
from html import escape

root = Path(__file__).resolve().parent
roster = json.loads((root/'roster.json').read_text())['chars']
abilities = json.loads((root/'vocabulary-roster-abilities.json').read_text())['characters']
labels = ['Batting', 'Pitching', 'Running', 'Fielding']
short = ['BAT', 'PIT', 'RUN', 'FLD']
people = [
    (0, 'Mario', 'Mario'), (1, 'Luigi', 'Luigi'), (6, 'Yoshi', 'Yoshi'),
    (4, 'Peach', 'Peach'), (9, 'Bowser', 'Bowser'),
    (2, 'Donkey Kong', 'DK'), (36, 'Yellow Magikoopa', 'Magikoopa(Y)'),
    (28, 'Toadsworth', 'Toadsworth'), (19, 'Bowser Jr.', 'Bowser Jr'),
]

def portrait(file, cls=''):
    return f'<img class="{cls}" src="/images/Characters/{file}.png" alt="" width="48" height="48">'

def roster_sample():
    rows = ''
    for i, (key, name, file) in enumerate(people):
        rows += f'<tr class="{"selected" if key == 0 else ""}"><td class="order">{i+1:02}</td><th scope="row"><span class="row-person">{portrait(file)}<span>{name}{"<small>Selected</small>" if key == 0 else ""}</span></span></th>'
        rows += ''.join(f'<td class="number">{n}</td>' for n in roster[key]['bars'])+'</tr>'
    return '''<div class="rio-panel roster-panel"><div class="panel-title"><div><span class="eyebrow">CHARACTER ATTRIBUTES</span><h3>Nine in the lineup.</h3></div><span class="quiet">Base / 10</span></div>
    <table class="roster-table"><caption class="sr-only">Illustrative lineup, base character attributes out of ten</caption><thead><tr><th scope="col">#</th><th scope="col">Character</th>'''+''.join(f'<th scope="col"><abbr title="{label}">{s}</abbr></th>' for label,s in zip(labels,short))+f'</tr></thead><tbody>{rows}</tbody></table><div class="panel-foot">9 characters <span>Base attributes · illustrative order</span></div></div>'

def character_sample(key, name, file):
    char = roster[key]
    cls = ['Balance','Power','Speed','Technique'][char['cls']]
    bars = ''.join(f'<div class="attribute-line"><span>{label}</span><div class="track"><i style="width:{n*10}%"></i></div><b>{n}<small>/10</small></b></div>' for label,n in zip(labels,char['bars']))
    return f'''<div class="rio-panel character-panel"><div class="character-top"><div class="portrait-stage">{portrait(file)}</div><div class="character-name"><span class="eyebrow">SELECTED CHARACTER</span><h3>{name}</h3><p>{cls}{' <span>·</span> Captain' if char['cap'] else ''}</p></div></div><div class="character-bottom"><div class="attribute-stack">{bars}</div><div class="character-details"><span class="eyebrow">FIELDING ABILITIES</span>{''.join(f'<p>{escape(a)}</p>' for a in abilities[str(key)]['abilities'])}<span class="quiet">Base character</span></div></div></div>'''

def character_samples():
    return '<div data-character="mario">'+character_sample(0,'Mario','Mario')+'</div><div data-character="magikoopa" hidden>'+character_sample(36,'Yellow Magikoopa','Magikoopa(Y)')+'</div>'

def match_sample():
    return '''<div class="rio-panel match-panel"><div class="match-meta"><span class="eyebrow">FINAL / 5 INNINGS</span><span>Mario Stadium</span></div><div class="match-score"><div class="team"><img src="/images/Teams/Mario Fireballs.png" alt="" width="64" height="64"><h3>Mario Fireballs</h3><span>Home</span></div><div class="score"><b>7</b><span>–</span><b>4</b></div><div class="team"><img src="/images/Teams/Yoshi Speed Stars.png" alt="" width="64" height="64"><h3>Yoshi Speed Stars</h3><span>Away</span></div></div><div class="match-verdict">Mario Fireballs win <span>+3 runs</span></div><div class="line-score-wrap"><table class="line-score"><caption class="sr-only">Illustrative five-inning line score</caption><thead><tr><th scope="col">Team</th><th scope="col">1</th><th scope="col">2</th><th scope="col">3</th><th scope="col">4</th><th scope="col">5</th><th scope="col">R</th><th scope="col">H</th><th scope="col">E</th></tr></thead><tbody><tr><th scope="row">Yoshi <span>Speed Stars</span></th><td>0</td><td>1</td><td>0</td><td>2</td><td>1</td><td>4</td><td>8</td><td>1</td></tr><tr><th scope="row">Mario <span>Fireballs</span></th><td>2</td><td>0</td><td>3</td><td>2</td><td>–</td><td>7</td><td>11</td><td>0</td></tr></tbody></table></div><div class="panel-foot">Illustrative match <span>Layout fixture · not a recorded game</span></div></div>'''

def comparison(content):
    return f'<div class="comparison"><div class="wide-study"><div class="frame-label"><b>WIDE</b><span>Flexible content column</span></div><div class="specimen-frame">{content}</div></div><div class="narrow-study"><div class="frame-label"><b>NARROW</b><span>Up to 360px content column</span></div><div class="specimen-frame">{content}</div></div></div>'

body = '''<main><header class="layout-intro"><span class="eyebrow">V4 / LAYOUT & SCALE</span><h1>Give the content<br>the right amount of room.</h1><p>Three compositions, each shown wide and narrow. The v3 palette and typography stay; the study is in grouping, emphasis, and density.</p><nav class="jump-links" aria-label="Layout specimens"><a href="#roster">01 / Roster rows</a><a href="#character">02 / Selected character</a><a href="#match">03 / Match summary</a></nav></header>
<section id="roster"><div class="section-heading"><div><span class="eyebrow">01 / THE LINEUP</span><h2>A row with a steady rhythm.</h2><p>One shared surface. Names get the flexible space; every number has a fixed home.</p></div><div class="study-control" role="group" aria-label="Roster density"><button type="button" data-density="compact" aria-pressed="true">Compact · 48px</button><button type="button" data-density="roomy" aria-pressed="false">Roomy · 60px</button></div></div>'''
body += comparison(roster_sample())
body += '''<div class="annotations"><p><b>32 → 28px portrait</b>Compact rows keep recognition; roomy rows use 40px portraits.</p><p><b>48px minimum row</b>The selected bar stays inside the same column structure.</p><p><b>Long names wrap</b>Columns stay aligned; the name remains fully readable.</p></div></section>
<section id="character"><div class="section-heading"><div><span class="eyebrow">02 / THE SPOTLIGHT</span><h2>Make the selected subject count.</h2><p>A stronger portrait and name, followed by one aligned block of attributes.</p></div><div class="study-control" role="group" aria-label="Character length comparison"><button type="button" data-subject="mario" aria-pressed="true">Mario</button><button type="button" data-subject="magikoopa" aria-pressed="false">Yellow Magikoopa</button></div></div>'''
body += comparison(character_samples())
body += '''<div class="annotations"><p><b>112 → 80px portrait</b>Identity leads at both widths without consuming the screen.</p><p><b>36 → 28px name</b>Long names can take two lines; supporting text stays quiet.</p><p><b>Shared gauge axis</b>The four values compare directly, with abilities grouped alongside or below.</p></div></section>
<section id="match"><div class="section-heading"><div><span class="eyebrow">03 / THE RESULT</span><h2>The score gets the loudest voice.</h2><p>Team identity, score, and innings form one unit. Details follow in a compact line score.</p></div></div>'''
body += comparison(match_sample())
body += '''<div class="annotations"><p><b>56 → 44px score</b>One dominant number pair establishes the reading order.</p><p><b>Matched team columns</b>Longer team names wrap without shifting the score.</p><p><b>Keep the innings together</b>The narrow version preserves all five innings and R / H / E.</p></div></section>
<footer><h2>The working rules.</h2><p>Small portraits for scanning. Larger portraits for selection. Shared surfaces for related information. Equal columns for comparison. Extra space between groups, less space within them.</p><small>Design studies only. Character attributes come from the existing roster; ability labels use the corrected vocabulary mapping. Lineup order and match data are illustrative. Sizes are proposed web values, not measurements from the game. Icons remain placeholders. V3 is unchanged.</small></footer></main>'''
head = '''<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Project Rio · Layout & scale</title><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&family=Lilita+One&display=swap" rel="stylesheet"><link rel="stylesheet" href="layouts.css"></head><body data-density="compact"><div class="study-bar"><div class="study-bar-inner"><a class="study-brand" href="index.html">PROJECT RIO / V4 REFINEMENT<span>Layout & scale · design study</span></a><nav aria-label="Design studies"><a href="index.html">Language</a><a href="concepts.html">Components</a><a href="vocabulary.html">Vocabulary</a><a href="layouts.html" aria-current="page">Layouts</a><a href="/design-v3/concepts.html">Original v3 ↗</a></nav></div></div>'''
(root/'layouts.html').write_text(head+body+'<script src="layouts.js"></script></body></html>')
