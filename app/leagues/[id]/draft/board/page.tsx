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
					<p className="kicker">{draft.league_name} · {draft.collection}</p>
					<h1 className="flex items-center gap-3 text-3xl uppercase">
						Draft board <StateChip state={draft.state} paused={draft.paused} />
					</h1>
				</div>
				<Link href={`/leagues/${leagueId}/draft`} className="font-display text-xs font-semibold uppercase tracking-widest text-fog-500 hover:text-fog-100">
					← Room
				</Link>
			</div>
			{(lot || clockTeam) && draft.state === 'live' && (
				<Panel className="mb-4 flex flex-wrap items-center gap-6 p-4">
					{lot && (
						<>
							<AssetSprite asset={lot.asset} size={72} />
							<div>
								<div className="font-display text-[10px] font-semibold uppercase tracking-widest text-fog-500">On the block · {FORMAT_LABELS[draft.format]}</div>
								<div className="text-3xl uppercase leading-none">{lot.asset.name}</div>
								<div className="text-xs text-fog-500">nom. {findTeam(snapshot, lot.nominated_by_team_id)?.name}</div>
							</div>
							{current.kind === 'auction' && current.awaiting_opening && (
								<div className="ml-auto text-right">
									<div className="font-display text-[10px] font-semibold uppercase tracking-widest text-fog-500">Opening bid</div>
									<div className="font-display text-xl font-bold uppercase leading-none text-fog-300">Waiting on {findTeam(snapshot, lot.nominated_by_team_id)?.name}</div>
								</div>
							)}
							{high && (
								<div className="ml-auto text-right">
									<div className="font-display text-[10px] font-semibold uppercase tracking-widest text-fog-500">Leading</div>
									<div className="font-display text-5xl font-bold leading-none tabular-nums">
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
								<div className="font-display text-[10px] font-semibold uppercase tracking-widest text-fog-500">On the clock · pick {current.on_the_clock?.pick_number}</div>
								<div className="text-3xl uppercase leading-none">{clockTeam.name}</div>
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
					<div className="border-b border-night-700 bg-night-850 px-3 py-2 font-display text-xs font-bold uppercase tracking-widest text-fog-300">Results</div>
					<ResultsFeed snapshot={snapshot} limit={20} maxHeight="max-h-[80vh]" />
				</Panel>
			</div>
		</div>
	);
}
