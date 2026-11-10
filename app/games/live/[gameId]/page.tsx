'use client';

/* eslint-disable @next/next/no-img-element */

import { use, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getLiveGames, getMatchups } from '@/lib/api';
import { useTagsets } from '@/lib/useTagsets';
import { tagSetName, ordinal } from '@/lib/gameDisplay';
import { characterImage, stadiums } from '@/lib/data/characters';
import { teamNameFromLogo, logoImage } from '@/lib/data/logoToTeam';
import { parseLiveTeam, handLabel, inningsPitched, slotStatus, type LiveTeam, type LiveRosterSlot } from '@/lib/liveGame';
import LiveFieldView from '@/components/LiveFieldView';
import Scoreboard, { type ScoreboardTeam } from '@/components/game/Scoreboard';
import { BaseDiamond, CaptainMark, OutPips, StarOrbs } from '@/components/game/hud';
import { useGamePark } from '@/lib/useGamePark';
import { Spinner, EmptyState, Badge, Panel, PanelHeader, PlayerLink, LiveDot } from '@/components/ui';

const REFRESH_MS = 10_000;
// The endpoint only returns ongoing games; keep a generous window so a game
// that's been running a while still resolves from a direct link.
const LOOKBACK_SECONDS = 24 * 60 * 60;

/** One row of counting stats, set like the back of a baseball card. */
function StatLine({ stats }: { stats: [string, string | number][] }) {
	return (
		<div className="overflow-x-auto">
			<table className="w-full text-center">
				<thead>
					<tr className="font-display text-xs font-semibold uppercase tracking-[0.1em] text-fog-500">
						{stats.map(([label]) => (
							<th key={label} className="px-2 pb-1 font-semibold">
								{label}
							</th>
						))}
					</tr>
				</thead>
				<tbody>
					<tr className="font-mono text-lg font-semibold tabular-nums text-fog-100">
						{stats.map(([label, value]) => (
							<td key={label} className={`px-2 ${value === 0 ? 'text-fog-500' : ''}`}>
								{value}
							</td>
						))}
					</tr>
				</tbody>
			</table>
		</div>
	);
}

function PlayerBadges({ slot, allSuperstars }: { slot: LiveRosterSlot; allSuperstars: boolean }) {
	return (
		<>
			{slot.isCaptain && <CaptainMark />}
			{slot.isSuperstar && !allSuperstars && (
				<span className="text-star-400" title="Superstar">
					★
				</span>
			)}
		</>
	);
}

function BatterCard({ game, batting }: { game: any; batting: LiveTeam }) {
	const slot = batting.slots[game.batter];
	const stats = game.batter_stats ?? {};
	const ab = stats['At Bats'] ?? 0;
	const hits = stats['Hits'] ?? 0;
	const walks = (stats['Walks (4 Balls)'] ?? 0) + (stats['Walks (Hit)'] ?? 0);
	if (!slot) return null;

	return (
		<Panel>
			<PanelHeader title="At Bat" />
			<div className="space-y-3 p-4">
				<div className="flex items-center gap-3">
					<img src={characterImage(slot.name)} alt={slot.name} className="h-14 w-14 object-contain" />
					<div>
						<p className="flex items-center gap-1.5 font-display text-lg font-bold text-fog-100">
							{slot.name}
							<PlayerBadges slot={slot} allSuperstars={batting.allSuperstars} />
						</p>
						<p className="text-xs text-fog-500">
							{batting.player} · Bats {handLabel(game.batter_hand)}
						</p>
					</div>
				</div>
				<StatLine
					stats={[
						['AB', ab],
						['H', hits],
						['2B', stats['Doubles'] ?? 0],
						['3B', stats['Triples'] ?? 0],
						['HR', stats['Homeruns'] ?? 0],
						['RBI', stats['RBI'] ?? 0],
						['BB', walks],
						['K', stats['Strikeouts'] ?? 0],
						['SB', stats['Bases Stolen'] ?? 0],
						['Star', stats['Star Hits'] ?? 0]
					]}
				/>
			</div>
		</Panel>
	);
}

function StaminaBar({ stamina }: { stamina: number }) {
	const pct = Math.max(0, Math.min(stamina, 10)) * 10;
	// Fill, and the same hue darkened for the outline — the game's gauge recipe.
	const [fill, edge] = stamina >= 6 ? ['#4aad10', '#1f5c00'] : stamina >= 3 ? ['#ffbd00', '#8a5a00'] : ['#e63e3e', '#7c1017'];
	return (
		<div className="flex items-center gap-3">
			<span className="font-display text-xs font-semibold uppercase tracking-[0.12em] text-fog-500">Stamina</span>
			<div className="h-3.5 flex-1 overflow-hidden rounded-full border border-[var(--rim)] bg-black/50">
				<div
					className="h-full rounded-full border [box-shadow:inset_0_2px_0_rgb(255_255_255/0.35)]"
					style={{ width: `${pct}%`, backgroundColor: fill, borderColor: edge }}
				/>
			</div>
			<span className="font-mono text-sm font-semibold tabular-nums text-fog-100">{stamina}</span>
		</div>
	);
}

