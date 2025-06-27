/* * */

import { type NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

/* * */

const nextConfig: NextConfig = {
	env: {
		NEXT_PUBLIC_AUTH_URL: process.env.NODE_ENV === 'development' ? process.env.NEXT_PUBLIC_AUTH_URL : 'https://auth.sae.carrismetropolitana.pt',
		NEXT_PUBLIC_URL: process.env.NODE_ENV === 'development' ? process.env.NEXT_PUBLIC_URL : 'https://controller.sae.carrismetropolitana.pt',
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

/* * */

export default createNextIntlPlugin()(nextConfig);
