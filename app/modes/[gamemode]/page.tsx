'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { getRecentGames, type GameSummary } from '@/lib/api';
import { useTagsets } from '@/lib/useTagsets';
import GameCard from '@/components/GameCard';
import LadderTable from '@/components/LadderTable';
import { PageHeader, Panel, PanelHeader, Spinner } from '@/components/ui';

export default function GameModePage({ params }: { params: Promise<{ gamemode: string }> }) {
	const modeName = decodeURIComponent(use(params).gamemode);
	const tagsets = useTagsets();
	const [lastGame, setLastGame] = useState<GameSummary | null>(null);
	const [gamesLoaded, setGamesLoaded] = useState(false);

	const modeInfo = tagsets.find((tagset) => tagset.name === modeName);

	useEffect(() => {
		let cancelled = false;
		// The games endpoint expects tag names without spaces or commas.
		const tag = modeName.replace(/[ ,]/g, '');
		getRecentGames({ limit: 1, mode: tag })
			.then((games) => {
				if (!cancelled) {
					setLastGame(games[0] ?? null);
					setGamesLoaded(true);
				}
			})
			.catch(() => setGamesLoaded(true));
		return () => {
			cancelled = true;
		};
	}, [modeName]);

	const rules = (modeInfo?.tags ?? []).filter((tag: any) => tag.type !== 'Community');

	return (
		<div className="space-y-8">
			<PageHeader kicker="Game mode" title={modeName}>
				<Link href={`/modes/${encodeURIComponent(modeName)}/ladder`} className="btn-secondary text-sm">
					Full Ladder
				</Link>
				<Link href={`/modes/${encodeURIComponent(modeName)}/peak`} className="btn-secondary text-sm">
					ELO Peaks
				</Link>
			</PageHeader>

			<div className="grid gap-6 lg:grid-cols-[1fr_360px]">
				<Panel>
					<PanelHeader
						title="Top 10"
						action={
							<Link
								href={`/modes/${encodeURIComponent(modeName)}/ladder`}
								className="font-display text-xs font-semibold uppercase tracking-wider text-star-400 hover:text-star-300"
							>
								Full Ladder →
							</Link>
						}
					/>
					<LadderTable gameMode={modeName} limit={10} />
				</Panel>

				<div className="space-y-6">
					<div>
						<h2 className="kicker mb-3">Last Game Played</h2>
						{!gamesLoaded ? (
							<Spinner label="Loading…" />
						) : lastGame ? (
							<GameCard game={lastGame} tagsets={tagsets} />
						) : (
							<p className="text-sm text-fog-500">No games recorded for this mode yet.</p>
						)}
					</div>

					{rules.length > 0 && (
						<Panel>
							<PanelHeader title="Rules" />
							<dl className="space-y-3 px-4 py-4 text-sm">
								{rules.map((tag: any) => (
									<div key={tag.name}>
										<dt className="font-semibold text-fog-100">{tag.name}</dt>
										<dd className="text-fog-500">{tag.desc}</dd>
									</div>
								))}
							</dl>
						</Panel>
					)}
				</div>
			</div>
		</div>
	);
}
