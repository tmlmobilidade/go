/* * */

import { processValidation } from '@/tasks/process-validation.js';
import { SYSTEM_CONTACT_EMAIL } from '@tmlmobilidade/consts';
import { Dates } from '@tmlmobilidade/dates';
import { sendSystemErrorEmail } from '@tmlmobilidade/emails';
import { gtfsValidations } from '@tmlmobilidade/interfaces';
import { Logger } from '@tmlmobilidade/logger';
import { initSentryNode } from '@tmlmobilidade/logger/sentry/node';
import { Timer } from '@tmlmobilidade/timer';
import { GtfsValidation } from '@tmlmobilidade/types';
import { runOnInterval } from '@tmlmobilidade/utils';
import pjson from 'pjson' with { type: 'json' };

/* * */

async function main() {
	//

	// Initialize Sentry

	try {
		await initSentryNode();
		Logger.logsNode({ app: 'validator', message: 'Sentry Plans Validator initialized', module: 'plans', severity: 'info' });
	} catch (error) {
		Logger.error('Error initializing Sentry Plans Validator', error);
	}

	//
	// Initialize the logger

	Logger.init();

	const globalTimer = new Timer();

	try {
		//

		//
		// Fetch waiting and processing validations from the database,
		// sorted ascending by creation date (oldest first).
		// Status "processing" is included to catch any validations
		// that may be stuck due to previous crashes or errors.

		const waitingOrStuckGtfsValidations = await gtfsValidations.findMany(
			{ processing_status: { $in: ['waiting', 'processing'] } },
			{ sort: { created_at: 1 } },
		);

		if (!waitingOrStuckGtfsValidations.length) {
			Logger.info('No waiting validations to process. Exiting...');
			return;
		}

		Logger.info(`Found ${waitingOrStuckGtfsValidations.length} waiting or stuck validations...`);

		//
		// Process each waiting validation

		for (const gtfsValidationItem of waitingOrStuckGtfsValidations) {
			const gtfsValidation = gtfsValidationItem as unknown as GtfsValidation;
			Logger.title(`Processing GTFS Validation ${gtfsValidation._id} for File ${gtfsValidation.file_id}`);
			await processValidation(gtfsValidation);
			Logger.info(`Finished processing validation ${gtfsValidation._id} in ${globalTimer.get()}ms`);
		}

		//
	} catch (error) {
		// Log any unexpected errors that occur during the validation loop
		// and send a system error email to the administrators.
		Logger.error('Error processing validations:', error);
		await sendSystemErrorEmail({
			data: {
				errorMessage: error.message ?? 'Unknown error',
				serviceName: pjson.name,
				timestamp: Dates.now('Europe/Lisbon').unix_timestamp,
			},
			to: SYSTEM_CONTACT_EMAIL,
		});
	}

	Logger.terminate(`Validation completed in ${globalTimer.get()}`);
};

/* * */

await runOnInterval(main, { intervalMs: '1s' });
