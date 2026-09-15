/* * */

import { type ExtractionsCoordinatorResponse } from '@tmlmobilidade/go-core-pckg-types';
import { getExtractionsCoordinatorUrl } from '@tmlmobilidade/go-core-pckg-utils';
import { runOnInterval } from '@tmlmobilidade/go-utils-exec';
import { initSentryNode, Logger } from '@tmlmobilidade/logger';
import { Timer } from '@tmlmobilidade/timer';

import { processExtraction } from './tasks/process-extraction.js';

/* * */

//
// Initialize Sentry

try {
	await initSentryNode();
	Logger.startNodeLogs({ app: 'extractions-worker', message: 'Sentry Extractions Worker initialized', module: 'core', severity: 'info' });
} catch (error) {
	Logger.error({ error, message: 'Error initializing Sentry Extractions Worker' });
}

async function main() {
	//

	Logger.init();

	const globalTimer = new Timer();

	//
	// Ask the coordinator for a new Extraction ID to process

	const fetchCoordinatorTimer = new Timer();

	const extractionId = await fetch(getExtractionsCoordinatorUrl('extractions'))
		.then(response => response.json())
		.then(data => data as ExtractionsCoordinatorResponse)
		.then(data => data.extraction_id);

	if (!extractionId) {
		Logger.info({ message: `No extraction to process. Skipping run. (fetch: ${fetchCoordinatorTimer.get()})` });
		return;
	}

	Logger.info({ message: `Received extraction ID from coordinator: ${extractionId} (fetch: ${fetchCoordinatorTimer.get()})` });

	//
	// Process the extraction

	await processExtraction(extractionId);

	Logger.terminate(`Run took ${globalTimer.get()}`);

	//
}

/* * */

await runOnInterval(main, { intervalMs: '10s' });
