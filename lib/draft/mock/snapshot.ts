// Project the mutable draft row into the §9b snapshot, filtered per viewer.

import { assetById } from '../assets';
import type {
	ActivityItem,
	AuctionCurrent,
	Bid,
	CurrentState,
	DraftSnapshot,
	FixedPriceCurrent,
	LotResult,
	NominationView,
	PoolEntry,
	PriceHistory,
	QueueEntry,
	RoundPoolCurrent,
	RunoffView,
	SnakeCurrent,
	SnapshotPick,
	SnapshotTeam,
	VickreyCurrent,
	Viewer,
	YouBlock
} from '../types';
import { eligibleTeams, highBid, lotBids, rescindPending, stillIn } from './formats/auction';
import { openNomination } from './formats/lot';
import { availableThisRound, pickersNow, roundBids, roundNominations } from './formats/roundPool';
import { nextUnmade } from './formats/snake';
import { sealedBids, vickreyEligible } from './formats/vickrey';
import { entryProblem, queueOrder, queuedEntry } from './queue';
import {
	ineligibleReason,
	isCommissioner,
	maxBid,
	openSlots,
	openSlotsTotal,
	remaining,
	remainingCopies,
	restrictionIcons,
	restrictionStatus,
	spent,
	teamOfUser
} from './rules';
import { runoffBids, runoffHigh } from './ties';
import { displayName, teamPicks, type BidRow, type DraftRow, type NominationRow, type PickRow } from './state';

function pickView(pick: PickRow): SnapshotPick {
	return {
		id: pick.id,
		round: pick.round,
		pick_number: pick.pick_number,
		team_id: pick.team_id!,
		asset: assetById(pick.asset_id!),
		price: pick.price,
		took_remaining_budget: pick.took_remaining_budget,
		is_keeper: pick.is_keeper,
		nickname: pick.nickname,
		made_at: pick.made_at
	};
}

function bidView(bid: BidRow): Bid {
	return { id: bid.id, team_id: bid.team_id, amount: bid.amount, placed_at: bid.placed_at, placed_by: bid.placed_by, rescind: bid.rescind };
}

function nominationView(row: NominationRow): NominationView {
	return {
		id: row.id,
		round: row.round,
		asset: assetById(row.asset_id),
		nominated_by_team_id: row.nominated_by_team_id,
		opening_bid: row.opening_bid,
		state: row.state,
		opened_at: row.opened_at,
		closes_at: row.closes_at,
		paused_remaining_s: row.paused_remaining_s
	};
}

function runoffView(draft: DraftRow): RunoffView | null {
	if (!draft.runoff) return null;
	const high = runoffHigh(draft);
	return {
		team_ids: draft.runoff.team_ids,
		high_bid: high ? bidView(high) : null,
		bids: runoffBids(draft).map(bidView).sort((a, b) => b.amount - a.amount),
		passed_team_ids: draft.runoff.passed_team_ids,
		closes_at: draft.runoff.closes_at
	};
}

function waitingOn(draft: DraftRow): number | null {
	if (draft.state !== 'live' || openNomination(draft) || draft.runoff) return null;
	if (draft.turn_team_id === null) return null;
	return entryProblem(draft, queuedEntry(draft, draft.turn_team_id)) ? draft.turn_team_id : null;
}

/** Completed lots and picks, newest first, with the bids that produced them. */
function resultsView(draft: DraftRow, hideBuilds: boolean): LotResult[] {
	if (hideBuilds) return [];
	return draft.picks
		.filter((pick) => pick.asset_id !== null && pick.team_id !== null && !pick.is_keeper && pick.made_at !== null)
		.sort((a, b) => b.made_at! - a.made_at! || b.pick_number - a.pick_number)
		.slice(0, 40)
		.map((pick) => {
			const nomination = pick.nomination_id !== null ? draft.nominations.find((row) => row.id === pick.nomination_id) : undefined;
			const bids =
				draft.format === 'round_pool'
					? draft.bids.filter((bid) => bid.sealed && bid.round === pick.round && !bid.runoff)
					: nomination
						? draft.bids.filter((bid) => bid.nomination_id === nomination.id)
						: [];
			return {
				pick_id: pick.id,
				pick_number: pick.pick_number,
				round: pick.round,
				asset: assetById(pick.asset_id!),
				team_id: pick.team_id!,
				price: pick.price,
				took_remaining_budget: pick.took_remaining_budget,
				made_at: pick.made_at!,
				nominated_by_team_id: nomination?.nominated_by_team_id ?? null,
				opening_bid: nomination?.opening_bid ?? null,
				bids: bids.map(bidView).sort((a, b) => b.amount - a.amount || a.placed_at - b.placed_at),
				note: nomination?.note ?? null
			};
		});
}

