'use client';

/* eslint-disable @next/next/no-img-element */

// Small shared pieces for the competition and collection pages.

import Link from 'next/link';
import type { ReactNode } from 'react';
import { teamImage } from '@/lib/data/teamNames';
import { stadiums } from '@/lib/data/characters';
import { Badge } from '@/components/ui';
import type { Collection, CollectionKind, Competition, CompetitionKind, CompetitionState, FileStatus } from '@/lib/compete/types';

export const KIND_LABELS: Record<CompetitionKind, string> = { league: 'League', tournament: 'Bracket', season: 'Ranked season', night: 'Night' };
export const COLLECTION_KIND_LABELS: Record<CollectionKind, string> = { series: 'Series', game_mode: 'Game mode', event: 'Event', organization: 'Organization' };

const STATE_STYLE: Record<CompetitionState, { label: string; className: string; live?: boolean }> = {
	upcoming: { label: 'Upcoming', className: 'border-night-600 bg-night-800 text-fog-300' },
	signups: { label: 'Signups open', className: 'border-emerald-500/40 bg-emerald-500/15 text-emerald-300' },
	drafting: { label: 'Drafting', className: 'border-star-500/40 bg-star-500/15 text-star-400' },
	live: { label: 'Live', className: 'border-rio-500/50 bg-rio-500/15 text-rio-300', live: true },
	playoffs: { label: 'Playoffs', className: 'border-rio-500/50 bg-rio-500/15 text-rio-300', live: true },
	completed: { label: 'Completed', className: 'border-night-600 bg-night-850 text-fog-500' }
};

export function StateChip({ state }: { state: CompetitionState }) {
	const style = STATE_STYLE[state];
	return (
		<span className={`inline-flex items-center gap-1.5 rounded border px-2 py-0.5 font-display text-[11px] font-bold uppercase tracking-widest ${style.className}`}>
			{style.live && (
				<span className="relative flex h-1.5 w-1.5">
					<span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rio-400 opacity-75" />
					<span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-rio-400" />
				</span>
			)}
			{style.label}
		</span>
	);
}

export function KindBadge({ kind }: { kind: CompetitionKind }) {
	return <Badge color="gray">{KIND_LABELS[kind]}</Badge>;
}

/** A participant in a competition: a team where teams exist, otherwise the entrant. */
export interface Participant {
	name: string;
	logo?: string;
	members: string[];
	seed?: number;
	home_park?: number;
}

export function participantsOf(competition: Competition): Participant[] {
	if (competition.teams?.length) {
		return competition.teams.map((team) => ({
			name: team.name,
			logo: team.logo,
			members: team.members,
			seed: competition.entrants.find((entrant) => entrant.team_id === team.id)?.seed
		}));
	}
	return competition.entrants.filter((entrant) => entrant.status !== 'withdrawn').map((entrant) => ({ name: entrant.username, logo: entrant.logo, members: [entrant.username], seed: entrant.seed, home_park: entrant.home_park }));
}

export function participantByName(competition: Competition, name: string): Participant | undefined {
	return participantsOf(competition).find((participant) => participant.name === name);
}

const INITIAL_HUES = ['#e8746f', '#6fcf8a', '#f2d16b', '#6fb4f2', '#c792ea', '#f78c6c', '#89ddff', '#ffcb6b'];

export function Mark({ participant, size = 28, className = '' }: { participant: Participant | undefined; size?: number; className?: string }) {
	if (participant?.logo) {
		return <img src={teamImage(participant.logo)} alt="" width={size} height={size} className={`shrink-0 object-contain ${className}`} style={{ width: size, height: size }} />;
	}
	const name = participant?.name ?? '?';
	const hue = INITIAL_HUES[name.charCodeAt(0) % INITIAL_HUES.length];
	return (
		<span className={`inline-flex shrink-0 items-center justify-center rounded-full font-display font-bold uppercase text-night-950 ${className}`} style={{ width: size, height: size, backgroundColor: hue, fontSize: Math.max(9, size * 0.42) }} aria-hidden>
			{name.slice(0, 2)}
		</span>
	);
}

/** Name with a link to the player page when the participant is a single user. */
export function ParticipantName({ participant, name, className = '' }: { participant?: Participant; name?: string; className?: string }) {
	const label = participant?.name ?? name ?? '';
	const single = participant && participant.members.length === 1 && participant.members[0] === participant.name;
	if (single) {
		return (
			<Link href={`/users/${encodeURIComponent(label)}`} className={`font-medium text-fog-100 transition-colors hover:text-rio-300 ${className}`}>
				{label}
			</Link>
		);
	}
	return <span className={`font-medium text-fog-100 ${className}`}>{label}</span>;
}


export const FILE_LABELS: Record<FileStatus, { label: string; className: string; dot: string }> = {
	processed: { label: 'Processed', className: 'text-emerald-300', dot: 'bg-emerald-400' },
	submitted: { label: 'Submitted', className: 'text-star-400', dot: 'bg-star-400' },
	not_submitted: { label: 'Not submitted', className: 'text-fog-500', dot: 'bg-night-600' },
	problem: { label: 'Problem', className: 'text-rio-300', dot: 'bg-rio-500' }
};

