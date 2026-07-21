/* * */

import { sentryConfig } from '@tmlmobilidade/logger-logger-frontend';
import { type NextConfig } from 'next';

/* * */

const nextConfig: NextConfig = {
	basePath: '/plans',
	devIndicators: false,
	env: {
		NEXT_PUBLIC_BASE_PATH: '/plans',
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
				destination: '/plans',
				permanent: true,
				source: '/',
			},
		];
	},
};

/* * */

export default sentryConfig(nextConfig, '/sentry-tunnel');
