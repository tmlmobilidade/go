import { Logger } from '@tmlmobilidade/logger';
import { initSentry } from '@tmlmobilidade/logger/server';

/* * */

let LOGGER_STARTED = false;

export async function ensureLoggerStartup() {
	if (LOGGER_STARTED) return;

	Logger.init();
	await initSentry().then(() => {
		Logger.showAll({ app: 'frontend', message: 'Alerts frontend initialized', module: 'alerts', severity: 'info' });
	}).catch((error) => {
		Logger.error(error instanceof Error ? error : new Error(String(error)), {
			message: 'Error initializing Sentry',
			service: 'alerts-frontend',
		});
	});
	LOGGER_STARTED = true;
}
