/* * */

import { type NextConfig } from 'next';

/* * */

const nextConfig: NextConfig = {
	basePath: '/controller',
	devIndicators: false,
	env: {
		NEXT_PUBLIC_BASE_PATH: '/controller',
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
				destination: '/controller',
				permanent: true,
				source: '/',
			},
		];
	},
};

/* * */

export default nextConfig;
