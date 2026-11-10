import extracted from '@/design-language-v4/roster.json';
import { characters } from '@/lib/data/characters';

const expanded: Record<string, string> = {
  DK: 'Donkey Kong', Diddy: 'Diddy Kong', Dixie: 'Dixie Kong', Monty: 'Monty Mole',
  Petey: 'Petey Piranha', 'Bowser Jr': 'Bowser Jr.',
  'Bro(H)': 'Hammer Bro', 'Bro(F)': 'Fire Bro', 'Bro(B)': 'Boomerang Bro',
};
const colors: Record<string, string> = { R: 'Red', B: 'Blue', G: 'Green', Y: 'Yellow', P: 'Purple', Bk: 'Black', Gy: 'Gray' };
function displayName(name: string) {
  if (expanded[name]) return expanded[name];
  const variant = name.match(/^(.+)\((.+)\)$/);
  return variant ? `${colors[variant[2]]} ${variant[1]}` : name;
}

export const CLASSES = ['Balance', 'Power', 'Speed', 'Technique'];
export const roster = extracted.chars.map((c) => {
  const key = characters[String(c.id)];
  const file = key === 'Monty' ? 'montymole' : key.toLowerCase().replaceAll(' ', '');
  return { ...c, key, name: displayName(key), portrait: `/design-v4/portraits/${file}.png`, icon: `/images/Characters/${key}.png`, className: CLASSES[c.cls] };
});
export type RioCharacter = typeof roster[number];
export const chemistry = extracted.chem;
export function chemistryKind(value: number) { return value >= 90 ? 'good' : value < 20 ? 'bad' : 'neutral'; }

// Descriptions describe the existing collision-model previews, not live gameplay.
export const parks = [
  { id: 0, name: 'Mario Stadium', host: 0, color: '#3f785d', subtitle: 'Back to the fundamentals.', description: 'The familiar diamond. Start here to get your bearings, then compare its field shape with the other parks.', note: 'A clean view of the baseline geometry makes this a useful starting point for the hit visualizer.' },
  { id: 1, name: 'Bowser Castle', host: 9, color: '#765146', subtitle: 'A less forgiving home field.', description: 'Stone, lava, and a very different outfield. Look past the theme and study how the boundaries change.', note: 'The colored surfaces show collision categories. Moving hazards are not simulated in this preview.' },
  { id: 2, name: 'Wario Palace', host: 10, color: '#9a782a', subtitle: 'Take the scenic route.', description: 'A sandy field with its own geometry. Switch to the overhead view to see the shape of the playable space.', note: 'Use the same camera position across parks to compare their layouts.' },
  { id: 3, name: 'Yoshi Park', host: 6, color: '#4e8459', subtitle: 'Room to roam.', description: 'Green hills frame Yoshi’s home turf. Explore the outfield and the boundaries beyond the base paths.', note: 'Drag to orbit the field. The overhead view is especially useful for reading the outfield.' },
  { id: 4, name: 'Peach Garden', host: 4, color: '#94677b', subtitle: 'A garden with a game plan.', description: 'Peach’s park trades the grandstand for garden surroundings. Get a closer look from behind home plate.', note: 'This is the Rio collision model, with the existing visualizer’s garden palette.' },
  { id: 5, name: 'DK Jungle', host: 2, color: '#596749', subtitle: 'Welcome to the jungle.', description: 'Earthy terrain and an unmistakably different setting. Study the field before taking a swing in the lab.', note: 'The field surfaces are colored by collision type, making changes in terrain easier to see.' },
  { id: 6, name: 'Toy Field', host: 19, color: '#536d98', subtitle: 'A different kind of ballgame.', description: 'The bonus field joins the six ballparks. Its unusual shape is a good reminder that not every game needs the same diamond.', note: 'Toy Field is a separate game mode; this preview explores its geometry only.' },
];
