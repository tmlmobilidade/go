/* * */

import { type NextConfig } from 'next';

/* * */

const nextConfig: NextConfig = {
	basePath: '/locations',
	devIndicators: false,
	env: {
		NEXT_PUBLIC_BASE_PATH: '/locations',
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
				destination: '/locations',
				permanent: true,
				source: '/',
			},
		];
	},
};

/* * */

export default nextConfig;
