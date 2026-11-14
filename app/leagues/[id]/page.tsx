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
import { Badge, EmptyState, PageHeader, Panel, Spinner } from '@/components/ui';

function TeamNameEditor({ snapshot, handle, teamId }: { snapshot: DraftSnapshot; handle: DraftHandle; teamId: number }) {
	const team = findTeam(snapshot, teamId)!;
	const [editing, setEditing] = useState(false);
	const [value, setValue] = useState(team.name);
	if (!editing) {
		return (
			<button type="button" className="key px-1.5 py-0.5 text-[11px]" onClick={() => setEditing(true)}>
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
			<button type="submit" className="key px-2.5 py-1 text-xs font-semibold">
				Save
			</button>
			<button type="button" className="text-xs text-fog-500 hover:text-fog-100" onClick={() => setEditing(false)}>
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
				<ul className="px-1 pb-1">
					{teams.map((team) => (
						<li key={team.id} className={`flex items-center gap-3 rounded-md px-3 py-2.5 ${team.id === you.team_id ? 'bg-star-400/[0.06]' : ''}`}>
							<TeamLogo logo={team.logo} name={team.name} size={36} />
							<div className="min-w-0 flex-1">
								<div className="flex flex-wrap items-center gap-2">
									<span className="font-display text-base font-semibold text-fog-100">{team.name}</span>
									{team.id === you.team_id && <Badge color="gold">You</Badge>}
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
									<div className="flex justify-end gap-3">
										<span>
											Salary <Money amount={draft.state === 'completed' ? team.spent : 0} className="font-mono text-fog-100" />
										</span>
										<span>
											cap <Money amount={Math.round(draft.config.budget * 1.25)} className="font-mono text-fog-300" />
										</span>
									</div>
								)}
								<div>
									<span className="font-mono tabular-nums text-fog-300">{team.picks.length}</span> rostered
								</div>
							</div>
						</li>
					))}
				</ul>
			</Panel>
			<div className="space-y-4">
				<Panel className="p-4">
					<div className="flex items-center justify-between">
						<h2 className="text-xl">Draft</h2>
						<StateChip state={draft.state} paused={draft.paused} />
						</div>
						<p className="mt-2 flex flex-wrap gap-x-3 text-sm text-fog-300">
						<span>{FORMAT_LABELS[draft.format]}</span>
						{draft.format !== 'snake' && <span className="font-mono tabular-nums">${draft.config.budget}</span>}
						<span>
							<span className="font-mono tabular-nums">
								{draft.config.slots.character}+{draft.config.slots.stadium}
							</span>{' '}
							slots
						</span>
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
					<h2 className="text-xl text-fog-100">About</h2>
					<p className="mt-2">{league.description}</p>
					<ul className="mt-2 space-y-0.5 text-xs text-fog-500">
						<li>Commissioner: {teams.flatMap((team) => team.managers).find((manager) => draft.commissioner_ids.includes(manager.rio_user_id))?.username ?? 'MattGree'}</li>
						<li>Trades {draft.config.trades.enabled ? `on (${draft.config.trades.approval_model.replace('_', ' ')})` : 'off'}</li>
						<li>Free agency {draft.config.free_agency.mode}</li>
					</ul>
					<Link href={`/leagues/${draft.league_id}/history`} className="mt-3 inline-block text-xs text-star-400 underline decoration-transparent underline-offset-4 hover:decoration-star-400">
						Price history for {draft.collection}
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
						<div className={`flex items-center gap-2 px-3 pb-1 pt-3 ${team.id === you.team_id ? 'bg-star-400/[0.08]' : ''}`}>
							<TeamLogo logo={team.logo} name={team.name} size={22} />
							<h3 className={`font-display text-sm font-semibold ${team.id === you.team_id ? 'text-star-400' : 'text-fog-100'}`}>{team.name}</h3>
							{draft.format !== 'snake' && (
								<span className="ml-auto font-mono text-xs font-semibold tabular-nums text-fog-100">
									<Money amount={team.spent} />
								</span>
							)}
						</div>
						<ul className="pb-2">
							{team.picks.map((pick) => (
								<li key={pick.id} className="flex items-center gap-2 px-3 py-1 text-sm">
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
									{pick.is_keeper && <span className="plate !px-1 !py-0 text-[9px] text-star-300 [--plate:#5a4a12]">Keeper</span>}
									{draft.format !== 'snake' && <span className={`font-mono text-xs tabular-nums ${pick.took_remaining_budget ? 'text-star-400' : 'text-fog-300'}`}>${pick.price}</span>}
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
					<ul>
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
				<h2 className="text-xl">Approval model</h2>
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
			<PageHeader kicker={`${league.collection} ${league.season}`} title={league.name}>
				<Badge color="gray">{FORMAT_LABELS[league.format]}</Badge>
				{snapshot && <StateChip state={snapshot.draft.state} paused={snapshot.draft.paused} />}
				{competitionForLeague(leagueId) && (
					<Link href={`/competitions/${competitionForLeague(leagueId)!.slug}`} className="btn-secondary !py-2 text-sm">
						Season page
					</Link>
				)}
			</PageHeader>
			<div className="tab-strip mb-6" role="tablist">
				{[
					{ id: 'overview', label: 'Overview' },
					{ id: 'rosters', label: 'Rosters' },
					{ id: 'trades', label: 'Trades' }
				].map((option) => (
					<button key={option.id} type="button" role="tab" aria-selected={tab === option.id} onClick={() => setTab(option.id)}>
						{option.label}
					</button>
				))}
			</div>
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
