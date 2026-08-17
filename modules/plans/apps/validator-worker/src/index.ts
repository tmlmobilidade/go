/* * */

import { PROCESSING_STALE_AFTER_MS } from '@/consts/timeout.js';
import { processValidation } from '@/tasks/process-validation.js';
// import { SYSTEM_CONTACT_EMAIL } from '@tmlmobilidade/consts';
import { Dates } from '@tmlmobilidade/dates';
// import { sendSystemErrorEmail } from '@tmlmobilidade/emails';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { Logger } from '@tmlmobilidade/logger';
import { Timer } from '@tmlmobilidade/timer';
import { type UnixTimestamp } from '@tmlmobilidade/types';
import { runOnInterval } from '@tmlmobilidade/utils';
// import pjson from 'pjson' with { type: 'json' };

/* * */

async function main() {
	//

	// // Initialize Sentry

	// try {
	// 	await initSentryNode();
	// 	Logger.startNodeLogs({ app: 'validator', message: 'Sentry Plans Validator initialized', module: 'plans', severity: 'info' });
	// } catch (error) {
	// 	Logger.error({ error, message: 'Error initializing Sentry Plans Validator' });
	// }

	//
	// Initialize the logger

	Logger.init();

	const globalTimer = new Timer();

	try {
		//

		const staleProcessingCutoff = (Dates.now('utc').unix_timestamp - PROCESSING_STALE_AFTER_MS) as UnixTimestamp;

		//
		// Fetch waiting validations and processing validations that have
		// remained unchanged beyond the validator timeout. Active processing
		// validations must not be picked up by another worker.

		const waitingOrStuckGtfsValidations = await goDb.operation.gtfsValidations.findMany(
			{
				$or: [
					{ processing_status: 'processing', updated_at: { $lte: staleProcessingCutoff } },
					{ processing_status: 'waiting' },
				],
			},
			{ sort: { created_at: 1 } },
		);

		if (!waitingOrStuckGtfsValidations.length) {
			Logger.info({ message: 'No waiting validations to process. Exiting...' });
			return;
		}

		Logger.info({ message: `Found ${waitingOrStuckGtfsValidations.length} waiting or stuck validations...` });

		//
		// Process each waiting validation

		for (const gtfsValidationData of waitingOrStuckGtfsValidations) {
			Logger.title(`Processing GTFS Validation ${gtfsValidationData._id} for File ${gtfsValidationData.file_id}`);
			await processValidation(gtfsValidationData);
			Logger.info({ message: `Finished processing validation ${gtfsValidationData._id} in ${globalTimer.get()}ms` });
		}

		//
	} catch (error) {
		// Log any unexpected errors that occur during the validation loop
		// and send a system error email to the administrators.
		Logger.error({ error, message: 'Error processing validations:' });
		// await sendSystemErrorEmail({
		// 	data: {
		// 		errorMessage: error.message ?? 'Unknown error',
		// 		serviceName: pjson.name,
		// 		timestamp: Dates.now('Europe/Lisbon').unix_timestamp,
		// 	},
		// 	to: SYSTEM_CONTACT_EMAIL,
		// });
	}

	Logger.terminate(`Validation completed in ${globalTimer.get()}`);
};

/* * */

await runOnInterval(main, { intervalMs: '1s' });
