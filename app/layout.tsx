import type { Metadata } from 'next';
import { Barlow, Barlow_Condensed, IBM_Plex_Mono, Lilita_One } from 'next/font/google';
import Nav from '@/components/Nav';
import GamesTicker from '@/components/GamesTicker';
import Footer from '@/components/Footer';
import AppShell from '@/components/AppShell';
import { PARK_BOOT_SCRIPT } from '@/lib/parks';
import './globals.css';

const barlow = Barlow({ subsets: ['latin'], weight: ['400', '500', '600', '700'], variable: '--font-barlow' });
const barlowCondensed = Barlow_Condensed({
	subsets: ['latin'],
	weight: ['500', '600', '700'],
	variable: '--font-barlow-condensed'
});
const lilita = Lilita_One({ subsets: ['latin'], weight: '400', variable: '--font-lilita' });
const plexMono = IBM_Plex_Mono({ subsets: ['latin'], weight: ['400', '500', '600'], variable: '--font-plex-mono' });

export const metadata: Metadata = {
	title: {
		default: 'Project Rio',
		template: '%s | Project Rio'
	},
	description:
		'Project Rio — competitive Mario Superstar Baseball. Online ranked play, live games, stats, and community tournaments.',
	icons: { icon: '/favicon.png' }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<html
			lang="en"
			className={`${barlow.variable} ${barlowCondensed.variable} ${lilita.variable} ${plexMono.variable}`}
			suppressHydrationWarning
		>
			<body className="flex min-h-screen flex-col">
				{/* Applies the saved home park before first paint. */}
				<script dangerouslySetInnerHTML={{ __html: PARK_BOOT_SCRIPT }} />
				<AppShell header={<><Nav /><GamesTicker /></>} footer={<Footer />}>{children}</AppShell>
			</body>
		</html>
	);
}
