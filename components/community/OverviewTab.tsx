'use client';

import { useState } from 'react';
import Link from 'next/link';
import { joinCommunity, communityKeys } from '@/lib/communityApi';
import { Panel, PanelHeader } from '@/components/ui';
import type { CommunityContext } from './CommunityHub';

function JoinAction({ context }: { context: CommunityContext }) {
	const { community, username, isMember, inviteUrl, refresh } = context;
	const [busy, setBusy] = useState(false);
	const [message, setMessage] = useState<string | null>(null);

	if (!username) {
		return (
			<Link href="/login" className="btn-primary">
				Log in to join
			</Link>
		);
	}
	if (isMember) return null;

	async function join() {
		setBusy(true);
		setMessage(null);
		try {
			const result = await joinCommunity(community.name, inviteUrl ?? undefined);
			if (result.active) {
				setMessage(`Welcome to ${community.name}!`);
				refresh();
			} else {
				setMessage('Your request to join has been sent to the community admins.');
			}
		} catch (err: any) {
			setMessage(err?.message ?? 'Could not join this community.');
		} finally {
			setBusy(false);
		}
	}

	const label = community.private && !inviteUrl ? 'Request to Join' : 'Join Community';
	return (
		<div className="flex flex-col items-start gap-2">
			<button type="button" className="btn-primary" disabled={busy} onClick={join}>
				{busy ? 'Joining…' : label}
			</button>
			{inviteUrl && <p className="text-xs text-star-400">You are joining with an invite link.</p>}
			{message && <p className="text-sm text-fog-300">{message}</p>}
		</div>
	);
}

function MyCommunityKey({ context }: { context: CommunityContext }) {
	const { community, isMember } = context;
	const [key, setKey] = useState<string | null>(null);
	const [busy, setBusy] = useState(false);
	const [error, setError] = useState<string | null>(null);

	if (!isMember) return null;

	async function generate(action: 'generate' | 'revoke') {
		setBusy(true);
		setError(null);
		try {
			const result = await communityKeys(community.name, action);
			setKey(action === 'generate' ? (result?.[0]?.community_key ?? null) : null);
		} catch (err: any) {
			setError(err?.message ?? 'Key action failed.');
		} finally {
			setBusy(false);
		}
	}

	return (
		<Panel>
			<PanelHeader title="My Community Key" />
			<div className="space-y-3 p-5">
				<p className="text-sm text-fog-500">
					A short key you can enter in the Rio client instead of your full Rio Key. It only unlocks this
					community's game modes — handy for shared setups and LAN events.
				</p>
				{key && (
					<p className="font-mono text-2xl tracking-[0.3em] text-star-400" style={{ fontVariantNumeric: 'tabular-nums' }}>
						{key}
					</p>
				)}
				<div className="flex gap-3">
					<button type="button" className="btn-primary !py-2 text-sm" disabled={busy} onClick={() => generate('generate')}>
						{key ? 'Regenerate' : 'Generate Key'}
					</button>
					{key && (
						<button type="button" className="btn-secondary !py-2 text-sm" disabled={busy} onClick={() => generate('revoke')}>
							Revoke
						</button>
					)}
				</div>
				{error && <p className="text-sm text-rio-300">{error}</p>}
			</div>
		</Panel>
	);
}

export default function OverviewTab({ context }: { context: CommunityContext }) {
	const { community, members, tags, sponsor } = context;
	const activeMembers = members?.filter((member) => member.active).length;

	return (
		<div className="grid gap-6 lg:grid-cols-3">
			<div className="space-y-6 lg:col-span-2">
				<Panel>
					<PanelHeader title="About" />
					<div className="p-5">
						<p className="whitespace-pre-wrap text-sm leading-relaxed text-fog-300">
							{community.desc || 'No description yet.'}
						</p>
					</div>
				</Panel>
				<JoinAction context={context} />
			</div>
			<div className="space-y-6">
				<Panel>
					<PanelHeader title="Details" />
					<dl className="space-y-3 p-5 text-sm">
						<div className="flex justify-between gap-4">
							<dt className="text-fog-500">Type</dt>
							<dd className="text-fog-100">{community.type}</dd>
						</div>
						<div className="flex justify-between gap-4">
							<dt className="text-fog-500">Visibility</dt>
							<dd className="text-fog-100">{community.private ? 'Private' : 'Public'}</dd>
						</div>
						{activeMembers !== undefined && (
							<div className="flex justify-between gap-4">
								<dt className="text-fog-500">Members</dt>
								<dd className="text-fog-100" style={{ fontVariantNumeric: 'tabular-nums' }}>
									{activeMembers}
								</dd>
							</div>
						)}
						{tags && (
							<div className="flex justify-between gap-4">
								<dt className="text-fog-500">Tags</dt>
								<dd className="text-fog-100" style={{ fontVariantNumeric: 'tabular-nums' }}>
									{tags.length}
								</dd>
							</div>
						)}
						{sponsor && (
							<div className="flex justify-between gap-4">
								<dt className="text-fog-500">Sponsor</dt>
								<dd>
									<Link href={`/users/${encodeURIComponent(sponsor)}`} className="text-rio-400 hover:text-rio-300">
										{sponsor}
									</Link>
								</dd>
							</div>
						)}
						<div className="flex justify-between gap-4">
							<dt className="text-fog-500">Created</dt>
							<dd className="text-fog-100">
								{community.date_created ? new Date(community.date_created * 1000).toLocaleDateString() : '—'}
							</dd>
						</div>
					</dl>
				</Panel>
				<MyCommunityKey context={context} />
			</div>
		</div>
	);
}
