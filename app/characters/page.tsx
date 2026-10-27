import Link from 'next/link';
import { characters, characterClasses, characterImage } from '@/lib/data/characters';
import { PageHeader } from '@/components/ui';
import { TierBoard } from '@/components/characters/TierBoard';

export const metadata = { title: 'Characters' };

export default function CharactersPage() {
	return (
		<div className="space-y-12">
			<div>
				<PageHeader kicker="Community rankings" title="Tier Lists" />
				<TierBoard />
			</div>

			<div>
				<p className="kicker">Roster</p>
				<h2 className="mt-1 mb-4 text-2xl uppercase">Every character</h2>
				<div className="grid grid-cols-4 gap-2 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-9">
					{Object.values(characters).map((char) => (
						<Link
							key={char}
							href={`/characters/${encodeURIComponent(char)}`}
							className="panel panel-glow flex flex-col items-center gap-1 p-2 text-center"
							title={`${char} — ${characterClasses[char]?.Class ?? ''}`}
						>
							{/* eslint-disable-next-line @next/next/no-img-element */}
							<img src={characterImage(char)} alt="" className="h-10 w-10 object-contain" />
							<span className="w-full truncate text-[11px] text-fog-300">{char}</span>
						</Link>
					))}
				</div>
			</div>
		</div>
	);
}
