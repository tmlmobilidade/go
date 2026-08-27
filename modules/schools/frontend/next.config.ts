/* * */

import { type NextConfig } from 'next';

/* * */

const nextConfig: NextConfig = {
	basePath: '/schools',
	devIndicators: false,
	env: {
		NEXT_PUBLIC_BASE_PATH: '/schools',
		NEXT_PUBLIC_ENVIRONMENT: process.env.ENVIRONMENT,
	},
	experimental: {
		optimizePackageImports: ['@tmlmobilidade/ui'],
	},
	images: {
		remotePatterns: [
			{
				hostname: '*.carrismetropolitana.pt',
				port: '',
				protocol: 'https',
			},
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
				destination: '/schools',
				permanent: true,
				source: '/',
			},
		];
	},
};

/* * */

export default nextConfig;
