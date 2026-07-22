import { setRuntimeLogContext } from '@/logger/utils/runtime-log-context.js';
import { getSentryClient } from '@/sentry/client/go-sentry.js';
import * as Sentry from '@sentry/nextjs';

export function initSentry(app: string, module: string) {
	const tunnel = 'document' in globalThis
		? process.env.SENTRY_NEXTJS_TUNNEL
		: undefined;

	const client = Sentry.init({
		dsn: getSentryClient(),
		enableLogs: true,
		environment: process.env.NEXT_PUBLIC_ENVIRONMENT,
		integrations: [
			Sentry.consoleLoggingIntegration(),
		],
		...tunnel && { tunnel },
	});

	const runtimeContext = setRuntimeLogContext({ app, module });
	Sentry.getGlobalScope().setAttributes(runtimeContext);

	return client;
}
