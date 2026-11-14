// Bot teams: nominate, bid, pass and pick like impatient humans. A team is a
// bot whenever no real viewer is subscribed as one of its managers. A bot
// commissioner steps in when nobody is viewing as the commissioner.

import { assetById } from '../assets';
import { scaledValue, seeded } from '../values';
import type { Asset, AssetKind, DraftAction } from '../types';
import { openNomination } from './formats/lot';
import { bidFloor, highBid, stillIn, eligibleTeams } from './formats/auction';
import { sealedBids, vickreyEligible } from './formats/vickrey';
import { nextUnmade } from './formats/snake';
import { availableThisRound, nextRoundKind, pickersNow, roundBids } from './formats/roundPool';
import { entryProblem, queuedEntry } from './queue';
import { assetAvailable, ineligibleReason, maxBid, openSlots, openSlotsTotal, remaining } from './rules';
import type { MockDraftServer } from './server';
import { team, type DraftRow } from './state';
import { runoffHigh } from './ties';

interface BotMemory {
	nextAt: number;
	passedOn: number | null;
	commissionerAt: number;
	startAt: number | null;
}

const memories = new WeakMap<MockDraftServer, Map<number, BotMemory>>();

function memory(server: MockDraftServer, teamId: number): BotMemory {
	let map = memories.get(server);
	if (!map) {
		map = new Map();
		memories.set(server, map);
	}
	let entry = map.get(teamId);
	if (!entry) {
		entry = { nextAt: 0, passedOn: null, commissionerAt: 0, startAt: null };
		map.set(teamId, entry);
	}
	return entry;
}

function jitter(seed: number, min: number, max: number): number {
	return min + seeded(seed) * (max - min);
}

/** What a bot thinks an asset is worth to it right now. */
function valuation(draft: DraftRow, teamId: number, asset: Asset): number {
	const row = team(draft, teamId);
	const totalSlots = draft.config.slots.character + draft.config.slots.stadium;
	const base = scaledValue(asset.name, row.budget || 40);
	const open = openSlotsTotal(draft, teamId);
	const perSlot = open > 0 ? remaining(draft, teamId) / open : 0;
	const pace = row.budget > 0 ? Math.min(1.6, Math.max(0.5, perSlot / (row.budget / totalSlots))) : 1;
	const noise = 0.85 + seeded(teamId * 131 + asset.id * 17 + draft.round) * 0.3;
	const temper = 0.75 + row.aggression * 0.6;
	return base * pace * noise * temper;
}

function preferredKind(draft: DraftRow, teamId: number, forced?: AssetKind | null): AssetKind | null {
	if (forced) return forced;
	const slots = openSlots(draft, teamId);
	if (slots.character > 0) return 'character';
	if (slots.stadium > 0) return 'stadium';
	return null;
}

function bestAsset(draft: DraftRow, teamId: number, candidates: number[], kind: AssetKind | null): Asset | null {
	let best: Asset | null = null;
	let bestValue = -Infinity;
	for (const id of candidates) {
		const asset = assetById(id);
		if (kind && asset.kind !== kind) continue;
		if (ineligibleReason(draft, teamId, asset) !== null) continue;
		const value = valuation(draft, teamId, asset) + seeded(id * 7 + teamId) * 0.5;
		if (value > bestValue) {
			bestValue = value;
			best = asset;
		}
	}
	return best;
}

function queueCandidates(draft: DraftRow): number[] {
	const queued = new Map<number, number>();
	for (const row of draft.nominations) if (row.state === 'queued' || row.state === 'open') queued.set(row.asset_id, (queued.get(row.asset_id) ?? 0) + 1);
	return draft.config.pool.asset_ids.filter((id) => {
		if (!assetAvailable(draft, id)) return false;
		const copies = draft.config.pool.copies;
		return copies === null || (queued.get(id) ?? 0) < copies;
	});
}

function act(server: MockDraftServer, teamId: number, action: DraftAction) {
	server.actAsTeam(teamId, action);
}

