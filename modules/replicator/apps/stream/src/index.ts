/* * */

import { processApexLocation } from '@/tasks/process-apex-location.js';
import { processApexOnBoardRefund } from '@/tasks/process-apex-on-board-refund.js';
import { processApexOnBoardSale } from '@/tasks/process-apex-on-board-sale.js';
import { processApexValidation } from '@/tasks/process-apex-validation.js';
import { processVehicleEvent } from '@/tasks/process-vehicle-event.js';
import { pcgidbLegacy, pcgidbTicketing, pcgidbValidations } from '@tmlmobilidade/interfaces';
import { Logger } from '@tmlmobilidade/logger';
import { initSentryNode } from '@tmlmobilidade/logger';

/* * */

await (async function init() {
	//

	//
	// Initialize Sentry

	try {
		await initSentryNode();
		Logger.startNodeLogs({ app: 'stream', message: 'Sentry Replicator Stream initialized', module: 'replicator', severity: 'info' });
	} catch (error) {
		Logger.error('Error initializing Sentry Replicator Stream', error);
	}

	//
	// Connect to PCGI

	await pcgidbLegacy.connect();
	await pcgidbTicketing.connect();
	await pcgidbValidations.connect();

	//
	// Watch for changes to the MongoDB collections
	// and integrate those documents immediately.

	pcgidbLegacy.VehicleEventsCore.watch().on('change', processVehicleEvent);

	pcgidbTicketing.SalesEntity.watch().on('change', processApexOnBoardRefund);
	pcgidbTicketing.SalesEntity.watch().on('change', processApexOnBoardSale);

	pcgidbValidations.LocationEntity.watch().on('change', processApexLocation);
	pcgidbValidations.ValidationEntity.watch().on('change', processApexValidation);

	//
})();
