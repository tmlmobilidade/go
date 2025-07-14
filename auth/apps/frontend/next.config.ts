/* * */

import createMDX from '@next/mdx';
import { type NextConfig } from 'next';

/* * */

const nextConfig: NextConfig = {
	experimental: {
		optimizePackageImports: ['@tmlmobilidade/ui'],
	},
	output: 'standalone',
	pageExtensions: ['js', 'jsx', 'md', 'mdx', 'ts', 'tsx'],
	reactStrictMode: true,
	async rewrites() {
		return [
			{
				destination: `http://localhost:52000/:path*`,
				source: '/api/:path*',
			},
		];
	},
};

const withMDX = createMDX({
	extension: /\.(md|mdx)$/,
});

/* * */

export default withMDX(nextConfig);
