/* * */

import { type NextConfig } from 'next';

/* * */

const nextConfig: NextConfig = {
	basePath: '/stops',
	devIndicators: false,
	env: {
		NEXT_PUBLIC_BASE_PATH: '/stops',
	},
	experimental: {
		optimizePackageImports: ['@tmlmobilidade/ui'],
	},
	output: 'standalone',
	reactStrictMode: true,
	async redirects() {
		return [
			{
				basePath: false,
				destination: '/stops',
				permanent: true,
				source: '/',
			},
		];
	},
};

/* * */

export default nextConfig;
