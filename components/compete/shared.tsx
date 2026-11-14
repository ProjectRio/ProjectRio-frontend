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

// Plates in the state's own colour. Red only where the competition is live.
const STATE_STYLE: Record<CompetitionState, { label: string; className: string; live?: boolean }> = {
	upcoming: { label: 'Upcoming', className: 'text-fog-300' },
	signups: { label: 'Signups open', className: 'text-emerald-300 [--plate:#0d4534]' },
	drafting: { label: 'Drafting', className: 'text-star-400 [--plate:#473908]' },
	live: { label: 'Live', className: 'text-rio-300 [--plate:#56161b]', live: true },
	playoffs: { label: 'Playoffs', className: 'text-rio-300 [--plate:#56161b]', live: true },
	completed: { label: 'Completed', className: 'text-fog-500 [--plate:#24302a]' }
};

export function StateChip({ state }: { state: CompetitionState }) {
	const style = STATE_STYLE[state];
	return (
		<span className={`plate shrink-0 ${style.className}`}>
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

/** The preview notice: none of this is real data until the Competition rework lands in Rio Web. */
export function PreviewNotice() {
	return (
		<p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-fog-300">
			<span className="plate text-star-300 [--plate:#5a4a12]">Preview</span>
			<span>Seeded example data, not real results.</span>
		</p>
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

/** Name with a link to the player page when the participant is a single user. `plain` drops the link (for names inside a linked row). */
export function ParticipantName({ participant, name, className = '', plain = false }: { participant?: Participant; name?: string; className?: string; plain?: boolean }) {
	const label = participant?.name ?? name ?? '';
	const single = participant && participant.members.length === 1 && participant.members[0] === participant.name;
	if (single && !plain) {
		return (
			<Link href={`/users/${encodeURIComponent(label)}`} className={`font-medium text-fog-100 underline decoration-transparent underline-offset-4 transition-colors hover:decoration-fog-300 ${className}`}>
				{label}
			</Link>
		);
	}
	return <span className={`font-medium text-fog-100 ${className}`}>{label}</span>;
}

export const FILE_LABELS: Record<FileStatus, { label: string; className: string; dot: string; badge: 'green' | 'gold' | 'gray' | 'red' }> = {
	processed: { label: 'Processed', className: 'text-emerald-300', dot: 'bg-emerald-400', badge: 'green' },
	submitted: { label: 'Submitted', className: 'text-star-400', dot: 'bg-star-400', badge: 'gold' },
	not_submitted: { label: 'Not submitted', className: 'text-fog-500', dot: 'bg-night-600', badge: 'gray' },
	problem: { label: 'Problem', className: 'text-rio-300', dot: 'bg-rio-500', badge: 'red' }
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
			<div className="mb-4 flex flex-wrap items-end justify-between gap-x-3 gap-y-1">
				<h2 className="text-2xl text-fog-100">{title}</h2>
				{action}
			</div>
			{children}
		</section>
	);
}

/** One figure in an overview strip: a readout, with an optional line under it. */
export function Stat({ label, value, sub }: { label: string; value: ReactNode; sub?: ReactNode }) {
	return (
		<div className="min-w-0">
			<div className="readout">
				<p>{label}</p>
				<div>{value}</div>
			</div>
			{sub && <p className="mt-1.5 flex flex-wrap gap-x-2 text-xs text-fog-500">{sub}</p>}
		</div>
	);
}

/** The facts row on a card: separate small items, never joined into one string. */
function Facts({ items }: { items: ReactNode[] }) {
	const shown = items.filter((item) => item !== null && item !== undefined && item !== false && item !== '');
	if (shown.length === 0) return null;
	return (
		<ul className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-fog-500">
			{shown.map((item, index) => (
				<li key={index}>{item}</li>
			))}
		</ul>
	);
}

// ── Cards ──────────────────────────────────────────────────────────────────

export function CompetitionCard({ competition, collectionNames }: { competition: Competition; collectionNames?: string[] }) {
	const participants = participantsOf(competition);
	const played = competition.games.filter((game) => !game.series).length;
	const total = competition.fixtures.filter((fixture) => !fixture.status.startsWith('un')).length || played;
	const summary: string[] =
		competition.kind === 'season'
			? ['Open play', 'Live ladder']
			: competition.kind === 'tournament'
				? [`${participants.length} entrants`, competition.bracket ? competition.bracket.format.replace('_', ' ') : 'Bracket pending']
				: competition.kind === 'night'
					? [`${competition.teams?.length ?? 2} sides`, `${competition.fixtures.length} games`]
					: [`${participants.length} ${competition.teams ? 'teams' : 'managers'}`, total ? `${played}/${total} games` : 'Schedule pending'];
	return (
		<Link href={`/competitions/${competition.slug}`} className="panel panel-glow flex flex-col p-4">
			<div className="flex items-start justify-between gap-3">
				<h3 className="min-w-0 truncate font-title text-xl font-normal leading-tight tracking-normal text-fog-100">{competition.name}</h3>
				<StateChip state={competition.state} />
			</div>
			<p className="mt-1 line-clamp-2 text-sm text-fog-300">{competition.description}</p>
			<Facts
				items={[
					competition.season_label,
					...(collectionNames ?? []),
					...summary,
					competition.champion && (
						<span className="text-star-400">
							<span className="mr-1" aria-label="Champion">★</span>
							{competition.champion}
						</span>
					)
				]}
			/>
		</Link>
	);
}

export function CollectionCard({ collection, count, sections }: { collection: Collection; count: number; sections?: Collection[] }) {
	return (
		<Link href={`/collections/${collection.slug}`} className="panel panel-glow block p-5">
			<div className="flex flex-wrap items-center gap-2">
				<span className="plate text-fog-300">{COLLECTION_KIND_LABELS[collection.kind]}</span>
				{collection.membership === 'derived' && <Badge color="gray">Derived</Badge>}
				{collection.sponsor && <Badge color="gold">Sponsored</Badge>}
			</div>
			<h3 className="mt-3 font-title text-2xl font-normal leading-tight tracking-normal text-fog-100">{collection.name}</h3>
			<p className="mt-1 text-sm text-fog-300">{collection.tagline}</p>
			<Facts
				items={[
					`${count} competition${count === 1 ? '' : 's'}`,
					sections && sections.length > 0 && `${sections.length} section${sections.length === 1 ? '' : 's'}`,
					collection.ladder && 'Lifetime ladder'
				]}
			/>
		</Link>
	);
}
