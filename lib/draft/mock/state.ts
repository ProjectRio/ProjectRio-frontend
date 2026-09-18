// Internal mutable state of one mock draft — the "tables" of §6d, in memory.
// Format modules mutate this directly; snapshot.ts projects it per viewer.

import type { Asset, AssetKind, DraftConfig, DraftFormat, DraftState, ActivityKind } from '../types';

export interface ManagerRow {
	rio_user_id: number;
	username: string;
}

export interface TeamRow {
	id: number;
	name: string | null;
	logo: string | null;
	managers: ManagerRow[];
	draft_order: number;
	tie_priority: number;
	budget: number;
	waived_restrictions: string[];
	submitted_at: number | null;
	/** Round pool: the team's private tie choice while a group resolves. */
	tie_choice_asset_id: number | null;
	/** Bot personality (0–1): how aggressively it bids. */
	aggression: number;
}

export interface PickRow {
	id: number;
	round: number;
	pick_number: number;
	team_id: number | null;
	asset_id: number | null;
	price: number;
	took_remaining_budget: boolean;
	is_keeper: boolean;
	nickname: string | null;
	made_by: string | null;
	made_at: number | null;
	/** The lot that produced it (auction, Vickrey, round pool). */
	nomination_id: number | null;
}

export interface BidRow {
	id: number;
	nomination_id: number;
	round: number;
	team_id: number;
	placed_by: string;
	amount: number;
	placed_at: number;
	rescind: 'requested' | 'approved' | 'rejected' | null;
	/** Vickrey / round pool: hidden until close. */
	sealed: boolean;
	/** Runoff bids live on the same nomination, flagged. */
	runoff: boolean;
}

export interface NominationRow {
	id: number;
	round: number;
	asset_id: number;
	nominated_by_team_id: number;
	opening_bid: number | null;
	state: 'queued' | 'open' | 'closed' | 'voided';
	opened_at: number | null;
	closes_at: number | null;
	paused_remaining_s: number | null;
	high_bid_id: number | null;
	passed_team_ids: number[];
	closed_at: number | null;
	note: string | null;
	/** Round pool: which round-pool round this belongs to (same as `round`). */
	kind: AssetKind;
}

export interface RunoffRow {
	nomination_id: number;
	team_ids: number[];
	passed_team_ids: number[];
	high_bid_id: number | null;
	closes_at: number | null;
	paused_remaining_s: number | null;
	/** Round pool: the contested asset. */
	asset_id: number | null;
	/** The amount the teams tied at — the floor for runoff bids. */
	tied_amount: number;
}

export interface ActivityRow {
	id: number;
	at: number;
	kind: ActivityKind;
	text: string;
	team_id: number | null;
	asset_id: number | null;
	amount: number | null;
}

export interface RoundPoolRound {
	round: number;
	kind: AssetKind;
	phase: 'nominating' | 'bidding' | 'picking' | 'done';
	participating_team_ids: number[];
	/** Ordered pick groups after bids close; each group is tied teams. */
	groups: { team_ids: number[]; bid: number }[];
	group_index: number;
	/** Within the current group: teams that have picked this pass. */
	picked_team_ids: number[];
	closes_at: number | null;
	paused_remaining_s: number | null;
}

export interface LastResult {
	asset_id: number;
	team_id: number;
	price: number;
	bid_ids: number[];
	note: string | null;
}

export interface DraftRow {
	id: number;
	league_id: number;
	league_name: string;
	collection: string;
	format: DraftFormat;
	state: DraftState;
	config: DraftConfig;
	version: number;
	round: number;
	turn_team_id: number | null;
	paused: boolean;
	pause_reason: string | null;
	deadline: number | null;
	/** Snake: remaining pick-clock seconds while paused. */
	pick_remaining_s: number | null;
	created_at: number;
	started_at: number | null;
	completed_at: number | null;
	commissioner_ids: number[];
	teams: TeamRow[];
	picks: PickRow[];
	nominations: NominationRow[];
	bids: BidRow[];
	runoff: RunoffRow | null;
	pool_round: RoundPoolRound | null;
	last_result: LastResult | null;
	last_sale: { asset_id: number; team_id: number; price: number } | null;
	activity: ActivityRow[];
	/** Presence (in memory only): user id → role. */
	connected: Map<number, 'manager' | 'commissioner' | 'spectator'>;
	/** Users whose managers dropped: team id → when they were last seen. */
	away_since: Map<number, number>;
	next_id: number;
}

export function nextId(draft: DraftRow): number {
	return draft.next_id++;
}

export function team(draft: DraftRow, teamId: number): TeamRow {
	const row = draft.teams.find((candidate) => candidate.id === teamId);
	if (!row) throw new Error(`No team ${teamId}`);
	return row;
}

export function teamPicks(draft: DraftRow, teamId: number): PickRow[] {
	return draft.picks.filter((pick) => pick.team_id === teamId && pick.asset_id !== null);
}

export function displayName(teamRow: TeamRow): string {
	return teamRow.name ?? teamRow.managers.map((manager) => manager.username).join(' & ');
}

export function log(
	draft: DraftRow,
	kind: ActivityKind,
	text: string,
	extra: { team_id?: number | null; asset?: Asset | null; amount?: number | null } = {}
) {
	draft.activity.push({
		id: nextId(draft),
		at: Date.now(),
		kind,
		text,
		team_id: extra.team_id ?? null,
		asset_id: extra.asset?.id ?? null,
		amount: extra.amount ?? null
	});
	if (draft.activity.length > 60) draft.activity.splice(0, draft.activity.length - 60);
}
