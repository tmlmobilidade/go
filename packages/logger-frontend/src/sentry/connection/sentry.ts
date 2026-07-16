import { RuntimeLogContext, setRuntimeLogContext } from '@/logger/utils/runtime-log-context.js';
import { getSentryClient } from '@/sentry/client/go-sentry.js';
import * as Sentry from '@sentry/nextjs';

const SENTRY_START_TIMEOUT_MS = 60_000;
let SENTRY_CLIENT: ReturnType<typeof Sentry.init>;
let SENTRY_START_ATTEMPTED = false;

function reportSentryStartFailure(context: RuntimeLogContext, error: unknown) {
	globalThis.setTimeout(() => {
		console.error(new Error(`Sentry failed to start for ${context.module}/${context.app} within the timeout.`), error);
	}, SENTRY_START_TIMEOUT_MS);
}

export function initSentry(context: RuntimeLogContext) {
	//
	if (SENTRY_START_ATTEMPTED) return SENTRY_CLIENT;
	SENTRY_START_ATTEMPTED = true;

	//
	// Setup runtime context

	const runtimeContext = setRuntimeLogContext(context);

	//
	// Initialize Sentry

	try {
		SENTRY_CLIENT = Sentry.init({
			dsn: getSentryClient(),
			enableLogs: true,
			environment: process.env.NEXT_PUBLIC_ENVIRONMENT,
			integrations: [
				Sentry.consoleLoggingIntegration(),
			],
		});

		Sentry.getGlobalScope().setAttributes(runtimeContext);

		return SENTRY_CLIENT;
	} catch (error) {
		reportSentryStartFailure(runtimeContext, error);
		return undefined;
	}
}
