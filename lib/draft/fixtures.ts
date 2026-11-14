// Seeded fixture leagues — one per format plus a completed season and a league
// still in setup. Everything the preview shows comes from here.

import { ALL_ASSETS, assetIdForCharacter, assetIdForStadium } from './assets';
import type { DraftConfig, DraftFormat, DraftState, PriceHistory } from './types';
import { baseValue, scaledValue, seeded } from './values';

export interface FixtureManager {
	rio_user_id: number;
	username: string;
}

export interface FixtureTeam {
	id: number;
	name: string | null;
	logo: string | null;
	managers: FixtureManager[];
	aggression: number;
	budget?: number;
}

export interface FixtureKeeper {
	team_id: number;
	asset_id: number;
	price: number;
	pick_number?: number;
}

export interface FixturePick {
	team_id: number;
	asset_id: number;
	price: number;
	round: number;
	took_remaining_budget?: boolean;
	nickname?: string | null;
}

export interface LeagueFixture {
	id: number;
	name: string;
	collection: string;
	season: string;
	format: DraftFormat;
	description: string;
	commissioner_ids: number[];
	state: DraftState;
	scheduled_at: number | null;
	teams: FixtureTeam[];
	config: DraftConfig;
	keepers: FixtureKeeper[];
	picks?: FixturePick[];
	completed_at?: number;
}

const ALL_CHARACTER_IDS = ALL_ASSETS.filter((asset) => asset.kind === 'character').map((asset) => asset.id);
const ALL_STADIUM_IDS = ALL_ASSETS.filter((asset) => asset.kind === 'stadium').map((asset) => asset.id);

// The NPSS pool from the league sheet: eight teams × ten slots = 80 copies.
// Four characters carry three copies, sixteen carry two, the rest one; every
// stadium can be held by two teams (a "flex" stadium covers the eighth).
const TRIPLE = ['Mario', 'Luigi', 'Wario', 'Daisy'];
const DOUBLE = ['DK', 'Petey', 'Boo', 'Yoshi', 'Peach', 'Waluigi', 'Birdo', 'Koopa(G)', 'Toad(R)', 'Noki(G)', 'Diddy', 'Toadette', 'Bowser Jr', 'Dry Bones(G)', 'Paratroopa(R)', 'Monty'];
const NPSS_COPIES: Record<number, number> = Object.fromEntries(
	ALL_ASSETS.map((asset) => [asset.id, asset.kind === 'stadium' ? 2 : TRIPLE.includes(asset.name) ? 3 : DOUBLE.includes(asset.name) ? 2 : 1])
);

const DAY = 24 * 60 * 60 * 1000;

function baseConfig(overrides: Partial<DraftConfig> = {}): DraftConfig {
	return {
		slots: { character: 9, stadium: 1 },
		pool: { asset_ids: [...ALL_CHARACTER_IDS, ...ALL_STADIUM_IDS], copies: 1, copies_by_asset: NPSS_COPIES },
		budget: 120,
		min_bid: 1,
		bid_increment: 1,
		lot_seconds: 30,
		extend_seconds: 10,
		pick_seconds: null,
		advance: 'auto',
		last_slot_takes_remaining: true,
		restrictions: [
			{ type: 'captain_required' },
			{ type: 'group_max', name: 'Piantas', char_ids: [21, 22, 23], max: 1 },
			{ type: 'group_max', name: 'Bros', char_ids: [27, 52, 53], max: 2 },
			{ type: 'must_be_captain', char_id: 9 },
			{ type: 'handedness', char_id: 2, bat: 'L', pitch: null }
		],
		ties: { method: 'runoff' },
		auto_pause_on_disconnect: true,
		auto_pause_grace_seconds: 15,
		trades: { enabled: true, approval_model: 'commissioner' },
		free_agency: { mode: 'none' },
		deadline: null,
		...overrides
	};
}