function PitcherCard({ game, fielding }: { game: any; fielding: LiveTeam }) {
	const slot = fielding.slots[game.pitcher];
	const stats = game.pitcher_stats ?? {};
	const walks = (stats['Batters Walked'] ?? 0) + (stats['Batters Hit'] ?? 0);
	if (!slot) return null;

	return (
		<Panel>
			<PanelHeader title="Pitching" />
			<div className="space-y-3 p-4">
				<div className="flex items-center gap-3">
					<img src={characterImage(slot.name)} alt={slot.name} className="h-14 w-14 object-contain" />
					<div className="min-w-0 flex-1">
						<p className="flex items-center gap-1.5 font-display text-lg font-bold text-fog-100">
							{slot.name}
							<PlayerBadges slot={slot} allSuperstars={fielding.allSuperstars} />
						</p>
						<p className="text-xs text-fog-500">
							{fielding.player} · {inningsPitched(stats['Outs Pitched'] ?? 0)} IP
						</p>
					</div>
				</div>
				<StaminaBar stamina={stats['Stamina'] ?? 0} />
				<StatLine
					stats={[
						['P', stats['Pitches Thrown'] ?? 0],
						['BF', stats['Batters Faced'] ?? 0],
						['H', stats['Hits Allowed'] ?? 0],
						['R', stats['Runs Allowed'] ?? 0],
						['ER', stats['Earned Runs'] ?? 0],
						['HR', stats['HRs Allowed'] ?? 0],
						['BB', walks],
						['K', stats['Strikeouts'] ?? 0]
					]}
				/>
			</div>
		</Panel>
	);
}

function RosterPanel({ game, team }: { game: any; team: LiveTeam }) {
	return (
		<Panel>
			<PanelHeader
				title={`${team.player} — ${teamNameFromLogo(team.logoId)}`}
				action={team.allSuperstars ? <Badge color="gold">All Superstars</Badge> : undefined}
			/>
			<table className="stat-table">
				<thead>
					<tr>
						<th>#</th>
						<th>Character</th>
						<th>Pos</th>
						<th></th>
					</tr>
				</thead>
				<tbody>
					{team.slots.map((slot) => {
						const status = slotStatus(game, team, slot.rosterIdx);
						return (
							<tr key={slot.rosterIdx} className={status ? 'bg-star-400/5' : ''}>
								<td className="font-mono tabular-nums text-fog-500">{slot.rosterIdx + 1}</td>
								<td>
									<span className="flex items-center gap-2">
										<img src={characterImage(slot.name)} alt="" className="h-6 w-6 object-contain" />
										<span className="text-fog-100">{slot.name}</span>
										<PlayerBadges slot={slot} allSuperstars={team.allSuperstars} />
									</span>
								</td>
								<td className="text-fog-300">{slot.position}</td>
								<td>
									{status && (
										<span className="font-display text-[10px] font-bold uppercase tracking-wider text-star-400">
											{status}
										</span>
									)}
								</td>
							</tr>
						);
					})}
				</tbody>
			</table>
		</Panel>
	);
}

