// One mock draft server per league: the single write path of §8 in
// TypeScript — validate, mutate, bump version, publish full snapshots.

import { assetById } from '../assets';
import { priceHistoryFor, type LeagueFixture } from '../fixtures';
import { DraftError, type ActionResult, type DraftAction, type DraftSnapshot, type PriceHistory, type Viewer } from '../types';
import type { Actor, FormatModule } from './format';
import { auction, resolveRescind, voidNomination } from './formats/auction';
import { fixedPrice } from './formats/fixedPrice';
import { completeIfDone } from './formats/lot';
import { roundPool } from './formats/roundPool';
import { snake } from './formats/snake';
import { vickrey } from './formats/vickrey';
import { assetAvailable, hasLegalOption, isCommissioner, openSlotsTotal, teamOfUser } from './rules';
import { clearNomination, queuedEntry } from './queue';
import { buildSnapshot } from './snapshot';
import { displayName, log, team, type DraftRow, type TeamRow } from './state';

const FORMATS: Record<DraftRow['format'], FormatModule> = {
	auction,
	vickrey,
	snake,
	fixed_price: fixedPrice,
	round_pool: roundPool
};

interface Subscriber {
	viewer: Viewer;
	callback: (snapshot: DraftSnapshot) => void;
}

function buildRow(fixture: LeagueFixture): DraftRow {
	let nextId = 1000;
	const teams: TeamRow[] = fixture.teams.map((row, index) => ({
		id: row.id,
		name: row.name,
		logo: row.logo,
		managers: row.managers.map((manager) => ({ ...manager })),
		draft_order: index + 1,
		tie_priority: index + 1,
		budget: row.budget ?? fixture.config.budget,
		waived_restrictions: [],
		submitted_at: null,
		tie_choice_asset_id: null,
		aggression: row.aggression
	}));
	const draft: DraftRow = {
		id: fixture.id,
		league_id: fixture.id,
		league_name: fixture.name,
		collection: fixture.collection,
		format: fixture.format,
		state: fixture.state,
		config: structuredClone(fixture.config),
		version: 1,
		round: 0,
		turn_team_id: null,
		paused: false,
		pause_reason: null,
		deadline: fixture.config.deadline,
		pick_remaining_s: null,
		created_at: Date.now() - 7 * 24 * 3600 * 1000,
		started_at: fixture.state === 'live' || fixture.state === 'completed' ? Date.now() - 3600 * 1000 : null,
		completed_at: fixture.completed_at ?? null,
		commissioner_ids: fixture.commissioner_ids,
		teams,
		picks: [],
		nominations: [],
		bids: [],
		runoff: null,
		pool_round: null,
		last_result: null,
		last_sale: null,
		activity: [],
		connected: new Map(),
		away_since: new Map(),
		next_id: nextId
	};
	for (const keeper of fixture.keepers) {
		draft.picks.push({
			id: nextId++,
			round: 0,
			pick_number: keeper.pick_number ?? draft.picks.length + 1,
			team_id: keeper.team_id,
			asset_id: keeper.asset_id,
			price: keeper.price,
			took_remaining_budget: false,
			is_keeper: true,
			nickname: null,
			made_by: 'keeper',
			made_at: draft.created_at,
			nomination_id: null
		});
	}
	if (fixture.picks) {
		let number = draft.picks.length + 1;
		for (const pick of fixture.picks) {
			draft.picks.push({
				id: nextId++,
				round: pick.round,
				pick_number: number++,
				team_id: pick.team_id,
				asset_id: pick.asset_id,
				price: pick.price,
				took_remaining_budget: pick.took_remaining_budget ?? false,
				is_keeper: false,
				nickname: pick.nickname ?? null,
				made_by: null,
				made_at: (fixture.completed_at ?? Date.now()) - (fixture.picks.length - number) * 60_000,
				nomination_id: null
			});
		}
	}
	draft.next_id = nextId;
	log(draft, 'system', fixture.state === 'completed' ? 'Draft completed.' : fixture.state === 'live' ? 'Builds are open.' : 'Room created. Waiting for the commissioner to start.');
	return draft;
}

