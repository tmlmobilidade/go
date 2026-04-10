/* * */

import { type NextConfig } from 'next';

/* * */

const nextConfig: NextConfig = {
	basePath: '/plans',
	devIndicators: false,
	env: {
		NEXT_PUBLIC_BASE_PATH: '/plans',
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
				destination: '/plans',
				permanent: true,
				source: '/',
			},
		];
	},
};

/* * */

export default nextConfig;
