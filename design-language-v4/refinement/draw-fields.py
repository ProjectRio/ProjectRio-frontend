"""Flat field illustrations. Geometry comes from Rio's local collision data.
Only horizontal playing surfaces are used; no blanket mapping of out-of-bounds
collision faces to masonry. Patterns and ink marks are original SVG artwork.
"""
from pathlib import Path
import json, math, runpy
motifs = runpy.run_path(str(Path(__file__).with_name("field-motifs.py")))
root = Path(__file__).resolve().parents[2]
out = Path(__file__).resolve().parent / 'assets/fields'
out.mkdir(parents=True, exist_ok=True)
parks = ['mario','bowser','wario','yoshi','peach','dk','toy']
# grass, dirt, rough, water, pit, boundary, field underlay
palettes = [
 ['#688841','#c79456','#526e37','#6eafb4','#292d27','#657b9b','#365135'],
 ['#77745b','#77745b','#65624b','#e6a03b','#e39131','#a28c56','#464b3c'],
 ['#768b42','#c5a66a','#ac8e56','#75a7a4','#b99757','#9c8160','#826b42'],
 ['#8b9849','#c8b67b','#798b42','#78a9a5','#617745','#c2aa6e','#52643b'],
 ['#688444','#bb8655','#3f633a','#88b4bf','#798d95','#bbae91','#445b39'],
 ['#627e43','#ae8555','#92734c','#79a5a1','#494d36','#9d805b','#3e5538'],
 ['#436398','#436398','#436398','#729fae','#162d49','#a2abb5','#253957'],
]
def num(v): return f'{v:.2f}'.rstrip('0').rstrip('.')
def point(p): return f'{num(p[0])},{num(-p[2])}'
def path(tris): return ''.join('M'+'L'.join(point(p) for p in tri)+'Z' for tri in tris)
def polygon(points, fill, stroke='none', width=0):
 return f'<polygon points="{points}" fill="{fill}" stroke="{stroke}" stroke-width="{width}"/>'