export default function LiveGamePage({ params }: { params: Promise<{ gameId: string }> }) {
	const { gameId } = use(params);
	const startTime = parseInt(decodeURIComponent(gameId), 10);
	const [game, setGame] = useState<any | null>(null);
	const [ended, setEnded] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const tagsets = useTagsets();
	const router = useRouter();
	const gameRef = useRef<any | null>(null);
	useGamePark(game?.stadium_id);

	useEffect(() => {
		let cancelled = false;

		// Once the game leaves the ongoing list, look up its final game id by the
		// two players and send the viewer to the finished-game summary page.
		async function redirectToFinal(last: any) {
			const finals = await getMatchups(last.away_player, last.home_player);
			const final = finals.find((f) => Math.abs((f.date_time_start ?? 0) - last.start_time) < 600);
			if (final && !cancelled) router.replace(`/games/${final.game_id}`);
		}

		async function load() {
			try {
				const games = await getLiveGames(LOOKBACK_SECONDS);
				if (cancelled) return;
				const match = games.find((g) => g.start_time === startTime);
				if (match) {
					gameRef.current = match;
					setGame(match);
					setEnded(false);
				} else if (gameRef.current?._devFixture) {
					// Dev fixtures aren't real games — they drop out of the list as soon
					// as a real game goes live. Keep showing the fixture; never redirect.
				} else {
					setEnded(true);
					// Keep polling for the final box score until it posts.
					if (gameRef.current) await redirectToFinal(gameRef.current);
				}
				setError(null);
			} catch {
				if (!cancelled) setError('Could not reach the live games API. Retrying shortly…');
			}
		}

		load();
		const interval = setInterval(load, REFRESH_MS);
		return () => {
			cancelled = true;
			clearInterval(interval);
		};
	}, [startTime, router]);

	if (!game) {
		if (ended) {
			return (
				<EmptyState
					title="This game is no longer live"
					detail="It either ended or stopped reporting. Check recent games for the final box score."
				/>
			);
		}
		if (error) {
			return <EmptyState title="Connection trouble" detail={error} />;
		}
		return <Spinner label="Loading live game…" />;
	}

	const away = parseLiveTeam(game, 'away');
	const home = parseLiveTeam(game, 'home');
	const battingSide = game.half_inning === 0 ? 'away' : 'home';
	const batting = battingSide === 'away' ? away : home;
	const fielding = battingSide === 'away' ? home : away;
	const mode = tagSetName(tagsets, game.tag_set);
	const awayScores: number[] = game.away_inning_scores ?? [];
	const homeScores: number[] = game.home_inning_scores ?? [];
	const startedAt = new Date(game.start_time * 1000).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });

	return (
		<div className="space-y-6">
			{(game._devFixture || ended) && (
				<div className="flex flex-wrap items-center gap-2">
					{game._devFixture && <Badge color="gold">Example data (dev)</Badge>}
					{ended && <Badge color="gray">Game ended — taking you to the final box score once it posts…</Badge>}
				</div>
			)}

			<Scoreboard
				innings={Math.max(game.innings_selected ?? 0, game.inning ?? 0, awayScores.length, homeScores.length)}
				regulationInnings={game.innings_selected}
				cellHighlight={(inning, side) => inning === game.inning && side === (battingSide === 'away' ? 0 : 1)}
				status={
					<span className="flex items-center gap-2 text-rio-400">
						<LiveDot /> {game.half_inning === 0 ? 'Top' : 'Bot'} {ordinal(game.inning)}
					</span>
				}
				header={
					<>
						{mode && <span className="text-fog-100">{mode}</span>}
						<span>{stadiums[game.stadium_id] ?? 'Unknown'}</span>
						<span>First pitch {startedAt}</span>
					</>
				}
				teams={[away, home].map((team, side) => ({
					name: <PlayerLink username={team.player} className="!font-normal" />,
					detail: (
						<span className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
							{teamNameFromLogo(team.logoId)}
							<StarOrbs stars={team.stars} />
							{team.allSuperstars && <span className="text-star-400">All superstars</span>}
						</span>
					),
					image: logoImage(team.logoId),
					tag:
						(side === 0) === (battingSide === 'away') ? (
							<span className="flex-none font-display text-xs font-bold uppercase tracking-[0.12em] text-star-400">
								At bat
							</span>
						) : undefined,
					runs: side === 0 ? awayScores : homeScores,
					total: team.score
				})) as [ScoreboardTeam, ScoreboardTeam]}
			>
				<div className="flex flex-wrap items-center gap-x-8 gap-y-2 border-t border-[var(--rim)] bg-black/35 px-4 py-2.5">
					<BaseDiamond
						first={!!Number(game.runner_on_first)}
						second={!!Number(game.runner_on_second)}
						third={!!Number(game.runner_on_third)}
					/>
					<OutPips outs={game.outs} />
					{game.star_chance && (
						<span className="font-title text-lg text-star-400 [text-shadow:0_2px_0_rgb(0_0_0/0.5)]">Star Chance!</span>
					)}
				</div>
			</Scoreboard>

			{/* Field + current matchup */}
			<div className="grid gap-6 lg:grid-cols-[1.25fr_1fr]">
				<Panel>
					<LiveFieldView game={game} batting={batting} fielding={fielding} />
				</Panel>
				<div className="space-y-6">
					<BatterCard game={game} batting={batting} />
					<PitcherCard game={game} fielding={fielding} />
				</div>
			</div>

			{/* Rosters */}
			<div className="grid gap-6 lg:grid-cols-2">
				<RosterPanel game={game} team={away} />
				<RosterPanel game={game} team={home} />
			</div>
		</div>
	);
}
