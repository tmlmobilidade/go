/* * */

import { processPcgiTransactionEntity } from '@/task.js';
import { pcgiTransactionEntities } from '@tmlmobilidade/databases';

/* * */

(async function init() {
	//

	//
	// Watch for changes to the PCGI File Manager Transaction Entity
	// collection and process the documents immediately.

	const pcgiTransactionEntitiesCollection = await pcgiTransactionEntities.getCollection();
	const pcgiTransactionEntitiesChangeStream = pcgiTransactionEntitiesCollection.watch();
	pcgiTransactionEntitiesChangeStream.on('change', processPcgiTransactionEntity);

	//
})();
