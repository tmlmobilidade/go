/* * */

import { type NextConfig } from 'next';

/* * */

const nextConfig: NextConfig = {
	basePath: '/stops',
	devIndicators: false,
	env: {
		HOSTNAME: '0.0.0.0',
		NEXT_PUBLIC_BASE_PATH: '/stops',
		NEXT_PUBLIC_ENVIRONMENT: process.env.ENVIRONMENT,
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
				destination: '/stops',
				permanent: true,
				source: '/',
			},
		];
	},
};

/* * */

export default nextConfig;
