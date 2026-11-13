import { SECTIONS, type SectionKey } from '@/lib/siteMap';
import {
	CharactersBoard,
	CommunitiesBoard,
	EveryPitchBoard,
	LiveBoard,
	PlayBoard,
	RankedBoard,
	type BoardData
} from './boards';

/**
 * The landing page's menu: the site's sections (lib/siteMap.ts) that have a
 * board to show, in the site's order and under the site's names. A board
 * proves its row from live data. `fold` says how much of the stadium the row
 * hands back: 'bug' folds the board down to a scorebug over a game on the
 * field, 'bare' drops the board's box altogether and leaves its controls
 * standing over the park (the Ranked ladder flies as flags over the outfield wall instead).
 * Below the desktop breakpoint there is no park and every board is a full card.
 */
export type Fold = 'bug' | 'bare' | 'none';

const BOARDS: Partial<Record<SectionKey, { Board: (props: BoardData) => React.ReactNode; fold: Fold }>> = {
	play: { Board: PlayBoard, fold: 'none' },
	live: { Board: LiveBoard, fold: 'bug' },
	pitch: { Board: EveryPitchBoard, fold: 'bug' },
	ranked: { Board: RankedBoard, fold: 'bare' },
	characters: { Board: CharactersBoard, fold: 'none' },
	communities: { Board: CommunitiesBoard, fold: 'none' }
};

export const MENU_ITEMS = SECTIONS.flatMap((section) => {
	const board = BOARDS[section.key];
	return board ? [{ ...section, ...board }] : [];
});
