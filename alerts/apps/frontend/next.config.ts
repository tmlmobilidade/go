/* * */

import { type NextConfig } from 'next';

/* * */

const nextConfig: NextConfig = {
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
				hostname: '*.cloudflarestorage.com',
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
			{ destination: '/alerts', permanent: true, source: '/' },
			{ destination: '/realtime/new', permanent: true, source: '/realtime' },
		];
	},
	async rewrites() {
		return [
			{
				destination: `http://localhost:52001/:path*`,
				source: '/api/:path*',
			},
		];
	},
};

/* * */

export default nextConfig;
