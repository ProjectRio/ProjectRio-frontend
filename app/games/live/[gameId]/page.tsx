'use client';

/* eslint-disable @next/next/no-img-element */

import { use, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getLiveGames, getMatchups } from '@/lib/api';
import { useTagsets } from '@/lib/useTagsets';
import { tagSetName, outsDisplay, ordinal } from '@/lib/gameDisplay';
import { characterImage, stadiums } from '@/lib/data/characters';
import { teamNameFromLogo, logoImage } from '@/lib/data/logoToTeam';
import { parseLiveTeam, handLabel, inningsPitched, slotStatus, type LiveTeam, type LiveRosterSlot } from '@/lib/liveGame';
import LiveFieldView from '@/components/LiveFieldView';
import LineScore, { MetaItem } from '@/components/LineScore';
import { Spinner, EmptyState, Badge, Panel, PanelHeader, PlayerLink, LiveDot } from '@/components/ui';

const REFRESH_MS = 15_000;
// The endpoint only returns ongoing games; keep a generous window so a game
// that's been running a while still resolves from a direct link.
const LOOKBACK_SECONDS = 24 * 60 * 60;

function StarMeter({ stars }: { stars: number }) {
	return (
		<p className="text-sm tracking-wide text-star-400" title={`${stars} team star${stars === 1 ? '' : 's'}`}>
			{'★'.repeat(Math.min(stars, 5)) + '☆'.repeat(Math.max(5 - stars, 0))}
		</p>
	);
}

function TeamHero({ team, batting, align }: { team: LiveTeam; batting: boolean; align: 'left' | 'right' }) {
	const right = align === 'right';
	return (
		<div className={`flex items-center gap-4 ${right ? 'flex-row-reverse text-right' : ''}`}>
			<img src={logoImage(team.logoId)} alt={teamNameFromLogo(team.logoId)} className="h-16 w-16 object-contain" />
			<div className="min-w-0">
				<p className="truncate font-display text-xs font-semibold uppercase tracking-widest text-fog-500">
					{teamNameFromLogo(team.logoId)}
				</p>
				<div className={`flex flex-wrap items-center gap-2 ${right ? 'justify-end' : ''}`}>
					<PlayerLink username={team.player} className="font-display text-xl font-bold" />
					{batting && <span className="text-xs font-semibold text-star-400">AT BAT</span>}
				</div>
				<div className={`flex flex-wrap items-center gap-2 ${right ? 'justify-end' : ''}`}>
					<StarMeter stars={team.stars} />
					{team.allSuperstars && <Badge color="gold">All Superstars</Badge>}
				</div>
			</div>
			<span className={`font-display text-5xl font-bold tabular-nums text-fog-100 ${right ? 'mr-auto' : 'ml-auto'}`}>
				{team.score}
			</span>
		</div>
	);
}

function MiniLineScore({ game, away, home, mode }: { game: any; away: LiveTeam; home: LiveTeam; mode: string }) {
	const awayScores: number[] = game.away_inning_scores ?? [];
	const homeScores: number[] = game.home_inning_scores ?? [];
	const innings = Math.max(game.innings_selected ?? 0, game.inning ?? 0, awayScores.length, homeScores.length);
	const minutesAgo = Math.max(0, Math.round((Date.now() / 1000 - game.start_time) / 60));
	const startedAt = new Date(game.start_time * 1000).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });

	// 0 = away, 1 = home; the batting side is set by half_inning.
	const battingSide = game.half_inning === 0 ? 0 : 1;

	return (
		<LineScore
			innings={innings}
			regulationInnings={game.innings_selected}
			cellHighlight={(inning, side) => inning === game.inning && side === battingSide}
			teams={[
				{ label: away.player, runs: awayScores, total: away.score },
				{ label: home.player, runs: homeScores, total: home.score }
			]}
			meta={
				<>
					{mode && <MetaItem label="Mode" value={mode} />}
					<MetaItem label="Stadium" value={stadiums[game.stadium_id] ?? 'Unknown'} />
					<MetaItem label="Format" value={`${game.innings_selected} innings`} />
					<MetaItem label="Started" value={`${startedAt} · ${minutesAgo} min ago`} />
				</>
			}
		/>
	);
}

function StatCell({ label, value }: { label: string; value: string | number }) {
	return (
		<div className="rounded bg-night-850 px-2 py-1.5 text-center">
			<p className="text-[10px] font-semibold uppercase tracking-wider text-fog-500">{label}</p>
			<p className="font-display text-base font-bold tabular-nums text-fog-100">{value}</p>
		</div>
	);
}

