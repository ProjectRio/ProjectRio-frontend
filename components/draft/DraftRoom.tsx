'use client';

// The draft room shell (§10c), built for density: the stage is one strip, the
// board is the centrepiece and always fits (your queue cell on it is where
// you nominate), the pool is a sprite grid below, and results plus the
// commissioner controls sit in a narrow rail. Focus mode drops the site
// chrome for streams.

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import type { Asset, DraftSnapshot } from '@/lib/draft/types';
import { useDraft, type DraftHandle } from '@/lib/draft/useDraft';
import { setPreview } from '@/lib/draft/preview';
import { Panel, Spinner } from '@/components/ui';
import CommissionerPanel from './CommissionerPanel';
import DraftBoard from './DraftBoard';
import LineupDrawer from './LineupDrawer';
import { NominationInline } from './NominationPicker';
import PoolPanel, { type PoolMode } from './PoolPanel';
import PreviewBar from './PreviewBar';
import PricingDrawer from './PricingDrawer';
import { RailFeed } from './ResultsFeed';
import RoomHeader from './RoomHeader';
import TargetsPanel from './TargetsPanel';
import AuctionStage from './stages/AuctionStage';
import RoundPoolStage from './stages/RoundPoolStage';
import SnakeStage from './stages/SnakeStage';
import VickreyStage from './stages/VickreyStage';
import { AssetSprite, findTeam, formatDuration, Money, PresenceDot, TeamLogo } from './primitives';

export function useFocusMode(focus: boolean) {
	useEffect(() => {
		document.documentElement.toggleAttribute('data-focus', focus);
		return () => document.documentElement.removeAttribute('data-focus');
	}, [focus]);
}

function RulesLine({ snapshot }: { snapshot: DraftSnapshot }) {
	const { config, format } = snapshot.draft;
	const parts = [
		`${config.slots.character}+${config.slots.stadium} slots`,
		format !== 'snake' ? `$${config.budget}` : null,
		format !== 'snake' && format !== 'fixed_price' ? `min $${config.min_bid} +$${config.bid_increment}` : null,
		config.lot_seconds ? `${config.lot_seconds}s +${config.extend_seconds}s` : format === 'snake' && config.pick_seconds ? `${config.pick_seconds}s picks` : 'untimed',
		format === 'auction' || format === 'vickrey' ? (config.advance === 'auto' ? 'auto advance' : 'commissioner opens lots') : null,
		format === 'vickrey' || format === 'round_pool' ? (config.ties.method === 'runoff' ? 'ties: nominator, then $1 runoff' : 'ties: nominator, then priority') : null,
		config.last_slot_takes_remaining && format !== 'snake' && format !== 'fixed_price' ? 'last slot takes remaining budget' : null,
		...config.restrictions.map((rule) => (rule.type === 'group_max' ? `${rule.name} ≤ ${rule.max}` : rule.type === 'captain_required' ? 'captain required' : rule.type === 'must_be_captain' ? 'must-be-captain' : 'handedness'))
	].filter(Boolean);
	return <p className="text-[11px] text-fog-500">{parts.join(' · ')}</p>;
}

function Lobby({ snapshot, handle }: { snapshot: DraftSnapshot; handle: DraftHandle }) {
	const { draft, teams, queue, you } = snapshot;
	const yourEntry = queue.find((entry) => entry.team_id === you.team_id);
	const queued = queue.filter((entry) => entry.asset).length;
	const needsQueue = draft.format === 'auction' || draft.format === 'vickrey' || draft.format === 'round_pool';
	return (
		<div className="space-y-2">
			<div className="flex flex-wrap items-center gap-x-4 gap-y-2">
				<div>
					<p className="kicker">Lobby</p>
					<h2 className="text-xl uppercase leading-none">Waiting for the commissioner</h2>
				</div>
				<p className="text-xs text-fog-500">
					{teams.filter((team) => team.present).length}/{teams.length} arrived{needsQueue ? ` · ${queued}/${queue.length} first nominations in` : ''}
				</p>
				<ol className="flex flex-wrap gap-1" title="Draft order">
					{teams.map((team, index) => (
						<li key={team.id} className={`flex items-center gap-1 rounded-full border px-1.5 py-0.5 text-[11px] ${team.id === you.team_id ? 'border-rio-500/60' : 'border-night-700'}`} title={team.managers.map((manager) => manager.username).join(' & ')}>
							<span className="font-display font-bold tabular-nums text-fog-500">{index + 1}</span>
							<TeamLogo logo={team.logo} name={team.name} size={16} />
							<span className="text-fog-300">{team.name}</span>
							<PresenceDot present={team.present} />
						</li>
					))}
				</ol>
				{you.role === 'commissioner' && (
					<button type="button" className="btn-primary ml-auto !py-1.5 text-sm" disabled={handle.pending.has('start')} onClick={() => handle.act({ type: 'start' })}>
						{handle.pending.has('start') ? 'Starting…' : 'Start the draft'}
					</button>
				)}
			</div>
			<RulesLine snapshot={snapshot} />
			{needsQueue && yourEntry && you.team_id !== null && (
				<div className={`rounded border px-3 py-1.5 ${yourEntry.asset ? 'border-night-700 bg-night-850' : 'border-rio-500/50 bg-rio-500/5'}`}>
					<NominationInline snapshot={snapshot} handle={handle} label="Your first nomination" />
				</div>
			)}
		</div>
	);
}

