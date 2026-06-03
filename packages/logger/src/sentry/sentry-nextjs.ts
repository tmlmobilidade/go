import * as Sentry from '@sentry/nextjs';

export async function initSentryNextjs() {
	return Sentry.init({
		dsn: 'https://19a373848ac826e9ec9c7b0759a3a21e@o4511383083679744.ingest.de.sentry.io/4511383086497872',
		enableLogs: true,
		integrations: [
			Sentry.consoleLoggingIntegration({ levels: ['log', 'warn', 'error', 'info'] }),
		],

	});
}
