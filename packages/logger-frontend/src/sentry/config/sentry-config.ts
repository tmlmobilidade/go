import { withSentryConfig } from '@sentry/nextjs';
import { type NextConfig } from 'next';

export function sentryConfig(nextConfig: NextConfig, tunnelRoute: string) {
	const nextConfigWithSentry: NextConfig = {
		...nextConfig,
		env: {
			...nextConfig.env,
			SENTRY_NEXTJS_DSN: process.env.SENTRY_NEXTJS_DSN,
		},
	};

	return withSentryConfig(nextConfigWithSentry, {
		tunnelRoute,
	});
}
