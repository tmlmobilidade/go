import { Logger } from '@tmlmobilidade/logger';
import { initSentry } from '@tmlmobilidade/logger/server';

let STARTED = false;

export function ensureLoggerStartup() {
	if (STARTED) return;
	STARTED = true;
	Logger.init();
	initSentry().catch(() => {
		Logger.error(new Error('Error initializing Sentry:'), { message: 'Error initializing Sentry:', service: 'alerts-frontend' });
	});
	Logger.showAll('alerts-frontend');
}
