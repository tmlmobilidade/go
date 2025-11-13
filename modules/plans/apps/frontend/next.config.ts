/* * */

import { type NextConfig } from 'next';

/* * */

const nextConfig: NextConfig = {
	basePath: '/plans',
	experimental: {
		optimizePackageImports: ['@tmlmobilidade/ui'],
	},
	output: 'standalone',
	reactStrictMode: true,
	async redirects() {
		return [
			{
				basePath: false,
				destination: '/plans',
				permanent: true,
				source: '/',
			},
		];
	},
};

/* * */

export default nextConfig;
