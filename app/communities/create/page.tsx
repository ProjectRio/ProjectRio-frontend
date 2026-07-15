'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { createCommunity } from '@/lib/communityApi';
import { useUsername } from '@/lib/useUsername';
import { useRioStaff } from '@/lib/useRioStaff';
import { PageHeader } from '@/components/ui';

export default function CreateCommunityPage() {
	const username = useUsername();
	const { isStaff } = useRioStaff();
	const [name, setName] = useState('');
	const [isPrivate, setIsPrivate] = useState(false);
	const [globalLink, setGlobalLink] = useState(true);
	const [official, setOfficial] = useState(false);
	const [desc, setDesc] = useState('');
	const [error, setError] = useState<string | null>(null);
	const [submitting, setSubmitting] = useState(false);
	const [created, setCreated] = useState<{ name: string; url: string | null } | null>(null);

	async function handleSubmit(event: FormEvent) {
		event.preventDefault();
		setSubmitting(true);
		setError(null);
		try {
			const result = await createCommunity({
				name,
				type: official ? 'Official' : 'Unofficial',
				isPrivate,
				globalLink,
				desc
			});
			setCreated({ name: result.community_name ?? name, url: result.active_url ?? null });
		} catch (err: any) {
			setError(err?.message ?? 'Could not create the community.');
		} finally {
			setSubmitting(false);
		}
	}

	if (created) {
		return (
			<div className="mx-auto max-w-lg">
				<div className="panel p-8 text-center">
					<h1 className="text-3xl uppercase">Community Created</h1>
					<p className="mt-3 text-sm text-fog-300">“{created.name}” is ready.</p>
					{created.url && (
						<div className="mt-5 text-left">
							<p className="label">Invite link</p>
							<code className="block overflow-x-auto rounded bg-night-950 p-3 text-xs text-fog-300">
								{`${typeof window !== 'undefined' ? window.location.origin : ''}/communities/${encodeURIComponent(created.name)}?invite=${created.url}`}
							</code>
							<p className="mt-2 text-xs text-fog-500">
								Anyone with this link can join. You can regenerate or revoke it from community settings.
							</p>
						</div>
					)}
					<Link href={`/communities/${encodeURIComponent(created.name)}`} className="btn-primary mt-6 inline-block">
						Go to Community
					</Link>
				</div>
			</div>
		);
	}

	return (
		<div className="mx-auto max-w-lg">
			<PageHeader kicker="Communities" title="Create a Community" />
			{!username && (
				<p className="mb-6 rounded-lg border border-star-500/40 bg-star-500/10 px-4 py-3 text-sm text-star-400">
					You must be logged in — and a Project Rio patron — to sponsor a new community.
				</p>
			)}
			<form onSubmit={handleSubmit} className="panel space-y-5 p-6">
				<div>
					<label className="label" htmlFor="name">
						Community Name
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
					<label className="label" htmlFor="desc">
						Description
					</label>
					<textarea
						id="desc"
						className="input min-h-28"
						required
						maxLength={1000}
						value={desc}
						onChange={(event) => setDesc(event.target.value)}
					/>
				</div>
				<div className="space-y-3">
					<label className="flex items-center gap-2 text-sm text-fog-300">
						<input
							type="checkbox"
							className="accent-rio-500"
							checked={isPrivate}
							onChange={(event) => setIsPrivate(event.target.checked)}
						/>
						Private — players need an invite or invite link to join
					</label>
					{isPrivate && (
						<label className="ml-6 flex items-center gap-2 text-sm text-fog-300">
							<input
								type="checkbox"
								className="accent-rio-500"
								checked={globalLink}
								onChange={(event) => setGlobalLink(event.target.checked)}
							/>
							Create a shareable invite link
						</label>
					)}
					{isStaff && (
						<label className="flex items-center gap-2 text-sm text-fog-300">
							<input
								type="checkbox"
								className="accent-rio-500"
								checked={official}
								onChange={(event) => setOfficial(event.target.checked)}
							/>
							Official community (Rio staff only — every player is auto-enrolled)
						</label>
					)}
				</div>
				{error && <p className="text-sm text-rio-300">{error}</p>}
				<button type="submit" className="btn-primary w-full" disabled={submitting}>
					{submitting ? 'Creating…' : 'Create Community'}
				</button>
			</form>
		</div>
	);
}
