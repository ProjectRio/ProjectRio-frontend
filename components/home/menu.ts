import {
	CommunitiesBoard,
	LiveBoard,
	PlayersBoard,
	RankedBoard,
	RecentBoard,
	ToolsBoard,
	type BoardData
} from './boards';

/**
 * The landing page's menu, in one place: each row is a destination and the
 * board that previews it. Every layout reads this list, so changing what the
 * front door offers is an edit here and nowhere else.
 */
export const MENU_ITEMS = [
	{ key: 'live', href: '/games/live', label: 'Live games', Board: LiveBoard },
	{ key: 'ranked', href: '/modes', label: 'Ranked ladders', Board: RankedBoard },
	{ key: 'recent', href: '/games/recent', label: 'Recent games', Board: RecentBoard },
	{ key: 'players', href: '/users', label: 'Players', Board: PlayersBoard },
	{ key: 'communities', href: '/communities', label: 'Communities', Board: CommunitiesBoard },
	{ key: 'tools', href: '/tools', label: 'Tools', Board: ToolsBoard }
] as const satisfies readonly {
	key: string;
	href: string;
	label: string;
	Board: (props: BoardData) => React.ReactNode;
}[];

export type MenuKey = (typeof MENU_ITEMS)[number]['key'];
