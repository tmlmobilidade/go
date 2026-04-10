/* * */

import { type NextConfig } from 'next';

/* * */

const nextConfig: NextConfig = {
	basePath: '/dates',
	devIndicators: false,
	env: {
		NEXT_PUBLIC_BASE_PATH: '/dates',
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
				destination: '/dates',
				permanent: true,
				source: '/',
			},
		];
	},
};

/* * */

export default nextConfig;
