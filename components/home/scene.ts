import type { GameSummary, ScoringPlay } from '@/lib/api';
import { characterImage } from '@/lib/data/characters';
import type { LandingRow } from '@/lib/landingData';
import { parseLiveTeam } from '@/lib/liveGame';
import { trajectoryPoints, type Point3 } from '@/lib/landingTrajectory';

/**
 * What the stadium behind the board is showing. The park itself is always
 * Mario Stadium, so a scene says nothing about which park. A game in progress
 * puts its players on the field; a finished one leaves where its balls came
 * down and the flight of one of them. Nothing on the field is labelled.
 * Positions are the game's own: metres, home plate at the origin, x toward
 * first base, z toward centre field.
 */
export interface Scene {
	/** Stable per game, so a refresh of the same game does not fade the field out and in. */
	key: string;
	/** Who is standing where, for a game in progress. */
	players: { key: string; image: string; x: number; z: number }[];
	/** Where each ball in play came down. */
	balls: { key: number; x: number; z: number; hit: boolean; lit: boolean }[];
	/** The lit ball's flight, sampled from contact to landing. */
	flight: { key: number; points: Point3[] } | null;
}

/* The park art is drawn in metres too, 156 wide by 140 deep, home plate 42 below its centre. */
const ART_WIDTH = 156;
const ART_CENTRE_Z = 42;
/* The camera in .title-park: tipped 48deg about the art's centre, seen from 1.2 widths. */
const TILT = (48 * Math.PI) / 180;
const CAMERA = 1.2;

/**
 * A point on (or `up` metres above) the field, as the tilted park shows it:
 * an offset from the park's centre in park widths, and how much nearer or
 * farther than the centre it is. This is the same sum the browser does for
 * .title-park, so a ball's flight drawn with it rises off the picture.
 */
export function project(x: number, z: number, up = 0) {
	const across = x / ART_WIDTH;
	const down = (ART_CENTRE_Z - z) / ART_WIDTH;
	const height = up / ART_WIDTH;
	const y = down * Math.cos(TILT) - height * Math.sin(TILT);
	const depth = down * Math.sin(TILT) + height * Math.cos(TILT);
	const scale = CAMERA / (CAMERA - depth);
	return { x: across * scale, y: y * scale, scale };
}

/*
 * Where each fielder stands, by the live feed's position id (P, C, 1B, 2B,
 * 3B, SS, LF, CF, RF). These are the game's own starting spots, except that
 * the corner infielders play a step behind their bags and the catcher a step
 * back, so a runner on first or the batter is not standing on top of them.
 */
const FIELDERS: [number, number][] = [
	[0, 18.4],
	[0, -6],
	[22.5, 25],
	[11, 36],
	[-22.5, 25],
	[-11, 36],
	[-34, 60],
	[0, 76],
	[34, 60]
];
const BASES = { first: [19, 19], second: [0, 38], third: [-19, 19] } as const;
/* A right-handed batter stands on the third-base side of the plate. */
const BOX_X = 4.6;

/**
 * The game in progress: the side in the field at its nine positions, the
 * batter in the box and a runner on every occupied base.
 */
export function liveScene(game: any): Scene {
	const top = game.half_inning === 0;
	const batting = top ? 'away' : 'home';
	const fielding = parseLiveTeam(game, top ? 'home' : 'away');
	const lineup = parseLiveTeam(game, batting);
	const players: Scene['players'] = [];

	for (const slot of fielding.slots) {
		const spot = FIELDERS[slot.positionId];
		if (spot) players.push({ key: `field-${slot.positionId}`, image: characterImage(slot.name), x: spot[0], z: spot[1] });
	}
	const batter = lineup.slots[game.batter];
	if (batter) {
		players.push({ key: 'batter', image: characterImage(batter.name), x: game.batter_hand === 1 ? BOX_X : -BOX_X, z: 0.5 });
	}
	for (const [base, [x, z]] of Object.entries(BASES)) {
		const runner = lineup.slots[game[`runner_on_${base}_roster`]];
		if (runner && Number(game[`runner_on_${base}`])) players.push({ key: base, image: characterImage(runner.name), x, z });
	}

	// Farthest first, so a player nearer the camera stands in front.
	players.sort((a, b) => b.z - a.z);
	return { key: `live-${game.start_time}-${game.home_player}`, players, balls: [], flight: null };
}

const reachedBase = (row: LandingRow) => row.category === 'hit' || row.category === 'hr';

/**
 * A finished game: every ball put in play, and the flight of the lit scoring
 * play. The marks are only true against Mario Stadium's walls, so the caller
 * passes landings for a game played there and nothing for any other park.
 */
export function sprayScene(game: GameSummary, landings: LandingRow[], play: ScoringPlay | null): Scene {
	// A result of 0 is a foul that kept the at-bat going; walks never left the bat.
	const inPlay = landings.filter((row) => row.result !== 0 && row.category !== 'walk');
	const row = play ? inPlay.find((r) => r.eventNum === play.event_num) : undefined;

	return {
		key: `final-${game.game_id}`,
		players: [],
		balls: inPlay
			.map((r) => ({ key: r.eventNum, x: r.landingX, z: r.landingZ, hit: reachedBase(r), lit: r === row }))
			// Outs first, so a hit that came down on the same patch of grass stays on top.
			.sort((a, b) => Number(a.hit) - Number(b.hit)),
		flight: row ? { key: row.eventNum, points: trajectoryPoints(row, 32) } : null
	};
}

/** Hits for each side's H column, counted from the balls that came down for one. */
export function hitsBySide(game: GameSummary, landings: LandingRow[]) {
	const hits = landings.filter((row) => row.result !== 0 && reachedBase(row));
	return {
		away: hits.filter((row) => row.batterUser === game.away_user).length,
		home: hits.filter((row) => row.batterUser === game.home_user).length
	};
}

const HOME_RUN = 0xa;

/**
 * The play a finished game is remembered by: most runs driven in, a home run
 * over anything else, the later one on a tie. Given the landings, only plays
 * whose ball flight was recorded are considered.
 */
export function headlinePlay(plays: ScoringPlay[], landings: LandingRow[] | null): ScoringPlay | null {
	const tracked = landings && new Set(landings.map((row) => row.eventNum));
	const pool = tracked ? plays.filter((play) => tracked.has(play.event_num)) : plays;
	const weight = (play: ScoringPlay) => play.result_rbi * 2 + Number(play.result_of_ab === HOME_RUN);
	return [...(pool.length ? pool : plays)].sort((a, b) => weight(b) - weight(a) || b.event_num - a.event_num)[0] ?? null;
}

/** The headline play and the next biggest, back in the order they happened. */
export function keyPlays(plays: ScoringPlay[], headline: ScoringPlay | null, count: number): ScoringPlay[] {
	const rest = plays
		.filter((play) => play !== headline)
		.sort((a, b) => b.result_rbi - a.result_rbi || a.event_num - b.event_num);
	return [...(headline ? [headline] : []), ...rest].slice(0, count).sort((a, b) => a.event_num - b.event_num);
}
