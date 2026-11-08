'use client';

// Typed wrappers for community / tag / game-mode / user-group management.
// Everything goes through the authenticated proxy so admin actions work.
// Backend field-name quirks (community_name vs name, 1/0 booleans, "Tag Sets"
// keys) are contained here so pages stay clean — when the backend changes,
// patch this file.

import { rioGet, rioPost } from './rio';

// ---------- Types ----------

export interface Community {
	id: number;
	name: string;
	type: 'Official' | 'Unofficial' | string;
	private: boolean;
	url: string | null;
	desc: string;
	tag_set_limit: number;
	date_created: number;
}

export interface CommunityMember {
	id: number;
	user_id: number;
	username?: string; // resolved client-side via getUserMap
	admin: boolean;
	active: boolean;
	invited: boolean;
	banned: boolean | null;
	date_joined: number;
	community_key?: string | null;
}

export interface RioTag {
	id: number;
	comm_id: number | null;
	name: string;
	type: string;
	desc: string;
	active: boolean;
	date_created: number;
	gecko_code?: string;
	gecko_code_desc?: string;
}

export const TAG_TYPES = ['Component', 'Competition', 'Community', 'Client Code', 'Gecko Code', 'Test'] as const;
export const CREATABLE_TAG_TYPES = ['Component', 'Gecko Code', 'Client Code', 'Test'] as const;
export const GAME_MODE_TYPES = ['Season', 'League', 'Tournament', 'Custom', 'Test'] as const;

// ---------- Communities ----------

export async function listCommunities(type?: string): Promise<Community[]> {
	const res = await rioPost('community/list', type ? { type } : {});
	return res.Communities ?? [];
}

export async function getMyCommunities(username: string): Promise<Community[]> {
	const res = await rioGet('user/community/', `?username=${encodeURIComponent(username)}`);
	return res.communities ?? [];
}

export async function getSponsoredCommunities(username: string): Promise<Community[]> {
	const res = await rioGet('user/community/sponsor/', `?username=${encodeURIComponent(username)}`);
	return res.sponsored_communities ?? [];
}

export async function createCommunity(opts: {
	name: string;
	type: string;
	isPrivate: boolean;
	globalLink: boolean;
	desc: string;
}) {
	return rioPost('community/create', {
		community_name: opts.name,
		type: opts.type,
		private: opts.isPrivate ? 1 : 0,
		global_link: opts.globalLink ? 1 : 0,
		desc: opts.desc
	});
}

export async function updateCommunity(
	communityId: number,
	fields: { name?: string; desc?: string; type?: string; private?: boolean; link?: boolean; active_tag_set_limit?: number }
) {
	return rioPost('community/update', { community_id: communityId, ...fields });
}

export async function joinCommunity(name: string, inviteUrl?: string) {
	return rioPost('community/join', { community_name: name, ...(inviteUrl ? { URL: inviteUrl } : {}) });
}

export async function getMembers(name: string): Promise<CommunityMember[]> {
	const res = await rioPost('community/members', { community_name: name });
	return res.Members ?? [];
}

export async function inviteMembers(name: string, usernames: string[]) {
	return rioPost('community/invite', { community_name: name, invite_list: usernames });
}

export interface MemberAction {
	username: string;
	admin?: boolean;
	remove?: boolean;
	ban?: boolean;
	key?: boolean;
}

export async function manageMembers(name: string, actions: MemberAction[]): Promise<CommunityMember[]> {
	const res = await rioPost('community/manage', { community_name: name, user_list: actions });
	return res.members ?? [];
}

export async function communityKeys(name: string, action: 'generate' | 'revoke' | 'generate_all') {
	return rioPost('community/key', { community_name: name, action });
}

export async function getSponsor(name: string): Promise<string | null> {
	const res = await rioPost('community/sponsor', { community_name: name, action: 'get' });
	return res.sponsor ?? null;
}

// ---------- Tags ----------

// The backend validator requires every line to be exactly
// "XXXXXXXX XXXXXXXX" (8 hex chars, space, 8 hex chars) and the final line
// must end with a newline — normalize before submitting.
export function normalizeGeckoCode(code: string): string {
	const lines = code
		.replace(/\r\n?/g, '\n')
		.split('\n')
		.map((line) => line.trim().replace(/\s+/g, ' '))
		.filter(Boolean);
	return lines.length ? lines.join('\n') + '\n' : '';
}

