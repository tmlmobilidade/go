/* * */

import { type NextConfig } from 'next';

/* * */

const nextConfig: NextConfig = {
	basePath: '/auth',
	devIndicators: false,
	env: {
		NEXT_PUBLIC_BASE_PATH: '/auth',
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
				destination: '/auth',
				permanent: true,
				source: '/',
			},
		];
	},
};

/* * */

export default nextConfig;
