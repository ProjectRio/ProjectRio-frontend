'use client';

// Commissioner setup: format, order, slots, pool, restrictions, keepers,
// timers (§10a). Everything is mutable until the draft starts.

import { use, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ALL_ASSETS, CLASS_HUES, assetById } from '@/lib/draft/assets';
import { leagueById } from '@/lib/draft/fixtures';
import { FORMAT_BLURBS, FORMAT_LABELS, type Asset, type DraftConfig, type DraftFormat, type Restriction } from '@/lib/draft/types';
import { useDraft } from '@/lib/draft/useDraft';
import PreviewBar from '@/components/draft/PreviewBar';
import { AssetSprite, findTeam, Reason, SectionLabel, StateChip, TeamLogo } from '@/components/draft/primitives';
import { EmptyState, PageHeader, Panel, Spinner } from '@/components/ui';

const FORMATS: DraftFormat[] = ['auction', 'vickrey', 'snake', 'fixed_price', 'round_pool'];
const CHARACTERS = ALL_ASSETS.filter((asset) => asset.kind === 'character');

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
	return (
		<label className="block">
			<span className="label">{label}</span>
			{children}
			{hint && <span className="mt-1 block text-xs text-fog-500">{hint}</span>}
		</label>
	);
}

function Number_({ value, onChange, min = 0, max, disabled }: { value: number; onChange: (value: number) => void; min?: number; max?: number; disabled?: boolean }) {
	return <input type="number" className="input !w-28 tabular-nums" value={value} min={min} max={max} disabled={disabled} onChange={(event) => onChange(Number(event.target.value) || 0)} />;
}

function Toggle({ checked, onChange, label, disabled }: { checked: boolean; onChange: (value: boolean) => void; label: string; disabled?: boolean }) {
	return (
		<label className={`flex items-center gap-2 text-sm text-fog-300 ${disabled ? 'opacity-50' : ''}`}>
			<input type="checkbox" className="accent-rio-500" checked={checked} disabled={disabled} onChange={(event) => onChange(event.target.checked)} />
			{label}
		</label>
	);
}

function CharacterSelect({ value, onChange, multiple = false }: { value: number[]; onChange: (ids: number[]) => void; multiple?: boolean }) {
	return (
		<select
			multiple={multiple}
			className={`input !w-auto ${multiple ? 'h-28' : ''}`}
			value={multiple ? value.map(String) : String(value[0] ?? '')}
			onChange={(event) => onChange(multiple ? [...event.target.selectedOptions].map((option) => Number(option.value)) : [Number(event.target.value)])}
		>
			{!multiple && <option value="">Character…</option>}
			{CHARACTERS.map((asset) => (
				<option key={asset.id} value={asset.char_id}>
					{asset.name}
				</option>
			))}
		</select>
	);
}

