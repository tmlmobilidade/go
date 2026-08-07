import { getSentryClient } from '@/sentry/client/go-sentry-node.js';
import * as Sentry from '@sentry/node';

/* * */

let SENTRY_NODE_INITIALIZATION: null | Promise<ReturnType<typeof Sentry.init>> = null;

/* * */

export async function initSentryNode() {
	//

	if (!SENTRY_NODE_INITIALIZATION) {
		SENTRY_NODE_INITIALIZATION = Promise.resolve().then(() => {
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
		});
	}

	const initialization = SENTRY_NODE_INITIALIZATION;
	try {
		return await initialization;
	} catch (error) {
		if (SENTRY_NODE_INITIALIZATION === initialization) SENTRY_NODE_INITIALIZATION = null;
		throw error;
	}
}
