"""Attribute and play-result families for the v4 vocabulary board.

Invoked with the shared drawing primitives by draw-vocabulary.py.
"""
import json


def build_family(path, ball, glove, shoe, save, img, root):
    ink, cream, gold = '#24382e', '#f5edce', '#deb65e'

    def bat(transform=''):
        return f'<g transform="{transform}">' + path('M13 51 L28 30 Q29 25 35 18 L43 8 Q48 2 54 8 Q60 13 54 20 L43 31 Q37 37 32 38 L20 55Z', '#c79750') + path('M12 50 L21 56 L18 60 L9 54Z') + path('M32 28 L48 11', 'none', '#f3d6a0', 2) + '</g>'

    def bag(x, y, active=False, size=6):
        return path(f'M{x} {y-size} L{x+size} {y} L{x} {y+size} L{x-size} {y}Z', gold if active else cream, ink, 2.4)

    def bases(count):
        # Home -> first -> second -> third. The route conveys advancement without color.
        route = ['M32 54 L54 32', 'M32 54 L54 32 L32 10', 'M32 54 L54 32 L32 10 L10 32'][count-1]
        outline = path('M32 54 L54 32 L32 10 L10 32Z', 'none', '#738b7d', 2.2)
        route = path(route, 'none', gold, 5)
        return outline + route + bag(54,32,count>=1) + bag(32,10,count>=2) + bag(10,32,count>=3) + path('M28 49 H36 V55 L32 59 L28 55Z',cream,ink,2)

    attributes = {
        'batting': ('Batting', bat() + path('M8 28 Q16 17 27 15','none',gold,3), 'The bat and its swing.'),
        'pitching': ('Pitching', path('M6 46 Q18 24 40 20 M8 56 Q29 36 49 35','none',gold,3.5) + ball(45,22,13), 'A baseball in flight.'),
        'running': ('Running', shoe('translate(3 -3) rotate(-12 31 39)') + path('M5 26 H17 M3 36 H12','none',gold,3), 'A cleat pushing forward.'),
        'fielding': ('Fielding', glove('translate(-2 2) scale(.98)'), 'The open glove.'),
    }
    results = {
        'single': ('Single','1B',bases(1),'One base along the path.'),
        'double': ('Double','2B',bases(2),'The path continues to second.'),
        'triple': ('Triple','3B',bases(3),'Three sides of the diamond.'),
        'home-run': ('Home run','HR',path('M8 38 L56 30 V55 L8 60Z','#789283') + path('M8 38 L56 30 M20 36 V57 M35 34 V55 M49 32 V54','none',ink,2) + path('M7 29 Q28 -3 47 14','none',gold,3.8) + ball(49,15,9),'The ball clears the outfield wall.'),
        'walk': ('Walk','BB', ''.join(ball(x,12,5) for x in [10,24,38,52]) + shoe('translate(-5 9) scale(.7)') + path('M29 45 H43 M39 41 L44 45 L39 49','none',gold,3) + bag(53,45,True,7),'Four balls and a step to first.'),
        'strikeout': ('Strikeout','K', path('M11 10 H20 V27 L36 10 H48 L29 31 L48 54 H36 L20 36 V54 H11Z',cream) + path('M4 59 H53','none',gold,3),'A bold K, built as a shape.'),
        'ground-out': ('Groundout','GO', path('M4 48 Q12 27 21 46 Q26 34 33 45','none',gold,3) + ball(16,39,6) + glove('translate(27 15) scale(.56)') + path('M5 56 H58','none',cream,2.8),'A bouncing ball meets the glove.'),
        'fly-out': ('Flyout','FO', path('M7 25 C7 1 40 1 40 29 M35 23 L40 30 L45 23','none',gold,3) + ball(10,19,7) + glove('translate(18 28) scale(.65)'), 'A high arc drops into the glove.'),
        'double-play': ('Double play','DP', path('M12 44 Q27 12 48 35','none',gold,3.5) + path('M42 29 L49 36 L50 26','none',cream,2.5) + bag(14,47,False,10) + bag(49,39,False,10) + path('M10 43 L18 51 M18 43 L10 51 M45 35 L53 43 M53 35 L45 43','none',ink,2.8), 'A connected throw and two out marks.'),
        'caught-stealing': ('Caught stealing','CS', shoe('translate(-5 13) scale(.7)') + bag(47,49,False,9) + glove('translate(28 -1) rotate(27 18 25) scale(.53)') + path('M26 35 L33 42 M33 35 L26 42','none',gold,3), 'The tag meets the runner at the bag.'),
    }
    for key,(label,art,_) in attributes.items():
        save('attribute-'+key,label,art)
    for key,(label,code,art,_) in results.items():
        save('result-'+key,label,art)

    cards=''.join(f'<a class="voc-attribute" href="assets/vocabulary/attribute-{key}.svg" download>{img("attribute-"+key,64)}<span><b>{label}</b><small>{description}</small></span><span class="voc-arrow" aria-hidden="true">↓</span><span class="voc-sr"> Download SVG</span></a>' for key,(label,_,description) in attributes.items())
    mario=next(c for c in json.loads((root/'roster.json').read_text())['chars'] if c['n']=='Mario')
    stat_rows=''.join(f'<div class="voc-stat"><span>{img("attribute-"+key,32)}{label}</span><b>{value}<small>/10</small></b><div class="voc-stat-track" aria-hidden="true"><i style="width:{value*10}%"></i></div></div>' for (key,(label,_,_)),value in zip(attributes.items(),mario['bars']))
    attribute_section='''<section id="attributes"><div class="wrap"><div class="chead"><span class="cnum">03 / ATTRIBUTES</span><h2>Four fundamentals.</h2></div>
<p class="intro">Batting, pitching, running and fielding share a simple object language. Recognizable at a glance, compact enough to sit beside the number.</p>
<div class="voc-attributes">'''+cards+'''</div>
<div class="voc-stat-specimen"><div class="voc-stat-heading"><img src="/images/Characters/Mario.png" width="36" height="36" alt=""><span><b>Mario</b><small>STANDARD ATTRIBUTES / EXISTING ROSTER VALUES</small></span></div><div class="voc-stat-grid">'''+stat_rows+'''</div></div>
<p class="voc-caption">64px marks above; 32px beside the stats. The number and bar express strength. The symbol identifies the attribute.</p></div></section>'''

    result_cards=''.join(f'<a class="voc-result" href="assets/vocabulary/result-{key}.svg" download><span class="voc-result-code">{code}</span><span class="voc-ability-art">{img("result-"+key,48)}</span><b>{label}</b><small>{description}</small><span class="voc-sr"> Download SVG</span></a>' for key,(label,code,_,description) in results.items())
    result_section='''<section id="outcomes"><div class="wrap"><div class="chead"><span class="cnum">05 / PLAY OUTCOMES</span><h2>A little picture of the play.</h2></div>
<p class="intro">Trace a hit around the bases. Clear the wall. Connect two outs. Each mark captures the result, with the name and familiar scoring shorthand alongside it.</p>
<div class="voc-gallery voc-result-gallery" data-ground="dark" data-size="48">
<div class="voc-gallery-toolbar"><span>PLAY RESULT PROPOSALS <small>Click a mark to download its SVG</small></span><div class="voc-tools"><div role="group" aria-label="Play result icon size"><button type="button" data-voc-size="32" aria-pressed="false">32px</button><button type="button" data-voc-size="48" aria-pressed="true">48px</button></div><div role="group" aria-label="Play result icon background"><button type="button" data-voc-ground="dark" aria-pressed="true">Dark</button><button type="button" data-voc-ground="light" aria-pressed="false">Ivory</button></div></div></div>
<div class="voc-results">'''+result_cards+'''</div></div>
<p class="voc-caption">A single, double and triple have different path lengths, not just different colors. K covers a strikeout without guessing whether the batter swung. DP and CS retain their text labels.</p>
<div class="voc-play-specimen"><div class="voc-play-heading"><span class="voc-label">AT WORKING SIZE / 32PX</span><b>Play results</b><span>Illustrative rows · not a recorded game</span></div>'''
    for inning,key,title,detail in [('TOP 2','double','Mario doubles','Runner reaches second'),('BOT 3','home-run','Bowser homers','Two runs score'),('TOP 4','double-play','Double play','Two outs recorded')]:
        label,code,_,_=results[key]
        result_section+=f'<div class="voc-play-row"><span class="voc-inning">{inning}</span>{img("result-"+key,32)}<span class="voc-play-copy"><b>{title}</b><small>{detail}</small></span><span class="voc-play-code">{code}</span></div>'
    result_section+='''</div><p class="voc-caption">Keep these marks beside results and result counts. Chemistry symbols remain relationship indicators; the gold star remains Superstar status.</p></div></section>'''
    return {'attribute_section':attribute_section,'result_section':result_section,'attributes':{key:value[0] for key,value in attributes.items()},'results':{key:{'label':value[0],'code':value[1]} for key,value in results.items()}}
