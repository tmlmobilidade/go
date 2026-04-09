/* * */

import { type NextConfig } from 'next';

/* * */

const nextConfig: NextConfig = {
	basePath: '/exporter',
	devIndicators: false,
	env: {
		NEXT_PUBLIC_BASE_PATH: '/exporter',
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
				destination: '/exporter',
				permanent: true,
				source: '/',
			},
		];
	},
};

/* * */

export default nextConfig;