export function FileDot({ status, withLabel = false }: { status: FileStatus; withLabel?: boolean }) {
	const style = FILE_LABELS[status];
	return (
		<span className={`inline-flex items-center gap-1.5 text-xs ${style.className}`} title={`Stat file: ${style.label}`}>
			<span className={`inline-block h-1.5 w-1.5 rounded-full ${style.dot}`} />
			{withLabel && style.label}
		</span>
	);
}

export function stadiumName(id: number | undefined): string {
	return id === undefined ? '' : (stadiums[String(id)] ?? '');
}

export function shortDate(ms: number | undefined): string {
	if (!ms) return '';
	return new Date(ms).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export function Section({ title, action, children, className = '' }: { title: string; action?: ReactNode; children: ReactNode; className?: string }) {
	return (
		<section className={className}>
			<div className="mb-3 flex items-end justify-between gap-3">
				<h2 className="font-display text-sm font-bold uppercase tracking-widest text-fog-300">{title}</h2>
				{action}
			</div>
			{children}
		</section>
	);
}

export function Stat({ label, value, sub }: { label: string; value: ReactNode; sub?: ReactNode }) {
	return (
		<div className="min-w-0">
			<p className="text-[11px] font-semibold uppercase tracking-widest text-fog-500">{label}</p>
			<div className="mt-1 font-display text-2xl font-bold text-fog-100" style={{ fontVariantNumeric: 'tabular-nums' }}>
				{value}
			</div>
			{sub && <p className="mt-0.5 text-xs text-fog-500">{sub}</p>}
		</div>
	);
}

// ── Cards ──────────────────────────────────────────────────────────────────

export function CompetitionCard({ competition, collectionNames }: { competition: Competition; collectionNames?: string[] }) {
	const participants = participantsOf(competition);
	const played = competition.games.filter((game) => !game.series).length;
	const total = competition.fixtures.filter((fixture) => !fixture.status.startsWith('un')).length || played;
	const summary =
		competition.kind === 'season'
			? 'Open play · live ladder'
			: competition.kind === 'tournament'
				? `${participants.length} entrants · ${competition.bracket ? competition.bracket.format.replace('_', ' ') : 'bracket pending'}`
				: competition.kind === 'night'
					? `${competition.teams?.length ?? 2} sides · ${competition.fixtures.length} games`
					: `${participants.length} ${competition.teams ? 'teams' : 'managers'} · ${total ? `${played}/${total} games` : 'schedule pending'}`;
	return (
		<Link href={`/competitions/${competition.slug}`} className="panel panel-glow flex flex-col p-4">
			<div className="flex items-start justify-between gap-3">
				<div className="min-w-0">
					<p className="kicker !text-[10px]">
						{collectionNames?.join(' · ') ?? KIND_LABELS[competition.kind]} · {competition.season_label}
					</p>
					<h3 className="mt-0.5 truncate font-display text-lg font-bold uppercase leading-tight tracking-wide text-fog-100">{competition.name}</h3>
				</div>
				<StateChip state={competition.state} />
			</div>
			<p className="mt-2 line-clamp-2 text-sm text-fog-500">{competition.description}</p>
			<div className="mt-3 flex items-center gap-1">
				{participants.slice(0, 10).map((participant) => (
					<span key={participant.name} title={participant.name}>
						<Mark participant={participant} size={22} />
					</span>
				))}
				{participants.length > 10 && <span className="text-xs text-fog-500">+{participants.length - 10}</span>}
				<span className="ml-auto text-xs text-fog-500">{summary}</span>
			</div>
			{competition.champion && (
				<p className="mt-2 text-xs text-star-400">
					<span className="mr-1">★</span>
					{competition.champion}
				</p>
			)}
		</Link>
	);
}

export function CollectionCard({ collection, count, sections }: { collection: Collection; count: number; sections?: Collection[] }) {
	return (
		<Link href={`/collections/${collection.slug}`} className="panel panel-glow block p-5">
			<div className="flex items-start justify-between gap-3">
				<div className="min-w-0">
					<p className="kicker !text-[10px]">{COLLECTION_KIND_LABELS[collection.kind]}</p>
					<h2 className="mt-0.5 font-display text-xl font-bold uppercase tracking-wide">{collection.name}</h2>
				</div>
				<div className="flex shrink-0 flex-col items-end gap-1">
					{collection.membership === 'derived' && <Badge color="gray">Derived</Badge>}
					{collection.sponsor && <Badge color="gold">Sponsored</Badge>}
				</div>
			</div>
			<p className="mt-2 text-sm text-fog-300">{collection.tagline}</p>
			<p className="mt-3 text-xs text-fog-500">
				{count} competition{count === 1 ? '' : 's'}
				{sections && sections.length > 0 && ` · ${sections.length} section${sections.length === 1 ? '' : 's'}`}
				{collection.ladder && ' · lifetime ladder'}
			</p>
		</Link>
	);
}
