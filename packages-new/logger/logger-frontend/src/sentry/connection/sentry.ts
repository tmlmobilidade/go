import { getRuntimeLogContext, type RuntimeLogContext, setRuntimeLogContext } from '@/logger/utils/runtime-log-context.js';
import { getSentryClientConfig } from '@/sentry/client/go-sentry.js';
import * as Sentry from '@sentry/nextjs';

let SENTRY_CLIENT_PROMISE: Promise<ReturnType<typeof Sentry.init> | undefined> | undefined;

export function initSentry(context?: RuntimeLogContext): Promise<ReturnType<typeof Sentry.init> | undefined> {
	const runtimeContext = context
		? setRuntimeLogContext(context)
		: getRuntimeLogContext();
	Sentry.getGlobalScope().setAttributes(runtimeContext);

	SENTRY_CLIENT_PROMISE ??= initializeSentry();
	return SENTRY_CLIENT_PROMISE;
}

async function initializeSentry(): Promise<ReturnType<typeof Sentry.init> | undefined> {
	const config = await getSentryClientConfig();
	if (!config) return undefined;

	return Sentry.init({
		dsn: config.dsn,
		enableLogs: true,
		environment: process.env.NEXT_PUBLIC_ENVIRONMENT,
		integrations: [
			Sentry.consoleLoggingIntegration(),
		],
		...config.tunnel && { tunnel: config.tunnel },
	});
}
