'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
	listCommunities,
	getMyCommunities,
	getMembers,
	getCommunityTags,
	getUserMap,
	getSponsor,
	type Community,
	type CommunityMember,
	type RioTag
} from '@/lib/communityApi';
import { useUsername } from '@/lib/useUsername';
import { useRioStaff } from '@/lib/useRioStaff';

export function normalizeName(name: string) {
	return name.toLowerCase().replace(/[^a-z0-9]/g, '');
}

export interface CommunityContext {
	community: Community;
	username: string | null;
	/** Active member of this community */
	isMember: boolean;
	/** Community admin or Rio staff — unlocks management UI (backend re-checks) */
	isAdmin: boolean;
	members: CommunityMember[] | null;
	tags: RioTag[] | null;
	sponsor: string | null;
	inviteUrl: string | null;
	refresh: () => void;
}

export interface UseCommunityResult {
	context: CommunityContext | null;
	loading: boolean;
	error: string | null;
}

/**
 * Resolves a community by name and loads everything the hub and the
 * management pages need. Members/tags/sponsor are permission-gated on the
 * backend; failures there just mean the viewer can't see that panel.
 */
export function useCommunity(name: string, inviteUrl: string | null = null): UseCommunityResult {
	const username = useUsername();
	const { isStaff } = useRioStaff();

	const [community, setCommunity] = useState<Community | null>(null);
	const [myCommunities, setMyCommunities] = useState<Community[]>([]);
	const [members, setMembers] = useState<CommunityMember[] | null>(null);
	const [tags, setTags] = useState<RioTag[] | null>(null);
	const [sponsor, setSponsor] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [loading, setLoading] = useState(true);
	const [reloadKey, setReloadKey] = useState(0);

	const refresh = useCallback(() => setReloadKey((key) => key + 1), []);

	useEffect(() => {
		let cancelled = false;
		setLoading(true);
		setError(null);

		async function load() {
			// Resolve the community by name from the public list plus the user's
			// own list (covers private communities the user belongs to).
			const [publicList, mine] = await Promise.all([
				listCommunities().catch(() => [] as Community[]),
				username ? getMyCommunities(username).catch(() => [] as Community[]) : Promise.resolve([] as Community[])
			]);
			const all = [...publicList, ...mine];
			const found = all.find((candidate) => normalizeName(candidate.name) === normalizeName(name));
			if (!found) {
				throw new Error(
					publicList.length === 0 && !username
						? 'Log in to view this community.'
						: 'Community not found — it may be private.'
				);
			}
			if (cancelled) return;
			setCommunity(found);
			setMyCommunities(mine);

			const [memberList, tagList, sponsorName, userMap] = await Promise.all([
				getMembers(found.name).catch(() => null),
				getCommunityTags(found.id).catch(() => null),
				getSponsor(found.name).catch(() => null),
				getUserMap().catch(() => null)
			]);
			if (cancelled) return;
			if (memberList && userMap) {
				for (const member of memberList) member.username = userMap.get(member.user_id) ?? `User #${member.user_id}`;
				memberList.sort((a, b) => (a.username ?? '').localeCompare(b.username ?? ''));
			}
			setMembers(memberList);
			setTags(tagList);
			setSponsor(sponsorName);
		}

		load()
			.catch((err) => {
				if (!cancelled) setError(err?.message ?? 'Could not load this community.');
			})
			.finally(() => {
				if (!cancelled) setLoading(false);
			});
		return () => {
			cancelled = true;
		};
	}, [name, username, reloadKey]);

	const context = useMemo<CommunityContext | null>(() => {
		if (!community) return null;
		const me = members?.find((member) => member.username === username);
		const isMember =
			(me?.active ?? false) || myCommunities.some((candidate) => candidate.id === community.id);
		return {
			community,
			username,
			isMember,
			isAdmin: (me?.admin ?? false) || isStaff,
			members,
			tags,
			sponsor,
			inviteUrl,
			refresh
		};
	}, [community, members, tags, sponsor, username, isStaff, myCommunities, inviteUrl, refresh]);

	return { context, loading, error };
}
