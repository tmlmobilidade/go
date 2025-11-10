/* * */

import { type NextConfig } from 'next';

/* * */

const nextConfig: NextConfig = {
	experimental: {
		optimizePackageImports: ['@tmlmobilidade/ui'],
	},
	async headers() {
		return [
			{
				headers: [
					{ key: 'Access-Control-Allow-Origin', value: '*' },
					{ key: 'Access-Control-Allow-Methods', value: 'GET, OPTIONS' },
					{ key: 'Access-Control-Allow-Headers', value: 'X-Requested-With, Content-Type' },
				],
				source: '/global/:path*', // Allow CORS for global assets (in /public/global/)
			},
		];
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
				destination: '/auth',
				permanent: true,
				source: '/',
			},
		];
	},
};

/* * */

export default nextConfig;