export class MockDraftServer {
	readonly draft: DraftRow;
	readonly fixture: LeagueFixture;
	readonly priceHistory: Record<number, PriceHistory>;
	private subscribers = new Set<Subscriber>();
	/** Teams whose managers are simulated as dropped (failure toggle). */
	offlineTeams = new Set<number>();
	/** Bots don't act while this is set (server "down"). */
	restarting = false;
	/**
	 * The team the previewing human most recently managed. It stays human
	 * after they leave the tab: a real manager stepping away pauses the draft
	 * rather than handing their seat to a bot.
	 */
	claimedTeamId: number | null = null;

	constructor(fixture: LeagueFixture) {
		this.fixture = fixture;
		this.draft = buildRow(fixture);
		this.priceHistory = priceHistoryFor(fixture.collection);
		this.refreshPresence();
	}

	get format(): FormatModule {
		return FORMATS[this.draft.format];
	}

	// ── Presence ─────────────────────────────────────────────────────────

	/** A team is human-controlled once one of its managers has subscribed. */
	isHuman(teamId: number): boolean {
		if (teamId === this.claimedTeamId) return true;
		return [...this.subscribers].some((subscriber) => teamOfUser(this.draft, subscriber.viewer.user_id)?.id === teamId);
	}

	/** A human takes a seat a bot was warming: drop whatever the bot queued so the nomination is theirs to make. */
	private claim(teamId: number) {
		if (this.claimedTeamId === teamId) return;
		this.claimedTeamId = teamId;
		const queued = queuedEntry(this.draft, teamId);
		if (queued) {
			clearNomination(this.draft, teamId);
			log(this.draft, 'system', `${displayName(team(this.draft, teamId))} joined — their queued nomination is theirs to set`, { team_id: teamId });
		}
	}

	hasHumanCommissioner(): boolean {
		return [...this.subscribers].some((subscriber) => isCommissioner(this.draft, subscriber.viewer.user_id));
	}

	private refreshPresence() {
		const connected = new Map<number, 'manager' | 'commissioner' | 'spectator'>();
		for (const row of this.draft.teams) {
			const human = this.isHuman(row.id);
			const offline = this.offlineTeams.has(row.id);
			if (offline) continue;
			if (!human) {
				// Bots are "present" through their first manager.
				connected.set(row.managers[0].rio_user_id, 'manager');
			}
		}
		for (const subscriber of this.subscribers) {
			const id = subscriber.viewer.user_id;
			if (id === null) continue;
			const row = teamOfUser(this.draft, id);
			if (row && this.offlineTeams.has(row.id)) continue;
			connected.set(id, isCommissioner(this.draft, id) ? 'commissioner' : row ? 'manager' : 'spectator');
		}
		if (!this.hasHumanCommissioner() && !this.restarting) connected.set(this.draft.commissioner_ids[0], 'commissioner');
		this.draft.connected = connected;
	}

	setTeamOffline(teamId: number, offline: boolean) {
		if (offline) this.offlineTeams.add(teamId);
		else this.offlineTeams.delete(teamId);
		this.refreshPresence();
		log(this.draft, 'presence', `${displayName(team(this.draft, teamId))} ${offline ? 'disconnected' : 'reconnected'}`, { team_id: teamId });
		this.publish();
	}

	// ── Streams ──────────────────────────────────────────────────────────

	subscribe(viewer: Viewer, callback: (snapshot: DraftSnapshot) => void): () => void {
		const subscriber: Subscriber = { viewer, callback };
		this.subscribers.add(subscriber);
		const row = teamOfUser(this.draft, viewer.user_id);
		if (row) this.claim(row.id);
		this.refreshPresence();
		this.draft.version += 1;
		this.publish();
		return () => {
			this.subscribers.delete(subscriber);
			this.refreshPresence();
			this.draft.version += 1;
			this.publish();
		};
	}

	snapshot(viewer: Viewer): DraftSnapshot {
		return buildSnapshot(this.draft, viewer, this.priceHistory);
	}

	private publish() {
		for (const subscriber of this.subscribers) subscriber.callback(this.snapshot(subscriber.viewer));
	}

	// ── Writes ───────────────────────────────────────────────────────────

	act(viewer: Viewer, action: DraftAction): ActionResult {
		const row = teamOfUser(this.draft, viewer.user_id);
		const actor: Actor = {
			user_id: viewer.user_id,
			username: viewer.username ?? 'anonymous',
			team_id: row?.id ?? null,
			is_commissioner: isCommissioner(this.draft, viewer.user_id)
		};
		return this.run(actor, action);
	}

