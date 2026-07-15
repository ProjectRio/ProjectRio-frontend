'use client';

import { use, useMemo, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
	updateGameMode,
	deleteGameMode,
	updateTag,
	dateInputToUnix,
	unixToDateInput,
	GAME_MODE_TYPES,
	type RioTag
} from '@/lib/communityApi';
import { useTagsets, invalidateTagsets } from '@/lib/useTagsets';
import type { TagSet } from '@/lib/api';
import { PageHeader, Panel, PanelHeader, Spinner, ErrorState } from '@/components/ui';
import { useCommunity, normalizeName, type CommunityContext } from '@/components/community/useCommunity';
import { adminGuard } from '@/components/community/AdminGuard';
import TagPicker from '@/components/community/TagPicker';

function EditGameModeForm({ context, mode }: { context: CommunityContext; mode: TagSet }) {
	const router = useRouter();
	const { community } = context;

	// The mode's description lives on its auto-created Competition tag —
	// TagSet itself has no desc column.
	const competitionTag: RioTag | undefined = useMemo(
		() => (mode.tags ?? []).find((tag: RioTag) => tag.type === 'Competition'),
		[mode]
	);
	const currentTagIds = useMemo(
		() =>
			new Set<number>(
				(mode.tags ?? [])
					.filter((tag: RioTag) => tag.type !== 'Community' && tag.type !== 'Competition')
					.map((tag: RioTag) => tag.id)
			),
		[mode]
	);

	const [name, setName] = useState(mode.name);
	const [type, setType] = useState(mode.type ?? 'Season');
	const [desc, setDesc] = useState(competitionTag?.desc ?? '');
	const [start, setStart] = useState(unixToDateInput(mode.start_date));
	const [end, setEnd] = useState(unixToDateInput(mode.end_date));
	const [selected, setSelected] = useState<Set<number>>(new Set(currentTagIds));
	const [busy, setBusy] = useState(false);
	const [deleting, setDeleting] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const backHref = `/communities/${encodeURIComponent(community.name)}?tab=modes`;

	function toggleTag(id: number) {
		setSelected((current) => {
			const next = new Set(current);
			if (next.has(id)) next.delete(id);
			else next.add(id);
			return next;
		});
	}

	async function submit(event: FormEvent) {
		event.preventDefault();
		setError(null);
		if (start && end && new Date(end) < new Date(start)) {
			setError('End date must be on or after the start date.');
			return;
		}
		setBusy(true);
		try {
			const fields: Record<string, unknown> = {};
			if (name !== mode.name) fields.name = name;
			if (type !== mode.type) fields.type = type;
			if (start && start !== unixToDateInput(mode.start_date)) fields.start_date = dateInputToUnix(start);
			if (end && end !== unixToDateInput(mode.end_date)) fields.end_date = dateInputToUnix(end);
			const add = [...selected].filter((id) => !currentTagIds.has(id));
			const remove = [...currentTagIds].filter((id) => !selected.has(id));
			if (add.length) fields.add_tag_ids = add;
			if (remove.length) fields.remove_tag_ids = remove;
			if (Object.keys(fields).length > 0) await updateGameMode(mode.id, fields);
			if (competitionTag && desc !== competitionTag.desc) await updateTag(competitionTag.id, { desc });
			invalidateTagsets();
			router.push(backHref);
		} catch (err: any) {
			setError(err?.message ?? 'Could not update the game mode.');
			setBusy(false);
		}
	}

	async function remove() {
		if (
			!window.confirm(`Delete "${mode.name}"? This cannot be undone and only works if no games have been played in it.`)
		)
			return;
		setDeleting(true);
		setError(null);
		try {
			await deleteGameMode(mode.name);
			invalidateTagsets();
			router.push(backHref);
		} catch (err: any) {
			setError(err?.message ?? 'Could not delete the game mode.');
			setDeleting(false);
		}
	}

	return (
		<div className="mx-auto max-w-2xl space-y-5">
			<PageHeader kicker={community.name} title={`Manage ${mode.name}`} />
			<form onSubmit={submit} className="panel space-y-5 p-6">
				<div className="grid gap-5 sm:grid-cols-2">
					<div>
						<label className="label" htmlFor="mode-name">
							Name
						</label>
						<input
							id="mode-name"
							className="input"
							required
							maxLength={100}
							value={name}
							onChange={(event) => setName(event.target.value)}
						/>
					</div>
					<div>
						<label className="label" htmlFor="mode-type">
							Type
						</label>
						<select
							id="mode-type"
							className="input"
							value={type}
							onChange={(event) => setType(event.target.value)}
						>
							{GAME_MODE_TYPES.map((modeType) => (
								<option key={modeType} value={modeType}>
									{modeType}
								</option>
							))}
						</select>
					</div>
				</div>

				<div>
					<label className="label" htmlFor="mode-desc">
						Description
					</label>
					<textarea
						id="mode-desc"
						className="input min-h-24"
						maxLength={1000}
						value={desc}
						onChange={(event) => setDesc(event.target.value)}
						disabled={!competitionTag}
					/>
					{!competitionTag && (
						<p className="mt-1 text-xs text-fog-500">
							This game mode has no competition tag, so its description cannot be edited.
						</p>
					)}
				</div>

				<div className="grid gap-5 sm:grid-cols-2">
					<div>
						<label className="label" htmlFor="mode-start">
							Start Date
						</label>
						<input
							id="mode-start"
							type="date"
							className="input"
							value={start}
							onChange={(event) => setStart(event.target.value)}
						/>
					</div>
					<div>
						<label className="label" htmlFor="mode-end">
							End Date
						</label>
						<input
							id="mode-end"
							type="date"
							className="input"
							value={end}
							onChange={(event) => setEnd(event.target.value)}
						/>
					</div>
				</div>

				<TagPicker
					communityId={community.id}
					communityTags={context.tags}
					selected={selected}
					onToggle={toggleTag}
				/>

				{error && <p className="text-sm text-rio-300">{error}</p>}
				<div className="flex gap-3">
					<button type="submit" className="btn-primary flex-1" disabled={busy || deleting}>
						{busy ? 'Saving…' : 'Save Changes'}
					</button>
					<Link href={backHref} className="btn-secondary">
						Cancel
					</Link>
				</div>
			</form>

			<Panel>
				<PanelHeader title="Danger Zone" />
				<div className="flex flex-wrap items-center justify-between gap-3 p-4">
					<p className="text-sm text-fog-500">
						Deleting a game mode removes it and its ladder. The backend refuses if any games have been played.
					</p>
					<button
						type="button"
						className="btn-secondary !border-rio-500 !text-rio-400"
						disabled={busy || deleting}
						onClick={remove}
					>
						{deleting ? 'Deleting…' : 'Delete Game Mode'}
					</button>
				</div>
			</Panel>
		</div>
	);
}

export default function EditGameModePage({ params }: { params: Promise<{ name: string; mode: string }> }) {
	const resolved = use(params);
	const communityName = decodeURIComponent(resolved.name);
	const modeName = decodeURIComponent(resolved.mode);
	const state = useCommunity(communityName);
	const tagsets = useTagsets();

	const guard = adminGuard(state);
	if (guard) return guard;
	const context = state.context!;

	if (tagsets.length === 0) return <Spinner label="Loading game modes…" />;
	const mode = tagsets.find(
		(candidate) =>
			normalizeName(candidate.name) === normalizeName(modeName) && candidate.comm_id === context.community.id
	);
	if (!mode) return <ErrorState message="Game mode not found in this community." />;

	return <EditGameModeForm context={context} mode={mode} />;
}
