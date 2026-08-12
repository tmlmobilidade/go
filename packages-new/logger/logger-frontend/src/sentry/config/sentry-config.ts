import { withSentryConfig } from '@sentry/nextjs';
import { type NextConfig } from 'next';

/**
 * Adds Sentry build instrumentation and exposes only the same-origin tunnel path
 * to the browser. The DSN is resolved by the tunnel route at runtime.
 *
 * @param nextConfig - Next.js application config
 * @param tunnelRoute - App Router tunnel endpoint
 */
export function sentryConfig(nextConfig: NextConfig, tunnelRoute: string) {
	const nextConfigWithSentry: NextConfig = {
		...nextConfig,
		env: {
			...nextConfig.env,
			APP: process.env.APP,
			MODULE: process.env.MODULE,
			NEXT_PUBLIC_SENTRY_TUNNEL: `${nextConfig.basePath ?? ''}${tunnelRoute}`,
		},
	};

	return withSentryConfig(nextConfigWithSentry);
}
