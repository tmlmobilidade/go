/* * */

import { deleteOldFileExports } from '@/tasks/delete-old-exports.js';
import { markStuckProcessingExportsAsError } from '@/tasks/mark-stuck-as-error.js';
import { Logger } from '@tmlmobilidade/logger';
import { initSentryNode } from '@tmlmobilidade/logger/sentry/node';
import { Timer } from '@tmlmobilidade/timer';
import { runOnInterval } from '@tmlmobilidade/utils';

/* * */

async function main() {
	//

	//
	// Initialize Sentry
	try {
		await initSentryNode();
		Logger.info('');
		Logger.logsNode({ app: 'cleaner', message: 'Sentry Exporter Cleaner initialized', module: 'exporter', severity: 'info' });
	} catch (error) {
		Logger.error('Error initializing Sentry Exporter Cleaner');
		throw error;
	}

	Logger.init();
	const globalTimer = new Timer();

	await markStuckProcessingExportsAsError();
	await deleteOldFileExports();

	Logger.terminate(`Cleanup completed in ${globalTimer.get()}`);
}

/* * */

await runOnInterval(main, { intervalMs: '5m' });
