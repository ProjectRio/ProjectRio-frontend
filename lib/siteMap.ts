/**
 * The site's sections: one list, in one order, with one set of names. The
 * landing page stands it up as the title menu, every other page lays it down
 * in the header with the selection bar on the section you are in, and the
 * phone drawer reads from it too. Change a name or the order here and it
 * changes everywhere.
 *
 * `under` lists the paths that belong to a section, so the header knows where
 * you are on a page several levels down; the longest match wins.
 */
export const SECTIONS = [
	{ key: 'play', href: '/rio-online', label: 'Getting started', under: ['/rio-online'] },
	{ key: 'live', href: '/games/live', label: 'Watch live', under: ['/games/live'] },
	{ key: 'pitch', href: '/games/recent', label: 'Analytics', under: ['/games'] },
	{ key: 'ranked', href: '/modes', label: 'Ranked', under: ['/modes'] },
	{ key: 'players', href: '/users', label: 'Players', under: ['/users'] },
	{ key: 'characters', href: '/characters/analytics', label: 'Characters', under: ['/characters'] },
	{ key: 'communities', href: '/communities', label: 'Communities', under: ['/communities', '/community'] },
	{ key: 'tools', href: '/tools', label: 'Tools', under: ['/tools', '/codes', '/muddyball', '/streaming'] }
] as const;

export type Section = (typeof SECTIONS)[number];
export type SectionKey = Section['key'];

export const SOCIAL_LINKS = [
	{ href: 'https://discord.gg/c3r9PabfRU', label: 'Discord' },
	{ href: 'https://www.patreon.com/projectrio/posts', label: 'Patreon' },
	{ href: 'https://github.com/ProjectRio?tab=repositories', label: 'GitHub' }
] as const;

/**
 * The footer does a different job from the header: it lists the pages one
 * level down that no menu shows, and the ways out to the community. A section
 * the header already links has no place here. The one exception is the player
 * directory, because the landing page has no header links and its title menu
 * has no Players row yet; drop it from here when it does.
 */
export const FOOTER_GROUPS = [
	{
		title: 'Stats and tools',
		links: [
			{ href: '/users', label: 'Player directory' },
			{ href: '/characters/swing-lab', label: 'Swing Lab' },
			{ href: '/tools/pitch-calculator', label: 'Pitch calculator' },
			{ href: '/codes', label: 'Gecko codes' },
			{ href: '/streaming/scoreboard', label: 'Stream scoreboards' }
		]
	},
	{
		title: 'Play online',
		links: [
			{ href: 'https://github.com/ProjectRio/ProjectRio/releases/latest', label: 'Download the client' },
			{ href: '/rio-online/tutorial', label: 'Setup tutorial' },
			{ href: '/rio-online/optimize', label: 'Optimize' },
			{ href: '/rio-online/version-history', label: 'Version history' }
		]
	},
	{ title: 'Community', links: SOCIAL_LINKS }
] as const;

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
