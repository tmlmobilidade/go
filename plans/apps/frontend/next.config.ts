/* * */

import { Routes } from '@/lib/routes';
import { type NextConfig } from 'next';

/* * */

const nextConfig: NextConfig = {
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

/* * */

export default nextConfig;
