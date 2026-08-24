import { getRuntimeLogContext } from '@/logger/utils/runtime-log-context.js';
import { getSentryClient } from '@/sentry/client/go-sentry.js';
import * as Sentry from '@sentry/node';

/* * */

export async function initSentry() {
	//

	//
	// Initialize Sentry

	const client = Sentry.init({
		dsn: getSentryClient(),
		enableLogs: true,
		environment: process.env.ENVIRONMENT,
		integrations: [
			Sentry.consoleLoggingIntegration(),
			Sentry.fastifyIntegration(),
			Sentry.pinoIntegration({
				error: { handled: true, levels: ['error', 'fatal'] },
				log: { levels: [] },
			}),
		],
	});

	const runtimeContext = getRuntimeLogContext();

	Sentry.getGlobalScope().setAttributes(runtimeContext);

	return client;
}
