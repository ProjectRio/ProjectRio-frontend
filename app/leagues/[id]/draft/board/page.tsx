'use client';

// Read-only board for streams and venues: the board, the current lot, and a
// ticker. No controls, no preview chrome beyond a tiny identity switch.

import { use } from 'react';
import Link from 'next/link';
import { useDraft } from '@/lib/draft/useDraft';
import { useFocusMode } from '@/components/draft/DraftRoom';
import { FORMAT_LABELS } from '@/lib/draft/types';
import DraftBoard from '@/components/draft/DraftBoard';
import ResultsFeed from '@/components/draft/ResultsFeed';
import { AssetSprite, Clock, findTeam, Money, StateChip, TeamLogo } from '@/components/draft/primitives';
import { Panel, Spinner } from '@/components/ui';

export default function BoardPage({ params }: { params: Promise<{ id: string }> }) {
	const { id } = use(params);
	const leagueId = Number(id);
	const handle = useDraft(leagueId);
	const { snapshot } = handle;
	useFocusMode(true);
	if (!snapshot) return <Spinner label="Loading the board…" />;
	const { draft, current } = snapshot;
	const lot = current.kind === 'auction' || current.kind === 'vickrey' ? current.nomination : null;
	const high = current.kind === 'auction' ? current.high_bid : null;
	const highTeam = findTeam(snapshot, high?.team_id);
	const clockTeam = current.kind === 'snake' ? findTeam(snapshot, current.on_the_clock?.team_id) : null;

	return (
		<div>
			<div className="mb-4 flex flex-wrap items-end justify-between gap-3">
				<div>
					<p className="flex gap-2 font-display text-sm font-semibold text-star-400">
						<span>{draft.league_name}</span>
						<span className="text-fog-300">{draft.collection}</span>
					</p>
					<h1 className="flex items-center gap-3 text-3xl">
						Draft board <StateChip state={draft.state} paused={draft.paused} />
					</h1>
					</div>
					<Link href={`/leagues/${leagueId}/draft`} className="key px-2.5 pb-0.5 pt-1 font-display text-xs font-semibold">
					Room
					</Link>
			</div>
			{(lot || clockTeam) && draft.state === 'live' && (
				<Panel className="mb-4 flex flex-wrap items-center gap-6 p-4">
					{lot && (
						<>
							<AssetSprite asset={lot.asset} size={72} />
							<div>
								<div className="flex gap-2 font-display text-[11px] font-semibold uppercase tracking-wider text-fog-500">
									<span>On the block</span>
									<span className="text-fog-300">{FORMAT_LABELS[draft.format]}</span>
								</div>
								<div className="font-display text-3xl font-semibold leading-none">{lot.asset.name}</div>
								<div className="text-xs text-fog-500">nom. {findTeam(snapshot, lot.nominated_by_team_id)?.name}</div>
							</div>
							{current.kind === 'auction' && current.awaiting_opening && (
								<div className="ml-auto text-right">
									<div className="font-display text-[11px] font-semibold uppercase tracking-wider text-fog-500">Opening bid</div>
									<div className="font-display text-xl font-semibold leading-none text-fog-100">Waiting on {findTeam(snapshot, lot.nominated_by_team_id)?.name}</div>
								</div>
							)}
							{high && (
								<div className="ml-auto text-right">
									<div className="font-display text-[11px] font-semibold uppercase tracking-wider text-fog-500">Leading</div>
									<div className="font-mono text-5xl font-semibold leading-none tabular-nums text-star-400">
										<Money amount={high.amount} />
									</div>
									<div className="flex items-center justify-end gap-1.5 text-sm text-fog-300">
										{highTeam && <TeamLogo logo={highTeam.logo} name={highTeam.name} size={16} />}
										{highTeam?.name}
									</div>
								</div>
							)}
							<Clock closesAt={lot.closes_at} pausedRemaining={lot.paused_remaining_s} paused={draft.paused} serverNow={handle.serverNow} total={draft.config.lot_seconds ?? undefined} size={96} />
						</>
					)}
					{clockTeam && current.kind === 'snake' && (
						<>
							<TeamLogo logo={clockTeam.logo} name={clockTeam.name} size={64} />
							<div>
								<div className="flex gap-2 font-display text-[11px] font-semibold uppercase tracking-wider text-fog-500">
									<span>On the clock</span>
									<span className="font-mono normal-case tracking-normal text-fog-300">pick {current.on_the_clock?.pick_number}</span>
								</div>
								<div className="font-display text-3xl font-semibold leading-none">{clockTeam.name}</div>
							</div>
							<div className="ml-auto">
								<Clock closesAt={current.on_the_clock?.closes_at ?? null} paused={draft.paused} serverNow={handle.serverNow} untimedLabel="No clock" total={draft.config.pick_seconds ?? undefined} size={96} />
							</div>
						</>
					)}
				</Panel>
			)}
			<div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_18rem]">
				<Panel className="p-2">
					<DraftBoard snapshot={snapshot} previous={handle.previous} readOnly />
				</Panel>
				<Panel>
					<h2 className="px-3 pb-1 pt-3 text-lg">Results</h2>
					<ResultsFeed snapshot={snapshot} limit={20} maxHeight="max-h-[80vh]" />
				</Panel>
			</div>
		</div>
	);
}
