import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
	/* config options here */
	experimental: {
		optimizePackageImports: ['@tmlmobilidade/ui'],
	},
	output: 'standalone',
	reactStrictMode: true,
	async rewrites() {
		return [
			{
				destination: `http://localhost:${process.env.API_PORT}/api/:path*`,
				source: '/api/:path*',
			},
		];
	},
};
export default nextConfig;