export function isValidGeckoCode(code: string): boolean {
	return /^([0-9A-Fa-f]{8} [0-9A-Fa-f]{8}\n)+$/.test(normalizeGeckoCode(code));
}

// Uses tag/list (not community/tags) because only tag/list merges the gecko
// code fields into each tag dict — the edit form needs them.
export async function getCommunityTags(communityId: number): Promise<RioTag[]> {
	const res = await rioPost('tag/list', { Communities: [communityId] });
	return res.Tags ?? [];
}

export async function createTag(opts: {
	communityName: string;
	name: string;
	desc: string;
	type: string;
	geckoCode?: string;
	geckoCodeDesc?: string;
}) {
	return rioPost('tag/create', {
		community_name: opts.communityName,
		name: opts.name,
		desc: opts.desc,
		type: opts.type,
		...(opts.geckoCode ? { gecko_code: normalizeGeckoCode(opts.geckoCode) } : {}),
		...(opts.geckoCodeDesc ? { gecko_code_desc: opts.geckoCodeDesc } : {})
	});
}

export async function updateTag(
	tagId: number,
	fields: { name?: string; desc?: string; type?: string; gecko_code?: string; gecko_code_desc?: string }
) {
	const body: Record<string, unknown> = { tag_id: tagId, ...fields };
	if (typeof body.gecko_code === 'string') body.gecko_code = normalizeGeckoCode(body.gecko_code);
	return rioPost('tag/update', body);
}

// ---------- Game modes (tag sets) ----------

// Matches the old site: the backend stores game mode dates as unix seconds
// shifted to US Eastern.
export const TIMEZONE_OFFSET_SECONDS = 14400;

export function dateInputToUnix(value: string): number {
	return Math.floor(new Date(value).getTime() / 1000) + TIMEZONE_OFFSET_SECONDS;
}

export function unixToDateInput(value: number | undefined): string {
	if (!value) return '';
	return new Date((value - TIMEZONE_OFFSET_SECONDS) * 1000).toISOString().slice(0, 10);
}

export async function createGameMode(opts: {
	communityName: string;
	name: string;
	desc: string;
	type: string;
	startDate: number;
	endDate: number;
	addTagIds?: number[];
	templateTagSetId?: number;
}) {
	return rioPost('tag_set/create', {
		community_name: opts.communityName,
		name: opts.name,
		desc: opts.desc,
		type: opts.type,
		start_date: opts.startDate,
		end_date: opts.endDate,
		...(opts.addTagIds?.length ? { add_tag_ids: opts.addTagIds } : {}),
		...(opts.templateTagSetId ? { tag_set_id: opts.templateTagSetId } : {})
	});
}

// No `desc` here: TagSet has no desc column, so tag_set/update silently drops
// it. A game mode's description lives on its auto-created Competition tag —
// edit it with updateTag() on that tag's id.
export async function updateGameMode(
	tagSetId: number,
	fields: {
		name?: string;
		type?: string;
		start_date?: number;
		end_date?: number;
		add_tag_ids?: number[];
		remove_tag_ids?: number[];
	}
) {
	return rioPost('tag_set/update', { tag_set_id: tagSetId, ...fields });
}

export async function deleteGameMode(name: string) {
	return rioPost('tag_set/delete', { name });
}

// ---------- Users & groups ----------

let userMapCache: Map<number, string> | null = null;

/** id → username for every verified user; cached for the tab's lifetime. */
export async function getUserMap(): Promise<Map<number, string>> {
	if (userMapCache) return userMapCache;
	const res = await rioGet('user/all/');
	userMapCache = new Map(Object.entries(res.users ?? {}).map(([id, name]) => [Number(id), String(name)]));
	return userMapCache;
}

export async function isUserInGroup(username: string, group: string): Promise<boolean> {
	const res = await rioGet(
		'user_group/check_for_member',
		`?username=${encodeURIComponent(username)}&group_name=${encodeURIComponent(group)}`
	);
	return res.is_member === true;
}

export async function getGroupMembers(group: string): Promise<string[]> {
	const res = await rioGet('user_group/members', `?group_name=${encodeURIComponent(group)}`);
	return res.users ?? [];
}

export async function addUserToGroup(username: string, group: string) {
	return rioPost('user_group/add_user', { username, group_name: group });
}

export async function removeUserFromGroup(username: string, group: string) {
	return rioPost('user_group/remove_user', { username, group_name: group });
}

export async function listPatrons(): Promise<{ username: string; tier: string }[]> {
	const res = await rioPost('patreon/list');
	return res?.patrons ?? [];
}
