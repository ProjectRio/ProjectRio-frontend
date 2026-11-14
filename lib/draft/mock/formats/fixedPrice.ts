// Fixed price (Muddyball) — not live: private builds, a deadline, reveal on
// completion (§7e).

import { assetById } from '../../assets';
import { DraftError, type DraftAction } from '../../types';
import type { Actor, FormatModule } from '../format';
import { assertEligible, openSlotsTotal, spent } from '../rules';
import { displayName, log, nextId, team, teamPicks, type DraftRow } from '../state';

function requireTeam(actor: Actor): number {
	if (actor.team_id === null) throw new DraftError('NOT_A_MANAGER');
	return actor.team_id;
}

function requireEditable(draft: DraftRow, teamId: number) {
	if (draft.state !== 'live') throw new DraftError('INVALID_STATE', 'The draft is not open for builds.');
	if (team(draft, teamId).submitted_at !== null) throw new DraftError('INVALID_STATE', 'Withdraw your submission to edit.');
}

function add(draft: DraftRow, actor: Actor, assetId: number) {
	const teamId = requireTeam(actor);
	requireEditable(draft, teamId);
	const asset = assetById(assetId);
	const price = draft.config.pool.prices?.[assetId];
	if (price === undefined) throw new DraftError('ASSET_UNAVAILABLE', 'That asset has no price.');
	assertEligible(draft, teamId, asset);
	if (spent(draft, teamId) + price > team(draft, teamId).budget) throw new DraftError('EXCEEDS_MAX_BID', 'That would go over your budget.');
	draft.picks.push({
		id: nextId(draft),
		round: 1,
		pick_number: teamPicks(draft, teamId).length + 1,
		team_id: teamId,
		asset_id: assetId,
		price,
		took_remaining_budget: false,
		is_keeper: false,
		nickname: null,
		made_by: actor.username,
		made_at: Date.now(),
		nomination_id: null
	});
}

function remove(draft: DraftRow, actor: Actor, pickId: number) {
	const teamId = requireTeam(actor);
	requireEditable(draft, teamId);
	const index = draft.picks.findIndex((pick) => pick.id === pickId && pick.team_id === teamId && !pick.is_keeper);
	if (index === -1) throw new DraftError('INVALID_STATE', 'No such pick on your build.');
	draft.picks.splice(index, 1);
}

function submit(draft: DraftRow, actor: Actor) {
	const teamId = requireTeam(actor);
	requireEditable(draft, teamId);
	if (openSlotsTotal(draft, teamId) > 0) throw new DraftError('INVALID_STATE', 'Fill every slot before submitting.');
	team(draft, teamId).submitted_at = Date.now();
	log(draft, 'pick', `${displayName(team(draft, teamId))} submitted a build`, { team_id: teamId });
}

function unsubmit(draft: DraftRow, actor: Actor) {
	const teamId = requireTeam(actor);
	if (draft.state !== 'live') throw new DraftError('INVALID_STATE');
	if (draft.deadline !== null && Date.now() >= draft.deadline) throw new DraftError('LOT_CLOSED', 'The deadline has passed; builds are locked.');
	team(draft, teamId).submitted_at = null;
	log(draft, 'pick', `${displayName(team(draft, teamId))} withdrew their build`, { team_id: teamId });
}

export const fixedPrice: FormatModule = {
	start(draft) {
		draft.round = 1;
		draft.deadline = draft.config.deadline;
	},
	handle(draft, actor, action: DraftAction) {
		switch (action.type) {
			case 'add':
				add(draft, actor, action.payload.asset_id);
				return;
			case 'remove':
				remove(draft, actor, action.payload.pick_id);
				return;
			case 'submit':
				submit(draft, actor);
				return;
			case 'unsubmit':
				unsubmit(draft, actor);
				return;
			default:
				throw new DraftError('INVALID_ACTION');
		}
	},
	tick() {
		return false;
	},
	freeze() {},
	thaw() {}
};
