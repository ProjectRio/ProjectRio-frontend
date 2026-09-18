'use client';

// League hub: teams, managers, rosters and trades — the season home that the
// draft feeds (§10a). Rosters read from the same snapshot as the room.

import { use, useState } from 'react';
import Link from 'next/link';
import { leagueById } from '@/lib/draft/fixtures';
import { competitionForLeague } from '@/lib/compete/fixtures';
import { FORMAT_LABELS, type DraftSnapshot } from '@/lib/draft/types';
import { useDraft, type DraftHandle } from '@/lib/draft/useDraft';
import DraftBoard from '@/components/draft/DraftBoard';
import PreviewBar from '@/components/draft/PreviewBar';
import { AssetSprite, findTeam, Money, PresenceDot, SectionLabel, StateChip, TeamLogo } from '@/components/draft/primitives';
import { Tabs } from '@/components/overlay';
import { Badge, EmptyState, PageHeader, Panel, Spinner } from '@/components/ui';

function TeamNameEditor({ snapshot, handle, teamId }: { snapshot: DraftSnapshot; handle: DraftHandle; teamId: number }) {
	const team = findTeam(snapshot, teamId)!;
	const [editing, setEditing] = useState(false);
	const [value, setValue] = useState(team.name);
	if (!editing) {
		return (
			<button type="button" className="text-[11px] text-fog-500 underline decoration-dotted underline-offset-2 hover:text-fog-100" onClick={() => setEditing(true)}>
				Rename
			</button>
		);
	}
	return (
		<form
			className="mt-1 flex items-center gap-2"
			onSubmit={(event) => {
				event.preventDefault();
				void handle.act({ type: 'set_team_name', payload: { team_id: teamId, name: value } }).then(() => setEditing(false));
			}}
		>
			<input className="input !w-44 !py-1 !text-sm" maxLength={28} value={value} onChange={(event) => setValue(event.target.value)} autoFocus />
			<button type="submit" className="btn-primary !px-3 !py-1 text-xs">
				Save
			</button>
			<button type="button" className="text-xs text-fog-500" onClick={() => setEditing(false)}>
				Cancel
			</button>
		</form>
	);
}

function OverviewTab({ snapshot, handle }: { snapshot: DraftSnapshot; handle: DraftHandle }) {
	const { draft, teams, you } = snapshot;
	const league = leagueById(draft.league_id)!;
	const roomHref = `/leagues/${draft.league_id}/draft`;
	return (
		<div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_20rem]">
			<Panel>
				<SectionLabel>Teams</SectionLabel>
				<ul className="divide-y divide-night-800">
					{teams.map((team) => (
						<li key={team.id} className={`flex items-center gap-3 px-4 py-3 ${team.id === you.team_id ? 'bg-rio-500/[0.06]' : ''}`}>
							<TeamLogo logo={team.logo} name={team.name} size={36} />
							<div className="min-w-0 flex-1">
								<div className="flex flex-wrap items-center gap-2">
									<span className="font-display text-base font-bold uppercase tracking-wide">{team.name}</span>
									{team.id === you.team_id && <Badge color="red">You</Badge>}
									{(team.id === you.team_id || you.role === 'commissioner') && <TeamNameEditor snapshot={snapshot} handle={handle} teamId={team.id} />}
								</div>
								<div className="flex flex-wrap gap-x-3 text-xs text-fog-500">
									{team.managers.map((manager) => (
										<Link key={manager.rio_user_id} href={`/users/${manager.username}`} className="inline-flex items-center gap-1 hover:text-fog-100">
											<PresenceDot present={manager.connected} />
											{manager.username}
										</Link>
									))}
								</div>
							</div>
							<div className="text-right text-xs text-fog-500">
								{draft.format !== 'snake' && (
									<div>
										Salary <Money amount={draft.state === 'completed' ? team.spent : 0} className="text-fog-300" /> · cap <Money amount={Math.round(draft.config.budget * 1.25)} />
									</div>
								)}
								<div>{team.picks.length} rostered</div>
							</div>
						</li>
					))}
				</ul>
			</Panel>
			<div className="space-y-4">
				<Panel className="p-4">
					<div className="flex items-center justify-between">
						<span className="font-display text-xs font-bold uppercase tracking-widest text-fog-300">Draft</span>
						<StateChip state={draft.state} paused={draft.paused} />
					</div>
					<p className="mt-2 text-sm text-fog-300">
						{FORMAT_LABELS[draft.format]} · {draft.format !== 'snake' ? `$${draft.config.budget} · ` : ''}
						{draft.config.slots.character}+{draft.config.slots.stadium} slots
					</p>
					{league.scheduled_at && draft.state === 'lobby' && <p className="text-xs text-fog-500">Scheduled {new Date(league.scheduled_at).toLocaleString()}</p>}
					<div className="mt-3 flex flex-wrap gap-2">
						<Link href={roomHref} className="btn-primary !py-2 text-sm">
							{draft.state === 'completed' ? 'Final board' : draft.format === 'fixed_price' ? 'Builder' : 'Draft room'}
						</Link>
						{you.role === 'commissioner' && draft.state !== 'completed' && (
							<Link href={`${roomHref}/setup`} className="btn-secondary !py-2 text-sm">
								Setup
							</Link>
						)}
					</div>
				</Panel>
				<Panel className="p-4 text-sm text-fog-300">
					<span className="font-display text-xs font-bold uppercase tracking-widest text-fog-300">About</span>
					<p className="mt-2">{league.description}</p>
					<p className="mt-2 text-xs text-fog-500">
						Commissioner: {teams.flatMap((team) => team.managers).find((manager) => draft.commissioner_ids.includes(manager.rio_user_id))?.username ?? 'MattGree'} · Trades{' '}
						{draft.config.trades.enabled ? `on (${draft.config.trades.approval_model.replace('_', ' ')})` : 'off'} · Free agency {draft.config.free_agency.mode}
					</p>
					<Link href={`/leagues/${draft.league_id}/history`} className="mt-3 inline-block text-xs text-rio-300 hover:text-rio-200">
						Price history for {draft.collection} →
					</Link>
				</Panel>
			</div>
		</div>
	);
}

