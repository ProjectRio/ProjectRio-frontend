'use client';

// Every contact in the current selection, drawn at once in the Rio Visualizer's
// stadium. This is the payoff view: pick a frame and a stick hold in the matrix
// and the ball flights that combination actually produced light up together, so
// the spray and the launch shape are visible as a population rather than as a
// table of numbers.

import { useEffect, useMemo, useRef, useState } from 'react';
import { VisualizerScene, fetchStadium } from '@/components/visualizer/scene';
import { getTheme3D } from '@/components/visualizer/stadiumThemes';
import { trajectoryPoints } from '@/lib/landingTrajectory';
import { RESULT_COLORS, type ResultCategory } from '@/lib/gameEvents';
import type { LandingRow } from '@/lib/landingData';
import { Spinner } from '@/components/ui';

const MARIO_STADIUM = 0;

// Drawing is two draw calls regardless of count, but building the geometry is
// linear — cap it so a whole-season selection stays instant.
const MAX_ARCS = 1200;

const LEGEND: { category: ResultCategory; label: string }[] = [
	{ category: 'hr', label: 'Home run' },
	{ category: 'hit', label: 'Hit' },
	{ category: 'error', label: 'Error' },
	{ category: 'out', label: 'Out' },
	{ category: 'other', label: 'Foul' }
];

function categoryOf(row: LandingRow): ResultCategory {
	// result 0 means the at-bat continued: the ball went foul.
	return row.result === 0 ? 'other' : row.category;
}

export default function TrajectoryView({ rows }: { rows: LandingRow[] }) {
	const containerRef = useRef<HTMLDivElement>(null);
	const sceneRef = useRef<VisualizerScene | null>(null);
	const [ready, setReady] = useState(false);
	const [hidden, setHidden] = useState<Set<ResultCategory>>(new Set());

	useEffect(() => {
		if (!containerRef.current) return;
		const scene = new VisualizerScene(containerRef.current, {
			cameraPreset: 'broadcast',
			fielderMarkers: false,
			trail: false
		});
		sceneRef.current = scene;

		let cancelled = false;
		fetchStadium(MARIO_STADIUM)
			.then((json) => {
				if (cancelled) return;
				scene.buildStadium(json, getTheme3D(MARIO_STADIUM));
				// Rings are built on the transition, so flip the flag rather than
				// passing it to the constructor.
				scene.setLook({ distanceRings: true });
				setReady(true);
			})
			.catch(() => setReady(false));

		return () => {
			cancelled = true;
			scene.dispose();
			sceneRef.current = null;
		};
	}, []);

	const shown = useMemo(
		() => rows.filter((row) => !hidden.has(categoryOf(row))),
		[rows, hidden]
	);

	const arcs = useMemo(() => {
		const source = shown.length > MAX_ARCS ? shown.slice(-MAX_ARCS) : shown;
		return source.map((row) => ({
			points: trajectoryPoints(row, 20),
			color: Number.parseInt(RESULT_COLORS[categoryOf(row)].slice(1), 16)
		}));
	}, [shown]);

	useEffect(() => {
		if (!sceneRef.current || !ready) return;
		sceneRef.current.buildTrajectoryBundle(arcs, {
			// Thin out the ink when hundreds of flights overlap.
			opacity: arcs.length > 400 ? 0.28 : arcs.length > 120 ? 0.4 : 0.6
		});
	}, [arcs, ready]);

	const counts = useMemo(() => {
		const tally = new Map<ResultCategory, number>();
		for (const row of rows) {
			const category = categoryOf(row);
			tally.set(category, (tally.get(category) ?? 0) + 1);
		}
		return tally;
	}, [rows]);

	return (
		<div>
			<div ref={containerRef} className="relative min-h-[24rem] lg:min-h-[30rem]">
				{!ready && (
					<div className="absolute inset-0 flex items-center justify-center">
						<Spinner label="Loading stadium…" />
					</div>
				)}
			</div>
			<div className="flex flex-wrap items-center gap-3 border-t border-night-700 px-4 py-2 text-xs text-fog-300">
				{LEGEND.map(({ category, label }) => {
					const off = hidden.has(category);
					return (
						<button
							key={category}
							type="button"
							onClick={() =>
								setHidden((prev) => {
									const next = new Set(prev);
									if (next.has(category)) next.delete(category);
									else next.add(category);
									return next;
								})
							}
							className={`inline-flex items-center gap-1.5 transition-opacity ${
								off ? 'opacity-35' : ''
							}`}
						>
							<span
								className="h-2.5 w-2.5 rounded-full"
								style={{ backgroundColor: RESULT_COLORS[category] }}
							/>
							{label} ({counts.get(category) ?? 0})
						</button>
					);
				})}
				{shown.length > MAX_ARCS && (
					<span className="text-fog-500">showing the latest {MAX_ARCS.toLocaleString()}</span>
				)}
			</div>
		</div>
	);
}
