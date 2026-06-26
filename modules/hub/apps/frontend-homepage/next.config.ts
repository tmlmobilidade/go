/* * */

import { type NextConfig } from 'next';

/* * */

const nextConfig: NextConfig = {
	basePath: '/hub',
	devIndicators: false,
	env: {
		NEXT_PUBLIC_BASE_PATH: '/hub',
		NEXT_PUBLIC_ENVIRONMENT: process.env.ENVIRONMENT,
	},
	experimental: {
		optimizePackageImports: ['@tmlmobilidade/ui'],
	},
	images: {
		remotePatterns: [
			{
				hostname: '*.oraclecloud.com',
				port: '',
				protocol: 'https',
			},
		],
	},
	output: 'standalone',
	reactStrictMode: true,
};

/* * */

export default nextConfig;
