'use client';

import { useEffect, useState } from 'react';
import { getAllTagSets, type TagSet } from './api';

// Tag sets rarely change; cache them for the lifetime of the tab. Management
// pages call invalidateTagsets() after a create/edit/delete so every mounted
// hook re-fetches.
let cache: TagSet[] | null = null;
let pending: Promise<TagSet[]> | null = null;
const listeners = new Set<() => void>();

export function invalidateTagsets() {
	cache = null;
	pending = null;
	for (const listener of listeners) listener();
}

export function useTagsets(): TagSet[] {
	const [tagsets, setTagsets] = useState<TagSet[]>(cache ?? []);

	useEffect(() => {
		let cancelled = false;

		function load() {
			if (cache) {
				setTagsets(cache);
				return;
			}
			pending ??= getAllTagSets()
				.then((result) => {
					cache = result;
					return result;
				})
				.catch((err) => {
					pending = null; // allow a later mount to retry
					throw err;
				});
			pending
				.then((result) => {
					if (!cancelled) setTagsets(result);
				})
				.catch(() => {});
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
