import Link from 'next/link';
import type { LadderPlayer } from '@/lib/api';
import { ordinal } from '@/lib/gameDisplay';
import { project } from './scene';

/*
 * The top of a ranked ladder, flown the way a ballpark flies its standings:
 * a row of flags over the outfield wall, in order, first place on the left.
 * Each pole stands on the warning track and comes up out of it; its flag is
 * then run up to the top. The flags are drawn upright and all at one height,
 * so five names read as one line whatever the camera does to the field.
 *
 * Everything is in park widths from the park's centre, like scene.ts.
 */
const COUNT = 5;
/* Where the first pole and each one after it stand across the picture. */
const FIRST = -0.37;
const SPACING = 0.166;
/* The top of every pole, well clear of the centre-field wall. */
const TOP = -0.318;
/* How far inside the wall a pole stands, in metres. */
const INSET = 4.5;

/* Mario Stadium's outfield wall, foul pole to foul pole, in field metres. */
const WALL: [x: number, z: number][] = [
	[-60.7, 52.1],
	[-41.55, 82.8],
	[-13.3, 100],
	[15.8, 100],
	[60.7, 54.1]
];

function wallZ(x: number) {
	for (let i = 1; i < WALL.length; i++) {
		const [x0, z0] = WALL[i - 1];
		const [x1, z1] = WALL[i];
		if (x <= x1) return z0 + ((z1 - z0) * (Math.max(x, x0) - x0)) / (x1 - x0);
	}
	return WALL[WALL.length - 1][1];
}

/** The spot on the warning track that the camera puts `across` park widths from the centre. */
function trackSpot(across: number) {
	let low = WALL[0][0];
	let high = WALL[WALL.length - 1][0];
	for (let i = 0; i < 30; i++) {
		const x = (low + high) / 2;
		if (project(x, wallZ(x) - INSET).x < across) low = x;
		else high = x;
	}
	const x = (low + high) / 2;
	return { x, z: wallZ(x) - INSET };
}

/** Where the poles stand on the field, first place first. */
export const FLAG_SPOTS = Array.from({ length: COUNT }, (_, i) => trackSpot(FIRST + SPACING * i));

/* A name is set as large as its flag allows: just under half its size per letter in the condensed face. */
const NAME_MAX = 1.9;
const NAME_ROOM = 7.9;
const nameSize = (name: string) => Math.min(NAME_MAX, NAME_ROOM / (0.48 * name.length));

export default function Flags({ season, players }: { season: string; players: LadderPlayer[] }) {
	const top = players.slice(0, COUNT);
	return (
		<ol aria-label={`${season} ladder, top ${top.length}`} style={{ '--n': top.length } as React.CSSProperties}>
			{top.map((player, i) => {
				const base = project(FLAG_SPOTS[i].x, FLAG_SPOTS[i].z);
				return (
					<li
						key={player.username}
						className="flag"
						style={
							{
								'--x': base.x.toFixed(4),
								'--top': TOP,
								'--pole': (base.y - TOP).toFixed(4),
								'--i': i
							} as React.CSSProperties
						}
					>
						<span className="flag-pole" />
						<Link href={`/users/${encodeURIComponent(player.username)}`} className="flag-cloth" data-first={i === 0}>
							<span className="flag-name">
								<span style={{ fontSize: `${nameSize(player.username).toFixed(3)}em` }}>{player.username}</span>
							</span>
							<span className="flag-line">
								<span className="flag-place">{ordinal(i + 1)}</span>
								<span className="flag-record">
									{player.num_wins}–{player.num_losses}
								</span>
								<span className="flag-rating">{player.adjusted_rating}</span>
							</span>
						</Link>
					</li>
				);
			})}
		</ol>
	);
}
