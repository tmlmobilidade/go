/* * */

import { processPcgiTransactionEntity } from '@/task.js';
import { pcgiFileManager } from '@tmlmobilidade/go-interfaces-pcgi-file-manager';

/* * */

(async function init() {
	//

	//
	// Watch for changes to the PCGI File Manager Transaction Entity
	// collection and process the documents immediately.

	const pcgiTransactionEntitiesCollection = await pcgiFileManager.fileManagement.transactionEntity.getCollection();
	const pcgiTransactionEntitiesChangeStream = pcgiTransactionEntitiesCollection.watch();
	pcgiTransactionEntitiesChangeStream.on('change', processPcgiTransactionEntity);

	//
})();