// Managers. User 1 is the commissioner identity the preview signs in as.
const U = {
	matt: { rio_user_id: 1, username: 'MattGree' },
	pepper: { rio_user_id: 2, username: 'Peppermint' },
	vokal: { rio_user_id: 3, username: 'Vokal' },
	rhino: { rio_user_id: 4, username: 'RhinoRK' },
	skoop: { rio_user_id: 5, username: 'Skoop' },
	torch: { rio_user_id: 6, username: 'Torchic' },
	bones: { rio_user_id: 7, username: 'DryBonesFan' },
	kev: { rio_user_id: 8, username: 'KevBobby' },
	mizu: { rio_user_id: 9, username: 'Mizu' },
	jorb: { rio_user_id: 10, username: 'Jorb' },
	nine: { rio_user_id: 11, username: 'NinetyNine' },
	tally: { rio_user_id: 12, username: 'Tallyho' },
	pico: { rio_user_id: 13, username: 'Pico' },
	sable: { rio_user_id: 14, username: 'Sable' },
	brick: { rio_user_id: 15, username: 'Brickhouse' },
	orbit: { rio_user_id: 16, username: 'Orbit' }
};

const NPSS_TEAMS: FixtureTeam[] = [
	{ id: 101, name: 'Molten Keep', logo: 'Bowser Monsters', managers: [U.pepper], aggression: 0.8 },
	{ id: 102, name: 'Sunshine Sluggers', logo: 'Mario Sunshines', managers: [U.vokal, U.orbit], aggression: 0.55 },
	{ id: 103, name: 'Jungle Kongs', logo: 'DK Kongs', managers: [U.rhino], aggression: 0.7 },
	{ id: 104, name: null, logo: 'Luigi Mansioneers', managers: [U.skoop], aggression: 0.4 },
	{ id: 105, name: 'Royal Flush', logo: 'Peach Monarchs', managers: [U.torch], aggression: 0.6 },
	{ id: 106, name: 'Bone Zone', logo: 'Daisy Cupids', managers: [U.bones], aggression: 0.3 },
	{ id: 107, name: 'Waluigi Time', logo: 'Waluigi Mystiques', managers: [U.kev, U.mizu], aggression: 0.9 },
	{ id: 108, name: 'Egg Rollers', logo: 'Yoshi Speed Stars', managers: [U.jorb], aggression: 0.5 }
];

const SIX_TEAMS: FixtureTeam[] = [
	{ id: 201, name: 'Molten Keep', logo: 'Bowser Flames', managers: [U.pepper], aggression: 0.8 },
	{ id: 202, name: 'Sunshine Sluggers', logo: 'Mario Fireballs', managers: [U.vokal], aggression: 0.55 },
	{ id: 203, name: 'Jungle Kongs', logo: 'DK Wild Ones', managers: [U.rhino], aggression: 0.7 },
	{ id: 204, name: 'Ghost Protocol', logo: 'Luigi Vacuums', managers: [U.skoop, U.nine], aggression: 0.4 },
	{ id: 205, name: 'Royal Flush', logo: 'Peach Roses', managers: [U.torch], aggression: 0.6 },
	{ id: 206, name: 'Egg Rollers', logo: 'Yoshi Speed Stars', managers: [U.jorb], aggression: 0.5 }
];

function retag(teams: FixtureTeam[], base: number): FixtureTeam[] {
	return teams.map((row, index) => ({ ...row, id: base + index + 1 }));
}

/** Deterministic completed draft: every team ends at exactly its budget. */
function generateCompletedPicks(teams: FixtureTeam[], config: DraftConfig, seed: number): FixturePick[] {
	const picks: FixturePick[] = [];
	const characters = [...ALL_CHARACTER_IDS].sort((a, b) => seeded(seed + a) - seeded(seed + b));
	const stadiumsPool = [...ALL_STADIUM_IDS];
	const copiesLeft = (id: number) => (config.pool.copies_by_asset?.[id] ?? config.pool.copies ?? 99) - picks.filter((pick) => pick.asset_id === id).length;
	let round = 1;
	teams.forEach((team, teamIndex) => {
		const budget = team.budget ?? config.budget;
		const chosen: number[] = [];
		// Guarantee a captain first.
		const captain = characters.find((id) => ALL_ASSETS.find((asset) => asset.id === id)?.captain && copiesLeft(id) > 0);
		if (captain) chosen.push(captain);
		for (const id of characters) {
			if (chosen.length >= config.slots.character) break;
			if (chosen.includes(id) || copiesLeft(id) <= 0) continue;
			chosen.push(id);
		}
		const stadium = stadiumsPool[teamIndex % stadiumsPool.length];
		const all = [...chosen, stadium];
		let spent = 0;
		all.forEach((assetId, index) => {
			const asset = ALL_ASSETS.find((candidate) => candidate.id === assetId)!;
			const last = index === all.length - 1;
			let price: number;
			if (last) {
				price = budget - spent;
			} else {
				const wobble = 0.7 + seeded(seed * 7 + assetId + teamIndex) * 0.6;
				const remainingSlots = all.length - index;
				const cap = budget - spent - (remainingSlots - 1);
				price = Math.max(1, Math.min(cap, Math.round(scaledValue(asset.name, budget) * wobble)));
			}
			spent += price;
			picks.push({ team_id: team.id, asset_id: assetId, price, round: round++, took_remaining_budget: last });
		});
	});
	return picks;
}

