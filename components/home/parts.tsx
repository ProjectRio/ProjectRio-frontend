/* eslint-disable @next/next/no-img-element */
import type { LadderPlayer } from '@/lib/api';
import type { BoardData } from './boards';
import Flags, { FLAG_SPOTS } from './Flags';
import { MENU_ITEMS } from './menu';
import { project, type Scene } from './scene';

/* How tall a player's head stands on the field, in metres: the game's own scale would be a speck. */
const HEAD = 6.6;

/**
 * The stadium the board stands in: always Mario Stadium, whatever park the
 * game on the board was played in. It hangs from a .title-stage with its near
 * edge on the stage's bottom edge; the stage keeps room for it under the
 * board, so the whole park is always on the page.
 *
 * The art is a PNG because the SVG it is rendered from is built of triangles,
 * and browsers leave hairlines between them once the park is tilted. It covers
 * the same 156 by 140 metres as the SVG, home plate at the origin, so the
 * marks below still land where the ball did. To redraw it:
 * design-language-v4/refinement/render-park-png.mjs.
 *
 * What lies on the grass (a player's shadow, the mark where a ball came down)
 * is drawn flat inside the tilted park. What stands up from it (a player, a
 * ball's flight, the ranked ladder's flagpoles) is drawn over the park with the same
 * camera sum, so it rises off the picture.
 */
export function Stadium({
	scene,
	ladder
}: {
	scene: Scene | null;
	ladder: { season: string; players: LadderPlayer[] } | null;
}) {
	const at = (x: number, z: number, up = 0) => {
		const p = project(x, z, up);
		return `${p.x.toFixed(4)},${p.y.toFixed(4)}`;
	};

	return (
		<>
			<div className="title-park hidden lg:block" aria-hidden>
				<img src="/images/parks/mario.png" alt="" className="block w-full" />
				{ladder && (
					<svg viewBox="-78 -112 156 140" className="route-in absolute inset-0 h-full w-full overflow-visible">
						{FLAG_SPOTS.slice(0, ladder.players.length).map((spot, i) => (
							<ellipse key={i} cx={spot.x} cy={-spot.z} rx="1.5" ry="1.1" fill="rgb(0 0 0 / 0.4)" />
						))}
					</svg>
				)}
				{scene && scene.players.length + scene.balls.length > 0 && (
					<svg key={scene.key} viewBox="-78 -112 156 140" className="route-in absolute inset-0 h-full w-full overflow-visible">
						{scene.players.map((player) => (
							<ellipse key={player.key} cx={player.x} cy={-player.z} rx="2.5" ry="1.9" fill="rgb(0 0 0 / 0.32)" />
						))}
						{scene.balls.map((ball) =>
							ball.hit ? (
								<circle key={ball.key} cx={ball.x} cy={-ball.z} r="1.3" fill="var(--color-star-400)" stroke="#7a5a00" strokeWidth="0.5" />
							) : (
								<circle
									key={ball.key}
									cx={ball.x}
									cy={-ball.z}
									r="1.05"
									fill="rgb(0 0 0 / 0.4)"
									stroke="var(--color-fog-100)"
									strokeWidth="0.5"
									strokeOpacity="0.75"
								/>
							)
						)}
						{scene.balls
							.filter((ball) => ball.lit)
							.map((ball) => (
								<circle key={ball.key} cx={ball.x} cy={-ball.z} r="3.4" fill="none" stroke="var(--color-fog-100)" strokeWidth="0.7" />
							))}
					</svg>
				)}
			</div>

			{scene && scene.players.length > 0 && (
				<div key={scene.key} className="title-field route-in hidden lg:block" aria-hidden>
					{scene.players.map((player) => {
						const p = project(player.x, player.z);
						return (
							<img
								key={player.key}
								src={player.image}
								alt=""
								className="title-head"
								style={
									{
										'--x': p.x.toFixed(4),
										'--y': p.y.toFixed(4),
										'--size': ((HEAD / 156) * p.scale).toFixed(4)
									} as React.CSSProperties
								}
							/>
						);
					})}
				</div>
			)}

			{ladder && (
				<div key={ladder.season} className="title-field hidden lg:block">
					<Flags season={ladder.season} players={ladder.players} />
				</div>
			)}

			{scene?.flight && (
				<div key={scene.key} className="title-field route-in hidden lg:block" aria-hidden>
					<svg key={scene.flight.key} viewBox="-0.5 -0.5 1 1" className="title-flight">
						{/* The ball's shadow along the grass, then the flight above it. */}
						<polyline points={scene.flight.points.map(([x, , z]) => at(x, z)).join(' ')} stroke="rgb(0 0 0 / 0.38)" strokeWidth="3" />
						<polyline points={scene.flight.points.map(([x, y, z]) => at(x, z, y)).join(' ')} stroke="rgb(0 0 0 / 0.55)" strokeWidth="5.5" pathLength={1} />
						<polyline points={scene.flight.points.map(([x, y, z]) => at(x, z, y)).join(' ')} stroke="var(--color-fog-100)" strokeWidth="2.5" pathLength={1} />
					</svg>
				</div>
			)}
		</>
	);
}

/** The board: the one piece of chrome on the page, showing the lit row. */
export function BoardStage({ index, data }: { index: number; data: BoardData }) {
	const item = MENU_ITEMS[index];
	const Board = item.Board;
	return (
		<section
			aria-label={item.label}
			aria-live="polite"
			data-fold={item.fold}
			className="title-board relative flex flex-col"
		>
			<div key={item.key} className="route-in flex min-h-0 flex-1 flex-col">
				<Board {...data} />
			</div>
		</section>
	);
}
