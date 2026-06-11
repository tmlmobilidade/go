import * as Sentry from '@sentry/nextjs';

export async function initSentryNextjs() {
	return Sentry.init({
		dsn: 'https://ba6179b7367fcd7fb19e0a3eaf9a4ded@o4511383083679744.ingest.de.sentry.io/4511500881559632',
		enableLogs: true,
		integrations: [
			Sentry.consoleLoggingIntegration(),
		],
	});
}
