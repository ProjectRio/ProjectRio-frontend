import GCButton from '@/components/GCButton';
import type { BoardData } from './boards';
import { MENU_ITEMS } from './menu';

export function ControlsHint({ className = '' }: { className?: string }) {
	return (
		<p
			className={`hidden items-center gap-4 font-display text-sm font-semibold uppercase tracking-[0.12em] text-fog-500 lg:flex ${className}`}
		>
			<span className="flex items-center gap-1.5">
				<GCButton button="stick" size={18} /> Move
			</span>
			<span className="flex items-center gap-1.5">
				<GCButton button="a" size={18} /> Select
			</span>
		</p>
	);
}

/**
 * Mario Stadium, laid back behind the board like the game's HUD over the
 * field. It hangs from a .title-stage with its near edge --park-peek below
 * the stage's bottom edge; the page reserves that much room under the board,
 * so the whole park is always on the page.
 */
export function Park() {
	return (
		// eslint-disable-next-line @next/next/no-img-element
		<img src="/images/parks/mario.svg" alt="" className="title-park hidden lg:block" />
	);
}

/** The board: the one piece of chrome on the page, showing the lit row. */
export function BoardStage({ index, data }: { index: number; data: BoardData }) {
	const item = MENU_ITEMS[index];
	const Board = item.Board;
	return (
		<section
			aria-label={item.label}
			aria-live="polite"
			className="title-board relative flex flex-col p-4 sm:p-5 lg:h-[var(--board-h)]"
		>
			<div key={item.key} className="route-in flex min-h-0 flex-1 flex-col">
				<Board {...data} />
			</div>
		</section>
	);
}