function PlayerBadges({ slot, allSuperstars }: { slot: LiveRosterSlot; allSuperstars: boolean }) {
	return (
		<>
			{slot.isCaptain && (
				<span className="text-sm leading-none" title="Captain">
					👑
				</span>
			)}
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
			<PanelHeader
				title="At Bat"
				action={game.star_chance ? <Badge color="gold">★ Star Chance</Badge> : undefined}
			/>
			<div className="space-y-3 p-4">
				<div className="flex items-center gap-3">
					<img src={characterImage(slot.name)} alt={slot.name} className="h-14 w-14 object-contain" />
					<div>
						<p className="flex items-center gap-1.5 font-display text-lg font-bold text-fog-100">
							{slot.name}
							<PlayerBadges slot={slot} allSuperstars={batting.allSuperstars} />
						</p>
						<p className="text-xs text-fog-500">
							{batting.player} · Bats {handLabel(game.batter_hand)} · {hits}-{ab} today
						</p>
					</div>
				</div>
				<div className="grid grid-cols-4 gap-1.5">
					<StatCell label="H" value={hits} />
					<StatCell label="AB" value={ab} />
					<StatCell label="HR" value={stats['Homeruns'] ?? 0} />
					<StatCell label="RBI" value={stats['RBI'] ?? 0} />
					<StatCell label="2B" value={stats['Doubles'] ?? 0} />
					<StatCell label="3B" value={stats['Triples'] ?? 0} />
					<StatCell label="BB" value={walks} />
					<StatCell label="K" value={stats['Strikeouts'] ?? 0} />
					<StatCell label="SB" value={stats['Bases Stolen'] ?? 0} />
					<StatCell label="Bunts" value={stats['Successful Bunts'] ?? 0} />
					<StatCell label="Sac Fly" value={stats['Sac Flys'] ?? 0} />
					<StatCell label="Star Hits" value={stats['Star Hits'] ?? 0} />
				</div>
			</div>
		</Panel>
	);
}

function StaminaBar({ stamina }: { stamina: number }) {
	const pct = Math.max(0, Math.min(stamina, 10)) * 10;
	const color = stamina >= 6 ? 'bg-emerald-400' : stamina >= 3 ? 'bg-star-400' : 'bg-rio-500';
	return (
		<div>
			<div className="mb-1 flex items-center justify-between text-[10px] font-semibold uppercase tracking-wider text-fog-500">
				<span>Stamina</span>
				<span>{stamina}/10</span>
			</div>
			<div className="h-2 overflow-hidden rounded-full bg-night-700">
				<div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
			</div>
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
				<div className="grid grid-cols-4 gap-1.5">
					<StatCell label="Pitches" value={stats['Pitches Thrown'] ?? 0} />
					<StatCell label="K" value={stats['Strikeouts'] ?? 0} />
					<StatCell label="BF" value={stats['Batters Faced'] ?? 0} />
					<StatCell label="H" value={stats['Hits Allowed'] ?? 0} />
					<StatCell label="R" value={stats['Runs Allowed'] ?? 0} />
					<StatCell label="ER" value={stats['Earned Runs'] ?? 0} />
					<StatCell label="HR" value={stats['HRs Allowed'] ?? 0} />
					<StatCell label="BB" value={walks} />
				</div>
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
							<tr key={slot.rosterIdx} className={status ? 'bg-rio-500/5' : ''}>
								<td className="text-fog-500">{slot.rosterIdx + 1}</td>
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
										<span className="font-display text-[10px] font-bold uppercase tracking-wider text-rio-300">
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

	return (
		<div className="space-y-6">
			<div className="flex flex-wrap items-center justify-between gap-2">
				<Link href="/games/live" className="text-sm text-fog-500 transition-colors hover:text-rio-300">
					← All live games
				</Link>
				<div className="flex items-center gap-2">
					{game._devFixture && <Badge color="gold">Example data (dev)</Badge>}
					{ended && <Badge color="gray">Game ended — taking you to the final box score once it posts…</Badge>}
				</div>
			</div>

			{/* Scoreboard — sticks under the nav so the score stays visible while scrolling */}
			<div className="panel sticky top-16 z-40 overflow-hidden p-6 shadow-lg shadow-night-950/50">
				<div
					className="pointer-events-none absolute inset-0"
					style={{ backgroundImage: 'radial-gradient(ellipse 70% 120% at 50% -20%, rgb(230 0 18 / 0.18), transparent)' }}
				/>
				<div className="relative grid items-center gap-6 sm:grid-cols-[1fr_auto_1fr]">
					<TeamHero team={away} batting={battingSide === 'away'} align="left" />
					<div className="space-y-2 text-center">
						<p className="flex items-center justify-center gap-2 font-display text-sm font-bold uppercase tracking-widest text-rio-400">
							<LiveDot /> {game.half_inning === 0 ? 'Top' : 'Bot'} {ordinal(game.inning)}
						</p>
						<p className="font-mono text-sm text-fog-300" title={`${game.outs} out${game.outs === 1 ? '' : 's'}`}>
							{outsDisplay(game.outs)}
						</p>
						{game.star_chance && (
							<p className="animate-pulse font-display text-sm font-bold uppercase tracking-widest text-star-400">
								★ Star Chance ★
							</p>
						)}
					</div>
					<TeamHero team={home} batting={battingSide === 'home'} align="right" />
				</div>
			</div>

			{/* Line score + game meta — scrolls normally */}
			<MiniLineScore game={game} away={away} home={home} mode={mode} />

			{/* Field + current matchup */}
			<div className="grid gap-6 lg:grid-cols-[1.25fr_1fr]">
				<Panel>
					<PanelHeader title={stadiums[game.stadium_id] ?? 'Field'} />
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
