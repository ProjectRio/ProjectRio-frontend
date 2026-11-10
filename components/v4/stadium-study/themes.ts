import { getTheme3D, type StadiumTheme3D } from '@/components/visualizer/stadiumThemes';

export type Surface = 'stone' | 'clay' | 'turf' | 'sand' | 'paint' | 'wood' | 'enamel' | 'lava' | 'water';
export const PARKS = [
  { name: 'Mario Stadium', icon: 'Mario', title: 'Clay, chalk & afternoon light', description: 'A warmer diamond, gently worn blue stands, and finely grained turf. The material stays broad enough to read while the camera moves.', materials: ['turf','clay','paint'], labels: ['Short-cut turf','Warm infield clay','Faded stadium blue'], colors: ['#657b43','#ba8959','#5275a6'] },
  { name: 'Bowser Castle', icon: 'Bowser', title: 'Weathered stone. Moving heat.', description: 'Large, uneven masonry with warm grey faces and deep mortar. Slow molten currents bring the light; the castle surfaces stay heavy and matte.', materials: ['stone','lava','paint'], labels: ['Worn castle stone','Molten current','Muted ironwork'], colors: ['#858780','#c96e26','#565062'] },
  { name: 'Wario Palace', icon: 'Wario', title: 'Sun-warmed sand & sandstone', description: 'Fine sand and broad limestone blocks under a dusty golden sky. Small patches of green keep the playing field legible against the palace.', materials: ['sand','stone','turf'], labels: ['Fine dune sand','Pale sandstone','Green base islands'], colors: ['#c4a66b','#a99570','#64814a'] },
  { name: 'Yoshi Park', icon: 'Yoshi', title: 'Painted hills & a lilac horizon', description: 'Soft, brushed color on the rolling scenery, with warm timber and muted olive turf. The shapes carry the storybook character.', materials: ['paint','wood','turf'], labels: ['Painted scenery','Warm timber','Soft olive turf'], colors: ['#7d9a58','#a28859','#738b4c'] },
  { name: 'Peach Garden', icon: 'Peach', title: 'Warm limestone & garden shade', description: 'Creamy masonry, terracotta clay, and garden green. A pale sky keeps the stone warm without washing the whole scene in pink.', materials: ['stone','clay','turf'], labels: ['Garden limestone','Terracotta clay','Garden green'], colors: ['#c1b79e','#a5694c','#66844f'] },
  { name: 'DK Jungle', icon: 'DK', title: 'Carved rock & weathered timber', description: 'Grey-green stone, dark grain, and earthy clearings. Soft canopy light and a little drifting haze create depth around the field.', materials: ['wood','stone','clay'], labels: ['Weathered timber','Volcanic stone','Earthy clearings'], colors: ['#776044','#788175','#826344'] },
  { name: 'Toy Field', icon: '', title: 'Blue enamel beneath the stars', description: 'Wide blue panels with fine seams and a soft highlight. Warm bonus pads and a slow field of stars keep the mechanical setting playful.', materials: ['enamel','paint','enamel'], labels: ['Blue enamel','Warm bonus pads','Inset blue panels'], colors: ['#355b93','#c5a450','#294675'] },
] as const;

export function studyTheme(id: number, refined: boolean): StadiumTheme3D {
  const base = getTheme3D(id);
  if (!refined) return base;
  const patches: Partial<StadiumTheme3D>[] = [
    { skyTop:'#557e9f',skyBottom:'#d0d3bd',fog:'#c3c8b5',ground:'#527d80',palette:{...base.palette,grass:'#657b43',dirt:'#ba8959',wall:'#5275a6',oob:'#b6b5a6',back:'#909a9e',rough:'#586d3d'} },
    { skyTop:'#252b32',skyBottom:'#817566',fog:'#716a60',fogDensity:.0022,ground:'#333a3b',palette:{...base.palette,grass:'#858780',dirt:'#939187',wall:'#787a73',oob:'#858780',back:'#565062',pitWall:'#494b45',pit:'#d48737',rough:'#5c5e54'},emissive:{pit:'#d48737',water:'#cb7931'},hemi:{sky:'#d8d8da',ground:'#706862',intensity:1.7},sun:{color:'#fff0d9',intensity:1.8,position:[-70,100,-40]} },
    { skyTop:'#aa8b65',skyBottom:'#e6d3a5',fog:'#d0bc92',ground:'#ac945f',palette:{...base.palette,dirt:'#c4a66b',wall:'#a99570',oob:'#b5a07a',grass:'#64814a',back:'#938163'} },
    { skyTop:'#827c9c',skyBottom:'#d7cfda',fog:'#cac7cf',ground:'#718653',palette:{...base.palette,grass:'#738b4c',oob:'#7d9a58',wall:'#b1a478',back:'#a28859',dirt:'#b9a476'},hemi:{sky:'#e0d8eb',ground:'#768459',intensity:1.1} },
    { skyTop:'#7e9ba9',skyBottom:'#e0d8c3',fog:'#d2d0bd',ground:'#758360',palette:{...base.palette,grass:'#66844f',dirt:'#a5694c',wall:'#c1b79e',oob:'#c1b79e',back:'#afa58d'} },
    { skyTop:'#879c98',skyBottom:'#c6cdc0',fog:'#a8b8a7',ground:'#465c3f',palette:{...base.palette,grass:'#58734b',rough:'#826344',wall:'#776044',oob:'#6c7e60',back:'#788175',pitWall:'#5a6558'} },
    { skyTop:'#080f20',skyBottom:'#28394f',fog:'#172435',ground:'#101b2c',hemi:{sky:'#bccbe3',ground:'#243349',intensity:1.8},sun:{color:'#dbe7ff',intensity:2.3,position:[0,130,-40]},palette:{...base.palette,grass:'#355b93',oob:'#294675',wall:'#355b93',dirt:'#38567e',back:'#294675',pit:'#c5a450'},emissive:{pit:'#8b712d'} },
  ];
  return {...base,...patches[id]};
}

export function surfaceFor(id:number, role:string): Surface {
  if (id===1) return role==='pit'||role==='water' ? 'lava' : role==='back' ? 'paint' : 'stone';
  if (id===6) return role==='pit' ? 'paint' : 'enamel';
  if (role==='water') return 'water';
  if (role==='dirt'||role==='rough') return id===2 ? 'sand' : 'clay';
  if (role==='grass') return 'turf';
  if (id===3) return role==='back'||role==='wall' ? 'wood' : 'paint';
  if (id===5) return role==='wall' ? 'wood' : 'stone';
  if (id===0) return role==='wall' ? 'paint' : 'stone';
  return 'stone';
}