	/** Bots act as a team's first manager. */
	actAsTeam(teamId: number, action: DraftAction): ActionResult {
		const row = team(this.draft, teamId);
		const actor: Actor = { user_id: row.managers[0].rio_user_id, username: row.managers[0].username, team_id: teamId, is_commissioner: false };
		return this.run(actor, action);
	}

	actAsCommissioner(action: DraftAction): ActionResult {
		const actor: Actor = { user_id: this.draft.commissioner_ids[0], username: 'commissioner', team_id: null, is_commissioner: true };
		return this.run(actor, action);
	}

	private run(actor: Actor, action: DraftAction): ActionResult {
		try {
			this.dispatch(actor, action);
			this.draft.version += 1;
			this.publish();
			return { ok: true, version: this.draft.version };
		} catch (error) {
			if (error instanceof DraftError) return { ok: false, code: error.code, message: error.message };
			throw error;
		}
	}

	private requireCommissioner(actor: Actor) {
		if (!actor.is_commissioner) throw new DraftError('NOT_COMMISSIONER');
	}

	private dispatch(actor: Actor, action: DraftAction) {
		const draft = this.draft;
		switch (action.type) {
			// ── setup ──
			case 'set_config':
				this.requireCommissioner(actor);
				if (draft.state !== 'setup' && draft.state !== 'lobby') throw new DraftError('INVALID_STATE', 'Rules lock when the draft starts.');
				{
					const { format, ...config } = action.payload;
					Object.assign(draft.config, config);
					if (format && draft.state === 'setup') draft.format = format;
					if (config.budget !== undefined) for (const row of draft.teams) row.budget = config.budget;
					if (config.deadline !== undefined) draft.deadline = config.deadline;
					log(draft, 'commissioner', 'Draft rules updated');
				}
				return;
			case 'open_lobby':
				this.requireCommissioner(actor);
				if (draft.state !== 'setup') throw new DraftError('INVALID_STATE', 'The lobby is already open.');
				draft.state = 'lobby';
				log(draft, 'commissioner', 'The lobby is open. Teams can arrive and queue their first nominations.');
				return;
			case 'set_order':
				this.requireCommissioner(actor);
				action.payload.team_ids.forEach((id, index) => (team(draft, id).draft_order = index + 1));
				return;
			case 'set_tie_priority':
				this.requireCommissioner(actor);
				action.payload.team_ids.forEach((id, index) => (team(draft, id).tie_priority = index + 1));
				return;
			case 'add_keeper': {
				this.requireCommissioner(actor);
				if (draft.state !== 'setup' && draft.state !== 'lobby') throw new DraftError('INVALID_STATE');
				const { team_id, asset_id, price, pick_number } = action.payload;
				if (!assetAvailable(draft, asset_id)) throw new DraftError('ASSET_UNAVAILABLE', 'No copies of that asset are left.');
				draft.picks.push({
					id: draft.next_id++,
					round: 0,
					pick_number: pick_number ?? draft.picks.length + 1,
					team_id,
					asset_id,
					price,
					took_remaining_budget: false,
					is_keeper: true,
					nickname: null,
					made_by: actor.username,
					made_at: Date.now(),
					nomination_id: null
				});
				log(draft, 'commissioner', `Keeper: ${assetById(asset_id).name} to ${displayName(team(draft, team_id))} at $${price}`, { team_id, asset: assetById(asset_id), amount: price });
				return;
			}
			case 'remove_keeper': {
				this.requireCommissioner(actor);
				const index = draft.picks.findIndex((pick) => pick.id === action.payload.pick_id && pick.is_keeper);
				if (index === -1) throw new DraftError('INVALID_STATE', 'No such keeper.');
				draft.picks.splice(index, 1);
				return;
			}
			case 'start':
				this.requireCommissioner(actor);
				if (draft.state !== 'setup' && draft.state !== 'lobby') throw new DraftError('INVALID_STATE', 'Already started.');
				draft.state = 'live';
				draft.started_at = Date.now();
				log(draft, 'commissioner', 'The draft is live.');
				this.format.start(draft);
				return;
			// ── common ──
			case 'set_nickname': {
				const pick = draft.picks.find((candidate) => candidate.id === action.payload.pick_id);
				if (!pick) throw new DraftError('INVALID_STATE', 'No such pick.');
				if (pick.team_id !== actor.team_id && !actor.is_commissioner) throw new DraftError('NOT_A_MANAGER');
				const nickname = action.payload.nickname?.trim().slice(0, 24) || null;
				pick.nickname = actor.is_commissioner && pick.team_id !== actor.team_id ? null : nickname;
				return;
			}
			case 'set_team_name': {
				const row = team(draft, action.payload.team_id);
				if (row.id !== actor.team_id && !actor.is_commissioner) throw new DraftError('NOT_A_MANAGER');
				row.name = action.payload.name?.trim().slice(0, 28) || null;
				return;
			}
			// ── commissioner ──
			case 'pause':
				this.requireCommissioner(actor);
				this.pause(action.payload?.reason ?? 'Paused by the commissioner');
				return;
			case 'resume':
				this.requireCommissioner(actor);
				this.resume();
				return;
			case 'open_bidding':
				this.requireCommissioner(actor);
				if (draft.paused) throw new DraftError('DRAFT_PAUSED');
				if (!this.format.openNext) throw new DraftError('INVALID_ACTION');
				this.format.openNext(draft);
				return;
			case 'close_current':
				this.requireCommissioner(actor);
				if (draft.paused) throw new DraftError('DRAFT_PAUSED');
				if (!this.format.closeCurrent) throw new DraftError('INVALID_ACTION');
				this.format.closeCurrent(draft);
				return;
			case 'void': {
				this.requireCommissioner(actor);
				if (action.payload.pick_id !== undefined) {
					const index = draft.picks.findIndex((pick) => pick.id === action.payload.pick_id);
					if (index === -1) throw new DraftError('INVALID_STATE', 'No such pick.');
					const pick = draft.picks[index];
					const asset = assetById(pick.asset_id!);
					if (draft.format === 'snake') {
						Object.assign(pick, { asset_id: null, made_at: null, made_by: null, is_keeper: false });
					} else {
						draft.picks.splice(index, 1);
					}
					log(draft, 'commissioner', `Voided ${asset.name} (${displayName(team(draft, pick.team_id!))}) — ${action.payload.note}`, { team_id: pick.team_id, asset });
					if (draft.state === 'completed') draft.state = 'live';
				} else if (action.payload.nomination_id !== undefined) {
					voidNomination(draft, action.payload.nomination_id, action.payload.note);
				}
				return;
			}
			case 'act_for_team': {
				this.requireCommissioner(actor);
				const row = team(draft, action.payload.team_id);
				const proxy: Actor = { ...actor, team_id: row.id, username: `${actor.username} (for ${displayName(row)})`, is_commissioner: false };
				log(draft, 'commissioner', `Commissioner acting for ${displayName(row)}`, { team_id: row.id });
				this.format.handle(draft, proxy, action.payload.action);
				return;
			}
			case 'resolve_rescind':
				this.requireCommissioner(actor);
				resolveRescind(draft, action.payload.bid_id, action.payload.approve);
				return;
			case 'waive_restriction': {
				this.requireCommissioner(actor);
				const row = team(draft, action.payload.team_id);
				if (!row.waived_restrictions.includes(action.payload.restriction)) row.waived_restrictions.push(action.payload.restriction);
				log(draft, 'commissioner', `Waived "${action.payload.restriction}" for ${displayName(row)}`, { team_id: row.id });
				return;
			}
			case 'set_team_budget': {
				this.requireCommissioner(actor);
				const row = team(draft, action.payload.team_id);
				row.budget = Math.max(0, Math.round(action.payload.budget));
				log(draft, 'commissioner', `${displayName(row)} budget set to $${row.budget}`, { team_id: row.id, amount: row.budget });
				return;
			}
			case 'extend_deadline':
				this.requireCommissioner(actor);
				draft.deadline = action.payload.deadline;
				draft.config.deadline = action.payload.deadline;
				log(draft, 'commissioner', `Deadline extended to ${new Date(action.payload.deadline).toLocaleString()}`);
				return;
			case 'set_advance':
				this.requireCommissioner(actor);
				draft.config.advance = action.payload.advance;
				log(draft, 'commissioner', `Advance set to ${action.payload.advance}`);
				if (action.payload.advance === 'auto' && this.format.openNext && !draft.paused && draft.state === 'live') {
					try {
						this.format.openNext(draft);
					} catch {
						/* front of the queue not ready — the draft waits */
					}
				}
				return;
			case 'complete':
				this.requireCommissioner(actor);
				if (draft.state !== 'live') throw new DraftError('INVALID_STATE');
				if (draft.format === 'fixed_price') {
					const missing = draft.teams.filter((row) => row.submitted_at === null);
					if (missing.length) throw new DraftError('INVALID_STATE', `${missing.map(displayName).join(', ')} have not submitted.`);
				}
				draft.state = 'completed';
				draft.completed_at = Date.now();
				draft.turn_team_id = null;
				log(draft, 'commissioner', 'The commissioner completed the draft. Rosters are committed.');
				return;
			default:
				if (draft.state !== 'live' && draft.state !== 'lobby') throw new DraftError('INVALID_STATE');
				this.format.handle(draft, actor, action);
				completeIfDone(draft);
		}
	}

