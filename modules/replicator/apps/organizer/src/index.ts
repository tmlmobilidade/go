/* * */

import { categorizeValidations } from '@/tasks/categorize-validations.js';
import { linkRefundsToSalesToValidations } from '@/tasks/link-refunds.js';
import { linkSalesToValidations } from '@/tasks/link-sales.js';
import { Logger } from '@tmlmobilidade/logger';
import { initSentryNode } from '@tmlmobilidade/logger/sentry/node';
import { runOnInterval } from '@tmlmobilidade/utils';

/* * */

async function main() {
	//

	//
	// Initialize Sentry

	try {
		await initSentryNode();
		Logger.logsNode({ app: 'organizer', message: 'Sentry Replicator Organizer initialized', module: 'replicator', severity: 'info' });
	} catch (error) {
		Logger.error('Error initializing Sentry Replicator Organizer', error);
	}

	//
	// Run all tasks sequentially

	await linkRefundsToSalesToValidations();
	await linkSalesToValidations();
	await categorizeValidations();
}

/* * */

await runOnInterval(main, { intervalMs: '1m' });
