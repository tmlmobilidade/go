/* * */

import { processPcgiTransactionEntity } from '@/task.js';
import { pcgiFileManager } from '@tmlmobilidade/go-interfaces-pcgi-file-manager';
import { initSentryNode, Logger } from '@tmlmobilidade/logger';

/* * */

(async function init() {
	//

	//
	// Initialize Sentry

	try {
		await initSentryNode();
		Logger.startNodeLogs({ app: 'pcgi-stream', message: 'Sentry APEX PCGI Stream initialized', module: 'apex', severity: 'info' });
	} catch (error) {
		Logger.error({ error, message: 'Error initializing Sentry APEX PCGI Stream' });
	}

	//
	// Watch for changes to the PCGI File Manager Transaction Entity
	// collection and process the documents immediately.

	const pcgiTransactionEntitiesCollection = await pcgiFileManager.locationManagement.locationEntity.getCollection();
	const pcgiTransactionEntitiesChangeStream = pcgiTransactionEntitiesCollection.watch();
	pcgiTransactionEntitiesChangeStream.on('change', processPcgiTransactionEntity);

	//
})();