export default function SetupPage({ params }: { params: Promise<{ id: string }> }) {
	const { id } = use(params);
	const leagueId = Number(id);
	const league = leagueById(leagueId);
	const handle = useDraft(leagueId);
	const { snapshot } = handle;
	const [format, setFormat] = useState<DraftFormat>(league?.format ?? 'auction');
	const [config, setConfig] = useState<DraftConfig | null>(null);
	const [order, setOrder] = useState<number[]>([]);
	const [priority, setPriority] = useState<number[]>([]);
	const [poolFilter, setPoolFilter] = useState<'All' | 'Power' | 'Balance' | 'Technique' | 'Speed' | 'Stadiums'>('All');
	const [keeperTeam, setKeeperTeam] = useState<number | ''>('');
	const [keeperAsset, setKeeperAsset] = useState<number | ''>('');
	const [keeperPrice, setKeeperPrice] = useState(1);
	const [keeperPick, setKeeperPick] = useState(1);
	const [saved, setSaved] = useState(false);

	useEffect(() => {
		if (!snapshot || config) return;
		setConfig(structuredClone(snapshot.draft.config));
		setFormat(snapshot.draft.format);
		setOrder([...snapshot.teams].sort((a, b) => a.draft_order - b.draft_order).map((team) => team.id));
		setPriority([...snapshot.teams].sort((a, b) => a.tie_priority - b.tie_priority).map((team) => team.id));
	}, [snapshot, config]);

	const keepers = useMemo(() => snapshot?.teams.flatMap((team) => team.picks.filter((pick) => pick.is_keeper)) ?? [], [snapshot]);

	if (!league) return <EmptyState title="No such league" />;
	if (!snapshot || !config) return <Spinner label="Loading setup…" />;
	const { draft, you, teams } = snapshot;
	const locked = draft.state === 'live' || draft.state === 'completed';
	const isCommissioner = you.role === 'commissioner';
	const money = format !== 'snake';
	const update = (patch: Partial<DraftConfig>) => {
		setConfig({ ...config, ...patch });
		setSaved(false);
	};

	async function save() {
		if (!config) return;
		const result = await handle.act({ type: 'set_config', payload: { ...config, format } });
		if (!result.ok) return;
		await handle.act({ type: 'set_order', payload: { team_ids: order } });
		await handle.act({ type: 'set_tie_priority', payload: { team_ids: priority } });
		setSaved(true);
	}

	const move = (list: number[], set: (next: number[]) => void, index: number, delta: number) => {
		const next = [...list];
		const target = index + delta;
		if (target < 0 || target >= next.length) return;
		[next[index], next[target]] = [next[target], next[index]];
		set(next);
		setSaved(false);
	};

	const poolAssets = ALL_ASSETS.filter((asset) => (poolFilter === 'All' ? true : poolFilter === 'Stadiums' ? asset.kind === 'stadium' : asset.class === poolFilter));
	const inPool = (asset: Asset) => config.pool.asset_ids.includes(asset.id);
	const togglePool = (asset: Asset) =>
		update({ pool: { ...config.pool, asset_ids: inPool(asset) ? config.pool.asset_ids.filter((candidate) => candidate !== asset.id) : [...config.pool.asset_ids, asset.id] } });
	const setPrice = (asset: Asset, price: number) => update({ pool: { ...config.pool, prices: { ...(config.pool.prices ?? {}), [asset.id]: price } } });
	const setCopies = (asset: Asset, copies: number) => update({ pool: { ...config.pool, copies_by_asset: { ...(config.pool.copies_by_asset ?? {}), [asset.id]: copies } } });
	const totalCopies = config.pool.copies === null ? null : config.pool.asset_ids.reduce((sum, id) => sum + (config.pool.copies_by_asset?.[id] ?? config.pool.copies ?? 0), 0);
	const totalSlots = (config.slots.character + config.slots.stadium) * teams.length;
	const setRestrictions = (restrictions: Restriction[]) => update({ restrictions });

	if (!isCommissioner) {
		return (
			<div>
				<PreviewBar leagueId={leagueId} compact />
				<EmptyState title="Commissioner only" detail="Draft setup is for the league's commissioner. Switch the preview identity to see it." />
			</div>
		);
	}

	return (
		<div>
			<PreviewBar leagueId={leagueId} compact />
			<PageHeader kicker={`${league.name} · commissioner`} title="Draft setup">
				<StateChip state={draft.state} paused={draft.paused} />
				<Link href={`/leagues/${leagueId}/draft`} className="btn-secondary !py-2 text-sm">
					Room
				</Link>
			</PageHeader>
			{locked && <p className="mb-4 rounded border border-star-500/40 bg-star-500/10 px-3 py-2 text-sm text-fog-300">The draft has started. Rules are a snapshot taken at setup and can&apos;t change now; use the commissioner panel in the room.</p>}

			<div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_18rem]">
				<div className="space-y-4">
					<Panel>
						<SectionLabel>Format</SectionLabel>
						<div className="grid gap-2 p-3 sm:grid-cols-2 lg:grid-cols-3">
							{FORMATS.map((candidate) => (
								<button
									key={candidate}
									type="button"
									disabled={locked || draft.state !== 'setup'}
									onClick={() => {
										setFormat(candidate);
										setSaved(false);
									}}
									className={`rounded-lg border p-3 text-left transition-colors disabled:cursor-not-allowed ${format === candidate ? 'border-rio-500 bg-rio-500/10' : 'border-night-700 bg-night-850 hover:border-night-600'}`}
								>
									<div className="font-display text-sm font-bold uppercase tracking-wide">{FORMAT_LABELS[candidate]}</div>
									<div className="mt-1 text-xs text-fog-500">{FORMAT_BLURBS[candidate]}</div>
								</button>
							))}
						</div>
						{draft.state !== 'setup' && <p className="px-3 pb-3 text-xs text-fog-500">Format locks once the lobby opens.</p>}
					</Panel>

					<Panel>
						<SectionLabel>Roster and budget</SectionLabel>
						<div className="grid gap-4 p-3 sm:grid-cols-2 lg:grid-cols-4">
							<Field label="Character slots">
								<Number_ value={config.slots.character} min={1} max={12} disabled={locked} onChange={(value) => update({ slots: { ...config.slots, character: value } })} />
							</Field>
							<Field label="Stadium slots">
								<Number_ value={config.slots.stadium} min={0} max={3} disabled={locked} onChange={(value) => update({ slots: { ...config.slots, stadium: value } })} />
							</Field>
							{money && (
								<Field label="Draft budget" hint="Salary cap and floor are team settings on the league page.">
									<Number_ value={config.budget} min={1} disabled={locked} onChange={(value) => update({ budget: value })} />
								</Field>
							)}
							{money && format !== 'fixed_price' && (
								<Field label="Min bid / increment">
									<div className="flex gap-2">
										<Number_ value={config.min_bid} min={0} disabled={locked} onChange={(value) => update({ min_bid: value })} />
										<Number_ value={config.bid_increment} min={1} disabled={locked} onChange={(value) => update({ bid_increment: value })} />
									</div>
								</Field>
							)}
							<Field label="Copies per asset" hint="How many teams can hold the same character. Blank = unlimited.">
								<input type="number" className="input !w-28" value={config.pool.copies ?? ''} placeholder="∞" min={1} disabled={locked} onChange={(event) => update({ pool: { ...config.pool, copies: event.target.value === '' ? null : Number(event.target.value) } })} />
							</Field>
							{money && format !== 'fixed_price' && (
								<div className="sm:col-span-2">
									<Toggle checked={config.last_slot_takes_remaining} disabled={locked} onChange={(value) => update({ last_slot_takes_remaining: value })} label="Last slot takes the team's remaining budget (bids normally, charged everything left on winning)" />
								</div>
							)}
						</div>
					</Panel>

					<Panel>
						<SectionLabel>Timing and flow</SectionLabel>
						<div className="grid gap-4 p-3 sm:grid-cols-2 lg:grid-cols-4">
							{format !== 'fixed_price' && format !== 'snake' && (
								<>
									<Field label="Lot clock (s)" hint="Blank = untimed; the commissioner closes.">
										<input type="number" className="input !w-28" value={config.lot_seconds ?? ''} placeholder="untimed" min={5} disabled={locked} onChange={(event) => update({ lot_seconds: event.target.value === '' ? null : Number(event.target.value) })} />
									</Field>
									<Field label="Extend on bid (s)">
										<Number_ value={config.extend_seconds} min={0} disabled={locked} onChange={(value) => update({ extend_seconds: value })} />
									</Field>
								</>
							)}
							{format === 'snake' && (
								<Field label="Pick clock (s)" hint="Blank = no clock. Never auto-picks.">
									<input type="number" className="input !w-28" value={config.pick_seconds ?? ''} placeholder="none" min={10} disabled={locked} onChange={(event) => update({ pick_seconds: event.target.value === '' ? null : Number(event.target.value) })} />
								</Field>
							)}
							{(format === 'auction' || format === 'vickrey') && (
								<Field label="Advance" hint="Next nomination opens automatically, or when you open it.">
									<select className="input !w-auto" value={config.advance} disabled={locked} onChange={(event) => update({ advance: event.target.value as 'auto' | 'manual' })}>
										<option value="auto">Automatic</option>
										<option value="manual">Commissioner opens</option>
									</select>
								</Field>
							)}
							{(format === 'vickrey' || format === 'round_pool') && (
								<Field label="Sealed-bid ties" hint="A tied nominator always takes it first.">
									<select className="input !w-auto" value={config.ties.method} disabled={locked} onChange={(event) => update({ ties: { method: event.target.value as 'runoff' | 'priority_order' } })}>
										<option value="runoff">$1 runoff</option>
										<option value="priority_order">Rolling priority order</option>
									</select>
								</Field>
							)}
							{format === 'fixed_price' && (
								<Field label="Deadline">
									<input type="datetime-local" className="input !w-auto" disabled={locked} value={config.deadline ? new Date(config.deadline - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16) : ''} onChange={(event) => update({ deadline: event.target.value ? new Date(event.target.value).getTime() : null })} />
								</Field>
							)}
							{format !== 'fixed_price' && (
								<div className="flex flex-col gap-2 sm:col-span-2">
									<Toggle checked={config.auto_pause_on_disconnect} disabled={locked} onChange={(value) => update({ auto_pause_on_disconnect: value })} label="Auto-pause when a team with open slots disconnects" />
									<label className="flex items-center gap-2 text-sm text-fog-300">
										Grace <Number_ value={config.auto_pause_grace_seconds} min={0} disabled={locked || !config.auto_pause_on_disconnect} onChange={(value) => update({ auto_pause_grace_seconds: value })} /> seconds
									</label>
								</div>
							)}
							<div className="flex flex-col gap-2 sm:col-span-2">
								<Toggle checked={config.trades.enabled} disabled={locked} onChange={(value) => update({ trades: { ...config.trades, enabled: value } })} label="Trades enabled" />
								<select className="input !w-auto" value={config.trades.approval_model} disabled={locked || !config.trades.enabled} onChange={(event) => update({ trades: { ...config.trades, approval_model: event.target.value as DraftConfig['trades']['approval_model'] } })}>
									<option value="parties_only">Parties only</option>
									<option value="commissioner">Commissioner approves</option>
									<option value="league_veto">League veto window</option>
								</select>
							</div>
						</div>
					</Panel>

					<Panel>
						<SectionLabel
							action={
								<span className="text-xs text-fog-500">
									{config.pool.asset_ids.length} of {ALL_ASSETS.length} in the pool
									{totalCopies !== null && (
										<span className={totalCopies < totalSlots ? ' text-star-400' : ''}>
											{' '}· {totalCopies} copies for {totalSlots} slots
										</span>
									)}
								</span>
							}
						>
							Pool{format === 'fixed_price' ? ' and prices' : config.pool.copies !== null ? ' and copies' : ''}
						</SectionLabel>
						<div className="flex flex-wrap gap-1 border-b border-night-800 px-3 py-2">
							{(['All', 'Power', 'Balance', 'Technique', 'Speed', 'Stadiums'] as const).map((option) => (
								<button key={option} type="button" className={`border-b-2 px-2 py-1 font-display text-[11px] font-bold uppercase tracking-widest ${poolFilter === option ? 'text-fog-100' : 'text-fog-500'}`} style={{ borderColor: poolFilter === option ? (option === 'Stadiums' ? '#f59e0b' : (CLASS_HUES[option] ?? 'var(--color-rio-500)')) : 'transparent' }} onClick={() => setPoolFilter(option)}>
									{option}
								</button>
							))}
							<button type="button" className="ml-auto text-xs text-fog-500 hover:text-fog-100" disabled={locked} onClick={() => update({ pool: { ...config.pool, asset_ids: ALL_ASSETS.map((asset) => asset.id) } })}>
								Include all
							</button>
						</div>
						<ul className="grid grid-cols-4 gap-1.5 p-2 sm:grid-cols-6 lg:grid-cols-9">
							{poolAssets.map((asset) => (
								<li key={asset.id} className={`flex flex-col items-center rounded border px-1 py-1.5 ${inPool(asset) ? 'border-night-700 bg-night-850' : 'border-night-800 opacity-40'}`}>
									<button type="button" disabled={locked} onClick={() => togglePool(asset)} className="flex flex-col items-center" title={inPool(asset) ? 'Click to exclude' : 'Click to include'}>
										<AssetSprite asset={asset} size={32} />
										<span className="mt-0.5 w-full truncate text-[10px] text-fog-300">{asset.name}</span>
									</button>
									{format === 'fixed_price' && (
										<input type="number" min={0} className="input mt-1 !w-14 !px-1 !py-0.5 text-center !text-xs tabular-nums" value={config.pool.prices?.[asset.id] ?? 0} disabled={locked} onChange={(event) => setPrice(asset, Number(event.target.value) || 0)} aria-label={`Price for ${asset.name}`} />
									)}
									{format !== 'fixed_price' && config.pool.copies !== null && inPool(asset) && (
										<label className="mt-1 flex items-center gap-0.5 text-[10px] text-fog-500">
											×
											<input type="number" min={1} max={9} className="input !w-9 !px-1 !py-0.5 text-center !text-[11px] tabular-nums" value={config.pool.copies_by_asset?.[asset.id] ?? config.pool.copies} disabled={locked} onChange={(event) => setCopies(asset, Math.max(1, Number(event.target.value) || 1))} aria-label={`Copies of ${asset.name}`} />
										</label>
									)}
								</li>
							))}
						</ul>
					</Panel>

					<Panel>
						<SectionLabel>Restrictions</SectionLabel>
						<div className="space-y-3 p-3">
							<Toggle
								checked={config.restrictions.some((rule) => rule.type === 'captain_required')}
								disabled={locked}
								onChange={(value) => setRestrictions(value ? [...config.restrictions, { type: 'captain_required' }] : config.restrictions.filter((rule) => rule.type !== 'captain_required'))}
								label="Captain required — a team down to its last character slot may only take a captain"
							/>
							{config.restrictions.map((rule, index) => {
								if (rule.type === 'captain_required') return null;
								const remove = () => setRestrictions(config.restrictions.filter((_, candidate) => candidate !== index));
								const replace = (next: Restriction) => setRestrictions(config.restrictions.map((candidate, position) => (position === index ? next : candidate)));
								return (
									<div key={index} className="flex flex-wrap items-center gap-2 rounded border border-night-700 bg-night-850 p-2 text-sm">
										{rule.type === 'group_max' && (
											<>
												<span className="font-display text-[10px] font-bold uppercase tracking-widest text-fog-500">Group max</span>
												<input className="input !w-32 !py-1 !text-sm" value={rule.name} disabled={locked} onChange={(event) => replace({ ...rule, name: event.target.value })} />
												<CharacterSelect multiple value={rule.char_ids} onChange={(ids) => replace({ ...rule, char_ids: ids })} />
												<span className="text-fog-500">at most</span>
												<Number_ value={rule.max} min={1} disabled={locked} onChange={(value) => replace({ ...rule, max: value })} />
											</>
										)}
										{rule.type === 'must_be_captain' && (
											<>
												<span className="font-display text-[10px] font-bold uppercase tracking-widest text-fog-500">Must be captain</span>
												<CharacterSelect value={[rule.char_id]} onChange={(ids) => replace({ ...rule, char_id: ids[0] })} />
											</>
										)}
										{rule.type === 'handedness' && (
											<>
												<span className="font-display text-[10px] font-bold uppercase tracking-widest text-fog-500">Handedness</span>
												<CharacterSelect value={[rule.char_id]} onChange={(ids) => replace({ ...rule, char_id: ids[0] })} />
												<select className="input !w-auto !py-1 !text-sm" value={rule.bat ?? ''} disabled={locked} onChange={(event) => replace({ ...rule, bat: (event.target.value || null) as 'L' | 'R' | null })}>
													<option value="">bats either</option>
													<option value="L">bats L</option>
													<option value="R">bats R</option>
												</select>
												<select className="input !w-auto !py-1 !text-sm" value={rule.pitch ?? ''} disabled={locked} onChange={(event) => replace({ ...rule, pitch: (event.target.value || null) as 'L' | 'R' | null })}>
													<option value="">pitches either</option>
													<option value="L">pitches L</option>
													<option value="R">pitches R</option>
												</select>
												<span className="text-xs text-fog-500">icon only — not enforced by the draft</span>
											</>
										)}
										<button type="button" className="ml-auto text-xs text-fog-500 hover:text-rio-300" disabled={locked} onClick={remove}>
											Remove
										</button>
									</div>
								);
							})}
							<div className="flex flex-wrap gap-2">
								<button type="button" className="btn-secondary !py-1.5 text-xs" disabled={locked} onClick={() => setRestrictions([...config.restrictions, { type: 'group_max', name: 'Group', char_ids: [], max: 1 }])}>
									+ Group limit
								</button>
								<button type="button" className="btn-secondary !py-1.5 text-xs" disabled={locked} onClick={() => setRestrictions([...config.restrictions, { type: 'must_be_captain', char_id: 9 }])}>
									+ Must be captain
								</button>
								<button type="button" className="btn-secondary !py-1.5 text-xs" disabled={locked} onClick={() => setRestrictions([...config.restrictions, { type: 'handedness', char_id: 0, bat: 'L', pitch: null }])}>
									+ Handedness
								</button>
							</div>
						</div>
					</Panel>

					<Panel>
						<SectionLabel>Keepers</SectionLabel>
						<div className="p-3">
							<ul className="mb-3 divide-y divide-night-800">
								{keepers.map((keeper) => (
									<li key={keeper.id} className="flex items-center gap-2 py-1.5 text-sm">
										<TeamLogo logo={findTeam(snapshot, keeper.team_id)?.logo ?? null} name={findTeam(snapshot, keeper.team_id)?.name ?? ''} size={20} />
										<span className="text-fog-300">{findTeam(snapshot, keeper.team_id)?.name}</span>
										<AssetSprite asset={keeper.asset} size={22} />
										<span>{keeper.asset.name}</span>
										{money && <span className="font-display font-bold tabular-nums text-star-400">${keeper.price}</span>}
										{format === 'snake' && <span className="text-xs text-fog-500">pick #{keeper.pick_number}</span>}
										<button type="button" className="ml-auto text-xs text-fog-500 hover:text-rio-300" disabled={locked} onClick={() => handle.act({ type: 'remove_keeper', payload: { pick_id: keeper.id } })}>
											Remove
										</button>
									</li>
								))}
								{keepers.length === 0 && <li className="py-2 text-xs text-fog-500">No keepers. Keepers count against the team&apos;s draft budget and slots and leave the pool immediately.</li>}
							</ul>
							{!locked && (
								<div className="flex flex-wrap items-end gap-2">
									<Field label="Team">
										<select className="input !w-auto" value={keeperTeam} onChange={(event) => setKeeperTeam(event.target.value ? Number(event.target.value) : '')}>
											<option value="">Team…</option>
											{teams.map((team) => (
												<option key={team.id} value={team.id}>
													{team.name}
												</option>
											))}
										</select>
									</Field>
									<Field label="Asset">
										<select className="input !w-auto" value={keeperAsset} onChange={(event) => setKeeperAsset(event.target.value ? Number(event.target.value) : '')}>
											<option value="">Asset…</option>
											{ALL_ASSETS.filter((asset) => config.pool.asset_ids.includes(asset.id)).map((asset) => (
												<option key={asset.id} value={asset.id}>
													{asset.name}
												</option>
											))}
										</select>
									</Field>
									{money && (
										<Field label="Price">
											<Number_ value={keeperPrice} min={0} onChange={setKeeperPrice} />
										</Field>
									)}
									{format === 'snake' && (
										<Field label="Fills pick #">
											<Number_ value={keeperPick} min={1} onChange={setKeeperPick} />
										</Field>
									)}
									<button
										type="button"
										className="btn-primary !py-2 text-sm"
										disabled={keeperTeam === '' || keeperAsset === '' || handle.pending.has('add_keeper')}
										onClick={() =>
											keeperTeam !== '' &&
											keeperAsset !== '' &&
											handle.act({ type: 'add_keeper', payload: { team_id: keeperTeam, asset_id: keeperAsset, price: money ? keeperPrice : 0, ...(format === 'snake' ? { pick_number: keeperPick } : {}) } })
										}
									>
										Add keeper
									</button>
								</div>
							)}
							<Reason error={handle.error} types={['add_keeper', 'remove_keeper']} className="mt-2" />
						</div>
					</Panel>
				</div>

				<aside className="space-y-4">
					<Panel>
						<SectionLabel>Draft order</SectionLabel>
						<ol className="divide-y divide-night-800">
							{order.map((teamId, index) => {
								const team = findTeam(snapshot, teamId)!;
								return (
									<li key={teamId} className="flex items-center gap-2 px-3 py-1.5 text-sm">
										<span className="w-4 font-display font-bold tabular-nums text-fog-500">{index + 1}</span>
										<TeamLogo logo={team.logo} name={team.name} size={20} />
										<span className="min-w-0 flex-1 truncate">{team.name}</span>
										<button type="button" className="px-1 text-fog-500 hover:text-fog-100 disabled:opacity-30" disabled={locked || index === 0} onClick={() => move(order, setOrder, index, -1)} aria-label="Move up">
											▲
										</button>
										<button type="button" className="px-1 text-fog-500 hover:text-fog-100 disabled:opacity-30" disabled={locked || index === order.length - 1} onClick={() => move(order, setOrder, index, 1)} aria-label="Move down">
											▼
										</button>
									</li>
								);
							})}
						</ol>
						<div className="p-2">
							<button
								type="button"
								className="text-xs text-fog-500 underline decoration-dotted underline-offset-2 hover:text-fog-100"
								disabled={locked}
								onClick={() => {
									setOrder([...order].sort(() => Math.random() - 0.5));
									setSaved(false);
								}}
							>
								Randomize
							</button>
						</div>
					</Panel>
					{(format === 'vickrey' || format === 'round_pool') && (
						<Panel>
							<SectionLabel>Tie priority</SectionLabel>
							<ol className="divide-y divide-night-800">
								{priority.map((teamId, index) => {
									const team = findTeam(snapshot, teamId)!;
									return (
										<li key={teamId} className="flex items-center gap-2 px-3 py-1.5 text-sm">
											<span className="w-4 font-display font-bold tabular-nums text-fog-500">{index + 1}</span>
											<span className="min-w-0 flex-1 truncate">{team.name}</span>
											<button type="button" className="px-1 text-fog-500 hover:text-fog-100 disabled:opacity-30" disabled={locked || index === 0} onClick={() => move(priority, setPriority, index, -1)} aria-label="Move up">
												▲
											</button>
											<button type="button" className="px-1 text-fog-500 hover:text-fog-100 disabled:opacity-30" disabled={locked || index === priority.length - 1} onClick={() => move(priority, setPriority, index, 1)} aria-label="Move down">
												▼
											</button>
										</li>
									);
								})}
							</ol>
							<p className="p-2 text-xs text-fog-500">Only used when ties resolve by priority order: the winner drops to the back.</p>
						</Panel>
					)}
					<Panel className="space-y-3 p-4">
						{!locked && (
							<button type="button" className="btn-primary w-full" disabled={handle.pending.has('set_config')} onClick={save}>
								{handle.pending.has('set_config') ? 'Saving…' : saved ? 'Saved' : 'Save rules'}
							</button>
						)}
						{draft.state === 'setup' && (
							<button type="button" className="btn-secondary w-full" disabled={handle.pending.has('open_lobby')} onClick={() => handle.act({ type: 'open_lobby' })}>
								Open the lobby
							</button>
						)}
						{draft.state === 'lobby' && (
							<button type="button" className="btn-secondary w-full" disabled={handle.pending.has('start')} onClick={() => handle.act({ type: 'start' })}>
								Start the draft
							</button>
						)}
						<Reason error={handle.error} types={['set_config', 'set_order', 'set_tie_priority', 'open_lobby', 'start']} />
						<p className="text-xs text-fog-500">Rules are snapshotted into the draft when it starts, so changing the league later can&apos;t rewrite a past draft.</p>
					</Panel>
				</aside>
			</div>
		</div>
	);
}
