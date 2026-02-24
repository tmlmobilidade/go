/* * */

import { type NextConfig } from 'next';

/* * */

const nextConfig: NextConfig = {
	basePath: '/ticketing',
	env: {
		NEXT_PUBLIC_BASE_PATH: '/ticketing',
	},
	experimental: {
		optimizePackageImports: ['@tmlmobilidade/ui'],
	},
	output: 'standalone',
	reactStrictMode: true,
	async redirects() {
		return [
			{
				basePath: false,
				destination: '/ticketing',
				permanent: true,
				source: '/',
			},
		];
	},
};

/* * */

export default nextConfig;
