/* * */

import { loadEta } from '@tmlmobilidade/go-eta-pckg-loader';
import { Logger } from '@tmlmobilidade/logger';
import { initSentryNode } from '@tmlmobilidade/logger/sentry/node';
import { runOnInterval } from '@tmlmobilidade/utils';

import { AppConfig } from './config.js';

/* * */

await (async function main() {
	//

	try {
		await initSentryNode();
		Logger.info('');
		Logger.logsNode({ app: 'loader', message: 'Sentry ETA Loader initialized', module: 'eta', severity: 'info' });
	} catch {
		Logger.error('Error initializing Sentry ETA Loader');
	}

	await runOnInterval(() => loadEta(AppConfig), { intervalMs: AppConfig.syncInterval });
})();
