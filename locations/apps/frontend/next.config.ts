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
			//
			// { destination: Routes.ALERT_LIST, permanent: true, source: '/' },
		];
	},
	async rewrites() {
		return [
			{
				destination: `http://localhost:52005/:path*`,
				source: '/api/:path*',
			},
		];
	},
};

/* * */

export default nextConfig;
