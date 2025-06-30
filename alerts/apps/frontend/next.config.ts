import type { NextConfig } from 'next';

import { Routes } from '@/lib/routes';

const nextConfig: NextConfig = {
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
			//
			{ destination: Routes.ALERT_LIST, permanent: true, source: '/' },
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

export default nextConfig;
