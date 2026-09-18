// The draft protocol — the contract between the room UI and any transport.
// Mirrors REALTIME_AND_DRAFT_SCOPING.md §9 (REST + snapshot) so the mock
// server's output is exactly what the Python backend must later reproduce.

import type { CharacterClass } from '@/lib/data/characters';

export type DraftFormat = 'auction' | 'vickrey' | 'snake' | 'fixed_price' | 'round_pool';
export type AssetKind = 'character' | 'stadium';
export type DraftState = 'setup' | 'lobby' | 'live' | 'completed';
export type ViewerRole = 'commissioner' | 'manager' | 'spectator' | 'none';

export const FORMAT_LABELS: Record<DraftFormat, string> = {
	auction: 'Auction',
	vickrey: 'Vickrey',
	snake: 'Snake',
	fixed_price: 'Fixed Price',
	round_pool: 'Round Pool'
};

export const FORMAT_BLURBS: Record<DraftFormat, string> = {
	auction: 'Open ascending bids on a shared nomination queue. Highest bid when the clock runs out takes it.',
	vickrey: 'Sealed bids on each nomination. The top bid wins and pays the second-highest price.',
	snake: 'Turn-based picks in a serpentine order. No budgets, no prices — just the pick.',
	fixed_price: 'Every asset has a set price. Build privately within budget and submit before the deadline.',
	round_pool: 'Each round, every team nominates and bids once. Bids buy pick order, not the character.'
};

export interface Asset {
	id: number;
	kind: AssetKind;
	name: string;
	/** Character-only: MSSB char id, class and captain eligibility. */
	char_id?: number;
	class?: CharacterClass;
	captain?: boolean;
	/** Stadium-only. */
	stadium_id?: number;
}

export type Restriction =
	| { type: 'captain_required' }
	| { type: 'group_max'; name: string; char_ids: number[]; max: number }
	| { type: 'must_be_captain'; char_id: number }
	| { type: 'handedness'; char_id: number; bat: 'L' | 'R' | null; pitch: 'L' | 'R' | null };

export interface DraftConfig {
	slots: Record<AssetKind, number>;
	pool: {
		asset_ids: number[];
		/** Default copies per asset; null = unlimited. */
		copies: number | null;
		/** Per-asset overrides — the NPSS sheet gives top characters 3 copies, mid-tier 2. */
		copies_by_asset?: Record<number, number>;
		prices?: Record<number, number>;
	};
	budget: number;
	min_bid: number;
	bid_increment: number;
	/** null = untimed (commissioner closes). */
	lot_seconds: number | null;
	extend_seconds: number;
	/** Snake / async leagues: optional per-pick timer, no auto-pick. */
	pick_seconds: number | null;
	advance: 'auto' | 'manual';
	last_slot_takes_remaining: boolean;
	restrictions: Restriction[];
	ties: { method: 'runoff' | 'priority_order' };
	auto_pause_on_disconnect: boolean;
	auto_pause_grace_seconds: number;
	trades: { enabled: boolean; approval_model: 'parties_only' | 'commissioner' | 'league_veto' };
	free_agency: { mode: 'none' | 'open' };
	/** Fixed price: unix ms. */
	deadline: number | null;
}

export interface Manager {
	rio_user_id: number;
	username: string;
	connected: boolean;
}

export interface SnapshotPick {
	id: number;
	round: number;
	pick_number: number;
	team_id: number;
	asset: Asset;
	price: number;
	took_remaining_budget: boolean;
	is_keeper: boolean;
	nickname: string | null;
	made_at: number | null;
}

export interface RestrictionStatus {
	label: string;
	ok: boolean;
	waived: boolean;
}

export interface SnapshotTeam {
	id: number;
	name: string;
	logo: string | null;
	managers: Manager[];
	present: boolean;
	draft_order: number;
	tie_priority: number;
	draft_budget: number;
	spent: number;
	remaining: number;
	open_slots: Record<AssetKind, number>;
	open_slots_total: number;
	max_bid: number;
	submitted: boolean;
	restriction_status: RestrictionStatus[];
	waived: string[];
	picks: SnapshotPick[];
}

export interface QueueEntry {
	team_id: number;
	asset: Asset | null;
	/** False when the entry is missing or can no longer go up; `reason` says why. */
	valid: boolean;
	reason: string | null;
}

export interface PoolEntry {
	asset: Asset;
	remaining_copies: number | null;
	restriction_icons: RestrictionIcon[];
	price?: number;
}

export interface RestrictionIcon {
	code: 'C' | 'G' | 'L' | 'R';
	label: string;
}

export interface Bid {
	id: number;
	team_id: number;
	amount: number;
	placed_at: number;
	placed_by: string;
	rescind: 'requested' | 'approved' | 'rejected' | null;
}

export interface NominationView {
	id: number;
	round: number;
	asset: Asset;
	nominated_by_team_id: number;
	opening_bid: number | null;
	state: 'queued' | 'open' | 'closed' | 'voided';
	opened_at: number | null;
	closes_at: number | null;
	paused_remaining_s: number | null;
}