	pause(reason: string) {
		const draft = this.draft;
		if (draft.state !== 'live') throw new DraftError('INVALID_STATE');
		if (draft.paused) return;
		draft.paused = true;
		draft.pause_reason = reason;
		this.format.freeze(draft, Date.now());
		log(draft, 'commissioner', `Paused — ${reason}`);
	}

	resume() {
		const draft = this.draft;
		if (!draft.paused) throw new DraftError('INVALID_STATE', 'Not paused.');
		draft.paused = false;
		draft.pause_reason = null;
		this.format.thaw(draft, Date.now(), draft.config.extend_seconds);
		log(draft, 'commissioner', 'Resumed');
	}

	/** Failure toggle: the process restarts — every in-progress draft pauses (§8). */
	restart() {
		const draft = this.draft;
		this.restarting = true;
		if (draft.state === 'live' && !draft.paused) {
			draft.paused = true;
			draft.pause_reason = 'Server restarted — the commissioner resumes when the room has reconnected';
			this.format.freeze(draft, Date.now());
			this.format.thaw(draft, Date.now(), draft.config.extend_seconds);
			this.format.freeze(draft, Date.now());
			log(draft, 'system', 'Server restarted. The draft is paused.');
		}
		this.refreshPresence();
		this.draft.version += 1;
		this.publish();
		setTimeout(() => {
			this.restarting = false;
			this.refreshPresence();
			this.draft.version += 1;
			this.publish();
		}, 2500);
	}

