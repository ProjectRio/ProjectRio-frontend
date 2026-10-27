import Link from 'next/link';
import { notFound } from 'next/navigation';
import { characters, characterClasses, characterImage } from '@/lib/data/characters';
import { attributesFor } from '@/lib/data/characterAttributes';
import {
	writeupFor,
	tierPlacements,
	tierHue,
	simplifiedName,
	variantsOf
} from '@/lib/data/characterContent';
import { Badge } from '@/components/ui';
import { AttributeCard } from '@/components/characters/AttributeCard';
import { UsagePanel } from '@/components/characters/UsagePanel';
import { TrajectoryLab } from '@/components/characters/TrajectoryLab';
import { LandingLab } from '@/components/characters/LandingLab';

export function generateStaticParams() {
	return Object.values(characters).map((char) => ({ char }));
}

const CLASS_BADGE: { [key: string]: 'red' | 'gold' | 'gray' | 'green' } = {
	Power: 'red',
	Technique: 'gold',
	Speed: 'green',
	Balance: 'gray'
};

export default async function CharacterPage({ params }: { params: Promise<{ char: string }> }) {
	const char = decodeURIComponent((await params).char);
	const info = characterClasses[char];
	if (!info) notFound();

	const attrs = attributesFor(char);
	const writeup = writeupFor(char);
	const placements = tierPlacements(char);
	const simplified = simplifiedName(char);
	const variants = variantsOf(simplified).filter((name) => name !== char);
	const heroHue = placements.length > 0 ? tierHue(placements[0].tier) : '#e60012';

	return (
		<div className="space-y-8">
			{/* Hero */}
			<section className="grid gap-6 lg:grid-cols-[300px_1fr]">
				<div
					className="panel relative flex flex-col items-center justify-center gap-3 p-8"
					style={{
						backgroundImage: `radial-gradient(ellipse 70% 60% at 50% 35%, ${heroHue}1f, transparent)`
					}}
				>
					{/* eslint-disable-next-line @next/next/no-img-element */}
					<img src={characterImage(char)} alt={char} className="h-36 w-36 object-contain drop-shadow-[0_8px_24px_rgba(0,0,0,.6)]" />
					<div className="flex flex-wrap items-center justify-center gap-2">
						<Badge color={CLASS_BADGE[info.Class]}>{info.Class}</Badge>
						{attrs?.['Can Be Captain'] === 1 && <Badge color="gold">Captain</Badge>}
					</div>
				</div>

				<div className="flex flex-col justify-center gap-4">
					<div>
						<p className="kicker">Character dashboard</p>
						<h1 className="mt-1 text-5xl uppercase">{char}</h1>
					</div>

					{placements.length > 0 && (
						<div className="flex flex-wrap gap-2">
							{placements.map((placement) => {
								const hue = tierHue(placement.tier);
								return (
									<span
										key={placement.list.id}
										className="inline-flex items-center gap-2 rounded border px-3 py-1.5 font-display text-sm font-bold uppercase tracking-wider"
										style={{ borderColor: `${hue}55`, backgroundColor: `${hue}14`, color: hue }}
									>
										{placement.list.title}
										<span className="text-fog-100">
											{placement.tier} · #{placement.rank}
										</span>
									</span>
								);
							})}
						</div>
					)}

					{writeup && (
						<div className="max-w-2xl">
							<p className="text-[15px] leading-relaxed text-fog-300">{writeup.text}</p>
							<p className="mt-2 font-display text-xs font-semibold uppercase tracking-widest text-fog-500">
								— {writeup.author ?? 'Community scouting report'}
							</p>
						</div>
					)}

					<div className="flex flex-wrap items-center gap-3">
						<Link href={`/characters/${encodeURIComponent(char)}/batting`} className="btn-primary text-sm">
							Batting stats
						</Link>
						<Link href={`/characters/${encodeURIComponent(char)}/pitching`} className="btn-secondary text-sm">
							Pitching stats
						</Link>
						<Link href="/characters" className="text-sm text-fog-500 transition-colors hover:text-fog-300">
							← Tier lists
						</Link>
					</div>

					{variants.length > 0 && (
						<div className="flex items-center gap-2">
							<span className="text-xs text-fog-500">Also plays as</span>
							{variants.map((variant) => (
								<Link
									key={variant}
									href={`/characters/${encodeURIComponent(variant)}`}
									title={variant}
									className="rounded-lg border border-night-700 bg-night-900 p-1 transition-colors hover:border-rio-500/50"
								>
									{/* eslint-disable-next-line @next/next/no-img-element */}
									<img src={characterImage(variant)} alt={variant} className="h-8 w-8 object-contain" />
								</Link>
							))}
						</div>
					)}
				</div>
			</section>

			{attrs && <AttributeCard attrs={attrs} />}

			<TrajectoryLab characterName={char} />

			<LandingLab characterName={char} />

			<UsagePanel characterName={char} />
		</div>
	);
}
