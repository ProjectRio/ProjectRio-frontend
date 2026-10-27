'use client';

import { useMemo, useState, type FormEvent } from 'react';
import { inviteMembers, manageMembers, type CommunityMember } from '@/lib/communityApi';
import { Panel, PanelHeader, Badge, EmptyState, PlayerLink } from '@/components/ui';
import { Modal } from '@/components/overlay';
import type { CommunityContext } from './CommunityHub';

function statusOf(member: CommunityMember): { label: string; color: 'red' | 'gold' | 'gray' | 'green' } {
	if (member.banned) return { label: 'Banned', color: 'red' };
	if (member.active) return { label: member.admin ? 'Admin' : 'Member', color: member.admin ? 'gold' : 'green' };
	if (member.invited) return { label: 'Invited', color: 'gray' };
	return { label: 'Requested', color: 'gray' };
}

function InviteModal({ context, onClose }: { context: CommunityContext; onClose: () => void }) {
	const [names, setNames] = useState('');
	const [busy, setBusy] = useState(false);
	const [error, setError] = useState<string | null>(null);

	async function submit(event: FormEvent) {
		event.preventDefault();
		const list = names
			.split(/[\n,]+/)
			.map((name) => name.trim())
			.filter(Boolean);
		if (list.length === 0) return;
		setBusy(true);
		setError(null);
		try {
			await inviteMembers(context.community.name, list);
			context.refresh();
			onClose();
		} catch (err: any) {
			setError(err?.message ?? 'Could not send invites.');
		} finally {
			setBusy(false);
		}
	}

	return (
		<Modal title="Invite Players" onClose={onClose}>
			<form onSubmit={submit} className="space-y-4">
				<div>
					<label className="label" htmlFor="invite-names">
						Usernames (comma or newline separated)
					</label>
					<textarea
						id="invite-names"
						className="input min-h-28"
						placeholder={'PlayerOne\nPlayerTwo'}
						value={names}
						onChange={(event) => setNames(event.target.value)}
					/>
				</div>
				<p className="text-xs text-fog-500">
					Invited players are added right away and notified by email. Inviting a banned player lifts their ban.
				</p>
				{error && <p className="text-sm text-rio-300">{error}</p>}
				<button type="submit" className="btn-primary w-full" disabled={busy}>
					{busy ? 'Inviting…' : 'Send Invites'}
				</button>
			</form>
		</Modal>
	);
}

function MemberActions({
	member,
	context,
	onResult
}: {
	member: CommunityMember;
	context: CommunityContext;
	onResult: (message: string | null, error?: string) => void;
}) {
	const [busy, setBusy] = useState(false);
	const isSelf = member.username === context.username;

	async function act(
		action: { admin?: boolean; remove?: boolean; ban?: boolean; key?: boolean },
		confirmText?: string
	) {
		if (confirmText && !window.confirm(confirmText)) return;
		setBusy(true);
		try {
			const updated = await manageMembers(context.community.name, [{ username: member.username!, ...action }]);
			const key = (updated[0] as any)?.community_key;
			onResult(action.key === true && key ? `Key for ${member.username}: ${key}` : null);
			context.refresh();
		} catch (err: any) {
			onResult(null, err?.message ?? 'Action failed.');
		} finally {
			setBusy(false);
		}
	}

	if (member.banned) {
		return (
			<button
				type="button"
				className="text-xs font-semibold uppercase tracking-wider text-fog-500 hover:text-fog-100"
				disabled={busy}
				onClick={() =>
					inviteMembers(context.community.name, [member.username!])
						.then(() => context.refresh())
						.catch((err) => onResult(null, err?.message ?? 'Could not lift ban.'))
				}
			>
				Lift Ban
			</button>
		);
	}

	if (!member.active && !member.invited) {
		// Pending join request — approving is an invite.
		return (
			<button
				type="button"
				className="text-xs font-semibold uppercase tracking-wider text-emerald-300 hover:text-emerald-400"
				disabled={busy}
				onClick={() =>
					inviteMembers(context.community.name, [member.username!])
						.then(() => context.refresh())
						.catch((err) => onResult(null, err?.message ?? 'Could not approve request.'))
				}
			>
				Approve
			</button>
		);
	}

	return (
		<div className="flex flex-wrap justify-end gap-3">
			{!isSelf && (
				<button
					type="button"
					className="text-xs font-semibold uppercase tracking-wider text-fog-500 hover:text-fog-100"
					disabled={busy}
					onClick={() => act({ admin: !member.admin })}
				>
					{member.admin ? 'Demote' : 'Make Admin'}
				</button>
			)}
			<button
				type="button"
				className="text-xs font-semibold uppercase tracking-wider text-fog-500 hover:text-fog-100"
				disabled={busy}
				onClick={() => act({ key: true })}
			>
				New Key
			</button>
			{!member.admin && !isSelf && (
				<>
					<button
						type="button"
						className="text-xs font-semibold uppercase tracking-wider text-fog-500 hover:text-rio-300"
						disabled={busy}
						onClick={() => act({ remove: true }, `Remove ${member.username} from ${context.community.name}?`)}
					>
						Remove
					</button>
					<button
						type="button"
						className="text-xs font-semibold uppercase tracking-wider text-rio-400 hover:text-rio-300"
						disabled={busy}
						onClick={() => act({ ban: true }, `Ban ${member.username} from ${context.community.name}?`)}
					>
						Ban
					</button>
				</>
			)}
		</div>
	);
}

