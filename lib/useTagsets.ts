'use client';

import { useEffect, useState } from 'react';
import { getAllTagSets, type TagSet } from './api';

// Tag sets change rarely (new game modes are added infrequently), so we persist
// them to localStorage and only re-fetch in the background once the cached copy
// is older than the TTL. Within the TTL window this makes zero API calls, while
// a stale cache still self-heals on the next visit after it expires. Management
// pages call invalidateTagsets() after a create/edit/delete so every mounted
// hook re-fetches immediately regardless of the TTL.
const STORAGE_KEY = 'rio_tagsets_v1';
const TTL_MS = 24 * 60 * 60 * 1000; // 1 day

let cache: TagSet[] | null = null;
let pending: Promise<TagSet[]> | null = null;
const listeners = new Set<() => void>();

export function invalidateTagsets() {
	cache = null;
	pending = null;
	if (typeof window !== 'undefined') {
		try {
			localStorage.removeItem(STORAGE_KEY);
		} catch {
			/* storage unavailable — in-memory cache is still cleared */
		}
	}
	for (const listener of listeners) listener();
}

function readStored(): { data: TagSet[]; ts: number } | null {
	if (typeof window === 'undefined') return null;
	try {
		const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null');
		if (Array.isArray(parsed?.data) && typeof parsed.ts === 'number') return parsed;
	} catch {
		/* corrupt cache — fall through and refetch */
	}
	return null;
}

function fetchAndStore(): Promise<TagSet[]> {
	pending ??= getAllTagSets()
		.then((result) => {
			cache = result;
			try {
				localStorage.setItem(STORAGE_KEY, JSON.stringify({ data: result, ts: Date.now() }));
			} catch {
				/* storage unavailable/full — in-memory cache still applies */
			}
			pending = null;
			return result;
		})
		.catch((err) => {
			pending = null;
			throw err;
		});
	return pending;
}

export function useTagsets(): TagSet[] {
	const [tagsets, setTagsets] = useState<TagSet[]>(cache ?? []);

	useEffect(() => {
		let cancelled = false;

		function load() {
			// Already validated (or seeded) this session — nothing more to do.
			if (cache) {
				setTagsets(cache);
				return;
			}

			// Seed from localStorage for an instant first paint.
			const stored = readStored();
			if (stored) {
				cache = stored.data;
				setTagsets(stored.data);
			}

			// Revalidate only when there's no fresh cache.
			if (stored && Date.now() - stored.ts < TTL_MS) return;

			fetchAndStore()
				.then((result) => {
					if (!cancelled) setTagsets(result);
				})
				.catch(() => {
					/* keep showing stored/empty data on failure */
				});
		}

		load();
		listeners.add(load);
		return () => {
			cancelled = true;
			listeners.delete(load);
		};
	}, []);

	return tagsets;
}
