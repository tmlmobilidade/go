import { withSentryConfig } from '@sentry/nextjs';
import { type NextConfig } from 'next';

export function sentryConfig(nextConfig: NextConfig, tunnelRoute: string) {
	return withSentryConfig(nextConfig, {
		tunnelRoute,
	});
}