function CompletedSummary({ snapshot }: { snapshot: DraftSnapshot }) {
	const { teams, draft } = snapshot;
	const picks = teams.flatMap((team) => team.picks);
	const priciest = [...picks].filter((pick) => !pick.is_keeper && !pick.took_remaining_budget).sort((a, b) => b.price - a.price)[0];
	const total = picks.reduce((sum, pick) => sum + pick.price, 0);
	return (
		<div className="flex flex-wrap items-center gap-x-6 gap-y-2">
			<div>
				<p className="kicker">Completed</p>
				<h2 className="text-xl uppercase leading-none">Final rosters</h2>
				<p className="mt-0.5 text-[11px] text-fog-500">{draft.completed_at ? `${new Date(draft.completed_at).toLocaleString()} · ` : ''}committed to the ledger; changes from here are trades</p>
			</div>
			{draft.format !== 'snake' && (
				<>
					<div>
						<div className="font-display text-[10px] font-semibold uppercase tracking-widest text-fog-500">Spent</div>
						<div className="font-display text-2xl font-bold tabular-nums">
							<Money amount={total} />
						</div>
					</div>
					{priciest && (
						<div className="flex items-center gap-2">
							<AssetSprite asset={priciest.asset} size={36} />
							<div>
								<div className="font-display text-[10px] font-semibold uppercase tracking-widest text-fog-500">Biggest price</div>
								<div className="text-sm text-fog-100">
									{priciest.asset.name} · <span className="font-display font-bold text-star-400">${priciest.price}</span> · {findTeam(snapshot, priciest.team_id)?.name}
								</div>
							</div>
						</div>
					)}
				</>
			)}
			<Link href={`/leagues/${draft.league_id}`} className="btn-secondary ml-auto !py-1.5 text-xs">
				League page
			</Link>
		</div>
	);
}

function Unreachable({ leagueId, hasSnapshot }: { leagueId: number; hasSnapshot: boolean }) {
	return (
		<Panel className="p-8 text-center">
			<p className="font-display text-lg font-semibold uppercase tracking-wider text-rio-300">Server unreachable</p>
			<p className="mx-auto mt-2 max-w-md text-sm text-fog-500">{hasSnapshot ? 'Showing the last snapshot we received. ' : ''}Reconnecting… bids placed while disconnected are rejected, never lost.</p>
			<button type="button" className="btn-secondary mt-5" onClick={() => setPreview({ offline: false })}>
				Retry now
			</button>
			<p className="mt-3 text-xs text-fog-500">
				<Link href={`/leagues/${leagueId}`} className="underline decoration-dotted underline-offset-2">
					Back to the league
				</Link>
			</p>
		</Panel>
	);
}