function botTeam(server: MockDraftServer, teamId: number, now: number) {
	const draft = server.draft;
	const mem = memory(server, teamId);
	if (now < mem.nextAt) return;
	const delay = (min: number, max: number) => (mem.nextAt = now + jitter(now + teamId, min, max) * 1000);

	if (draft.state !== 'lobby' && draft.state !== 'live') return;
	if (draft.paused) return;

	// Queue a nomination whenever ours is missing (auction, Vickrey, round pool).
	if (draft.format === 'auction' || draft.format === 'vickrey' || draft.format === 'round_pool') {
		const entry = queuedEntry(draft, teamId);
		const needsQueue = openSlotsTotal(draft, teamId) > 0 && (!entry || entryProblem(draft, entry) !== null);
		if (needsQueue) {
			const forcedKind = draft.format === 'round_pool' ? (draft.pool_round?.phase === 'nominating' ? draft.pool_round.kind : nextRoundKind(draft)) : null;
			const kind = preferredKind(draft, teamId, forcedKind);
			const asset = kind ? bestAsset(draft, teamId, queueCandidates(draft), kind) : null;
			if (asset) {
				act(server, teamId, { type: 'queue_nomination', payload: { asset_id: asset.id } });
				delay(2, 6);
				return;
			}
		}
	}

	if (draft.state !== 'live') return;

	// Runoffs (Vickrey, round pool).
	if (draft.runoff && draft.runoff.team_ids.includes(teamId) && !draft.runoff.passed_team_ids.includes(teamId)) {
		const high = runoffHigh(draft);
		if (high?.team_id === teamId) return;
		const asset = assetById(draft.runoff.asset_id ?? openNomination(draft)?.asset_id ?? draft.config.pool.asset_ids[0]);
		const value = valuation(draft, teamId, asset) * 1.1;
		const next = (high?.amount ?? draft.runoff.tied_amount) + draft.config.bid_increment;
		if (next <= value && next <= maxBid(draft, teamId)) act(server, teamId, { type: 'runoff_bid', payload: { amount: next } });
		else act(server, teamId, { type: 'runoff_pass' });
		delay(1.5, 4);
		return;
	}

	switch (draft.format) {
		case 'auction': {
			const open = openNomination(draft);
			if (!open) return;
			if (!eligibleTeams(draft, open).includes(teamId)) return;
			const high = highBid(draft, open);
			const asset = assetById(open.asset_id);
			if (!high) {
				// The nominator names the opening bid; everyone else waits for it.
				if (open.nominated_by_team_id !== teamId) return;
				const value = valuation(draft, teamId, asset);
				const opening = Math.max(draft.config.min_bid, Math.min(maxBid(draft, teamId), Math.round(value * 0.45)));
				act(server, teamId, { type: 'bid', payload: { amount: opening } });
				delay(1.5, 4);
				return;
			}
			if (high.team_id === teamId) return;
			if (open.passed_team_ids.includes(teamId)) return;
			if (!stillIn(draft, open).includes(teamId)) return;
			if (ineligibleReason(draft, teamId, asset)) return;
			const value = valuation(draft, teamId, asset);
			const next = bidFloor(draft, open);
			const jump = team(draft, teamId).aggression > 0.7 && value - next > 4 ? draft.config.bid_increment * 2 : 0;
			const amount = Math.min(next + jump, maxBid(draft, teamId));
			if (amount >= next && amount <= value) {
				act(server, teamId, { type: 'bid', payload: { amount } });
				delay(1.2, 4);
			} else if (mem.passedOn !== open.id) {
				act(server, teamId, { type: 'pass' });
				mem.passedOn = open.id;
				delay(1, 3);
			}
			return;
		}
		case 'vickrey': {
			const open = openNomination(draft);
			if (!open) return;
			if (!vickreyEligible(draft, open).includes(teamId)) return;
			if (sealedBids(draft, open).some((bid) => bid.team_id === teamId)) return;
			if (open.passed_team_ids.includes(teamId)) return;
			const asset = assetById(open.asset_id);
			const value = valuation(draft, teamId, asset);
			const isNominator = open.nominated_by_team_id === teamId;
			if (!isNominator && value < draft.config.min_bid * 2 && seeded(open.id + teamId) < 0.5) {
				act(server, teamId, { type: 'pass' });
			} else {
				const amount = Math.max(draft.config.min_bid, Math.min(maxBid(draft, teamId), Math.round(value * (0.85 + seeded(open.id * 3 + teamId) * 0.3))));
				act(server, teamId, { type: 'sealed_bid', payload: { amount } });
			}
			delay(2, 7);
			return;
		}
		case 'snake': {
			const next = nextUnmade(draft);
			if (!next || next.team_id !== teamId) return;
			const kind = preferredKind(draft, teamId);
			const asset = kind ? bestAsset(draft, teamId, draft.config.pool.asset_ids.filter((id) => assetAvailable(draft, id)), kind) : null;
			if (asset) act(server, teamId, { type: 'pick', payload: { asset_id: asset.id } });
			delay(2.5, 6);
			return;
		}
		case 'round_pool': {
			const round = draft.pool_round;
			if (!round) return;
			if (round.phase === 'bidding' && round.participating_team_ids.includes(teamId)) {
				if (roundBids(draft, round).some((bid) => bid.team_id === teamId)) return;
				const available = availableThisRound(draft, round);
				const want = bestAsset(draft, teamId, available, round.kind);
				const value = want ? valuation(draft, teamId, want) * 0.6 : draft.config.min_bid;
				const amount = Math.max(draft.config.min_bid, Math.min(maxBid(draft, teamId), Math.round(value)));
				act(server, teamId, { type: 'sealed_bid', payload: { amount } });
				delay(2, 6);
				return;
			}
			if (round.phase === 'picking' && pickersNow(draft, round).includes(teamId)) {
				if (team(draft, teamId).tie_choice_asset_id !== null) return;
				const asset = bestAsset(draft, teamId, availableThisRound(draft, round), round.kind);
				if (asset) act(server, teamId, { type: 'pick', payload: { asset_id: asset.id } });
				delay(2, 5);
			}
			return;
		}
		case 'fixed_price': {
			const row = team(draft, teamId);
			if (row.submitted_at !== null) return;
			if (openSlotsTotal(draft, teamId) === 0) {
				act(server, teamId, { type: 'submit' });
				delay(4, 10);
				return;
			}
			const prices = draft.config.pool.prices ?? {};
			const budgetLeft = remaining(draft, teamId);
			const slotsLeft = openSlotsTotal(draft, teamId);
			const kind = preferredKind(draft, teamId);
			const affordable = draft.config.pool.asset_ids.filter((id) => {
				const price = prices[id] ?? 0;
				return price <= budgetLeft - (slotsLeft - 1) * 1 && assetById(id).kind === kind;
			});
			// Value per dollar with a little personality.
			let best: number | null = null;
			let bestScore = -Infinity;
			for (const id of affordable) {
				const asset = assetById(id);
				if (ineligibleReason(draft, teamId, asset)) continue;
				const score = valuation(draft, teamId, asset) / Math.max(1, prices[id] ?? 1) + seeded(id + teamId * 3) * 0.4;
				if (score > bestScore) {
					bestScore = score;
					best = id;
				}
			}
			if (best !== null) act(server, teamId, { type: 'add', payload: { asset_id: best } });
			delay(3, 9);
			return;
		}
	}
}