function currentState(draft: DraftRow, viewerTeamId: number | null): CurrentState {
	switch (draft.format) {
		case 'auction': {
			const open = openNomination(draft);
			const high = open ? highBid(draft, open) : null;
			const still = open ? stillIn(draft, open) : [];
			const view: AuctionCurrent = {
				kind: 'auction',
				nomination: open ? nominationView(open) : null,
				high_bid: high ? bidView(high) : null,
				bids: open ? lotBids(draft, open).map(bidView).sort((a, b) => b.placed_at - a.placed_at) : [],
				passed_team_ids: open?.passed_team_ids ?? [],
				eligible_team_ids: open ? eligibleTeams(draft, open) : [],
				still_in_team_ids: still,
				rescind_pending: open ? (rescindPending(draft, open) ? bidView(rescindPending(draft, open)!) : null) : null,
				everyone_out: !!open && !!high && still.length <= 1,
				awaiting_opening: !!open && !high,
				waiting_on_team_id: waitingOn(draft),
				last_sale: draft.last_sale
					? { asset: assetById(draft.last_sale.asset_id), team_id: draft.last_sale.team_id, price: draft.last_sale.price }
					: null
			};
			return view;
		}
		case 'vickrey': {
			const open = openNomination(draft);
			const view: VickreyCurrent = {
				kind: 'vickrey',
				nomination: open ? nominationView(open) : null,
				submitted_team_ids: open ? sealedBids(draft, open).map((bid) => bid.team_id) : [],
				passed_team_ids: open?.passed_team_ids ?? [],
				eligible_team_ids: open ? vickreyEligible(draft, open) : [],
				waiting_on_team_id: waitingOn(draft),
				runoff: runoffView(draft),
				last_result: draft.last_result
					? {
							asset: assetById(draft.last_result.asset_id),
							team_id: draft.last_result.team_id,
							price: draft.last_result.price,
							bids: draft.bids
								.filter((bid) => draft.last_result!.bid_ids.includes(bid.id))
								.map(bidView)
								.sort((a, b) => b.amount - a.amount),
							note: draft.last_result.note
						}
					: null
			};
			return view;
		}
		case 'snake': {
			const ordered = [...draft.picks].sort((a, b) => a.pick_number - b.pick_number);
			const next = nextUnmade(draft);
			const index = next ? ordered.indexOf(next) : ordered.length;
			const view: SnakeCurrent = {
				kind: 'snake',
				on_the_clock: next ? { pick_number: next.pick_number, round: next.round, team_id: next.team_id!, closes_at: draft.deadline } : null,
				upcoming: ordered.slice(index + 1, index + 11).map((pick) => ({ pick_number: pick.pick_number, round: pick.round, team_id: pick.team_id! })),
				recent: ordered
					.filter((pick) => pick.asset_id !== null)
					.sort((a, b) => (b.made_at ?? 0) - (a.made_at ?? 0))
					.slice(0, 8)
					.map(pickView),
				total_picks: ordered.length
			};
			return view;
		}
		case 'round_pool': {
			const round = draft.pool_round;
			const pickers = round ? pickersNow(draft, round) : [];
			const group = round?.groups[round.group_index] ?? null;
			const view: RoundPoolCurrent = {
				kind: 'round_pool',
				phase: round?.phase ?? 'done',
				round_kind: round?.kind ?? 'character',
				participating_team_ids: round?.participating_team_ids ?? [],
				nominations: round ? roundNominations(draft, round).map((row) => ({ team_id: row.nominated_by_team_id, asset: assetById(row.asset_id) })) : [],
				submitted_team_ids: round ? roundBids(draft, round).map((bid) => bid.team_id) : [],
				closes_at: round?.closes_at ?? null,
				order: round
					? round.groups.flatMap((entry, groupIndex) =>
							entry.team_ids.map((teamId) => ({
								team_id: teamId,
								bid: entry.bid,
								group: groupIndex,
								picked: groupIndex < round.group_index || (groupIndex === round.group_index && round.picked_team_ids.includes(teamId))
							}))
						)
					: [],
				picking_team_ids: pickers,
				available: round ? availableThisRound(draft, round).map(assetById) : [],
				tie:
					group && pickers.length > 1
						? {
								team_ids: pickers,
								chosen_team_ids: pickers.filter((id) => draft.teams.find((row) => row.id === id)?.tie_choice_asset_id !== null),
								contested: draft.runoff?.asset_id != null ? assetById(draft.runoff.asset_id) : null
							}
						: draft.runoff
							? { team_ids: draft.runoff.team_ids, chosen_team_ids: [], contested: draft.runoff.asset_id != null ? assetById(draft.runoff.asset_id) : null }
							: null,
				runoff: runoffView(draft),
				waiting_on_team_ids:
					round?.phase === 'nominating'
						? round.participating_team_ids.filter((id) => !queuedEntry(draft, id) || queuedEntry(draft, id)!.kind !== round.kind)
						: round?.phase === 'bidding'
							? round.participating_team_ids.filter((id) => !roundBids(draft, round).some((bid) => bid.team_id === id))
							: pickers
			};
			void viewerTeamId;
			return view;
		}
		case 'fixed_price': {
			const view: FixedPriceCurrent = {
				kind: 'fixed_price',
				deadline: draft.deadline,
				submitted_team_ids: draft.teams.filter((row) => row.submitted_at !== null).map((row) => row.id),
				locked: draft.deadline !== null && Date.now() >= draft.deadline,
				revealed: draft.state === 'completed'
			};
			return view;
		}
	}
}