function RostersTab({ snapshot, handle }: { snapshot: DraftSnapshot; handle: DraftHandle }) {
	const { draft, teams, you } = snapshot;
	if (draft.state !== 'completed' && teams.every((team) => team.picks.length === 0)) {
		return <EmptyState title="No rosters yet" detail="Rosters fill in as the draft runs and commit to the ledger when it completes." />;
	}
	return (
		<div className="space-y-4">
			<Panel className="p-2">
				<DraftBoard snapshot={snapshot} previous={handle.previous} act={handle.act} />
			</Panel>
			<div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
				{teams.map((team) => (
					<Panel key={team.id}>
						<div className={`flex items-center gap-2 border-b border-night-700 px-3 py-2 ${team.id === you.team_id ? 'bg-rio-500/[0.08]' : 'bg-night-850'}`}>
							<TeamLogo logo={team.logo} name={team.name} size={22} />
							<span className="font-display text-xs font-bold uppercase tracking-widest">{team.name}</span>
							{draft.format !== 'snake' && (
								<span className="ml-auto font-display text-xs font-bold tabular-nums text-fog-300">
									<Money amount={team.spent} />
								</span>
							)}
						</div>
						<ul className="divide-y divide-night-800">
							{team.picks.map((pick) => (
								<li key={pick.id} className="flex items-center gap-2 px-3 py-1.5 text-sm">
									<AssetSprite asset={pick.asset} size={24} />
									<span className="min-w-0 flex-1 truncate">
										{pick.nickname ? (
											<>
												<span className="text-fog-100">{pick.nickname}</span> <span className="text-xs text-fog-500">({pick.asset.name})</span>
											</>
										) : (
											<span className="text-fog-100">{pick.asset.name}</span>
										)}
										{pick.asset.captain && <span className="ml-1 text-star-400">✪</span>}
									</span>
									{pick.is_keeper && <span className="text-[9px] font-bold uppercase tracking-widest text-star-400">Keeper</span>}
									{draft.format !== 'snake' && <span className={`font-display text-xs font-bold tabular-nums ${pick.took_remaining_budget ? 'text-star-400' : 'text-fog-300'}`}>${pick.price}</span>}
								</li>
							))}
							{team.picks.length === 0 && <li className="px-3 py-3 text-xs text-fog-500">{draft.format === 'fixed_price' && draft.state !== 'completed' ? 'Build is private until completion.' : 'Nothing yet.'}</li>}
						</ul>
					</Panel>
				))}
			</div>
			<p className="text-xs text-fog-500">Click one of your picks on the board to give it a nickname. Nicknames show on team, league and draft pages — never on box scores.</p>
		</div>
	);
}

