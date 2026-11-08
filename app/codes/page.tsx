'use client';

import { useEffect, useMemo, useState } from 'react';
import { getAllTags } from '@/lib/api';
import { listCommunities, type Community, type RioTag } from '@/lib/communityApi';
import { PageHeader, Badge, Spinner, ErrorState, EmptyState } from '@/components/ui';

// Dolphin's INI format: a $-prefixed title line followed by the code lines.
function dolphinFormat(tag: RioTag): string {
	return `$${tag.name} [Project Rio]\n${tag.gecko_code ?? ''}`;
}

async function copyText(text: string): Promise<boolean> {
	try {
		await navigator.clipboard.writeText(text);
		return true;
	} catch {
		// Clipboard API needs a secure context; fall back to the legacy path.
		try {
			const area = document.createElement('textarea');
			area.value = text;
			area.style.position = 'fixed';
			area.style.opacity = '0';
			document.body.appendChild(area);
			area.select();
			const ok = document.execCommand('copy');
			document.body.removeChild(area);
			return ok;
		} catch {
			return false;
		}
	}
}

function CopyButton({
	text,
	label,
	primary = false
}: {
	text: string;
	label: string;
	primary?: boolean;
}) {
	const [state, setState] = useState<'idle' | 'copied' | 'failed'>('idle');

	async function onCopy() {
		const ok = await copyText(text);
		setState(ok ? 'copied' : 'failed');
		setTimeout(() => setState('idle'), 1500);
	}

	return (
		<button
			type="button"
			onClick={onCopy}
			className={`${primary ? 'btn-primary' : 'btn-secondary'} !px-3 !py-1.5 text-xs`}
		>
			{state === 'copied' ? 'Copied!' : state === 'failed' ? 'Copy failed' : label}
		</button>
	);
}

function GeckoCodeCard({ tag, communityName }: { tag: RioTag; communityName: string | null }) {
	const code = tag.gecko_code ?? '';
	const lineCount = code.split('\n').filter(Boolean).length;

	return (
		<div className="panel flex flex-col p-5">
			<div className="flex flex-wrap items-start justify-between gap-2">
				<h2 className="font-display text-lg font-bold uppercase tracking-wide text-fog-100">{tag.name}</h2>
				<div className="flex gap-1.5">
					{communityName && <Badge color="gray">{communityName}</Badge>}
					{!tag.active && <Badge color="red">Inactive</Badge>}
				</div>
			</div>
			{tag.desc && <p className="mt-2 text-sm text-fog-500">{tag.desc}</p>}
			{tag.gecko_code_desc && tag.gecko_code_desc !== tag.desc && (
				<p className="mt-1 text-xs text-fog-500 italic">{tag.gecko_code_desc}</p>
			)}
			<pre className="mt-3 max-h-48 flex-1 overflow-auto rounded bg-night-950 p-3 text-xs leading-relaxed text-fog-300">
				{code}
			</pre>
			<div className="mt-3 flex flex-wrap items-center gap-2">
				<CopyButton text={code} label="Copy Code" primary />
				<CopyButton text={dolphinFormat(tag)} label="Copy for Dolphin" />
				<span className="ml-auto text-xs text-fog-500" style={{ fontVariantNumeric: 'tabular-nums' }}>
					{lineCount} {lineCount === 1 ? 'line' : 'lines'}
				</span>
			</div>
		</div>
	);
}

export default function GeckoCodesPage() {
	const [tags, setTags] = useState<RioTag[] | null>(null);
	const [communities, setCommunities] = useState<Community[]>([]);
	const [error, setError] = useState<string | null>(null);
	const [query, setQuery] = useState('');
	const [source, setSource] = useState('all');

	useEffect(() => {
		getAllTags()
			.then((all) => setTags(all.filter((tag: RioTag) => tag.type === 'Gecko Code')))
			.catch(() => setError('Could not load gecko codes.'));
		// Community names are decoration — if this fails, codes still show.
		listCommunities()
			.then(setCommunities)
			.catch(() => {});
	}, []);

	const communityNames = useMemo(() => {
		const map = new Map<number, string>();
		for (const community of communities) map.set(community.id, community.name);
		return map;
	}, [communities]);

	const sources = useMemo(() => {
		if (!tags) return [];
		const ids = [...new Set(tags.map((tag) => tag.comm_id).filter((id): id is number => id != null))];
		return ids
			.map((id) => ({ id, name: communityNames.get(id) ?? `Community #${id}` }))
			.sort((a, b) => a.name.localeCompare(b.name));
	}, [tags, communityNames]);

	const filtered = useMemo(() => {
		if (!tags) return [];
		const needle = query.trim().toLowerCase();
		return tags
			.filter((tag) => {
				if (source !== 'all' && String(tag.comm_id) !== source) return false;
				if (!needle) return true;
				const communityName = tag.comm_id != null ? (communityNames.get(tag.comm_id) ?? '') : '';
				return [tag.name, tag.desc, tag.gecko_code_desc, communityName]
					.some((field) => (field ?? '').toLowerCase().includes(needle));
			})
			.sort((a, b) => a.name.localeCompare(b.name));
	}, [tags, query, source, communityNames]);

	return (
		<div>
			<PageHeader kicker="Discovery" title="Gecko Codes" />
			<p className="-mt-4 mb-6 max-w-2xl text-sm text-fog-500">
				Every gecko code registered on Project Rio, across all communities. Copy a code directly or in
				Dolphin&apos;s INI format.
			</p>

			{error && <ErrorState message={error} />}
			{!tags && !error && <Spinner label="Loading gecko codes…" />}

			{tags && (
				<div className="space-y-4">
					<div className="flex flex-wrap gap-3">
						<input
							type="search"
							className="input max-w-sm flex-1"
							placeholder="Search by name, description, or community…"
							value={query}
							onChange={(event) => setQuery(event.target.value)}
						/>
						<select
							className="input w-auto"
							value={source}
							onChange={(event) => setSource(event.target.value)}
							aria-label="Filter by community"
						>
							<option value="all">All communities</option>
							{sources.map((entry) => (
								<option key={entry.id} value={String(entry.id)}>
									{entry.name}
								</option>
							))}
						</select>
						<span className="self-center text-sm text-fog-500" style={{ fontVariantNumeric: 'tabular-nums' }}>
							{filtered.length} of {tags.length} codes
						</span>
					</div>

					{filtered.length === 0 ? (
						<EmptyState
							title="No matching codes"
							detail="Try a different search term or clear the community filter."
						/>
					) : (
						<div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
							{filtered.map((tag) => (
								<GeckoCodeCard
									key={tag.id}
									tag={tag}
									communityName={tag.comm_id != null ? (communityNames.get(tag.comm_id) ?? null) : null}
								/>
							))}
						</div>
					)}
				</div>
			)}
		</div>
	);
}
