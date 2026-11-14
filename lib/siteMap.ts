/**
 * The site's map: one list of sections, in one order, with one set of names,
 * and under each section the pages that live in it. The landing page stands
 * the sections up as the title menu; every other page lays them down in the
 * header, where the section under the cursor opens its pages; the phone
 * drawer and the footer read the same list. Add a page here and it appears in
 * all of them. A page belongs to exactly one section.
 *
 * `under` lists the paths that belong to a section, so the header knows where
 * you are on a page several levels down; the longest match wins.
 *
 * `pages` is what the section's menu lists. A section with nothing but its
 * landing page has none and opens no menu. `preview` marks a page that runs on
 * sample data until its backend exists.
 */
export interface SitePage {
	href: string;
	label: string;
	preview?: boolean;
	/** Other paths that count as this page, when its children live elsewhere. */
	under?: readonly string[];
}

interface SectionDef {
	key: string;
	href: string;
	label: string;
	under: readonly string[];
	pages: readonly SitePage[];
}

const DEFS = [
	{
		key: 'play',
		href: '/rio-online',
		label: 'Getting started',
		under: ['/rio-online'],
		pages: [
			{ href: '/rio-online', label: 'Play online' },
			{ href: '/rio-online/tutorial', label: 'Setup tutorial' },
			{ href: '/rio-online/optimize', label: 'Optimize' },
			{ href: '/rio-online/version-history', label: 'Version history' }
		]
	},
	{ key: 'live', href: '/games/live', label: 'Watch live', under: ['/games/live'], pages: [] },
	{ key: 'pitch', href: '/games/recent', label: 'Analytics', under: ['/games'], pages: [] },
	{
		key: 'ranked',
		href: '/modes',
		label: 'Ranked',
		under: ['/modes', '/collections', '/competitions', '/leagues'],
		pages: [
			{ href: '/modes', label: 'Ladders' },
			{ href: '/collections', label: 'Leagues and events', preview: true, under: ['/competitions'] },
			{ href: '/leagues', label: 'Draft leagues', preview: true }
		]
	},
	{ key: 'players', href: '/users', label: 'Players', under: ['/users'], pages: [] },
	{
		key: 'characters',
		href: '/characters/analytics',
		label: 'Characters',
		under: ['/characters'],
		pages: [
			{ href: '/characters/analytics', label: 'Win rates' },
			{ href: '/characters', label: 'Tier lists' },
			{ href: '/characters/swing-lab', label: 'Swing Lab' }
		]
	},
	{
		key: 'communities',
		href: '/communities',
		label: 'Communities',
		under: ['/communities', '/community', '/tags', '/tag', '/tag_set'],
		pages: [
			{ href: '/communities', label: 'All communities' },
			{ href: '/tags', label: 'Game tags' }
		]
	},
	{
		key: 'tools',
		href: '/tools',
		label: 'Tools',
		under: ['/tools', '/codes', '/muddyball', '/streaming'],
		pages: [
			{ href: '/tools/pitch-calculator', label: 'Pitch calculator' },
			{ href: '/tools/running-analysis', label: 'Running analysis' },
			{ href: '/tools/mods', label: 'Game mods' },
			{ href: '/codes', label: 'Gecko codes' },
			{ href: '/muddyball', label: 'Muddyball draft board' },
			{ href: '/streaming/scoreboard', label: 'Stream scoreboards' }
		]
	}
] as const satisfies readonly SectionDef[];

export type SectionKey = (typeof DEFS)[number]['key'];
export type Section = Omit<SectionDef, 'key'> & { key: SectionKey };

export const SECTIONS: readonly Section[] = DEFS;

export const SOCIAL_LINKS = [
	{ href: 'https://discord.gg/c3r9PabfRU', label: 'Discord' },
	{ href: 'https://www.patreon.com/projectrio/posts', label: 'Patreon' },
	{ href: 'https://github.com/ProjectRio?tab=repositories', label: 'GitHub' }
] as const;

/**
 * The footer is the whole map laid flat, for anyone who would sooner read a
 * list than open menus (and for touch screens, where nothing hovers). Each
 * section with pages is a column. The three sections that are a single page
 * share one, and the two ways in that are not pages of a section, the client
 * download and the events notice, are added to Getting started.
 */
const section = (key: SectionKey) => SECTIONS.find((s) => s.key === key)!;

export const FOOTER_GROUPS: readonly { title: string; links: readonly SitePage[] }[] = [
	{
		title: section('play').label,
		links: [
			{ href: 'https://github.com/ProjectRio/ProjectRio/releases/latest', label: 'Download the client' },
			...section('play').pages,
			{ href: '/rio-online/events', label: 'Events' }
		]
	},
	{
		title: 'Games and players',
		links: [
			{ href: '/games/live', label: 'Live games' },
			{ href: '/games/recent', label: 'Recent games' },
			{ href: '/users', label: 'Player directory' }
		]
	},
	...(['ranked', 'characters', 'communities', 'tools'] as const).map((key) => ({
		title: section(key).label,
		links: section(key).pages
	}))
];

/** The section a path sits in, if any. */
export function sectionFor(pathname: string): Section | null {
	let best: Section | null = null;
	let length = 0;
	for (const section of SECTIONS) {
		for (const root of section.under) {
			if ((pathname === root || pathname.startsWith(root + '/')) && root.length > length) {
				best = section;
				length = root.length;
			}
		}
	}
	return best;
}

/** The page of a section's menu that a path is on or under, if any; the longest match wins. */
export function pageFor(section: Section, pathname: string): SitePage | null {
	let best: SitePage | null = null;
	let length = 0;
	for (const page of section.pages) {
		for (const root of [page.href, ...(page.under ?? [])]) {
			if ((pathname === root || pathname.startsWith(root + '/')) && root.length > length) {
				best = page;
				length = root.length;
			}
		}
	}
	return best;
}
