'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import {
	getGroupMembers,
	addUserToGroup,
	removeUserFromGroup,
	listPatrons
} from '@/lib/communityApi';
import { useUsername } from '@/lib/useUsername';
import { useRioStaff } from '@/lib/useRioStaff';
import { PageHeader, Panel, PanelHeader, Spinner, EmptyState, PlayerLink } from '@/components/ui';
import { Tabs } from '@/components/overlay';

// Groups staff manage day to day. Any other group can be typed in manually.
const COMMON_GROUPS = ['Banned', 'Admin', 'TrustedUser', 'Developer', 'BetaTester', 'General'];

function GroupsPanel() {
	const [group, setGroup] = useState('Banned');
	const [customGroup, setCustomGroup] = useState('');
	const [members, setMembers] = useState<string[] | null>(null);
	const [loadingMembers, setLoadingMembers] = useState(false);
	const [username, setUsername] = useState('');
	const [message, setMessage] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [busy, setBusy] = useState(false);

	const activeGroup = group === '__custom__' ? customGroup.trim() : group;

	async function loadMembers() {
		if (!activeGroup) return;
		setLoadingMembers(true);
		setError(null);
		try {
			setMembers(await getGroupMembers(activeGroup));
		} catch (err: any) {
			setError(err?.message ?? 'Could not load group members.');
			setMembers(null);
		} finally {
			setLoadingMembers(false);
		}
	}

	async function change(action: 'add' | 'remove', event: FormEvent) {
		event.preventDefault();
		if (!activeGroup || !username.trim()) return;
		setBusy(true);
		setMessage(null);
		setError(null);
		try {
			if (action === 'add') await addUserToGroup(username.trim(), activeGroup);
			else await removeUserFromGroup(username.trim(), activeGroup);
			setMessage(`${username.trim()} ${action === 'add' ? 'added to' : 'removed from'} ${activeGroup}.`);
			setUsername('');
			await loadMembers();
		} catch (err: any) {
			setError(err?.message ?? 'Action failed.');
		} finally {
			setBusy(false);
		}
	}

	return (
		<div className="grid gap-6 lg:grid-cols-2">
			<Panel>
				<PanelHeader title="User Groups" />
				<div className="space-y-4 p-5">
					<div>
						<label className="label" htmlFor="group">
							Group
						</label>
						<select
							id="group"
							className="input"
							value={group}
							onChange={(event) => {
								setGroup(event.target.value);
								setMembers(null);
							}}
						>
							{COMMON_GROUPS.map((groupName) => (
								<option key={groupName} value={groupName}>
									{groupName}
								</option>
							))}
							<option value="__custom__">Other…</option>
						</select>
						{group === '__custom__' && (
							<input
								className="input mt-2"
								placeholder="Group name (e.g. Patron: MVP)"
								value={customGroup}
								onChange={(event) => setCustomGroup(event.target.value)}
							/>
						)}
					</div>
					<form className="space-y-3">
						<div>
							<label className="label" htmlFor="group-user">
								Username
							</label>
							<input
								id="group-user"
								className="input"
								placeholder="Player to add or remove"
								value={username}
								onChange={(event) => setUsername(event.target.value)}
							/>
						</div>
						<div className="flex gap-3">
							<button type="submit" className="btn-primary !py-2 text-sm" disabled={busy} onClick={(event) => change('add', event)}>
								Add to Group
							</button>
							<button
								type="button"
								className="btn-secondary !py-2 text-sm"
								disabled={busy}
								onClick={(event) => change('remove', event)}
							>
								Remove from Group
							</button>
						</div>
					</form>
					{message && <p className="text-sm text-emerald-300">{message}</p>}
					{error && <p className="text-sm text-rio-300">{error}</p>}
					<p className="text-xs text-fog-500">
						Adding a player to <span className="text-fog-300">Banned</span> hides them from every ladder. Removal
						from <span className="text-fog-300">Admin</span> is blocked by the backend.
					</p>
				</div>
			</Panel>

			<Panel>
				<PanelHeader
					title={`Members${activeGroup ? ` — ${activeGroup}` : ''}`}
					action={
						<button
							type="button"
							className="text-xs font-semibold uppercase tracking-wider text-rio-400 hover:text-rio-300"
							onClick={loadMembers}
						>
							{members ? 'Reload' : 'Load'}
						</button>
					}
				/>
				{loadingMembers && <Spinner label="Loading members…" />}
				{!loadingMembers && !members && (
					<EmptyState title="Not loaded" detail="Pick a group and hit Load to list its members." />
				)}
				{!loadingMembers && members && members.length === 0 && <EmptyState title="No members in this group" />}
				{!loadingMembers && members && members.length > 0 && (
					<ul className="max-h-96 divide-y divide-night-800 overflow-y-auto px-5 py-2">
						{members.map((member) => (
							<li key={member} className="py-2 text-sm">
								<PlayerLink username={member} />
							</li>
						))}
					</ul>
				)}
			</Panel>
		</div>
	);
}