function TradesTab({ snapshot }: { snapshot: DraftSnapshot }) {
	const { draft, teams } = snapshot;
	const enabled = draft.config.trades.enabled;
	const sample = draft.state === 'completed' && teams.length >= 2 && teams[0].picks[2] && teams[1].picks[3];
	return (
		<div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_20rem]">
			<Panel>
				<SectionLabel>Trades</SectionLabel>
				{!enabled ? (
					<EmptyState title="Trades are off" detail="The commissioner disabled trades for this league — typical for fixed-price leagues." />
				) : sample ? (
					<ul className="divide-y divide-night-800">
						<li className="px-4 py-3">
							<div className="flex flex-wrap items-center gap-2 text-sm">
								<TeamLogo logo={teams[0].logo} name={teams[0].name} size={20} />
								<span className="text-fog-100">{teams[0].name}</span>
								<span className="text-fog-500">sends</span>
								<AssetSprite asset={teams[0].picks[2].asset} size={22} />
								<span>
									{teams[0].picks[2].asset.name} <span className="text-xs text-fog-500">(${teams[0].picks[2].price})</span>
								</span>
								<span className="text-fog-500">for</span>
								<AssetSprite asset={teams[1].picks[3].asset} size={22} />
								<span>
									{teams[1].picks[3].asset.name} <span className="text-xs text-fog-500">(${teams[1].picks[3].price})</span>
								</span>
								<span className="text-fog-500">from</span>
								<TeamLogo logo={teams[1].logo} name={teams[1].name} size={20} />
								<span className="text-fog-100">{teams[1].name}</span>
								<Badge color="gold">Awaiting commissioner</Badge>
							</div>
							<p className="mt-1 text-xs text-fog-500">Salary travels with the asset. Both rosters stay inside cap and floor.</p>
						</li>
					</ul>
				) : (
					<EmptyState title="No trades yet" detail={draft.format === 'snake' ? 'Snake leagues may trade picks before and during the draft.' : 'Asset trades open once the draft completes and rosters are in the ledger.'} />
				)}
			</Panel>
			<Panel className="p-4 text-sm">
				<span className="font-display text-xs font-bold uppercase tracking-widest text-fog-300">Approval model</span>
				<p className="mt-2 text-fog-300">{enabled ? { parties_only: 'Both parties accept and it executes.', commissioner: 'Both parties accept, then the commissioner approves.', league_veto: 'Both parties accept; the league has a veto window.' }[draft.config.trades.approval_model] : 'Trades are disabled.'}</p>
				{enabled && (
					<button type="button" className="btn-secondary mt-4 !py-2 text-sm" disabled title="Trade proposals come with the league page build">
						Propose a trade
					</button>
				)}
			</Panel>
		</div>
	);
}

export default function LeaguePage({ params }: { params: Promise<{ id: string }> }) {
	const { id } = use(params);
	const leagueId = Number(id);
	const league = leagueById(leagueId);
	const handle = useDraft(leagueId);
	const [tab, setTab] = useState('overview');
	if (!league) return <EmptyState title="No such league" />;
	const { snapshot } = handle;
	return (
		<div>
			<PreviewBar leagueId={leagueId} compact />
			<PageHeader kicker={`${league.collection} · ${league.season}`} title={league.name}>
				<Badge color="gray">{FORMAT_LABELS[league.format]}</Badge>
				{snapshot && <StateChip state={snapshot.draft.state} paused={snapshot.draft.paused} />}
				{competitionForLeague(leagueId) && (
					<Link href={`/competitions/${competitionForLeague(leagueId)!.slug}`} className="btn-secondary !py-2 text-sm">
						Season page
					</Link>
				)}
			</PageHeader>
			<Tabs
				tabs={[
					{ id: 'overview', label: 'Overview' },
					{ id: 'rosters', label: 'Rosters' },
					{ id: 'trades', label: 'Trades' }
				]}
				active={tab}
				onChange={setTab}
			/>
			{!snapshot ? (
				<Spinner label="Loading league…" />
			) : (
				<>
					{tab === 'overview' && <OverviewTab snapshot={snapshot} handle={handle} />}
					{tab === 'rosters' && <RostersTab snapshot={snapshot} handle={handle} />}
					{tab === 'trades' && <TradesTab snapshot={snapshot} />}
				</>
			)}
		</div>
	);
}
