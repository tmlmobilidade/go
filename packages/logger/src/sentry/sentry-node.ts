import * as Sentry from '@sentry/node';

export async function initSentryNode() {
	return Sentry.init({
		dsn: 'https://19a373848ac826e9ec9c7b0759a3a21e@o4511383083679744.ingest.de.sentry.io/4511383086497872',
		enableLogs: true,
		integrations: [
			Sentry.consoleLoggingIntegration({ levels: ['info', 'warn', 'error', 'debug', 'trace'] }),
			Sentry.fastifyIntegration(),
			Sentry.pinoIntegration({
				error: { handled: true, levels: ['error', 'fatal'] },
				log: { levels: ['info', 'warn', 'error', 'fatal', 'debug', 'trace'] },
			}),
		],
	});
}
