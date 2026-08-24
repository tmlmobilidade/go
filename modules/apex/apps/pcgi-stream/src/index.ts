/* * */

import { processPcgiTransactionEntity } from '@/task.js';
import { pcgiFileManager } from '@tmlmobilidade/go-interfaces-pcgi-file-manager';
import { initSentry, Logger } from '@tmlmobilidade/logger-logger-backend';

/* * */

(async function init() {
	//

	//
	// Initialize Sentry

	try {
		await initSentry();
	} catch (error) {
		Logger.error({ error, message: 'Error initializing Sentry APEX PCGI Stream' });
	}

	//
	// Watch for changes to the PCGI File Manager Transaction Entity
	// collection and process the documents immediately.

	const pcgiTransactionEntitiesCollection = await pcgiFileManager.fileManagement.transactionEntity.getCollection();
	const pcgiTransactionEntitiesChangeStream = pcgiTransactionEntitiesCollection.watch();
	pcgiTransactionEntitiesChangeStream.on('change', processPcgiTransactionEntity);

	//
})();
