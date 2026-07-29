/**
 * Utility for applying Sentry config and self-hosted tunneling to a Next.js app.
 *
 * If a self-hosted Sentry DSN is detected (i.e. not sentry.io), this injects the correct
 * /envelope destination and tunnel rewrite route for Next.js to stream events to your
 * own relay or upstream. Otherwise, standard Sentry config is applied.
 *
 * Injects SENTRY_NEXTJS_DSN and SENTRY_NEXTJS_TUNNEL into process.env for downstream use.
 */

import { withSentryConfig } from '@sentry/nextjs';
import { type NextConfig } from 'next';

/**
 * Self-hosted Sentry envelope routing configuration.
 */
interface SelfHostedSentryConfig {
	destination: string // Final Sentry envelope API URL
	tunnel: string // Local tunnel endpoint for proxying
}

/**
 * Computes Sentry proxy/tunnel destinations for self-hosted Sentry (not sentry.io).
 * Returns `undefined` for official sentry.io DSNs.
 *
 * @param dsn        - Sentry Data Source Name (process.env.SENTRY_NEXTJS_DSN)
 * @param nextConfig - The Next.js config (for basePath)
 * @param tunnelRoute- Route string for the tunnel endpoint (e.g., '/api/sentry/tunnel')
 * @returns Config for tunnel rewrites and destination, or undefined for sentry.io
 */
function getSelfHostedSentryConfig(dsn: string | undefined, nextConfig: NextConfig, tunnelRoute: string): SelfHostedSentryConfig | undefined {
	if (!dsn) return undefined;

	const dsnUrl = new URL(dsn);
	// Ignore sentry.io (cloud) DSNs, only handle self-hosted
	if (/^o\d+\.ingest(?:\.[a-z]{2})?\.sentry\.io$/.test(dsnUrl.hostname)) return undefined;

	// Extract projectId from DSN (everything after / in the path)
	const pathSegments = dsnUrl.pathname.split('/').filter(Boolean);
	const projectId = pathSegments.pop();
	if (!dsnUrl.username || !projectId) return undefined;

	// Construct /api/{projectId}/envelope endpoint
	const ingestPath = [...pathSegments, 'api', projectId, 'envelope'].join('/');
	const destination = new URL(`/${ingestPath}/`, dsnUrl.origin);
	destination.searchParams.set('sentry_version', '7');
	destination.searchParams.set('sentry_key', dsnUrl.username);

	return {
		destination: destination.toString(),
		tunnel: `${nextConfig.basePath ?? ''}${tunnelRoute}`,
	};
}

/**
 * Wraps/augments a given Next.js config with Sentry instrumentation.
 * Adds self-hosted Sentry tunneling if relevant.
 *
 * @param nextConfig  - Your Next.js config object
 * @param tunnelRoute - Tunnel endpoint path (e.g., '/api/sentry/tunnel')
 * @returns Next.js config wrapped through withSentryConfig, with rewrites/env applied
 */
export function sentryConfig(nextConfig: NextConfig, tunnelRoute: string) {
	const selfHostedSentry = getSelfHostedSentryConfig(process.env.SENTRY_NEXTJS_DSN, nextConfig, tunnelRoute);
	const originalRewrites = nextConfig.rewrites;

	const nextConfigWithSentry: NextConfig = {
		...nextConfig,
		env: {
			...nextConfig.env,
			APP: process.env.APP,
			MODULE: process.env.MODULE,
			SENTRY_NEXTJS_DSN: process.env.SENTRY_NEXTJS_DSN,
			SENTRY_NEXTJS_TUNNEL: selfHostedSentry?.tunnel,
		},
		// If this is a self-hosted DSN, prepend the envelope rewrite
		...selfHostedSentry && {
			async rewrites() {
				const tunnelRewrite = {
					destination: selfHostedSentry.destination,
					source: `${tunnelRoute}(/?)`,
				};
				const rewrites = await originalRewrites?.() ?? [];

				// Support both array and object forms for rewrites
				if (Array.isArray(rewrites)) return [tunnelRewrite, ...rewrites];

				return {
					...rewrites,
					beforeFiles: [tunnelRewrite, ...rewrites.beforeFiles],
				};
			},
		},
	};

	// Only omit tunnelRoute if using self-hosted (with custom rewrites), otherwise pass for cloud
	if (selfHostedSentry) return withSentryConfig(nextConfigWithSentry);

	return withSentryConfig(nextConfigWithSentry, { tunnelRoute });
}