	// ── Timers ───────────────────────────────────────────────────────────

	tick(now: number) {
		const draft = this.draft;
		let changed = false;
		if (this.restarting) return;
		if (this.format.tick(draft, now)) changed = true;
		changed = this.autoPause(now) || changed;
		if (draft.state === 'live' && draft.format === 'fixed_price' && draft.deadline !== null && now >= draft.deadline && !draft.activity.some((row) => row.text.startsWith('Deadline passed'))) {
			log(draft, 'system', 'Deadline passed — submitted builds are locked.');
			changed = true;
		}
		if (changed) {
			draft.version += 1;
			this.publish();
		}
	}

	private autoPause(now: number): boolean {
		const draft = this.draft;
		if (draft.state !== 'live' || draft.format === 'fixed_price') return false;
		let changed = false;
		for (const row of draft.teams) {
			const present = row.managers.some((manager) => draft.connected.has(manager.rio_user_id));
			if (present) {
				if (draft.away_since.has(row.id)) {
					draft.away_since.delete(row.id);
					changed = true;
				}
				continue;
			}
			if (openSlotsTotal(draft, row.id) === 0) continue;
			if (!draft.away_since.has(row.id)) {
				draft.away_since.set(row.id, now);
				changed = true;
			}
			const away = now - draft.away_since.get(row.id)!;
			if (draft.config.auto_pause_on_disconnect && !draft.paused && away >= draft.config.auto_pause_grace_seconds * 1000) {
				this.pause(`${displayName(row)} disconnected`);
				changed = true;
			}
		}
		return changed;
	}

	/** For the commissioner panel: teams with no legal pick right now. */
	stuckTeams(): number[] {
		const draft = this.draft;
		if (draft.state !== 'live') return [];
		return draft.teams
			.filter((row) => openSlotsTotal(draft, row.id) > 0)
			.filter((row) => !hasLegalOption(draft, row.id, 'character') && !hasLegalOption(draft, row.id, 'stadium'))
			.map((row) => row.id);
	}
}