export default function DraftRoom({ leagueId }: { leagueId: number }) {
	const handle = useDraft(leagueId);
	const { snapshot, connection, preview } = handle;
	const [selected, setSelected] = useState<Asset | null>(null);
	const [poolOpen, setPoolOpen] = useState(true);
	const [drawer, setDrawer] = useState<'lineup' | 'pricing' | null>(null);
	useFocusMode(preview.focus);

	const poolMode: PoolMode = useMemo(() => {
		if (!snapshot || snapshot.you.team_id === null) return 'browse';
		const { current, you, draft } = snapshot;
		if (draft.state === 'completed' || draft.state === 'setup') return 'browse';
		if (draft.format === 'snake') return you.can_act && current.kind === 'snake' && current.on_the_clock?.team_id === you.team_id ? 'pick' : 'browse';
		// Queue formats take nominations in the lobby too.
		if (draft.format === 'auction' || draft.format === 'vickrey' || draft.format === 'round_pool') return 'queue';
		return 'browse';
	}, [snapshot]);

	useEffect(() => {
		setSelected(null);
	}, [snapshot?.draft.round, snapshot?.draft.turn_team_id]);

	if (connection === 'offline') {
		return (
			<div>
				<PreviewBar leagueId={leagueId} />
				<Unreachable leagueId={leagueId} hasSnapshot={!!snapshot} />
			</div>
		);
	}
	if (!snapshot) {
		return (
			<div>
				<PreviewBar leagueId={leagueId} />
				<Spinner label="Joining the room…" />
			</div>
		);
	}

	const { draft, you } = snapshot;

	if (you.role === 'none') {
		return (
			<div>
				<PreviewBar leagueId={leagueId} />
				<Panel className="p-8 text-center">
					<p className="kicker">{draft.league_name}</p>
					<p className="mt-1 font-display text-lg font-semibold uppercase tracking-wider text-fog-300">Sign in to enter the draft room</p>
					<p className="mx-auto mt-2 max-w-md text-sm text-fog-500">Managers bid for their teams; anyone else signed in can spectate.</p>
					<Link href="/login" className="btn-primary mt-6 inline-block">
						Log in
					</Link>
				</Panel>
			</div>
		);
	}

	const onPoolSelect = (asset: Asset) => {
		if (poolMode === 'pick') {
			setSelected(asset);
			window.scrollTo({ top: 0, behavior: 'smooth' });
		} else if (poolMode === 'queue') {
			void handle.act({ type: 'queue_nomination', payload: { asset_id: asset.id } });
		}
	};

	const stage =
		draft.state === 'lobby' || draft.state === 'setup' ? (
			<Lobby snapshot={snapshot} handle={handle} />
		) : draft.state === 'completed' ? (
			<CompletedSummary snapshot={snapshot} />
		) : draft.format === 'auction' ? (
			<AuctionStage snapshot={snapshot} handle={handle} />
		) : draft.format === 'vickrey' ? (
			<VickreyStage snapshot={snapshot} handle={handle} />
		) : draft.format === 'snake' ? (
			<SnakeStage snapshot={snapshot} handle={handle} selected={selected} onClearSelection={() => setSelected(null)} />
		) : draft.format === 'round_pool' ? (
			<RoundPoolStage snapshot={snapshot} handle={handle} />
		) : null;

	const poolCount = snapshot.pool.filter((entry) => entry.remaining_copies === null || entry.remaining_copies > 0).length;

	return (
		<div>
			{!preview.focus && <PreviewBar leagueId={leagueId} />}
			<RoomHeader snapshot={snapshot} connection={connection} sound={preview.sound} focus={preview.focus} onLineup={() => setDrawer('lineup')} onPricing={() => setDrawer('pricing')} />
			<LineupDrawer snapshot={snapshot} open={drawer === 'lineup'} onClose={() => setDrawer(null)} />
			<PricingDrawer snapshot={snapshot} open={drawer === 'pricing'} onClose={() => setDrawer(null)} />

			<div className={`grid gap-2 lg:grid-cols-[minmax(0,1fr)_14rem] ${you.team_id !== null && draft.state === 'live' ? 'max-lg:pb-24' : ''}`}>
				<div className="min-w-0 space-y-2">
					<Panel className="relative p-3">
						<div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_50%_80%_at_10%_0%,rgb(230_0_18_/_0.10),transparent)]" />
						<div className="relative">{stage}</div>
					</Panel>

					<Panel className="p-1.5">
						<DraftBoard snapshot={snapshot} previous={handle.previous} act={handle.act} />
					</Panel>

					<Panel>
						<button type="button" className="flex w-full items-center gap-2 border-b border-night-800 px-2 py-1 text-left font-display text-[10px] font-bold uppercase tracking-widest text-fog-500 hover:text-fog-300" onClick={() => setPoolOpen(!poolOpen)} aria-expanded={poolOpen}>
							Pool · {poolCount} left
							{poolMode !== 'browse' && <span className="text-rio-300">· click to {poolMode === 'pick' ? 'draft' : 'queue'}</span>}
							<span className="ml-auto">{poolOpen ? '▴' : '▾'}</span>
						</button>
						{poolOpen && <PoolPanel snapshot={snapshot} mode={poolMode} onSelect={onPoolSelect} selectedId={selected?.id ?? null} />}
					</Panel>
				</div>

				<aside className="min-w-0 space-y-2">
					{you.team_id !== null && draft.state !== 'completed' && (
						<Panel>
							<TargetsPanel snapshot={snapshot} canQueue={poolMode === 'queue'} onQueue={(asset) => void handle.act({ type: 'queue_nomination', payload: { asset_id: asset.id } })} onPlan={() => setDrawer('lineup')} />
						</Panel>
					)}
					{you.role === 'commissioner' && (
						<Panel>
							<div className="border-b border-night-800 px-2 py-1 font-display text-[10px] font-bold uppercase tracking-widest text-fog-500">Commissioner</div>
							<CommissionerPanel snapshot={snapshot} handle={handle} />
						</Panel>
					)}
					<Panel>
						<RailFeed snapshot={snapshot} />
					</Panel>
				</aside>
			</div>
		</div>
	);
}

export function DeadlineLabel({ deadline, serverNow }: { deadline: number | null; serverNow: () => number }) {
	const [now, setNow] = useState(serverNow());
	useEffect(() => {
		const timer = setInterval(() => setNow(serverNow()), 1000);
		return () => clearInterval(timer);
	}, [serverNow]);
	if (!deadline) return <span>No deadline</span>;
	const remaining = deadline - now;
	return <span className={remaining < 3600_000 ? 'text-rio-300' : ''}>{remaining > 0 ? formatDuration(remaining) : 'Passed'}</span>;
}
