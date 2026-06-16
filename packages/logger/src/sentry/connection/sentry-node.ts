import { getSentryNodeClient } from '@/sentry/client/go-sentry-node.js';
import * as Sentry from '@sentry/node';

/* * */

export async function initSentryNode() {
	//

	//
	// Initialize Sentry

	await getSentryNodeClient();

	return Sentry.init({
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
