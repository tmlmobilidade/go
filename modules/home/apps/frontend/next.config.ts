/* * */

import { type NextConfig } from 'next';

/* * */

const nextConfig: NextConfig = {
	basePath: '/home',
	devIndicators: false,
	env: {
		NEXT_PUBLIC_BASE_PATH: '/home',
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
				destination: '/home',
				permanent: true,
				source: '/',
			},
		];
	},
};

/* * */

export default nextConfig;
