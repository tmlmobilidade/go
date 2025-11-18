/* * */

import { type NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

/* * */

const nextConfig: NextConfig = {
	basePath: '/controller',
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

export default createNextIntlPlugin()(nextConfig);
