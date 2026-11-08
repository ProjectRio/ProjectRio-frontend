'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
	createTag,
	updateTag,
	isValidGeckoCode,
	CREATABLE_TAG_TYPES,
	type RioTag
} from '@/lib/communityApi';
import { PageHeader, ErrorState } from '@/components/ui';
import { useCommunity, type CommunityContext } from './useCommunity';
import { adminGuard } from './AdminGuard';

function TagForm({ context, existing }: { context: CommunityContext; existing: RioTag | null }) {
	const router = useRouter();
	const [name, setName] = useState(existing?.name ?? '');
	const [desc, setDesc] = useState(existing?.desc ?? '');
	const [type, setType] = useState(existing?.type ?? 'Component');
	const [geckoCode, setGeckoCode] = useState(existing?.gecko_code ?? '');
	const [geckoCodeDesc, setGeckoCodeDesc] = useState(existing?.gecko_code_desc ?? '');
	const [busy, setBusy] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const backHref = `/communities/${encodeURIComponent(context.community.name)}?tab=tags`;

	async function submit(event: FormEvent) {
		event.preventDefault();
		setError(null);
		if (type === 'Gecko Code' && !isValidGeckoCode(geckoCode)) {
			setError('Gecko code must be lines of two 8-character hex words, e.g. "802EBF34 00000001".');
			return;
		}
		setBusy(true);
		try {
			if (existing) {
				const fields: Record<string, unknown> = {};
				if (name !== existing.name) fields.name = name;
				if (desc !== existing.desc) fields.desc = desc;
				if (type !== existing.type) {
					fields.type = type;
					// Changing a tag into a gecko code requires both code fields in
					// the same request; changing away deletes the code server-side.
					if (type === 'Gecko Code') {
						fields.gecko_code = geckoCode;
						fields.gecko_code_desc = geckoCodeDesc;
					}
				} else if (type === 'Gecko Code') {
					if (geckoCode !== existing.gecko_code) fields.gecko_code = geckoCode;
					if (geckoCodeDesc !== existing.gecko_code_desc) fields.gecko_code_desc = geckoCodeDesc;
				}
				if (Object.keys(fields).length > 0) await updateTag(existing.id, fields);
			} else {
				await createTag({
					communityName: context.community.name,
					name,
					desc,
					type,
					...(type === 'Gecko Code' ? { geckoCode, geckoCodeDesc } : {})
				});
			}
			router.push(backHref);
		} catch (err: any) {
			setError(err?.message ?? 'Could not save the tag.');
			setBusy(false);
		}
	}

	return (
		<form onSubmit={submit} className="panel space-y-5 p-6">
			<div className="grid gap-5 sm:grid-cols-2">
				<div>
					<label className="label" htmlFor="tag-name">
						Name
					</label>
					<input
						id="tag-name"
						className="input"
						required
						maxLength={100}
						value={name}
						onChange={(event) => setName(event.target.value)}
					/>
				</div>
				<div>
					<label className="label" htmlFor="tag-type">
						Type
					</label>
					<select id="tag-type" className="input" value={type} onChange={(event) => setType(event.target.value)}>
						{CREATABLE_TAG_TYPES.map((tagType) => (
							<option key={tagType} value={tagType}>
								{tagType}
							</option>
						))}
					</select>
				</div>
			</div>
			<p className="text-xs text-fog-500">
				Component tags label a ruleset (e.g. Stars Off). Gecko Code tags carry a code the client applies in-game.
			</p>

			<div>
				<label className="label" htmlFor="tag-desc">
					Description
				</label>
				<textarea
					id="tag-desc"
					className="input min-h-24"
					required
					maxLength={1000}
					value={desc}
					onChange={(event) => setDesc(event.target.value)}
				/>
			</div>

			{type === 'Gecko Code' && (
				<>
					<div>
						<label className="label" htmlFor="tag-code-desc">
							Gecko Code Description
						</label>
						<input
							id="tag-code-desc"
							className="input"
							required
							maxLength={1000}
							value={geckoCodeDesc}
							onChange={(event) => setGeckoCodeDesc(event.target.value)}
						/>
					</div>
					<div>
						<label className="label" htmlFor="tag-code">
							Gecko Code
						</label>
						<textarea
							id="tag-code"
							className="input min-h-40 font-mono text-xs"
							required
							spellCheck={false}
							placeholder={'802EBF34 00000001\n802EBF38 00000001'}
							value={geckoCode}
							onChange={(event) => setGeckoCode(event.target.value)}
						/>
						<p className="mt-1 text-xs text-fog-500">One pair of 8-character hex words per line.</p>
					</div>
				</>
			)}

			{error && <p className="text-sm text-rio-300">{error}</p>}
			<div className="flex gap-3">
				<button type="submit" className="btn-primary flex-1" disabled={busy}>
					{busy ? 'Saving…' : existing ? 'Save Changes' : 'Create Tag'}
				</button>
				<Link href={backHref} className="btn-secondary">
					Cancel
				</Link>
			</div>
		</form>
	);
}

/**
 * Full-page create/edit form for a community tag. Pass tagId to edit;
 * omit it to create.
 */
export default function TagEditor({ communityName, tagId }: { communityName: string; tagId?: number }) {
	const state = useCommunity(communityName);
	const guard = adminGuard(state);
	if (guard) return guard;
	const context = state.context!;

	let existing: RioTag | null = null;
	if (tagId !== undefined) {
		if (!context.tags) return <ErrorState message="Could not load this community's tags." />;
		existing = context.tags.find((tag) => tag.id === tagId) ?? null;
		if (!existing) return <ErrorState message="Tag not found in this community." />;
		if (existing.type === 'Community' || existing.type === 'Competition') {
			return <ErrorState message={`${existing.type} tags are system-managed and cannot be edited.`} />;
		}
	}

	return (
		<div className="mx-auto max-w-2xl">
			<PageHeader kicker={context.community.name} title={existing ? `Edit ${existing.name}` : 'Create a Tag'} />
			<TagForm context={context} existing={existing} />
		</div>
	);
}
