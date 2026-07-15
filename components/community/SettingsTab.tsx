'use client';

import { useState, type FormEvent } from 'react';
import { updateCommunity, communityKeys } from '@/lib/communityApi';
import { useRioStaff } from '@/lib/useRioStaff';
import { Panel, PanelHeader } from '@/components/ui';
import type { CommunityContext } from './CommunityHub';

export default function SettingsTab({ context }: { context: CommunityContext }) {
	const { community, sponsor, refresh } = context;
	const { isStaff } = useRioStaff();

	const [name, setName] = useState(community.name);
	const [desc, setDesc] = useState(community.desc ?? '');
	const [isPrivate, setIsPrivate] = useState(community.private);
	const [hasLink, setHasLink] = useState(Boolean(community.url));
	const [tagSetLimit, setTagSetLimit] = useState(community.tag_set_limit);
	const [busy, setBusy] = useState(false);
	const [message, setMessage] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);

	const [allKeys, setAllKeys] = useState<{ user: string; comm_key: string }[] | null>(null);
	const [keysBusy, setKeysBusy] = useState(false);

	async function save(event: FormEvent) {
		event.preventDefault();
		setBusy(true);
		setMessage(null);
		setError(null);
		try {
			const fields: Record<string, unknown> = {};
			if (name !== community.name) fields.name = name;
			if (desc !== (community.desc ?? '')) fields.desc = desc;
			if (isPrivate !== community.private) fields.private = isPrivate;
			if (hasLink !== Boolean(community.url)) fields.link = hasLink;
			if (isStaff && tagSetLimit !== community.tag_set_limit) fields.active_tag_set_limit = tagSetLimit;
			if (Object.keys(fields).length === 0) {
				setMessage('Nothing to save.');
				return;
			}
			await updateCommunity(community.id, fields);
			setMessage('Settings saved.');
			refresh();
		} catch (err: any) {
			setError(err?.message ?? 'Could not save settings.');
		} finally {
			setBusy(false);
		}
	}

	async function generateAllKeys() {
		if (!window.confirm('Generate a fresh community key for every member? Existing keys are replaced.')) return;
		setKeysBusy(true);
		setError(null);
		try {
			const result = await communityKeys(community.name, 'generate_all');
			setAllKeys(result ?? []);
		} catch (err: any) {
			setError(err?.message ?? 'Could not generate keys.');
		} finally {
			setKeysBusy(false);
		}
	}

	const inviteLink =
		community.url && typeof window !== 'undefined'
			? `${window.location.origin}/communities/${encodeURIComponent(community.name)}?invite=${community.url}`
			: null;

	return (
		<div className="grid gap-6 lg:grid-cols-2">
			<Panel>
				<PanelHeader title="Community Settings" />
				<form onSubmit={save} className="space-y-4 p-5">
					<div>
						<label className="label" htmlFor="settings-name">
							Name
						</label>
						<input
							id="settings-name"
							className="input"
							required
							maxLength={100}
							value={name}
							onChange={(event) => setName(event.target.value)}
						/>
						<p className="mt-1 text-xs text-fog-500">Renaming also renames the community's tag.</p>
					</div>
					<div>
						<label className="label" htmlFor="settings-desc">
							Description
						</label>
						<textarea
							id="settings-desc"
							className="input min-h-24"
							maxLength={1000}
							value={desc}
							onChange={(event) => setDesc(event.target.value)}
						/>
					</div>
					<label className="flex items-center gap-2 text-sm text-fog-300">
						<input
							type="checkbox"
							className="accent-rio-500"
							checked={isPrivate}
							onChange={(event) => setIsPrivate(event.target.checked)}
						/>
						Private — players need an invite or invite link to join
					</label>
					<label className="flex items-center gap-2 text-sm text-fog-300">
						<input
							type="checkbox"
							className="accent-rio-500"
							checked={hasLink}
							onChange={(event) => setHasLink(event.target.checked)}
							disabled={!isPrivate}
						/>
						Shareable invite link {!isPrivate && '(public communities always have one)'}
					</label>
					{isStaff && (
						<div>
							<label className="label" htmlFor="settings-limit">
								Active game mode limit (Rio staff)
							</label>
							<input
								id="settings-limit"
								type="number"
								min={0}
								className="input max-w-32"
								value={tagSetLimit}
								onChange={(event) => setTagSetLimit(Number(event.target.value))}
							/>
						</div>
					)}
					{message && <p className="text-sm text-emerald-300">{message}</p>}
					{error && <p className="text-sm text-rio-300">{error}</p>}
					<button type="submit" className="btn-primary" disabled={busy}>
						{busy ? 'Saving…' : 'Save Settings'}
					</button>
				</form>
			</Panel>

			<div className="space-y-6">
				<Panel>
					<PanelHeader title="Invite Link" />
					<div className="space-y-3 p-5">
						{inviteLink ? (
							<>
								<code className="block overflow-x-auto rounded bg-night-950 p-3 text-xs text-fog-300">{inviteLink}</code>
								<p className="text-xs text-fog-500">
									Anyone with this link can join instantly. Toggle the link off and save to revoke it — saving again
									mints a new URL.
								</p>
							</>
						) : (
							<p className="text-sm text-fog-500">No invite link. Enable it in settings and save to create one.</p>
						)}
					</div>
				</Panel>

				<Panel>
					<PanelHeader title="Community Keys" />
					<div className="space-y-3 p-5">
						<p className="text-sm text-fog-500">
							Issue every member a fresh 4-character key for the Rio client. Share each key privately — anyone
							holding a key can play as that member.
						</p>
						<button type="button" className="btn-secondary !py-2 text-sm" disabled={keysBusy} onClick={generateAllKeys}>
							{keysBusy ? 'Generating…' : 'Generate Keys for All Members'}
						</button>
						{allKeys && (
							<div className="max-h-64 overflow-y-auto">
								<table className="stat-table">
									<thead>
										<tr>
											<th>Player</th>
											<th>Key</th>
										</tr>
									</thead>
									<tbody>
										{allKeys.map((entry) => (
											<tr key={entry.user}>
												<td>{entry.user}</td>
												<td className="font-mono text-star-400">{entry.comm_key}</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>
						)}
					</div>
				</Panel>

				<Panel>
					<PanelHeader title="Sponsor" />
					<div className="p-5 text-sm text-fog-500">
						{sponsor ? (
							<p>
								Sponsored by <span className="text-fog-100">{sponsor}</span>. The sponsor's patron tier sets how many
								communities they can sponsor; game modes can only be created while the community is sponsored.
							</p>
						) : (
							<p>
								This community has no sponsor. A patron must sponsor it before new game modes can be created.
							</p>
						)}
					</div>
				</Panel>
			</div>
		</div>
	);
}
