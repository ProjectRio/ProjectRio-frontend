'use client';

// Leagues directory (§10a). A "league" is a Competition; drafts hang off it.

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { LEAGUES } from '@/lib/draft/fixtures';
import { getServer } from '@/lib/draft/mock/transport';
import { FORMAT_BLURBS, FORMAT_LABELS, type DraftState } from '@/lib/draft/types';
import { usePreview } from '@/lib/draft/preview';
import { TeamLogo, StateChip } from '@/components/draft/primitives';
import { PageHeader, Badge } from '@/components/ui';
import { competitionForLeague } from '@/lib/compete/fixtures';

function useLiveStates(): Record<number, { state: DraftState; paused: boolean }> {
	const [states, setStates] = useState<Record<number, { state: DraftState; paused: boolean }>>({});
	useEffect(() => {
		const read = () => {
			const next: Record<number, { state: DraftState; paused: boolean }> = {};
			for (const league of LEAGUES) {
				const server = getServer(league.id);
				if (server) next[league.id] = { state: server.draft.state, paused: server.draft.paused };
			}
			setStates(next);
		};
		read();
		const timer = setInterval(read, 2000);
		return () => clearInterval(timer);
	}, []);
	return states;
}

export default function LeaguesPage() {
	const preview = usePreview();
	const states = useLiveStates();
	return (
		<div>
			<PageHeader kicker="Manager mode" title="Leagues">
				<span className="rounded border border-dashed border-star-500/40 px-2 py-1 font-display text-[10px] font-bold uppercase tracking-widest text-star-400">Preview · mock server</span>
				<Link href="/collections" className="btn-secondary !py-2 text-sm">
					Collections
				</Link>
			</PageHeader>
			<p className="-mt-4 mb-6 max-w-2xl text-sm text-fog-500">
				Draft leagues run on one shared board everyone watches fill. Five formats, one room. Every league below runs against an in-browser mock server with bot teams — pick a league, choose who to view as, and play it through.
			</p>
			<div className="grid gap-4 md:grid-cols-2">
				{LEAGUES.map((league) => {
					const live = states[league.id] ?? { state: league.state, paused: false };
					const viewAs = preview.viewAs;
					const yourTeam = viewAs.kind === 'team' ? league.teams.find((team) => team.id === viewAs.team_id) : null;
					const roomHref = `/leagues/${league.id}/draft`;
					const cta =
						live.state === 'setup' ? { href: `/leagues/${league.id}/draft/setup`, label: 'Set up the draft' } : live.state === 'completed' ? { href: roomHref, label: 'Final board' } : league.format === 'fixed_price' ? { href: roomHref, label: 'Open builder' } : { href: roomHref, label: live.state === 'live' ? 'Enter the room' : 'Enter the lobby' };
					return (
						<div key={league.id} className="panel panel-glow flex flex-col p-5">
							<div className="flex items-start justify-between gap-3">
								<div className="min-w-0">
									<p className="kicker">{league.collection} · {league.season}</p>
									<Link href={`/leagues/${league.id}`} className="mt-0.5 block font-display text-2xl font-bold uppercase leading-tight tracking-wide hover:text-rio-300">
										{league.name}
									</Link>
								</div>
								<div className="flex shrink-0 flex-col items-end gap-1.5">
									<StateChip state={live.state} paused={live.paused} />
									<Badge color="gray">{FORMAT_LABELS[league.format]}</Badge>
								</div>
							</div>
							<p className="mt-3 text-sm text-fog-300">{league.description}</p>
							<p className="mt-1 text-xs text-fog-500">{FORMAT_BLURBS[league.format]}</p>
							<div className="mt-4 flex flex-wrap items-center gap-1">
								{league.teams.map((team) => (
									<span key={team.id} title={team.name ?? team.managers.map((manager) => manager.username).join(' & ')} className={`rounded-full ${yourTeam?.id === team.id ? 'ring-2 ring-rio-500' : ''}`}>
										<TeamLogo logo={team.logo} name={team.name ?? team.managers[0].username} size={26} />
									</span>
								))}
								<span className="ml-1 text-xs text-fog-500">{league.teams.length} teams · ${league.config.budget || '—'} · {league.config.slots.character}+{league.config.slots.stadium} slots</span>
							</div>
							<div className="mt-5 flex items-center gap-3">
								<Link href={cta.href} className="btn-primary !py-2 text-sm">
									{cta.label}
								</Link>
								<Link href={`/leagues/${league.id}`} className="btn-secondary !py-2 text-sm">
									League
								</Link>
								{competitionForLeague(league.id) && (
									<Link href={`/competitions/${competitionForLeague(league.id)!.slug}`} className="font-display text-xs font-semibold uppercase tracking-wider text-rio-400 hover:text-rio-300">
										Season →
									</Link>
								)}
								{yourTeam && <span className="ml-auto font-display text-[10px] font-bold uppercase tracking-widest text-rio-300">Your team</span>}
								{preview.viewAs.kind === 'commissioner' && <span className="ml-auto font-display text-[10px] font-bold uppercase tracking-widest text-fog-500">You commission</span>}
							</div>
						</div>
					);
				})}
			</div>
		</div>
	);
}
