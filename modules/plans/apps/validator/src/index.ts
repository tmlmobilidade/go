/* * */

import { processValidation } from '@/tasks/process-validation.js';
import { gtfsValidations } from '@tmlmobilidade/interfaces';
import { Logger } from '@tmlmobilidade/logger';
import { Timer } from '@tmlmobilidade/timer';

/* * */

await (async function init() {
	const runOnInterval = async () => {
		//

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
				{ feeder_status: { $in: ['waiting', 'processing'] } },
				{ sort: { created_at: 1 } },
			);

			if (!waitingOrStuckGtfsValidations.length) {
				Logger.info('No waiting validations to process. Exiting...');
				return;
			}

			Logger.info(`Found ${waitingOrStuckGtfsValidations.length} waiting or stuck validations...`);

			//
			// Process each waiting validation

			for (const gtfsValidation of waitingOrStuckGtfsValidations) {
				Logger.title(`Processing GTFS Validation ${gtfsValidation._id} for File ${gtfsValidation.file_id}`);
				await processValidation(gtfsValidation);
				Logger.info(`Finished processing validation ${gtfsValidation._id} in ${globalTimer.get()}ms`);
			}

			//
		} catch (error) {
			Logger.error('Error processing validations:', error);
		}

		Logger.terminate(`Validation completed in ${globalTimer.get()}`);

		setTimeout(void runOnInterval, 10_000);
	};
	await runOnInterval();
})();

/* * */
