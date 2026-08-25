/* * */

import { loadEta } from '@tmlmobilidade/go-eta-pckg-loader';
import { runOnInterval } from '@tmlmobilidade/go-utils-exec';
import { initSentryNode, Logger } from '@tmlmobilidade/logger';

import { AppConfig } from './config.js';

/* * */
//
// Initialize Sentry

try {
	await initSentryNode();
	Logger.startNodeLogs({ app: 'loader', message: 'Sentry ETA Loader initialized', module: 'eta', severity: 'info' });
} catch (error) {
	Logger.error({ error, message: 'Error initializing Sentry ETA Loader' });
}

await runOnInterval(() => loadEta(AppConfig), { intervalMs: AppConfig.syncInterval });