export interface AuctionCurrent {
	kind: 'auction';
	nomination: NominationView | null;
	high_bid: Bid | null;
	bids: Bid[];
	passed_team_ids: number[];
	eligible_team_ids: number[];
	still_in_team_ids: number[];
	rescind_pending: Bid | null;
	everyone_out: boolean;
	/** The lot is up but the nominator has not set the opening bid; the clock waits. */
	awaiting_opening: boolean;
	waiting_on_team_id: number | null;
	last_sale: { asset: Asset; team_id: number; price: number } | null;
}

export interface VickreyCurrent {
	kind: 'vickrey';
	nomination: NominationView | null;
	submitted_team_ids: number[];
	passed_team_ids: number[];
	eligible_team_ids: number[];
	waiting_on_team_id: number | null;
	runoff: RunoffView | null;
	last_result: { asset: Asset; team_id: number; price: number; bids: Bid[]; note: string | null } | null;
}

export interface RunoffView {
	team_ids: number[];
	high_bid: Bid | null;
	bids: Bid[];
	passed_team_ids: number[];
	closes_at: number | null;
}

export interface SnakeCurrent {
	kind: 'snake';
	on_the_clock: { pick_number: number; round: number; team_id: number; closes_at: number | null } | null;
	upcoming: { pick_number: number; round: number; team_id: number }[];
	recent: SnapshotPick[];
	total_picks: number;
}

export interface RoundPoolCurrent {
	kind: 'round_pool';
	phase: 'nominating' | 'bidding' | 'picking' | 'done';
	round_kind: AssetKind;
	participating_team_ids: number[];
	nominations: { team_id: number; asset: Asset }[];
	submitted_team_ids: number[];
	closes_at: number | null;
	/** After bids close: pick order groups (tied teams share a group). */
	order: { team_id: number; bid: number; group: number; picked: boolean }[];
	picking_team_ids: number[];
	available: Asset[];
	tie: { team_ids: number[]; chosen_team_ids: number[]; contested: Asset | null } | null;
	runoff: RunoffView | null;
	waiting_on_team_ids: number[];
}

export interface FixedPriceCurrent {
	kind: 'fixed_price';
	deadline: number | null;
	submitted_team_ids: number[];
	locked: boolean;
	revealed: boolean;
}

export type CurrentState = AuctionCurrent | VickreyCurrent | SnakeCurrent | RoundPoolCurrent | FixedPriceCurrent;

export type ActivityKind = 'nomination' | 'bid' | 'pass' | 'sale' | 'pick' | 'commissioner' | 'system' | 'presence';

export interface ActivityItem {
	id: number;
	at: number;
	kind: ActivityKind;
	text: string;
	team_id: number | null;
	asset: Asset | null;
	amount: number | null;
}

/** One completed lot / pick with everything that led to it, newest first in the snapshot. */
export interface LotResult {
	pick_id: number;
	pick_number: number;
	round: number;
	asset: Asset;
	team_id: number;
	price: number;
	took_remaining_budget: boolean;
	made_at: number;
	nominated_by_team_id: number | null;
	opening_bid: number | null;
	/** Every bid on the lot, highest first (sealed bids included once revealed). */
	bids: Bid[];
	note: string | null;
}

export interface YouBlock {
	role: ViewerRole;
	user_id: number | null;
	username: string | null;
	team_id: number | null;
	/** asset id → why it is ineligible for your team right now. */
	ineligible: Record<number, string>;
	/** Vickrey / round pool: your current sealed bid, if any. */
	sealed_bid: number | null;
	/** Round pool: your private tie choice while the group resolves. */
	tie_choice: number | null;
	/** Fixed price: your private build (also mirrored into your team's picks). */
	build: SnapshotPick[] | null;
	can_act: boolean;
}

export interface DraftSnapshot {
	draft: {
		id: number;
		league_id: number;
		league_name: string;
		collection: string;
		format: DraftFormat;
		state: DraftState;
		version: number;
		round: number;
		total_rounds: number;
		turn_team_id: number | null;
		paused: boolean;
		pause_reason: string | null;
		advance: 'auto' | 'manual';
		timed: boolean;
		server_time: number;
		started_at: number | null;
		completed_at: number | null;
		config: DraftConfig;
		commissioner_ids: number[];
	};
	teams: SnapshotTeam[];
	queue: QueueEntry[];
	pool: PoolEntry[];
	current: CurrentState;
	activity: ActivityItem[];
	results: LotResult[];
	spectators: { rio_user_id: number; username: string }[];
	price_history: Record<number, PriceHistory>;
	you: YouBlock;
}

export interface PriceHistory {
	asset_id: number;
	samples: { league: string; season: string; price: number }[];
	avg: number;
	min: number;
	max: number;
}

// ── Actions ────────────────────────────────────────────────────────────────