const MUDDYBALL_PRICES: Record<number, number> = Object.fromEntries(
	ALL_ASSETS.map((asset) => [asset.id, baseValue(asset.name)])
);

export const LEAGUES: LeagueFixture[] = [
	{
		id: 1,
		name: 'NPSS Season 14',
		collection: 'NPSS',
		season: 'Season 14',
		format: 'auction',
		description: 'The flagship Stars Off league. Eight teams, $120 budget, timed open auction with a shared nomination queue.',
		commissioner_ids: [1],
		state: 'lobby',
		scheduled_at: Date.now() + 2 * 60 * 60 * 1000,
		teams: NPSS_TEAMS,
		config: baseConfig(),
		keepers: [
			{ team_id: 101, asset_id: assetIdForCharacter(9), price: 34 },
			{ team_id: 103, asset_id: assetIdForCharacter(2), price: 28 },
			{ team_id: 107, asset_id: assetIdForCharacter(11), price: 19 }
		]
	},
	{
		id: 2,
		name: 'NPSS Season 13',
		collection: 'NPSS',
		season: 'Season 13',
		format: 'auction',
		description: 'Last season. Rosters, prices and the final board are preserved here.',
		commissioner_ids: [1],
		state: 'completed',
		scheduled_at: null,
		teams: retag(NPSS_TEAMS, 300),
		config: baseConfig(),
		keepers: [],
		picks: generateCompletedPicks(retag(NPSS_TEAMS, 300), baseConfig(), 13),
		completed_at: Date.now() - 120 * DAY
	},
	{
		id: 3,
		name: 'Stars Off Vickrey Cup',
		collection: 'Stars Off',
		season: 'Spring 2026',
		format: 'vickrey',
		description: 'Sealed bids, second price. Everyone sees who has bid, never how much, until the reveal.',
		commissioner_ids: [1],
		state: 'lobby',
		scheduled_at: Date.now() + 26 * 60 * 60 * 1000,
		teams: SIX_TEAMS,
		config: baseConfig({ budget: 100, lot_seconds: 45, ties: { method: 'runoff' }, pool: { asset_ids: [...ALL_CHARACTER_IDS, ...ALL_STADIUM_IDS], copies: 1 } }),
		keepers: []
	},
	{
		id: 4,
		name: 'Sunday Snake League',
		collection: 'Stars Off',
		season: 'Summer 2026',
		format: 'snake',
		description: 'Serpentine picks, no money. A 90-second pick clock for the asynchronous crowd.',
		commissioner_ids: [1],
		state: 'lobby',
		scheduled_at: Date.now() + 3 * DAY,
		teams: retag(SIX_TEAMS, 400),
		config: baseConfig({ budget: 0, lot_seconds: null, pick_seconds: 90, last_slot_takes_remaining: false, trades: { enabled: true, approval_model: 'parties_only' }, pool: { asset_ids: [...ALL_CHARACTER_IDS, ...ALL_STADIUM_IDS], copies: 1 } }),
		keepers: [
			{ team_id: 401, asset_id: assetIdForCharacter(9), price: 0, pick_number: 1 },
			{ team_id: 404, asset_id: assetIdForCharacter(14), price: 0, pick_number: 4 }
		]
	},
	{
		id: 5,
		name: 'Muddyball Open',
		collection: 'Muddyball',
		season: 'Season 6',
		format: 'fixed_price',
		description: 'Every character has a set price. Build a $40 roster on your own time before the deadline.',
		commissioner_ids: [1],
		state: 'live',
		scheduled_at: null,
		teams: [
			...retag(NPSS_TEAMS.slice(0, 6), 500),
			{ id: 507, name: 'Pico de Gallo', logo: 'Birdo Bows', managers: [U.pico], aggression: 0.5 },
			{ id: 508, name: 'Brick by Brick', logo: 'Jr Bombers', managers: [U.brick, U.sable], aggression: 0.5 }
		],
		config: baseConfig({
			budget: 40,
			lot_seconds: null,
			pool: { asset_ids: [...ALL_CHARACTER_IDS, ...ALL_STADIUM_IDS], copies: null, prices: MUDDYBALL_PRICES },
			last_slot_takes_remaining: false,
			trades: { enabled: false, approval_model: 'commissioner' },
			restrictions: [{ type: 'captain_required' }],
			deadline: Date.now() + 3 * DAY + 5 * 60 * 60 * 1000
		}),
		keepers: []
	},
	{
		id: 6,
		name: 'Round Pool Classic',
		collection: 'NPSS',
		season: 'Invitational 2026',
		format: 'round_pool',
		description: 'Each round every team nominates one character and seals one bid. Bids buy pick order.',
		commissioner_ids: [1],
		state: 'lobby',
		scheduled_at: Date.now() + 5 * DAY,
		teams: retag(SIX_TEAMS, 600),
		config: baseConfig({ budget: 100, min_bid: 0, lot_seconds: 40, ties: { method: 'runoff' }, pool: { asset_ids: [...ALL_CHARACTER_IDS, ...ALL_STADIUM_IDS], copies: 1 } }),
		keepers: []
	},
	{
		id: 7,
		name: 'Big Balla Draft',
		collection: 'Big Balla',
		season: 'Season 1',
		format: 'auction',
		description: 'A new league still being configured by its commissioner.',
		commissioner_ids: [1],
		state: 'setup',
		scheduled_at: null,
		teams: [
			{ id: 701, name: 'Balla Shot Callas', logo: 'Wario Greats', managers: [U.tally], aggression: 0.5 },
			{ id: 702, name: null, logo: 'Bowser Blue Shells', managers: [U.pico], aggression: 0.5 },
			{ id: 703, name: 'Orbital Strike', logo: 'Diddy Ninjas', managers: [U.orbit], aggression: 0.5 },
			{ id: 704, name: null, logo: 'Peach Dynasties', managers: [U.sable], aggression: 0.5 }
		],
		config: baseConfig({ budget: 80, slots: { character: 9, stadium: 1 }, advance: 'manual', restrictions: [{ type: 'captain_required' }], pool: { asset_ids: [...ALL_CHARACTER_IDS, ...ALL_STADIUM_IDS], copies: 1 } }),
		keepers: []
	}
];

export function leagueById(id: number): LeagueFixture | undefined {
	return LEAGUES.find((league) => league.id === id);
}

/** Historic prices per asset, grouped into the Collection's past seasons ($120 scale). */
export function priceHistoryFor(collection: string): Record<number, PriceHistory> {
	const seasons = collection === 'NPSS' ? ['Season 11', 'Season 12', 'Season 13'] : collection === 'Stars Off' ? ['Winter 2025', 'Fall 2025'] : [];
	const history: Record<number, PriceHistory> = {};
	for (const asset of ALL_ASSETS) {
		const samples = seasons.map((season, index) => {
			const wobble = 0.75 + seeded(asset.id * 31 + index * 7 + collection.length) * 0.5;
			return { league: collection, season, price: Math.max(1, Math.round(scaledValue(asset.name, 120) * wobble)) };
		});
		if (samples.length === 0) continue;
		const prices = samples.map((sample) => sample.price);
		history[asset.id] = {
			asset_id: asset.id,
			samples,
			avg: Math.round((prices.reduce((sum, price) => sum + price, 0) / prices.length) * 10) / 10,
			min: Math.min(...prices),
			max: Math.max(...prices)
		};
	}
	return history;
}
