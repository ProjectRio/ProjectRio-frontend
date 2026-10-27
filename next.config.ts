import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
	outputFileTracingRoot: import.meta.dirname,
	images: {
		// Cloudflare Workers does not run the default Next.js image optimizer.
		unoptimized: true
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

// Enable calling Cloudflare bindings during `next dev`.
import { initOpenNextCloudflareForDev } from '@opennextjs/cloudflare';
initOpenNextCloudflareForDev();