export type DraftAction =
	// setup
	| { type: 'set_config'; payload: Partial<DraftConfig> & { format?: DraftFormat } }
	| { type: 'open_lobby'; payload?: undefined }
	| { type: 'set_order'; payload: { team_ids: number[] } }
	| { type: 'set_tie_priority'; payload: { team_ids: number[] } }
	| { type: 'add_keeper'; payload: { team_id: number; asset_id: number; price: number; pick_number?: number } }
	| { type: 'remove_keeper'; payload: { pick_id: number } }
	| { type: 'start'; payload?: undefined }
	// auction / vickrey / round pool
	| { type: 'queue_nomination'; payload: { asset_id: number } }
	| { type: 'clear_nomination'; payload?: undefined }
	| { type: 'bid'; payload: { amount: number } }
	| { type: 'sealed_bid'; payload: { amount: number } }
	| { type: 'pass'; payload?: undefined }
	| { type: 'request_rescind'; payload?: undefined }
	| { type: 'runoff_bid'; payload: { amount: number } }
	| { type: 'runoff_pass'; payload?: undefined }
	// snake / round pool
	| { type: 'pick'; payload: { asset_id: number } }
	| { type: 'tie_choice'; payload: { asset_id: number } }
	// fixed price
	| { type: 'add'; payload: { asset_id: number } }
	| { type: 'remove'; payload: { pick_id: number } }
	| { type: 'submit'; payload?: undefined }
	| { type: 'unsubmit'; payload?: undefined }
	// common
	| { type: 'set_nickname'; payload: { pick_id: number; nickname: string | null } }
	| { type: 'set_team_name'; payload: { team_id: number; name: string | null } }
	// commissioner
	| { type: 'pause'; payload?: { reason?: string } }
	| { type: 'resume'; payload?: undefined }
	| { type: 'open_bidding'; payload?: undefined }
	| { type: 'close_current'; payload?: undefined }
	| { type: 'void'; payload: { pick_id?: number; nomination_id?: number; note: string } }
	| { type: 'act_for_team'; payload: { team_id: number; action: DraftAction } }
	| { type: 'resolve_rescind'; payload: { bid_id: number; approve: boolean } }
	| { type: 'waive_restriction'; payload: { team_id: number; restriction: string } }
	| { type: 'set_team_budget'; payload: { team_id: number; budget: number } }
	| { type: 'extend_deadline'; payload: { deadline: number } }
	| { type: 'set_advance'; payload: { advance: 'auto' | 'manual' } }
	| { type: 'complete'; payload?: undefined };

export type ErrorCode =
	| 'NOT_YOUR_TURN'
	| 'LOT_CLOSED'
	| 'OUTBID'
	| 'BELOW_INCREMENT'
	| 'EXCEEDS_MAX_BID'
	| 'NO_OPEN_SLOT'
	| 'ASSET_UNAVAILABLE'
	| 'ALREADY_HIGH'
	| 'RESTRICTED'
	| 'RESCIND_PENDING'
	| 'DRAFT_PAUSED'
	| 'NOT_A_MANAGER'
	| 'NOT_COMMISSIONER'
	| 'INVALID_STATE'
	| 'INVALID_ACTION'
	| 'NETWORK';

export const ERROR_MESSAGES: Record<ErrorCode, string> = {
	NOT_YOUR_TURN: "It isn't your turn.",
	LOT_CLOSED: 'Bidding on this lot has closed.',
	OUTBID: 'You were outbid before that went through.',
	BELOW_INCREMENT: 'Bid must beat the high bid by the increment.',
	EXCEEDS_MAX_BID: 'That bid is over your max bid.',
	NO_OPEN_SLOT: 'You have no open slot of that kind.',
	ASSET_UNAVAILABLE: 'That asset is no longer available.',
	ALREADY_HIGH: 'You already hold the high bid.',
	RESTRICTED: 'A league restriction blocks that pick.',
	RESCIND_PENDING: 'A rescind request is pending on this lot.',
	DRAFT_PAUSED: 'The draft is paused.',
	NOT_A_MANAGER: 'You are not a manager of this team.',
	NOT_COMMISSIONER: 'Commissioner only.',
	INVALID_STATE: 'That action is not available right now.',
	INVALID_ACTION: 'Unknown action.',
	NETWORK: 'Could not reach the server.'
};

export type ActionResult = { ok: true; version: number } | { ok: false; code: ErrorCode; message: string };

export interface Viewer {
	user_id: number | null;
	username: string | null;
}

export interface DraftTransport {
	subscribe(draftId: number, viewer: Viewer, onSnapshot: (s: DraftSnapshot) => void): () => void;
	act(draftId: number, viewer: Viewer, action: DraftAction, clientActionId: string): Promise<ActionResult>;
}

export class DraftError extends Error {
	code: ErrorCode;
	constructor(code: ErrorCode, message?: string) {
		super(message ?? ERROR_MESSAGES[code]);
		this.code = code;
	}
}
