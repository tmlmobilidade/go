/* * */

import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { Logger } from '@tmlmobilidade/logger';
import { Timer } from '@tmlmobilidade/timer';
import { runOnInterval } from '@tmlmobilidade/utils';

import { processValidation } from './tasks/process-validation.js';

/* * */

/**
 * Polls the validation queue and processes the oldest records first.
 */
async function main() {
	Logger.init();

	const globalTimer = new Timer();

	try {
		// Include processing records so work left behind by an interrupted worker
		// can be considered again alongside new waiting records.
		const waitingOrProcessingGtfsValidations = await goDb.operation.gtfsValidations.findMany(
			{
				$or: [
					{ processing_status: 'processing' },
					{ processing_status: 'waiting' },
				],
			},
			{ sort: { created_at: 1 } },
		);

		if (!waitingOrProcessingGtfsValidations.length) {
			Logger.info({ message: 'No waiting validations to process. Exiting...' });
			return;
		}

		Logger.info({ message: `Found ${waitingOrProcessingGtfsValidations.length} waiting or processing validations...` });

		// Process sequentially so a worker runs at most one CPU-intensive Go
		// validator process at a time.
		for (const gtfsValidationData of waitingOrProcessingGtfsValidations) {
			Logger.title(`Processing GTFS Validation ${gtfsValidationData._id} for File ${gtfsValidationData.file_id}`);
			await processValidation(gtfsValidationData);
			Logger.info({ message: `Finished processing validation ${gtfsValidationData._id} in ${globalTimer.get()}ms` });
		}
	} catch (error) {
		Logger.error({ error, message: 'Error processing validations:' });
	}

	Logger.terminate(`Validation completed in ${globalTimer.get()}`);
}

/* * */

// runOnInterval waits for main to settle before scheduling the next poll, which
// prevents overlapping batches inside this worker process.
await runOnInterval(main, { intervalMs: '1s' });
