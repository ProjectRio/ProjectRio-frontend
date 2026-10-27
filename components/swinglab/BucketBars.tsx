'use client';

// Ranked breakdown of one facet — frames, stick holds, swing types. Bars are
// magnitude, so they share the matrix's single hue; the sample column sits
// beside every bar because the ranking is only worth as much as the n behind it.

import { formatBa, type RankMetric, type SwingBucket } from '@/lib/landingData';

export default function BucketBars<K>({
	buckets,
	metric,
	minAb,
	selectedKey,
	onSelect
}: {
	buckets: SwingBucket<K>[];
	metric: RankMetric;
	minAb: number;
	selectedKey?: string | null;
	onSelect?: (key: K | null) => void;
}) {
	const qualified = buckets.filter((bucket) => bucket.ab >= minAb);
	const max = Math.max(0.001, ...qualified.map((bucket) => bucket[metric] ?? 0));

	if (buckets.length === 0) {
		return <p className="px-4 py-6 text-center text-xs text-fog-500">No contacts here.</p>;
	}

	return (
		<div className="space-y-1 p-4">
			{buckets.map((bucket) => {
				const value = bucket[metric];
				const thin = bucket.ab < minAb;
				const selected = selectedKey != null && String(bucket.key) === selectedKey;
				return (
					<button
						key={String(bucket.key)}
						type="button"
						onClick={() => onSelect?.(selected ? null : bucket.key)}
						title={`${bucket.label}
${bucket.contacts} contacts · ${bucket.ab} AB
BA ${formatBa(bucket.ba)} · SLG ${formatBa(bucket.slg)}
${Math.round((bucket.foulRate ?? 0) * 100)}% fouled${thin ? `\nbelow the ${minAb}-AB minimum` : ''}`}
						className={`flex w-full items-center gap-2 rounded border px-2 py-1.5 text-left transition-colors ${
							selected
								? 'border-star-500/50 bg-star-500/10'
								: 'border-transparent hover:border-night-600'
						} ${onSelect ? '' : 'cursor-default'}`}
					>
						<span className="w-24 shrink-0 truncate text-xs text-fog-100">{bucket.label}</span>
						<div className="h-2 flex-1 overflow-hidden rounded-full bg-night-700">
							<div
								className="h-full rounded-full transition-all"
								style={{
									width: `${Math.min(100, ((value ?? 0) / max) * 100)}%`,
									backgroundColor: thin ? '#6b2230' : '#e64f58'
								}}
							/>
						</div>
						<span
							className={`w-10 shrink-0 text-right font-display text-xs font-bold tabular-nums ${
								thin ? 'text-fog-500' : 'text-fog-100'
							}`}
						>
							{formatBa(value)}
						</span>
						<span className="w-12 shrink-0 text-right text-[10px] tabular-nums text-fog-500">
							{bucket.ab} AB
						</span>
					</button>
				);
			})}
		</div>
	);
}
