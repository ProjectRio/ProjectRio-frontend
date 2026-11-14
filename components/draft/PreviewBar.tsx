'use client';

// One-line preview strip: "view as" and the §10b failure toggles. Mock only.

import { leagueById } from '@/lib/draft/fixtures';
import { getServer, resetServer } from '@/lib/draft/mock/transport';
import { setPreview, usePreview, type ViewAs } from '@/lib/draft/preview';

function viewAsKey(viewAs: ViewAs): string {
	return viewAs.kind === 'team' ? `team:${viewAs.team_id}` : viewAs.kind;
}

function parseViewAs(key: string): ViewAs {
	if (key.startsWith('team:')) return { kind: 'team', team_id: Number(key.slice(5)) };
	return { kind: key as 'commissioner' | 'spectator' | 'anonymous' };
}

const linkClass = 'text-fog-400 underline decoration-dotted underline-offset-2 hover:text-fog-100';

export default function PreviewBar({ leagueId, compact = false }: { leagueId: number; compact?: boolean }) {
	const preview = usePreview();
	const league = leagueById(leagueId);
	const teamName = (id: number) => {
		const team = league?.teams.find((row) => row.id === id);
		return team?.name ?? team?.managers.map((manager) => manager.username).join(' & ') ?? `Team ${id}`;
	};

	function toggleTeam(value: string) {
		if (!value) return;
		const teamId = Number(value);
		const offline = !preview.disconnectedTeams.includes(teamId);
		getServer(leagueId)?.setTeamOffline(teamId, offline);
		setPreview({ disconnectedTeams: offline ? [...preview.disconnectedTeams, teamId] : preview.disconnectedTeams.filter((id) => id !== teamId) });
	}

	return (
		<div className="mb-2 flex flex-wrap items-center gap-x-3 gap-y-1 rounded border border-dashed border-star-500/30 px-2 py-1 text-[11px] text-fog-500">
			<span className="font-display font-bold uppercase tracking-widest text-star-400/80">Preview</span>
			<label className="flex items-center gap-1">
				as
				<select className="rounded border border-night-700 bg-night-900 px-1 py-0.5 text-fog-100" value={viewAsKey(preview.viewAs)} onChange={(event) => setPreview({ viewAs: parseViewAs(event.target.value) })}>
					<option value="commissioner">Commissioner · MattGree</option>
					{league?.teams.map((team) => (
						<option key={team.id} value={`team:${team.id}`}>
							{teamName(team.id)} · {team.managers[0].username}
						</option>
					))}
					<option value="spectator">Spectator</option>
					<option value="anonymous">Logged out</option>
				</select>
			</label>
			{!compact && (
				<>
					<label className="flex items-center gap-1">
						<input type="checkbox" className="accent-rio-500" checked={preview.slowNetwork} onChange={(event) => setPreview({ slowNetwork: event.target.checked })} />
						slow net
					</label>
					<label className="flex items-center gap-1">
						<input type="checkbox" className="accent-rio-500" checked={preview.offline} onChange={(event) => setPreview({ offline: event.target.checked })} />
						unreachable
					</label>
					<button type="button" className={linkClass} onClick={() => getServer(leagueId)?.restart()}>
						restart server
					</button>
					<label className="flex items-center gap-1">
						drop
						<select className="rounded border border-night-700 bg-night-900 px-1 py-0.5 text-fog-100" value="" onChange={(event) => toggleTeam(event.target.value)}>
							<option value="">team…</option>
							{league?.teams.map((team) => (
								<option key={team.id} value={team.id}>
									{preview.disconnectedTeams.includes(team.id) ? '↩ ' : ''}
									{teamName(team.id)}
								</option>
							))}
						</select>
					</label>
					{preview.disconnectedTeams.length > 0 && <span className="text-star-400">{preview.disconnectedTeams.map(teamName).join(', ')} offline</span>}
				</>
			)}
			<button
				type="button"
				className={`ml-auto ${linkClass}`}
				onClick={() => {
					resetServer(leagueId);
					setPreview({ disconnectedTeams: [], offline: false });
					window.location.reload();
				}}
			>
				reset league
			</button>
		</div>
	);
}
