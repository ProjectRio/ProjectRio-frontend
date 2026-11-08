'use client';

import { use, useMemo, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { createGameMode, dateInputToUnix, GAME_MODE_TYPES } from '@/lib/communityApi';
import { useTagsets, invalidateTagsets } from '@/lib/useTagsets';
import { PageHeader } from '@/components/ui';
import { useCommunity, type CommunityContext } from '@/components/community/useCommunity';
import { adminGuard } from '@/components/community/AdminGuard';
import TagPicker from '@/components/community/TagPicker';

function CreateGameModeForm({ context }: { context: CommunityContext }) {
	const { community } = context;
	const tagsets = useTagsets();

	const [name, setName] = useState('');
	const [desc, setDesc] = useState('');
	const [type, setType] = useState('Season');
	const [selected, setSelected] = useState<Set<number>>(new Set());
	const [templateId, setTemplateId] = useState(0);
	const [startDate, setStartDate] = useState('');
	const [endDate, setEndDate] = useState('');
	const [error, setError] = useState<string | null>(null);
	const [submitting, setSubmitting] = useState(false);
	const [done, setDone] = useState(false);

	const backHref = `/communities/${encodeURIComponent(community.name)}?tab=modes`;

	// Templates: this community's modes first, everything else after.
	const { ownModes, otherModes } = useMemo(() => {
		const byName = (a: { name: string }, b: { name: string }) => a.name.localeCompare(b.name);
		return {
			ownModes: tagsets.filter((mode) => mode.comm_id === community.id).sort(byName),
			otherModes: tagsets.filter((mode) => mode.comm_id !== community.id).sort(byName)
		};
	}, [tagsets, community.id]);

	function toggleTag(id: number) {
		setSelected((current) => {
			const next = new Set(current);
			if (next.has(id)) next.delete(id);
			else next.add(id);
			return next;
		});
	}

	async function handleSubmit(event: FormEvent) {
		event.preventDefault();
		setError(null);
		if (new Date(endDate) < new Date(startDate)) {
			setError('End date must be on or after the start date.');
			return;
		}
		setSubmitting(true);
		try {
			await createGameMode({
				communityName: community.name,
				name,
				desc,
				type,
				startDate: dateInputToUnix(startDate),
				endDate: dateInputToUnix(endDate),
				addTagIds: [...selected],
				templateTagSetId: templateId > 0 ? templateId : undefined
			});
			invalidateTagsets();
			setDone(true);
		} catch (err: any) {
			setError(err?.message ?? 'Could not create the game mode.');
		} finally {
			setSubmitting(false);
		}
	}

	if (done) {
		return (
			<div className="mx-auto max-w-lg">
				<div className="panel p-8 text-center">
					<h1 className="text-3xl uppercase">Game Mode Created</h1>
					<p className="mt-3 text-sm text-fog-300">
						“{name}” is live for {community.name}.
					</p>
					<Link href={backHref} className="btn-primary mt-6 inline-block">
						Back to Community
					</Link>
				</div>
			</div>
		);
	}

	return (
		<div className="mx-auto max-w-2xl">
			<PageHeader kicker={community.name} title="Create a Game Mode" />
			{context.sponsor === null && (
				<p className="mb-4 rounded-lg border border-night-700 bg-night-900 p-3 text-sm text-fog-300">
					This community has no sponsor on record — the backend only allows sponsored communities to create game
					modes, so this may be rejected.
				</p>
			)}
			<form onSubmit={handleSubmit} className="panel space-y-5 p-6">
				<div className="grid gap-5 sm:grid-cols-2">
					<div>
						<label className="label" htmlFor="name">
							Name
						</label>
						<input
							id="name"
							className="input"
							required
							maxLength={100}
							value={name}
							onChange={(event) => setName(event.target.value)}
						/>
					</div>
					<div>
						<label className="label" htmlFor="type">
							Type
						</label>
						<select id="type" className="input" value={type} onChange={(event) => setType(event.target.value)}>
							{GAME_MODE_TYPES.map((modeType) => (
								<option key={modeType} value={modeType}>
									{modeType}
								</option>
							))}
						</select>
					</div>
				</div>

				<div>
					<label className="label" htmlFor="desc">
						Description
					</label>
					<textarea
						id="desc"
						className="input min-h-24"
						required
						maxLength={1000}
						value={desc}
						onChange={(event) => setDesc(event.target.value)}
					/>
				</div>

				<div className="grid gap-5 sm:grid-cols-2">
					<div>
						<label className="label" htmlFor="start">
							Start Date
						</label>
						<input
							id="start"
							type="date"
							className="input"
							required
							value={startDate}
							onChange={(event) => setStartDate(event.target.value)}
						/>
					</div>
					<div>
						<label className="label" htmlFor="end">
							End Date
						</label>
						<input
							id="end"
							type="date"
							className="input"
							required
							value={endDate}
							onChange={(event) => setEndDate(event.target.value)}
						/>
					</div>
				</div>

				<div>
					<label className="label" htmlFor="template">
						Copy rule tags from an existing game mode (optional)
					</label>
					<select
						id="template"
						className="input"
						value={templateId}
						onChange={(event) => setTemplateId(Number(event.target.value))}
					>
						<option value={0}>Start from scratch</option>
						{ownModes.length > 0 && (
							<optgroup label={community.name}>
								{ownModes.map((mode) => (
									<option key={mode.id} value={mode.id}>
										{mode.name}
									</option>
								))}
							</optgroup>
						)}
						{otherModes.length > 0 && (
							<optgroup label="Other communities">
								{otherModes.map((mode) => (
									<option key={mode.id} value={mode.id}>
										{mode.name}
									</option>
								))}
							</optgroup>
						)}
					</select>
				</div>

				<TagPicker
					communityId={community.id}
					communityTags={context.tags}
					selected={selected}
					onToggle={toggleTag}
				/>

				{error && <p className="text-sm text-rio-300">{error}</p>}
				<div className="flex gap-3">
					<button type="submit" className="btn-primary flex-1" disabled={submitting}>
						{submitting ? 'Creating…' : 'Create Game Mode'}
					</button>
					<Link href={backHref} className="btn-secondary">
						Cancel
					</Link>
				</div>
			</form>
		</div>
	);
}

export default function CreateGameModePage({ params }: { params: Promise<{ name: string }> }) {
	const communityName = decodeURIComponent(use(params).name);
	const state = useCommunity(communityName);
	const guard = adminGuard(state);
	if (guard) return guard;
	return <CreateGameModeForm context={state.context!} />;
}