export default function MembersTab({ context }: { context: CommunityContext }) {
	const { members, isAdmin } = context;
	const [inviting, setInviting] = useState(false);
	const [notice, setNotice] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [search, setSearch] = useState('');

	const visible = useMemo(() => {
		if (!members) return [];
		const query = search.trim().toLowerCase();
		// Hide removed members (inactive, not invited, not a pending request is
		// indistinguishable from a request — show them; truly removed members
		// stay listed as Requested which admins can re-approve).
		return members.filter((member) => !query || member.username?.toLowerCase().includes(query));
	}, [members, search]);

	if (!members) {
		return (
			<EmptyState
				title="Members are private"
				detail="Join this community to see its member list."
			/>
		);
	}

	return (
		<div className="space-y-4">
			<div className="flex flex-wrap items-center justify-between gap-3">
				<input
					className="input max-w-xs"
					placeholder="Search members…"
					value={search}
					onChange={(event) => setSearch(event.target.value)}
				/>
				{isAdmin && (
					<button type="button" className="btn-primary !py-2 text-sm" onClick={() => setInviting(true)}>
						Invite Players
					</button>
				)}
			</div>

			{notice && <p className="rounded-lg border border-star-500/40 bg-star-500/10 px-4 py-3 font-mono text-sm text-star-400">{notice}</p>}
			{error && <p className="text-sm text-rio-300">{error}</p>}

			<Panel>
				<PanelHeader title={`Members (${members.filter((member) => member.active).length})`} />
				<div className="overflow-x-auto">
					<table className="stat-table">
						<thead>
							<tr>
								<th>Player</th>
								<th>Status</th>
								<th>Joined</th>
								{isAdmin && <th className="text-right">Actions</th>}
							</tr>
						</thead>
						<tbody>
							{visible.map((member) => {
								const status = statusOf(member);
								return (
									<tr key={member.id}>
										<td>
											<PlayerLink username={member.username ?? `User #${member.user_id}`} />
										</td>
										<td>
											<Badge color={status.color}>{status.label}</Badge>
										</td>
										<td className="text-fog-500">
											{member.date_joined ? new Date(member.date_joined * 1000).toLocaleDateString() : '—'}
										</td>
										{isAdmin && (
											<td className="text-right">
												<MemberActions
													member={member}
													context={context}
													onResult={(message, errorMessage) => {
														setNotice(message ?? null);
														setError(errorMessage ?? null);
													}}
												/>
											</td>
										)}
									</tr>
								);
							})}
						</tbody>
					</table>
				</div>
			</Panel>

			{inviting && <InviteModal context={context} onClose={() => setInviting(false)} />}
		</div>
	);
}