function queueView(draft: DraftRow): QueueEntry[] {
	if (draft.format === 'snake' || draft.format === 'fixed_price') return [];
	if (draft.state !== 'lobby' && draft.state !== 'live') return [];
	if (draft.format === 'round_pool') {
		const round = draft.pool_round;
		const ids = round && round.phase === 'nominating' ? round.participating_team_ids : draft.teams.filter((row) => openSlotsTotal(draft, row.id) > 0).map((row) => row.id);
		return ids.map((teamId) => {
			const entry = queuedEntry(draft, teamId);
			const problem = entryProblem(draft, entry);
			return { team_id: teamId, asset: entry ? assetById(entry.asset_id) : null, valid: !problem, reason: problem };
		});
	}
	return queueOrder(draft).map((teamId) => {
		const entry = queuedEntry(draft, teamId);
		const problem = entryProblem(draft, entry);
		return { team_id: teamId, asset: entry ? assetById(entry.asset_id) : null, valid: !problem, reason: problem };
	});
}

export function buildSnapshot(draft: DraftRow, viewer: Viewer, priceHistory: Record<number, PriceHistory>): DraftSnapshot {
	const commissioner = isCommissioner(draft, viewer.user_id);
	const viewerTeam = teamOfUser(draft, viewer.user_id);
	const viewerTeamId = viewerTeam?.id ?? null;
	const hideBuilds = draft.format === 'fixed_price' && draft.state !== 'completed';

	const teams: SnapshotTeam[] = [...draft.teams]
		.sort((a, b) => a.draft_order - b.draft_order)
		.map((row) => {
			const picks = teamPicks(draft, row.id).sort((a, b) => a.pick_number - b.pick_number);
			const visible = hideBuilds && row.id !== viewerTeamId ? picks.filter((pick) => pick.is_keeper) : picks;
			return {
				id: row.id,
				name: displayName(row),
				logo: row.logo,
				managers: row.managers.map((manager) => ({ ...manager, connected: draft.connected.has(manager.rio_user_id) })),
				present: row.managers.some((manager) => draft.connected.has(manager.rio_user_id)),
				draft_order: row.draft_order,
				tie_priority: row.tie_priority,
				draft_budget: row.budget,
				spent: hideBuilds && row.id !== viewerTeamId ? 0 : spent(draft, row.id),
				remaining: hideBuilds && row.id !== viewerTeamId ? row.budget : remaining(draft, row.id),
				open_slots: openSlots(draft, row.id),
				open_slots_total: openSlotsTotal(draft, row.id),
				max_bid: maxBid(draft, row.id),
				submitted: row.submitted_at !== null,
				restriction_status: restrictionStatus(draft, row.id),
				waived: row.waived_restrictions,
				picks: visible.map(pickView)
			};
		});

	const pool: PoolEntry[] = draft.config.pool.asset_ids.map((id) => {
		const asset = assetById(id);
		return {
			asset,
			remaining_copies: remainingCopies(draft, id),
			restriction_icons: restrictionIcons(draft, asset),
			...(draft.format === 'fixed_price' ? { price: draft.config.pool.prices?.[id] ?? 0 } : {})
		};
	});

	const ineligible: Record<number, string> = {};
	if (viewerTeamId !== null) {
		for (const id of draft.config.pool.asset_ids) {
			const reason = ineligibleReason(draft, viewerTeamId, assetById(id));
			if (reason) ineligible[id] = reason;
		}
	}

	let sealed: number | null = null;
	if (viewerTeamId !== null) {
		if (draft.format === 'vickrey') {
			const open = openNomination(draft);
			sealed = open ? (sealedBids(draft, open).find((bid) => bid.team_id === viewerTeamId)?.amount ?? null) : null;
		} else if (draft.format === 'round_pool' && draft.pool_round) {
			sealed = roundBids(draft, draft.pool_round).find((bid) => bid.team_id === viewerTeamId)?.amount ?? null;
		}
	}

	const you: YouBlock = {
		role: commissioner ? 'commissioner' : viewerTeam ? 'manager' : viewer.user_id !== null ? 'spectator' : 'none',
		user_id: viewer.user_id,
		username: viewer.username,
		team_id: viewerTeamId,
		ineligible,
		sealed_bid: sealed,
		tie_choice: viewerTeam?.tie_choice_asset_id ?? null,
		build: draft.format === 'fixed_price' && viewerTeamId !== null ? teamPicks(draft, viewerTeamId).map(pickView) : null,
		can_act: draft.state === 'live' && (viewerTeamId !== null || commissioner)
	};

	const activity: ActivityItem[] = [...draft.activity]
		.reverse()
		.slice(0, 30)
		.map((row) => ({
			id: row.id,
			at: row.at,
			kind: row.kind,
			text: row.text,
			team_id: row.team_id,
			asset: row.asset_id !== null ? assetById(row.asset_id) : null,
			amount: row.amount
		}));

	const totalRounds =
		draft.format === 'snake' || draft.format === 'round_pool'
			? draft.config.slots.character + draft.config.slots.stadium
			: draft.teams.length * (draft.config.slots.character + draft.config.slots.stadium);

	return {
		draft: {
			id: draft.id,
			league_id: draft.league_id,
			league_name: draft.league_name,
			collection: draft.collection,
			format: draft.format,
			state: draft.state,
			version: draft.version,
			round: draft.round,
			total_rounds: totalRounds,
			turn_team_id: draft.turn_team_id,
			paused: draft.paused,
			pause_reason: draft.pause_reason,
			advance: draft.config.advance,
			timed: draft.config.lot_seconds !== null,
			server_time: Date.now(),
			started_at: draft.started_at,
			completed_at: draft.completed_at,
			config: draft.config,
			commissioner_ids: draft.commissioner_ids
		},
		teams,
		queue: queueView(draft),
		pool,
		current: currentState(draft, viewerTeamId),
		activity,
		results: resultsView(draft, hideBuilds),
		spectators: [...draft.connected.entries()]
			.filter(([, role]) => role === 'spectator')
			.map(([id]) => ({ rio_user_id: id, username: id === viewer.user_id ? (viewer.username ?? 'you') : `viewer-${id}` })),
		price_history: priceHistory,
		you
	};
}
