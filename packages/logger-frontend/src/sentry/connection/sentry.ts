import * as Sentry from '@sentry/nextjs';

import { getSentryClient } from '../client/go-sentry.js';

export async function initSentry() {
	return Sentry.init({
		dsn: getSentryClient(),
		enableLogs: true,
		environment: process.env.ENVIRONMENT,
		integrations: [
			Sentry.consoleLoggingIntegration(),
		],
	});
}
