import type { NextConfig } from 'next';

import { Routes } from '@/lib/routes';

const nextConfig: NextConfig = {
	env: {
		NEXT_PUBLIC_AUTH_URL: process.env.NODE_ENV === 'development' ? process.env.NEXT_PUBLIC_AUTH_URL : 'https://auth.carrismetropolitana.pt',
		NEXT_PUBLIC_URL: process.env.NODE_ENV === 'development' ? process.env.NEXT_PUBLIC_URL : 'https://alerts.carrismetropolitana.pt',
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
				destination: `http://localhost:${process.env.API_PORT}/:path*`,
				source: '/api/:path*',
			},
		];
	},
};

export default nextConfig;
