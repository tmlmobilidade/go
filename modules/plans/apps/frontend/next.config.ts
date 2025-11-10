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
	async rewrites() {
		return [
			{
				destination: `http://localhost:52004/:path*`,
				source: '/api/:path*',
			},
		];
	},
};

/* * */

export default nextConfig;
