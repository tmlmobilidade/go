/* * */

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
			{ destination: '/performance', permanent: true, source: '/' },
		];
	},
	async rewrites() {
		return [
			{
				destination: `http://localhost:52006/:path*`,
				source: '/api/:path*',
			},
		];
	},
};

/* * */

export default nextConfig;
