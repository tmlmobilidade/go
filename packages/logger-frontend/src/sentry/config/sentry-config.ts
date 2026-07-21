import { withSentryConfig } from '@sentry/nextjs';
import { type NextConfig } from 'next';

interface SelfHostedSentryConfig {
	destination: string
	tunnel: string
}

function getSelfHostedSentryConfig(dsn: string | undefined, nextConfig: NextConfig, tunnelRoute: string): SelfHostedSentryConfig | undefined {
	if (!dsn) return undefined;

	const dsnUrl = new URL(dsn);
	if (/^o\d+\.ingest(?:\.[a-z]{2})?\.sentry\.io$/.test(dsnUrl.hostname)) return undefined;

	const pathSegments = dsnUrl.pathname.split('/').filter(Boolean);
	const projectId = pathSegments.pop();
	if (!dsnUrl.username || !projectId) return undefined;

	const ingestPath = [...pathSegments, 'api', projectId, 'envelope'].join('/');
	const destination = new URL(`/${ingestPath}/`, dsnUrl.origin);
	destination.searchParams.set('sentry_version', '7');
	destination.searchParams.set('sentry_key', dsnUrl.username);

	return {
		destination: destination.toString(),
		tunnel: `${nextConfig.basePath ?? ''}${tunnelRoute}`,
	};
}

export function sentryConfig(nextConfig: NextConfig, tunnelRoute: string) {
	const selfHostedSentry = getSelfHostedSentryConfig(process.env.SENTRY_NEXTJS_DSN, nextConfig, tunnelRoute);
	const originalRewrites = nextConfig.rewrites;

	const nextConfigWithSentry: NextConfig = {
		...nextConfig,
		env: {
			...nextConfig.env,
			SENTRY_NEXTJS_DSN: process.env.SENTRY_NEXTJS_DSN,
			SENTRY_NEXTJS_TUNNEL: selfHostedSentry?.tunnel,
		},
		...selfHostedSentry && {
			async rewrites() {
				const tunnelRewrite = {
					destination: selfHostedSentry.destination,
					source: `${tunnelRoute}(/?)`,
				};
				const rewrites = await originalRewrites?.() ?? [];

				if (Array.isArray(rewrites)) return [tunnelRewrite, ...rewrites];

				return {
					...rewrites,
					beforeFiles: [tunnelRewrite, ...rewrites.beforeFiles],
				};
			},
		},
	};

	if (selfHostedSentry) return withSentryConfig(nextConfigWithSentry);

	return withSentryConfig(nextConfigWithSentry, { tunnelRoute });
}