function botCommissioner(server: MockDraftServer, now: number) {
	const draft = server.draft;
	const mem = memory(server, -1);
	if (now < mem.commissionerAt) return;
	const delay = (seconds: number) => (mem.commissionerAt = now + seconds * 1000);

	if (draft.state === 'lobby' && draft.format !== 'fixed_price') {
		const ready =
			draft.format === 'snake' ||
			draft.teams.every((row) => openSlotsTotal(draft, row.id) === 0 || queuedEntry(draft, row.id));
		// Start a beat after every nomination is in — or after a longer wait
		// regardless, since the room simply waits on a missing entry.
		if (mem.startAt === null) mem.startAt = now + 40_000;
		if (ready) mem.startAt = Math.min(mem.startAt, now + 12_000);
		if (now >= mem.startAt) {
			server.actAsCommissioner({ type: 'start' });
			mem.startAt = null;
			delay(3);
		}
		return;
	}
	if (draft.state !== 'live') return;

	if (draft.paused) {
		// Resume once every team with open slots is back, after a beat.
		const allBack = draft.teams.every((row) => openSlotsTotal(draft, row.id) === 0 || row.managers.some((manager) => draft.connected.has(manager.rio_user_id)));
		if (allBack) {
			server.actAsCommissioner({ type: 'resume' });
			delay(4);
		}
		return;
	}

	const open = openNomination(draft);
	if (draft.format === 'auction' && open) {
		const pending = draft.bids.find((bid) => bid.nomination_id === open.id && bid.rescind === 'requested');
		if (pending) {
			server.actAsCommissioner({ type: 'resolve_rescind', payload: { bid_id: pending.id, approve: seeded(pending.id) < 0.7 } });
			delay(3);
			return;
		}
		if (open.closes_at === null && highBid(draft, open) && stillIn(draft, open).length <= 1) {
			server.actAsCommissioner({ type: 'close_current' });
			delay(3);
			return;
		}
	}
	if (draft.config.advance === 'manual' && !open && !draft.runoff && (draft.format === 'auction' || draft.format === 'vickrey')) {
		const result = server.actAsCommissioner({ type: 'open_bidding' });
		delay(result.ok ? 4 : 2);
	}
}

export function runBots(server: MockDraftServer, now: number) {
	if (server.restarting) return;
	const draft = server.draft;
	if (draft.state === 'completed' || draft.state === 'setup') return;
	for (const row of draft.teams) {
		if (server.isHuman(row.id) || server.offlineTeams.has(row.id)) continue;
		botTeam(server, row.id, now);
	}
	if (!server.hasHumanCommissioner()) botCommissioner(server, now);
}