for sid,key in enumerate(parks):
 colors=palettes[sid]; grass,dirt,rough,water,pit,rim,under=colors
 data=json.loads((root/f'public/stadiums/{sid}.json').read_text())
 layers={}; wall=[]
 for box in data['Triangle Collections']:
  for col in box['Triangles']:
   pts=col['Points']; step=3 if col['CollectionType']==0 else 1
   for i in range(0,len(pts)-2,step):
    ps=pts[i:i+3]; role=ps[2]['CollisionType']&15
    xyz=[(p['Point']['X'], -p['Point']['Y'], p['Point']['Z']) for p in ps]
    a,b,c=xyz; ab=[b[j]-a[j] for j in range(3)]; ac=[c[j]-a[j] for j in range(3)]
    cross=[ab[1]*ac[2]-ab[2]*ac[1],ab[2]*ac[0]-ab[0]*ac[2],ab[0]*ac[1]-ab[1]*ac[0]]
    mag=math.sqrt(sum(n*n for n in cross))
    if role==2:
     # The boundary's top-view line, rather than triangulated vertical walls.
     dist=lambda u,v:(u[0]-v[0])**2+(u[2]-v[2])**2
     u,v=max([(a,b),(b,c),(a,c)],key=lambda pair:dist(*pair))
     if dist(u,v)>.05: wall.append(f'M{point(u)}L{point(v)}')
    if role not in [1,6,8,9,10,11] or mag<.01 or abs(cross[1])/mag<.72: continue
    layers.setdefault(role,[]).append(xyz)
 # Keep a consistent north-up, non-perspective composition across all parks.
 defs=f'''<defs>
 <pattern id="grass" width="16" height="16" patternUnits="userSpaceOnUse" patternTransform="rotate(38)"><rect width="16" height="16" fill="{grass}"/><rect width="8" height="16" fill="#fff4c2" opacity=".075"/></pattern>
 <pattern id="sand" width="7" height="7" patternUnits="userSpaceOnUse"><rect width="7" height="7" fill="{dirt}"/><path d="M1 2h.5m3 3h.6m-1-4h.2" stroke="#614f32" stroke-width=".25" opacity=".35"/></pattern>
 <pattern id="stone" width="12" height="9" patternUnits="userSpaceOnUse"><rect width="12" height="9" fill="{grass}"/><path d="M0 0H12M0 4.5H12M6 0V4.5M0 4.5V9M12 4.5V9" fill="none" stroke="#414734" stroke-width=".35"/><path d="M.5 5H11.5M6.5 .5H11.5" stroke="#c9ba82" stroke-width=".18"/></pattern>
 <pattern id="enamel" width="10" height="10" patternUnits="userSpaceOnUse"><rect width="10" height="10" fill="{grass}"/><path d="M0 10V0H10" fill="none" stroke="#172e50" stroke-width=".4"/><path d="M.6 9V.6H9" fill="none" stroke="#9eb2cd" stroke-width=".2"/><circle cx="1.5" cy="1.5" r=".22" fill="#ced5cf"/></pattern>
 <pattern id="water" width="8" height="6" patternUnits="userSpaceOnUse"><rect width="8" height="6" fill="{water}"/><path d="M1 2H5M4 5H7" stroke="#d5e4c7" stroke-width=".4" opacity=".5"/></pattern>
 <pattern id="lava" width="11" height="8" patternUnits="userSpaceOnUse"><rect width="11" height="8" fill="{pit}"/><path d="M-1 2L3 3L5 0M3 3L4 7L9 9M4 7L10 4L12 4" fill="none" stroke="#f9d26f" stroke-width=".6"/></pattern>
 </defs>'''
 main=path(layers.get(1,[])+layers.get(6,[])+layers.get(9,[])+layers.get(10,[])+layers.get(8,[]))
 pieces=[f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="-78 -112 156 140" fill="none">',defs]
 # A slim outer rim supports the field without drawing fake surrounding terrain.
 pieces.append(f'<path d="{main}" fill="{under}" stroke="{under}" stroke-width="3" stroke-linejoin="round"/>')
 mapping={1:('url(#stone)' if sid==1 else 'url(#enamel)' if sid==6 else grass if sid in [3,5] else 'url(#grass)'),6:'url(#sand)',9:rough,10:'url(#water)',8:('url(#lava)' if sid==1 else pit),11:'#d4b267'}
 for role in [8,1,6,9,10,11]:
  if role not in layers: continue
  d=path(layers[role]); fill=mapping[role]
  pieces.append(f'<path d="{d}" fill="{fill}" stroke="{fill}" stroke-width=".11" stroke-linejoin="round"/>')
 pieces.append(f'<path d="{"".join(wall)}" stroke="{rim}" stroke-width="1.5" stroke-linecap="round"/>')
 # Original, simplified paint marks. Standard diamond proportions, not extracted decals.
 if sid==1:
  pieces.append('<path d="M0 0L-19 -19L0 -38L19 -19Z" stroke="#414b38" stroke-width="1.1"/><circle cx="0" cy="-18.4" r="5" stroke="#4e543b" stroke-width=".8"/>')
 if sid!=6:
  pieces.append('<g stroke="#eee7bd" stroke-width=".42" stroke-linejoin="round" opacity=".87"><path d="M-54 -54L0 0L54 -54"/><path d="M-2.6 1.5V-3.5H-1.1V1.5ZM1.1 1.5V-3.5H2.6V1.5Z"/></g>')
  for x,z in [(-19,19),(0,38),(19,19)]:
   pieces.append(polygon(f'{x-1},-{z} {x},-{z+1} {x+1},-{z} {x},-{z-1}','#f0e8c8'))
  pieces.append('<path d="M-.7 -.8H.7V0L0 .6L-.7 0Z" fill="#f2eacb"/><path d="M-1.1 -18.4H1.1" stroke="#f2eacb" stroke-width=".5"/>')
 else:
  # Toy Field's mechanical language: illustrated scoring panels, not a regulation diamond.
  for x,z,c in [(-25,50,'#ba735d'),(25,50,'#ba735d'),(0,62,'#ba735d'),(-20,78,'#70a079'),(20,78,'#70a079'),(0,85,'#c6a15b')]:
   pieces.append(f'<circle cx="{x}" cy="{-z}" r="5.6" fill="{c}" stroke="#dfcf9d" stroke-width=".6"/><circle cx="{x}" cy="{-z}" r="4.4" stroke="#f0ddab" stroke-width=".2"/><path d="M{x-1.5} {-z}h3m-1.5-1.5v3" stroke="#f0ddab" stroke-width=".5"/>')
  pieces.append('<path d="M0 0L-43 -43M0 0L43 -43" stroke="#c4d4de" stroke-width=".5" stroke-dasharray="1 1"/>')
 pieces.append(motifs['SYMBOLS'])
 pieces.append(motifs['field_motifs'](sid))
 pieces.append('</svg>')
 svg=''.join(pieces)
 (out/f'{key}.svg').write_text(svg)
 animation='''<style>
 .actor{transform-box:fill-box;transform-origin:center}
 .actor-thwomp{animation:thump 10s ease-in-out infinite}
 .actor-chomp{animation:nudge 8s ease-in-out infinite}
 .actor-plant{animation:nod 7s ease-in-out infinite}
 .actor-note{animation:hop 6s ease-in-out infinite}
 .actor-barrel{animation:roll 12s ease-in-out infinite}
 .actor-klaptrap{animation:swim 10s ease-in-out infinite}
 .actor-bubble{animation:hop 5s ease-in-out infinite}
 .actor-star{animation:nod 9s ease-in-out infinite}
 @keyframes thump{0%,65%,100%{transform:translateY(0)}70%,74%{transform:translateY(8px)}82%{transform:translateY(0)}}
 @keyframes nudge{0%,70%,100%{transform:translateX(0)}76%{transform:translateX(5px)}84%{transform:translateX(0)}}
 @keyframes nod{0%,100%{transform:rotate(-5deg)}50%{transform:rotate(5deg)}}
 @keyframes hop{0%,75%,100%{transform:translateY(0)}83%{transform:translateY(-7px)}92%{transform:translateY(0)}}
 @keyframes roll{0%,100%{transform:rotate(-10deg)}50%{transform:rotate(15deg)}}
 @keyframes swim{0%,100%{transform:translateX(-3px)}50%{transform:translateX(3px)}}
 @media(prefers-reduced-motion:reduce){.actor{animation:none!important}}
 </style>'''
 (out/f'{key}-motion.svg').write_text(svg.replace('</svg>',animation+'</svg>'))
for key,mark in zip(parks,['ball','thwomp','chomp','plant','note','barrel','star']):
 (out/f'{key}-mark.svg').write_text('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">'+motifs['SYMBOLS']+f'<use href="#{mark}"/></svg>')
print('Drew seven flat field illustrations from local stadium geometry.')
