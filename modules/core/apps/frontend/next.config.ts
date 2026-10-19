/* * */

import { type NextConfig } from 'next';

/* * */

const nextConfig: NextConfig = {
	basePath: '/core',
	devIndicators: false,
	env: {
		NEXT_PUBLIC_BASE_PATH: '/core',
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
	async redirects() {
		return [
			{
				basePath: false,
				destination: '/core',
				permanent: true,
				source: '/',
			},
		];
	},
};

/* * */

export default nextConfig;
