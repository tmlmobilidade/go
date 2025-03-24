import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
	/* config options here */
	experimental: {
		optimizePackageImports: ['@tmlmobilidade/ui'],
	},
	output: 'standalone',
	reactStrictMode: true,
	// async rewrites() {
	// 	return [
	// 		{
	// 			destination:
	// 				process.env.NODE_ENV === 'development'
	// 					? 'http://localhost:52000/:path*'
	// 					: 'https://auth.carrismetropolitana.pt/api/:path*',
	// 			source: '/api/:path*',
	// 		},
	// 	];
	// },
};
export default nextConfig;
