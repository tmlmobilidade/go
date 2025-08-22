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
	output: 'standalone',
	reactStrictMode: true,
	async rewrites() {
		return [
			{
				destination: `http://localhost:52000/:path*`,
				source: '/api/:path*',
			},
		];
	},
};

/* * */

export default nextConfig;
