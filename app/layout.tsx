import type { Metadata } from 'next';
import { Inter, Rajdhani } from 'next/font/google';
import Nav from '@/components/Nav';
import GamesTicker from '@/components/GamesTicker';
import Footer from '@/components/Footer';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const rajdhani = Rajdhani({ subsets: ['latin'], weight: ['500', '600', '700'], variable: '--font-rajdhani' });

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
		<html lang="en" className={`${inter.variable} ${rajdhani.variable}`}>
			<body className="flex min-h-screen flex-col">
				<Nav />
				<GamesTicker />
				<main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">{children}</main>
				<Footer />
			</body>
		</html>
	);
}