function PatronsPanel() {
	const [patrons, setPatrons] = useState<{ username: string; tier: string }[] | null>(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	async function load() {
		setLoading(true);
		setError(null);
		try {
			setPatrons(await listPatrons());
		} catch (err: any) {
			setError(err?.message ?? 'Could not load patrons.');
		} finally {
			setLoading(false);
		}
	}

	return (
		<Panel>
			<PanelHeader
				title="Patrons"
				action={
					<button
						type="button"
						className="text-xs font-semibold uppercase tracking-wider text-rio-400 hover:text-rio-300"
						onClick={load}
					>
						{patrons ? 'Reload' : 'Load'}
					</button>
				}
			/>
			{error && <p className="px-5 py-3 text-sm text-rio-300">{error}</p>}
			{loading && <Spinner label="Loading patrons…" />}
			{!loading && !patrons && !error && (
				<EmptyState title="Not loaded" detail="Patron tiers come from the Patreon sync (Admin group only)." />
			)}
			{!loading && patrons && patrons.length === 0 && <EmptyState title="No patrons found" />}
			{!loading && patrons && patrons.length > 0 && (
				<div className="overflow-x-auto">
					<table className="stat-table">
						<thead>
							<tr>
								<th>Player</th>
								<th>Tier</th>
							</tr>
						</thead>
						<tbody>
							{patrons.map((patron) => (
								<tr key={`${patron.username}-${patron.tier}`}>
									<td>
										<PlayerLink username={patron.username} />
									</td>
									<td className="text-star-400">{patron.tier}</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			)}
		</Panel>
	);
}

export default function AdminPage() {
	const username = useUsername();
	const { isStaff, loading } = useRioStaff();
	const [tab, setTab] = useState('groups');

	if (loading) return <Spinner label="Checking permissions…" />;

	if (!username || !isStaff) {
		return (
			<div className="mx-auto max-w-md">
				<div className="panel p-8 text-center">
					<h1 className="text-3xl uppercase">Rio Admin</h1>
					<p className="mt-3 text-sm text-fog-500">
						This console is for Rio staff. {username ? 'Your account is not in the Admin group.' : 'Log in to continue.'}
					</p>
					{!username && (
						<Link href="/login" className="btn-primary mt-6 inline-block">
							Log In
						</Link>
					)}
				</div>
			</div>
		);
	}

	return (
		<div>
			<PageHeader kicker="Rio staff" title="Admin Console" />
			<Tabs
				tabs={[
					{ id: 'groups', label: 'User Groups' },
					{ id: 'patrons', label: 'Patrons' }
				]}
				active={tab}
				onChange={setTab}
			/>
			{tab === 'groups' && <GroupsPanel />}
			{tab === 'patrons' && <PatronsPanel />}
		</div>
	);
}
