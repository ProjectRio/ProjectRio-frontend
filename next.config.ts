import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
	outputFileTracingRoot: import.meta.dirname,
	images: {
		// Cloudflare Workers does not run the default Next.js image optimizer.
		unoptimized: true
	},
	eslint: {
		// lib/mssb contains verbatim decompiled game code that fails stylistic rules.
		ignoreDuringBuilds: true
	},
	async redirects() {
		// Routes carried over from the SvelteKit site.
		return [
			{ source: '/modes/recent', destination: '/games/recent', permanent: true },
			{ source: '/modes/live', destination: '/games/live', permanent: true },
			{ source: '/modes/all', destination: '/modes', permanent: true },
			{ source: '/visualizations/pitchCalculator', destination: '/tools/pitch-calculator', permanent: true }
		];
	}
};

export default nextConfig;

// Enable calling Cloudflare bindings during `next dev`. `CF_DEV_BINDINGS=0`
// skips the workerd shim (npm run dev:plain) for sandboxes where it can't
// write its state — this app uses no bindings in development.
import { initOpenNextCloudflareForDev } from '@opennextjs/cloudflare';
if (process.env.CF_DEV_BINDINGS !== '0') initOpenNextCloudflareForDev();
