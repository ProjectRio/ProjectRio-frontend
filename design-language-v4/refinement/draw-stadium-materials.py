"""Original tileable SVG material recipes, informed by viewed game swatches.
No pixels, raster textures, or field contours are copied from the game.
"""
from pathlib import Path
import random
out=Path(__file__).resolve().parent/'assets/materials-v2';out.mkdir(parents=True,exist_ok=True)

def make(key,kind,base,seed):
 r=random.Random(seed)
 bits=[f'<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 256 256"><defs><filter id="grain" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".58" numOctaves="3" stitchTiles="stitch" seed="{seed}"/><feColorMatrix type="saturate" values="0"/></filter><filter id="mottle" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".035" numOctaves="3" stitchTiles="stitch" seed="{seed+1}"/><feColorMatrix type="saturate" values="0"/></filter></defs><rect width="256" height="256" fill="{base}"/>']
 if kind in ['grass','moss']:
  bits.append('<rect width="256" height="256" filter="url(#mottle)" opacity=".15" style="mix-blend-mode:soft-light"/>')
  for i in range(2200 if kind=='grass' else 1400):
   x=r.random()*256;y=r.random()*256;length=r.uniform(1,5) if kind=='grass' else r.uniform(2,7)
   color=r.choice(['#d5de8a','#bbce6b','#1c4823','#285827','#739d43'])
   bits.append(f'<path d="M{x:.1f} {y:.1f}l{r.uniform(-1,1.5):.1f} -{length:.1f}" stroke="{color}" stroke-width="{r.uniform(.45,1):.1f}" opacity="{r.uniform(.18,.45):.2f}"/>')
 elif kind in ['clay','sand','soil']:
  bits.append(f'<rect width="256" height="256" filter="url(#mottle)" opacity="{.42 if kind=="soil" else .15}" style="mix-blend-mode:soft-light"/>')
  if kind=='soil':
   for i in range(140):
    bits.append(f'<ellipse cx="{r.random()*256:.1f}" cy="{r.random()*256:.1f}" rx="{r.uniform(1,7):.1f}" ry="{r.uniform(1,4):.1f}" fill="{r.choice(["#201a13","#a28255","#695344"])}" opacity=".2"/>')
  for i in range(1900):
   bits.append(f'<ellipse cx="{r.random()*256:.1f}" cy="{r.random()*256:.1f}" rx="{r.uniform(.2,1.1):.1f}" ry="{r.uniform(.2,.8):.1f}" fill="{r.choice(["#f4e4c1","#3d3524","#97704a"])}" opacity="{r.uniform(.13,.35):.2f}"/>')
 elif kind=='flagstone':
  cells=[('M0 0H100L106 65L0 68Z','#7d827c'),('M104 0H256V60L110 64Z','#687378'),('M0 73L64 70L67 154L0 162Z','#6c7471'),('M69 70L183 67L181 145L72 152Z','#85877a'),('M188 65L256 64V154L188 146Z','#6d7b79'),('M0 167L127 157L132 256H0Z','#7d8177'),('M134 155L256 160V256H137Z','#596965')]
  for d,c in cells: bits.append(f'<path d="{d}" fill="{c}" stroke="#252f30" stroke-width="2"/><path d="{d}" fill="none" stroke="#d2ceb0" stroke-width=".4"/>')
  bits.append('<path d="M35 73L43 89L39 102M188 105L204 112L208 123M94 164L104 180L102 195M109 24L128 33L133 45" fill="none" stroke="#293637" stroke-width="1.2" opacity=".5"/>')
 elif kind=='enamel':
  bits.append('<path d="M2 254V2H254" stroke="#071c43" stroke-width="4" fill="none"/><path d="M6 249V6H249" stroke="#adc8f0" stroke-width="1" opacity=".25" fill="none"/><path d="M14 14L242 242M242 14L14 242" stroke="#c6d4f1" stroke-width=".3" opacity=".04"/>')
  for x in [16,240]:
   for y in [16,240]:bits.append(f'<circle cx="{x}" cy="{y}" r="4" fill="#6a7d99" stroke="#152c51"/><path d="M{x-2} {y}h4M{x} {y-2}v4" stroke="#1c3352" stroke-width="1"/>')
 bits.append(f'<rect width="256" height="256" filter="url(#grain)" opacity="{.10 if kind=="enamel" else .17}" style="mix-blend-mode:soft-light"/></svg>')
 (out/f'{key}.svg').write_text(''.join(bits))
recipes=[
 ('mario-field','grass','#6c8b33',11),('mario-infield','clay','#c9873f',12),
 ('bowser-field','flagstone','#626b65',21),('bowser-infield','flagstone','#626b65',22),
 ('wario-field','sand','#c4a35e',31),('wario-infield','sand','#d0b677',32),
 ('yoshi-field','grass','#599a38',41),('yoshi-infield','sand','#bca16c',42),
 ('peach-field','grass','#659c32',51),('peach-infield','clay','#c27857',52),
 ('dk-field','moss','#31552b',61),('dk-infield','soil','#493327',62),
 ('toy-field','enamel','#2b4381',71),('toy-infield','enamel','#223565',72)]
for args in recipes:make(*args)
