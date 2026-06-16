import * as Sentry from '@sentry/node';

/* * */

export async function initSentryNode() {
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
