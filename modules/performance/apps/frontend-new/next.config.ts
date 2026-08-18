/* * */

import { type NextConfig } from 'next';

/* * */

const nextConfig: NextConfig = {
	basePath: '/performance-new',
	devIndicators: false,
	env: {
		NEXT_PUBLIC_BASE_PATH: '/performance-new',
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
				destination: '/performance-new',
				permanent: true,
				source: '/',
			},
		];
	},
};

/* * */

export default nextConfig;
