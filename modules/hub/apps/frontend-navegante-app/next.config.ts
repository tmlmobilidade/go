/* * */

import { type NextConfig } from 'next';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

/* * */

const dirname = path.dirname(fileURLToPath(import.meta.url));
const monorepoAssetsDir = path.resolve(dirname, '../../../../assets');
const naveganteBasePath = '/hub/navegante-app';

/* * */

const nextConfig: NextConfig = {
	allowedDevOrigins: ['192.168.1.152'],
	basePath: naveganteBasePath,
	devIndicators: false,
	env: {
		NEXT_PUBLIC_BASE_PATH: naveganteBasePath,
		NEXT_PUBLIC_ENVIRONMENT: process.env.ENVIRONMENT,
	},
	experimental: {
		optimizePackageImports: ['@tmlmobilidade/ui'],
	},
	async headers() {
		return [
			{
				headers: [
					{
						key: 'Cache-Control',
						value: 'public, max-age=60, stale-while-revalidate=120',
					},
				],
				source: '/((?!_next/|api/|.*\\..*).*)',
			},
			{
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
				destination: naveganteBasePath,
				permanent: true,
				source: '/',
			},
		];
	},
	turbopack: {
		resolveAlias: {
			'@assets': monorepoAssetsDir,
		},
	},
	webpack(config) {
		config.resolve.alias = {
			...config.resolve.alias,
			'@assets': monorepoAssetsDir,
		};
		return config;
	},
};

/* * */

export default nextConfig;
