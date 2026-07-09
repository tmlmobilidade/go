/* * */

import { processPcgiTransactionEntity } from '@/task.js';
import { pcgiTransactionEntities } from '@tmlmobilidade/databases';
import { initSentry, Logger } from '@tmlmobilidade/logger-backend';

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

	const pcgiTransactionEntitiesCollection = await pcgiTransactionEntities.getCollection();
	const pcgiTransactionEntitiesChangeStream = pcgiTransactionEntitiesCollection.watch();
	pcgiTransactionEntitiesChangeStream.on('change', processPcgiTransactionEntity);

	//
})();
