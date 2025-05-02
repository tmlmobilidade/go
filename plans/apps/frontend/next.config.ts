import type { NextConfig } from 'next';

import { Routes } from '@/lib/routes';

const nextConfig: NextConfig = {
	env: {
		NEXT_PUBLIC_AUTH_URL: process.env.NODE_ENV === 'development' ? process.env.NEXT_PUBLIC_AUTH_URL : 'https://auth.sae.carrismetropolitana.pt',
		NEXT_PUBLIC_URL: process.env.NODE_ENV === 'development' ? process.env.NEXT_PUBLIC_URL : 'https://plans.sae.carrismetropolitana.pt',
	},
	/* config options here */
	experimental: {
		optimizePackageImports: ['@tmlmobilidade/ui'],
	},
	output: 'standalone',
	reactStrictMode: true,
	async redirects() {
		return [
			//
			{ destination: Routes.PLAN_LIST, permanent: true, source: '/' },
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
