import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
	/* config options here */
	env: {
		NEXT_PUBLIC_AUTH_URL: process.env.NODE_ENV === 'development' ? process.env.NEXT_PUBLIC_AUTH_URL : 'https://auth.sae.carrismetropolitana.pt',
		NEXT_PUBLIC_URL: process.env.NODE_ENV === 'development' ? process.env.NEXT_PUBLIC_URL : 'https://auth.sae.carrismetropolitana.pt',
	},
	experimental: {
		optimizePackageImports: ['@tmlmobilidade/ui'],
	},
	output: 'standalone',
	reactStrictMode: true,
	async rewrites() {
		return [
			{
				destination: `http://localhost:${process.env.API_PORT}/:path*`,
				source: '/api/:path*',
			},
		];
	},
};
export default nextConfig;
