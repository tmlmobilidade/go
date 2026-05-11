/* * */

import { type NextConfig } from 'next';

/* * */

const nextConfig: NextConfig = {
	basePath: '/hub/navegante-app',
	devIndicators: false,
	env: {
		NEXT_PUBLIC_BASE_PATH: '/hub/navegante-app',
		NEXT_PUBLIC_ENVIRONMENT: process.env.ENVIRONMENT,
	},
	experimental: {
		optimizePackageImports: ['@tmlmobilidade/ui'],
	},
	async headers() {
		return [
			{
				// Match everything except paths that contain a dot (e.g., .js, .png, .xml)
				// Also ignore _next/ and api/ paths. This essentially tries to match only regular pages (HTML and RSC).
				headers: [
					{
						key: 'Cache-Control',
						value: 'public, max-age=60, stale-while-revalidate=120',
					},
				],
				source: '/((?!_next/|api/|.*\\..*).*)',
			},
			{
				// This matches static assets from the /public/assets directory. It is used to serve
				// images, fonts, and other static assets that are manually placed in the folder.
				headers: [
					{
						key: 'Cache-Control',
						value: 'public, max-age=3600, stale-while-revalidate=120',
					},
				],
				source: '/assets/:path*',
			},
		];
	},
	images: {
		remotePatterns: [
			{
				hostname: '*.oraclecloud.com',
				port: '',
				protocol: 'https',
			},
		],
	},
	output: 'standalone',
	reactStrictMode: true,
	async redirects() {
		return [
			{
				basePath: false,
				destination: '/hub',
				permanent: true,
				source: '/',
			},
		];
	},
};

/* * */

export default nextConfig;
