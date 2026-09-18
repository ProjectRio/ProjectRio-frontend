// Snake — serpentine picks, no budgets (§7d).

import { assetById } from '../../assets';
import { DraftError, type DraftAction } from '../../types';
import { freezeClock, thawClock, type Actor, type FormatModule } from '../format';
import { assertEligible, assertLive, recordPick } from '../rules';
import { displayName, log, nextId, team, type DraftRow, type PickRow } from '../state';

export function nextUnmade(draft: DraftRow): PickRow | undefined {
	return [...draft.picks].sort((a, b) => a.pick_number - b.pick_number).find((pick) => pick.asset_id === null);
}

// The pick clock lives on the draft row as `deadline` for snake.
function armClock(draft: DraftRow) {
	const next = nextUnmade(draft);
	draft.turn_team_id = next?.team_id ?? null;
	draft.round = next?.round ?? draft.round;
	draft.deadline = next && draft.config.pick_seconds ? Date.now() + draft.config.pick_seconds * 1000 : null;
	if (!next) {
		draft.state = 'completed';
		draft.completed_at = Date.now();
		log(draft, 'system', 'Every pick is in — the draft is complete.');
	}
}

export function makePick(draft: DraftRow, teamId: number, assetId: number, madeBy: string) {
	assertLive(draft);
	const next = nextUnmade(draft);
	if (!next) throw new DraftError('INVALID_STATE', 'The board is full.');
	if (next.team_id !== teamId) throw new DraftError('NOT_YOUR_TURN');
	const asset = assetById(assetId);
	assertEligible(draft, teamId, asset);
	recordPick(draft, { teamId, assetId, price: 0, round: next.round, madeBy, existing: next });
	log(draft, 'pick', `${displayName(team(draft, teamId))} picked ${asset.name} (${next.round}.${next.pick_number})`, { team_id: teamId, asset });
	armClock(draft);
}

export const snake: FormatModule = {
	start(draft) {
		const order = [...draft.teams].sort((a, b) => a.draft_order - b.draft_order);
		const rounds = draft.config.slots.character + draft.config.slots.stadium;
		const keepers = draft.picks.filter((pick) => pick.is_keeper);
		draft.picks = [];
		let number = 1;
		for (let round = 1; round <= rounds; round++) {
			const sequence = round % 2 === 1 ? order : [...order].reverse();
			for (const row of sequence) {
				draft.picks.push({
					id: nextId(draft),
					round,
					pick_number: number++,
					team_id: row.id,
					asset_id: null,
					price: 0,
					took_remaining_budget: false,
					is_keeper: false,
					nickname: null,
					made_by: null,
					made_at: null,
					nomination_id: null
				});
			}
		}
		// Keepers fill the specific picks the commissioner assigned them to.
		for (const keeper of keepers) {
			const slot = draft.picks.find((pick) => pick.pick_number === keeper.pick_number && pick.team_id === keeper.team_id);
			if (slot) Object.assign(slot, { asset_id: keeper.asset_id, is_keeper: true, made_at: Date.now(), made_by: 'keeper' });
		}
		armClock(draft);
	},
	handle(draft, actor, action: DraftAction) {
		switch (action.type) {
			case 'pick':
				if (actor.team_id === null) throw new DraftError('NOT_A_MANAGER');
				makePick(draft, actor.team_id, action.payload.asset_id, actor.username);
				return;
			default:
				throw new DraftError('INVALID_ACTION');
		}
	},
	tick() {
		// A per-pick timer running out changes nothing server-side: no auto-pick.
		return false;
	},
	freeze(draft, now) {
		const holder = { closes_at: draft.deadline, paused_remaining_s: null as number | null };
		freezeClock(holder, now);
		draft.deadline = holder.closes_at;
		draft.pick_remaining_s = holder.paused_remaining_s;
	},
	thaw(draft, now, minSeconds) {
		const holder = { closes_at: null as number | null, paused_remaining_s: draft.pick_remaining_s };
		thawClock(holder, now, minSeconds);
		draft.deadline = holder.closes_at;
		draft.pick_remaining_s = null;
	}
};
