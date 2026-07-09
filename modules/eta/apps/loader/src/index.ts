/* * */

import { loadEta } from '@tmlmobilidade/go-eta-pckg-loader';
import { Logger } from '@tmlmobilidade/logger-backend';
import { initSentry } from '@tmlmobilidade/logger-backend';
import { runOnInterval } from '@tmlmobilidade/utils';

import { AppConfig } from './config.js';

/* * */

await (async function main() {
	//

	//
	// Initialize Sentry

	try {
		await initSentry();
		Logger.startLogs({ app: 'loader', message: 'Sentry ETA Loader initialized', module: 'eta', severity: 'info' });
	} catch (error) {
		Logger.error({ error, message: 'Error initializing Sentry ETA Loader' });
	}

	await runOnInterval(() => loadEta(AppConfig), { intervalMs: AppConfig.syncInterval });
})();
