"""Original material strips and small hazard marks for the web theme specimen."""
from pathlib import Path
import runpy
base=Path(__file__).resolve().parent
motifs=runpy.run_path(str(base/'field-motifs.py'))
out=base/'assets/motifs';out.mkdir(exist_ok=True)
for name in ['ball','thwomp','bubble','chomp','plant','note','barrel','klaptrap','star']:
 (out/f'{name}.svg').write_text('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">'+motifs['SYMBOLS']+f'<use href="#{name}"/></svg>')
patterns={
 'mario':('<path d="M-50 100L50 0H100L0 100ZM50 100L150 0H200L100 100ZM150 100L250 0H300L200 100Z" fill="#d6e2a0" opacity=".06"/>'),
 'bowser':('<g fill="none" stroke="#0d1c13" stroke-width="2" opacity=".38"><path d="M0 0H240M0 49H240M0 99H240M80 0L78 49M190 0L192 49M29 49L27 100M134 49L138 100"/></g><path d="M2 3H78M83 3H188M3 52H27M32 52H132M139 52H238" stroke="#e2d6a6" opacity=".1"/>'),
 'wario':('<g fill="none" stroke="#bda378" opacity=".12"><path d="M0 0H240M0 50H240M0 100H240M120 0V50M50 50V100M200 50V100"/><path d="M5 9l22-2m64 29 13-1m60-20 18 1M30 75l30 2m70 7 40-1"/></g>'),
 'yoshi':('<path d="M0 40Q50 34 120 40T240 40M0 44Q50 38 120 44T240 44" fill="none" stroke="#bdc294" opacity=".045"/>'),
 'peach':('<path d="M0 0H240M0 50H240M0 100H240M120 0V50M60 50V100M180 50V100" fill="none" stroke="#14241c" opacity=".3"/><path d="M2 3H118M122 3H238M2 53H58M62 53H178M182 53H238" stroke="#e8ddb7" opacity=".13"/>'),
 'dk':('<g fill="none" stroke="#d9ba7c" opacity=".09"><path d="M0 7Q70 0 125 7T240 7M0 18Q80 25 130 16T240 18M0 36Q100 24 150 35T240 36M0 58Q60 50 120 58T240 58M0 79Q90 69 145 79T240 79M0 91Q120 83 160 91T240 91"/><ellipse cx="160" cy="45" rx="18" ry="4"/><ellipse cx="160" cy="45" rx="10" ry="2"/></g><path d="M0 100H240" stroke="#07180d" stroke-width="3" opacity=".4"/>'),
 'toy':('<path d="M1 99V1H239" fill="none" stroke="#030e2c" stroke-width="2" opacity=".4"/><path d="M4 96V4H236" fill="none" stroke="#b1c8df" opacity=".13"/><g fill="#7e95ac" opacity=".4"><circle cx="10" cy="10" r="2"/><circle cx="230" cy="10" r="2"/><circle cx="10" cy="90" r="2"/><circle cx="230" cy="90" r="2"/></g>')}
for key,body in patterns.items():
 (out/f'{key}-surface.svg').write_text('<svg xmlns="http://www.w3.org/2000/svg" width="240" height="100" viewBox="0 0 240 100">'+body+'</svg>')
