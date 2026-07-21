import { setRuntimeLogContext } from '@/logger/utils/runtime-log-context.js';
import { getSentryClient } from '@/sentry/client/go-sentry.js';
import * as Sentry from '@sentry/nextjs';

export function initSentry(module: string) {
	//
	// Initialize Sentry

	const client = Sentry.init({
		dsn: getSentryClient(),
		enableLogs: true,
		environment: process.env.NEXT_PUBLIC_ENVIRONMENT,
		integrations: [
			Sentry.consoleLoggingIntegration(),
		],
		tunnel: process.env.SENTRY_NEXTJS_TUNNEL,
	});

	const runtimeContext = setRuntimeLogContext({ app: 'frontend', module });

	Sentry.getGlobalScope().setAttributes(runtimeContext);

	return client;
}
