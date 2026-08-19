import { getRuntimeLogContext, type RuntimeLogContext, setRuntimeLogContext } from '@/logger/utils/runtime-log-context.js';
import { getSentryClientConfig } from '@/sentry/client/go-sentry.js';
import * as Sentry from '@sentry/nextjs';

import { discardConsoleLogBridge, enableConsoleLogBridge, installConsoleLogBridge } from './console-logs.js';

let SENTRY_CLIENT_PROMISE: Promise<ReturnType<typeof Sentry.init> | undefined> | undefined;

export function initSentry(context?: RuntimeLogContext): Promise<ReturnType<typeof Sentry.init> | undefined> {
	const isBrowser = 'document' in globalThis;
	if (isBrowser) installConsoleLogBridge();

	const runtimeContext = context
		? setRuntimeLogContext(context)
		: getRuntimeLogContext();
	Sentry.getGlobalScope().setAttributes(runtimeContext);

	SENTRY_CLIENT_PROMISE ??= initializeSentry(isBrowser);
	return SENTRY_CLIENT_PROMISE;
}

async function initializeSentry(isBrowser: boolean): Promise<ReturnType<typeof Sentry.init> | undefined> {
	const config = await getSentryClientConfig();
	if (!config) {
		if (isBrowser) discardConsoleLogBridge();
		return undefined;
	}

	const client = Sentry.init({
		dsn: config.dsn,
		enableLogs: true,
		environment: process.env.NEXT_PUBLIC_ENVIRONMENT,
		integrations: isBrowser ? [] : [Sentry.consoleLoggingIntegration()],
		...config.tunnel && { tunnel: config.tunnel },
	});

	if (isBrowser) enableConsoleLogBridge();

	return client;
}
