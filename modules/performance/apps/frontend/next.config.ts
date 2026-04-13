/* * */

import { type NextConfig } from 'next';

/* * */

const nextConfig: NextConfig = {
	basePath: '/performance',
	devIndicators: false,
	env: {
		NEXT_PUBLIC_BASE_PATH: '/performance',
		NEXT_PUBLIC_ENVIRONMENT: process.env.ENVIRONMENT,
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
				destination: '/performance',
				permanent: true,
				source: '/',
			},
		];
	},
};

/* * */

export default nextConfig;
