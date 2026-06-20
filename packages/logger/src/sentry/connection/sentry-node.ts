import { getSentryClient } from '@/sentry/client/go-sentry-node.js';
import * as Sentry from '@sentry/node';

/* * */

export async function initSentryNode() {
	//

	//
	// Initialize Sentry

	const dsn = getSentryClient();

	return Sentry.init({
		dsn,
		enableLogs: true,
		integrations: [
			Sentry.consoleLoggingIntegration(),
			Sentry.fastifyIntegration(),
			Sentry.pinoIntegration({
				error: { handled: true, levels: ['error', 'fatal'] },
				log: { levels: [] },
			}),
		],
	});
}
